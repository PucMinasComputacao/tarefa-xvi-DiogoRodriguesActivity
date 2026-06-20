const API_URL = "http://localhost:3000/catalogo";

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

function showMessage(text) {
  document.getElementById("message").textContent = text;
}

function getFormData() {
  const titulo = document.getElementById("titulo").value.trim();
  const tipo = document.getElementById("tipo").value;
  const categoria = document.getElementById("categoria").value.trim();
  const nota = parseFloat(document.getElementById("nota").value);
  const descricaoCurta = document.getElementById("descricaoCurta").value.trim();
  const descricaoCompleta = document.getElementById("descricaoCompleta").value.trim();
  const imagem = document.getElementById("imagem").value.trim();
  const tagsRaw = document.getElementById("tags").value.trim();
  const tags = tagsRaw ? tagsRaw.split(",").map(t => t.trim()) : [];

  return { titulo, tipo, categoria, nota, descricaoCurta, descricaoCompleta, imagem, tags };
}

function validate(data) {
  if (!data.titulo) return "Título é obrigatório.";
  if (!data.categoria) return "Categoria é obrigatória.";
  if (isNaN(data.nota) || data.nota < 0 || data.nota > 10) return "Nota deve ser entre 0 e 10.";
  if (!data.descricaoCurta) return "Descrição curta é obrigatória.";
  return null;
}

async function carregarItem() {
  if (!id) return;

  document.getElementById("titulo-pagina").textContent = "✏️ Editar Item";

  const response = await fetch(`${API_URL}/${id}`);
  const item = await response.json();

  document.getElementById("titulo").value = item.titulo;
  document.getElementById("tipo").value = item.tipo;
  document.getElementById("categoria").value = item.categoria;
  document.getElementById("nota").value = item.nota;
  document.getElementById("descricaoCurta").value = item.descricaoCurta;
  document.getElementById("descricaoCompleta").value = item.descricaoCompleta;
  document.getElementById("imagem").value = item.imagem;
  document.getElementById("tags").value = item.tags ? item.tags.join(", ") : "";
}

async function salvar() {
  const data = getFormData();
  const erro = validate(data);
  if (erro) { showMessage(erro); return; }

  showMessage("");

  try {
    if (id) {
      // PUT — editar
      await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
    } else {
      // POST — criar
      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
    }

    window.location.href = "../index.html";
  } catch (e) {
    showMessage("Erro ao salvar. Verifique se o JSON Server está rodando.");
  }
}

document.getElementById("btn-salvar").addEventListener("click", salvar);

carregarItem();