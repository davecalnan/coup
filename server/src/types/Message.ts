import { PlayerData, RoomData } from "../";

export interface MessagePayload {
  [key: string]: unknown;
}

export interface MessageData {
  type: string;
  payload: MessagePayload;
}

export type MessageContext = RoomData & {
  you: PlayerData;
};

export interface MessageWithContext extends MessageData {
  context: MessageContext;
}
