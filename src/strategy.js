const STRATEGIES = ["fixed", "martingale", "loss_switch"];

class FixedStrategy {
  constructor(config) {
    this.name = "fixed";
    this.currentBet = config.fixed_strat_Bet;
  }

  update() {}

  reset() {}
}

class MartingaleStrategy {
  constructor(config) {
    this.name = "martingale";
    this.baseBet = config.martingale_strat_base_Bet;
    this.maxBet = config.martingale_strat_max_Bet;
    this.currentBet = this.baseBet;
  }

  update(outcome) {
    if (outcome === "won") {
      this.currentBet = this.baseBet;
      return;
    }
    if (this.currentBet >= this.maxBet) {
      this.currentBet = this.baseBet;
    } else {
      this.currentBet = Math.min(this.currentBet * 2, this.maxBet);
    }
  }

  reset() {
    this.currentBet = this.baseBet;
  }
}

class LossSwitchStrategy {
  constructor(config) {
    this.name = "loss_switch";
    this.smallBet = 1;
    this.switchBet = config.loss_switch_strat_Bet;
    this.onSmall = true;
    this.currentBet = this.smallBet;
  }

  update(outcome) {
    if (this.onSmall) {
      if (outcome === "lost") {
        this.onSmall = false;
        this.currentBet = this.switchBet;
      }
    } else {
      this.onSmall = true;
      this.currentBet = this.smallBet;
    }
  }

  reset() {
    this.onSmall = true;
    this.currentBet = this.smallBet;
  }
}

function createStrategy(config) {
  switch (config.strategy) {
    case "martingale":
      return new MartingaleStrategy(config);
    case "loss_switch":
      return new LossSwitchStrategy(config);
    case "fixed":
    default:
      return new FixedStrategy(config);
  }
}

module.exports = {
  createStrategy,
  STRATEGIES,
  FixedStrategy,
  MartingaleStrategy,
  LossSwitchStrategy,
};
