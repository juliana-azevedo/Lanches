import { useEffect, useState, type ReactNode } from "react";
import { MainContext, UserContext } from "./context";
import { decodeToken } from "../service/api.service";

interface User {
  id: string;
  username: string;
  isAdmin: boolean;
}

export interface UserContextType {
  user: User | null;
  setUser: (value: User | null) => void;
  loading: boolean;
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = decodeToken();
  
    if (token !== undefined) {
      setUser({
        id: token.id,
        username: token.username,
        isAdmin: token.isAdmin,
      });
      setLoading(false);
    }
  }, []);
  
  return (
    <UserContext.Provider
      value={{
        user, setUser, loading
      }}
    >
     {children}
    </UserContext.Provider>
  );
}
