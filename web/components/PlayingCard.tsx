import React from "react";
import classNames from "classnames";

import { CardData, isPlayerMustChooseCardToLoseMessage } from "server/src";

import { useGameContext } from "../hooks";
import { Button } from "./";

export type PlayingCardProps = {
  card: CardData;
  className?: string;
};

const determineBorderColor = (card: CardData, isChosen?: boolean) => {
  if (card.isDead) return "border-red-500";
  if (isChosen) return "border-green-500";
  return "border-blue-500";
};

export const PlayingCard = ({ card, className }: PlayingCardProps) => {
  const game = useGameContext();

  if (!game) return null;

  const cardType = card.type
    .split("")
    .map((letter, index) => (index === 0 ? letter.toUpperCase() : letter))
    .join("");

  const loseCard = () => {
    if (
      !(
        game.lastMessage &&
        isPlayerMustChooseCardToLoseMessage(game.lastMessage)
      )
    )
      return;

    game.send({
      type: "LoseCard",
      payload: { card, action: { id: game.lastMessage.payload.action.id } },
    });
  };

  const toggleCardChosen = () => {
    if (game?.toggleCardChosen) {
      game.toggleCardChosen(card);
    }
  };

  const isChosen = !!game?.chosenCards?.find(({ id }) => card.id === id);

  return (
    <div
      className={classNames(
        "p-6 w-48 h-64 rounded-lg bg-gray-50 shadow-md border-8",
        "transition-transform duration-500 ease-in-out transform hover:-translate-y-2 hover:scale-110 hover:z-10 hover:shadow-lg",
        determineBorderColor(card, isChosen),
        className
      )}
    >
      <h4 className={classNames(card.isDead && "line-through")}>{cardType}</h4>
      {game.yourStatus === "chooseCardToLose" && !card.isDead && (
        <div>
          <Button className="mt-4" onClick={loseCard}>
            Lose card
          </Button>
        </div>
      )}
      {game.yourStatus === "chooseCards" && !card.isDead && (
        <div>
          <Button className="mt-4" onClick={toggleCardChosen}>
            {isChosen && "Deselect card"}
            {!isChosen && "Select card"}
          </Button>
        </div>
      )}
    </div>
  );
};
