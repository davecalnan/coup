import { createContext, useContext } from "react";
import { Game } from "../types";

export const GameContext = createContext<Game | undefined>(undefined);
export const GameProvider = GameContext.Provider;

export const useGame = () => useContext<Game | undefined>(GameContext);
