const express = require("express");
const app = express();
const port = 3000;
const expressLayouts = require("express-ejs-layouts");
const session = require("express-session");
const flash = require("connect-flash");
const cookieParser = require("cookie-parser");
const { body, validationResult, check } = require("express-validator");
var methodOverride = require("method-override");

// thired party middleware
app.use(expressLayouts);
app.use(express.static(`public`));
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.use(methodOverride("_method"));

// konfigurasi flash
app.use(cookieParser(`secret`));
app.use(
  session({
    cookie: { maxAge: 6000 },
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(flash());

require("./utils/db");
const Contact = require("./model/contact");

// ! halaman home
app.get("/", (req, res) => {
  const students = [
    {
      nama: "Haaland",
      nrp: "02826239",
      jurusan: "Ilmu Hukum",
    },
    {
      nama: "Gabriella",
      nrp: "02834639",
      jurusan: "Psikologi",
    },
    {
      nama: "Max",
      nrp: "08326239",
      jurusan: "Teknik Elektro",
    },
  ];
  res.render("index", {
    title: "Home Page",
    layout: "layouts/main-layouts",
    students,
  });
});

app.get("/about", (req, res) => {
  res.render("about", {
    title: "About",
    layout: "layouts/main-layouts",
  });
});

app.get("/contact", async (req, res) => {
  //   contact.find().then((contact) => {
  //     res.send(contact);
  //   });
  const contacts = await Contact.find();
  res.render("contact", {
    title: "Contact",
    layout: "layouts/main-layouts",
    contacts,
    msg: req.flash(`msg`),
  });
});

// ! menambah data kontak
app.get("/contact/add", (req, res) => {
  res.render("add-contact", {
    title: "Add Contact Form",
    layout: "layouts/main-layouts",
  });
});
// * proses tambah data
app.post(
  `/contact`,
  [
    body(`nama`).custom(async (value) => {
      const duplikat = await Contact.findOne({ nama: value });
      if (duplikat) {
        throw new Error(`Name already registered`);
      }
      return true;
    }),
    check(`email`, "Invalid Email").isEmail(),
    check(`noHp`, "Invalid Phone Number").isMobilePhone(`id-ID`),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render(`add-contact`, {
        title: `Add new contact form`,
        layout: `layouts/main-layouts`,
        errors: errors.array(),
      });
      // return res.status(400).json({ errors: errors.array() });
    } else {
      // * insert data dan tampilkan flash messages
      Contact.insertMany(req.body);
      req.flash(`msg`, `Success, new contact registered`);
      res.redirect(`/contact`);
    }
  }
);

// ! detil kontak
app.get("/contact/:nama", async (req, res) => {
  //   const contact = fungsi.findContact(req.params.nama);
  const contact = await Contact.findOne({ nama: req.params.nama });

  res.render("detail", {
    title: "Contact detail",
    layout: "layouts/main-layouts",
    contact,
  });
});
// ! menghapus kontak
// app.get(`/contact/delete/:nama`, async (req, res) => {
//   const contact = await Contact.findOne({ nama: req.params.nama });
//   // jika kontak tidak ada
//   if (!contact) {
//     res.status(404);
//     res.send(`<h1>404</h1>`);
//   } else {
//     // fungsi.deleteContact(req.params.nama);
//     await Contact.deleteOne({ nama: req.params.nama });
//     req.flash(`msg`, `Success, delete contact`);
//     res.redirect(`/contact`);
//   }
// });

app.delete(`/contact`, async (req, res) => {
  await Contact.deleteOne({ nama: req.body.nama });
  req.flash(`msg`, `Success, delete contact`);
  res.redirect(`/contact`);
});

// !edit kontak
app.get("/contact/edit/:nama", async (req, res) => {
  const contact = await Contact.findOne({ nama: req.params.nama });
  res.render("edit-contact", {
    title: "Edit Contact Form",
    layout: "layouts/main-layouts",
    contact,
  });
});

// !proses edit data
app.put(
  `/contact`,
  [
    body(`nama`).custom(async (value, { req }) => {
      const duplikat = await Contact.findOne({ nama: value });
      if (value !== req.body.oldNama && duplikat) {
        throw new Error(`Name already registered`);
      }
      return true;
    }),
    check(`email`, "Invalid Email").isEmail(),
    check(`noHp`, "Invalid Phone Number").isMobilePhone(`id-ID`),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render(`edit-contact`, {
        title: `edit contact form`,
        layout: `layouts/main-layouts`,
        errors: errors.array(),
        contact: req.body,
      });
    } else {
      const re = async () => {
        await Contact.updateOne(
          { _id: req.body._id },
          {
            $set: {
              nama: req.body.nama,
              email: req.body.email,
              noHp: req.body.noHp,
            },
          }
        );
        // kirimkan flash message
        req.flash(`msg`, `Success, contact edited`);
        res.redirect(`/contact`);
      };
      re();
    }
  }
);

app.listen(port, () => {
  console.log(`server listen on port $${port}`);
});
