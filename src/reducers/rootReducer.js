const initState = {
  convertSignal: false,
};
const rootReducer = (state = initState, action) => {
  switch (action.type) {
    //TO PREVENT FURTHER ADDITION IMAGE TO GET TRAININED
    case "STOP_TRAINING":
      return {
        ...state,
        convertSignal: action.sSignal,
      };

    default:
      return state;
  }
};

export default rootReducer;
