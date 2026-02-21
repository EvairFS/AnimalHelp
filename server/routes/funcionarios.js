const express = require('express');
const router = express.Router();
const multer = require('multer');
const jwt = require('jsonwebtoken');
const connection = require('../database');

// =====================
// Middleware JWT (Versão Corrigida)
// =====================
function autenticarToken(req, res, next) {
  const authHeader = req.headers.authorization;

  // 1. Verifica se o header existe
  if (!authHeader) {
    return res.status(403).json({ erro: "Acesso negado" });
  }

  // 2. Separa a palavra "Bearer" do código do token
  const token = authHeader.split(' ')[1]; 

  if (!token) {
    return res.status(401).json({ erro: "Token não encontrado" });
  }

  // 3. Usa a MESMA chave do login
  jwt.verify(token, 'segredo', (err, usuario) => {
    if (err) return res.status(401).json({ erro: "Token inválido ou expirado" });
    req.usuario = usuario;
    next();
  });
}

// =====================
// Configuração Multer
// =====================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// =====================
// GET
// =====================
router.get('/', (req, res) => {
  connection.query("SELECT * FROM funcionarios", (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// =====================
// POST
// =====================
router.post('/', autenticarToken, upload.single('foto'), (req, res) => {

  const { nome, cargo } = req.body;

  if (!req.file) {
    return res.status(400).json({ erro: "Arquivo não enviado" });
  }

  if (!nome || !cargo) {
    return res.status(400).json({ erro: "Campos obrigatórios" });
  }

  const foto = req.file.filename;

  connection.query(
    "INSERT INTO funcionarios (nome, cargo, foto) VALUES (?, ?, ?)",
    [nome, cargo, foto],
    (err, result) => {
      if (err) return res.status(500).json(err);

      res.json({
        id: result.insertId,
        nome,
        cargo,
        foto
      });
    }
  );
});
// =====================
// DELETE
// =====================

router.delete('/:id', autenticarToken, (req, res) => {
  connection.query(
    "DELETE FROM funcionarios WHERE id = ?",
    [req.params.id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ mensagem: "Funcionário removido" });
    }
  );
});

// =====================
// PUT
// =====================

router.put('/:id', autenticarToken, (req, res) => {
  const { nome, cargo } = req.body;

  if (!nome || !cargo) {
    return res.status(400).json({ erro: "Dados inválidos" });
  }

  connection.query(
    "UPDATE funcionarios SET nome = ?, cargo = ? WHERE id = ?",
    [nome, cargo, req.params.id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ mensagem: "Funcionário atualizado" });
    }
  );
});



module.exports = router;