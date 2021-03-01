import React from 'react';
import { StyleSheet, View, Image, ScrollView, Dimensions, LayoutAnimation, Platform } from "react-native";
import Header from '../containers/header';
import { connect } from 'react-redux';
import { ApplicationState } from '../App';
import { Dispatch, bindActionCreators } from 'redux';
import { fetchBaseData } from '../actions';
import { fetchFeed, refreshFeed, fetchMoreFeed } from '../actions/index';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import Search from '../containers/search';
import Service from '../containers/service';
import { exitResult } from '../actions/search';

import { EventEmitter } from 'events';

export const searchScrollEvents = new EventEmitter();

interface IProps {
	loading: boolean,
	refreshing: boolean,
	loadingMore: boolean,
	postsCount: number,
	fetchedPostsCount: number,
	reviewFocused: boolean,
	searchResults?: string[],
	chosenResultIndex?: number,
	isResultSelected: boolean
}

interface IActions {
	exitResult: () => void
}

const { width } = Dimensions.get('screen');

class SearchPage extends React.Component<IProps & IActions> {

	scrollViewLength: number = 0;
	scroll: any;
	serviceScroll: any;
	scrollViewOffset = 0;
	rootScrollView: ScrollView;

	getRootScrollView = () => this.rootScrollView
	getScrollView = () => this.scroll
	getScrollViewOffset = () => this.scrollViewOffset

	isCloseToBottom = ({layoutMeasurement, contentOffset, contentSize}) => {
		const paddingToBottom = 48;
		return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
	};

	componentDidMount() {
		searchScrollEvents.on('top', () => {
			if (this.scroll) {
				// scrollview may not have already mounted
				this.scroll.scrollTo({ x: 0, y: 0, animated: true });
			}
		})
	}

	render() {
		return (
			<View style={styles.container}>
				<Header startIcon={this.props.isResultSelected && require('../../assets/icons/bx-back.png')} startIconPress={() => {
					if (Platform.OS === 'android') {
						this.rootScrollView.scrollToEnd()
					} else {
						this.rootScrollView.scrollTo({ x: 0, y: 0 })
					}
				}} />

				<ScrollView
					ref={ref => this.rootScrollView = ref}
					horizontal
					decelerationRate={0}
					snapToInterval={width} //element width
					snapToAlignment={"center"}
					showsHorizontalScrollIndicator={false}
					showsVerticalScrollIndicator={false}
					scrollEnabled={this.props.isResultSelected}
					keyboardShouldPersistTaps="always"
					bounces={false}
					nestedScrollEnabled={true}
					onContentSizeChange={(w) => {
						this.scrollViewLength = w;
					}}
					onMomentumScrollBegin={() => {
						LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
					}}
					onScroll={(e) => {
						if (Platform.OS === 'android') {
							if (this.props.isResultSelected && e.nativeEvent.contentOffset.x === this.scrollViewLength / 2) {
								this.props.exitResult();
							}
						} else if (this.props.isResultSelected && e.nativeEvent.contentOffset.x === 0) {
							this.props.exitResult();
						}
					}}
				>
					<KeyboardAwareScrollView
						style={styles.pageContainer}
						contentContainerStyle={styles.pageContentContainer}
						showsVerticalScrollIndicator={false}
						keyboardShouldPersistTaps="always"
						keyboardOpeningTime={0}
						innerRef={ref => {this.scroll = ref}}
						nestedScrollEnabled={true}
						onScroll={(e) => {
							this.scrollViewOffset = e.nativeEvent.contentOffset.y;
	
							// load more posts if available
							// if (this.isCloseToBottom(e.nativeEvent) && !this.props.loadingMore && (this.props.fetchedPostsCount < this.props.postsCount)) {
								// this.props.fetchMoreFeed().then(() => {
									// LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
								// });
							// }
						}}
					>
						<Search rootScrollView={this.getRootScrollView} />
					</KeyboardAwareScrollView>
					<KeyboardAwareScrollView
						style={styles.pageContainer}
						contentContainerStyle={styles.serviceContainer}
						showsVerticalScrollIndicator={false}
						nestedScrollEnabled={true}
						keyboardShouldPersistTaps="always"
						keyboardOpeningTime={0}
						extraScrollHeight={48}
						innerRef={ref => {this.serviceScroll = ref}}
					>
						<Service getScrollView={() => this.serviceScroll} resultIndex={this.props.chosenResultIndex} />
					</KeyboardAwareScrollView>
				</ScrollView>
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
		width: width,
	},
	pageContentContainer: {
		paddingHorizontal: 36,
		flexGrow: 1,
	},
	serviceContainer: {
		width: width,
		paddingHorizontal: 36,
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
	reviewFocused: state.review.isFocused,
	searchResults: state.search.results,
	isResultSelected: state.search.isResultSelected,
	chosenResultIndex: state.search.chosenResultIndex
})

const mapDispatchToProps = (dispatch: Dispatch): IActions => {
	return bindActionCreators<IActions, any>({
		fetchBaseData: fetchBaseData,
		fetchFeed,
		refresh: refreshFeed,
		fetchMoreFeed: fetchMoreFeed,
		exitResult
	}, dispatch)
}


export default connect(mapStateToProps, mapDispatchToProps)(SearchPage);
