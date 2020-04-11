import { createContext, useContext } from "react";

import { Game } from "./";

export const GameContext = createContext<Game | undefined>(undefined);
export const GameProvider = GameContext.Provider;

export const useGameContext = () => useContext<Game | undefined>(GameContext);
