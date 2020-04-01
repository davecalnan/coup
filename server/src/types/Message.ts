import { PlayerData, validate, player } from "../";

export interface MessagePayload {
  [key: string]: unknown;
}

export interface MessageData {
  type: string;
  payload: MessagePayload;
}

export interface Context {
  players: PlayerData[];
  you: PlayerData;
  activePlayer?: PlayerData;
}

export interface MessageWithContext extends MessageData {
  context: Context;
}

/**
 * Client Messages
 */

export type ClientMessage = MessageData | HelloMessage | NextTurnMessage;

export interface HelloMessage extends MessageData {
  type: "Hello";
  payload: {
    name: string;
  };
}

export const isHelloMessage = (message: MessageData): message is HelloMessage =>
  validate(message, {
    type: "Hello",
    payload: {
      name: "string"
    }
  });

export interface NextTurnMessage extends MessageData {
  type: "NextTurn";
  payload: {};
}

export const isNextTurnMessage = (
  message: MessageData
): message is NextTurnMessage =>
  validate(message, {
    type: "NextTurn",
    payload: {}
  });

/**
 * Server Message
 */

export type ServerMessageWithoutContext =
  | NewPlayerMessage
  | PlayerLeftMessage
  | NewTurnMessage;
export type ServerMessage = ServerMessageWithoutContext & { context: Context };

export interface NewPlayerMessage extends MessageData {
  type: "NewPlayer";
  payload: {
    player: PlayerData;
  };
}

export const isNewPlayerMessage = (
  message: MessageData
): message is NewPlayerMessage =>
  validate(message, {
    type: "NewPlayer",
    payload: {
      player
    }
  });

export interface PlayerLeftMessage extends MessageData {
  type: "PlayerLeft";
  payload: {
    player: PlayerData;
  };
}

export const isPlayerLeftMessage = (
  message: MessageData
): message is PlayerLeftMessage =>
  validate(message, {
    type: "PlayerLeft",
    payload: {
      player
    }
  });

export interface NewTurnMessage extends MessageData {
  type: "NewTurn";
  payload: {};
}

export const isNewTurnMessage = (
  message: MessageData
): message is NewTurnMessage =>
  validate(message, {
    type: "NewTurn",
    payload: {}
  });
