// backend/cron/statusJob.js
const Connection = require("../db/Connection");

const markInactive = async () => {
  try {
    const result = await Connection(
      "UPDATE users SET status = 'inactive' WHERE last_seen < NOW() - INTERVAL 5 MINUTE"
    );
    if (result.affectedRows > 0) {
      console.log(`🔄 Marked ${result.affectedRows} users inactive`);
    }
  } catch (err) {
    console.error("Error marking inactive:", err);
  }
};

// run every 1 minute
setInterval(markInactive, 60 * 1000);

// no need to export anything
