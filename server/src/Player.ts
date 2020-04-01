import WebSocket from "ws";

import { Message, Room, ServerMessageWithoutContext } from "./";

export interface PlayerData {
  name: string;
  isActive: boolean;
}

export class Player {
  public room: Room;
  public connection: WebSocket;
  public name: string;
  private _isActive: boolean = false;

  public get isActive() {
    return this._isActive;
  }

  constructor({
    room,
    connection,
    name
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
        you: this.toJson()
      }).toString()
    );

  exit = () => {
    this.room.removePlayer(this);
  };

  setActive = () => (this._isActive = true);
  setInactive = () => (this._isActive = false);

  toJson = (): PlayerData => ({
    name: this.name,
    isActive: this.isActive
  });
}
