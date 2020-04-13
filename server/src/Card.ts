import { v4 as uuid } from "uuid";

import { Player, Deck } from "./";

export type CardType =
  | "duke"
  | "captain"
  | "assassin"
  | "ambassador"
  | "contessa";

export type CardData = {
  id: string;
  type: CardType;
  isDead: boolean;
};

export type CardConstructor = { deck: Deck; type: CardType };

export class Card {
  public deck: Deck;

  public id: string = uuid();
  public type: CardType;
  public player: Player | undefined;

  private _isDead = false;

  get isDead() {
    return this._isDead;
  }

  constructor({ deck, type }: CardConstructor) {
    this.deck = deck;
    this.type = type;
  }

  static make = (data: CardConstructor, count: number = 1) =>
    Array(count)
      .fill(null)
      .map(() => new Card(data));

  giveTo = (player: Player) => {
    this.player = player;

    if (!player.cards.includes(this)) {
      this.player.cards.push(this);
    }
  };

  removeFromPlayer = () => {
    this.player?.removeCards(this);
    this.player = undefined;
  };

  kill = () => {
    this._isDead = true;
  };

  returnToDeck = () => {
    const selfIndexInDeck = this.deck.allCards.indexOf(this);
    console.log("selfIndexInDeck:", selfIndexInDeck);
    if (selfIndexInDeck === -1) return;

    this.removeFromPlayer();
    this.deck.allCards.splice(selfIndexInDeck, 1);
    this.deck.allCards.push(this);
  };

  toJson = (): CardData => ({
    id: this.id,
    type: this.type,
    isDead: this.isDead,
  });
}
