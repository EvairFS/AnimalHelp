function login() {

  const API_URL =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:3000"
    : "https://animalhelp.onrender.com";
  const emailEl = document.getElementById("email");
  const senhaEl = document.getElementById("senha");
  const erroEl = document.getElementById("erro");
  erroEl.textContent = "";

  const email = emailEl.value;
  const senha = senhaEl.value;

  if (!email || !senha) {
    erroEl.textContent = "Preencha email e senha";

    if (!email) {
      emailEl.classList.add("input-erro");
      setTimeout(() => emailEl.classList.remove("input-erro"), 500);
    }

    if (!senha) {
      senhaEl.classList.add("input-erro");
      setTimeout(() => senhaEl.classList.remove("input-erro"), 500);
    }

    return;
  }

  fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha })
  })
    .then(res => res.json())
    .then(data => {
      if (data.token) {
        localStorage.setItem("token", data.token);
        window.location.href = "/admin.html";
      } else if (data.erro) {
        erroEl.textContent = data.erro;

        if (data.erro.toLowerCase().includes("senha")) {
          senhaEl.classList.add("input-erro");
          setTimeout(() => senhaEl.classList.remove("input-erro"), 500);
        } else if (data.erro.toLowerCase().includes("usuário")) {
          emailEl.classList.add("input-erro");
          setTimeout(() => emailEl.classList.remove("input-erro"), 500);
        }
      } else {
        erroEl.textContent = "Erro desconhecido";
      }
    });
}

/* 👇 ADICIONE ISSO */
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("btn-login");
  if (btn) {
    btn.addEventListener("click", login);
  }

  const form = document.getElementById("form-login");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      login();
    });
  }
});