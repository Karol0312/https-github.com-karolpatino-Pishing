
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

function showBanner(status, message) {
  const banner = document.getElementById("banner");
  banner.className = `banner ${status}`;
  banner.textContent = message;
}

