const Connection = require("../db/Connection");
const { logAudit } = require("./auditService");
const {
  extractCloudinaryPublicId,
  safeCloudinaryDestroy,
  deleteLocalImage,
} = require("../utils/serviceHelpers");

exports.getEventCount = async (user) => {
  if (user && user.role === "admin") {
    const [result] = await Connection(
      "SELECT COUNT(*) AS count FROM events WHERE type = 'event' AND approved = 1"
    );
    return result.count;
  } else if (user) {
    const [result] = await Connection(
      "SELECT COUNT(*) AS count FROM events WHERE type = 'event' AND approved = 1 AND created_by = ?",
      [user.id]
    );
    return result.count;
  } else {
    // no session user
    return 0;
  }
};

// GET all events
exports.getEvent = async (user) => {
  if (user && user.role === "admin") {
    return await Connection(`
      SELECT * FROM events WHERE type = 'event'
      ORDER BY date DESC
    `);
  } else {
    return await Connection(
      `
      SELECT * FROM events WHERE type = 'event' AND created_by = ?
      ORDER BY date DESC
    `,
      [user.id]
    );
  }
};

exports.getPublicEvents = async () => {
  return await Connection(`
    SELECT * 
    FROM events
    WHERE type = 'event' AND approved = 1
    ORDER BY date DESC
  `);
};

exports.getSlideshow = async () => {
  const query = `
    SELECT * FROM events WHERE type = 'slideshow'
    ORDER BY date DESC
  `;
  return await Connection(query);
};

// GET last 5 events
exports.getFive = async () => {
  const query = `
    SELECT * 
    FROM events WHERE type = 'event' AND approved = 1
    ORDER BY date DESC
    LIMIT 5
  `;
  return await Connection(query);
};

// eventService.js
exports.getPublicById = async (id) => {
  const query = `
    SELECT * 
    FROM events 
    WHERE id = ? AND type = 'event' AND approved = 1
  `;
  const rows = await Connection(query, [id]);
  return rows[0] || null;
};

exports.getById = async (id, user) => {
  let query, params;

  if (user && user.role === "admin") {
    query = "SELECT * FROM events WHERE id = ?";
    params = [id];
  } else {
    query = "SELECT * FROM events WHERE id = ? AND created_by = ?";
    params = [id, user.id];
  }

  const rows = await Connection(query, params);
  return rows[0] || null;
};

exports.create = async (data, user, ip) => {
  let { title, type, description, date, image_url } = data;

  if (!type) throw new Error("Event type is required.");

  if (type === "slideshow") {
    if (!title || title.trim() === "") title = "Slideshow";
    if (!description || description.trim() === "") description = "Slideshow";
    if (!date || date.trim() === "") date = "2025-05-31";
    // if (!image_url) throw new Error("Image is required for slideshow.");
  } else {
    if (!title || !description || !date) {
      throw new Error("All fields including image are required for an event.");
    }
  }

  // auto-approve if admin
  const approved = user.role === "admin" ? 1 : 0;

  const query = `
    INSERT INTO events (title, type, description, date, image_url, created_by, approved)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  const result = await Connection(query, [
    title,
    type,
    description || null,
    date || null,
    image_url,
    user.id,
    approved,
  ]);

  await logAudit(
    user.id,
    user.email,
    user.role,
    "CREATE",
    `Added new event: '${title}' (Approved: ${
      approved === 1 ? "true" : "false"
    })`,
    ip
  );

  return result;
};

// UPDATE event
exports.update = async (id, data, user, ip) => {
  let { title, type, description, date, image_url } = data;

  // Auto-approval logic
  let approved = user.role === "admin" ? 1 : 0;
  let approvedBy = user.role === "admin" ? user.id : null;
  let approvedAt = user.role === "admin" ? new Date() : null;

  // Fetch current event
  const currentEvent = await exports.getById(id, user);

  if (!currentEvent) throw new Error("Event not found");

  // Restrict staff from editing other people’s events
  if (user.role !== "admin" && currentEvent.created_by !== user.id) {
    throw new Error("Permission denied: You can only edit your own events.");
  }

  // Validation
  if (!type) throw new Error("Event type is required");
  if (type === "slideshow" && !image_url) {
    throw new Error("Image is required for slideshow");
  }
  if (type !== "slideshow" && (!title || !description || !date)) {
    throw new Error("All fields including image are required for an event");
  }

  // Handle image replacement
  if (
    image_url &&
    currentEvent.image_url &&
    currentEvent.image_url !== image_url
  ) {
    const publicId = extractCloudinaryPublicId(currentEvent.image_url);
    if (publicId) await safeCloudinaryDestroy(publicId);
    else await deleteLocalImage(currentEvent.image_url);
  }

  // Update query
  const query = `
    UPDATE events
    SET title = ?, type = ?, description = ?, date = ?, image_url = ?,
        approved = ?, approved_by = ?, approved_at = ?
    WHERE id = ?
  `;
  const result = await Connection(query, [
    title,
    type,
    description,
    date,
    image_url,
    approved,
    approvedBy,
    approvedAt,
    id,
  ]);

  if (result.affectedRows > 0) {
    await logAudit(
      user.id,
      user.email,
      user.role,
      "UPDATE",
      `Update event: '${title}' (Approved: ${
        approved === 1 ? "true" : "false"
      })`,
      ip
    );
  }

  return result.affectedRows > 0;
};

exports.approve = async (id, user, ip) => {
  const result = await Connection(
    `UPDATE events 
     SET approved = 1, approved_by = ?, approved_at = NOW() 
     WHERE id = ?`,
    [user.id, id]
  );

  const [event] = await Connection(`SELECT title FROM events WHERE id = ?`, [
    id,
  ]);

  if (result.affectedRows > 0) {
    await logAudit(
      user.id,
      user.email,
      user.role,
      "APPROVE",
      `Approved event: ${event.title}`,
      ip
    );
  }

  return result.affectedRows > 0;
};

// DELETE event
exports.remove = async (id, user, ip) => {
  // Fetch event
  const events = await Connection(
    `SELECT id, title, image_url, created_by FROM events WHERE id = ?`,
    [id]
  );
  const event = events[0];
  if (!event) return false;

  // Restrict staff from deleting other people’s events
  if (user.role !== "admin" && event.created_by !== user.id) {
    throw new Error("Permission denied: You can only delete your own events.");
  }

  // Delete event
  const result = await Connection(`DELETE FROM events WHERE id = ?`, [id]);

  if (result.affectedRows > 0) {
    await logAudit(
      user.id,
      user.email,
      user.role,
      "DELETE",
      `Deleted event: '${event.title}'`,
      ip
    );
  }

  // Delete image
  if (event.image_url) {
    const publicId = extractCloudinaryPublicId(event.image_url);
    if (publicId) {
      try {
        await safeCloudinaryDestroy(publicId);
      } catch (err) {
        console.error("Failed to delete Cloudinary image after retries:", err);
      }
    } else {
      await deleteLocalImage(event.image_url);
    }
  }

  return result.affectedRows > 0;
};
