import useGlobalReducer from "./useGlobalReducer";

export const useActions = () => {
  const { store, dispatch } = useGlobalReducer();

  const test = () => {
    console.log("Test action executed", store.message);
    dispatch({
      type: "SET_MESSAGE",
      payload: "Action executed successfully!",
    });
  };

  return {
    test,
  };
};
