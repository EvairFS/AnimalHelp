const express = require("express");
const multer = require("multer");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const funcionariosRoutes = require('./routes/funcionarios');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth');

const app = express();
const SECRET = "segredo_super_forte";
require('./database');
const connection = require('./database')


app.use(express.json());
app.use(cors());
app.use('/funcionarios', funcionariosRoutes);
app.use('/uploads', express.static('uploads'));
app.use(express.static(path.join(__dirname, '../public')));
app.use('/auth', authRoutes);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


/* ==============================
   CRIAR PASTA UPLOAD SE NÃO EXISTIR
============================== */
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

/* ==============================
   CONFIG MULTER
============================== */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname),
  fileFilter: (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Arquivo inválido"), false);
  }
}
});

const upload = multer({ storage });

/* ==============================
   DADOS EM MEMÓRIA
============================== */
let funcionarios = [];

let usuarios = [
  {
    id: 1,
    email: "admin@admin.com",
    senha: bcrypt.hashSync("123456", 8) // senha: 123456
  }
];

/* ==============================
   MIDDLEWARE JWT
============================== */
function verificarToken(req, res, next) {
  const token = req.headers.authorization;
  if (!token) return res.status(403).json({ erro: "Acesso negado" });

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ erro: "Token inválido" });
    req.usuario = decoded;
    next();
  });
}

/* ==============================
   LOGIN
============================== */
app.post("/login", async (req, res) => {
  const { email, senha } = req.body;

  const usuario = usuarios.find(u => u.email === email);
  if (!usuario) return res.status(404).json({ erro: "Usuário não encontrado" });

  const senhaValida = await bcrypt.compare(senha, usuario.senha);
  if (!senhaValida) return res.status(401).json({ erro: "Senha inválida" });

  const token = jwt.sign({ id: usuario.id }, SECRET, { expiresIn: "1h" });

  res.json({ token });
});

/* ==============================
   CRUD FUNCIONÁRIOS
============================== */

// CREATE (protegido)
app.post("/funcionarios", verificarToken, upload.single("foto"), (req, res) => {
  const novo = {
    id: Date.now(),
    nome: req.body.nome,
    cargo: req.body.cargo,
    foto: req.file.filename,
  };

  funcionarios.push(novo);
  res.json(novo);
});

// READ (público)
app.get("/funcionarios", (req, res) => {
  res.json(funcionarios);
});

// UPDATE (protegido)
app.put("/funcionarios/:id", verificarToken, upload.single("foto"), (req, res) => {
  const id = parseInt(req.params.id);
  const funcionario = funcionarios.find(f => f.id === id);

  if (!funcionario)
    return res.status(404).json({ erro: "Não encontrado" });

  funcionario.nome = req.body.nome || funcionario.nome;
  funcionario.cargo = req.body.cargo || funcionario.cargo;
  if (req.file) funcionario.foto = req.file.filename;

  res.json(funcionario);
});

// DELETE (protegido)
app.delete("/funcionarios/:id", verificarToken, (req, res) => {
  const id = parseInt(req.params.id);
  funcionarios = funcionarios.filter(f => f.id !== id);
  res.json({ sucesso: true });
});

app.listen(3000, () =>
  console.log("Servidor rodando em http://localhost:3000")
);