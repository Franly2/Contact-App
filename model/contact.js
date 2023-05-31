const mongoose = require("mongoose");

const contact = mongoose.model("contact", {
  nama: {
    type: String,
    required: true,
  },
  noHp: {
    type: String,
    required: true,
  },
  email: {
    type: String,
  },
});

module.exports = contact;
