
// =========================
// Configuración
// =========================

// Endpoint relativo para Azure Static Web Apps
const ENDPOINT = "/api/HttpTrigger";

// =========================
// Utilidades de depuración
// =========================
function logDebug(msg) {
  const pre = document.getElementById("debug");
  if (!pre) return;
  const text = typeof msg === "string" ? msg : JSON.stringify(msg, null, 2);
  pre.textContent += (pre.textContent ? "\n" : "") + text;
}

// =========================
// Inicio: detectar Outlook
// =========================
const isOutlook = !!(window.Office);

if (isOutlook) {
  Office.onReady(async () => {
    // Asegura que existan las categorías en la lista maestra (una vez por buzón)
    await ensureMasterCategories();

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

// =========================
// Categorías (lista maestra)
// =========================

/**
 * Crea las categorías en la lista maestra si no existen.
 * Requiere ReadWriteMailbox en el manifiesto.
 * Docs: Get and set categories (Office.js) – requirement set 1.8
 * https://learn.microsoft.com/office/dev/add-ins/outlook/categories
 */
async function ensureMasterCategories() {
  return new Promise((resolve) => {
    const desired = [
      { displayName: "Válido",     color: Office.MailboxEnums.CategoryColor.Preset3 },  // verde
      { displayName: "Sospechoso", color: Office.MailboxEnums.CategoryColor.Preset4 },  // naranja
      { displayName: "Phishing",   color: Office.MailboxEnums.CategoryColor.Preset10 }  // rojo
    ];

    Office.context.mailbox.masterCategories.getAsync((getRes) => {
      if (getRes.status !== Office.AsyncResultStatus.Succeeded) {
        logDebug(["⚠️ No se pudo obtener lista maestra de categorías", getRes.error]);
        return resolve(false);
      }

      const have = (getRes.value || []).map(c => c.displayName);
      const toAdd = desired.filter(c => !have.includes(c.displayName));

      if (toAdd.length === 0) {
        logDebug("ℹ️ Categorías maestra ya contiene Válido/Sospechoso/Phishing.");
        return resolve(true);
      }

      Office.context.mailbox.masterCategories.addAsync(toAdd, (addRes) => {
        if (addRes.status === Office.AsyncResultStatus.Succeeded) {
          logDebug("✅ Categorías añadidas a la lista maestra.");
          resolve(true);
        } else {
          logDebug(["❌ No se pudieron añadir categorías maestra", addRes.error]);
          resolve(false);
        }
      });
    });
  });
}

/**
 * Aplica la categoría al ítem actual (mensaje abierto/seleccionado).
 * Docs: Office.Categories.addAsync (Mailbox 1.8)
 * https://learn.microsoft.com/javascript/api/outlook/office.categories
 */
async function tagCurrentItemCategory(categoryName) {
  return new Promise((resolve) => {
    const item = Office?.context?.mailbox?.item;
    if (!item || !categoryName) return resolve(false);

    item.categories.addAsync([categoryName], (res) => {
      if (res.status === Office.AsyncResultStatus.Succeeded) {
        resolve(true);
      } else {
        logDebug(["⚠️ Fallo al aplicar categoría", categoryName, res.error]);
        resolve(false);
      }
    });
  });
}

// =========================
// Lectura del ítem actual
// =========================
async function analyzeCurrentMail() {
  try {
    const item = Office?.context?.mailbox?.item;
    if (!item) {
      showVerdictBanner("phishing", "No hay correo activo.");
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
    showVerdictBanner("phishing", "Fallo al analizar el correo.");
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

// =========================
/* Llamada a tu API y aplicación de categoría */
// =========================
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
      showVerdictBanner("phishing", `Error API: ${res.status}`);
      return;
    }

    const data = await res.json();
    logDebug(["📥 Respuesta API:", data]);

    // Mapeo flexible (por si tu API devuelve "verdict" o "status")
    const verdictRaw = data.verdict ?? data.status ?? "";
    const message = data.message ?? `Veredicto: ${verdictRaw}`;

    // Banner en taskpane
    showVerdictBanner(verdictRaw, message);

    // Categoría visible en la LISTA de Outlook
    const category = mapVerdictToCategory(verdictRaw);
    if (category) {
      const ok = await tagCurrentItemCategory(category);
      logDebug(ok ? `🏷️ Categoría aplicada: ${category}` : `⚠️ No se pudo aplicar categoría: ${category}`);
    } else {
      logDebug(["ℹ️ Veredicto no reconocido para categoría:", verdictRaw]);
    }
  } catch (e) {
    logDebug(["❌ Error llamando a API", e]);
    showVerdictBanner("phishing", "No se pudo contactar la API.");
  }
}

function mapVerdictToCategory(verdictRaw) {
  const v = (verdictRaw || "").toLowerCase();
  if (["valido", "válido", "valid", "ok"].includes(v)) return "Válido";
  if (["sospechoso", "suspicious", "warning"].includes(v)) return "Sospechoso";
  if (["phishing", "phish", "error"].includes(v)) return "Phishing";
  return null;
}

// =========================
// Banner unificado
// =========================
function showVerdictBanner(verdict, message) {
  const banner = document.getElementById("banner");
  if (!banner) return;
  const k = (verdict || "").toLowerCase();

  const cls =
    ["valido", "válido", "valid", "ok"].includes(k) ? "valido" :
    ["sospechoso", "suspicious", "warning"].includes(k) ? "sospechoso" :
    ["phishing", "phish", "error"].includes(k) ? "phishing" :
    "sospechoso";

  banner.className = `banner ${cls}`;
  banner.textContent = message;
  banner.classList.remove("hidden");
}



