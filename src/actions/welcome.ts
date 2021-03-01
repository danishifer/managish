import { SHOW_WELCOME_LOGIN, SHOW_WELCOME_CREATE_ACCOUNT, WELCOME_RESET, WELCOME_SET_KEYBOARD_HEIGHT } from ".";

export const showLogin = () => {
  return {
    type: SHOW_WELCOME_LOGIN
  }
}

export const showCreateAccount = () => {
  return {
    type: SHOW_WELCOME_CREATE_ACCOUNT
  }
}

export const resetWelcome = () => ({
  type: WELCOME_RESET
})

export const setKeyboardHeight = (height: number) => ({
  type: WELCOME_SET_KEYBOARD_HEIGHT,
  payload: height
})