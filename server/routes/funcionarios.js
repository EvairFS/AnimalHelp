const express = require('express');
const router = express.Router();
const multer = require('multer');
const jwt = require('jsonwebtoken');
const connection = require('../database');

// =====================
// Middleware JWT
// =====================
function autenticarToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(403).json({ erro: "Acesso negado" });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ erro: "Token não encontrado" });
  }

  jwt.verify(token, 'segredo', (err, usuario) => {
    if (err) return res.status(401).json({ erro: "Token inválido ou expirado" });
    req.usuario = usuario;
    next();
  });
}

// =====================
// Multer
// =====================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const upload = multer({ storage });

// =====================
// GET (async/await)
// =====================
router.get('/', async (req, res) => {
  try {
    const [rows] = await connection.query("SELECT * FROM funcionarios");
    res.json(rows);
  } catch (err) {
    res.status(500).json(err);
  }
});

// =====================
// POST (async/await)
// =====================
router.post('/', autenticarToken, upload.single('foto'), async (req, res) => {
  try {
    const { nome, cargo } = req.body;

    if (!req.file) {
      return res.status(400).json({ erro: "Arquivo não enviado" });
    }

    if (!nome || !cargo) {
      return res.status(400).json({ erro: "Campos obrigatórios" });
    }

    const foto = req.file.filename;

    const [result] = await connection.query(
      "INSERT INTO funcionarios (nome, cargo, foto) VALUES (?, ?, ?)",
      [nome, cargo, foto]
    );

    res.json({
      id: result.insertId,
      nome,
      cargo,
      foto
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

// =====================
// DELETE (async/await)
// =====================
router.delete('/:id', autenticarToken, async (req, res) => {
  try {
    await connection.query(
      "DELETE FROM funcionarios WHERE id = ?",
      [req.params.id]
    );
    res.json({ mensagem: "Funcionário removido" });
  } catch (err) {
    res.status(500).json(err);
  }
});

// =====================
// PUT (async/await)
// =====================
router.put('/:id', autenticarToken, async (req, res) => {
  try {
    const { nome, cargo } = req.body;

    if (!nome || !cargo) {
      return res.status(400).json({ erro: "Dados inválidos" });
    }

    await connection.query(
      "UPDATE funcionarios SET nome = ?, cargo = ? WHERE id = ?",
      [nome, cargo, req.params.id]
    );

    res.json({ mensagem: "Funcionário atualizado" });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;