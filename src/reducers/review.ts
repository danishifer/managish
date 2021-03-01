import { REVIEW_FOCUS, REVIEW_FORM_TOGGLE_SERVICE_LIST, REVIEW_FORM_TOGGLE_FEATURE, REVIEW_SET_PLACE_SUGGESTION, REVIEW_IMAGE_REQUEST, REVIEW_IMAGE_CHANGE, REVIEW_TEXT_CHANGE, REVIEW_CANCEL_IMAGE } from '../actions/index';
import update from 'immutability-helper';
import { PlaceType, PlaceSuggestion } from '../api';
import { REVIEW_SET_PLACE_TYPE, REVIEW_FORM_TOGGLE_FEATURES_LIST, REVIEW_FORM_TOGGLE_LOCATION_PICKER } from '../actions';
import { REVIEW_SUBMIT_REQUEST, REVIEW_SUBMIT_SUCCESS } from '../actions/review';

export interface ReviewForm {
  isFocused: boolean,
  service: string,
  serviceListOpen: boolean,
  featuresListOpen: boolean,
  locationPickerOpen: boolean,
  placeType?: PlaceType,
  features: { [id: string]: boolean },
  selectedPlaceSuggestion?: PlaceSuggestion,
  imageData?: any,
  imageLoading: boolean,
  text: string,
  submitLoading: boolean
}

const initialState: ReviewForm = {
  isFocused: false,
  service: "",
  serviceListOpen: false,
  featuresListOpen: false,
  locationPickerOpen: false,
  features: {},
  imageLoading: false,
  text: '',
  submitLoading: false
}

export default function(state = initialState, action: any) {
  switch(action.type) {
    case REVIEW_FOCUS:
      return update(state, {
        isFocused: { $set: action.payload }
      })
    case REVIEW_FORM_TOGGLE_SERVICE_LIST:
      return update(state, {
        serviceListOpen: { $set: !state.serviceListOpen }
      })
    case REVIEW_FORM_TOGGLE_LOCATION_PICKER:
      return update(state, {
        locationPickerOpen: { $set: !state.locationPickerOpen }
      })
    case REVIEW_FORM_TOGGLE_FEATURES_LIST:
      return update(state, {
        featuresListOpen: { $set: !state.featuresListOpen }
      })
    case REVIEW_FORM_TOGGLE_FEATURE:
      return update(state, {
        features: { [action.payload]: { $set: !state.features[action.payload] } }
      })
    case REVIEW_SET_PLACE_SUGGESTION:
      return update(state, {
        selectedPlaceSuggestion: { $set: action.payload }
      })
    case REVIEW_SET_PLACE_TYPE:
      return update(state, {
        placeType: { $set: action.payload }
      })
    case REVIEW_IMAGE_REQUEST:
      return update(state, {
        imageLoading: { $set: true }
      })
    case REVIEW_IMAGE_CHANGE:
      return update(state, {
        imageLoading: { $set: false },
        imageData: { $set: action.payload }
      })
    case REVIEW_TEXT_CHANGE:
      return update(state, {
        text: { $set: action.payload }
      })
    case REVIEW_SUBMIT_REQUEST:
      return update(state, {
        submitLoading: { $set: true }
      })
    case REVIEW_CANCEL_IMAGE:
      return update(state, {
        imageLoading: { $set: false }
      })
    case REVIEW_SUBMIT_SUCCESS:
      return initialState;
    default:
      return state;
  }
}