// URL base del backend (ajusta si hace falta)
const API_BASE = "http://localhost:4000";

// ELEMENTOS DOM --------------------------------------------

const loginScreen = document.getElementById("login-screen");
const appScreen = document.getElementById("app-screen");

const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("login-btn");
const loginError = document.getElementById("login-error");
const userPill = document.getElementById("user-pill");

const promptInput = document.getElementById("prompt");
const modeSelect = document.getElementById("mode-select");
const sendBtn = document.getElementById("send-btn");
const promptError = document.getElementById("prompt-error");

const quickText = document.getElementById("quick-text");
const expandedText = document.getElementById("expanded-text");
const deepHintText = document.getElementById("deep-hint-text");
const metaList = document.getElementById("meta-list");

const logoutBtn = document.getElementById("logout-btn");

// ESTADO ---------------------------------------------------

let authToken = null;
let currentUser = null;

// HELPERS --------------------------------------------------

function setScreen(screen) {
  if (screen === "login") {
    loginScreen.classList.add("active");
    appScreen.classList.remove("active");
  } else {
    loginScreen.classList.remove("active");
    appScreen.classList.add("active");
  }
}

function setLoading(button, isLoading) {
  if (isLoading) {
    button.dataset.originalText = button.textContent;
    button.textContent = "Cargando...";
    button.disabled = true;
  } else {
    button.textContent = button.dataset.originalText || "Enviar";
    button.disabled = false;
  }
}

// LOGIN ----------------------------------------------------

loginBtn.onclick = async () => {
  loginError.textContent = "";

  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  if (!username || !password) {
    loginError.textContent = "Rellena usuario y contraseña.";
    return;
  }

  try {
    setLoading(loginBtn, true);

    // Más adelante: backend real. De momento, demo local:
    // Simulación: si password === "orbit", login ok sin backend.
    if (password === "orbit") {
      authToken = "demo-token";
      currentUser = { username };
    } else {
      // Si ya tienes backend, descomenta esto y elimina el bloque de arriba.
      /*
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Error de login");
      }

      const data = await res.json();
      authToken = data.token;
      currentUser = data.user;
      */
      throw new Error("Contraseña incorrecta (demo: usa 'orbit').");
    }

    userPill.textContent = currentUser.username;
    setScreen("app");
  } catch (err) {
    loginError.textContent = err.message || "Error al iniciar sesión.";
  } finally {
    setLoading(loginBtn, false);
  }
};

// LOGOUT ---------------------------------------------------

logoutBtn.onclick = () => {
  authToken = null;
  currentUser = null;
  usernameInput.value = "";
  passwordInput.value = "";
  setScreen("login");
};

// CHAT / PROMPT --------------------------------------------

sendBtn.onclick = async () => {
  promptError.textContent = "";
  const prompt = promptInput.value.trim();
  const modeOverride = modeSelect.value || null;

  if (!prompt) {
    promptError.textContent = "Escribe algo para tu agente.";
    return;
  }

  try {
    setLoading(sendBtn, true);

    // Si ya tienes backend, usa esto:
    /*
    const res = await fetch(`${API_BASE}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
      },
      body: JSON.stringify({
        prompt,
        modeOverride,
        userId: currentUser?.id
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Error al generar respuesta.");
    }

    const data = await res.json();
    */

    // De momento, simulamos respuesta local para que el frontend funcione solo:
    const data = fakeLocalAgent(prompt, modeOverride);

    renderResponse(data);
  } catch (err) {
    promptError.textContent = err.message || "Error al hablar con el agente.";
  } finally {
    setLoading(sendBtn, false);
  }
};

// RENDER ---------------------------------------------------

function renderResponse(data) {
  quickText.textContent = data.quick || "";
  expandedText.textContent = data.expanded || "";
  deepHintText.textContent = data.deepDiveHint || "";

  metaList.innerHTML = "";
  if (data.meta) {
    const items = [
      `Modo: ${data.mode}`,
      `Intent: ${data.meta.detectedIntent}`,
      `Confianza: ${Math.round((data.meta.confidence || 0) * 100)}%`
    ];

    (data.meta.suggestions || []).forEach(s => items.push(s));

    items.forEach(text => {
      const li = document.createElement("li");
      li.textContent = text;
      metaList.appendChild(li);
    });
  }
}

// AGENTE LOCAL FAKE (mientras no haya backend) -------------
// Aquí puedes ir probando ideas de tu agente propio en frontend.
// Luego moveremos esta lógica al backend/ai/nyxEngine.js.

function fakeLocalAgent(prompt, modeOverride) {
  const p = prompt.toLowerCase();
  let mode = modeOverride || "chat";

  if (!modeOverride) {
    if (p.includes("code") || p.includes("bug") || p.includes("api")) mode = "developer";
    else if (p.includes("explica") || p.includes("explain") || p.includes("teach")) mode = "teacher";
    else if (p.includes("historia") || p.includes("story") || p.includes("phonk")) mode = "creative";
    else if (p.includes("compara") || p.includes("compare")) mode = "analyst";
  }

  let intent = "general";
  if (mode === "developer" && p.includes("login")) intent = "build_auth_system";
  if (mode === "creative" && p.includes("phonk")) intent = "phonk_concept";

  const quick = `Modo: ${mode}. Estoy leyendo tu intención como: ${intent}.`;
  const expanded = [
    `Prompt: "${prompt}"`,
    ``,
    `Lectura rápida:`,
    `- Modo: ${mode}`,
    `- Intent: ${intent}`,
    ``,
    `Aquí es donde tu agente puede ir creciendo:`,
    `- patrones propios`,
    `- plantillas`,
    `- tono personalizado`,
    `- memoria por usuario (cuando tengamos backend + DB)`
  ].join("\n");

  return {
    mode,
    quick,
    expanded,
    deepDiveHint: `Dime "ve más profundo" y lo convierto en un mini-plan.`,
    meta: {
      detectedIntent: intent,
      confidence: 0.8,
      suggestions: [
        "Pídeme un plan paso a paso.",
        "Pídeme 3 variaciones con restricciones distintas.",
        mode === "developer"
          ? "Pídeme un esquema de arquitectura."
          : "Pídeme una versión más creativa."
      ]
    }
  };
}
