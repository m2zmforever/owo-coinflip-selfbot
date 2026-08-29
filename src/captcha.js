const ZERO_WIDTH = new RegExp("[\\u200B\\u200C\\u200D\\uFEFF]", "g");

function normalize(text) {
  return String(text || "").replace(ZERO_WIDTH, "");
}

function getCaptchaUrl(message) {
  const rows = message.components;
  if (!Array.isArray(rows)) return null;
  for (const row of rows) {
    if (!Array.isArray(row.components)) continue;
    for (const component of row.components) {
      if (typeof component.url === "string" && component.url.toLowerCase().includes("captcha")) {
        return component.url;
      }
    }
  }
  return null;
}

function isCaptchaRequest(message) {
  const norm = normalize(message.content).toLowerCase();
  if (norm.includes("real human") || norm.includes("captcha")) return true;
  if (getCaptchaUrl(message)) return true;
  return false;
}

function isCaptchaSolved(message) {
  const norm = normalize(message.content).toLowerCase();
  return norm.includes("verified that you are human");
}

module.exports = { isCaptchaRequest, isCaptchaSolved, getCaptchaUrl };
