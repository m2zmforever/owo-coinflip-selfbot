# OwO Coinflip Selfbot

A selfbot for OwO that automates bot coinflip betting using strategies.

## Disclaimer

This project uses a user token. Selfbots violate Discord's ToS and can result in account bans. Use it at your own risk.

## Strategies

### Fixed
Bets the same amount (`fixed_strat_Bet`) on every flip.

### Martingale
Doubles the bet after each loss and resets back to `martingale_strat_base_Bet` after a win.

### Loss_Switch
Alternates between a tiny `1` cowoncy probe bet and a larger `loss_switch_strat_Bet`.

## Configuration

Copy the example config and fill in your values:

```bash
cp config.json.example config.json
```

| Field | Description |
| --- | --- |
| `token` | Your Discord user token |
| `channelId` | ID of the channel where coinflip commands are sent |
| `owoId` | ID of the OwO bot |
| `owodmId` | OwO DM id for captcha solved/not solved |
| `guess` | Default guess, `h` (heads) or `t` (tails) |
| `randomGuess` | Randomize heads/tails on each flip |
| `randomFlipCommands` | Randomize the coinflip command variant |
| `delayOptions` | Array of `[min, max]` delay in ms between flips |
| `strategy` | Betting strategy: `fixed`, `martingale`, `loss_switch` |
| `fixed_strat_Bet` | Bet amount for the `fixed` strategy |
| `martingale_strat_base_Bet` | Base bet for the `martingale` strategy |
| `martingale_strat_max_Bet` | Maximum bet cap for the `martingale` strategy |
| `loss_switch_strat_Bet` | Switch bet for the `loss_switch` strategy |

## License

Released under the [MIT License](./LICENSE).
