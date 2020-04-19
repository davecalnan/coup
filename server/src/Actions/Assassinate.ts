import { Player } from "../";
import { ChallengeableAction, TargetedActionConstructor } from "./";

export class AssassinateAction extends ChallengeableAction {
  public target: Player;

  constructor({ room, player, target }: TargetedActionConstructor) {
    super({
      room,
      type: "Assassinate",
      player,
    });

    this.target = target;
  }

  challengeIsSuccessful = () => this.player.doesntHaveA("assassin");

  succeeded = () => {
    this.player.updateCoinsBy(-3);

    this.room.broadcast({
      type: "PlayerMustChooseCardToLose",
      payload: {
        player: this.target.toJson(),
        action: this.toJson(),
      },
    });
  };
}
