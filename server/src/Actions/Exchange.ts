import { BaseAction, ActionConstructor } from "./";

export class ExchangeAction extends BaseAction {
  constructor({ room, player }: ActionConstructor) {
    super({
      room,
      type: "Exchange",
      player,
    });
  }

  succeeded = () => {
    this.room.broadcast({
      type: "PlayerMustChooseCards",
      payload: {
        action: this.toJson(),
        cards: this.room.deck.cards.slice(0, 2).map((card) => card.toJson()),
      },
    });
  };

  completed = () => {};
}
