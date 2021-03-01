import { combineReducers, createStore, applyMiddleware } from 'redux';
import { connect } from 'react-redux';
import { NavigationState, createBottomTabNavigator, createSwitchNavigator } from 'react-navigation';
import { createNavigationReducer, createReactNavigationReduxMiddleware, reduxifyNavigator } from 'react-navigation-redux-helpers';
import { createLogger } from "redux-logger";
import thunk from 'redux-thunk';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { createBlacklistFilter } from 'redux-persist-transform-filter';

import reducers from './reducers';
import Welcome from './containers/welcome';
import Home from './components/Home';
import TabBar from './containers/tabbar';
import { Review } from './constants';
import { Profile, Place } from './api';
import { HomeState } from './reducers/home';
import { ReviewForm } from './reducers/review';
import { PlacesState } from './reducers/places';
import { LoginState } from './reducers/login';
import { SearchState } from './reducers/search';
import { ServiceState } from './reducers/service';
import SearchPage from './components/Search';
import AboutPage from './components/About';
import AppStart from './components/AppStart';

export interface ApiState {
  profiles: { [id: string]: Profile },
  places: { [id: string]: Place },
  photos: { [id: string]: string },
  features: { [id: string]: { name: string, icon: string} },
  placeTypes: { [id: string]: { name: string, icon: string } },
  reviews: { [id: string]: Review }
}

export interface FeedState {
  loading: boolean,
  loadingMore: boolean,
  posts: Review[],
  postsCount: number,
  fetchedPostsCount: number,
  nextPost?: Review,
  openReplies: { [reviewId: string]: boolean },
  repliesText: { [reviewId: string]: string },
  repliesLoading: { [reviewId: string]: boolean },
  refreshing: boolean
}

export interface WelcomeState {
  loginEnabled: boolean,
  createAccountEnabled: boolean,
  keyboardHeight?: number,
  showSignupMessage: boolean
}

export interface ApplicationState {
  nav?: NavigationState,
  feed: FeedState,
  welcome: WelcomeState,
  login: LoginState,
  api: ApiState,
  home: HomeState,
  review: ReviewForm,
  places: PlacesState,
  search: SearchState,
  service: ServiceState
}

const AppNavigator = createBottomTabNavigator({
  Home,
  Search: SearchPage,
  About: AboutPage
}, {
  animationEnabled: true,
  tabBarComponent: TabBar
})

const RootNavigator = createSwitchNavigator({
  Welcome,
  AppStart,
  App: AppNavigator,
}, {
  initialRouteName: "AppStart",
})

const navReducer = createNavigationReducer(RootNavigator);
const appReducer = combineReducers({
  nav: navReducer,
  ...reducers
})

const middlewares = [];

if (__DEV__ === true) {
  middlewares.push(createLogger({}));
}

middlewares.push(thunk)
middlewares.push(createReactNavigationReduxMiddleware(
  "root",
  (state: ApplicationState) => state.nav
));

const Root = reduxifyNavigator(RootNavigator, "root");

const mapStateToProps = (state: any): { state: NavigationState } => ({
  state: state.nav,
  ...reducers
});

// @ts-ignore
export const RootWithNavigationState = connect(mapStateToProps)(Root);


const persistedReducer = persistReducer({
  key: 'root',
  storage,
  blacklist: ['nav', 'welcome', 'review', 'search', 'service'],
  transforms: [createBlacklistFilter('feed', ['loadingMore'])]
}, appReducer);

const store = createStore(
  persistedReducer,
  applyMiddleware(...middlewares),
);

let persistor = persistStore(store)

export { store, persistor };