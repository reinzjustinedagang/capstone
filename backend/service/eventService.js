const Connection = require("../db/Connection");
const { logAudit } = require("./auditService");
const {
  extractCloudinaryPublicId,
  safeCloudinaryDestroy,
  deleteLocalImage,
} = require("../utils/cloudinary");

exports.getEventCount = async () => {
  const [result] = await Connection(
    "SELECT COUNT(*) AS count FROM events WHERE type = 'event'"
  );
  return result.count;
};

// GET all events
exports.getEvent = async () => {
  const query = `
    SELECT * FROM events WHERE type = 'event'
    ORDER BY date DESC
  `;
  return await Connection(query);
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
    FROM events WHERE type = 'event'
    ORDER BY date DESC
    LIMIT 5
  `;
  return await Connection(query);
};

exports.create = async (data, user, ip) => {
  let { title, type, description, date, image_url } = data;

  if (!type) {
    throw new Error("Event type is required.");
  }

  if (type === "slideshow") {
    // Assign a default title if empty
    if (!title || title.trim() === "") title = "Slideshow";
    if (!description || description.trim() === "") description = "Slideshow";
    if (!date || date.trim() === "") date = "2025-05-31";
    if (!image_url) {
      throw new Error("Image is required for slideshow.");
    }
  } else {
    if (!title || !description || !date || !image_url) {
      throw new Error("All fields including image are required for an event.");
    }
  }

  const query = `
    INSERT INTO events (title, type, description, date, image_url)
    VALUES (?, ?, ?, ?, ?)
  `;

  const result = await Connection(query, [
    title,
    type,
    description || null,
    date || null,
    image_url,
  ]);

  await logAudit(
    user.id,
    user.email,
    user.role,
    "CREATE",
    `Added event: '${title}'`,
    ip
  );

  return result;
};

exports.update = async (id, data, user, ip) => {
  const { title, type, description, date, image_url } = data;

  // Fetch current event
  const events = await Connection(`SELECT * FROM events WHERE id = ?`, [id]);
  const currentEvent = events[0];
  if (!currentEvent) throw new Error("Event not found");

  // Validation
  if (!type) throw new Error("Event type is required");

  if (type === "slideshow") {
    if (!image_url) throw new Error("Image is required for slideshow");
  } else {
    if (!title || !description || !date || !image_url) {
      throw new Error("All fields including image are required for an event");
    }
  }

  // Handle image replacement
  if (
    image_url &&
    currentEvent.image_url &&
    currentEvent.image_url !== image_url
  ) {
    const publicId = extractCloudinaryPublicId(currentEvent.image_url);
    if (publicId) {
      await safeCloudinaryDestroy(publicId);
    } else {
      await deleteLocalImage(currentEvent.image_url);
    }
  }

  // Update query
  const query = `
    UPDATE events
    SET title = ?, type = ?, description = ?, date = ?, image_url = ?
    WHERE id = ?
  `;

  const result = await Connection(query, [
    title || null,
    type,
    description || null,
    date || null,
    image_url,
    id,
  ]);

  if (result.affectedRows > 0) {
    await logAudit(
      user.id,
      user.email,
      user.role,
      "UPDATE",
      `Updated event ID ${id}: '${title || "Slideshow"}'`,
      ip
    );
  }

  return result.affectedRows > 0;
};

// DELETE event
exports.remove = async (id, user, ip) => {
  // Fetch the event first
  const events = await Connection(
    `SELECT title, image_url FROM events WHERE id = ?`,
    [id]
  );
  const event = events[0];
  if (!event) return false;

  // Delete the event from DB first
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

  // Delete image from Cloudinary or local safely
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
