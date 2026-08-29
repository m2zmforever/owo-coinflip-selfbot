const logger = require("./logger");
const { createStrategy } = require("./strategy");
const captcha = require("./captcha");

const PENDING_TIMEOUT_MS = 30000;

const FLIP_COMMAND_VARIANTS = ["owo coinflip", "owo cf", "owo coin", "owo flip", "w cf", "w coinflip", "w coin", "w flip"];

class OwOService {
  constructor(config) {
    this.config = config;
    this.stats = { flips: 0, wins: 0, losses: 0, net: 0, peakBet: 0 };
    this.pending = null;
    this.pendingSince = 0;
    this.strategy = createStrategy(config);
  }

  isGuessHeads() {
    return this.config.guess.startsWith("h");
  }

  buildCommand() {
    let base = "owo coinflip";
    if (this.config.randomFlipCommands && FLIP_COMMAND_VARIANTS.length > 0) {
      base = FLIP_COMMAND_VARIANTS[Math.floor(Math.random() * FLIP_COMMAND_VARIANTS.length)];
    }
    let suffix = "";
    if (this.config.randomGuess) {
      suffix = Math.random() < 0.5 ? " h" : " t";
    }
    return `${base} ${this.strategy.currentBet}${suffix}`;
  }

  async sendFlip(channel) {
    try {
      const command = this.buildCommand();
      await channel.send(command);
      this.pending = this.strategy.currentBet;
      this.pendingSince = Date.now();
      const tag = this.strategy.name === "martingale" ? ` [martingale, bet ${this.strategy.currentBet}]` : "";
      logger.info(`Flip sent: ${command}${tag}`);
    } catch (err) {
      logger.error(`Flip send error: ${err.message}`);
    }
  }

  clearPending() {
    this.pending = null;
  }

  clearIfStale() {
    if (this.pending !== null && Date.now() - this.pendingSince > PENDING_TIMEOUT_MS) {
      logger.warn("No response from OwO, resetting pending flip.");
      this.pending = null;
    }
  }

  parseResult(content) {
    const lower = content.toLowerCase();
    if (!lower.includes("spent")) return null;

    const spentMatch = content.match(/spent\s+\*\*<:cowoncy:\d+>\s*([\d,]+)\*\*/);
    if (!spentMatch) return null;

    const choseMatch = content.match(/chose\s+\*\*(\w+)\*\*/);
    const wonMatch = content.match(/and you won\s+\*\*<:cowoncy:\d+>\s*([\d,]+)\*\*/);
    const lost = lower.includes("and you lost");

    const spent = parseInt(spentMatch[1].replace(/,/g, ""), 10);
    const guess = choseMatch ? choseMatch[1] : null;

    if (wonMatch) {
      const won = parseInt(wonMatch[1].replace(/,/g, ""), 10);
      return { outcome: "won", spent, won, guess, net: won - spent };
    }
    if (lost) {
      return { outcome: "lost", spent, won: 0, guess, net: -spent };
    }
    return null;
  }

  reportResult(result) {
    this.stats.flips += 1;
    this.strategy.update(result.outcome);
    if (this.strategy.currentBet > this.stats.peakBet) {
      this.stats.peakBet = this.strategy.currentBet;
    }
    if (result.outcome === "won") {
      this.stats.wins += 1;
      this.stats.net += result.net;
      logger.success(
        `WON | spent ${result.spent} -> won ${result.won} | net ${result.net} | total net ${this.stats.net.toLocaleString()}`
      );
    } else {
      this.stats.losses += 1;
      this.stats.net += result.net;
      logger.warn(
        `LOST | spent ${result.spent} | net ${result.net} | total net ${this.stats.net.toLocaleString()}`
      );
    }
  }

  reportNotice(content) {
    const lower = content.toLowerCase();
    const keywords = ["cooldown", "enough", "slow down", "wait", "can't", "cant", "error"];
    if (!keywords.some((k) => lower.includes(k))) return;

    logger.warn(`OwO notice: ${content.slice(0, 140)}`);

    if (this.pending !== null) {
      this.pending = null;
      this.strategy.reset();
      logger.warn("Flip failed (notice), resetting to base bet.");
    }
  }

  handleMessage(message) {
    if (message.author.id !== this.config.owoId) return null;

    const content = message.content || "";

    if (captcha.isCaptchaRequest(message)) {
      return { type: "captcha_request", url: captcha.getCaptchaUrl(message) };
    }
    if (captcha.isCaptchaSolved(message)) {
      return { type: "captcha_solved" };
    }

    if (message.channelId !== this.config.channelId) return null;

    const result = this.parseResult(content);
    if (result) {
      if (this.pending === null) return null;
      this.pending = null;
      this.reportResult(result);
      return null;
    }

    this.reportNotice(content);
    return null;
  }
}

module.exports = OwOService;
