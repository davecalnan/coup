import { MessageData, PlayerData, validate, player, CardType } from "../";

export type BlockActionMessage =
  | BlockForeignAidAction
  | BlockStealAction
  | BlockAssassinateAction;

export interface BaseBlockAction extends MessageData {
  type: "BlockAction";
  payload: {
    action: {
      type: BlockActionMessage["payload"]["action"]["type"];
      target?: PlayerData;
      player: PlayerData;
      blockedWith: BlockActionMessage["payload"]["action"]["blockedWith"];
    };
  };
}

export const isBlockActionMessage = (
  message: MessageData
): message is BlockActionMessage =>
  validate(message, {
    type: "BlockAction",
    payload: {
      action: {
        type: "string",
        target: player,
        player,
        blockedWith: "string",
      },
    },
  });

export interface BlockForeignAidAction extends BaseBlockAction {
  payload: {
    action: {
      type: "ForeignAid";
      player: PlayerData;
      blockedWith: "duke";
    };
  };
}

export const isBlockForeignAidAction = (
  message: MessageData
): message is BlockForeignAidAction =>
  validate(message, {
    type: "BlockAction",
    payload: {
      action: {
        type: "ForeignAid",
        player,
        blockedWith: "string",
      },
    },
  });

export interface BlockStealAction extends BaseBlockAction {
  payload: {
    action: {
      type: "Steal";
      target: PlayerData;
      player: PlayerData;
      blockedWith: "captain" | "ambassador";
    };
  };
}

export const isBlockStealAction = (
  message: MessageData
): message is BlockStealAction =>
  validate(message, {
    type: "BlockAction",
    payload: {
      action: {
        type: "Steal",
        target: player,
        player,
        blockedWith: "string",
      },
    },
  });

export interface BlockAssassinateAction extends BaseBlockAction {
  payload: {
    action: {
      type: "Assassinate";
      target: PlayerData;
      player: PlayerData;
      blockedWith: "contessa";
    };
  };
}

export const isBlockAssassinateAction = (
  message: MessageData
): message is BlockAssassinateAction =>
  validate(message, {
    type: "BlockAction",
    payload: {
      action: {
        type: "Assassinate",
        target: player,
        player,
        blockedWith: "string",
      },
    },
  });
