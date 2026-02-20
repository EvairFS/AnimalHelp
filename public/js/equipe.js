fetch("http://localhost:3000/funcionarios")
  .then(res => res.json())
  .then(data => {
    const lista = document.getElementById("lista-funcionarios");
    lista.innerHTML = "";

    data.forEach(func => {
      lista.innerHTML += `
        <div>
          <img src="http://localhost:3000/uploads/${func.foto}" width="150">
          <h3>${func.nome}</h3>
          <p>${func.cargo}</p>
        </div>
      `;
    });
  })
  .catch(err => console.error(err));