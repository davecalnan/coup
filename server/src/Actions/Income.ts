import { BaseAction, ActionConstructor } from "./";

export class IncomeAction extends BaseAction {
  constructor({ room, player }: ActionConstructor) {
    super({
      room,
      type: "Income",
      player,
    });
  }

  succeeded = () => {
    this.player.updateCoinsBy(1);
  };
}
