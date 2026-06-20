const API_URL = "http://localhost:3000/catalogo";

async function fetchItems() {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error("Erro ao buscar dados.");
  return await response.json();
}

function createCard(item) {
  const card = document.createElement("div");
  card.className = "filme-card";

  card.innerHTML = `
    <img src="${item.imagem}" alt="${item.titulo}">
    <div class="card-body">
      <span class="categoria">${item.categoria} · ${item.tipo === "serie" ? "Série" : "Filme"}</span>
      <h2>${item.titulo}</h2>
      <p>${item.descricaoCurta}</p>
      <div class="card-footer">
        <span class="nota">⭐ ${item.nota}</span>
        <button class="btn-favorito" data-id="${item.id}" onclick="toggleFavorito(${item.id}, this)">🤍</button>
        <a href="details.html?id=${item.id}">Ver detalhes →</a>
      </div>
      <div class="card-actions">
        <a href="modulos/form.html?id=${item.id}" class="btn-acao btn-editar">✏️ Editar</a>
        <button class="btn-acao btn-deletar" onclick="deletarItem(${item.id})">🗑️ Deletar</button>
      </div>
    </div>
  `;

  return card;
}

function renderCards(items) {
  const container = document.getElementById("cards-lista");
  container.innerHTML = "";

  if (!items || items.length === 0) {
    showMessage("Nenhum item encontrado.");
    return;
  }

  showMessage("");
  items.forEach(item => container.appendChild(createCard(item)));
  marcarFavoritosNosCards();
}

function showMessage(text) {
  document.getElementById("message").textContent = text;
}

async function deletarItem(id) {
  if (!confirm("Tem certeza que deseja deletar este item?")) return;

  try {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    const items = await fetchItems();
    renderCards(items);
  } catch (e) {
    showMessage("Erro ao deletar.");
  }
}

async function init() {
  showMessage("Carregando...");
  try {
    const items = await fetchItems();
    renderCards(items);
  } catch (error) {
    showMessage("Erro ao carregar. Json não está ativado.");
    console.error(error);
  }
}

// ---- Favoritos ----

function getFavoritos(usuarioId) {
  const dados = localStorage.getItem(`favoritos_${usuarioId}`);
  return dados ? JSON.parse(dados) : [];
}

function setFavoritos(usuarioId, lista) {
  localStorage.setItem(`favoritos_${usuarioId}`, JSON.stringify(lista));
}

function marcarFavoritosNosCards() {
  const dados = sessionStorage.getItem("usuarioCorrente");
  if (!dados) return;
  const usuario = JSON.parse(dados);
  const favs = getFavoritos(usuario.id);
  document.querySelectorAll(".btn-favorito").forEach(btn => {
    const id = parseInt(btn.dataset.id);
    btn.textContent = favs.includes(id) ? "❤️" : "🤍";
  });
}

function toggleFavorito(itemId, btn) {
  const dados = sessionStorage.getItem("usuarioCorrente");
  if (!dados) {
    alert("Você precisa estar logado para favoritar.");
    window.location.href = "/modulos/login/index.html";
    return;
  }
  const usuario = JSON.parse(dados);
  const favs = getFavoritos(usuario.id);
  const idx = favs.indexOf(itemId);
  if (idx === -1) {
    favs.push(itemId);
    btn.textContent = "❤️";
  } else {
    favs.splice(idx, 1);
    btn.textContent = "🤍";
  }
  setFavoritos(usuario.id, favs);
}

init();