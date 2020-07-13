const User = require('../models/user');
const jwt = require('jsonwebtoken'); // to generate signed token
const expressJwt = require('express-jwt'); // for authorisation check
const { errorHandler } = require('../helpers/dberrorhandler');
const { cookie } = require('express-validator/check');

exports.signup = (req, res) => {
    console.log("req.body", req.body);
    const user = new User(req.body);
    user.save((err, user) => {
        if(err) {
            return res.status(400).json({ err: errorHandler(err) });
        }
        user.salt = undefined;
        user.hashed_password = undefined;
        res.json({user});
    });
};

exports.signin = (req, res) => {
    const { email, password } = req.body;
    User.findOne({email}, (err, user) => {
        if(err || !user) {
            return res.status(400).json(
                {
                    error: "User with this Email does not exist !!!"
                }
            );
        }
        // if user is found we have to match the password
        // created a authentication model in ../models/user
        if(!user.authenticate(password)) {
            return res.status(401).json(
                {
                    error: "Email and password doesn't match"
                }
            );
        }
        //generate a signed user token with user id and secret
        const token = jwt.sign({ _id: user._id}, process.env.jwt_secret);

        // persist the token as 't' in the cookie with expiry date
        res.cookie('t', token, {expire: new Date() + 9999});

        //return response with user and token to frontend
        const { _id, name, email, role } =user;
        return res.json({ token, user: { _id, name, email, role}});
    })
}

exports.signout = (req, res) => {
    res.clearCookie('t');
    res.json({ message: "Signout Successfull !!!"});
};

exports.requireSignin = expressJwt({
    secret: process.env.jwt_secret,
    userProperty: "auth"
});

exports.isAuth = (req, res, next) => {
    let user = req.profile && req.auth && req.profile._id == req.auth._id;
    if(!user) {
        return res.status(403).json(
            {error: "Access Denied !!!"}
        );
    }
    next();
};

exports.isAdmin = (req, res, next) => {
    if(req.profile.role === 0) {
        return res.status(403).json({
            error: "Admin resource, Access Denied !!!"
        });
    }
    next();
};
