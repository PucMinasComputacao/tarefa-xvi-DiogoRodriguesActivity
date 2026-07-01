const LOGIN_PAGE = "modulos/login/index.html";
const LOGIN_PAGE_REL2 = "../../modulos/login/index.html"; // para páginas em modulos/login/

function getUsuarioCorrente() {
  const dados = sessionStorage.getItem("usuarioCorrente");
  return dados ? JSON.parse(dados) : null;
}

function logoutUser() {
  sessionStorage.removeItem("usuarioCorrente");
  // redireciona para a raiz independente de onde estiver
  const depth = window.location.pathname.split("/").filter(Boolean).length;
  const prefix = depth > 2 ? "../../" : depth > 1 ? "../" : "";
  window.location.href = prefix + "modulos/login/index.html";
}

async function loginUser(login, senha) {
  const response = await fetch("http://localhost:3000/usuarios");
  const usuarios = await response.json();
  const usuario = usuarios.find(u => u.login === login && u.senha === senha);
  if (!usuario) return null;
  sessionStorage.setItem("usuarioCorrente", JSON.stringify(usuario));
  return usuario;
}

async function cadastrarUsuario(nome, login, email, senha) {
  // verifica se login já existe
  const response = await fetch("http://localhost:3000/usuarios");
  const usuarios = await response.json();
  if (usuarios.find(u => u.login === login)) return { erro: "Login já cadastrado." };

  const novoUsuario = { nome, login, email, senha, admin: false };
  const res = await fetch("http://localhost:3000/usuarios", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(novoUsuario)
  });
  const criado = await res.json();
  sessionStorage.setItem("usuarioCorrente", JSON.stringify(criado));
  return { usuario: criado };
}

function initLoginApp() {
  const usuario = getUsuarioCorrente();
  const areaLogin = document.getElementById("area-login");
  if (!areaLogin) return;

  // calcula prefixo de path relativo
  const depth = window.location.pathname.split("/").filter(p => p && p.includes(".html") === false).length;
  const isInModulos = window.location.pathname.includes("/modulos/");
  const loginHref = isInModulos ? "login/index.html" : "modulos/login/index.html";
  const cadastroHref = isInModulos ? "../modulos/form.html" : "modulos/form.html";
  const favoritosHref = isInModulos ? "favorito.html" : "modulos/favorito.html";

  // menu Cadastro (só admin)
  const menuCadastro = document.getElementById("menu-cadastro");
  const menuFavoritos = document.getElementById("menu-favoritos");

  if (!usuario) {
    areaLogin.innerHTML = `<a href="${loginHref}" class="text-white text-decoration-none">Entrar</a>`;
    if (menuCadastro) menuCadastro.style.display = "none";
    if (menuFavoritos) menuFavoritos.style.display = "none";
  } else {
    areaLogin.innerHTML = `
      <span class="text-white me-2">Olá, ${usuario.nome}</span>
      <a href="#" onclick="logoutUser()" class="text-white text-decoration-none">| Sair</a>
    `;
    if (menuFavoritos) menuFavoritos.style.display = "inline";
    if (menuCadastro) {
      menuCadastro.style.display = usuario.admin ? "inline" : "none";
    }
  }
}