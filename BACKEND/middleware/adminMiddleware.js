const adminMiddleware = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, message: "Access denied. Admins only." });
  }
  next();
};

export default adminMiddleware;
