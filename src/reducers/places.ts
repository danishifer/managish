import { PlaceSuggestion } from '../api';
import { PLACE_AUTOSUGGEST_REQUEST, PLACE_AUTOSUGGEST_SUCCESS } from '../actions/places';
import update from 'immutability-helper';


export interface PlacesState {
  suggestions: PlaceSuggestion[],
  lastSuggestionTime: number
}

const initialState: PlacesState = {
  suggestions: [],
  lastSuggestionTime: 0
}

export default function(state = initialState, action: any) {
  switch(action.type) {
    case PLACE_AUTOSUGGEST_REQUEST:
      return state;
    case PLACE_AUTOSUGGEST_SUCCESS:
      return update(state, {
        suggestions: { $set: action.payload.suggestions }
      })
    default:
      return state;
  }
}