const API_URL = "http://localhost:3000/catalogo";

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

function showMessage(text) {
  document.getElementById("message").textContent = text;
}

function renderDetail(item) {
  const tags = item.tags.map(t => `<span class="tag">${t}</span>`).join("");

  document.getElementById("detalhe").innerHTML = `
    <div class="detalhe">
      <img src="${item.imagem}" alt="${item.titulo}">
      <div class="detalhe-info">
        <span class="categoria">${item.categoria} · ${item.tipo === "serie" ? "Série" : "Filme"}</span>
        <h2>${item.titulo}</h2>
        <p class="nota">⭐ ${item.nota}</p>
        <p>${item.descricaoCompleta}</p>
        <div class="tags">${tags}</div>
      </div>
    </div>
  `;
}

async function init() {
  if (!id) {
    showMessage("Nenhum item selecionado.");
    return;
  }

  showMessage("Carregando...");

  try {
    const response = await fetch(`${API_URL}/${id}`);
    if (!response.ok) {
      showMessage("Item não encontrado.");
      return;
    }
    const item = await response.json();
    showMessage("");
    renderDetail(item);
  } catch (error) {
    showMessage("Erro ao carregar. Verifique se o JSON Server está rodando.");
    console.error(error);
  }
}

init();