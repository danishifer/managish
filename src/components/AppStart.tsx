import React from 'react';
import {  StyleSheet, View } from "react-native";
import { connect } from 'react-redux';
import { ApplicationState } from '../App';
import { Dispatch, bindActionCreators } from 'redux';
import SplashScreen from 'react-native-splash-screen';
import * as Keychain from 'react-native-keychain';
import { NavigationActions } from 'react-navigation';
import { silentLogin, deviceSilentLogin } from '../actions/appstart';
import DeviceInfo from 'react-native-device-info';

interface IProps {
	deviceLoggedIn: boolean
}

interface IActions {
	showWelcome: () => void,
	showApp: () => void,
	silentLogin: (credentials: any) => void,
	deviceSilentLogin: (credentials: any) => void
}

class AppStart extends React.Component<IProps & IActions> {
	
	scroll: any;
	scrollViewOffset = 0;
	
	componentDidMount() {
		// check login status...
		// Keychain.resetGenericPassword();
		// SplashScreen.hide();
		// persistor.pause();
		// persistor.purge();
		console.log(DeviceInfo.getVersion());
    Keychain.getGenericPassword()
      .then(res => {
				console.log(res);
        if (res) {
					// user is logged in
					if (!this.props.deviceLoggedIn) {
						this.props.silentLogin(res);
					} else {
						this.props.deviceSilentLogin(res);
					}
          this.props.showApp()
        } else {
          this.props.showWelcome()
        }
        SplashScreen.hide();
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
				
			</View>
		)
	}
}

const styles = StyleSheet.create({
	container: {
		display: 'flex',
		backgroundColor: 'white',
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
	background: {
		position: 'absolute',
		top: 0,
		left: 0,
		width: '100%',
		height: '100%',
		zIndex: -999
	},
	loaderContainer: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: "20%",
  },
})

const mapStateToProps = (state: ApplicationState): IProps => ({
	deviceLoggedIn: state.login.deviceLoggedIn
})

const mapDispatchToProps = (dispatch: Dispatch): IActions => {
	return bindActionCreators({
    showWelcome: () => NavigationActions.navigate({ routeName: 'Welcome' }),
		showApp: () => NavigationActions.navigate({ routeName: "Home" }),
		silentLogin,
		deviceSilentLogin
	}, dispatch)
}


export default connect(mapStateToProps, mapDispatchToProps)(AppStart);