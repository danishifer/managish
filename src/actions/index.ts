import { Dispatch } from "redux";
import Auth0, { CreateUserParams, PasswordRealmResponse } from 'react-native-auth0';
import jwt from 'jwt-decode';
import { Clipboard } from "react-native";
import { NavigationActions } from 'react-navigation';
import { BASE_URL, Review } from '../constants';
import { ApplicationState } from "../App";
import API from '../api';
import axios from 'axios';
import * as Keychain from 'react-native-keychain';
import DeviceInfo from 'react-native-device-info';
import hash from 'hash.js';

export const auth0 = new Auth0({ domain: 'nagish.eu.auth0.com', clientId: 'qtfelN3ltm4zSBT2H390vVjcNfqv3UbE' });

export const FETCH_FEED_SUCCESS = 'FETCH_FEED_SUCCESS';
export const FETCH_PROFILES_SUCCESS = 'FETCH_PROFILES_SUCCESS';
export const FETCH_PLACES_SUCCESS = 'FETCH_PLACES_SUCCESS';
export const FETCH_PHOTOS_SUCCESS = 'FETCH_PHOTOS_SUCCESS';
export const FETCH_BASE_DATA_SUCCESS = 'FETCH_BASE_DATA_SUCCESS';

export const REFRESH_FEED_REQUEST = 'REFRESH_FEED_REQUEST';
export const REFRESH_FEED_SUCCESS = 'REFRESH_FEED_SUCCESS';
export const REFRESH_FEED_FAILURE = 'REFRESH_FEED_FAILURE';

export const FETCH_FEED_PAGE_REQUEST = 'FETCH_FEED_PAGE_REQUEST';
export const FETCH_FEED_PAGE_SUCCESS = 'FETCH_FEED_PAGE_SUCCESS';
export const FETCH_FEED_PAGE_FAILURE = 'FETCH_FEED_PAGE_FAILURE';

export const FETCH_PLACE_TYPES_SUCCESS = 'FETCH_PLACE_TYPES_SUCCESS';
export const FETCH_FEATURE_TYPES_SUCCESS = 'FETCH_FEATURE_TYPES_SUCCESS';

export const EMAIL_INPUT_CHANGE = 'EMAIL_INPUT_CHANGE';
export const PASSWORD_INPUT_CHANGE = 'PASSWORD_INPUT_CHANGE';
export const NAME_INPUT_CHANGE = 'NAME_INPUT_CHANGE';

export const CREATE_ACCOUNT_NEXT_FORM = 'CREATE_ACCOUNT_NEXT_FORM';
export const CREATE_ACCOUNT_IMAGE_REQUEST = 'CREATE_ACCOUNT_IMAGE_REQUEST';
export const CREATE_ACCOUNT_IMAGE_CHANGE = 'CREATE_ACCOUNT_IMAGE_CHANGE';
export const CREATE_ACCOUNT_PREVIOUS_FORM = 'CREATE_ACCOUNT_PREVIOUS_FORM';
export const CREATE_ACCOUNT_REQUEST = 'CREATE_ACCOUNT_REQUEST';

export const SHOW_WELCOME_LOGIN = 'SHOW_WELCOME_LOGIN';
export const SHOW_WELCOME_CREATE_ACCOUNT = 'SHOW_WELCOME_CREATE_ACCOUNT';
export const WELCOME_RESET = 'WELCOME_RESET';
export const WELCOME_SET_KEYBOARD_HEIGHT = 'WELCOME_SET_KEYBOARD_HEIGHT';
export const WELCOME_SHOW_SIGNUP_MESSAGE = 'WELCOME_SHOW_SIGNUP_MESSAGE';

export const REVIEW_FOCUS = 'REVIEW_FOCUS';
export const REVIEW_FORM_TOGGLE_SERVICE_LIST = 'REVIEW_TOGGLE_SERVICE';
export const REVIEW_SET_PLACE_TYPE = 'REVIEW_SET_PLACE_TYPE';
export const REVIEW_FORM_TOGGLE_FEATURES_LIST = 'REVIEW_FORM_TOGGLE_FEATURES_LIST';
export const REVIEW_FORM_TOGGLE_FEATURE = 'REVIEW_FORM_TOGGLE_FEATURE';
export const REVIEW_FORM_TOGGLE_LOCATION_PICKER = 'REVIEW_FORM_TOGGLE_LOCATION_PICKER';
export const REVIEW_SET_PLACE_SUGGESTION = 'REVIEW_SET_PLACE_SUGGESTION';
export const REVIEW_IMAGE_CHANGE = 'REVIEW_IMAGE_CHANGE';
export const REVIEW_IMAGE_REQUEST = 'REVIEW_IMAGE_REQUEST';
export const REVIEW_TEXT_CHANGE = 'REVIEW_TEXT_CHANGE';
export const REVIEW_CANCEL_IMAGE = 'REVIEW_CANCEL_IMAGE';

export const LOGIN_REQUEST = 'LOGIN_REQUEST';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_FAILURE = 'LOGIN_FAILURE';

export const DEVICE_LOGIN_REQUEST = 'DEVICE_LOGIN_REQUEST';
export const DEVICE_LOGIN_SUCCESS = 'DEVICE_LOGIN_SUCCESS';

export const API_UPDATE_CONFIG = 'API_UPDATE_CONFIG';

export const resetWelcome = () => ({
  type: WELCOME_RESET
})

const auth0deviceLogin = (username: string, password: string): Promise<PasswordRealmResponse> => {
  return auth0.auth.passwordRealm({
    username: `${username}@managish.com`,
    password: password,
    realm: 'Username-Password-Authentication',
    scope: 'openid offline_access refresh_token profile email',
    audience: 'https://managish.eu-gb.mybluemix.net/',
  })
}

const deviceLoginSuccess = (token: string, dispatch: Dispatch) => {
  API.config(token);
  dispatch(NavigationActions.navigate({ routeName: "App" }));
}

export const deviceLogin = () => (dispatch: Dispatch, getState: () => ApplicationState) => {
  const deviceId = DeviceInfo.getUniqueID();
  console.log('deviceId', deviceId);
  const username = hash.sha256().update(deviceId).digest('hex');
  const password = hash.sha256().update(username).digest('hex');

  dispatch({ type: DEVICE_LOGIN_REQUEST });

  auth0deviceLogin(username, password).then(res => {
    dispatch({
      type: DEVICE_LOGIN_SUCCESS,
      payload: {
        refreshToken: res.refreshToken,
        token: res.idToken,
        time: Date.now()
      }
    });
    Keychain.setGenericPassword(`${username}@managish.com`, password);
    deviceLoginSuccess(res.idToken, dispatch);
  }).catch(err => {
    // user probably doesn't exist
    console.log('cannot login with username ' + username + '. Creating a new account');
    auth0.auth.createUser({
      email: `${username}@managish.com`,
      password: password,
      connection: "Username-Password-Authentication",
    }).then(res => {
      auth0deviceLogin(username, password).then(res => {
        dispatch({
          type: DEVICE_LOGIN_SUCCESS,
          payload: {
            refreshToken: res.refreshToken,
            token: res.idToken,
            time: Date.now()
          }
        });
        Keychain.setGenericPassword(`${username}@managish.com`, password);
        deviceLoginSuccess(res.idToken, dispatch);
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

export const fetchBaseData = () => (dispatch: Dispatch, getState: () => ApplicationState): Promise<boolean> => {
  const state = getState();
  API.fetchStatus()
    .then(res => {
      console.log(res);
    }).catch(err => {
      console.log(err);
    })
  return Promise.all([
    !state.login.deviceLoggedIn && 
    API.fetchProfile(state.login.user && state.login.user.id)
      .then(result => {
        dispatch({
          type: FETCH_PROFILES_SUCCESS,
          payload: [result].filter(e => e)
        })
      }),
    API.fetchPlaceTypes()
        .then(results => {
          dispatch({
            type: FETCH_PLACE_TYPES_SUCCESS,
            payload: results.filter(result => result)
          })
        }),
        API.fetchFeatureTypes()
        .then(results => {
          dispatch({
            type: FETCH_FEATURE_TYPES_SUCCESS,
            payload: results.filter(result => result)
          })
      })
  ]).then(() => {
    dispatch({ type: FETCH_BASE_DATA_SUCCESS });
    return true;
  }).catch(err => {
    console.log(err);
    return err;
  })
}

export const fetchMoreFeed = () => (dispatch: Dispatch, getState: () => ApplicationState): Promise<any> => {
  const state = getState();

  dispatch({ type: FETCH_FEED_PAGE_REQUEST });

  return new Promise((resolve, reject) => {
    axios.get(`/feed?next_doc_timestamp=${state.feed.nextPost.timestamp}&next_doc_id=${state.feed.nextPost._id}`).then((res) => {
      const profiles = res.data.posts.map((review: Review) => API.fetchProfile(review.userId));
      const places = res.data.posts.map((review: Review) => API.fetchPlace(review.placeId));
      const photos = res.data.posts.map((review: Review) => API.fetchPicture(review.photo));
      const replyProfiles = [].concat(...res.data.posts.map((review: Review) => review.replies.map(reply => API.fetchProfile(reply.userId))));
  
      Promise.all([
        Promise.all([
          Promise.all(profiles),
          Promise.all(replyProfiles)
        ]).then(results => {
          dispatch({
            type: FETCH_PROFILES_SUCCESS,
            payload: [].concat(...results).filter(result => result)
          })
        }).catch(err => {
          console.log(err);
        }),
        Promise.all(places).then(results => {
          dispatch({
            type: FETCH_PLACES_SUCCESS,
            payload: results.filter(result => result)
          })
        }).catch(err => {
          console.log(err);
        }),
        Promise.all(photos).then(results => {
          dispatch({
            type: FETCH_PHOTOS_SUCCESS,
            payload: results.filter(result => result)
          })
        }).catch(err => {
          console.log(err);
        })
      ]).then(() => {
        dispatch({ type: FETCH_FEED_PAGE_SUCCESS, payload: res.data });
        resolve();
      }).catch(err => {
        dispatch({ type: FETCH_FEED_PAGE_FAILURE })
        console.log(err);
      })
    });
  })
}

export const refreshFeed = () => (dispatch: Dispatch, getState: () => ApplicationState) => {
  dispatch({ type: REFRESH_FEED_REQUEST });

  axios.get(`/feed`).then((res) => {
    const profiles = res.data.posts.map((review: Review) => API.fetchProfile(review.userId));
    const places = res.data.posts.map((review: Review) => API.fetchPlace(review.placeId));
    const photos = res.data.posts.map((review: Review) => API.fetchPicture(review.photo));
    const replyProfiles = [].concat(...res.data.posts.map((review: Review) => review.replies.map(reply => API.fetchProfile(reply.userId))));

    Promise.all([
      Promise.all([
        Promise.all(profiles),
        Promise.all(replyProfiles)
      ]).then(results => {
        dispatch({
          type: FETCH_PROFILES_SUCCESS,
          payload: [].concat(...results).filter(result => result)
        })
      }).catch(err => {
        console.log(err);
      }),
      Promise.all(places).then(results => {
        dispatch({
          type: FETCH_PLACES_SUCCESS,
          payload: results.filter(result => result)
        })
      }).catch(err => {
        console.log(err);
      }),
      Promise.all(photos).then(results => {
        dispatch({
          type: FETCH_PHOTOS_SUCCESS,
          payload: results.filter(result => result)
        })
      }).catch(err => {
        console.log(err);
      })
    ]).then(() => {
      dispatch({ type: REFRESH_FEED_SUCCESS, payload: res.data });
    }).catch(err => {
      console.log(err);
    })
  });
}

export const fetchFeed = () => (dispatch: Dispatch, getState: () => ApplicationState) => {
  axios.get('/feed').then((res) => {
      const profiles = res.data.posts.map((review: Review) => API.fetchProfile(review.userId));
      const places = res.data.posts.map((review: Review) => API.fetchPlace(review.placeId));
      const photos = res.data.posts.map((review: Review) => API.fetchPicture(review.photo));
      const replyProfiles = [].concat(...res.data.posts.map((review: Review) => review.replies.map(reply => API.fetchProfile(reply.userId))));

      Promise.all([
        Promise.all([
          Promise.all(profiles),
          Promise.all(replyProfiles)
      ]).then(results => {
        dispatch({
          type: FETCH_PROFILES_SUCCESS,
          payload: [].concat(...results).filter(result => result)
        })
      }).catch(err => {
        console.log(err);
        console.log(JSON.stringify(err));
      }),
      Promise.all(places).then(results => {
        dispatch({
          type: FETCH_PLACES_SUCCESS,
          payload: results.filter(result => result)
        })
      }).catch(err => {
        console.log(err);
      }),
      Promise.all(photos).then(results => {
        dispatch({
          type: FETCH_PHOTOS_SUCCESS,
          payload: results.filter(result => result)
        })
      }).catch(err => {
        console.log(err);
      })
    ]).then(() => {
      dispatch({ type: FETCH_FEED_SUCCESS, payload: res.data });
    }).catch(err => {
      console.log(err);
    })
  });
}


export const loginRequest = () => {
  return {
    type: LOGIN_REQUEST
  }
}

export const createAccount = () => (dispatch: Dispatch, getState: () => ApplicationState) => {
  dispatch({ type: CREATE_ACCOUNT_REQUEST });

  const state = getState();

  auth0.auth.createUser({
    email: state.login.form.email,
    password: state.login.form.password,
    metadata: {
      name: state.login.form.name,
      picture: state.login.form.imageData && 'custom'
    },
    connection: "Username-Password-Authentication",
  }).then(res => {
    auth0.auth.passwordRealm({
      username: state.login.form.email,
      password: state.login.form.password,
      realm: 'Username-Password-Authentication',
      scope: 'openid offline_access refresh_token profile email',
      audience: 'https://managish.eu-gb.mybluemix.net/',
    }).then(res => {
      const token: any = jwt(res.idToken);
      API.config(res.idToken);
  
      // TODO remove dev
      Clipboard.setString(res.idToken);

      new Promise((resolve, reject) => {
        if (state.login.form.imageData) {
          API.uploadProfilePicture(state.login.form.imageData.path).then(res => {
            resolve(res);
          }).catch(err => {
            reject(err);
          })
        } else {
          resolve();
        }
      }).then(imageUploadRes => {
        console.log('image upload res', imageUploadRes);
        dispatch({
          type: LOGIN_SUCCESS,
          payload: {
            id: token["https://managish.eu-gb.mybluemix.net/public_id"],
            name: token.name,
            picture: token.picture,
            refreshToken: res.refreshToken,
            token: res.idToken,
            time: Date.now()
          }
        });
    
        Keychain.setGenericPassword(state.login.form.email, state.login.form.password)
        
        dispatch(NavigationActions.navigate({ routeName: "App" }));
      }).catch(err => {
        console.log(err);
      });
  
    }).catch(err => {
      console.log(err)
      dispatch({
        type: LOGIN_FAILURE,
        payload: err
      })
    });

    console.log(res);
  }).catch(err => {
    console.log(err);
    console.log(err.message);
    console.log(err.name);
    console.log(err.status);
    console.log(err.code);
  })
}

export const refreshLogin = () => (dispatch: Dispatch, getState: () => ApplicationState) => {
  
}

export const login = () => (dispatch: Dispatch, getState: () => ApplicationState) => {
  dispatch(loginRequest());

  const state = getState();
  return new Promise((resolve) => {
    auth0.auth.passwordRealm({
      username: state.login.form.email,
      password: state.login.form.password,
      realm: 'Username-Password-Authentication',
      scope: 'openid offline_access refresh_token profile email',
      audience: 'https://managish.eu-gb.mybluemix.net/',
    }).then(res => {
      const token: any = jwt(res.idToken);
  
      // TODO remove dev
      Clipboard.setString(res.idToken);

      Keychain.setGenericPassword(state.login.form.email, state.login.form.password)
  
      resolve();

      dispatch({
        type: LOGIN_SUCCESS,
        payload: {
          id: token["https://managish.eu-gb.mybluemix.net/public_id"],
          name: token.name,
          picture: token.picture,
          refreshToken: res.refreshToken,
          token: res.idToken,
          time: Date.now()
        }
      });
  
      API.config(res.idToken);

      dispatch(NavigationActions.navigate({ routeName: "App" }));
  
    }).catch(err => {
      console.log(err);
      console.log(Object.entries(err));
  
      dispatch({
        type: LOGIN_FAILURE,
        payload: err.message === 'Wrong email or password.' ? 'דוא״ל או סיסמה שגויים' : 'בעיית התחברות'
      })
    });
  })
}

export const refreshToken = () => (dispatch: Dispatch, getState: () => ApplicationState) => {
  // auth0.auth.refreshToken({refreshToken: res.refreshToken as string}).then(res => {
  //   console.log('refresh', res)
  // }).catch(err => {
  //   console.log(err);
  // })
}