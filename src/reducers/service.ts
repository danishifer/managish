import { SEARCH_SUBMIT_REQUEST, SEARCH_EXIT_RESULT } from './../actions/search';
import { Place } from './../api';
import { SERVICE_FETCH_PLACE_REVIEWS_REQUEST, SERVICE_FETCH_PLACE_REVIEWS_SUCCESS, SERVICE_REVIEW_SUBMIT_SUCCESS,
  SERVICE_REVIEW_TOGGLE_REPLIES,
  SERVICE_REVIEW_LIKE_ADD_SUCCESS,
  SERVICE_REPLY_INPUT_CHANGE,
  SERVICE_REPLY_SEND_REQUEST,
  SERVICE_REPLY_SEND_SUCCESS, 
  SERVICE_FETCH_PLACE_PHOTOS_SUCCESS} from './../actions/service';
import update from 'immutability-helper';

export interface ServiceState {
  imagesLoading: boolean,
  reviewsLoading: boolean,
  place?: Place,
  images: string[],
  openReplies: { [reviewId: string]: boolean },
  repliesText: { [reviewId: string]: string },
  repliesLoading: { [reviewId: string]: boolean },
}

const initialState: ServiceState = {
  imagesLoading: true,
  reviewsLoading: true,
  openReplies: {},
  repliesText: {},
  repliesLoading: {},
  images: []
}

export default function(state = initialState, action: any) {
  switch(action.type) {
    case SERVICE_REVIEW_TOGGLE_REPLIES:
      return update(state, {
        openReplies: {
          [action.payload]: { $set: !state.openReplies[action.payload] }
        }
      })
    case SERVICE_REVIEW_LIKE_ADD_SUCCESS:
      return state;
    case SERVICE_REPLY_INPUT_CHANGE:
      return update(state, {
        repliesText: { [action.payload.reviewId]: { $set: action.payload.text } }
      })
    case SERVICE_REPLY_SEND_REQUEST:
      return update(state, {
        repliesLoading: { [action.payload.reviewId]: { $set: true } }
      });
    case SEARCH_SUBMIT_REQUEST:
      return update(state, {
        reviewsLoading: { $set: true },
      })
    case SERVICE_FETCH_PLACE_REVIEWS_REQUEST:
      return update(state, {
        reviewsLoading: { $set: true }
      })
    case SERVICE_FETCH_PLACE_REVIEWS_SUCCESS:
      return update(state, {
        reviewsLoading: { $set: false }
      })
    case SERVICE_FETCH_PLACE_PHOTOS_SUCCESS:
      return update(state, {
        imagesLoading: { $set: false },
        images: { $push: [...action.payload] }
      })
    case SERVICE_REVIEW_SUBMIT_SUCCESS:
      return update(state, {
        repliesText: { [action.payload.reviewId]: { $set: "" } },
        repliesLoading: { [action.payload.reviewId]: { $set: false } },
      })
    case SERVICE_REPLY_SEND_SUCCESS:
      return update(state, {
        repliesText: { [action.payload.reviewId]: { $set: "" } },
        repliesLoading: { [action.payload.reviewId]: { $set: false } },
      })
    case SEARCH_EXIT_RESULT:
      return update(state, {
        images: { $set: [] }
      })
    default:
      return state;
  }
}