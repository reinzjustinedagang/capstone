function getUserIp(req, res, next) {
  const forwarded = req.headers["x-forwarded-for"];
  let ip =
    forwarded?.split(",")[0].trim() ||
    req.socket?.remoteAddress ||
    req.connection?.remoteAddress ||
    req.ip;

  // Normalize common localhost IPs
  if (ip === "::1" || ip === "::ffff:127.0.0.1") {
    ip = "127.0.0.1";
  }

  req.userIp = ip || "UNKNOWN"; // Final fallback
  next();
}

module.exports = getUserIp;
