import { Card, toJson } from "./";

export class Deck {
  private _cards: Card[];

  get cards() {
    return this._cards.filter((card) => !card.player);
  }

  get allCards() {
    return this._cards;
  }

  constructor() {
    this._cards = this.shuffle([
      ...Card.make({ deck: this, type: "duke" }, 3),
      ...Card.make({ deck: this, type: "captain" }, 3),
      ...Card.make({ deck: this, type: "assassin" }, 3),
      ...Card.make({ deck: this, type: "ambassador" }, 3),
      ...Card.make({ deck: this, type: "contessa" }, 3),
    ]);
  }

  shuffle = (cards = this.cards) => {
    cards.forEach((card, index) => {
      const randomIndex = Math.floor(Math.random() * (index + 1));

      [cards[index], cards[randomIndex]] = [cards[randomIndex], cards[index]];
    });

    return cards;
  };

  returnCards = (cards: Card[]) => {
    cards.forEach((card) => card.returnToDeck());
  };

  toJson = () => ({
    cards: this.cards.map(toJson),
    allCards: this.cards.map(toJson),
  });
}
