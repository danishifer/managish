import { EMAIL_INPUT_CHANGE, PASSWORD_INPUT_CHANGE, LOGIN_REQUEST, LOGIN_SUCCESS, NAME_INPUT_CHANGE, CREATE_ACCOUNT_NEXT_FORM, CREATE_ACCOUNT_IMAGE_CHANGE, CREATE_ACCOUNT_IMAGE_REQUEST, CREATE_ACCOUNT_PREVIOUS_FORM, CREATE_ACCOUNT_REQUEST, LOGIN_FAILURE, DEVICE_LOGIN_REQUEST, DEVICE_LOGIN_SUCCESS } from '../actions';

import update from 'immutability-helper';
import { SILENT_LOGIN_SUCCESS } from '../actions/appstart';

export interface LoginState {
  loading: boolean,
  finalPageEnabled: boolean,
  form: {
    email: string,
    password: string,
    name: string,
    nextForm: boolean,
    imageData?: any,
    imageLoading: boolean
  },
  user?: {
    id: string,
    name: string,
    picture: string,
  },
  token?: string,
  refreshToken?: string,
  loginTime?: number,
  loginError?: string,
  deviceLoginLoading: boolean,
  deviceLoggedIn: boolean
}

const initialState: LoginState = {
  loading: false,
  finalPageEnabled: false,
  form: {
    email: "",
    password: "",
    name: "",
    nextForm: false,
    imageLoading: false
  },
  deviceLoginLoading: false,
  deviceLoggedIn: false
}

export default function(state = initialState, action: any) {
  switch(action.type) {
    case EMAIL_INPUT_CHANGE:
      return update(state, {
        form: { email: { $set: action.payload } }
      })
    case PASSWORD_INPUT_CHANGE:
      return update(state, {
        form: { password: { $set: action.payload } }
      })
    case NAME_INPUT_CHANGE:
      return update(state, {
        form: { name: { $set: action.payload } }
      })
    case CREATE_ACCOUNT_NEXT_FORM:
      return update(state, {
        form: { nextForm: { $set: true } }
      })
    case CREATE_ACCOUNT_IMAGE_REQUEST:
      return update(state, {
        form: { imageLoading: { $set: true }}
      })
    case CREATE_ACCOUNT_IMAGE_CHANGE:
      return update(state, {
        form: {
          imageData: { $set: action.payload },
          imageLoading: { $set: false }
        }
      })
    case CREATE_ACCOUNT_PREVIOUS_FORM:
      return update(state, {
        form: { nextForm: { $set: false } }
      })
    case CREATE_ACCOUNT_REQUEST:
      return update(state, {
        loading: { $set: true }
      })
    case LOGIN_REQUEST:
      return update(state, {
        loading: { $set: true }
      })
    case LOGIN_SUCCESS:
      return update(state, {
        user: { $set: {
          id: action.payload.id,
          name: action.payload.name,
          picture: action.payload.picture,
        }},
        form: { $set: initialState.form },
        token: { $set: action.payload.token },
        refreshToken: { $set: action.payload.refreshToken },
        loading: { $set: false },
        loginTime: { $set: action.payload.time },
        loginError: { $set: null },
        deviceLoggedIn: { $set: false }
      })
    case SILENT_LOGIN_SUCCESS:
      return update(state, {
        user: { $set: {
          id: action.payload.id,
          name: action.payload.name,
          picture: action.payload.picture,
        }},
        token: { $set: action.payload.token },
        refreshToken: { $set: action.payload.refreshToken },
        loading: { $set: false },
        loginTime: { $set: action.payload.time },
        deviceLoggedIn: { $set: false }
      })
    case LOGIN_FAILURE:
      return update(state, {
        loading: { $set: false },
        loginError: { $set: action.payload }
      })
    case DEVICE_LOGIN_REQUEST:
      return update(state, {
        deviceLoginLoading: { $set: true }
      })
    case DEVICE_LOGIN_SUCCESS:
      return update(state, {
        form: { $set: initialState.form },
        token: { $set: action.payload.token },
        refreshToken: { $set: action.payload.refreshToken },
        loading: { $set: false },
        loginTime: { $set: action.payload.time },
        loginError: { $set: null },
        deviceLoggedIn: { $set: true },
        deviceLoginLoading: { $set: false }
      })
    default:
      return state;
  }
}