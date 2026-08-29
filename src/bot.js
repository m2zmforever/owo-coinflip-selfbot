const { Client } = require("discord.js-selfbot-v13");
const OwOService = require("./owo");
const notifier = require("./notifier");
const logger = require("./logger");

class Bot {
  constructor(config) {
    this.config = config;
    this.client = new Client();
    this.owo = new OwOService(config);
    this.busy = false;
    this.captchaActive = false;
  }

  registerEvents() {
    this.client.on("ready", () => this.onReady());
    this.client.on("messageCreate", (message) => this.onMessage(message));
    this.client.on("messageUpdate", (oldMessage, newMessage) => this.onMessage(newMessage));
    this.client.on("error", (err) => logger.error(`Client error: ${err.message}`));
  }

  async resolveChannel() {
    const channel = await this.client.channels.fetch(this.config.channelId);
    if (!channel) {
      logger.error("Target channel not found.");
      return null;
    }
    return channel;
  }

  async tick() {
    if (this.busy) return;
    if (this.captchaActive) return;
    this.owo.clearIfStale();
    if (this.owo.pending !== null) return;
    this.busy = true;
    try {
      const channel = await this.resolveChannel();
      if (!channel) return;
      await this.owo.sendFlip(channel);
    } catch (err) {
      logger.error(`Tick error: ${err.message}`);
    } finally {
      this.busy = false;
    }
  }

  nextDelay() {
    const opts = this.config.delayOptions;
    if (!opts || opts.length === 0) return 0;
    const min = Math.min(...opts);
    const max = Math.max(...opts);
    let delay = Math.floor(Math.random() * (max - min + 1)) + min;
    if (Math.random() < 0.15) {
      delay += Math.floor(Math.random() * 30000) + 10000;
    }
    return delay;
  }

  scheduleNext() {
    const delay = this.nextDelay();
    logger.info(`Next flip scheduled in ${delay}ms`);
    setTimeout(async () => {
      await this.tick();
      this.scheduleNext();
    }, delay);
  }

  onMessage(message) {
    if (message.partial) return;
    const event = this.owo.handleMessage(message);
    if (!event) return;

    if (event.type === "captcha_request") {
      this.onCaptchaRequest(event.url);
    } else if (event.type === "captcha_solved") {
      this.onCaptchaSolved();
    }
  }

  onCaptchaRequest(url) {
    this.captchaActive = true;
    this.owo.clearPending();
    const link = url || "https://owobot.com/captcha";
    logger.warn(`CAPTCHA required! Solve it: ${link}`);
    notifier.alert("OwO Captcha", `Please solve the captcha:\n${link}`);
  }

  onCaptchaSolved() {
    const wasActive = this.captchaActive;
    this.captchaActive = false;
    this.owo.clearPending();
    logger.success("Captcha solved. Resuming play.");
    if (wasActive) this.tick();
  }

  async onReady() {
    logger.success(`Logged in: ${this.client.user.username}`);
    await this.tick();
    this.scheduleNext();
  }

  start() {
    this.registerEvents();
    this.client.login(this.config.token).catch((err) => {
      logger.error(`Login error: ${err.message}`);
      process.exit(1);
    });
  }
}

module.exports = Bot;
