import WebSocket from "ws";
import { v4 as uuid } from "uuid";

import { Message, Room, ServerMessageWithoutContext, Card, CardData } from "./";

export interface PlayerData {
  id: string;
  name: string;
  isActive: boolean;
  isEliminated: boolean;
  coins: number;
}

export class Player {
  public room: Room;
  public connection: WebSocket;

  public id: string = uuid();
  public name: string;
  public cards: Card[] = [];
  public coins: number = 0;

  private _isActive: boolean = false;

  public get isActive() {
    return this._isActive;
  }

  public get hand() {
    return this.cards.map((card) => card.toJson());
  }

  public get isEliminated() {
    return (
      this.room.status !== "waitingForPlayers" &&
      this.cards.every((card) => card.isDead)
    );
  }

  constructor({
    room,
    connection,
    name,
  }: {
    room: Room;
    connection: WebSocket;
    name: string;
  }) {
    this.room = room;
    this.connection = connection;
    this.name = name;
  }

  send = (message: ServerMessageWithoutContext) =>
    this.connection.send(
      Message.make(message, {
        ...this.room.toJson(),
        you: this.toJson(),
      }).toString()
    );

  exit = () => {
    this.room.removePlayer(this);
  };

  setActive = () => (this._isActive = true);
  setInactive = () => (this._isActive = false);

  findCard = (target: CardData) =>
    this.cards.find((card) => card.id === target.id);

  giveCards = (...cards: Card[]) => {
    cards.forEach((card) => card.giveTo(this));

    return cards.length;
  };

  removeCards = (...cards: Card[]) =>
    cards.reduce((removed, card) => {
      if (this.cards.includes(card)) {
        this.cards.splice(this.cards.indexOf(card), 1);
        return removed + 1;
      }
      return removed;
    }, 0);

  killCard = (target: Card | CardData) => {
    let card: Card;

    if (target instanceof Card) {
      card = target;
    } else {
      const foundCard = this.findCard(target);

      if (!foundCard) return;
      card = foundCard;
    }

    card.kill();
  };

  setHand = (cards: Card[]) => {
    console.log(
      "[WSS] Setting hand to:",
      cards.map((card) => card.toJson())
    );

    this.cards.forEach((card) => {
      if (!cards.includes(card)) {
        console.log("[WSS] Returning card to deck:", card.toJson());
        card.returnToDeck();
      }
    });

    cards.forEach((card) => {
      if (this.hand.find(({ id }) => card.id !== id)) {
        console.log("[WSS] Giving card to player:", card.toJson());
        card.giveTo(this);
      }
    });
  };

  /**
   * Increase or decrease a player's income.
   *
   * @param change A positive or negative integer.
   */
  updateCoinsBy = (change: number) => (this.coins = this.coins + change);

  toJson = (): PlayerData => ({
    id: this.id,
    name: this.name,
    isActive: this.isActive,
    isEliminated: this.isEliminated,
    coins: this.coins,
  });
}
