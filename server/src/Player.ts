import WebSocket from "ws";

import { Message, Room, ServerMessageWithoutContext, Card } from "./";

export interface PlayerData {
  name: string;
  isActive: boolean;
}

export class Player {
  public room: Room;
  public connection: WebSocket;

  public name: string;
  public cards: Card[] = [];

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

  toJson = (): PlayerData => ({
    name: this.name,
    isActive: this.isActive,
  });
}
