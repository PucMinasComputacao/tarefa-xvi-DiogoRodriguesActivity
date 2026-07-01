const API_URL = "http://localhost:3000/catalogo";

function getFavoritos(usuarioId) {
  const dados = localStorage.getItem(`favoritos_${usuarioId}`);
  return dados ? JSON.parse(dados) : [];
}

function showMessage(text) {
  document.getElementById("message").textContent = text;
}

async function init() {
  const dados = sessionStorage.getItem("usuarioCorrente");
  if (!dados) {
    showMessage("Você precisa estar logado para ver seus favoritos.");
    return;
  }

  const usuario = JSON.parse(dados);
  const favIds = getFavoritos(usuario.id).map(Number);

  if (favIds.length === 0) {
    showMessage("Você ainda não tem favoritos.");
    return;
  }

  showMessage("Carregando...");
  try {
    const response = await fetch(API_URL);
    const catalogo = await response.json();
    const itens = catalogo.filter(item => favIds.includes(Number(item.id)));

    const container = document.getElementById("cards-lista");
    container.innerHTML = "";
    showMessage("");

    itens.forEach(item => {
      const card = document.createElement("div");
      card.className = "filme-card";
      card.innerHTML = `
        <img src="../${item.imagem}" alt="${item.titulo}">
        <div class="card-body">
          <span class="categoria">${item.categoria} · ${item.tipo === "serie" ? "Série" : "Filme"}</span>
          <h2>${item.titulo}</h2>
          <p>${item.descricaoCurta}</p>
          <div class="card-footer">
            <span class="nota">⭐ ${item.nota}</span>
            <a href="../details.html?id=${item.id}">Ver detalhes →</a>
          </div>
        </div>
      `;
      container.appendChild(card);
    });
  } catch (e) {
    showMessage("Erro ao carregar. Verifique se o JSON Server está rodando.");
  }
}

init();