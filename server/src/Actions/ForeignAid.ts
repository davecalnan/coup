import { BaseAction, ActionConstructor } from "./";

export class ForeignAidAction extends BaseAction {
  constructor({ room, player }: ActionConstructor) {
    super({
      room,
      type: "ForeignAid",
      player,
      canBeBlockedBy: "anyone",
    });
  }

  succeeded = () => {
    this.player.updateCoinsBy(2);
  };
}
