import { MessageData, PlayerData, validate, player, CardType } from "../";

export type BlockActionMessage = BlockStealAction;

export interface BaseBlockAction extends MessageData {
  type: "BlockAction";
  payload: {
    action: {
      type: BlockActionMessage["payload"]["action"]["type"];
      target: PlayerData;
      with: Omit<CardType, "assassin">;
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
        with: "string",
      },
    },
  });

export interface BlockStealAction extends BaseBlockAction {
  payload: {
    action: {
      type: "Steal";
      target: PlayerData;
      with: "captain" | "ambassador";
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
        with: "string",
      },
    },
  });
