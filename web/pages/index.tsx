import { useState, useEffect, FormEvent } from "react";
import classNames from "classnames";
import {
  Context,
  ServerMessage,
  isNewPlayerMessage,
  ClientMessage,
  PlayerData,
  NextTurnMessage
} from "server/src";

import { Card } from "../components";
import { GameProvider, useGame } from "../hooks";

const WS_URL = `ws://localhost:8080`;

const SendMessage = ({ connection }: { connection: WebSocket }) => {
  const [message, setMessage] = useState<string>("");
  const reset = () => setMessage("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    connection.send(message);

    reset();
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={message}
        onChange={event => setMessage(event.target.value)}
        className="border"
      />
      <button type="submit">Send</button>
    </form>
  );
};

type Room = Context;

const JoinRoom = ({ connection }: { connection: WebSocket }) => {
  const [name, setName] = useState<string>("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const message: ClientMessage = {
      type: "Hello",
      payload: { name }
    };

    connection.send(JSON.stringify(message));
  };

  return (
    <main className="h-full flex flex-col justify-center items-center">
      <Card>
        <form onSubmit={handleSubmit}>
          <label htmlFor="name" className="block">
            What's your name?
          </label>
          <input
            name="name"
            value={name}
            onChange={event => setName(event.target.value)}
            className="border"
          />
          <button type="submit">Send</button>
        </form>
      </Card>
    </main>
  );
};

const Home = () => {
  const [connection, setConnection] = useState<WebSocket>();
  const [messages, setMessages] = useState<ServerMessage[]>([]);
  const [game, setGame] = useState<Room>();

  useEffect(() => {
    const ws = new WebSocket(WS_URL);
    setConnection(ws);

    ws.onmessage = ({ data }) => {
      const message: ServerMessage = JSON.parse(data);
      const { type, payload, context } = message;
      console.log("[WS] Message received:", message);

      if (isNewPlayerMessage(message)) {
        if (message.payload.player.name !== message.context.you.name) {
          alert(`New player joined: ${message.payload.player.name}`);
        }
      }

      setMessages(messages => [...messages, message]);
      setGame(context);
    };

    ws.onclose = () => setConnection(undefined);

    return ws.close;
  }, []);

  if (!connection) {
    return <div>No connection.</div>;
  }

  if (!game) {
    return <JoinRoom connection={connection} />;
  }

  const nextTurn = () => {
    const message: NextTurnMessage = {
      type: "NextTurn",
      payload: {}
    };

    connection.send(JSON.stringify(message));
  };

  const exit = () => connection.close();

  return (
    <GameProvider value={game}>
      <div className="flex justify-between p-6">
        <div>
          <button
            className="mt-4 px-3 py-2 rounded shadow bg-indigo-500 text-white"
            onClick={nextTurn}
          >
            Next turn
          </button>
        </div>
        <div>
          <Players />
          <div>
            <button
              className="mt-4 px-3 py-2 rounded shadow bg-red-500 text-white"
              onClick={exit}
            >
              Leave game
            </button>
          </div>
        </div>
      </div>
    </GameProvider>
  );
};

const Players = () => {
  const { players, you } = useGame();

  return (
    <Card className="w-64" title="Players">
      <ul className="ml-4">
        {players.map((player, index) => {
          const playerIsActive = player.name === you.name;

          return (
            <li
              key={index}
              className={classNames(
                "list-disc",
                player.isActive && "text-green-500"
              )}
            >
              {player.name}
              {playerIsActive && " (you)"}
            </li>
          );
        })}
      </ul>
    </Card>
  );
};

export type LayoutProps = {
  children: React.ReactNode;
};

export const Layout = ({ children }: LayoutProps) => (
  <div className="min-h-screen h-0 bg-gray-200">{children}</div>
);

export default () => (
  <Layout>
    <Home />
  </Layout>
);
