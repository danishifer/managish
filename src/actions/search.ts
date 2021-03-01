import { Dispatch } from "redux";
import { ApplicationState } from "../App";
import API from '../api';

export const SEARCH_TOGGLE_FILTERS = 'SEARCH_TOGGLE_FILTERS';
export const SEARCH_QUERY_CHANGE = 'SEARCH_QUERY_CHANGE';
export const SEARCH_SUBMIT_REQUEST = 'SEARCH_SUBMIT_REQUEST';
export const SEARCH_SUBMIT_SUCCESS = 'SEARCH_SUBMIT_SUCCESS';
export const SEARCH_TOGGLE_PLACE_TYPES = 'SEARCH_TOGGLE_PLACE_TYPES';
export const SEARCH_SET_PLACE_TYPE = 'SEARCH_SET_PLACE_TYPE';
export const SEARCH_TOGGLE_FEATURE_TYPES = 'SEARCH_TOGGLE_FEATURE_TYPES';
export const SEARCH_TOGGLE_FEATURE = 'SEARCH_TOGGLE_FEATURE';
export const SEARCH_CHOOSE_RESULT = 'SEARCH_CHOOSE_RESULT';
export const SEARCH_EXIT_RESULT = 'SEARCH_EXIT_RESULT';

export const exitResult = () => ({
  type: SEARCH_EXIT_RESULT
})

export const chooseResult = (resultIndex) => ({
  type: SEARCH_CHOOSE_RESULT,
  payload: resultIndex
});

export const toggleFilters = () => ({
  type: SEARCH_TOGGLE_FILTERS
})

export const queryChange = (query: string) => ({
  type: SEARCH_QUERY_CHANGE,
  payload: query
})

export const togglePlaceTypes = () => ({
  type: SEARCH_TOGGLE_PLACE_TYPES
})

export const toggleFeatureTypes = () => ({
  type: SEARCH_TOGGLE_FEATURE_TYPES
})

export const toggleFeature = (featureId: string) => ({
  type: SEARCH_TOGGLE_FEATURE,
  payload: featureId
})

export const setPlaceType = (placeType: string) => ({
  type: SEARCH_SET_PLACE_TYPE,
  payload: placeType
})

export const search = () => (dispatch: Dispatch, getState: () => ApplicationState): Promise<any> => {
  const state = getState();

  dispatch({ type: SEARCH_SUBMIT_REQUEST })

  return new Promise((resolve) => {
    let useFilters = state.search.filtersOpen;
    const type = useFilters && state.search.placeType
    const features = useFilters && Object.entries(state.search.features).filter(e => e[1]).map(e => e[0]);

    API.search(state.search.query, type, features)
    .then(res => {
        resolve();
        dispatch({
          type: SEARCH_SUBMIT_SUCCESS,
          payload: res
        })
      }).catch(err => {
        console.log(err);
        console.log(JSON.stringify(err));
      })
  })
}