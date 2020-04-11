import { MessageData, PlayerData, validate, player } from "../";

export type PlayerActionMessage =
  | IncomePlayerAction
  | ForeignAidPlayerAction
  | TaxPlayerAction
  | StealPlayerAction
  | AssassinatePlayerAction
  | ExchangePlayerAction
  | CoupPlayerAction;

export interface BasePlayerAction extends MessageData {
  type: "TakeAction";
  payload: {
    action: {
      type: PlayerActionMessage["payload"]["action"]["type"];
    };
  };
}

export const isPlayerActionMessage = (
  message: MessageData
): message is PlayerActionMessage =>
  validate(message, {
    type: "TakeAction",
    payload: {
      action: {
        type: "string",
      },
    },
  });

export interface IncomePlayerAction extends BasePlayerAction {
  payload: {
    action: {
      type: "Income";
    };
  };
}

export const isIncomePlayerAction = (
  message: MessageData
): message is IncomePlayerAction =>
  validate(message, {
    type: "TakeAction",
    payload: {
      action: {
        type: "Income",
      },
    },
  });

export interface ForeignAidPlayerAction extends BasePlayerAction {
  payload: {
    action: {
      type: "ForeignAid";
    };
  };
}

export const isForeignAidPlayerAction = (
  message: MessageData
): message is ForeignAidPlayerAction =>
  validate(message, {
    type: "TakeAction",
    payload: {
      action: {
        type: "ForeignAid",
      },
    },
  });

export interface TaxPlayerAction extends BasePlayerAction {
  payload: {
    action: {
      type: "Tax";
    };
  };
}

export const isTaxPlayerAction = (
  message: MessageData
): message is TaxPlayerAction =>
  validate(message, {
    type: "TakeAction",
    payload: {
      action: {
        type: "Tax",
      },
    },
  });

export interface StealPlayerAction extends BasePlayerAction {
  payload: {
    action: {
      type: "Steal";
      target: PlayerData;
    };
  };
}

export const isStealPlayerAction = (
  message: MessageData
): message is StealPlayerAction =>
  validate(message, {
    type: "TakeAction",
    payload: {
      action: {
        type: "Steal",
        target: player,
      },
    },
  });

export interface AssassinatePlayerAction extends BasePlayerAction {
  payload: {
    action: {
      type: "Assassinate";
      target: PlayerData;
    };
  };
}

export const isAssassinatePlayerAction = (
  message: MessageData
): message is AssassinatePlayerAction =>
  validate(message, {
    type: "TakeAction",
    payload: {
      action: {
        type: "Assassinate",
        target: player,
      },
    },
  });

export interface ExchangePlayerAction extends BasePlayerAction {
  payload: {
    action: {
      type: "Exchange";
    };
  };
}

export const isExchangePlayerAction = (
  message: MessageData
): message is ExchangePlayerAction =>
  validate(message, {
    type: "TakeAction",
    payload: {
      action: {
        type: "Exchange",
      },
    },
  });

export interface CoupPlayerAction extends BasePlayerAction {
  payload: {
    action: {
      type: "Coup";
    };
  };
}

export const isCoupPlayerAction = (
  message: MessageData
): message is CoupPlayerAction =>
  validate(message, {
    type: "TakeAction",
    payload: {
      action: {
        type: "Coup",
      },
    },
  });
