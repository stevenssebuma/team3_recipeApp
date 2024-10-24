const express = require("express")
const router= express.Router()
const passport = require("passport")

router.get("/github/login", passport.authenticate("github", { scope: ["user:email"]}))

router.get("/github/callback",
    passport.authenticate("github", { failureRedirect: "/"}),
    (req, res) => {
        //successful authentication, redirect to recipe page. Could choose to redirect to user or swagger api-docs
        res.redirect("/recipe")
    }
)

router.get("/logout", (req, res) => {
    req.logout((err) => {
        if (err) { return next(err)}
        res.redirect("/")
    })
})

module.exports = router