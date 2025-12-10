
const ENDPOINT = "http://127.0.0.1:7071/api/HttpTrigger"; // Ajusta si tu API usa otro host

Office.onReady(() => {
  document.getElementById("analyzeBtn").addEventListener("click", analyzeCurrentMail);
});

async function analyzeCurrentMail() {
  const item = Office.context.mailbox.item;
  const subject = item.subject || "";
  const from = (item.from && item.from.emailAddress) || "";
  const body = await getBodyText(item);

  const payload = { subject, from, body };

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  showBanner(data.status, data.message);
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
  banner.className = `banner ${status}`;
  banner.textContent = message;
  banner.classList.remove("hidden");
}



