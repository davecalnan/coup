import { MessageData, PlayerData, validate, player, CardType } from "../";

export type BlockActionMessage =
  | BlockForeignAidAction
  | BlockStealAction
  | BlockAssassinateAction;

export interface BaseBlockAction extends MessageData {
  type: "BlockAction";
  payload: {
    with: BlockActionMessage["payload"]["with"];
    action: {
      id: string;
      type: BlockActionMessage["payload"]["action"]["type"];
    };
  };
}

export const isBlockActionMessage = (
  message: MessageData
): message is BlockActionMessage =>
  validate(message, {
    type: "BlockAction",
    payload: {
      with: "string",
      action: {
        id: "string",
        type: "string",
      },
    },
  });

export interface BlockForeignAidAction extends BaseBlockAction {
  payload: {
    with: "duke";
    action: {
      id: string;
      type: "ForeignAid";
    };
  };
}

export const isBlockForeignAidAction = (
  message: MessageData
): message is BlockForeignAidAction =>
  validate(message, {
    type: "BlockAction",
    payload: {
      with: "duke",
      action: {
        id: "string",
        type: "ForeignAidAction",
      },
    },
  });

export interface BlockStealAction extends BaseBlockAction {
  payload: {
    with: "captain" | "ambassador";
    action: {
      id: string;
      type: "Steal";
    };
  };
}

export const isBlockStealAction = (
  message: MessageData
): message is BlockStealAction =>
  validate(message, {
    type: "BlockAction",
    payload: {
      with: "string",
      action: {
        id: "string",
        type: "Steal",
      },
    },
  });

export interface BlockAssassinateAction extends BaseBlockAction {
  payload: {
    with: "contessa";
    action: {
      id: string;
      type: "Assassinate";
    };
  };
}

export const isBlockAssassinateAction = (
  message: MessageData
): message is BlockAssassinateAction =>
  validate(message, {
    type: "BlockAction",
    payload: {
      with: "contessa",
      action: {
        id: "string",
        type: "Assassinate",
      },
    },
  });
