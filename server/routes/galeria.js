const express = require('express');
const router = express.Router();
const multer = require('multer');
const jwt = require('jsonwebtoken');
const connection = require('../database');
const fs = require('fs');

const SECRET = "segredo"; // Deve ser a mesma do server.js e funcionarios.js

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
// Configuração Multer
// =====================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// =====================
// ROTAS
// =====================

// LISTAR FOTOS (Público)
router.get('/', (req, res) => {
  connection.query("SELECT * FROM galeria", (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// ADICIONAR FOTO (Protegido)
router.post('/', autenticarToken, upload.single('imagem'), (req, res) => {
  const { titulo } = req.body;
  if (!req.file) return res.status(400).json({ erro: "Arquivo não enviado" });

  const arquivo = req.file.filename;
  connection.query(
    "INSERT INTO galeria (titulo, arquivo) VALUES (?, ?)",
    [titulo, arquivo],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ id: result.insertId, titulo, arquivo });
    }
  );
});

// DELETAR FOTO (Protegido)
router.delete('/:id', autenticarToken, (req, res) => {
  const { id } = req.params;

  // Busca o nome do arquivo para remover da pasta
  connection.query("SELECT arquivo FROM galeria WHERE id = ?", [id], (err, results) => {
    if (err || results.length === 0) return res.status(404).json({ erro: "Foto não encontrada" });

    const nomeArquivo = results[0].arquivo;
    fs.unlink(`uploads/${nomeArquivo}`, () => {
      connection.query("DELETE FROM galeria WHERE id = ?", [id], (err2) => {
        if (err2) return res.status(500).json(err2);
        res.json({ mensagem: "Foto removida com sucesso" });
      });
    });
  });
});

module.exports = router;