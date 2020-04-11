import WebSocket from "ws";
import { v4 as uuid } from "uuid";

import { Message, Room, ServerMessageWithoutContext, Card } from "./";

export interface PlayerData {
  id: string;
  name: string;
  isActive: boolean;
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

  giveCards = (...cards: Card[]) => {
    cards.forEach((card) => (card.player = this));

    return this.cards.push(...cards);
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
    coins: this.coins,
  });
}
