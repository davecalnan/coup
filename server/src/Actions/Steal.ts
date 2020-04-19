import { Player } from "../";
import { ChallengeableAction, TargetedActionConstructor } from "./";

export class StealAction extends ChallengeableAction {
  public target: Player;

  constructor({ room, player, target }: TargetedActionConstructor) {
    super({
      room,
      type: "Steal",
      player,
    });

    this.target = target;
  }

  challengeIsSuccessful = () => this.player.doesntHaveA("captain");

  succeeded = () => {
    const stolenCoins = this.target.coins >= 2 ? 2 : this.target.coins;

    this.player.updateCoinsBy(stolenCoins);
    this.target.updateCoinsBy(-stolenCoins);
  };
}
