const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const connection = require('../database');

router.post('/login', async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ erro: "Body não enviado" });
    }

    const { email, senha } = req.body;
    if (!email || !senha) {
      return res.status(400).json({ erro: "Email e senha obrigatórios" });
    }

    const [rows] = await connection.query(
      "SELECT * FROM usuarios WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ erro: "Credenciais inválidas" });
    }

    const usuario = rows[0];

    const valido = bcrypt.compareSync(senha, usuario.senha);
    if (!valido) {
      return res.status(401).json({ erro: "Senha incorreta" });
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email },
      "segredo",
      { expiresIn: "1h" }
    );

    res.json({ token });

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro interno" });
  }
});

module.exports = router;