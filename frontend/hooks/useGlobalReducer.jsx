import { useContext } from "react";
import { StoreContext } from "./StoreContext";

export default function useGlobalReducer() {
  const { dispatch, store } = useContext(StoreContext);
  return { dispatch, store };
}
