import React from "react";
import classNames from "classnames";

import { CardData } from "server/src";

export type PlayingCardProps = {
  card: CardData;
  className?: string;
};

export const PlayingCard = ({ card, className }: PlayingCardProps) => (
  <div
    className={classNames(
      "p-6 w-48 h-64 rounded-lg bg-gray-50 shadow-md border-blue-500 border-8",
      className
    )}
  >
    {card.type
      .split("")
      .map((letter, index) => (index === 0 ? letter.toUpperCase() : letter))
      .join("")}
  </div>
);
