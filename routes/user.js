const express = require('express');
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const ExpressError = require("../utils/ExpresError.js");

router.get("/signup", (req, res) => {
    res.render("users/signup");
});

router.post("/signup", wrapAsync(async (req, res) => {
    try{
        let { username, email, password } = req.body; 
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        console.log(registeredUser);
        req.flash("success", "Welcome to WanderLust!");
        res.redirect("/listings");
    } catch(e){
        req.flash("error", e.message);
        res.redirect("/signup");
    }
}));

router.get("/login", (req, res) => {
    res.render("users/login");
});

router.post("/login", passport.authenticate("local", { failureFlash: true, failureRedirect: "/login" }), async(req, res) => {
    req.flash("success", "Welcome back!");
    res.redirect("/listings");
});

module.exports = router;