import { useEffect } from "react";
import Router from "next/router";

import { StartGameMessage } from "server/src";

import { Players, PlayerHand, Button } from "../../components";
import {
  useGame,
  GameProvider,
  useLocalStorage,
  PlayerAction,
} from "../../hooks";

const Room = () => {
  const name = useLocalStorage("name");

  useEffect(() => {
    if (!name) {
      Router.push(`/`);
    }
  }, []);

  const game = useGame();

  if (!game.isConnected) {
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

  const handleAction = (action: PlayerAction) => {
    console.log("action.needsTarget:", action.needsTarget);
    let target = undefined;
    if (action.needsTarget) {
      const name = prompt(`Who do you want to target?`);
      target = game?.players?.find((player) => player.name === name);
    }

    action(target);
  };

  return (
    <GameProvider value={game}>
      <div className="flex justify-between p-6">
        <div>
          {game.status === "waitingForPlayers" && (
            <div>
              <p>
                {!game.hasEnoughPlayers &&
                  "Waiting for more players to start the game."}
                {game.hasEnoughPlayers &&
                  game.isCreator &&
                  "You can start the game now or wait for more players."}
                {game.hasEnoughPlayers &&
                  !game.isCreator &&
                  `Waiting for ${game.creator?.name} to start the game.`}
              </p>
              {game.youCanStart && (
                <Button className="mt-4" onClick={startGame} primary>
                  Start Game
                </Button>
              )}
            </div>
          )}
          {game.status === "playingGame" && (
            <div>
              <p>{game.isYourTurn && "It's your turn!"}</p>
              <p>
                {!game.isYourTurn && `It's ${game.activePlayer?.name}'s turn!`}
              </p>
              <div className="flex flex-wrap">
                {game.isYourTurn &&
                  Object.values(game.actions).map((action) => (
                    <Button
                      key={action.type}
                      className="mt-4 mr-4"
                      onClick={() => handleAction(action)}
                      disabled={action.isDisabled}
                      destructive={action.isBluff}
                    >
                      {action.label}
                    </Button>
                  ))}
              </div>
            </div>
          )}
        </div>
        <div>
          <Players />
          <div>
            <Button className="mt-4" onClick={game.leave} destructive>
              Leave game
            </Button>
          </div>
        </div>
      </div>
      <PlayerHand />
    </GameProvider>
  );
};

export default Room;
