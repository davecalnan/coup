import { MessageData, PlayerData, validate, player, CardType } from "../";

export type ConfirmActionMessage =
  | ConfirmForeignAidAction
  | ConfirmStealAction
  | ConfirmAssassinateAction;

export interface BaseConfirmAction extends MessageData {
  type: "ConfirmAction";
  payload: {
    action: {
      type: string;
      target?: PlayerData;
      player: PlayerData;
    };
  };
}

export const isConfirmActionMessage = (
  message: MessageData
): message is ConfirmActionMessage =>
  validate(message, {
    type: "ConfirmAction",
    payload: {
      action: {
        type: "string",
        player,
      },
    },
  });

export interface ConfirmForeignAidAction extends BaseConfirmAction {
  payload: {
    action: {
      type: "ForeignAid";
      player: PlayerData;
    };
  };
}

export const isConfirmForeignAidAction = (
  message: MessageData
): message is ConfirmForeignAidAction =>
  validate(message, {
    type: "ConfirmAction",
    payload: {
      action: {
        type: "ForeignAid",
        player,
      },
    },
  });

export interface ConfirmStealAction extends BaseConfirmAction {
  payload: {
    action: {
      type: "Steal";
      target: PlayerData;
      player: PlayerData;
    };
  };
}

export const isConfirmStealAction = (
  message: MessageData
): message is ConfirmStealAction =>
  validate(message, {
    type: "ConfirmAction",
    payload: {
      action: {
        type: "Steal",
        target: player,
        player,
      },
    },
  });

export interface ConfirmAssassinateAction extends BaseConfirmAction {
  payload: {
    action: {
      type: "Assassinate";
      target: PlayerData;
      player: PlayerData;
    };
  };
}

export const isConfirmAssassinateAction = (
  message: MessageData
): message is ConfirmAssassinateAction =>
  validate(message, {
    type: "ConfirmAction",
    payload: {
      action: {
        type: "Assassinate",
        target: player,
        player,
      },
    },
  });
