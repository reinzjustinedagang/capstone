const Connection = require("../db/Connection");
const { logAudit } = require("./auditService");
const fs = require("fs/promises");
const path = require("path");
const cloudinary = require("../utils/cloudinary");

const extractCloudinaryPublicId = (url) => {
  if (!url.includes("res.cloudinary.com")) return null;
  const parts = url.split("/");
  const filename = parts.pop().split(".")[0];
  const folder = parts.pop();
  return `${folder}/${filename}`;
};

// GET all events
exports.getAll = async () => {
  const query = `
    SELECT * FROM events
    ORDER BY date DESC
  `;
  return await Connection(query);
};

// CREATE event
exports.create = async (data, user, ip) => {
  const { title, description, date, image_url } = data;

  const query = `
    INSERT INTO events (title, description, date, image_url)
    VALUES (?, ?, ?, ?)
  `;
  const result = await Connection(query, [title, description, date, image_url]);

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

// UPDATE event
exports.update = async (id, data, user, ip) => {
  const { title, description, date, image_url } = data;

  const query = `
    UPDATE events
    SET title = ?, description = ?, date = ?, image_url = ?
    WHERE id = ?
  `;
  const result = await Connection(query, [
    title,
    description,
    date,
    image_url,
    id,
  ]);

  if (result.affectedRows > 0) {
    await logAudit(
      user.id,
      user.email,
      user.role,
      "UPDATE",
      `Updated event ID ${id}: '${title}'`,
      ip
    );
  }

  return result.affectedRows > 0;
};

// DELETE event
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

  // Delete image from Cloudinary or local
  if (event.image_url) {
    const publicId = extractCloudinaryPublicId(event.image_url);
    if (publicId) {
      try {
        await cloudinary.uploader.destroy(publicId);
        console.log(`Deleted Cloudinary image: ${publicId}`);
      } catch (err) {
        console.error("Failed to delete Cloudinary image:", err);
      }
    } else {
      // Local file fallback
      const imagePath = path.join(__dirname, "../uploads", event.image_url);
      try {
        await fs.unlink(imagePath);
        console.log(`Deleted local image: ${imagePath}`);
      } catch (err) {
        console.error(`Failed to delete local image ${imagePath}:`, err);
      }
    }
  }

  return result.affectedRows > 0;
};

//GET Count
exports.getEventsCount = async () => {
  const [result] = await Connection("SELECT COUNT(*) AS count FROM events");
  return result.count;
};
