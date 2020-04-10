import { useState, useEffect } from "react";
import { useRouter } from "next/router";

import {
  ServerMessage,
  JoinGameMessage,
  encode,
  ClientMessage,
  isNewHandMessage,
} from "server/src";

import { Game } from "../types";
import { useLocalStorage } from "../hooks";

const WS_URL = `ws://localhost:8080`;

export const useWebSocket = () => {
  const [state, setState] = useState<ServerMessage>();
  const [game, setGame] = useState<Game>();
  const [ws, setWs] = useState<WebSocket>();

  const router = useRouter();
  const { code } = router.query;

  const name = useLocalStorage("name");

  useEffect(() => {
    const ws = new WebSocket(WS_URL);
    setWs(ws);

    ws.onmessage = ({ data }) => {
      const message: ServerMessage = JSON.parse(data);
      console.log("[WS] Message received:", message);

      setGame((game) => {
        const isYourTurn =
          !!message.context.activePlayer &&
          message.context.activePlayer.name === message.context.you.name;
        const hand = isNewHandMessage(message)
          ? message.payload.hand
          : game?.hand;

        const extraContext = {
          isYourTurn,
          hand,
        };

        if (!game) {
          return {
            ...message.context,
            ...extraContext,
            send: (message: ClientMessage) => ws.send(encode(message)),
          };
        }

        return {
          ...game,
          ...message.context,
          ...extraContext,
        };
      });
    };

    ws.onclose = () => setWs(undefined);

    return ws.close;
  }, []);

  useEffect(() => {
    if (!name || !ws || !(typeof code === "string")) return;

    ws.onopen = () => {
      const message: JoinGameMessage = {
        type: "JoinGame",
        payload: { name, room: code },
      };

      ws.send(JSON.stringify(message));
    };
  }, [ws?.readyState]);

  return { ws, game, state };
};
