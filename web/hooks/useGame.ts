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
  isPlayerCanBlockMessage,
  isNewTurnMessage,
  PlayerCanBlockMessage,
  WithContext,
  BlockActionMessage,
  isAnyoneCanBlockMessage,
} from "server/src";

import { useLocalStorage } from "../hooks";

const WS_URL = `ws://localhost:8080`;

export type PlayerStatus = "idle" | "canStartGame" | "takeTurn" | "counteract";

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

export type BlockActionMeta = {
  type: BlockActionMessage["payload"]["action"]["type"];
  label: string;
  target: PlayerData;
  player: PlayerData;
  blockedWith: BlockActionMessage["payload"]["action"]["blockedWith"];
  isBluff: boolean;
  isDisabled: boolean;
};

export type BlockAction = {
  (): void;
} & BlockActionMeta;

export type BlockActions = {
  [key: string]: {
    [key: string]: BlockAction;
  };
};

export type Game = {
  ws: WebSocket | undefined;
  lastMessage: ServerMessage | undefined;
  isConnected: boolean;
  hand: CardData[] | undefined;
  yourStatus: PlayerStatus;
  isCreator: boolean;
  hasEnoughPlayers: boolean;
  send: SendMessageFn;
  actions: PlayerActions;
  counteractions: BlockActions;
  allow: (() => void) | undefined;
  leave: () => void;
} & Partial<MessageContext>;

export const useGame = (): Game => {
  const [ws, setWs] = useState<WebSocket>();
  const router = useRouter();
  const name = useLocalStorage("name");
  const id = useLocalStorage("id");

  const [lastMessage, setLastMessage] = useState<ServerMessage>();
  const [context, setContext] = useState<MessageContext>();
  const [hand, setHand] = useState<CardData[]>();

  const isConnected =
    typeof WebSocket !== "undefined" && ws?.readyState === WebSocket.OPEN;

  const isYourTurn =
    !!context?.activePlayer && context?.activePlayer.id === context?.you.id;

  const isCreator = !!context && context.creator.id === context.you.id;
  const hasEnoughPlayers =
    !!context && context?.players.length >= context?.minimumPlayers;
  const youCanStart = isCreator && hasEnoughPlayers;

  const determinePlayerStatus = (): PlayerStatus => {
    if (!lastMessage || !context) return "idle";

    if (context.status === "waitingForPlayers" && youCanStart) {
      return "canStartGame";
    }

    if (isNewTurnMessage(lastMessage) && isYourTurn) {
      return "takeTurn";
    }

    if (
      isAnyoneCanBlockMessage(lastMessage) &&
      lastMessage.payload.action.player.id !== context.you.id
    ) {
      return "counteract";
    }

    if (
      isPlayerCanBlockMessage(lastMessage) &&
      lastMessage.payload.action.target.id === context.you.id
    ) {
      return "counteract";
    }

    return "idle";
  };

  const yourStatus = determinePlayerStatus();

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

  const mustCoup = (context?.you.coins ?? 0) >= 10;

  const actions: PlayerActions = {
    income: createPlayerAction({
      type: "Income",
      label: "Take Income",
      isDisabled: !isYourTurn || mustCoup,
    }),
    foreignAid: createPlayerAction({
      type: "ForeignAid",
      label: "Take Foreign Aid",
      isDisabled: !isYourTurn || mustCoup,
    }),
    tax: createPlayerAction({
      type: "Tax",
      label: "Take Tax",
      isDisabled: !isYourTurn || mustCoup,
      isBluff: !hand?.find((card) => card.type === "duke"),
    }),
    steal: createPlayerAction({
      type: "Steal",
      label: "Steal from a player",
      isDisabled: !isYourTurn || mustCoup,
      isBluff: !hand?.find((card) => card.type === "captain"),
      needsTarget: true,
    }),
    assassinate: createPlayerAction({
      type: "Assassinate",
      label: "Assassinate a player",
      isDisabled: !isYourTurn || mustCoup || (context?.you.coins ?? 0) < 3,
      isBluff: !hand?.find((card) => card.type === "assassin"),
      needsTarget: true,
    }),
    exchange: createPlayerAction({
      type: "Exchange",
      label: "Exchange your cards",
      isDisabled: !isYourTurn || mustCoup,
      isBluff: !hand?.find((card) => card.type === "ambassador"),
    }),
    coup: createPlayerAction({
      type: "Coup",
      label: "Stage a coup",
      isDisabled: !isYourTurn || (context?.you.coins ?? 0) < 7,
      needsTarget: true,
    }),
  };

  const createBlockAction = useCallback(
    ({
      type,
      label,
      target,
      player,
      blockedWith,
      isBluff,
      isDisabled,
    }: BlockActionMeta): BlockAction =>
      Object.assign(
        () =>
          send({
            type: "BlockAction",
            payload: {
              action: {
                type,
                target,
                player,
                blockedWith,
              },
            },
          } as BlockActionMessage),
        { type, label, target, player, blockedWith, isBluff, isDisabled }
      ),
    [send]
  );

  const counteractions: BlockActions = {
    foreignAid: {
      duke: createBlockAction({
        type: "ForeignAid",
        label: "Block with Duke",
        target: context?.you as PlayerData,
        player: (lastMessage as WithContext<PlayerCanBlockMessage>)?.payload
          ?.action?.player,
        blockedWith: "duke",
        isBluff: !hand?.find((card) => card.type === "duke"),
        isDisabled: yourStatus !== "counteract",
      }),
    },
    steal: {
      captain: createBlockAction({
        type: "Steal",
        label: "Block with Captain",
        target: context?.you as PlayerData,
        player: (lastMessage as WithContext<PlayerCanBlockMessage>)?.payload
          ?.action?.player,
        blockedWith: "captain",
        isBluff: !hand?.find((card) => card.type === "captain"),
        isDisabled: yourStatus !== "counteract",
      }),
      ambassador: createBlockAction({
        type: "Steal",
        label: "Block with Ambassador",
        target: context?.you as PlayerData,
        player: (lastMessage as WithContext<PlayerCanBlockMessage>)?.payload
          ?.action?.player,
        blockedWith: "ambassador",
        isBluff: !hand?.find((card) => card.type === "ambassador"),
        isDisabled: yourStatus !== "counteract",
      }),
    },
    assassinate: {
      contessa: createBlockAction({
        type: "Assassinate",
        label: "Block with Contessa",
        target: context?.you as PlayerData,
        player: (lastMessage as WithContext<PlayerCanBlockMessage>)?.payload
          ?.action?.player,
        blockedWith: "contessa",
        isBluff: !hand?.find((card) => card.type === "contessa"),
        isDisabled: yourStatus !== "counteract",
      }),
    },
  };

  let allow = undefined;

  if (lastMessage && isAnyoneCanBlockMessage(lastMessage)) {
    allow = () =>
      send({
        type: "ConfirmAction",
        payload: {
          action: {
            type: lastMessage.payload.action.type,
            player: lastMessage.payload.action.player,
          },
        },
      });
  }

  if (lastMessage && isPlayerCanBlockMessage(lastMessage)) {
    allow = () =>
      send({
        type: "ConfirmAction",
        payload: {
          action: {
            type: lastMessage.payload.action.type as any,
            target: lastMessage.payload.action.target,
            player: lastMessage.payload.action.player,
          },
        },
      });
  }

  useEffect(() => {
    const { code } = router.query;
    if (!name || !ws || !(typeof code === "string")) return;

    ws.onopen = () => {
      const message: JoinGameMessage = {
        type: "JoinGame",
        payload: { id: id ?? undefined, name, room: code },
      };

      ws.send(JSON.stringify(message));
    };
  }, [ws?.readyState]);

  useEffect(() => {
    const ws = new WebSocket(WS_URL);
    setWs(ws);

    ws.onmessage = ({ data }) => {
      const message: ServerMessage = JSON.parse(data);
      setLastMessage(message);
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
    isConnected,
    lastMessage,
    hand,
    isCreator,
    hasEnoughPlayers,
    yourStatus,
    actions,
    counteractions,
    allow,
    send,
    leave,
  });
};
