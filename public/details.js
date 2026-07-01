const API_URL = "http://localhost:3000/catalogo";

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

function showMessage(text) {
  document.getElementById("message").textContent = text;
}

function getUsuarioCorrente() {
  const dados = sessionStorage.getItem("usuarioCorrente");
  return dados ? JSON.parse(dados) : null;
}

function getFavoritos(usuarioId) {
  const dados = localStorage.getItem(`favoritos_${usuarioId}`);
  return dados ? JSON.parse(dados) : [];
}

function setFavoritos(usuarioId, lista) {
  localStorage.setItem(`favoritos_${usuarioId}`, JSON.stringify(lista));
}

function toggleFavoritoDetalhe(itemId, btn) {
  const usuario = getUsuarioCorrente();
  if (!usuario) {
    alert("Você precisa estar logado para favoritar.");
    window.location.href = "modulos/login/index.html";
    return;
  }
  const favs = getFavoritos(usuario.id).map(Number);
  const idx = favs.indexOf(Number(itemId));
  if (idx === -1) {
    favs.push(Number(itemId));
    btn.textContent = "❤️";
    btn.title = "Remover dos favoritos";
  } else {
    favs.splice(idx, 1);
    btn.textContent = "🤍";
    btn.title = "Adicionar aos favoritos";
  }
  setFavoritos(usuario.id, favs);
}

function renderDetail(item) {
  const tags = (item.tags || []).map(t => `<span class="tag">${t}</span>`).join("");

  const usuario = getUsuarioCorrente();
  const isFav = usuario ? getFavoritos(usuario.id).map(Number).includes(Number(item.id)) : false;

  document.getElementById("detalhe").innerHTML = `
    <div class="detalhe">
      <img src="${item.imagem}" alt="${item.titulo}">
      <div class="detalhe-info">
        <div class="d-flex justify-content-between align-items-start">
          <span class="categoria">${item.categoria} · ${item.tipo === "serie" ? "Série" : "Filme"}</span>
          <button class="btn-favorito-detalhe" id="btn-fav-detalhe" onclick="toggleFavoritoDetalhe('${item.id}', this)"
            title="${isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}"
            style="background:none;border:none;font-size:1.6rem;cursor:pointer;line-height:1">
            ${isFav ? "❤️" : "🤍"}
          </button>
        </div>
        <h2>${item.titulo}</h2>
        <p class="nota">⭐ ${item.nota}</p>
        <p>${item.descricaoCompleta || item.descricaoCurta}</p>
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