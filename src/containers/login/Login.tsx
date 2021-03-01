import React, { Component } from 'react'
import { View, Text, Image, StyleSheet, TextInput, Button, LayoutAnimation } from 'react-native'
import { connect } from 'react-redux'
import { ApplicationState } from '../../app';
import LineSpacer from '../../components/LineSpacer';
import { bindActionCreators, Dispatch } from 'redux';
import { emailChange, passwordChange } from '../../actions/login';
import { login } from '../../actions';

class Login extends Component<{
  emailChange: (text: string) => void,
  email: string,
  passwordChange: (text: string) => void,
  password: string,
  login: () => Promise<any>,
  loginError?: string
}> {

  username: any;
  passwordInput: any;

  render() {
    return (
      <View style={styles.container}>
        <View>
          <View style={styles.loginFieldContainer}>
          { this.props.loginError ?
            <Text style={styles.loginFieldError}>{this.props.loginError}</Text>
          :
            <View style={styles.loginFieldErrorPlaceholder} />
          }
            <View style={styles.loginFieldHeaderContainer}>
              <Image source={require('../../../assets/icons/profile/bx-envelope.png')} />
              <View style={styles.loginFieldHeaderTextContainer}>
                <Text style={styles.loginFieldHeader}>דוא״ל </Text>
              </View>
            </View>
            <TextInput
              autoFocus
              textContentType="emailAddress"
              keyboardType="email-address"
              returnKeyType="next"
              autoCapitalize="none"
              placeholder="example@example.com"
              value={this.props.email}
              onChangeText={this.props.emailChange}
              onSubmitEditing={() => { this.passwordInput.focus(); }}
              blurOnSubmit={false}
              style={styles.loginFieldText}
            />
          </View>
          <LineSpacer />
          <View style={styles.loginFieldContainer}>
            <View style={styles.loginFieldHeaderContainer}>
              <Image source={require('../../../assets/icons/profile/bx-key.png')} />
              <Text style={styles.loginFieldHeader}>סיסמה</Text>
            </View>
            <TextInput
              textContentType="password"
              returnKeyType="done"
              secureTextEntry
              placeholder="••••••••••"
              value={this.props.password}
              onChangeText={this.props.passwordChange}
              ref={(ref) => { this.passwordInput = ref; }}
              style={styles.loginFieldText}
              onSubmitEditing={() => {
                this.props.login()
                  .then(() => {
                    // LayoutAnimation.configureNext(LayoutAnimation.Presets.spring)
                  });
              }}
            />
          </View>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },
  loginFieldContainer: {

  },
  loginFieldHeaderContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  loginFieldHeaderTextContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  loginFieldHeader: {
    fontFamily: 'System',
    fontSize: 13,
    opacity: 0.75,
    marginStart: 6,
  },
  loginFieldError: {
    fontFamily: 'System',
    fontWeight: 'bold',
    fontSize: 13,
    color: '#f44253',
    marginBottom: 10,
  },
  loginFieldErrorPlaceholder: {
    height: 24
  },
  loginFieldText: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'right',
    padding: 0
  },
})

const mapStateToProps = (state: ApplicationState) => ({
  email: state.login.form.email,
  password: state.login.form.password,
  loginError: state.login.loginError
})

const mapDispatchToProps = (dispatch: Dispatch) => {
  return bindActionCreators({
    emailChange,
    passwordChange,
    login
  }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Login)
