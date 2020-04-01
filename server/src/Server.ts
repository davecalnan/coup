import WebSocket from "ws";

import { Room, Player, decode, isHelloMessage, isNextTurnMessage } from "./";

const PORT = 8080;

const wss = new WebSocket.Server({ port: PORT });
console.log(`[WSS] Started server on port ${8080}`);

const room = new Room();

wss.on("connection", ws => {
  ws.on("message", (encodedMessage: WebSocket.Data) => {
    try {
      const message = decode(encodedMessage);
      console.log(`[WSS] Received:`, JSON.stringify(message, null, 2));

      if (isHelloMessage(message)) {
        const player = new Player({
          room,
          connection: ws,
          name: message.payload.name
        });
        room.addPlayer(player);

        ws.on("close", player.exit);

        return;
      }

      if (isNextTurnMessage(message)) {
        return room.nextTurn();
      }
    } catch (error) {
      console.error(`[WSS] Unrecognised message:`, error.message);
    }
  });
});
