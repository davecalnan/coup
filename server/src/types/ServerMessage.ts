import {
  MessageData,
  MessageContext,
  validate,
  PlayerData,
  CardData,
  player,
  ForeignAidPlayerAction,
  StealPlayerAction,
  AssassinatePlayerAction,
  ActionData,
} from "../";

export interface ServerMessageData extends MessageData {}

export type WithContext<T extends ServerMessageData> = T & {
  context: MessageContext;
};

export type ServerMessage = WithContext<ServerMessageWithoutContext>;

export type ServerMessageWithoutContext =
  | UnauthorisedActionMessage
  | NewPlayerMessage
  | NameAlreadyTakenMessage
  | PlayerLeftMessage
  | GameStartedMessage
  | GameOverMessage
  | NewTurnMessage
  | NewHandMessage
  | AnyoneCanBlockMessage
  | PlayerCanBlockMessage
  | PlayerMustChooseCardToLoseMessage
  | PlayerMustChooseCardsMessage
  | ActionPendingMessage
  | ActionCompletedMessage;

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

export interface GameOverMessage extends ServerMessageData {
  type: "GameOver";
  payload: {
    winner: PlayerData;
  };
}

export const isGameOverMessage = (
  message: MessageData
): message is GameOverMessage =>
  validate(message, {
    type: "GameOver",
    payload: {
      winner: player,
    },
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
    action: {
      type: ForeignAidPlayerAction["payload"]["action"]["type"];
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
        player,
      },
    },
  });

export interface PlayerCanBlockMessage extends ServerMessageData {
  type: "PlayerCanBlock";
  payload: {
    action: {
      type: (
        | StealPlayerAction
        | AssassinatePlayerAction
      )["payload"]["action"]["type"];
      target: PlayerData;
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

export interface PlayerMustChooseCardToLoseMessage extends ServerMessageData {
  type: "PlayerMustChooseCardToLose";
  payload: {
    action: ActionData;
    player: PlayerData;
  };
}

export const isPlayerMustChooseCardToLoseMessage = (
  message: MessageData
): message is PlayerMustChooseCardToLoseMessage =>
  validate(message, {
    type: "PlayerMustChooseCardToLose",
    payload: {
      player,
      action: {
        type: "string",
        player,
      },
    },
  });

export interface PlayerMustChooseCardsMessage extends ServerMessageData {
  type: "PlayerMustChooseCards";
  payload: {
    cards: CardData[];
    action: {
      type: "Exchange";
      player: PlayerData;
    };
  };
}

export const isPlayerMustChooseCardsMessage = (
  message: MessageData
): message is PlayerMustChooseCardsMessage =>
  validate(message, {
    type: "PlayerMustChooseCards",
    payload: {
      cards: "array",
      action: {
        type: "string",
        player,
      },
    },
  });

export interface ActionPendingMessage extends MessageData {
  type: "ActionPending";
  payload: {
    action: ActionData;
  };
}

export const isActionPendingMessage = (
  message: MessageData
): message is ActionPendingMessage =>
  validate(message, {
    type: "ActionPending",
    payload: {
      action: {
        id: "string",
        status: "string",
        type: "string",
        player,
        challengeBefore: "string",
      },
    },
  });

export interface ActionCompletedMessage extends MessageData {
  type: "ActionCompleted";
  payload: {
    action: ActionData;
  };
}

export const isActionCompletedMessage = (
  message: MessageData
): message is ActionCompletedMessage =>
  validate(message, {
    type: "ActionCompleted",
    payload: {
      action: {
        id: "string",
        status: "string",
        type: "string",
        player,
      },
    },
  });
