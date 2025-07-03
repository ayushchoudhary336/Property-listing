const express = require("express");
const app = express();
const mongoose = require("mongoose");
const ejs = require("ejs");
const Listing = require("./models/listing.js");
const path = require("path");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const cookieparser = require("cookie-parser");

const session = require("express-session");
const passport = require("passport");
const Localstrategy = require("passport-local");
const user = require("./models/user.js");
const flash = require("connect-flash");
const { isloggedin } = require("./middleware.js");

// Use session before passport
app.use(
  session({
    secret: process.env.SESSION_SECRET || "mysupersecretstring",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(cookieparser());
app.use(passport.initialize());
app.use(passport.session());

passport.use(new Localstrategy(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

app.use(flash());

// Global locals for templates
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user;
  res.locals.currentPath = req.path;
  next();
});

app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));

// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

// DB connection (local or cloud)
async function main() {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://127.0.0.1:27017/wanderlust"
    );
    console.log("Connected to DB");
  } catch (err) {
    console.error("DB connection error:", err);
  }
}
main();

// Routes
app.get("/listings", async (req, res, next) => {
  try {
    const allListings = await Listing.find({});
    res.render("listings/edit.ejs", { allListings });
  } catch (err) {
    next(err);
  }
});

app.get("/demouser", async (req, res) => {
  let fakeUser = new user({
    email: "ayushchoudhary2003@gmail.com",
    username: "delta-student",
  });

  let registereduser = await user.register(fakeUser, "helloworld");
  res.send(registereduser);
});

app.get("/listings/new", isloggedin, (req, res) => {
  res.render("listings/new.ejs");
});

app.get("/listings/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) throw new Error("Listing not found");
    res.render("listings/show.ejs", { listing });
  } catch (err) {
    next(err);
  }
});

app.get("/listings/:id/edit", isloggedin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) throw new Error("Listing not found");
    res.render("listings/editdata.ejs", { listing });
  } catch (err) {
    next(err);
  }
});

app.post("/listings", async (req, res, next) => {
  try {
    const listingData = req.body.Listing;
    if (!listingData.title || !listingData.price || !listingData.image?.url) {
      throw new Error("Missing required fields: title, price, or image URL.");
    }
    const newListing = new Listing(listingData);
    await newListing.save();
    res.redirect("/listings");
  } catch (err) {
    next(err);
  }
});

app.post("/listings/:id/delete", isloggedin, async (req, res, next) => {
  try {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
  } catch (err) {
    next(err);
  }
});

app.put("/listings/:id", isloggedin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedData = req.body.Listing;
    if (!updatedData.title || !updatedData.price || !updatedData.image?.url) {
      throw new Error("Missing required fields: title, price, or image URL.");
    }
    await Listing.findByIdAndUpdate(id, { ...updatedData });
    res.redirect("/listings");
  } catch (err) {
    next(err);
  }
});

// Auth Routes
app.get("/login", (req, res) => {
  res.render("listings/login.ejs");
});

app.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  (req, res) => {
    req.flash("success", "Welcome back!");
    res.redirect("/listings");
  }
);

app.get("/signup", (req, res) => {
  res.render("listings/signup.ejs");
});

app.post("/signup", async (req, res, next) => {
  const { username, email, password } = req.body;

  try {
    const newUser = new user({ username, email });
    const registeredUser = await user.register(newUser, password);

    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success", "Welcome to TravelEase!");
      res.redirect("/listings");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
});

// Misc
app.get("/getcookie", (req, res) => {
  res.cookie("greet", "Namaste");
  res.cookie("madein", "India");
  res.send(" hello bhai kaise ho");
});

app.get("/", (req, res) => {
  console.dir(req.cookies);
  res.send("Server is running");
});

app.post("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/listings");
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res
    .status(500)
    .render("error.ejs", { error: err.message || "Something went wrong" });
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App is listening on port ${PORT}`);
});
