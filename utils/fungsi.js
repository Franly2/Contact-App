const fs = require("fs");
const readline = require("readline");
const { connect } = require("http2");
const { constants } = require("buffer");

path = `./data`;
jsonPath = `./data/contacts.json`;

if (!fs.existsSync(path)) {
  fs.mkdir(path, () => {});
}

if (!fs.existsSync(jsonPath)) {
  fs.writeFileSync(jsonPath, `[]`);
}

const loadContacts = () => {
  const file = fs.readFileSync(jsonPath, `utf8`);
  const contacts = JSON.parse(file);
  return contacts;
};

function simpanKontak(contact) {
  const contacts = loadContacts();
  contacts.push(contact);
  fs.writeFileSync(jsonPath, JSON.stringify(contacts));
}

function simpanContacts(contacts) {
  fs.writeFileSync(jsonPath, JSON.stringify(contacts));
}
// cari contact berdasarkan nama
const findContact = (nama) => {
  const contacts = loadContacts();
  const foundContact = contacts.find((contact) => contact.nama === nama);
  return foundContact;
};

const listContacts = () => {
  const contacts = loadContacts();
  contacts.forEach((contact, index) => {
    console.log(`${index + 1}. ${contact.nama} - ${contact.noHp}`);
  });
};

const deleteContact = (nama) => {
  const contacts = loadContacts();
  const contactsBaru = contacts.filter((contact) => {
    contact.nama.toLowerCase() !== nama.toLowerCase();
  });
  if (contacts.length === contactsBaru.length) {
    console.log(chalk.red.bold.inverse(`${nama} tidak ditemukan`));
    return false;
  }
  fs.writeFileSync(jsonPath, JSON.stringify(contactsBaru));
  console.log(chalk.green.inverse.bold(`kontak berhasil dihapus`));
};

const cekDuplikat = (value) => {
  const contacts = loadContacts();
  return contacts.find((contact) => contact.nama === value);
};

const hapusContact = (value) => {
  const contacts = loadContacts();
  let filteredContacts = contacts.filter((contact) => contact.nama !== value);
  simpanContacts(filteredContacts);
};

const updateContact = (newContact) => {
  const contacts = loadContacts();
  let filteredContacts = contacts.filter(
    (contact) => contact.nama !== newContact.oldNama
  );
  delete newContact.oldNama;
  filteredContacts.push(newContact);
  simpanContacts(filteredContacts);
};

module.exports = {
  simpanKontak,
  listContacts,
  deleteContact,
  loadContacts,
  findContact,
  cekDuplikat,
  hapusContact,
  updateContact,
};
