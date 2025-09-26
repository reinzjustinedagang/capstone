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

exports.createTemplate = async (
  name,
  category = "Template",
  message,
  user,
  ip
) => {
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
      `Created SMS template : ${name}.`,
      ip
    );
  }

  return result;
};

exports.updateTemplate = async (
  id,
  name,
  category = "Template",
  message,
  user,
  ip
) => {
  const [oldData] = await Connection(
    "SELECT name, category, message FROM sms_templates WHERE id = ?",
    [id]
  );

  const result = await Connection(
    "UPDATE sms_templates SET name = ?, category = ?, message = ? WHERE id = ?",
    [name, category, message, id]
  );

  if (result.affectedRows === 1 && user) {
    await logAudit(
      user.id,
      user.email,
      user.role,
      "UPDATE",
      `Updated template ${name}`,
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
