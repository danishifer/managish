import { Dispatch } from "redux";
import { ApplicationState } from "../App";
import API from '../api';

export const PLACE_AUTOSUGGEST_REQUEST = 'PLACE_AUTOSUGGEST_REQUEST';
export const PLACE_AUTOSUGGEST_SUCCESS = 'PLACE_AUTOSUGGEST_SUCCESS';

export const placeAutosuggest = (query: string) => (dispatch: Dispatch, getState: () => ApplicationState) => {
  const startTime = Date.now();
  dispatch({ type: PLACE_AUTOSUGGEST_REQUEST });

  API.placeAutosuggest(query).then(results => {
    dispatch({
      type: PLACE_AUTOSUGGEST_SUCCESS,
      payload: {
        suggestions: results,
        requestTime: startTime
      }
    })
  }).catch(err => {
    console.log(err);
    console.log(JSON.stringify(err));
  })

}