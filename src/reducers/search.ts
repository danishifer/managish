import { SEARCH_SUBMIT_REQUEST, SEARCH_SUBMIT_SUCCESS, SEARCH_TOGGLE_PLACE_TYPES, SEARCH_SET_PLACE_TYPE, SEARCH_TOGGLE_FEATURE_TYPES, SEARCH_TOGGLE_FEATURE, SEARCH_EXIT_RESULT } from './../actions/search';
import update from 'immutability-helper';
import { SEARCH_TOGGLE_FILTERS, SEARCH_QUERY_CHANGE, SEARCH_CHOOSE_RESULT } from '../actions/search';

export interface SearchState {
  filtersOpen: boolean,
  placeTypeOpen: boolean,
  loading: boolean,
  query: string,
  results?: string[],
  placeType: string,
  featureTypesOpen: boolean,
  features: { [id: string]: boolean },
  chosenResultIndex?: number,
  isResultSelected: boolean,
}

const initialState: SearchState = {
  filtersOpen: false,
  placeTypeOpen: false,
  featureTypesOpen: false,
  loading: false,
  isResultSelected: false,
  query: '',
  placeType: '',
  features: {},
}

export default function(state = initialState, action: any) {
  switch(action.type) {
    case SEARCH_TOGGLE_FILTERS:
      return update(state, {
        filtersOpen: { $set: !state.filtersOpen }
      })
    case SEARCH_QUERY_CHANGE:
      return update(state, {
        query: { $set: action.payload }
      })
    case SEARCH_SUBMIT_REQUEST:
      return update(state, {
        loading: { $set: true }
      })
    case SEARCH_SUBMIT_SUCCESS:
      return update(state, {
        loading: { $set: false },
        results: { $set: action.payload.map(place => place.id) }
      })
    case SEARCH_TOGGLE_PLACE_TYPES:
      return update(state, {
        placeTypeOpen: { $set: !state.placeTypeOpen }
      })
    case SEARCH_SET_PLACE_TYPE:
      return update(state, {
        placeType: { $set: action.payload }
      })
    case SEARCH_TOGGLE_FEATURE_TYPES:
      return update(state, {
        featureTypesOpen: { $set: !state.featureTypesOpen }
      })
    case SEARCH_TOGGLE_FEATURE:
      return update(state, {
        features: { [action.payload]: { $set: !state.features[action.payload] } }
      })
    case SEARCH_CHOOSE_RESULT:
      return update(state, {
        isResultSelected: { $set: true },
        chosenResultIndex: { $set: action.payload }
      })
    case SEARCH_EXIT_RESULT:
      return update(state, {
        isResultSelected: { $set: false },
      })
    default:
      return state;
  }
}