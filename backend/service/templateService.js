// service/templateService.js
const Connection = require("../db/Connection");
const { logAudit } = require("./auditService");

exports.getAllTemplates = async () => {
  return await Connection(
    "SELECT id, name, category, message FROM sms_templates"
  );
};

exports.getTemplateById = async (id) => {
  const result = await Connection("SELECT * FROM sms_templates WHERE id = ?", [
    id,
  ]);
  return result[0];
};

exports.createTemplate = async (name, category, message, user, ip) => {
  const result = await Connection(
    "INSERT INTO sms_templates (name, category, message) VALUES (?, ?, ?)",
    [name, category, message]
  );

  if (result.affectedRows === 1 && user) {
    await logAudit(
      user.id,
      user.email,
      user.role,
      "CREATE",
      `Created SMS template '${name}' under category '${category}'.`,
      ip
    );
  }

  return result;
};

exports.updateTemplate = async (id, name, category, message, user, ip) => {
  const [oldData] = await Connection(
    "SELECT name, category, message FROM sms_templates WHERE id = ?",
    [id]
  );

  const result = await Connection(
    "UPDATE sms_templates SET name = ?, category = ?, message = ? WHERE id = ?",
    [name, category, message, id]
  );

  if (result.affectedRows === 1 && user) {
    const changes = [];

    if (oldData.name !== name) {
      changes.push(`name: '${oldData.name}' → '${name}'`);
    }
    if (oldData.category !== category) {
      changes.push(`category: '${oldData.category}' → '${category}'`);
    }
    if (oldData.message !== message) {
      changes.push(`message: '[content changed]'`);
    }

    const details = changes.length > 0 ? changes.join(", ") : "No changes.";
    await logAudit(
      user.id,
      user.email,
      user.role,
      "UPDATE",
      `Updated template ${name}: ${details}`,
      ip
    );
  }

  return result;
};

exports.deleteTemplate = async (id, user, ip) => {
  const [template] = await Connection(
    "SELECT name FROM sms_templates WHERE id = ?",
    [id]
  );

  const result = await Connection("DELETE FROM sms_templates WHERE id = ?", [
    id,
  ]);

  if (result.affectedRows === 1 && user) {
    await logAudit(
      user.id,
      user.email,
      user.role,
      "DELETE",
      `Deleted SMS template '${template?.name}'`,
      ip
    );
  }

  return result;
};
