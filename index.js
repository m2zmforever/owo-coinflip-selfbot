const { loadConfig } = require("./src/config");
const Bot = require("./src/bot");
const logger = require("./src/logger");

function main() {
  let config;
  try {
    config = loadConfig();
  } catch (err) {
    logger.error(err.message);
    process.exit(1);
  }

  const bot = new Bot(config);
  bot.start();
}

main();
