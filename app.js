// ! setup npm, etc
const express = require("express");
const app = express();
const port = 3000;
const expressLayouts = require("express-ejs-layouts");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("connect-flash");
// setup ejs
app.set("view engine", "ejs");
// setup express-ejs-layouts
app.use(expressLayouts);
// import fungsi dari file fungsi.js
const fungsi = require(`./utils/fungsi`);
app.use(express.static(`public`));
// urlEncode untuk menerima input form
app.use(express.urlencoded({ extended: true }));
// validator
const { body, validationResult, check } = require("express-validator");
// setup flash messages
app.use(cookieParser("secret"));
app.use(
  session({
    cookie: {
      maxAge: 60000,
    },
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(flash());

// !
app.get("/", (req, res) => {
  res.render("index", {
    layout: "./layout/main",
  });
});

app.get("/about", (req, res) => {
  res.render("about", {
    layout: "./layout/main",
  });
});

app.get("/contact", (req, res) => {
  const contacts = fungsi.loadContacts();
  res.render("contact", {
    layout: "./layout/main",
    contacts,
    msg: req.flash("msg"),
  });
});

//! halaman add contact
app.get("/contact/add", (req, res) => {
  res.render("contact-add", {
    layout: "./layout/main",
  });
});
// ! proses data add contact
app.post(
  "/contact",
  [
    body("nama").custom((value) => {
      const duplikat = fungsi.cekDuplikat(value);
      if (duplikat) {
        throw new Error("Name already saved");
      }
      return true;
    }),
    check("email", "Invalid Email Format").isEmail(),
    check("noHp", "Invalid Phone Number Format").isMobilePhone("id-ID"),
  ],
  (req, res) => {
    // validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("contact-add", {
        title: "Add new contact form",
        layout: "./layout/main",
        errors: errors.array(),
      });
    } else {
      fungsi.simpanKontak(req.body);
      // kirimkan flash messages
      req.flash("msg", "New Contact Saved");
      res.redirect("/contact");
    }
  }
);

//! menghapus kontak berdasarkan nama
app.get("/contact/delete/:nama", (req, res) => {
  console.log(req.params.nama);
  const contact = fungsi.findContact(req.params.nama);
  if (!contact) {
    res.status(404);
    res.send(`<h1>404</h1>`);
  } else {
    fungsi.hapusContact(req.params.nama);
    req.flash("msg", "Contact Deleted");
    res.redirect("/contact");
  }
});

//! edit kontak
app.get("/contact/edit/:nama", (req, res) => {
  const contact = fungsi.findContact(req.params.nama);
  res.render("contact-edit", {
    layout: "layout/main",
    title: "Edit Contact Form",
    contact,
  });
});

//! proses data untuk mengubah data kontak
app.post(
  "/contact/update",
  [
    body("nama").custom((value, { req }) => {
      const duplikat = fungsi.cekDuplikat(value);
      if (value !== req.body.oldNama && duplikat) {
        throw new Error("Name already saved");
      }
      return true;
    }),
    check("email", "Invalid Email Format").isEmail(),
    check("noHp", "Invalid Phone Number Format").isMobilePhone("id-ID"),
  ],
  (req, res) => {
    // validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("contact-edit", {
        title: "Edit contact form",
        layout: "./layout/main",
        errors: errors.array(),
        contact: req.body,
      });
    } else {
      fungsi.updateContact(req.body);
      // kirimkan flash messages
      req.flash("msg", "New Contact Saved");
      res.redirect("/contact");
    }
  }
);

//! menampilan contact detail
app.get("/contact/:nama", (req, res) => {
  const findContact = fungsi.findContact(req.params.nama);
  res.render("contact-detail", {
    layout: "./layout/main",
    findContact,
  });
  req.flash("msg", "Contact Edited");
  res.redirect("/contact");
});

app.listen(port, () => {
  console.log(`Server listen on port $${port}`);
});
