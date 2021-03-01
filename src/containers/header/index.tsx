import React, { Component } from 'react'
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions, Platform, LayoutAnimation } from 'react-native'
import { connect } from 'react-redux'
import { ApplicationState, persistor } from '../../App';
import { NavigationActions } from 'react-navigation';
import { resetWelcome } from '../../actions';
import { bindActionCreators } from 'redux';
import * as Keychain from 'react-native-keychain';

interface IProps {
  startIcon: any,
  startIconPress: () => void,
  showWelcome: () => any,
  resetWelcome: () => any
}

const { width, height } = Dimensions.get('screen');

const isTall = Platform.OS === 'ios' && height / width > 2.15

class Header extends Component<IProps> {
  render() {
    return (
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.headerIconContainer} onPress={this.props.startIconPress}>
          {this.props.startIcon && <Image style={{opacity: 0.7}} source={this.props.startIcon} />}
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Image style={styles.headerImage} source={require('../../../assets/icons/logo.png')} />
        </View>
        <TouchableOpacity style={styles.headerIconContainerEnd} onPress={(() => {
          // this.props.navigation.navigate('Welcome');
          // this.props.welcome()
          Keychain.resetGenericPassword();
          persistor.purge();
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          this.props.resetWelcome();
          this.props.showWelcome();
        }).bind(this)}>
          <Image source={require('../../../assets/icons/bx-log-out.png')} />
        </TouchableOpacity>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  headerContainer: {
    height: Platform.OS === 'android' ? 65 : isTall ? 100 : 80,
    backgroundColor: 'white',
    shadowColor: '#70798C',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Platform.OS === 'android' ? 8 : isTall ? 36 : 24,
    paddingHorizontal: 36,
    zIndex: 999,
    // width: '100%'
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerImage: {
    width: 79.35,
    height: 26.45
  },
  headerIconContainer: {
    width: 32,
    alignItems: 'flex-start',
  },
  headerIconContainerEnd: {
    width: 32,
    alignItems: 'flex-end',
  }
})

const mapStateToProps = (state: ApplicationState) => ({
  nav: state.nav,
})

const mapDispatchToProps = dispatch => {
  return bindActionCreators({
    showWelcome: () => NavigationActions.navigate({ routeName: "Welcome" }),
    resetWelcome
  }, dispatch)
  // return {
  //   welcome: () => dispatch(fetchFeed)
  //   // welcome: () => dispatch(NavigationActions.navigate({ routeName: 'Welcome' }))
  // }
}

export default connect(mapStateToProps, mapDispatchToProps)(Header)
