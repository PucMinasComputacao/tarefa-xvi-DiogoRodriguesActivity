const LOGIN_PAGE = "login/index.html";

function getUsuarioCorrente() {
  const dados = sessionStorage.getItem("usuarioCorrente");
  return dados ? JSON.parse(dados) : null;
}

function logoutUser() {
  sessionStorage.removeItem("usuarioCorrente");
  window.location.href = LOGIN_PAGE;
}

async function loginUser(login, senha) {
  const response = await fetch("http://localhost:3000/usuarios");
  const usuarios = await response.json();
  const usuario = usuarios.find(u => u.login === login && u.senha === senha);
  if (!usuario) return null;
  sessionStorage.setItem("usuarioCorrente", JSON.stringify(usuario));
  return usuario;
}

function initLoginApp() {
  const usuario = getUsuarioCorrente();
  const areaLogin = document.getElementById("area-login");
  if (!areaLogin) return;

  if (!usuario) {
    areaLogin.innerHTML = `<a href="${LOGIN_PAGE}" class="text-white text-decoration-none">Entrar</a>`;
  } else {
    areaLogin.innerHTML = `
      <span class="text-white me-2">Olá, ${usuario.nome}</span>
      <a href="#" onclick="logoutUser()" class="text-white text-decoration-none">| Sair</a>
    `;
  }
}