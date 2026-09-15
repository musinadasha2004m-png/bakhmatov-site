/*
 * Простая клиентская защита раздела марафона.
 *
 * ВАЖНО: это НЕ настоящая авторизация. Пароль лежит прямо в этом файле,
 * то есть любой, кто откроет исходный код страницы, сможет его увидеть.
 * Такой вариант подходит только как временная заглушка — чтобы случайный
 * посетитель не наткнулся на материалы марафона по прямой ссылке.
 * Когда будет готова настоящая регистрация/оплата — этот файл нужно
 * заменить на реальную проверку на сервере.
 *
 * Чтобы сменить пароль — поменяй значение MARATHON_PASSWORD ниже.
 */

const MARATHON_PASSWORD = "marathon30";
const AUTH_STORAGE_KEY = "bakhmatov_marathon_auth";

function isAuthenticated() {
  try {
    return localStorage.getItem(AUTH_STORAGE_KEY) === "yes";
  } catch (e) {
    return false;
  }
}

function setAuthenticated() {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, "yes");
  } catch (e) {
    /* localStorage недоступен (приватный режим и т.п.) — ничего страшного,
       просто защита не запомнится между визитами */
  }
}

function logout() {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch (e) {}
  window.location.href = "login.html";
}

// Вызывать в начале защищённых страниц (marathon.html, day.html)
function requireAuth() {
  if (!isAuthenticated()) {
    const next = encodeURIComponent(window.location.pathname.split("/").pop() + window.location.search);
    window.location.href = "login.html?next=" + next;
  }
}

// Обработчик формы на login.html
function handleLoginSubmit(event) {
  event.preventDefault();
  const input = document.getElementById("password");
  const errorEl = document.getElementById("auth-error");
  if (input.value.trim() === MARATHON_PASSWORD) {
    setAuthenticated();
    const params = new URLSearchParams(window.location.search);
    const next = params.get("next") || "marathon.html";
    window.location.href = next;
  } else {
    errorEl.textContent = "Неверный пароль. Проверь, что писал(а) Сергей, и попробуй ещё раз.";
    input.focus();
    input.select();
  }
  return false;
}
