import { EMAIL_INPUT_CHANGE, PASSWORD_INPUT_CHANGE, NAME_INPUT_CHANGE, CREATE_ACCOUNT_NEXT_FORM, CREATE_ACCOUNT_IMAGE_CHANGE, CREATE_ACCOUNT_IMAGE_REQUEST, CREATE_ACCOUNT_PREVIOUS_FORM } from '.';

export const emailChange = (text: string) => {
  return {
    type: EMAIL_INPUT_CHANGE,
    payload: text
  }
}

export const passwordChange = (text: string) => {
  return {
    type: PASSWORD_INPUT_CHANGE,
    payload: text   
  }
}

export const nameChange = (text: string) => {
  return {
    type: NAME_INPUT_CHANGE,
    payload: text   
  }
}


export const createAccountNextForm = () => {
  return {
    type: CREATE_ACCOUNT_NEXT_FORM
  }
}

export const imageChange = (data: any) => {
  return {
    type: CREATE_ACCOUNT_IMAGE_CHANGE,
    payload: data
  }
}

export const imageChangeRequest = () => ({
  type: CREATE_ACCOUNT_IMAGE_REQUEST
})

export const createAccountBack = () => ({
  type: CREATE_ACCOUNT_PREVIOUS_FORM
})