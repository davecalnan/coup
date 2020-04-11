import {
  MessageData,
  MessageContext,
  validate,
  PlayerData,
  CardData,
  player,
  BlockActionMessage,
} from "../";
import {
  PlayerActionMessage,
  IncomePlayerAction,
  ForeignAidPlayerAction,
  StealPlayerAction,
  AssassinatePlayerAction,
} from "./PlayerAction";

export interface ServerMessageData extends MessageData {}

export type ServerMessage = ServerMessageWithoutContext & {
  context: MessageContext;
};

export type ServerMessageWithoutContext =
  | UnauthorisedActionMessage
  | NewPlayerMessage
  | NameAlreadyTakenMessage
  | PlayerLeftMessage
  | GameStartedMessage
  | NewTurnMessage
  | NewHandMessage
  | PlayerCanBlockMessage;

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
  payload: {
    player: PlayerData;
  };
}

export const isNewTurnMessage = (
  message: MessageData
): message is NewTurnMessage =>
  validate(message, {
    type: "NewTurn",
    payload: {
      player,
    },
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

export interface AnyoneCanBlockMessage extends ServerMessageData {
  type: "AnyoneCanBlock";
  payload: {
    action: ForeignAidPlayerAction["payload"]["action"] & {
      player: PlayerData;
    };
  };
}

export const isAnyoneCanBlockMessage = (
  message: MessageData
): message is AnyoneCanBlockMessage =>
  validate(message, {
    type: "AnyoneCanBlock",
    payload: {
      action: {
        type: "string",
        target: player,
        player,
      },
    },
  });

export interface PlayerCanBlockMessage extends ServerMessageData {
  type: "PlayerCanBlock";
  payload: {
    action: Pick<
      (StealPlayerAction | AssassinatePlayerAction)["payload"]["action"],
      "type" | "target"
    > & {
      player: PlayerData;
    };
  };
}

export const isPlayerCanBlockMessage = (
  message: MessageData
): message is PlayerCanBlockMessage =>
  validate(message, {
    type: "PlayerCanBlock",
    payload: {
      action: {
        type: "string",
        target: player,
        player,
      },
    },
  });
