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