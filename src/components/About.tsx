import React from 'react';
import { Text, StyleSheet, View } from "react-native";
import { connect } from 'react-redux';
import { ApplicationState } from '../App';
import { Dispatch, bindActionCreators } from 'redux';
import { NavigationActions } from 'react-navigation';
import { silentLogin } from '../actions/appstart';
import Header from '../containers/header';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

interface IProps {
}

interface IActions {

}

class AppStart extends React.Component<IProps & IActions> {

	scroll: any;
	scrollViewOffset = 0;

	componentDidMount() {
		// check login status...
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
        {/* <Image style={styles.background} source={require('../../assets/background.png')} /> */}
				<Header startIcon={undefined} startIconPress={() => {}} />

        <KeyboardAwareScrollView>
          <View style={styles.card}>
            <Text style={[styles.text, {marginBottom: 16}]}>
            אפליקציית ״מה נגיש״ פותחה במסגרת פרוייקט חקר של פתרון בעיות באמצעים טכנולוגים לחטיבות ביניים.
            </Text>
            <Text style={[styles.text, {marginBottom: 8}]}>
            הבעיה ש״מה נגיש״ פותרת היא מציאה ושיתוף של מקומות נגישים לבעלי מוגבלויות במודל של רשת חברתית.
            </Text>
            <Text style={[styles.text, {marginBottom: 8}]}>
            האפליקציה פותחה ע״י תלמידי כיתה ט׳ בחטיבת הביניים ״רימון״ רעננה:
            </Text>
            <Text style={[styles.text, {}]}>
            דני שיפר
            </Text>
            <Text style={[styles.text, {}]}>
            תומר מיכאלי
            </Text>
            <Text style={[styles.text, {}]}>
            נוי כהן
            </Text>
            <Text style={[styles.text, {marginBottom: 8}]}>
            איתי וילוז׳ני
            </Text>
            <Text style={[styles.text, {}]}>
            בהנחיית המורות דגנית פור דוד ומלינה נועם.
            </Text>
          </View>
        </KeyboardAwareScrollView>
			</View>
		)
	}
}

const styles = StyleSheet.create({
	container: {
		display: 'flex',
		flex: 1,
  },
  text: {
    fontFamily: 'System',
    fontSize: 16
  },
  card: {
    marginVertical: 24,
    marginHorizontal: 36,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#70798C',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    display: 'flex',
  }
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
	return bindActionCreators({
    showWelcome: () => NavigationActions.navigate({ routeName: 'Welcome' }),
		showApp: () => NavigationActions.navigate({ routeName: "Home" }),
		silentLogin
	}, dispatch)
}


export default connect(mapStateToProps, mapDispatchToProps)(AppStart);
