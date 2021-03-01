import { Dispatch } from "redux";
import API, { PlaceSuggestion } from '../api';
import { ApplicationState } from "../App";
import axios from 'axios';
import {
  REVIEW_FOCUS,
  REVIEW_FORM_TOGGLE_SERVICE_LIST,
  REVIEW_SET_PLACE_TYPE, 
  REVIEW_FORM_TOGGLE_FEATURES_LIST,
  REVIEW_FORM_TOGGLE_FEATURE,
  REVIEW_FORM_TOGGLE_LOCATION_PICKER,
  REVIEW_SET_PLACE_SUGGESTION,
  REVIEW_IMAGE_CHANGE,
  REVIEW_IMAGE_REQUEST,
  REVIEW_TEXT_CHANGE,
  REVIEW_CANCEL_IMAGE,
  FETCH_PLACES_SUCCESS,
  WELCOME_SHOW_SIGNUP_MESSAGE
} from ".";
// import Geocoder from "../geocoder";
import HERE from "../here";
import { NavigationActions } from "react-navigation";
import { LayoutAnimation } from "react-native";

export const REVIEW_SUBMIT_REQUEST = 'REVIEW_SUBMIT_REQUEST';
export const REVIEW_SUBMIT_SUCCESS = 'REVIEW_SUBMIT_SUCCESS';
export const REVIEW_SUBMIT_ADD_PLACE = 'REVIEW_SUBMIT_ADD_PLACE';

export const submitReview = () => (dispatch: Dispatch, getState: () => ApplicationState): Promise<any> => {
  dispatch({ type: REVIEW_SUBMIT_REQUEST });
  
  const state = getState();

  if (state.login.deviceLoggedIn) {
    dispatch({ type: WELCOME_SHOW_SIGNUP_MESSAGE })
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    dispatch(NavigationActions.navigate({ routeName: "Welcome" }));
    return Promise.resolve();
  }

  return new Promise((r, j) => {
    new Promise((resolve, reject) => {
      API.getReviewPlace(state.review.selectedPlaceSuggestion.id).then(res => {
        if (res) {
          // TODO place already exists in the db, just update it
          API.votePlaceFeatures(state.review.selectedPlaceSuggestion.id, Object.keys(state.review.features))
            .then(newPlace => {
              dispatch({
                type: FETCH_PLACES_SUCCESS,
                payload: [newPlace.place]
              })
              resolve({ isNew: false, placeId: state.review.selectedPlaceSuggestion.id });
            })
        } else {
          console.log('place not found');
          // Geocoder.decode('משה דיין 5 רעננה')
          //   .then(res => {
          //     console.log(res);
          //     console.log(res.response.GeoObjectCollection.featureMember[0].GeoObject.Point.pos);
          //     return Promise.resolve();
          //   }).catch(err => {
          //     console.log(err);
          //     console.log(JSON.stringify(err));
          //   })
  
          // TODO place doesn't exist in the db, create a new one
  
          // Get location data from provider
          axios.get(state.review.selectedPlaceSuggestion.href, {
            baseURL: '',
            headers: { 'Accept-Language': 'he-IL' }
          }).then(res => {
  
            // Add the place to the DB
            API.addPlace(
              state.review.selectedPlaceSuggestion.id,
              state.review.placeType.id,
              state.review.selectedPlaceSuggestion.title,
              HERE.mapLocationData(res.data.location),
              Object.keys(state.review.features)
            ).then(res => {
              if (res.ok) {
                dispatch({
                  type: REVIEW_SUBMIT_ADD_PLACE,
                  payload: res.place
                })
                resolve({ isNew: true, placeId: res.place.id })
              } else {
                reject('could not add place');
              }
            });
  
          }).catch(err => {
            console.log(err);
            console.log(JSON.stringify(err));
            reject(err);
          });
        }
      })
    }).then(({isNew, placeId}) => {
      console.log(`place was ${isNew ? 'added' : 'updated'}, add the review width placeId ${placeId}`)
      API.postReview(placeId, state.review.text.trim(), state.review.imageData)
        .then(res => {
          console.log(res);
          r();
          dispatch({
            type: REVIEW_SUBMIT_SUCCESS,
            payload: {
              review: res.review,
              photo: state.review.imageData ? {
                id: res.review.photo,
                data: state.review.imageData.data
              } : false
            }
          })
        })
    }).catch(err => {
      console.log(err);
    })
  })

  // API.postReview(state.review.selectedPlaceSuggestion.id, state.review.text, state.review.imageData)
  //   .then(res => {
  //     console.log(res);
  //   }).catch(err => {
  //     console.log(err);
  //     console.log(JSON.stringify(err));
  //   })
}

export const showSignupMessage = () => (dispatch: Dispatch) => {
  dispatch({ type: WELCOME_SHOW_SIGNUP_MESSAGE })
  dispatch(NavigationActions.navigate({ routeName: "Welcome" }));
}

export const focusReview = (focus: boolean) => ({
  type: REVIEW_FOCUS,
  payload: focus
});

export const toggleService = () => ({
  type: REVIEW_FORM_TOGGLE_SERVICE_LIST
})

export const toggleFeaturesList = () => ({
  type: REVIEW_FORM_TOGGLE_FEATURES_LIST
});

export const toggleLocationPicker = () => ({
  type: REVIEW_FORM_TOGGLE_LOCATION_PICKER
})

export const toggleFeature = (featureId: string) => ({
  type: REVIEW_FORM_TOGGLE_FEATURE,
  payload: featureId
})

export const setPlaceType = (id: string, type: { name: string, icon: string }) => ({
  type: REVIEW_SET_PLACE_TYPE,
  payload: {id, type}
});

export const setPlaceSuggestion = (suggestion: PlaceSuggestion) => ({
  type: REVIEW_SET_PLACE_SUGGESTION,
  payload: suggestion
})

export const cancelImage = () => ({
  type: REVIEW_CANCEL_IMAGE
})

export const imageChange = (data: any) => {
  return {
    type: REVIEW_IMAGE_CHANGE,
    payload: data
  }
}

export const imageChangeRequest = () => ({
  type: REVIEW_IMAGE_REQUEST
})

export const reviewTextChange = (text: string) => ({
  type: REVIEW_TEXT_CHANGE,
  payload: text
})