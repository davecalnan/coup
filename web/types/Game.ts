import { ClientMessage, MessageContext, CardData } from "server/src";

export type Game = MessageContext & {
  isYourTurn: boolean;
  hand: CardData[] | undefined;
  send: (data: ClientMessage) => void;
};
