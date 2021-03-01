import { FETCH_BASE_DATA_SUCCESS } from '../actions/index';
import update from 'immutability-helper';


export interface HomeState {
  loading: boolean,
}

const initialState: HomeState = {
  loading: true,
}

export default function(state = initialState, action: any) {
  switch(action.type) {
    case FETCH_BASE_DATA_SUCCESS:
      return update(state, {
        loading: { $set: false }
      });
    default:
      return state;
  }
}