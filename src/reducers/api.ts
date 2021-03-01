import { SEARCH_SUBMIT_SUCCESS } from './../actions/search';
import { SERVICE_FETCH_PLACE_REVIEWS_SUCCESS, SERVICE_REVIEW_LIKE_ADD_REQUEST, SERVICE_REVIEW_LIKE_REMOVE_REQUEST, SERVICE_REPLY_LIKE_ADD_REQUEST, SERVICE_REPLY_LIKE_REMOVE_REQUEST, SERVICE_REPLY_SEND_SUCCESS, SERVICE_PLACE_LIKE_ADD_REQUEST, SERVICE_PLACE_LIKE_REMOVE_REUQEST } from './../actions/service';
import { FETCH_PROFILES_SUCCESS, FETCH_PLACES_SUCCESS, FETCH_PHOTOS_SUCCESS, FETCH_PLACE_TYPES_SUCCESS, FETCH_FEATURE_TYPES_SUCCESS } from '../actions/index';
import update from 'immutability-helper';
import { ApiState } from '../App';
import { Place } from '../api';
import { REVIEW_SUBMIT_SUCCESS, REVIEW_SUBMIT_ADD_PLACE } from '../actions/review';

const initialState: ApiState = {
  profiles: {},
  places: {},
  photos: {},
  features: {},
  placeTypes: {},
  reviews: {}
}

export default function(state = initialState, action: any) {
  switch(action.type) {
    case FETCH_PROFILES_SUCCESS:
      let profiles = Object.assign({}, state.profiles);
      action.payload.forEach((profile: { id: string, name: string, picture: string }) => {
        profiles[profile.id] = {
          name: profile.name,
          picture: profile.picture
        }
      });
      return update(state, {
        profiles: { $set: profiles }
      });
    case FETCH_PLACES_SUCCESS: {
      let places = Object.assign({}, state.places);
      action.payload.forEach((place: Place) => {
        places[place.id] = {
          id: place.id,
          name: place.name,
          type: place.type,
          features: place.features,
          location: place.location,
          reviews: place.reviews,
          votes: place.votes
        }
      });
      return update(state, {
        places: { $set: places }
      });
    }
    case FETCH_FEATURE_TYPES_SUCCESS:
      let features = {};
      action.payload.forEach((feature: { id: string, name: string, icon: string }) => {
        features[feature.id] = { name: feature.name, icon: feature.icon }
      });
      return update(state, {
        features: { $set: features }
      });
    case FETCH_PLACE_TYPES_SUCCESS:
      let placeTypes = {};
      action.payload.forEach((type: { id: string, name: string, icon: string }) => {
        placeTypes[type.id] = {
          name: type.name,
          icon: type.icon
        }
      });
      return update(state, {
        placeTypes: { $set: placeTypes }
      });
    case FETCH_PHOTOS_SUCCESS:
      let photos = Object.assign({}, state.photos);
      action.payload.forEach((photo: { id: string, photo: string }) => {
        photos[photo.id] = photo.photo
      });
      return update(state, {
        photos: { $set: photos }
      });
    case REVIEW_SUBMIT_SUCCESS:
      if (action.payload.photo) {
        return update(state, {
          photos: { $merge: { [action.payload.photo.id]: action.payload.photo.data } }
        })
      }
    case REVIEW_SUBMIT_ADD_PLACE:
      return update(state, {
        places: { $merge: { [action.payload.id]: action.payload }}
      })
    case SERVICE_FETCH_PLACE_REVIEWS_SUCCESS:
      let reviews = {};
      action.payload.forEach(review => {
        reviews[review.id] = review;
      })

      return update(state, {
        reviews: { $merge: reviews }
      })
    case SEARCH_SUBMIT_SUCCESS:
      let places = {};
      action.payload.forEach(place => {
        places[place.id] = place;
      })

      return update(state, {
        places: { $merge: places }
      })
    case SERVICE_REVIEW_LIKE_ADD_REQUEST: {
      const review = update(state.reviews[action.payload.reviewId], {
        votes: { positive: { $push: [action.payload.userId] }}
      });
      return update(state, {
        reviews: { [action.payload.reviewId]: { $set: review } }
      })
    }
    case SERVICE_REVIEW_LIKE_REMOVE_REQUEST: {
      const review = state.reviews[action.payload.reviewId];
      const voteIndex = review.votes.positive.findIndex(e => e === action.payload.userId);
      const updatedReview = update(review, {
        votes: { positive: { $splice: [[voteIndex, 1]] }}
      });
      return update(state, {
        reviews: { [action.payload.reviewId]: { $set: updatedReview } }
      });
    }
    case SERVICE_REPLY_LIKE_ADD_REQUEST: {
      const review = state.reviews[action.payload.reviewId];
      const replyIndex = review.replies.findIndex(e => e.id === action.payload.replyId);
      const reply = update(review.replies.find(e => e.id === action.payload.replyId), {
        votes: { positive: { $push: [action.payload.userId ]}}
      });

      return update(state, {
        reviews: { [action.payload.reviewId]: {
          replies: { [replyIndex]: { $set: reply }}
        }}
      })
    }
    case SERVICE_REPLY_LIKE_REMOVE_REQUEST: {
      const review = state.reviews[action.payload.reviewId];
      const replyIndex = review.replies.findIndex(e => e.id === action.payload.replyId);

      const reply = review.replies[replyIndex];
      const voteIndex = reply.votes.positive.findIndex(e => e === action.payload.userId);
      const updatedreply = update(reply, {
        votes: { positive: { $splice: [[voteIndex, 1]] }}
      });
      return update(state, {
        reviews: { [action.payload.reviewId]: { replies: { [replyIndex]: { $set: updatedreply } } } }
      });
    }
    case SERVICE_REPLY_SEND_SUCCESS: {
      const review = state.reviews[action.payload.reviewId];
      
      let updatedReview = update(review, {
        replies: { $push: [action.payload.reply] }
      })

      return update(state, {
        reviews: { [action.payload.reviewId]: { $set: updatedReview }}
      })
    }
    case SERVICE_PLACE_LIKE_ADD_REQUEST: {
      const voteType = action.payload.positive ? 'positive' : 'negative'
      const oppositeVoteType = action.payload.positive ? 'negative' : 'positive'
      const index = state.places[action.payload.placeId].votes[oppositeVoteType].findIndex(e => e === action.payload.userId);
      let place;

      console.log(index);
      if (index > -1) {
        place = update(state.places[action.payload.placeId], {
          votes: {
            [voteType]: { $push: [action.payload.userId] },
            [oppositeVoteType]: { $splice: [[index, 1]] }
          }
        });
      } else {
        place = update(state.places[action.payload.placeId], {
          votes: { [voteType]: { $push: [action.payload.userId] } }
        });
      }

      return update(state, {
        places: { [action.payload.placeId]: { $set: place } }
      })
    }
    case SERVICE_PLACE_LIKE_REMOVE_REUQEST: {
      const voteType = action.payload.positive ? 'positive' : 'negative'
      const index = state.places[action.payload.placeId].votes[voteType].findIndex(e => e === action.payload.userId);

      const updatedPlace = update(state.places[action.payload.placeId], {
        votes: { [voteType]: { $splice: [[index, 1]] }}
      });

      return update(state, {
        places: { [action.payload.placeId]: { $set: updatedPlace } }
      });
    }
    default:
      return state;
  }
}