const API_URL = "http://localhost:3000/catalogo";

// verifica se é admin
window.addEventListener("DOMContentLoaded", () => {
  const dados = sessionStorage.getItem("usuarioCorrente");
  if (!dados) { window.location.href = "../modulos/login/index.html"; return; }
  const usuario = JSON.parse(dados);
  if (!usuario.admin) {
    alert("Acesso restrito a administradores.");
    window.location.href = "../index.html";
  }
  carregarTabela();

  // se veio com ?id= na URL, carrega para edição
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  if (id) carregarParaEdicao(id);
});

function showMessage(text, cor = "danger") {
  const el = document.getElementById("message");
  el.textContent = text;
  el.className = `text-${cor} mb-3`;
}

function getFormData() {
  return {
    titulo: document.getElementById("titulo").value.trim(),
    tipo: document.getElementById("tipo").value,
    categoria: document.getElementById("categoria").value.trim(),
    nota: parseFloat(document.getElementById("nota").value),
    descricaoCurta: document.getElementById("descricaoCurta").value.trim(),
    descricaoCompleta: document.getElementById("descricaoCompleta").value.trim(),
    imagem: document.getElementById("imagem").value.trim(),
    destaque: document.getElementById("destaque").value === "true",
    tags: document.getElementById("tags").value.trim()
      ? document.getElementById("tags").value.split(",").map(t => t.trim())
      : []
  };
}

function validate(data) {
  if (!data.titulo) return "Título é obrigatório.";
  if (!data.categoria) return "Categoria é obrigatória.";
  if (isNaN(data.nota) || data.nota < 0 || data.nota > 10) return "Nota deve ser entre 0 e 10.";
  if (!data.descricaoCurta) return "Descrição curta é obrigatória.";
  return null;
}

async function salvar(metodo) {
  const data = getFormData();
  const erro = validate(data);
  if (erro) { showMessage(erro); return; }

  const id = document.getElementById("item-id").value;
  const url = metodo === "PUT" ? `${API_URL}/${id}` : API_URL;

  try {
    await fetch(url, {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    showMessage(metodo === "PUT" ? "Item alterado com sucesso!" : "Item inserido com sucesso!", "success");
    limparForm();
    carregarTabela();
  } catch (e) {
    showMessage("Erro ao salvar. Verifique se o JSON Server está rodando.");
  }
}

async function excluir() {
  const id = document.getElementById("item-id").value;
  if (!id) { showMessage("Selecione um item para excluir."); return; }
  if (!confirm("Tem certeza que deseja excluir este item?")) return;

  try {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    showMessage("Item excluído com sucesso!", "success");
    limparForm();
    carregarTabela();
  } catch (e) {
    showMessage("Erro ao excluir.");
  }
}

function limparForm() {
  document.getElementById("item-id").value = "";
  ["titulo", "categoria", "nota", "descricaoCurta", "descricaoCompleta", "imagem", "tags"].forEach(id => {
    document.getElementById(id).value = "";
  });
  document.getElementById("tipo").value = "filme";
  document.getElementById("destaque").value = "false";
  document.getElementById("btn-alterar").disabled = true;
  document.getElementById("btn-excluir").disabled = true;
  document.getElementById("btn-inserir").disabled = false;
  document.getElementById("form-titulo").textContent = "Inserir novo item";
  showMessage("");
}

function preencherForm(item) {
  document.getElementById("item-id").value = item.id;
  document.getElementById("titulo").value = item.titulo || "";
  document.getElementById("tipo").value = item.tipo || "filme";
  document.getElementById("categoria").value = item.categoria || "";
  document.getElementById("nota").value = item.nota || "";
  document.getElementById("descricaoCurta").value = item.descricaoCurta || "";
  document.getElementById("descricaoCompleta").value = item.descricaoCompleta || "";
  document.getElementById("imagem").value = item.imagem || "";
  document.getElementById("destaque").value = item.destaque ? "true" : "false";
  document.getElementById("tags").value = item.tags ? item.tags.join(", ") : "";
  document.getElementById("btn-alterar").disabled = false;
  document.getElementById("btn-excluir").disabled = false;
  document.getElementById("btn-inserir").disabled = true;
  document.getElementById("form-titulo").textContent = `✏️ Editando: ${item.titulo}`;
}

async function carregarParaEdicao(id) {
  const res = await fetch(`${API_URL}/${id}`);
  const item = await res.json();
  preencherForm(item);
}

async function carregarTabela() {
  const tbody = document.getElementById("tabela-itens");
  try {
    const res = await fetch(API_URL);
    const itens = await res.json();

    if (!itens.length) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center text-secondary">Nenhum item cadastrado.</td></tr>`;
      return;
    }

    tbody.innerHTML = itens.map(item => `
      <tr style="cursor:pointer" onclick="preencherForm(${JSON.stringify(item).replace(/"/g, '&quot;')})">
        <td>${item.id}</td>
        <td>${item.titulo}</td>
        <td>${item.tipo === "serie" ? "Série" : "Filme"}</td>
        <td>${item.nota}</td>
        <td>
          <button class="btn btn-sm btn-outline-warning me-1"
            onclick="event.stopPropagation(); preencherForm(${JSON.stringify(item).replace(/"/g, '&quot;')})">✏️</button>
          <button class="btn btn-sm btn-outline-danger"
            onclick="event.stopPropagation(); deletarDaTabela('${item.id}')">🗑️</button>
        </td>
      </tr>
    `).join("");
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-danger text-center">Erro ao carregar itens.</td></tr>`;
  }
}

async function deletarDaTabela(id) {
  if (!confirm("Excluir este item?")) return;
  await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  if (document.getElementById("item-id").value === id) limparForm();
  carregarTabela();
  showMessage("Item excluído!", "success");
}