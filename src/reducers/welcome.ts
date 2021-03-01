import { SHOW_WELCOME_LOGIN, WELCOME_RESET, SHOW_WELCOME_CREATE_ACCOUNT, WELCOME_SET_KEYBOARD_HEIGHT, WELCOME_SHOW_SIGNUP_MESSAGE } from '../actions';
import update from 'immutability-helper';
import { WelcomeState } from '../App';

const initialState: WelcomeState = {
  loginEnabled: false,
  createAccountEnabled: false,
  showSignupMessage: false
}

export default function(state = initialState, action: any) {
  switch(action.type) {
    case SHOW_WELCOME_LOGIN:
      return update(state, {
        loginEnabled: { $set: true }
      });
    case SHOW_WELCOME_CREATE_ACCOUNT:
      return update(state, {
        createAccountEnabled: { $set: true }
      })
    case WELCOME_SHOW_SIGNUP_MESSAGE:
      return update(state, {
        showSignupMessage: { $set: true }
      })
    case WELCOME_RESET:
      return update(state, {
        loginEnabled: { $set: false },
        createAccountEnabled: { $set: false },
        showSignupMessage: { $set: false }
      })
    case WELCOME_SET_KEYBOARD_HEIGHT:
      return update(state, {
        keyboardHeight: { $set: action.payload }
      })
    default:
      return state;
  }
}