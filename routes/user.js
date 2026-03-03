const express = require('express');
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const ExpressError = require("../utils/ExpresError.js");
const { saveRedirectUrl } = require("../middleware.js");

router.get("/signup", (req, res) => {
    res.render("users/signup");
});

router.post("/signup", saveRedirectUrl, wrapAsync(async (req, res, next) => {
    try{
        let { username, email, password } = req.body; 
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        console.log(registeredUser);
        req.login(registeredUser, err => {
            if(err) return next(err);
            req.flash("success", "Welcome to WanderLust!");
            let redirectUrl = res.locals.redirectUrl || "/listings";
            res.redirect(redirectUrl);
        });
    } catch(e){
        req.flash("error", e.message);
        res.redirect("/signup");
    }
}));

router.get("/login", (req, res) => {
    res.render("users/login");
});

router.post("/login", saveRedirectUrl, passport.authenticate("local", { failureFlash: true, failureRedirect: "/login" }), async(req, res) => {
    req.flash("success", "Welcome back!");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
});

router.get("/logout", (req, res) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        req.flash("success", "Logged out successfully!");
        res.redirect("/listings");
    }
    );
});

module.exports = router;