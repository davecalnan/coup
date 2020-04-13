import React from "react";
import classNames from "classnames";

import { useGameContext } from "../hooks";
import { Card } from "./";

export type PlayersProps = {};

export const Players = () => {
  const game = useGameContext();

  return (
    <Card className="w-64" title="Players">
      <ul className="list-disc list-inside">
        {game?.players?.map((player, index) => {
          const isCurrentPlayer = player.id === game?.you?.id;

          return (
            <li
              key={index}
              className={classNames(
                "flex justify-between",
                player.isActive && "text-green-500",
                player.isEliminated && "line-through"
              )}
            >
              <span>
                {player.name}
                {isCurrentPlayer && " (you)"}
              </span>
              <span>
                {game.status === "inProgress" &&
                  `${player.coins} ${player.coins === 1 ? "coin" : "coins"}`}
              </span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
};
