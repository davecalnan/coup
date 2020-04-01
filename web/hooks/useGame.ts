import { createContext, useContext } from "react";
import { Context } from "server/src";

export const GameContext = createContext<Context>(
  (undefined as unknown) as Context
);
export const GameProvider = GameContext.Provider;

export const useGame = () => useContext<Context>(GameContext);
