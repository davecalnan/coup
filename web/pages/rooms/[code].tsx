import { useEffect } from "react";
import Router from "next/router";

import { NextTurnMessage, StartGameMessage } from "server/src";

import { WaitingRoom, Players, PlayerHand } from "../../components";
import { useWebSocket, GameProvider, useLocalStorage } from "../../hooks";

const Room = () => {
  const name = useLocalStorage("name");

  useEffect(() => {
    if (!name) {
      Router.push(`/`);
    }
  }, []);

  const { ws, game } = useWebSocket();

  if (!ws) {
    return <div>No connection.</div>;
  }

  if (!game) {
    return <div>Setting up the room...</div>;
  }

  const startGame = () => {
    const message: StartGameMessage = {
      type: "StartGame",
      payload: {},
    };

    game.send(message);
  };

  const isCreator = game.creator.name === game.you.name;
  const hasEnoughPlayers = game.players.length >= game.minimumPlayers;
  const canStartGame = isCreator && hasEnoughPlayers;

  const nextTurn = () => {
    const message: NextTurnMessage = {
      type: "NextTurn",
      payload: {},
    };

    game.send(message);
  };

  const exit = () => ws.close();

  return (
    <GameProvider value={game}>
      <div className="flex justify-between p-6">
        <div>
          {game.status === "waitingForPlayers" && (
            <div>
              <p>
                {!hasEnoughPlayers &&
                  "Waiting for more players to start the game."}
                {hasEnoughPlayers &&
                  isCreator &&
                  "You can start the game now or wait for more players."}
                {hasEnoughPlayers &&
                  !isCreator &&
                  `Waiting for ${game.creator.name} to start the game.`}
              </p>
              {canStartGame && (
                <button
                  className="mt-4 px-3 py-2 rounded shadow bg-indigo-500 text-white"
                  onClick={startGame}
                >
                  Start Game
                </button>
              )}
            </div>
          )}
          {game.status === "playingGame" && <div>The game is underway!</div>}
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
      <PlayerHand />
    </GameProvider>
  );
};

export default Room;
