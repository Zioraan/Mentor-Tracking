import { useReducer } from "react";
import { StoreContext } from "./StoreContext";
import storeReducer, { initialStore } from "../src/store";

export function StoreProvider({ children }) {
  const [store, dispatch] = useReducer(storeReducer, initialStore());
  return (
    <StoreContext.Provider value={{ store, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
}
