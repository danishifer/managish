import React, { Component } from 'react'
import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator, LayoutAnimation, Platform, Keyboard, EmitterSubscription, Dimensions } from 'react-native'
import { connect } from 'react-redux';
import CreateAccount from '../login/CreateAccount';
import Login from '../login/Login';
import { bindActionCreators, Dispatch } from 'redux';
import { showLogin, showCreateAccount, resetWelcome, setKeyboardHeight } from '../../actions/welcome';
import { createAccountBack, createAccountNextForm as nextForm } from '../../actions/login';
import { login, createAccount, deviceLogin } from '../../actions';
import { ApplicationState } from '../../App';

const { width, height } = Dimensions.get('screen');

const isTall = Platform.OS === 'ios' && height / width > 2.15
const isWide = width > 350

interface IProps {
  loginFinal: boolean,
  loginEnabled: boolean,
  loginLoading: boolean,
  keyboardHeight: number,
  createAccountEnabled: boolean,
  createAccountNextForm: boolean,
  createAccountImageLoading: boolean,
  deviceLoginLoading: boolean,
  showSignupMessage: boolean
}

interface IActions {
  showLogin: () => void,
  showCreateAccount: () => void,
  resetWelcome: () => void,
  createAccount: () => void,
  createAccountBack: () => void,
  login: () => void,
  nextForm: () => void,
  setKeyboardHeight: (height: number) => void,
  deviceLogin: () => void
}

class Welcome extends Component<IProps & IActions> {
  
  keyboardListener: EmitterSubscription;

  componentDidMount() {
    const type = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow'
    this.keyboardListener = Keyboard.addListener(type, (e) => {
      if (!this.props.keyboardHeight) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        this.props.setKeyboardHeight(e.endCoordinates.height);
      }
    })
  }
  
  componentWillUnmount() {
    this.keyboardListener.remove();
  }

  render() {
    const showWelcomeHome = !this.props.loginEnabled && !this.props.createAccountEnabled
    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <View style={styles.headerActionContainer}>
            { (this.props.loginEnabled || this.props.createAccountEnabled) &&
              <TouchableOpacity style={styles.headerAction} onPress={() => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
                if (!this.props.createAccountNextForm) {
                  this.props.resetWelcome();
                } else {
                  this.props.createAccountBack();
                }
              }}>
                <Image source={require('../../../assets/icons/bx-chevron-right.png')} />
                <Text style={styles.headerActionText}>קודם</Text>
              </TouchableOpacity>
            }
          </View>
          <View style={styles.headerTextContainer}>
            <Image style={styles.headerImage} source={require('../../../assets/icons/logo.png')} />
          </View>
          <View style={styles.headerActionContainer}>
            { (this.props.loginLoading) &&
              <View style={[styles.headerAction, {justifyContent: 'flex-end'}]}>
                <ActivityIndicator color="#000000" size="small" />
              </View>
            }
            { !this.props.loginLoading && this.props.createAccountEnabled && !this.props.createAccountNextForm &&
              <TouchableOpacity style={[styles.headerAction, {justifyContent: 'flex-end'}]} onPress={() => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                this.props.nextForm();
              }}>
                <Text style={styles.headerActionText}>הבא</Text>
                <Image source={require('../../../assets/icons/bx-chevron-left.png')} />
              </TouchableOpacity>
            }
            { ((!this.props.loginLoading && this.props.loginEnabled) || (this.props.createAccountEnabled && this.props.createAccountNextForm)) && !this.props.createAccountImageLoading && !this.props.loginLoading &&
              <TouchableOpacity style={[styles.headerAction, {justifyContent: 'flex-end'}]} onPress={() => {
                if (this.props.loginEnabled) {
                  this.props.login();
                } else {
                  this.props.createAccount()
                }
              }}>
                <Text style={styles.headerActionText}>סיום</Text>
                <Image source={require('../../../assets/icons/bx-check.png')} />
              </TouchableOpacity>
            }
          </View>
        </View>
        <View style={styles.welcomeContainer}>
          <View style={styles.spacer} />
          { showWelcomeHome &&
            <Image style={styles.iconContainer} resizeMode="contain" source={require('../../../assets/welcome/logo.png')} />
          }
          <View style={styles.spacer} />
          <View style={styles.headerSpacer} />
          {this.props.showSignupMessage ?
            <Text style={styles.welcomeHeader}>צור חשבון או התחבר לחשבון קיים על מנת לשתף תוכן</Text>  
          :
            (!this.props.loginEnabled && !this.props.createAccountEnabled) || (height > 700) ?
            <View style={styles.welcomeTextContainer}>
              <View style={styles.welcomeHeaderContainer}>
                <Text style={styles.welcomeHeader}>ברוכים הבאים ל</Text>
                <Image style={styles.welcomeHeaderIcon} source={require('../../../assets/icons/app-name.png')} />
              </View>
              <Text style={styles.welcomeSubheading}>הרשת החברתית לחיפוש ושיתוף של מקומות נגישים לאנשים בעלי מוגבלויות. הצטרפו לרשת ותרמו לקהילה.</Text>
            </View>
            : <View />
          }
          
          <View style={styles.spacer} />

          { showWelcomeHome &&
            <View style={styles.welcomeActions}>
              <TouchableOpacity style={[styles.welcomeActionContainer, styles.welcomeActionContainerPrimary]} onPress={() => {
                LayoutAnimation.configureNext({
                  duration: 200,
                  update: {
                    type: Platform.OS === 'ios' ?  LayoutAnimation.Types.keyboard : LayoutAnimation.Types.linear
                  }
                });
                this.props.showCreateAccount();
              }}>
                <Text style={[styles.welcomeActionText, styles.welcomeActionTextPrimary]}>צור חשבון</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.welcomeActionContainer} onPress={() => {
                LayoutAnimation.configureNext({
                  duration: 200,
                  update: {
                    type: Platform.OS === 'ios' ?  LayoutAnimation.Types.keyboard : LayoutAnimation.Types.linear
                  }
                });
                this.props.showLogin();
              }}>
                <Text style={styles.welcomeActionText}>כניסה</Text>
              </TouchableOpacity>
              <View style={styles.welcomeSkipLoginContainer}>
              {this.props.deviceLoginLoading ?
                <ActivityIndicator style={styles.welcomeSkipLoginLoader} color="#007AFF" size="small" />
              :
                <TouchableOpacity style={styles.welcomeSkipLogin} onPress={() => {
                  this.props.deviceLogin();
                }}>
                  <Text style={styles.welcomeSkipLoginText}>המשך ללא חשבון</Text>
                </TouchableOpacity>
              }
              </View>
            </View>
          }

          { this.props.createAccountEnabled && <CreateAccount /> }
          { this.props.loginEnabled && <Login /> }
          
          { !this.props.createAccountEnabled &&
            !this.props.loginEnabled &&
              <View style={{flexGrow: 2}} />
          }
          {
            this.props.createAccountEnabled ||
            this.props.loginEnabled &&
            <View style={{ marginTop: Platform.OS === 'android' ? 48 : isTall ? 48 : 24, height: this.props.keyboardHeight || isTall ? 325 : 260 }} />
          }
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'white'
  },
  headerContainer: {
    height: isTall ? 100 : 70,
    backgroundColor: 'white',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 36,
    paddingHorizontal: 36,
  },
  headerActionContainer: {
    width: 80,
  },
  headerAction: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    width: 80,
    paddingVertical: 16,
  },
  headerActionText: {
    paddingTop: 1,
    marginHorizontal: 12,
    opacity: 0.8,
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerImageContainer: {
  },
  headerImage: {
    width: 79.35,
    height: 26.45
  },
  headerIconContainer: {

  },
  welcomeContainer: {
    flex: 1,
    marginHorizontal: isWide ? 48 : 24,
  },
  iconContainer: {
    alignSelf: 'stretch',
    height: undefined,
    width: undefined,
    flexGrow: 10
  },
  headerSpacer: {
    flexGrow: 1
  },
  spacer: {
    flexGrow: 2
  },
  welcomeTextContainer: {
  },
  welcomeHeaderContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignSelf: 'center',
    marginBottom: 6,
  },
  welcomeHeaderIcon: {
    marginStart: 6,
  },
  welcomeHeader: {
    fontFamily: 'System',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  welcomeSubheading: {
    fontFamily: 'System',
    fontSize: 16,
    lineHeight: 18,
    alignSelf: 'center',
    textAlign: 'center',
    width: '90%',
    marginTop: 4
  },
  welcomeActions: {
    width: '85%',
    alignSelf: 'center'
  },
  welcomeActionContainer: {
    backgroundColor: '#E4E7ED',
    borderRadius: 8,
    width: '100%',
    marginBottom: 20,
    shadowColor: '#aaaaaa',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  welcomeActionContainerPrimary: {
    backgroundColor: '#1C6EF2',
    shadowColor: '#1C6EF2',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  welcomeActionText: {
    fontFamily: 'System',
    fontSize: 18,
    fontWeight: 'bold',
    paddingVertical: 14,
    textAlign: 'center'
  },
  welcomeActionTextPrimary: {
    color: 'white'
  },
  welcomeSkipLoginContainer: {
    height: 28,
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  welcomeSkipLoginLoader: {
    alignSelf: 'center',
  },
  welcomeSkipLogin: {
    marginTop: 4,
    alignSelf: 'center'
  },
  welcomeSkipLoginText: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '500',
    color: '#1C6EF2',
  }
})

const mapStateToProps = (state: ApplicationState): IProps => {
  return {
    loginEnabled: state.welcome.loginEnabled,
    createAccountEnabled: state.welcome.createAccountEnabled,
    createAccountNextForm: state.login.form.nextForm,
    createAccountImageLoading: state.login.form.imageLoading,
    loginFinal: state.login.finalPageEnabled,
    loginLoading: state.login.loading,
    deviceLoginLoading: state.login.deviceLoginLoading,
    keyboardHeight: state.welcome.keyboardHeight,
    showSignupMessage: state.welcome.showSignupMessage
  }
}

const mapDispatchToProps = (dispatch: Dispatch): IActions => {
  return bindActionCreators({
    showLogin,
    login,
    createAccount,
    showCreateAccount,
    resetWelcome,
    createAccountBack,
    nextForm,
    setKeyboardHeight,
    deviceLogin
  }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(Welcome)
