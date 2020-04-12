import { useEffect } from "react";
import Router from "next/router";

import { StartGameMessage, isPlayerCanBlockMessage } from "server/src";

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

  require("react").useEffect(
    () => console.log("game.yourStatus:", game.yourStatus),
    [game.yourStatus]
  );

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
              {game.yourStatus === "canStartGame" && (
                <Button className="mt-4" onClick={startGame} primary>
                  Start Game
                </Button>
              )}
            </div>
          )}
          {game.status === "playingGame" && (
            <div>
              <p>{game.yourStatus === "idle" && `Waiting for your turn.`}</p>
              {game.yourStatus === "takeTurn" && (
                <>
                  <p>It's your turn!</p>
                  <div className="flex flex-wrap">
                    {game.yourStatus === "takeTurn" &&
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
                </>
              )}
              {game.yourStatus === "counteract" &&
                !!game.lastMessage &&
                isPlayerCanBlockMessage(game.lastMessage) && (
                  <>
                    <p>
                      Want to block {game.activePlayer?.name}'s{" "}
                      {game.lastMessage.payload.action.type.toLowerCase()}?
                    </p>
                    <div className="flex">
                      {game.lastMessage.payload.action.type === "Steal" &&
                        Object.values(game.counteractions.steal).map(
                          (action) => (
                            <Button
                              key={`${action.type}-${action.blockedWith}`}
                              className="mt-4 mr-4"
                              onClick={action}
                              disabled={action.isDisabled}
                              destructive={action.isBluff}
                            >
                              {action.label}
                            </Button>
                          )
                        )}
                      <Button className="mt-4 mr-4" onClick={game.allow}>
                        Don't Block
                      </Button>
                    </div>
                  </>
                )}
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
