import { useContext } from "react";
import { createContext } from "react";
import type { MainContextType } from "./mainContext";
import type { UserContextType } from "./userContext";

export const MainContext = createContext<MainContextType | undefined>(
  undefined,
);

export const UserContext = createContext<UserContextType | undefined>(
  undefined,
);

export function useUserContext() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useMainContext must be used within a MainProvider");
  }
  return context;
}

export function useMainContext() {
  const context = useContext(MainContext);
  if (!context) {
    throw new Error("useMainContext must be used within a MainProvider");
  }
  return context;
}

