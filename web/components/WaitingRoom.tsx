import React from "react";

import { Game } from "../types";
import { GameProvider } from "../hooks";
import { JoinGame, Players } from "./";

export type WaitingRoomProps = {
  game?: Game;
  chooseName: (name: string) => void;
  startGame: () => void;
};

export const WaitingRoom = ({
  game,
  chooseName,
  startGame,
}: WaitingRoomProps) => {
  if (!game) {
    return <JoinGame chooseName={chooseName} />;
  }

  return (
    <GameProvider value={game}>
      <Players />
    </GameProvider>
  );
};
