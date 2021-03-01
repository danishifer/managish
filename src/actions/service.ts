import { Dispatch } from "redux";
import API from '../api';
import { ApplicationState } from "../App";
import { FETCH_PROFILES_SUCCESS, FETCH_PHOTOS_SUCCESS, WELCOME_SHOW_SIGNUP_MESSAGE } from ".";
import axios from 'axios';
import { Review } from "../constants";
import { LayoutAnimation } from "react-native";
import { NavigationActions } from "react-navigation";

export const SERVICE_REVIEW_LIKE_REMOVE_REQUEST = 'SERVICE_REVIEW_LIKE_REMOVE_REQUEST';
export const SERVICE_REVIEW_LIKE_REMOVE_SUCCESS = 'SERVICE_REVIEW_LIKE_REMOVE_SUCCESS';
export const SERVICE_REVIEW_LIKE_ADD_REQUEST = 'SERVICE_REVIEW_LIKE_ADD_REQUEST';
export const SERVICE_REVIEW_LIKE_ADD_SUCCESS = 'SERVICE_REVIEW_LIKE_ADD_SUCCESS';
export const SERVICE_FETCH_PLACE_REQUEST = 'SERVICE_FETCH_PLACE_REQUEST';
export const SERVICE_FETCH_PLACE_SUCCESS = 'SERVICE_FETCH_PLACE_SUCCESS';
export const SERVICE_FETCH_PLACE_FAILURE = 'SERVICE_FETCH_PLACE_FAILURE';
export const SERVICE_FETCH_PLACE_REVIEWS_REQUEST = 'SERVICE_FETCH_PLACE_REVIEWS_REQUEST';
export const SERVICE_FETCH_PLACE_REVIEWS_SUCCESS = 'SERVICE_FETCH_PLACE_REVIEWS_SUCCESS';
export const SERVICE_FETCH_PLACE_REVIEWS_FAILURE = 'SERVICE_FETCH_PLACE_REVIEWS_FAILURE';
export const SERVICE_REPLY_INPUT_CHANGE = 'SERVICE_REPLY_INPUT_CHANGE';
export const SERVICE_REPLY_LIKE_REMOVE_REQUEST = 'SERVICE_REPLY_LIKE_REMOVE_REQUEST';
export const SERVICE_REPLY_LIKE_REMOVE_SUCCESS = 'SERVICE_REPLY_LIKE_REMOVE_SUCCESS';
export const SERVICE_REPLY_LIKE_ADD_REQUEST = 'SERVICE_REPLY_LIKE_ADD_REQUEST';
export const SERVICE_REPLY_LIKE_ADD_SUCCESS = 'SERVICE_REPLY_LIKE_ADD_SUCCESS';
export const SERVICE_REVIEW_SUBMIT_SUCCESS = 'SERVICE_REVIEW_SUBMIT_SUCCESS';
export const SERVICE_REVIEW_TOGGLE_REPLIES = 'SERVICE_REVIEW_TOGGLE_REPLIES';
export const SERVICE_PLACE_LIKE_REMOVE_REUQEST = 'SERVICE_PLACE_LIKE_REMOVE_REUQEST';
export const SERVICE_PLACE_LIKE_REMOVE_SUCCESS = 'SERVICE_PLACE_LIKE_REMOVE_SUCCESS';
export const SERVICE_PLACE_LIKE_REMOVE_FAILURE = 'SERVICE_PLACE_LIKE_REMOVE_FAILURE';
export const SERVICE_PLACE_LIKE_ADD_REQUEST = 'SERVICE_PLACE_LIKE_ADD_REUQEST';
export const SERVICE_PLACE_LIKE_ADD_SUCCESS = 'SERVICE_PLACE_LIKE_ADD_SUCCESS';
export const SERVICE_PLACE_LIKE_ADD_FAILURE = 'SERVICE_PLACE_LIKE_ADD_FAILURE';
export const SERVICE_FETCH_PLACE_PHOTOS_SUCCESS = 'SERVICE_FETCH_PLACE_PHOTOS_SUCCESS';

export const toggleReplies = (reviewId: string) => ({
  type: SERVICE_REVIEW_TOGGLE_REPLIES,
  payload: reviewId
});

export const toggleReviewLike = (reviewId: string) => (dispatch: Dispatch, getState: () => ApplicationState) => {
  const state = getState();

  if (state.login.deviceLoggedIn) {
    dispatch({ type: WELCOME_SHOW_SIGNUP_MESSAGE })
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    return dispatch(NavigationActions.navigate({ routeName: "Welcome" }));
  }

  if (state.api.reviews[reviewId].votes.positive.includes(state.login.user.id)) {
    // remove like
    dispatch({
      type: SERVICE_REVIEW_LIKE_REMOVE_REQUEST,
      payload: {
        reviewId,
        userId: getState().login.user.id
      }
    });

    axios.delete(`/reviews/${reviewId}/votes`).then(res => {
      dispatch({
        type: SERVICE_REVIEW_LIKE_REMOVE_SUCCESS,
        payload: reviewId
      })
    }).catch(err => {
      console.log(err);
    })
  } else {
    // add like
    dispatch({
      type: SERVICE_REVIEW_LIKE_ADD_REQUEST,
      payload: {
        reviewId,
        userId: getState().login.user.id
      }
    });

    axios.post(`/reviews/${reviewId}/votes`, {
      positive: true
    }).then(res => {
      dispatch({
        type: SERVICE_REVIEW_LIKE_ADD_SUCCESS,
        payload: reviewId
      })
    }).catch(err => {
      console.log(err);
    })
  }
}

export const replyTextChange = (reviewId: string, text: string) => ({
  type: SERVICE_REPLY_INPUT_CHANGE,
  payload: {
    reviewId,
    text
  }
});

export const SERVICE_REPLY_SEND_REQUEST = 'SERVICE_REPLY_SEND_REQUEST';
export const SERVICE_REPLY_SEND_SUCCESS = 'SERVICE_REPLY_SEND_SUCCESS';
export const sendReply = (reviewId: string) => (dispatch: Dispatch, getState: () => ApplicationState): Promise<any> => {
  const state = getState();

  if (state.login.deviceLoggedIn) {
    dispatch({ type: WELCOME_SHOW_SIGNUP_MESSAGE })
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    dispatch(NavigationActions.navigate({ routeName: "Welcome" }));
    return Promise.resolve();
  }

  const reviewText = state.service.repliesText[reviewId];
  return new Promise((resolve, reject) => {
    dispatch({ 
      type: SERVICE_REPLY_SEND_REQUEST,
      payload: {
        reviewId: reviewId,
      }
    });
  
    axios.put(`/reviews/${reviewId}/replies`, {
      text: reviewText
    }).then(res => {
      dispatch({
        type: SERVICE_REPLY_SEND_SUCCESS,
        payload: {
          reviewId: reviewId,
          reply: res.data.reply
        }
      })
      resolve();
    }).catch(err => {
      console.log(err);
      console.log(JSON.stringify(err));
    })
  })
}

export const togglePlaceLike = (positive: boolean) => (dispatch: Dispatch, getState: () => ApplicationState) => {
  const state = getState();

  if (state.login.deviceLoggedIn) {
    dispatch({ type: WELCOME_SHOW_SIGNUP_MESSAGE })
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    return dispatch(NavigationActions.navigate({ routeName: "Welcome" }));
  }

  const place = state.api.places[state.search.results[state.search.chosenResultIndex]];
  const voteType = positive ?  'positive': 'negative';

  if (place.votes[voteType].includes(state.login.user.id)) {
    dispatch({
      type: SERVICE_PLACE_LIKE_REMOVE_REUQEST,
      payload: {
        placeId: place.id,
        positive,
        userId: state.login.user.id
      }
    })

    axios.delete(`/places/${place.id}/votes`)
      .then(res => {
        dispatch({
          type: SERVICE_PLACE_LIKE_REMOVE_SUCCESS
        })
      }).catch(err => {
        console.log(err);
        console.log(JSON.stringify(err));
      })
  } else {
    dispatch({
      type: SERVICE_PLACE_LIKE_ADD_REQUEST,
      payload: {
        placeId: place.id,
        positive,
        userId: state.login.user.id
      }
    })

    axios.post(`/places/${place.id}/votes`, {
      positive: !!positive
    }).then(res => {
      dispatch({
        type: SERVICE_PLACE_LIKE_ADD_SUCCESS,
      })
    }).catch(err => {
      console.log(err);
      console.log(JSON.stringify(err));
    })
  }
}

export const toggleReplyLike = (reviewId: string, replyId: string) => (dispatch: Dispatch, getState: () => ApplicationState) => {
  const state = getState();

  if (state.login.deviceLoggedIn) {
    dispatch({ type: WELCOME_SHOW_SIGNUP_MESSAGE })
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    return dispatch(NavigationActions.navigate({ routeName: "Welcome" }));
  }

  let reply = state.api.reviews[reviewId].replies.find(e => e.id === replyId);

  if (reply.votes.positive.includes(state.login.user.id)) {
    // remove like
    dispatch({
      type: SERVICE_REPLY_LIKE_REMOVE_REQUEST,
      payload: {
        reviewId,
        replyId,
        userId: getState().login.user.id
      }
    });

    axios.delete(`/reviews/${reviewId}/replies/${replyId}/votes`).then(res => {
      dispatch({
        type: SERVICE_REPLY_LIKE_REMOVE_SUCCESS,
        payload: {
          reviewId,
          replyId
        }
      })
    }).catch(err => {
      console.log(err);
    })
  } else {
    // add like
    dispatch({
      type: SERVICE_REPLY_LIKE_ADD_REQUEST,
      payload: {
        reviewId,
        replyId,
        userId: getState().login.user.id
      }
    });

    axios.post(`/reviews/${reviewId}/replies/${replyId}/votes`, {
      positive: true
    }).then(res => {
      dispatch({
        type: SERVICE_REPLY_LIKE_ADD_SUCCESS,
        payload: {
          reviewId,
          replyId
        }
      })
    }).catch(err => {
      console.log(err);
    })
  }
}

export const fetchPlace = (placeId: string) => (dispatch: Dispatch) => {
  dispatch({ type: SERVICE_FETCH_PLACE_REQUEST });

  API.fetchPlace(placeId)
    .then(res => {
      console.log(res);
    }).catch(err => {
      console.log(err);
      console.log(JSON.stringify(err));
    })
}

export const fetchFirstPlaceReviews = () => (dispatch: Dispatch, getState: () => ApplicationState): Promise<any> => {
  const state = getState();

  dispatch({ type: SERVICE_FETCH_PLACE_REVIEWS_REQUEST });

  const place = state.api.places[state.search.results[state.search.chosenResultIndex]];
  // let reviews = place.reviews.slice(0,3);
  let reviews = place.reviews;
  let fetchRequests = [];
  let photoIds = [];

  reviews.forEach(review => {
    if (!state.api.reviews[review]) {
      fetchRequests.push(API.fetchReview(review));
    } else {
      if (state.api.reviews[review].photo) {
        photoIds.push(state.api.reviews[review].photo)
      }
    }
  })

  return new Promise((resolve, reject) => {
    Promise.all(fetchRequests)
    .then((results = []) => {
      const reviews = results.filter(e => e);
      // fetch profiles if needed
      let profileRequests = []
      let photoRequests = [];
      
      reviews.forEach(review => {
        if (!state.api.profiles[review.userId]) {
          profileRequests.push(API.fetchProfile(review.userId))
        }

        if (review.photo) {
          photoIds.push(review.photo);
          if (!state.api.photos[review.photo]) {
            photoRequests.push(API.fetchPicture(review.photo))
          }
        }
      })
      const replyProfiles = [].concat(...reviews.map((review: Review) => review.replies.map(reply => API.fetchProfile(reply.userId))));

      Promise.all(photoRequests)
        .then(photos => {
          console.log(photos)
          dispatch({
            type: FETCH_PHOTOS_SUCCESS,
            payload: photos.filter(result => result)
          })

          dispatch({
            type: SERVICE_FETCH_PLACE_PHOTOS_SUCCESS,
            payload: photoIds
          })
        }).catch(err => {
          console.log(err)
          console.log(JSON.stringify(err));
        })
      Promise.all([...profileRequests, ...replyProfiles])
        .then(profiles => {

          dispatch({
            type: FETCH_PROFILES_SUCCESS,
            payload: profiles.filter(e => e)
          })

          dispatch({
            type: SERVICE_FETCH_PLACE_REVIEWS_SUCCESS,
            payload: reviews,
          })
    
          resolve();

        }).catch(err => {
          console.log(err);
          console.log(JSON.stringify(err));
        })
    }).catch(err => {
      console.log(err);
      console.log(JSON.stringify(err));
    })
  })
}