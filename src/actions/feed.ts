import { LayoutAnimation } from 'react-native';
import { Dispatch } from "redux";
import axios from 'axios';
import { ApplicationState } from "../App";
import { NavigationActions } from "react-navigation";
import { WELCOME_SHOW_SIGNUP_MESSAGE } from '.';

export const REVIEW_LIKE_ADD_REQUEST = 'REVIEW_LIKE_ADD_REQUEST';
export const REVIEW_LIKE_REMOVE_REQUEST = 'REVIEW_LIKE_REMOVE_REQUEST';
export const REVIEW_LIKE_ADD_SUCCESS = 'REVIEW_LIKE_ADD_SUCCESS';
export const REVIEW_LIKE_REMOVE_SUCCESS = 'REVIEW_LIKE_REMOVE_SUCCESS';

export const REPLY_LIKE_ADD_REQUEST = 'REPLY_LIKE_ADD_REQUEST';
export const REPLY_LIKE_REMOVE_REQUEST = 'REPLY_LIKE_REMOVE_REQUEST';
export const REPLY_LIKE_ADD_SUCCESS = 'REPLY_LIKE_ADD_SUCCESS';
export const REPLY_LIKE_REMOVE_SUCCESS = 'REPLY_LIKE_REMOVE_SUCCESS';

export const REPLY_INPUT_CHANGE = 'REPLY_INPUT_CHANGE';
export const replyTextChange = (reviewId: string, text: string) => ({
  type: REPLY_INPUT_CHANGE,
  payload: {
    reviewId,
    text
  }
});

export const checkAccount = () => (dispatch: Dispatch, getState: () => ApplicationState) => {
  const state = getState();

  if (state.login.deviceLoggedIn) {
    dispatch({ type: WELCOME_SHOW_SIGNUP_MESSAGE })
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    return dispatch(NavigationActions.navigate({ routeName: "Welcome" }))
  }
}

export const REPLY_SEND_REQUEST = 'REPLY_SEND_REQUEST';
export const REPLY_SEND_SUCCESS = 'REPLY_SEND_SUCCESS';
export const sendReply = (reviewId: string) => (dispatch: Dispatch, getState: () => ApplicationState): Promise<any> => {
  const state = getState();

  if (state.login.deviceLoggedIn) {
    dispatch({ type: WELCOME_SHOW_SIGNUP_MESSAGE })
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    dispatch(NavigationActions.navigate({ routeName: "Welcome" }))
    return Promise.resolve();
  }

  const reviewText = state.feed.repliesText[reviewId];
  return new Promise((resolve, reject) => {
    dispatch({ 
      type: REPLY_SEND_REQUEST,
      payload: {
        reviewId: reviewId,
      }
    });
  
    axios.put(`/reviews/${reviewId}/replies`, {
      text: reviewText.trim()
    }).then(res => {
      dispatch({
        type: REPLY_SEND_SUCCESS,
        payload: {
          reviewId: reviewId,
          reply: res.data.reply
        }
      })
      resolve();
    }).catch(err => {
      console.log(err);
    })
  })
}

export const toggleReplyLike = (reviewId: string, replyId: string) => (dispatch: Dispatch, getState: () => ApplicationState) => {
  const state = getState();

  if (state.login.deviceLoggedIn) {
    dispatch({ type: WELCOME_SHOW_SIGNUP_MESSAGE })
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    return dispatch(NavigationActions.navigate({ routeName: "Welcome" }));
  }

  const reviewIndex = state.feed.posts.findIndex(e => e.id === reviewId);
  const replyIndex = state.feed.posts[reviewIndex].replies.findIndex(e => e.id === replyId);
  
  if (state.feed.posts[reviewIndex].replies[replyIndex].votes.positive.includes(state.login.user.id)) {
    // remove like
    dispatch({
      type: REPLY_LIKE_REMOVE_REQUEST,
      payload: {
        reviewId,
        replyId,
        userId: getState().login.user.id
      }
    });

    axios.delete(`/reviews/${reviewId}/replies/${replyId}/votes`).then(res => {
      dispatch({
        type: REPLY_LIKE_REMOVE_SUCCESS,
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
      type: REPLY_LIKE_ADD_REQUEST,
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
        type: REPLY_LIKE_ADD_SUCCESS,
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

export const toggleReviewLike = (reviewId: string) => (dispatch: Dispatch, getState: () => ApplicationState) => {
  const state = getState();

  // check if user is registered
  if (state.login.deviceLoggedIn) {
    dispatch({ type: WELCOME_SHOW_SIGNUP_MESSAGE })
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    return dispatch(NavigationActions.navigate({ routeName: "Welcome" }));
  }
  
  const reviewIndex = state.feed.posts.findIndex(e => e.id === reviewId);

  if (state.feed.posts[reviewIndex].votes.positive.includes(state.login.user.id)) {
    // remove like
    dispatch({
      type: REVIEW_LIKE_REMOVE_REQUEST,
      payload: {
        reviewId,
        userId: getState().login.user.id
      }
    });

    axios.delete(`/reviews/${reviewId}/votes`).then(res => {
      dispatch({
        type: REVIEW_LIKE_REMOVE_SUCCESS,
        payload: reviewId
      })
    }).catch(err => {
      console.log(err);
    })
  } else {
    // add like
    dispatch({
      type: REVIEW_LIKE_ADD_REQUEST,
      payload: {
        reviewId,
        userId: getState().login.user.id
      }
    });

    axios.post(`/reviews/${reviewId}/votes`, {
      positive: true
    }).then(res => {
      dispatch({
        type: REVIEW_LIKE_ADD_SUCCESS,
        payload: reviewId
      })
    }).catch(err => {
      console.log(err);
    })
  }
}

export const REVIEW_TOGGLE_REPLIES = 'REVIEW_TOGGLE_REPLIES';
export const toggleReplies = (reviewId: string) => ({
  type: REVIEW_TOGGLE_REPLIES,
  payload: reviewId
});


