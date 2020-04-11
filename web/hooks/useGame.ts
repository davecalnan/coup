import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";

import {
  ServerMessage,
  JoinGameMessage,
  encode,
  ClientMessage,
  isNewHandMessage,
  MessageContext,
  CardData,
  PlayerActionMessage,
  PlayerData,
} from "server/src";

import { useLocalStorage } from "../hooks";

const WS_URL = `ws://localhost:8080`;

export type SendMessageFn = (message: ClientMessage) => void;

export type PlayerActionMeta = {
  type: PlayerActionMessage["payload"]["action"]["type"];
  label: string;
  isDisabled: boolean;
  isBluff?: boolean;
  needsTarget?: boolean;
};

export type PlayerAction = {
  (target?: PlayerData): void;
} & PlayerActionMeta;

export type PlayerActions = {
  [key: string]: PlayerAction;
};

export type Game = {
  ws: WebSocket | undefined;
  hand: CardData[] | undefined;
  isConnected: boolean;
  isYourTurn: boolean;
  isCreator: boolean;
  hasEnoughPlayers: boolean;
  youCanStart: boolean;
  send: SendMessageFn;
  actions: PlayerActions;
  leave: () => void;
} & Partial<MessageContext>;

export const useGame = (): Game => {
  const [ws, setWs] = useState<WebSocket>();
  const router = useRouter();
  const name = useLocalStorage("name");

  const [context, setContext] = useState<MessageContext>();
  const [hand, setHand] = useState<CardData[]>();

  const isConnected =
    typeof WebSocket !== "undefined" && ws?.readyState === WebSocket.OPEN;

  const isYourTurn =
    !!context?.activePlayer && context?.activePlayer.name === context?.you.name;

  const isCreator = !!context && context.creator.name === context.you.name;
  const hasEnoughPlayers =
    !!context && context?.players.length >= context?.minimumPlayers;
  const youCanStart = isCreator && hasEnoughPlayers;

  const send: SendMessageFn = useCallback(
    (message) => {
      if (ws) ws.send(encode(message));
    },
    [ws]
  );

  const leave = () => ws?.close();

  const createPlayerAction = useCallback(
    ({
      type,
      label,
      isDisabled,
      isBluff,
      needsTarget,
    }: PlayerActionMeta): PlayerAction =>
      Object.assign(
        (target?: PlayerData) =>
          send({
            type: "TakeAction",
            payload: {
              action: {
                type: type as any,
                target,
              },
            },
          }),
        {
          type,
          label,
          isDisabled,
          isBluff,
          needsTarget,
        }
      ),
    [send]
  );

  const actions: PlayerActions = {
    income: createPlayerAction({
      type: "Income",
      label: "Take Income",
      isDisabled: !isYourTurn,
    }),
    foreignAid: createPlayerAction({
      type: "ForeignAid",
      label: "Take Foreign Aid",
      isDisabled: !isYourTurn,
    }),
    tax: createPlayerAction({
      type: "Tax",
      label: "Take Tax",
      isDisabled: !isYourTurn,
      isBluff: !hand?.find((card) => card.type === "duke"),
    }),
    steal: createPlayerAction({
      type: "Steal",
      label: "Steal from a player",
      isDisabled: !isYourTurn,
      isBluff: !hand?.find((card) => card.type === "captain"),
      needsTarget: true,
    }),
    assassinate: createPlayerAction({
      type: "Assassinate",
      label: "Assassinate a player",
      isDisabled: !isYourTurn,
      isBluff: !hand?.find((card) => card.type === "assassin"),
      needsTarget: true,
    }),
    exchange: createPlayerAction({
      type: "Exchange",
      label: "Exchange your cards",
      isDisabled: !isYourTurn,
      isBluff: !hand?.find((card) => card.type === "ambassador"),
    }),
    coup: createPlayerAction({
      type: "Coup",
      label: "Stage a coup",
      isDisabled: !isYourTurn || (context?.you.coins ?? 0) < 10,
      needsTarget: true,
    }),
  };

  useEffect(() => {
    const { code } = router.query;
    if (!name || !ws || !(typeof code === "string")) return;

    ws.onopen = () => {
      const message: JoinGameMessage = {
        type: "JoinGame",
        payload: { name, room: code },
      };

      ws.send(JSON.stringify(message));
    };
  }, [ws?.readyState]);

  useEffect(() => {
    const ws = new WebSocket(WS_URL);
    setWs(ws);

    ws.onmessage = ({ data }) => {
      const message: ServerMessage = JSON.parse(data);
      console.log("[WS] Message received:", message);

      setContext(message.context);

      if (isNewHandMessage(message)) {
        setHand(message.payload.hand);
      }
    };

    ws.onclose = () => setWs(undefined);

    return ws.close;
  }, []);

  return Object.assign(context ?? {}, {
    ws,
    hand,
    isConnected,
    isCreator,
    hasEnoughPlayers,
    youCanStart,
    isYourTurn,
    actions,
    send,
    leave,
  });
};
