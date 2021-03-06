import {
  PlayerActionMessage,
  MessageData,
  validate,
  CardData,
  card,
  BlockActionMessage,
  ConfirmActionMessage,
} from "../";

export type ClientMessage =
  | JoinGameMessage
  | LeaveGameMessage
  | StartGameMessage
  | PlayerActionMessage
  | SkipChallengeActionMessage
  | ChallengeActionMessage
  | BlockActionMessage
  | ConfirmActionMessage
  | LoseCardMessage
  | ChooseCardsMessage;

export interface JoinGameMessage extends MessageData {
  type: "JoinGame";
  payload: {
    id?: string;
    name: string;
    room: string;
  };
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

export interface LeaveGameMessage extends MessageData {
  type: "LeaveGame";
}

export const isLeaveGameMessage = (
  message: MessageData
): message is LeaveGameMessage =>
  validate(message, {
    type: "LeaveGame",
    payload: {},
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

export interface LoseCardMessage extends MessageData {
  type: "LoseCard";
  payload: {
    card: CardData;
    action: {
      id: string;
    };
  };
}

export const isLoseCardMessage = (
  message: MessageData
): message is LoseCardMessage =>
  validate(message, {
    type: "LoseCard",
    payload: {
      card,
      action: {
        id: "string",
      },
    },
  });

export interface ChooseCardsMessage extends MessageData {
  type: "ChooseCards";
  payload: {
    chosenCards: CardData[];
    returnedCards: CardData[];
  };
}

export const isChooseCardsMessage = (
  message: MessageData
): message is ChooseCardsMessage =>
  validate(message, {
    type: "ChooseCards",
    payload: {
      chosenCards: "array",
      returnedCards: "array",
    },
  });

export interface SkipChallengeActionMessage extends MessageData {
  type: "SkipChallengeAction";
  payload: {
    action: {
      id: string;
    };
  };
}

export const isSkipChallengeActionMessage = (
  message: MessageData
): message is SkipChallengeActionMessage =>
  validate(message, {
    type: "SkipChallengeAction",
    payload: {
      action: {
        id: "string",
      },
    },
  });

export interface ChallengeActionMessage extends MessageData {
  type: "ChallengeAction";
  payload: {
    action: {
      id: string;
    };
  };
}

export const isChallengeActionMessage = (
  message: MessageData
): message is ChallengeActionMessage =>
  validate(message, {
    type: "ChallengeAction",
    payload: {
      action: {
        id: "string",
      },
    },
  });
