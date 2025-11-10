import { useContext } from "react";
import { createContext } from "react";
import type { MainContextType } from "./mainContext";

export const MainContext = createContext<MainContextType | undefined>(
  undefined,
);

export function useMainContext() {
  const context = useContext(MainContext);
  if (!context) {
    throw new Error("useMainContext must be used within a MainProvider");
  }
  return context;
}

