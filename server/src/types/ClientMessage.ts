import { PlayerActionMessage, MessageData, validate } from "../";
import { BlockActionMessage } from "./BlockAction";
import { ConfirmActionMessage } from "./ConfirmAction";

export type ClientMessage =
  | JoinGameMessage
  | LeaveGameMessage
  | StartGameMessage
  | PlayerActionMessage
  | BlockActionMessage
  | ConfirmActionMessage;

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
