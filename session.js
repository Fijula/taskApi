const session = {};

session.createSession = (req, userId) => {
    if (userId) {
      req.session.userId = userId;
      req.session.createdAt = Date.now();
    }
  };
  

session.destroySession = (req,userId) => {
req.session.destroy();
};

// check for the validity and passes control to next middleware routes
session.checkSession = (req, res, next) => {
    if (!req.session.userId || (Date.now() - req.session.createdAt) > 30000) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Session'
      });
    }
  
    next(); 
  };
  

module.exports = session;