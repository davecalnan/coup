import React from "react";
import classNames from "classnames";

import { useGame } from "../hooks";
import { Card } from "./";

export type PlayersProps = {};

export const Players = () => {
  const game = useGame();

  return (
    <Card className="w-64" title="Players">
      <ul className="list-disc list-inside">
        {game?.players.map((player, index) => {
          const isCurrentPlayer = player.name === game?.you.name;
          const isCreator = player.name === game?.creator.name;

          return (
            <li
              key={index}
              className={classNames(player.isActive && "text-green-500")}
            >
              {player.name}
              {isCreator && " [VIP]"}
              {isCurrentPlayer && " (you)"}
            </li>
          );
        })}
      </ul>
    </Card>
  );
};
