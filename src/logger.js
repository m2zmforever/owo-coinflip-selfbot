const COLORS = {
  info: "\x1b[36m",
  warn: "\x1b[33m",
  error: "\x1b[31m",
  success: "\x1b[32m",
  reset: "\x1b[0m",
};

function emit(level, message) {
  const color = COLORS[level] || COLORS.info;
  const time = new Date().toISOString().slice(11, 19);
  console.log(`${color}[${time}] [${level.toUpperCase()}]${COLORS.reset} ${message}`);
}

module.exports = {
  info: (message) => emit("info", message),
  warn: (message) => emit("warn", message),
  error: (message) => emit("error", message),
  success: (message) => emit("success", message),
};
