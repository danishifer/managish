import React, { Component } from 'react'
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions, Platform, Keyboard, EventSubscription, AppState } from 'react-native'
import { connect } from 'react-redux'
import { ApplicationState } from '../../app';
import { TabBarBottomProps } from 'react-navigation';
import { homeScrollEvents } from '../../components/Home';
import { searchScrollEvents } from '../../components/Search';

const { width, height } = Dimensions.get('screen');

const isTall = Platform.OS === 'ios' && height / width > 2.15

class TabBar extends Component<TabBarBottomProps> {

  keyboardShowListener: EventSubscription
  keyboardHideListener: EventSubscription

  state = {
    show: true
  }

  componentDidMount() {
    if (Platform.OS === 'android') {
      Keyboard.addListener('keyboardDidShow', () => {
        this.setState({ show: false });
      })
      Keyboard.addListener('keyboardDidHide', () => {
        this.setState({ show: true });
      })
      AppState.addEventListener('change', (status) => {
        if (status !== 'active') {
          this.keyboardShowListener && this.keyboardShowListener.remove();
          this.keyboardHideListener && this.keyboardHideListener.remove();
        }
      })
    }
  }

  render() {
    if (!this.state.show) {
      return false;
    }

    return (
      <View style={styles.actionContainer}>
        <TouchableOpacity style={styles.actionIconContainer} onPress={() => {
          if (this.props.navigation.state.index === 0) {
            homeScrollEvents.emit('top');
          } else {
            this.props.navigation.navigate('Home');
          }
        }}>
          <Image style={this.props.navigation.state.index !== 0 ? styles.actionIcon : styles.actionIconActive} source={require(`../../../assets/icons/bx-home.png`)} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionIconContainer} onPress={() => {
          if (this.props.navigation.state.index === 1) {
            searchScrollEvents.emit('top');
          } else {
            this.props.navigation.navigate('Search')
          }
        }}>
          <Image style={this.props.navigation.state.index !== 1 ? styles.actionIcon : styles.actionIconActive} source={require(`../../../assets/icons/bx-search.png`)} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionIconContainer} onPress={() => {
          if (this.props.navigation.state.index === 2) {

          } else {
            this.props.navigation.navigate('About')
          }
        }}>
          <Image style={this.props.navigation.state.index !== 2 ? styles.actionIcon : styles.actionIconActive} source={require(`../../../assets/icons/bx-info.png`)} />
        </TouchableOpacity>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  actionContainer: {
    height: isTall ? 90 : 70,
    backgroundColor: 'white',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: isTall ? 12 : 0,
    paddingHorizontal: 36,
    shadowColor: '#70798C',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: -3 },
    elevation: 1
  },
  actionIconContainer: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIcon: {
    opacity: 0.8
  },
  actionIconActive: {
    opacity: 1,
    tintColor: '#007AFF'
  }
})

const mapStateToProps = (state: ApplicationState) => ({
  
})

const mapDispatchToProps = {
  
}

export default connect(mapStateToProps, mapDispatchToProps)(TabBar)
