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
          const isCurrentPlayer = player.name === game?.you?.name;
          const isCreator = player.name === game?.creator?.name;

          return (
            <li
              key={index}
              className={classNames(
                "flex justify-between",
                player.isActive && "text-green-500"
              )}
            >
              <span>
                {player.name}
                {isCreator && " [VIP]"}
                {isCurrentPlayer && " (you)"}
              </span>
              <span>
                {game.status === "playingGame" &&
                  `${player.coins} ${player.coins === 1 ? "coin" : "coins"}`}
              </span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
};
