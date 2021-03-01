import feed from './feed';
import welcome from './welcome';
import login from './login';
import api from './api';
import home from './home';
import review from './review';
import places from './places';
import search from './search';
import service from './service';
import { persistReducer, PersistConfig } from 'redux-persist';
import storage from 'redux-persist/lib/storage'

const reviewConfig: PersistConfig = {
  key: 'review',
  storage,
  blacklist: ['text', 'isFocused']
}

export default {
  feed,
  welcome,
  login,
  api,
  home,
  review: persistReducer(reviewConfig, review),
  places,
  search,
  service
};