const API_URL = "http://localhost:3000/catalogo";

let todosItens = [];

// ---- Fetch ----
async function fetchItems() {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error("Erro ao buscar dados.");
  return await response.json();
}

// ---- Carrossel ----
function renderCarrossel(itens) {
  const destaques = itens.filter(i => i.destaque);
  const inner = document.getElementById("carousel-inner");
  const indicators = document.getElementById("carousel-indicators");
  if (!inner) return;

  inner.innerHTML = "";
  indicators.innerHTML = "";

  destaques.forEach((item, idx) => {
    const active = idx === 0 ? "active" : "";

    inner.innerHTML += `
      <div class="carousel-item ${active}">
        <a href="details.html?id=${item.id}" style="text-decoration:none">
          <img src="${item.imagem}" class="d-block w-100" alt="${item.titulo}"
               style="height:380px;object-fit:cover;border-radius:10px;filter:brightness(0.7)">
          <div class="carousel-caption d-block">
            <h3>${item.titulo}</h3>
            <p class="d-none d-md-block">${item.descricaoCurta}</p>
          </div>
        </a>
      </div>
    `;

    indicators.innerHTML += `
      <button type="button" data-bs-target="#carrossel" data-bs-slide-to="${idx}"
        class="${active}" aria-label="Slide ${idx + 1}"></button>
    `;
  });
}

// ---- Cards ----
function createCard(item) {
  const card = document.createElement("div");
  card.className = "filme-card";
  card.dataset.id = item.id;

  const usuario = getUsuarioCorrente();
  const favs = usuario ? getFavoritos(usuario.id).map(Number) : [];
  const isFav = favs.includes(Number(item.id));

  const adminBtns = usuario && usuario.admin ? `
    <div class="card-actions">
      <a href="modulos/form.html?id=${item.id}" class="btn-acao btn-editar">✏️ Editar</a>
      <button class="btn-acao btn-deletar" onclick="deletarItem('${item.id}')">🗑️ Deletar</button>
    </div>` : "";

  card.innerHTML = `
    <img src="${item.imagem}" alt="${item.titulo}">
    <div class="card-body">
      <span class="categoria">${item.categoria} · ${item.tipo === "serie" ? "Série" : "Filme"}</span>
      <h2>${item.titulo}</h2>
      <p>${item.descricaoCurta}</p>
      <div class="card-footer">
        <span class="nota">⭐ ${item.nota}</span>
        <button class="btn-favorito" data-id="${item.id}" onclick="toggleFavorito('${item.id}', this)">${isFav ? "❤️" : "🤍"}</button>
        <a href="details.html?id=${item.id}">Ver detalhes →</a>
      </div>
      ${adminBtns}
    </div>
  `;

  return card;
}

function renderCards(itens) {
  const container = document.getElementById("cards-lista");
  container.innerHTML = "";

  if (!itens || itens.length === 0) {
    showMessage("Nenhum item encontrado.");
    return;
  }

  showMessage("");
  itens.forEach(item => container.appendChild(createCard(item)));
}

function showMessage(text) {
  const el = document.getElementById("message");
  if (el) el.textContent = text;
}

// ---- Pesquisa ----
function pesquisar() {
  const termo = document.getElementById("input-pesquisa").value.trim().toLowerCase();
  if (!termo) { renderCards(todosItens); return; }

  const filtrados = todosItens.filter(i =>
    i.titulo.toLowerCase().includes(termo) ||
    (i.descricaoCurta && i.descricaoCurta.toLowerCase().includes(termo))
  );
  renderCards(filtrados);
}

function limparPesquisa() {
  document.getElementById("input-pesquisa").value = "";
  renderCards(todosItens);
}

// pesquisa ao digitar Enter
document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("input-pesquisa");
  if (input) input.addEventListener("keydown", e => { if (e.key === "Enter") pesquisar(); });
});

// ---- Deletar ----
async function deletarItem(id) {
  if (!confirm("Tem certeza que deseja deletar este item?")) return;
  try {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    todosItens = await fetchItems();
    renderCarrossel(todosItens);
    renderCards(todosItens);
  } catch (e) {
    showMessage("Erro ao deletar.");
  }
}

// ---- Init ----
async function init() {
  showMessage("Carregando...");
  try {
    todosItens = await fetchItems();
    renderCarrossel(todosItens);
    renderCards(todosItens);
  } catch (error) {
    showMessage("Erro ao carregar. Verifique se o JSON Server está rodando.");
    console.error(error);
  }
}

// ---- Favoritos ----
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

function toggleFavorito(itemId, btn) {
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
  } else {
    favs.splice(idx, 1);
    btn.textContent = "🤍";
  }
  setFavoritos(usuario.id, favs);
}

init();