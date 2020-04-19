import { useEffect } from "react";
import Router from "next/router";
import classNames from "classnames";

import {
  isPlayerCanBlockMessage,
  isAnyoneCanBlockMessage,
  isPlayerMustChooseCardsMessage,
  CardData,
  isActionPendingMessage,
  ActionPendingMessage,
} from "server/src";

import { Players, PlayerHand, Button, PlayingCard } from "../../components";
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

  const startGame = () =>
    game.send({
      type: "StartGame",
      payload: {},
    });

  const handleAction = (action: PlayerAction) => {
    let target = undefined;
    if (action.needsTarget) {
      const name = prompt(`Who do you want to target?`);
      target = game?.players?.find((player) => player.name === name);
    }

    action(target);
  };

  const hasChosenEnoughCards =
    !!game.chosenCards &&
    !!game.numberOfCardsToChoose &&
    game.chosenCards.length === game.numberOfCardsToChoose;

  const chooseCards = () => {
    if (
      !(
        hasChosenEnoughCards &&
        game.chosenCards &&
        game.hand &&
        game.lastMessage &&
        isPlayerMustChooseCardsMessage(game.lastMessage)
      )
    ) {
      return;
    }

    const returnedCards = [
      ...game.hand,
      ...game.lastMessage.payload.cards,
    ].filter(
      (card) =>
        !(game.chosenCards as CardData[]).find(({ id }) => card.id === id)
    );

    game.send({
      type: "ChooseCards",
      payload: {
        chosenCards: game.chosenCards,
        returnedCards,
      },
    });
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
          {game.status === "inProgress" && (
            <div>
              {game.yourStatus === "eliminated" && (
                <p>You have been eliminated.</p>
              )}
              {game.yourStatus === "idle" && <p>Waiting for your turn.</p>}
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
              {game.yourStatus === "challenge" &&
                !!game.lastMessage &&
                isActionPendingMessage(game.lastMessage) && (
                  <>
                    {game.activePlayer?.id === game.you?.id && (
                      <p>
                        Waiting to see if someone will challenge your{" "}
                        {game.lastMessage.payload.action.type.toLowerCase()}.
                      </p>
                    )}
                    {game.activePlayer?.id !== game.you?.id && (
                      <>
                        <p>
                          Want to challenge {game.activePlayer?.name}'s{" "}
                          {game.lastMessage.payload.action.type.toLowerCase()}?
                        </p>
                        <div className="flex">
                          <Button
                            onClick={() =>
                              game.send({
                                type: "ChallengeAction",
                                payload: {
                                  action: {
                                    id: (game.lastMessage as ActionPendingMessage)
                                      .payload.action.id,
                                  },
                                },
                              })
                            }
                            primary
                          >
                            Challenge
                          </Button>
                          <Button className="ml-4" primary>
                            Challenge
                          </Button>
                        </div>
                      </>
                    )}
                  </>
                )}
              {game.yourStatus === "counteract" &&
                !!game.lastMessage &&
                (isPlayerCanBlockMessage(game.lastMessage) ||
                  isAnyoneCanBlockMessage(game.lastMessage)) && (
                  <>
                    <p>
                      Want to block {game.activePlayer?.name}'s{" "}
                      {game.lastMessage.payload.action.type.toLowerCase()}?
                    </p>
                    <div className="flex">
                      {game.lastMessage.payload.action.type === "ForeignAid" &&
                        Object.values(game.counteractions.foreignAid).map(
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
                      {game.lastMessage.payload.action.type === "Assassinate" &&
                        Object.values(game.counteractions.assassinate).map(
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
              {game.yourStatus === "chooseCardToLose" && (
                <p>You must choose a card to lose.</p>
              )}
              {game.yourStatus === "chooseCards" && (
                <>
                  <p>
                    Choose {game.hand?.length === 1 && "one card"}
                    {game.hand?.length === 2 && "two cards"} to keep.
                  </p>
                  {game.yourStatus === "chooseCards" && (
                    <Button
                      onClick={chooseCards}
                      disabled={!hasChosenEnoughCards}
                      className="mt-4"
                      primary
                    >
                      Choose cards
                    </Button>
                  )}
                </>
              )}
            </div>
          )}
          {game.status === "over" && (
            <div>
              <p>Game Over</p>
              {game.winner?.id === game.you?.id && <p>You won!</p>}
              {game.winner?.id !== game.you?.id && (
                <p>{game.winner?.name} is the winner.</p>
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
      <div className="mt-6">
        {game.yourStatus === "chooseCards" &&
          !!game.lastMessage &&
          isPlayerMustChooseCardsMessage(game.lastMessage) && (
            <div className="flex justify-center">
              {game.lastMessage.payload.cards.map((card, index) => (
                <PlayingCard
                  key={card.id}
                  card={card}
                  className={classNames(index === 1 && "ml-4")}
                />
              ))}
            </div>
          )}
      </div>
      <PlayerHand />
    </GameProvider>
  );
};

export default Room;
