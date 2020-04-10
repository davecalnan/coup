import { Card } from "./";

export class Deck {
  public cards: Card[];

  constructor() {
    this.cards = this.shuffle([
      ...Card.make({ type: "duke" }, 3),
      ...Card.make({ type: "captain" }, 3),
      ...Card.make({ type: "assassin" }, 3),
      ...Card.make({ type: "ambassador" }, 3),
      ...Card.make({ type: "contessa" }, 3),
    ]);
  }

  shuffle = (cards = this.cards) => {
    cards.forEach((card, index) => {
      const randomIndex = Math.floor(Math.random() * (index + 1));

      [cards[index], cards[randomIndex]] = [cards[randomIndex], cards[index]];
    });

    return cards;
  };
}
