//import express module
var express = require("express");
//create an express app
var app = express();
//require express middleware body-parser
var bodyParser = require("body-parser");
//require express session
var session = require("express-session");
var cookieParser = require("cookie-parser");
var flash = require("connect-flash");

//set the view engine to ejs
app.set("view engine", "ejs");
//set the directory of views
app.set("views", "./views");
//specify the path of static directory
app.use(express.static(__dirname + "/public"));

//use body parser to parse JSON and urlencoded request bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//use cookie parser to parse request headers
app.use(cookieParser());
//use session to store user data between HTTP requests
app.use(
  session({
    secret: "cmpe_273_secure_string",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 },
  })
);
app.use(flash());
//Only user allowed is admin
var Users = [
  {
    username: "admin",
    password: "admin",
  },
];
//By Default we have 3 books
var books = [
  { BookID: "1", Title: "Book 1", Author: "Author 1" },
  { BookID: "2", Title: "Book 2", Author: "Author 2" },
  { BookID: "3", Title: "Book 3", Author: "Author 3" },
];
//route to root
app.get("/", function (req, res) {
  //check if user session exits
  if (req.session.user) {
    res.redirect("/home");
  } else res.render("login", {
      error: req.query.error
  });
});

app.post("/login", function (req, res) {
  if (req.session.user) {
    res.render("/home");
  } else {
    console.log("Req Body : ", req.body);
    Users.filter((user) => {
      if (
        user.username === req.body.username &&
        user.password === req.body.password
      ) {
        req.session.user = user;
        res.redirect("/home");
      }else {
          res.redirect("/?error=User Credentials Invalid");
      }
    });
  }
 
});

app.get("/home", function (req, res) {
  if (!req.session.user) {
    res.redirect("/");
  } else {
    res.render("home", {
      books: books,
      errorMessage: req.flash("errorMessage"),
    });
  }
});

app.get("/create", function (req, res) {
  if (!req.session.user) {
    res.redirect("/");
  } else {
    res.render("create", {
      books: books,
      errorMessage: req.flash("errorMessage"),
    });
  }
});

app.post("/create", function (req, res) {
  // add your code
  console.log(req.body);
  const found = books.some((book) => book.BookID === req.body.book_id);
  if (found) {
    req.flash("errorMessage", "ID already exists!");
    res.redirect("/home");
  } else if (isNaN(req.body.book_id)) {
    req.flash("errorMessage", "ID is not a number!");
    res.redirect("/home");
  } 
  else {
    const newBook = {
      BookID: String(req.body.book_id),
      Title: req.body.book_title,
      Author: req.body.book_author,
    };

    if (!newBook.BookID || !newBook.Title || !newBook.Author) {
      req.flash("errorMessage", "Please enter all the details!");
      res.redirect("/home");
    }

    books.push(newBook);
    res.redirect("/home");
  }
});

app.get("/delete", function (req, res) {
  console.log("Session Data : ", req.session.user);
  if (!req.session.user) {
    res.redirect("/");
  } else {
    res.render("delete", {
      books: books,
      errorMessage: req.flash("errorMessage"),
    });
  }
});

app.get("/logout", function (req, res) {
  req.session.destroy();
  res.redirect("/");
});


app.post("/delete", function (req, res) {
  const found = books.some((book) => book.BookID === req.body.book_id);
  if (found) {
    books = books.filter((m) => m.BookID != req.body.book_id);
    res.redirect("/home");
  } else if (isNaN(req.body.book_id)) {
    req.flash("errorMessage", "Id is not a number!");
    res.redirect("/delete");
  } else {
    req.flash("errorMessage", "Id doesn't exists!");
    res.redirect("/home");
  }
});

var server = app.listen(3000, function () {
  console.log("Server listening on port 3000");
});
