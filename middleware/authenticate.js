const checkUser = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    } else {
        return res.status(401).json('You do not have access. Please log in first.');
    }
};

module.exports = { checkUser }