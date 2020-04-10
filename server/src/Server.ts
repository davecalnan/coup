import WebSocket from "ws";

import { decode, encode, ServerMessage, Room, Player } from "./";
import { isJoinGameMessage } from "./types";

const PORT = 8080;

const wss = new WebSocket.Server({ port: PORT });
console.log(`[WSS] Started server on port ${8080}`);

const rooms: Room[] = [];

wss.on("connection", (ws) => {
  let room: Room | undefined;
  let player: Player | undefined;

  ws.on("message", (encodedMessage: WebSocket.Data) => {
    try {
      const message = decode(encodedMessage);
      console.log(`[WSS] Received:`, encode(message));

      if (isJoinGameMessage(message)) {
        const existingRoom = rooms.find(
          (room) => room.code === message.payload.room
        );

        if (existingRoom) {
          room = existingRoom;
        } else {
          room = new Room({ code: message.payload.room });
          rooms.push(room);
          console.log(`[WSS] Creating new room: ${room.code}. Rooms:`);
        }

        player = new Player({
          room,
          connection: ws,
          name: message.payload.name,
        });

        console.log(`[WSS] Adding player ${player.name} to room ${room.code}`);
        room.addPlayer(player);

        ws.on("close", player.exit);
      }

      if (!room || !player) return;

      room.handleMessage(message, player);
    } catch (error) {
      console.error(`[WSS] Unrecognised message:`, error.message);
    }
  });
});
