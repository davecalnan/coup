import { PlayerData, RoomData, validate, player, CardData } from "../";

export interface MessagePayload {
  [key: string]: unknown;
}

export interface MessageData {
  type: string;
  payload: MessagePayload;
}

export type MessageContext = RoomData & {
  you: PlayerData;
};

export interface MessageWithContext extends MessageData {
  context: MessageContext;
}

export interface ServerMessageData extends MessageData {}

export type ServerMessage = ServerMessageWithoutContext & {
  context: MessageContext;
};

/**
 * Client Messages
 */

export type ClientMessage =
  | JoinGameMessage
  | LeaveGameMessage
  | StartGameMessage
  | NextTurnMessage;

export interface JoinGameMessage extends MessageData {
  type: "JoinGame";
  payload: {
    name: string;
    room: string;
  };
}

export interface LeaveGameMessage extends MessageData {
  type: "LeaveGame";
}

export const isJoinGameMessage = (
  message: MessageData
): message is JoinGameMessage =>
  validate(message, {
    type: "JoinGame",
    payload: {
      name: "string",
      room: "string",
    },
  });

export interface StartGameMessage extends MessageData {
  type: "StartGame";
  payload: {};
}

export const isStartGameMessage = (
  message: MessageData
): message is StartGameMessage =>
  validate(message, {
    type: "StartGame",
    payload: {},
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
    payload: {},
  });

/**
 * Server Messages
 */

export type ServerMessageWithoutContext =
  | UnauthorisedActionMessage
  | NewPlayerMessage
  | NameAlreadyTakenMessage
  | PlayerLeftMessage
  | GameStartedMessage
  | NewTurnMessage
  | NewHandMessage;

export interface UnauthorisedActionMessage extends ServerMessageData {
  type: "UnauthorisedAction";
  payload: {
    message: string;
  };
}

export const UnauthorisedActionMessage = (
  message: MessageData
): message is UnauthorisedActionMessage =>
  validate(message, {
    type: "UnauthorisedAction",
    payload: {
      message: "string",
    },
  });

export interface NewPlayerMessage extends ServerMessageData {
  type: "NewPlayer";
  payload: {};
}

export const isNewPlayerMessage = (
  message: MessageData
): message is NewPlayerMessage =>
  validate(message, {
    type: "NewPlayer",
    payload: {},
  });

export interface NameAlreadyTakenMessage extends ServerMessageData {
  type: "NameAlreadyTaken";
  payload: {
    player: PlayerData;
  };
}

export const isNameAlreadyTakenMessage = (
  message: MessageData
): message is NameAlreadyTakenMessage =>
  validate(message, {
    type: "NameAlreadyTaken",
    payload: {
      player,
    },
  });

export interface PlayerLeftMessage extends ServerMessageData {
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
      player,
    },
  });

export interface GameStartedMessage extends ServerMessageData {
  type: "GameStarted";
  payload: {};
}

export const isGameStartedMessage = (
  message: MessageData
): message is GameStartedMessage =>
  validate(message, {
    type: "GameStarted",
    payload: {},
  });

export interface NewTurnMessage extends ServerMessageData {
  type: "NewTurn";
  payload: {};
}

export const isNewTurnMessage = (
  message: MessageData
): message is NewTurnMessage =>
  validate(message, {
    type: "NewTurn",
    payload: {},
  });

export interface NewHandMessage extends ServerMessageData {
  type: "NewHand";
  payload: {
    hand: CardData[];
  };
}

export const isNewHandMessage = (
  message: MessageData
): message is NewHandMessage =>
  validate(message, {
    type: "NewHand",
    payload: {
      hand: "array",
    },
  });
