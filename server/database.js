const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',      // ou 127.0.0.1
  user: 'root',
  password: '',  // senha correta
  database: 'animalhelp'       // nome do seu banco
});

connection.connect(err => {
  if (err) {
    console.error('Erro ao conectar no MySQL:', err);
    return;
  }
  console.log('MySQL conectado');
});

module.exports = connection;