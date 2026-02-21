const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const connection = require('../database');
router.post('/login', (req, res) => {

  if (!req.body) {
    return res.status(400).json({ erro: "Body não enviado" });
  }

  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ erro: "Email e senha obrigatórios" });
  }

  connection.query(
    "SELECT * FROM usuarios WHERE email = ? AND senha = ?",
    [email, senha],
    (err, results) => {
      if (err) return res.status(500).json(err);

      if (results.length === 0) {
        return res.status(401).json({ erro: "Credenciais inválidas" });
      }

      const usuario = results[0];

      const token = jwt.sign(
        { id: usuario.id, email: usuario.email },
        "segredo",
        { expiresIn: "1h" }
      );

      res.json({ token });
    }
  );
});

module.exports = router;