import { Player } from "../";
import { BaseAction, TargetedActionConstructor } from "./";

export class CoupAction extends BaseAction {
  public target: Player;

  constructor({ room, player, target }: TargetedActionConstructor) {
    super({
      room,
      type: "Coup",
      player,
    });

    this.target = target;
  }

  succeeded = () => {
    this.player.updateCoinsBy(-7);

    this.room.broadcast({
      type: "PlayerMustChooseCardToLose",
      payload: {
        player: this.target.toJson(),
        action: this.toJson(),
      },
    });
  };
}
