const express = require("express");
const multer = require("multer");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));

if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

let funcionarios = [];

// CREATE
app.post("/funcionarios", upload.single("foto"), (req, res) => {
  const novo = {
    id: Date.now(),
    nome: req.body.nome,
    cargo: req.body.cargo,
    foto: req.file.filename,
  };

  funcionarios.push(novo);
  res.json(novo);
});

// READ
app.get("/funcionarios", (req, res) => {
  res.json(funcionarios);
});

// UPDATE
app.put("/funcionarios/:id", upload.single("foto"), (req, res) => {
  const id = parseInt(req.params.id);
  const funcionario = funcionarios.find(f => f.id === id);

  if (!funcionario) return res.status(404).json({ erro: "Não encontrado" });

  funcionario.nome = req.body.nome || funcionario.nome;
  funcionario.cargo = req.body.cargo || funcionario.cargo;
  if (req.file) funcionario.foto = req.file.filename;

  res.json(funcionario);
});

// DELETE
app.delete("/funcionarios/:id", (req, res) => {
  const id = parseInt(req.params.id);
  funcionarios = funcionarios.filter(f => f.id !== id);
  res.json({ sucesso: true });
});

app.listen(3000, () => console.log("Servidor rodando na porta 3000"));