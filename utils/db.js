const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/wpu");

// menambah 1 data
// const contact1 = new contact({
//   nama: "Erik",
//   noHp: "08123728934",
//   email: "erik@gmail.com",
// });

// // simpan ke collection
// contact1.save().then((result) => {
//   console.log(result);
// });
