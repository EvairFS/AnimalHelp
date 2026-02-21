const cors = require("cors");
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');
const connection = require('./database'); 
const rotaFuncionarios = require('./routes/funcionarios'); // Importando o router
const helmet = require("helmet");
const PORT = process.env.PORT || 3000;
const app = express();
const SECRET = "segredo"; // Mesma SECRET do arquivo de rotas

app.use(cors({
  origin: "https://animalhelp24h.com.br",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://animalhelp24h.com.br","https://animalhelp.onrender.com"]
      }
    }
  })
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));
app.use(express.static(path.join(__dirname, '../public')));


// CONECTANDO O ROTEADOR DE FUNCIONARIOS
// Isso substitui todas as rotas manuais de funcionários abaixo
app.use('/funcionarios', rotaFuncionarios);

// Criar pasta uploads se não existir
if (!fs.existsSync("uploads")) { fs.mkdirSync("uploads"); }

// Configuração Multer (usado aqui apenas para a Galeria)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

// Middleware JWT (necessário para a Galeria que ficou aqui)
function autenticarToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(403).json({ erro: "Acesso negado" });
  const token = authHeader.split(' ')[1];
  jwt.verify(token, SECRET, (err, usuario) => {
    if (err) return res.status(401).json({ erro: "Token inválido" });
    req.usuario = usuario;
    next();
  });
}

// =====================
// ROTAS DE AUTENTICAÇÃO
// =====================
app.post('/auth/login', (req, res) => {
  const { email, senha } = req.body;
  connection.query("SELECT * FROM usuarios WHERE email = ?", [email], (err, results) => {
    if (err) return res.status(500).json(err);
    if (results.length === 0) return res.status(401).json({ erro: "Usuário não encontrado" });
    
    const usuario = results[0];
    const valido = bcrypt.compareSync(senha, usuario.senha);
    if (!valido) return res.status(401).json({ erro: "Senha incorreta" });

    const token = jwt.sign({ id: usuario.id }, SECRET, { expiresIn: "1h" });
    res.json({ token });
  });
});

// =====================
// CRUD GALERIA (async/await)
// =====================
app.get("/galeria", async (req, res) => {
  try {
    const [results] = await connection.query("SELECT * FROM galeria");
    res.json(results);
  } catch (err) {
    res.status(500).json(err);
  }
});

app.post("/galeria", autenticarToken, upload.single("imagem"), async (req, res) => {
  try {
    const { titulo } = req.body;
    if (!req.file) return res.status(400).json({ erro: "Selecione uma imagem" });

    const arquivo = req.file.filename;

    const [result] = await connection.query(
      "INSERT INTO galeria (titulo, arquivo) VALUES (?, ?)",
      [titulo, arquivo]
    );

    res.json({ id: result.insertId, titulo, arquivo });
  } catch (err) {
    res.status(500).json(err);
  }
});

app.delete("/galeria/:id", async (req, res) => {
  try {
    await connection.query("DELETE FROM galeria WHERE id = ?", [req.params.id]);
    res.json({ mensagem: "Imagem removida" });
  } catch (err) {
    res.status(500).json(err);
  }
});

///Porta///

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});