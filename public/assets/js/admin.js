async function listar(rota, idTabela) {
  try {
    const res = await fetch(`${API_URL}/${rota}`);

    if (!res.ok) {
      console.error("Erro HTTP:", res.status);
      return;
    }

    const data = await res.json();
    const container = document.getElementById(idTabela);
    if (!container) return;

    container.innerHTML = "";

    data.forEach(item => {
      const tr = document.createElement("tr");

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

      const tdInfo = document.createElement("td");
      tdInfo.innerHTML = `
        <strong>${item.nome || item.titulo || ""}</strong><br>
        <small>${item.cargo || ""}</small>
      `;

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
        </svg>`;

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