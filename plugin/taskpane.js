
// Endpoint relativo para Azure Static Web Apps
const ENDPOINT = "/api/HttpTrigger";

// Log en <pre id="debug">
function logDebug(msg) {
  const pre = document.getElementById("debug");
  if (!pre) return;
  const text = typeof msg === "string" ? msg : JSON.stringify(msg, null, 2);
  pre.textContent += (pre.textContent ? "\n" : "") + text;
}

// Detecta si estamos en Outlook
const isOutlook = !!(window.Office);

if (isOutlook) {
  Office.onReady(() => {
    const btn = document.getElementById("analyzeBtn");
    if (!btn) {
      logDebug("❌ No se encontró el botón.");
      return;
    }
    btn.addEventListener("click", analyzeCurrentMail);
    logDebug("✅ Complemento listo en Outlook.");
  });
} else {
  // Modo demo fuera de Outlook
  window.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("analyzeBtn");
    if (!btn) return;
    btn.addEventListener("click", async () => {
      const payload = {
        subject: "Correo sospechoso",
        from: "phishing@fake.com",
        body: "Haz clic aquí para verificar tu cuenta: http://fake-login.com",
      };
      logDebug(["🧪 DEMO: payload:", payload]);
      await callApi(payload);
    });
    logDebug("🧪 Modo demo activo (fuera de Outlook).");
  });
}

async function analyzeCurrentMail() {
  try {
    const item = Office?.context?.mailbox?.item;
    if (!item) {
      showBanner("error", "No hay correo activo.");
      logDebug("❌ Office.context.mailbox.item no disponible.");
      return;
    }

    const subject = item.subject || "";
    const from = (item.from && item.from.emailAddress) || "";
    const body = await getBodyText(item);

    const payload = { subject, from, body };
    logDebug(["📤 Enviando payload:", payload]);

    await callApi(payload);
  } catch (e) {
    logDebug(["❌ Error en analyzeCurrentMail", e]);
    showBanner("error", "Fallo al analizar el correo.");
  }
}

async function callApi(payload) {
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      logDebug(["❌ Respuesta HTTP no OK", res.status, text]);
      showBanner("error", `Error API: ${res.status}`);
      return;
    }

    const data = await res.json();
    logDebug(["📥 Respuesta API:", data]);
    showBanner(data.status || "ok", data.message || "Análisis completado.");
  } catch (e) {
    logDebug(["❌ Error llamando a API", e]);
    showBanner("error", "No se pudo contactar la API.");
  }
}

function getBodyText(item) {
  return new Promise((resolve, reject) => {
    item.body.getAsync(Office.CoercionType.Text, (result) => {
      if (result.status === Office.AsyncResultStatus.Succeeded) resolve(result.value);
      else reject(result.error);
    });
  });
}

function showBanner(status, message) {
  const banner = document.getElementById("banner");
  if (!banner) return;
  banner.className = `banner ${status}`;
  banner.textContent = message;
  banner.classList.remove("hidden");
}



