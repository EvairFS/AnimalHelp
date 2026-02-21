const express = require('express');
const router = express.Router();
const multer = require('multer');
const jwt = require('jsonwebtoken');
const connection = require('../database');
const fs = require('fs');

const SECRET = "segredo";

// =====================
// Middleware JWT
// =====================
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
// Multer
// =====================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// =====================
// LISTAR FOTOS (público)
// =====================
router.get('/', async (req, res) => {
  try {
    const [rows] = await connection.query("SELECT * FROM galeria");
    res.json(rows);
  } catch (err) {
    res.status(500).json(err);
  }
});

// =====================
// ADICIONAR FOTO (protegido)
// =====================
router.post('/', autenticarToken, upload.single('imagem'), async (req, res) => {
  try {
    const { titulo } = req.body;
    if (!req.file) return res.status(400).json({ erro: "Arquivo não enviado" });

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

// =====================
// DELETAR FOTO (protegido)
// =====================
router.delete('/:id', autenticarToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await connection.query(
      "SELECT arquivo FROM galeria WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ erro: "Foto não encontrada" });
    }

    const nomeArquivo = rows[0].arquivo;

    fs.unlink(`uploads/${nomeArquivo}`, async () => {
      await connection.query("DELETE FROM galeria WHERE id = ?", [id]);
      res.json({ mensagem: "Foto removida com sucesso" });
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;