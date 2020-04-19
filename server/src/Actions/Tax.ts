import { ChallengeableAction, ActionConstructor } from "./";

export class TaxAction extends ChallengeableAction {
  constructor({ room, player }: ActionConstructor) {
    super({
      room,
      type: "Tax",
      player,
    });
  }

  challengeIsSuccessful = () => this.player.doesntHaveA("duke");

  succeeded = () => {
    this.player.updateCoinsBy(3);
  };
}
