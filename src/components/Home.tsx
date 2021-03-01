import React from 'react';
import { ScrollView, StyleSheet, View, Image, ActivityIndicator, RefreshControl, LayoutAnimation, Platform } from "react-native";
import Review from '../containers/review';
import Feed from '../containers/feed';
import Header from '../containers/header';
import { connect } from 'react-redux';
import { ApplicationState } from '../App';
import { Dispatch, bindActionCreators } from 'redux';
import { fetchBaseData } from '../actions';
import { fetchFeed, refreshFeed, fetchMoreFeed } from '../actions/index';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { EventEmitter } from 'events';

export const homeScrollEvents = new EventEmitter();

interface IProps {
	loading: boolean,
	loadingMore: boolean,
	refreshing: boolean,
	postsCount:  number,
	fetchedPostsCount: number,
	reviewFocused: boolean
}

interface IActions {
	fetchBaseData: () => Promise<boolean>,
	fetchFeed: () => void,
	refresh: () => void,
	fetchMoreFeed: () => Promise<any>
}

class Home extends React.Component<IProps & IActions> {

	scroll: any;
	scrollViewOffset = 0;

	componentDidMount() {
		this.props.fetchBaseData().then(() => {
			LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
			this.props.fetchFeed();
		}).catch(err => {
			console.log(err);
			// TODO base data error handling
		});

		homeScrollEvents.on('top', () => {
			if (this.scroll) {
				// scrollview may not have already mounted
				this.scroll.scrollTo({ x: 0, y: 0, animated: true });
			}
		})
	}

	getScrollView = () => this.scroll
	getScrollViewOffset = () => this.scrollViewOffset

	isCloseToBottom = ({layoutMeasurement, contentOffset, contentSize}) => {
		const paddingToBottom = 48;
		return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
	};

	render() {
		return (
			<View style={styles.container}>
				<Header startIcon={undefined} startIconPress={() => {}} />
				{this.props.loading ?
					<View style={styles.loaderContainer}>
						<ActivityIndicator size="large" color="#000" />
					</View>
				:
					<KeyboardAwareScrollView
						nestedScrollEnabled={true}
						style={styles.pageContainer}
						contentContainerStyle={styles.pageContentContainer}
						showsVerticalScrollIndicator={false}
						showsHorizontalScrollIndicator={false}
						keyboardShouldPersistTaps="always"
						extraScrollHeight={this.props.reviewFocused ? Platform.OS === 'android' ? 0 : 113 : 48}
						keyboardOpeningTime={0}
						innerRef={ref => {this.scroll = ref}}
						onScroll={(e) => {
							this.scrollViewOffset = e.nativeEvent.contentOffset.y;

							// load more posts if available
							if (this.isCloseToBottom(e.nativeEvent) && !this.props.loadingMore && (this.props.fetchedPostsCount < this.props.postsCount)) {
								this.props.fetchMoreFeed().then(() => {
									LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
								});
							}
						}}
						refreshControl={
							<RefreshControl refreshing={this.props.refreshing} onRefresh={() => this.props.refresh()} />
						}
					>
						<Review getScrollView={this.getScrollView} />
						<Feed getScrollView={this.getScrollView} getScrollViewOffset={this.getScrollViewOffset} />
					</KeyboardAwareScrollView>
				}
			</View>
		)
	}
}

const styles = StyleSheet.create({
	container: {
		display: 'flex',
		flex: 1,
	},
	pageContainer: {
		marginHorizontal: 36,
		flex: 1,
		
	},
	pageContentContainer: {
		flexGrow: 1,
	},
	toolbarContainer: {
		width: "100%"
	},
	loaderContainer: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: "20%",
  },
})

const mapStateToProps = (state: ApplicationState): IProps => ({
	loading: state.feed.loading,
	refreshing: state.feed.refreshing,
	loadingMore: state.feed.loadingMore,
	postsCount: state.feed.postsCount,
	fetchedPostsCount: state.feed.fetchedPostsCount,
	reviewFocused: state.review.isFocused 
})

const mapDispatchToProps = (dispatch: Dispatch): IActions => {
	return bindActionCreators<IActions, any>({
		fetchBaseData: fetchBaseData,
		fetchFeed,
		refresh: refreshFeed,
		fetchMoreFeed: fetchMoreFeed
	}, dispatch)
}


export default connect(mapStateToProps, mapDispatchToProps)(Home);