const API_URL = "http://localhost:3000";

// ================= TOKEN =================
function getAuthHeader() {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Você não está autenticado! Redirecionando para login...");
    window.location.href = "login.html";
    return null;
  }

  return {
    Authorization: `Bearer ${token}`
  };
}

// ================= CARREGAR DADOS =================
async function carregarDados() {
  listar("funcionarios", "lista-funcionarios");
  listar("galeria", "lista-galeria");
}

// ================= LISTAR =================
async function listar(rota, idTabela) {
  try {
    const res = await fetch(`${API_URL}/${rota}`);
    const data = await res.json();

    const container = document.getElementById(idTabela);
    if (!container) return;

    container.innerHTML = "";

    data.forEach(item => {
      const tr = document.createElement("tr");

      // IMAGEM
      const tdImg = document.createElement("td");
      const img = document.createElement("img");

      const nomeArquivo = item.foto || item.arquivo;
      img.src = nomeArquivo
        ? `${API_URL}/uploads/${nomeArquivo}`
        : "https://via.placeholder.com/50";

      img.className = "img-admin-thumb";
      img.onerror = () => {
        img.src = "https://via.placeholder.com/50";
      };

      tdImg.appendChild(img);

      // INFO
      const tdInfo = document.createElement("td");
      tdInfo.innerHTML = `
        <strong>${item.nome || item.titulo || ""}</strong><br>
        <small>${item.cargo || ""}</small>
      `;

      // AÇÃO
      const tdAcao = document.createElement("td");
      const btn = document.createElement("button");

      btn.className = "btn-delete";
      btn.dataset.rota = rota;
      btn.dataset.id = item.id || item._id;

      btn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
          viewBox="0 0 24 24" fill="none" stroke="white"
          stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6
          m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          <line x1="10" y1="11" x2="10" y2="17"></line>
          <line x1="14" y1="11" x2="14" y2="17"></line>
        </svg>
      `;

      tdAcao.appendChild(btn);

      tr.appendChild(tdImg);
      tr.appendChild(tdInfo);
      tr.appendChild(tdAcao);

      container.appendChild(tr);
    });
  } catch (err) {
    console.error("Erro ao listar:", err);
  }
}

// ================= DELEGAÇÃO DE EVENTO =================
document.addEventListener("click", function (e) {
  const btn = e.target.closest(".btn-delete");
  if (!btn) return;

  const rota = btn.dataset.rota;
  const id = btn.dataset.id;

  if (id && id !== "undefined") {
    excluir(rota, id);
  } else {
    console.error("ID não encontrado para exclusão.");
  }
});

// ================= FORM FUNCIONÁRIO =================
const formFunc = document.getElementById("form-funcionario");

if (formFunc) {
  formFunc.addEventListener("submit", async function (e) {
    e.preventDefault();

    const headers = getAuthHeader();
    if (!headers) return;

    const fd = new FormData();
    fd.append("nome", document.getElementById("nome").value);
    fd.append("cargo", document.getElementById("cargo").value);

    const foto = document.getElementById("foto").files[0];
    if (foto) fd.append("foto", foto);

    try {
      const res = await fetch(`${API_URL}/funcionarios`, {
        method: "POST",
        headers,
        body: fd
      });

      if (res.ok) {
        e.target.reset();
        listar("funcionarios", "lista-funcionarios");
      } else {
        const erro = await res.json();
        alert("Erro ao salvar: " + (erro.erro || "Acesso Negado"));
      }
    } catch (err) {
      alert("Erro de conexão com o servidor.");
    }
  });
}

// ================= FORM GALERIA =================
const formGal = document.getElementById("form-galeria");

if (formGal) {
  formGal.addEventListener("submit", async function (e) {
    e.preventDefault();

    const headers = getAuthHeader();
    if (!headers) return;

    const fd = new FormData();
    fd.append("titulo", document.getElementById("titulo-galeria").value);
    fd.append("imagem", document.getElementById("imagem-galeria").files[0]);

    try {
      const res = await fetch(`${API_URL}/galeria`, {
        method: "POST",
        headers,
        body: fd
      });

      if (res.ok) {
        e.target.reset();
        listar("galeria", "lista-galeria");
      } else {
        alert("Erro ao postar na galeria.");
      }
    } catch (err) {
      alert("Erro de conexão.");
    }
  });
}

// ================= EXCLUIR =================
async function excluir(rota, id) {
  if (!confirm("Deseja apagar permanentemente?")) return;

  const headers = getAuthHeader();
  if (!headers) return;

  try {
    const res = await fetch(`${API_URL}/${rota}/${id}`, {
      method: "DELETE",
      headers
    });

    if (res.ok) {
      carregarDados();
    } else {
      alert("Erro ao excluir. Verifique suas permissões.");
    }
  } catch (err) {
    alert("Erro ao excluir: Falha na conexão.");
  }
}

// ================= INIT =================
carregarDados();