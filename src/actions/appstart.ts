import jwt from 'jwt-decode';
import { Dispatch } from "redux";
import { ApplicationState } from "../App";
import { auth0 } from ".";
import API from '../api';

export const SILENT_LOGIN_REQEST = 'SILENT_LOGIN_REQEST';
export const SILENT_LOGIN_SUCCESS = 'SILENT_LOGIN_SUCCESS';
export const DEVICE_SILENT_LOGIN_REQUEST = 'DEVICE_SILENT_LOGIN_REQUEST';
export const DEVICE_SILENT_LOGIN_SUCCESS = 'DEVICE_SILENT_LOGIN_SUCCESS';

export const silentLogin = (credentials: any) => (dispatch: Dispatch, getState: () => ApplicationState) => {

  const state = getState();

  dispatch({ type: SILENT_LOGIN_REQEST });

  console.log(state.login.loginTime)
  if (state.login.loginTime < Date.now() - 79200000) {
    // token is still valid
    const prevToken = state.login.token;
    API.config(prevToken)
  }

  auth0.auth.passwordRealm({
    username: credentials.username,
    password: credentials.password,
    realm: 'Username-Password-Authentication',
    scope: 'openid offline_access refresh_token profile email',
    audience: 'https://managish.eu-gb.mybluemix.net/',
  }).then(res => {
    const token: any = jwt(res.idToken);
    API.config(res.idToken);

    dispatch({
      type: SILENT_LOGIN_SUCCESS,
      payload: {
        id: token["https://managish.eu-gb.mybluemix.net/public_id"],
        name: token.name,
        picture: token.picture,
        refreshToken: res.refreshToken,
        token: res.idToken,
        time: Date.now()
      }
    })
  });
}

export const deviceSilentLogin = (credentials: any) => (dispatch: Dispatch, getState: () => ApplicationState) => {
  const state = getState();

  dispatch({ type: DEVICE_SILENT_LOGIN_REQUEST });

  if (state.login.loginTime < Date.now() - 79200000) {
    // token is still valid
    const prevToken = state.login.token;
    API.config(prevToken)
  }

  auth0.auth.passwordRealm({
    username: credentials.username,
    password: credentials.password,
    realm: 'Username-Password-Authentication',
    scope: 'openid offline_access refresh_token profile email',
    audience: 'https://managish.eu-gb.mybluemix.net/',
  }).then(res => {
    const token: any = jwt(res.idToken);
    API.config(res.idToken);

    dispatch({
      type: DEVICE_SILENT_LOGIN_SUCCESS,
      payload: {
        id: token["https://managish.eu-gb.mybluemix.net/public_id"],
        refreshToken: res.refreshToken,
        token: res.idToken,
        time: Date.now()
      }
    })
  });
}