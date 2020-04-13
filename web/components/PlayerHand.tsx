import classNames from "classnames";

import { PlayingCard } from "./";
import { useGameContext } from "../hooks";

export const PlayerHand = () => {
  const game = useGameContext();

  if (!game?.hand) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 pointer-events-none">
      <div className="w-max-content mx-auto pt-10 px-16 flex flex-row-reverse justify-center pointer-events-auto transition-transform duration-500 ease-in-out translate-y-20 transform hover:translate-y-0">
        {[...game.hand].reverse().map((card, index) => (
          <PlayingCard
            key={card.id}
            card={card}
            className={classNames(index > 0 && "-mr-4 -mt-1")}
          />
        ))}
      </div>
    </div>
  );
};
