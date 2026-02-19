const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "SUA_SENHA",
  database: "animalhelp"
});

connection.connect(err => {
  if (err) {
    console.error("Erro ao conectar no MySQL:", err);
  } else {
    console.log("Conectado ao MySQL");
  }
});

module.exports = connection;