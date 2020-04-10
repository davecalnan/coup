import { Player } from "./";

export type CardType =
  | "duke"
  | "captain"
  | "assassin"
  | "ambassador"
  | "contessa";

export type CardData = {
  type: CardType;
};

export type CardConstructor = { type: CardType };

export class Card {
  public type: CardType;
  public player: Player | undefined;

  constructor({ type }: CardConstructor) {
    this.type = type;
  }

  static make = (data: CardConstructor, count: number = 1) =>
    Array(count)
      .fill(null)
      .map(() => new Card(data));

  toJson = () => ({
    type: this.type,
  });
}
