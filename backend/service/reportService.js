const Connection = require("../db/Connection");

exports.getBarangayDistribution = async () => {
  const query = `
      SELECT barangay, COUNT(*) AS total
      FROM senior_citizens
      WHERE deleted = 0
      GROUP BY barangay
      ORDER BY total DESC
    `;
  return await Connection(query);
};
