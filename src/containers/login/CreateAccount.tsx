import React, { Component } from 'react'
import ImagePicker from 'react-native-image-crop-picker';
import ActionSheet from 'react-native-actionsheet';
import { View, Text, Image, StyleSheet, TextInput, LayoutAnimation, TouchableOpacity, ActivityIndicator, } from 'react-native'
import { Dispatch } from 'redux';
import { connect } from 'react-redux'
import { ApplicationState } from '../../app';
import LineSpacer from '../../components/LineSpacer';
import { bindActionCreators } from 'redux';
import { emailChange, passwordChange, nameChange, createAccountNextForm, imageChange, imageChangeRequest } from '../../actions/login';

interface IProps {
  email: string,
  password: string,
  name: string,
  imageData: any,
  imageLoading: boolean,
  nextFormEnabled: boolean
}

interface IActions {
  emailChange: (text: string) => void,
  passwordChange: (text: string) => void,
  nameChange: (text: string) => void,
  nextForm: () => void,
  imageChange: (data: string) => void,
  imageChangeRequest: () => void
}

class CreateAccount extends Component<IProps & IActions> {

  passwordInput: TextInput;
  nameInput: TextInput;
  actionSheet: ActionSheet;
  
  render() {
    return (
      <View style={styles.container}>
        {!this.props.nextFormEnabled ?
          <View>
            <View style={styles.loginFieldContainer}>
              <View style={styles.loginFieldHeaderContainer}>
                <Image source={require('../../../assets/icons/profile/bx-envelope.png')} />
                <Text style={styles.loginFieldHeader}>דוא״ל</Text>
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
                <View style={styles.loginFieldHeaderTextContainer}>
                  <Text style={styles.loginFieldHeader}>סיסמה</Text>
                  {/* <Text style={styles.loginFieldError}>לפחות 8 תווים</Text> */}
                </View>
              </View>
              <TextInput
                textContentType="password"
                returnKeyType="next"
                secureTextEntry
                placeholder="••••••••••"
                value={this.props.password}
                onChangeText={this.props.passwordChange}
                ref={(ref) => { this.passwordInput = ref; }}
                style={styles.loginFieldText}
                onSubmitEditing={() => { this.nameInput.focus(); }}
              />
            </View>
            <LineSpacer />
            <View style={styles.loginFieldContainer}>
              <View style={styles.loginFieldHeaderContainer}>
                <Image source={require('../../../assets/icons/profile/bx-profile.png')} />
                <Text style={styles.loginFieldHeader}>שם מלא</Text>
              </View>
              <TextInput
                textContentType="name"
                returnKeyType="done"
                autoCapitalize="none"
                placeholder="ישראל ישראלי"
                value={this.props.name}
                onChangeText={this.props.nameChange}
                ref={(ref) => { this.nameInput = ref; }}
                onSubmitEditing={() => {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  this.props.nextForm();
                }}
                blurOnSubmit={false}
                style={styles.loginFieldText}
              />
            </View>
          </View>
        :
          <View style={styles.loginProfilePictureContainer}>
            <View style={styles.loginProfilePictureHeaderContainer}>
              <Image style={styles.loginProfilePictureIcon} source={require('../../../assets/icons/bx-profile.png')} />
              <Text style={styles.loginProfilePictureHeader}>תמונת פרופיל</Text>
            </View>
            <ActionSheet
              ref={o => this.actionSheet = o}
              title={'בחר תמונה'}
              options={['צלם תמונה', 'בחר מספריית תמונות', 'ביטול']}
              cancelButtonIndex={2}
              onPress={(index) => {
                if (index === 0) {
                  // take a photo
                  ImagePicker.openCamera({
                    width: 128,
                    height: 128,
                    cropping: true,
                    includeBase64: true,
                    cropperCircleOverlay: true,
                    compressImageMaxWidth: 128,
                    compressImageMaxHeight: 128,
                    mediaType: "photo",
                    cropperChooseText: "בחר",
                    cropperCancelText: "ביטול",
                    useFrontCamera: true,
                    forceJpg: true,
                    compressImageQuality: 0.8,
                  }).then((res: any) => {
                    console.log(res);
                    this.props.imageChange(res)
                  }).catch(err => {
                    console.log(err);
                  });
                } else if (index === 1) {
                  // choose from photo library
                  ImagePicker.openPicker({
                    width: 128,
                    height: 128,
                    cropping: true,
                    includeBase64: true,
                    cropperCircleOverlay: true,
                    compressImageMaxWidth: 128,
                    compressImageMaxHeight: 128,
                    mediaType: "photo",
                    cropperChooseText: "בחר",
                    cropperCancelText: "ביטול",
                    forceJpg: true,
                    compressImageQuality: 0.8
                  }).then((res: any) => {
                    this.props.imageChange(res)
                  }).catch(err => {
                    console.log(err);
                  });
                } else {
                  // cancel
                }
              }}
            />
            { this.props.imageData ?
              <View style={styles.loginProfilePictureImageContainer}>
                <Image source={{ uri: 'data:image/jpeg;base64,' + this.props.imageData.data }} style={{width: 75, height: 75}} />
              </View>
            :
              <TouchableOpacity style={styles.loginProfilePlaceholder} onPress={() => {
                this.props.imageChangeRequest();
                this.actionSheet.show();
                

                // ImagePicker.showImagePicker({
                //   title: "בחר תמונת פרופיל",
                //   storageOptions: {
                //     skipBackup: true,
                //     path: 'images'
                //   }
                // }, (response) => {
                //   if (response.error) {
                //     console.log(response.error);
                //     return;
                //   }

                //   ImageResizer.createResizedImage(response.uri, 128, 128, "JPEG", 80)
                //     .then(resized => {
                //       ImgToBase64.getBase64String(resized.uri).then(string => {
                //         LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                //         this.props.imageChange(string)
                //         console.log(string);
                //       }).catch(err => {
                //         console.log(err);
                //       })
                //     }).catch(err => {
                //       console.log(err);
                //     })
                // })
              }}>
                {this.props.imageLoading ?
                  <ActivityIndicator size="small" color="#fff" />
                  :
                  <View style={styles.loginProfilePlaceholderContent}>
                    <Image source={require('../../../assets/icons/bx-camera.png')} />
                    <Text style={styles.loginProfilePlaceholderText}>בחר</Text>
                  </View>
                }
              </TouchableOpacity>
            }
            
          </View>
        }
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    marginBottom : 325,
    height: '30%',
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
    marginStart: 6
  },
  loginFieldError: {
    fontFamily: 'System',
    fontWeight: 'bold',
    fontSize: 13,
    color: '#f44253',
    marginStart: 6
  },
  loginFieldText: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'right',
    padding: 0
  },
  loginProfilePictureContainer: {
    alignSelf: 'center',
    display: 'flex',
  },
  loginProfilePictureHeaderContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  loginProfilePictureIcon: {
    width: 12,
    height: 12
  },
  loginProfilePictureHeader: {
    fontFamily: 'System',
    fontSize: 13,
    opacity: 0.75,
    marginStart: 4
  },
  loginProfilePlaceholder: {
    width: 75,
    height: 75,
    borderRadius: 75,
    marginTop: 16,
    backgroundColor: '#70798C',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginProfilePlaceholderContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginProfilePlaceholderText: {
    fontFamily: 'System',
    fontSize: 11,
    fontWeight: '500',
    color: 'white',
    marginTop: 4
  },
  loginProfilePictureImageContainer: {
    alignSelf: 'center',
    marginTop: 16,
    width: 75,
    height: 75,
    borderRadius: 75,
    overflow: 'hidden'
  }
})

const mapStateToProps = (state: ApplicationState): IProps => ({
  email: state.login.form.email,
  password: state.login.form.password,
  name: state.login.form.name,
  nextFormEnabled: state.login.form.nextForm,
  imageData: state.login.form.imageData,
  imageLoading: state.login.form.imageLoading
})

const mapDispatchToProps = (dispatch: Dispatch): IActions => {
  return bindActionCreators({
    emailChange,
    passwordChange,
    nameChange,
    nextForm: createAccountNextForm,
    imageChange,
    imageChangeRequest
  }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateAccount)
