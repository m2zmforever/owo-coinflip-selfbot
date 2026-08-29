const fs = require("fs");
const path = require("path");

const CONFIG_PATH = path.join(__dirname, "..", "config.json");

const { STRATEGIES } = require("./strategy");

const DEFAULTS = {
  owoId: "408785106942164992",
  guess: "h",
  delayMs: 3000,
  delayOptions: [14000, 21000],
  strategy: "fixed",
  fixed_strat_Bet: 2000,
  martingale_strat_base_Bet: 2000,
  martingale_strat_max_Bet: 12000,
  loss_switch_strat_Bet: 2000,
  randomGuess: true,
  randomFlipCommands: true,
};

const FLOOR = 1000;

const REQUIRED = ["token", "channelId"];

function loadConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {
    throw new Error("config.json not found. Copy config.json.example and fill it in.");
  }

  const raw = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
  const missing = REQUIRED.filter((key) => !raw[key]);
  if (missing.length > 0) {
    throw new Error(`config.json missing field(s): ${missing.join(", ")}`);
  }

  const strategy = String(raw.strategy || DEFAULTS.strategy).toLowerCase();
  if (!STRATEGIES.includes(strategy)) {
    throw new Error(`Invalid strategy: ${strategy}. Use ${STRATEGIES.join(", ")}.`);
  }

  const guess = String(raw.guess || DEFAULTS.guess).toLowerCase();
  const randomGuess = raw.randomGuess === undefined ? DEFAULTS.randomGuess : Boolean(raw.randomGuess);
  const owoId = String(raw.owoId || DEFAULTS.owoId);
  const owodmId = raw.owodmId ? String(raw.owodmId) : null;

  const randomFlipCommands = raw.randomFlipCommands === undefined
    ? DEFAULTS.randomFlipCommands
    : Boolean(raw.randomFlipCommands);

  let delayOptions = null;
  if (Array.isArray(raw.delayOptions) && raw.delayOptions.length > 0) {
    delayOptions = raw.delayOptions.map((v) => Number(v));
    if (delayOptions.some((n) => !Number.isFinite(n) || n < FLOOR)) {
      throw new Error(`delayOptions must be numbers >= ${FLOOR}.`);
    }
  }

  let fixed_strat_Bet;
  let martingale_strat_base_Bet;
  let martingale_strat_max_Bet;
  let loss_switch_strat_Bet;

  if (strategy === "fixed") {
    fixed_strat_Bet = Number(raw.fixed_strat_Bet) || DEFAULTS.fixed_strat_Bet;
    if (!Number.isFinite(fixed_strat_Bet) || fixed_strat_Bet < 1) {
      throw new Error("fixed_strat_Bet must be a number >= 1.");
    }
  } else if (strategy === "martingale") {
    martingale_strat_base_Bet = Number(raw.martingale_strat_base_Bet) || DEFAULTS.martingale_strat_base_Bet;
    martingale_strat_max_Bet = Number(raw.martingale_strat_max_Bet) || DEFAULTS.martingale_strat_max_Bet;
    if (!Number.isFinite(martingale_strat_base_Bet) || martingale_strat_base_Bet < 1) {
      throw new Error("martingale_strat_base_Bet must be a number >= 1.");
    }
    if (!Number.isFinite(martingale_strat_max_Bet) || martingale_strat_max_Bet < martingale_strat_base_Bet) {
      throw new Error("martingale_strat_max_Bet cannot be less than martingale_strat_base_Bet.");
    }
  } else if (strategy === "loss_switch") {
    loss_switch_strat_Bet = Number(raw.loss_switch_strat_Bet) || DEFAULTS.loss_switch_strat_Bet;
    if (!Number.isFinite(loss_switch_strat_Bet) || loss_switch_strat_Bet < 1) {
      throw new Error("loss_switch_strat_Bet must be a number >= 1.");
    }
  }

  return {
    token: String(raw.token),
    channelId: String(raw.channelId),
    owoId,
    owodmId,
    guess,
    randomGuess,
    randomFlipCommands,
    delayOptions,
    strategy,
    fixed_strat_Bet,
    martingale_strat_base_Bet,
    martingale_strat_max_Bet,
    loss_switch_strat_Bet,
  };
}

module.exports = { loadConfig };
