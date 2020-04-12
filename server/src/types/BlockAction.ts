import { MessageData, PlayerData, validate, player, CardType } from "../";

export type BlockActionMessage = BlockStealAction;

export interface BaseBlockAction extends MessageData {
  type: "BlockAction";
  payload: {
    action: {
      type: BlockActionMessage["payload"]["action"]["type"];
      target: PlayerData;
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
