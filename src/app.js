require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
const path = require("path");
const app = express();
const hbs = require("hbs");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-Parser");
const auth = require("./userprofile/auth");

//location of config file
require("./db/cont");
const Register = require("./models/register");
const { json } = require("express");
const { log, profile } = require("console");

//connection of database
mongoose.connect("mongodb://localhost:27017/userregister", {
  useNewUrlParser: "true",
});
mongoose.connection.on("error", (err) => {
  console.log("err", err);
});
mongoose.connection.on("connected", (err, res) => {
  console.log("mongoose is connected");
});
//we are hidding our token key
//console.log(process.env.SECRET_KEY);

const port = process.env.PORT || 3000;

//location of file to function
const static_path = path.join(__dirname, "../public");
const templates_path = path.join(__dirname, "../templates/views");
const partials_path = path.join(__dirname, "../templates/partials");

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

//app.use("/api/users",users);
app.use(express.static(static_path));
app.set("view engine", "hbs");
app.set("views", templates_path);
hbs.registerPartials(partials_path);

//given file location
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/profile", auth, (req, res) => {
  //console.log(`this is the cookies ${req.cookiws.jwt}`);
  res.render("profile");
});
app.get("/contact", (req, res) => {
  res.render("contact");
});
app.get("/dashboard", (req, res) => {
  res.render("dashboard");
});

//logout function
app.get("/logout", auth, async (req, res) => {
  try {
    console.log(req.user);
    //req.user.token = req.user.token.filter((cureeElement) =>{return currElement.token != req.token});
    res.clearCookie("jws");
    console.log("logout successfully");
    ``;
    await req.user.save();
    res.render("login");
  } catch (error) {
    res.status(500).send(error);
  }
  //console.log(`this is the cookies ${req.cookiws.jwt}`);
});

//given permission to process pages we are conneting pages
app.get("/register", (req, res) => {
  res.render("register");
});
app.get("/login", (req, res) => {
  res.render("login");
});
//create a new user in our database register form
app.post("/register", async (req, res) => {
  try {
    const password = req.body.password;
    const confirmpassword = req.body.confirmpassword;

    if (password == confirmpassword) {
      const registeruser = new Register({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        confirmpassword: req.body.confirmpassword,
      });

      // we are creating user cookies
      console.log("the sucess part" + registeruser);

      const token = await registeruser.generateAuthToken();
      console.log("the token part" + token);

      //The res.cookie() function id used to set the cookie:name to value.
      //res.cookie("jwt", tomjken,{
      //expires:new Date(Date.now() + 30000),
      //httpOnly:true
      //});
      //console.log(cookie);

      const registered = await registeruser.save();
      console.log("the page part" + registered);

      res.status(201).render("login"); //in render ucan add index or login
    } else {
      res.send("password are not matching");
    }
  } catch (error) {
    res.status(400).send(error);
    console.log("the error part page ");
  }
});
// login into  our website
app.post("/login", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    //creating data read. it just chacking email&passwored
    const useremail = await Register.findOne({ email: email });

    const isMatch = await bcrypt.compare(password, useremail.password);

    const token = await useremail.generateAuthToken();
    console.log("the token part" + token);
    //geting token
    res.cookie("jwt", token, {
      expires: new Date(Date.now() + 876000), //how meach time u have to hold user on server
      httpOnly: true,
    });
    console.log(req.cookies.jwt);

    if (isMatch) {
      res.status(201).render("profile");
    } else {
      res.send("invalid login detail");
    }
  } catch (error) {
    res.status(400).send("invalid user");
  }
});

//our sever is listen post function

app.listen(port, () => {
  console.log(`Server is working on http://localhost:${port}`);
});
