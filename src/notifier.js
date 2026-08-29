const { execFile } = require("child_process");
const logger = require("./logger");

function psEscape(value) {
  return String(value).replace(/'/g, "''");
}

function alert(title, message) {
  const script = `Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.MessageBox]::Show('${psEscape(message)}','${psEscape(title)}')`;
  execFile("powershell", ["-NoProfile", "-Command", script], (err) => {
    if (err) logger.warn(`PowerShell alert failed: ${err.message}`);
  });
}

module.exports = { alert };
