const jwt = require("jsonwebtoken");

exports.verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.json({ error: "Access denied" });

  try {
    const decoded = jwt.verify(token, ""+process.env.SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    req.user = "";
    res.json({ error: "Invalid token" });
  }
};

exports.isAdmin = (req, res, next) => {
  var userType = null;
  try{
    if (req.user.role === 1) {
      userType = 1;
    } else if (req.user.role === 0) {
      userType = 0;
    }
  }catch(err){
    if (req.body.user.role === 1) {
      userType = 1;
    } else if (req.body.user.role === 0) {
      userType = 0;
    }
  }
  if (userType === 1) {
    next();
  } else if (userType === 0) {
    res.json({ error: "You are not allowed to make requests here" });
  } else {
    res.json({ error: "Unidentified request" });
  }
};
