// ================= ROLE AUTHORIZATION MIDDLEWARE =================

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      // 🔐 Must be authenticated first
      if (!req.user) {
        return res.status(401).json({
          message: "Not authenticated",
        });
      }

      // 🔒 Role check
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          message: "You are not authorized to access this resource",
        });
      }

      next();

    } catch (error) {
      return res.status(500).json({
        message: "Role authorization failed",
      });
    }
  };
};
