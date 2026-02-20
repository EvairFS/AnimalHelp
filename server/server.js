const express = require('express');
const multer = require('multer');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');
const connection = require('./database'); // sua conexão MySQL
const cors = require('cors');

const app = express();
const SECRET = "segredo_super_forte";

app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use('/uploads', express.static('uploads'));

// =====================
// Criar pasta uploads
// =====================
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// =====================
// Configuração Multer
// =====================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

// =====================
// Middleware JWT
// =====================
function autenticarToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(403).json({ erro: "Acesso negado" });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ erro: "Token mal formatado" });

  jwt.verify(token, SECRET, (err, usuario) => {
    if (err) return res.status(401).json({ erro: "Token inválido" });
    req.usuario = usuario;
    next();
  });
}
// =====================
// Rota para a tela de Login
// =====================
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/login.html'));
});

// =====================
// LOGIN (exemplo admin)
// =====================
let usuarios = [
  {
    id: 1,
    email: "admin@admin.com",
    senha: bcrypt.hashSync("123456", 8) // senha: 123456
  }
];

app.post('/auth/login', (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) return res.status(400).json({ erro: "Email e senha obrigatórios" });

  const usuario = usuarios.find(u => u.email === email);
  if (!usuario) return res.status(401).json({ erro: "Usuário não encontrado" });

  const valido = bcrypt.compareSync(senha, usuario.senha);
  if (!valido) return res.status(401).json({ erro: "Senha incorreta" });

  const token = jwt.sign({ id: usuario.id, email: usuario.email }, SECRET, { expiresIn: "1h" });
  res.json({ token });
});

// =====================
// CRUD FUNCIONÁRIOS
// =====================

// CREATE
app.post("/funcionarios", autenticarToken, upload.single("foto"), (req, res) => {
  const { nome, cargo } = req.body;
  if (!req.file) return res.status(400).json({ erro: "Arquivo não enviado" });
  if (!nome || !cargo) return res.status(400).json({ erro: "Campos obrigatórios" });

  const foto = req.file.filename;

  const sql = "INSERT INTO funcionarios (nome, cargo, foto) VALUES (?, ?, ?)";
  connection.query(sql, [nome, cargo, foto], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ id: result.insertId, nome, cargo, foto });
  });
});

// READ
app.get("/funcionarios", (req, res) => {
  connection.query("SELECT * FROM funcionarios", (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// UPDATE
app.put("/funcionarios/:id", autenticarToken, upload.single("foto"), (req, res) => {
  const { nome, cargo } = req.body;
  const { id } = req.params;

  if (!nome || !cargo) return res.status(400).json({ erro: "Campos obrigatórios" });

  let sql, params;
  if (req.file) {
    sql = "UPDATE funcionarios SET nome = ?, cargo = ?, foto = ? WHERE id = ?";
    params = [nome, cargo, req.file.filename, id];
  } else {
    sql = "UPDATE funcionarios SET nome = ?, cargo = ? WHERE id = ?";
    params = [nome, cargo, id];
  }

  connection.query(sql, params, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ mensagem: "Funcionário atualizado" });
  });
});

// DELETE
app.delete("/funcionarios/:id", autenticarToken, (req, res) => {
  const { id } = req.params;
  connection.query("DELETE FROM funcionarios WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ mensagem: "Funcionário removido", affectedRows: result.affectedRows });
  });
});

// =====================
// START SERVER
// =====================
app.listen(3000, () => console.log("Servidor rodando em http://localhost:3000"));