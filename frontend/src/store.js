export const initialStore = () => {
  return {
    message: "hello world",
  };
};

export default function storeReducer(store, action = {}) {
  switch (action.type) {
    case "test":
      return {
        ...store,
        message:
          store.message === "hello world" ? "goodbye stars" : "hello world",
      };
    case "SET_MESSAGE":
      return {
        ...store,
        message: action.payload,
      };
  }
}
