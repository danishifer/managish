import React, { Component } from 'react'
import { View, Text, Image, StyleSheet, TextInput, FlatList, LayoutAnimation, TouchableOpacity, ActivityIndicator, findNodeHandle } from 'react-native'
import ImagePicker from 'react-native-image-crop-picker';
import ActionSheet from 'react-native-actionsheet';
import { connect } from 'react-redux'
import { ApplicationState } from '../../app';
import LineSpacer from '../../components/LineSpacer';
import { Dispatch, bindActionCreators } from 'redux';
import { placeAutosuggest } from '../../actions/places';
import { PlaceType, PlaceSuggestion } from '../../api';
import {
  focusReview,
  toggleService,
  setPlaceSuggestion,
  setPlaceType,
  toggleFeaturesList,
  toggleFeature,
  toggleLocationPicker,
  imageChange,
  imageChangeRequest,
  reviewTextChange,
  submitReview,
  cancelImage,
  showSignupMessage
} from '../../actions/review';

interface IProps {
  isFocused: boolean,
  serviceListOpen: boolean,
  featuresListOpen: boolean,
  locationPickerOpen: boolean,
  featureTypes: { [id: string]: { name: string, icon: string } },
  features: { [id: string]: boolean },
  placeTypes: { [id: string]: { name: string, icon: string } },
  placeType: PlaceType,
  placeSuggestions: PlaceSuggestion[],
  selectedPlaceSuggestion?: PlaceSuggestion,
  imageData?: any,
  imageLoading: boolean,
  reviewText: string,
  submitLoading: boolean,
  deviceLoggedIn: boolean,
  getScrollView: () => any,
}

interface IActions {
  focus: (focus: boolean) => void,
  toggleServiceList: () => void,
  toggleFeaturesList: () => void,
  toggleFeature: (id: string) => void,
  toggleLocationPicker: () => void,
  setPlaceSuggestion: (suggestion: PlaceSuggestion) => void,
  setPlaceType: (id: string, type: { name: string, icon: string }) => void,
  placeAutosuggest: (query: string) => void,
  imageChangeRequest: () => void,
  imageChange: (data: any) => void,
  reviewTextChange: (text: string) => void,
  submitReview: () => Promise<any>,
  cancelImage: () => any,
  showSignupMessage: () => void
}

class Review extends Component<IProps & IActions> {

  reviewForm: View;
  reviewFormHeight?: number;
  inputJustChanged: boolean = false;
  actionSheet: any;

  takeImage() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    this.props.imageChangeRequest();

    // take a photo
    ImagePicker.openCamera({
      width: 550,
      height: 320,
      cropping: true,
      includeBase64: true,
      mediaType: "photo",
      cropperChooseText: "בחר",
      cropperCancelText: "ביטול",
      forceJpg: true,
      compressImageQuality: 0.8,
      compressImageMaxWidth: 550,
      compressImageMaxHeight: 320,
    }).then((res: any) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      this.props.imageChange(res);
    }).catch(err => {
      this.props.cancelImage();
      console.log(err);
    });
  }
  
  chooseImage() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    
    this.props.imageChangeRequest();
    ImagePicker.openPicker({
      width: 550,
      height: 320,
      cropping: true,
      includeBase64: true,
      mediaType: "photo",
      cropperChooseText: "בחר",
      cropperCancelText: "ביטול",
      forceJpg: true,
      compressImageQuality: 0.8,
      compressImageMaxWidth: 550,
      compressImageMaxHeight: 320
    }).then((res: any) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      this.props.imageChange(res);
    }).catch(err => {
      this.props.cancelImage();
      console.log(err);
    });
  }

  render() {
    const placeTypes = Object.entries(this.props.placeTypes).sort((a, b) => a[1].name.localeCompare(b[1].name));
    const featuresList = Object.entries(this.props.featureTypes).sort((a, b) => a[1].name.localeCompare(b[1].name));
    const selectedFeatures = Object.entries(this.props.features).filter(e => e[1]).sort((a, b) => {
      return this.props.featureTypes[a[0]].name.localeCompare(this.props.featureTypes[b[0]].name)
    });
    const placeSuggestions = this.props.placeSuggestions
    const formValid = this.props.selectedPlaceSuggestion && this.props.features && this.props.placeType && this.props.reviewText;
    const { selectedPlaceSuggestion } = this.props;

    return (
      <View style={styles.container}>
        <View style={styles.reviewFieldContainer}>
          {this.props.isFocused ? 
            <View style={[styles.reviewFieldContentContainer, styles.reviewFieldContentContainerFocused]}>
              <TouchableOpacity style={[styles.reviewFieldIconContainer, styles.reviewFieldIconContainerStart]} onPress={() => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                this.inputJustChanged = true;
                this.props.focus(false)
              }}>
                <Image source={require('../../../assets/icons/review/bx-close.png')} />
              </TouchableOpacity>
              <Text style={styles.text}>
                הוספת חוות דעת
              </Text>
              <View style={[styles.reviewFieldIconContainer, styles.reviewFieldIconContainerEnd]}>
              </View>
            </View>
            :
            // <View style={styles.reviewFieldContentContainer}>
              <TouchableOpacity style={styles.reviewFieldButtonContainer} onPress={() => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                if (this.props.deviceLoggedIn) {
                  this.props.showSignupMessage()
                } else {
                  this.inputJustChanged = true;
                  this.props.focus(true);
                }
              }}>
                <Image style={styles.reviewFieldIcon} source={require('../../../assets/icons/bx-edit.png')} />
                <View>
                  <Text style={styles.text}>
                    הוספת חוות דעת...
                  </Text>
                </View>
              </TouchableOpacity>
            // </View>
          }
        </View>

        {this.props.isFocused &&
          <View>
            { (!this.props.serviceListOpen &&
              !this.props.featuresListOpen &&
              !this.props.locationPickerOpen) &&
              <View ref={node => {this.reviewForm = node}} style={styles.reviewServiceInfoContainer}>
                <View style={styles.reviewServiceInfoRow}>
                  <View style={styles.reviewServiceInfoIconContainer}>
                    {this.props.placeType ?
                      <View style={styles.placeTypeIconContainer}>
                        <Image style={styles.placeTypeIcon} source={{ uri: this.props.placeType.type.icon }} />
                      </View>
                      :
                      <Image source={require('../../../assets/icons/search/bx-store.png')} />
                    }
                  </View>
                  <TouchableOpacity style={styles.reviewServiceInfoTextContainer} onPress={() => {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    this.reviewForm.measure((x, y, width, height, pageX, pageY) => {
                      this.reviewFormHeight = height;
                      this.props.toggleServiceList();
                    })
                  }}>
                    <Text style={styles.reviewServiceInfoHeading}>סוג</Text>
                    <Text style={styles.reviewServiceInfoText}>{this.props.placeType ? this.props.placeType.type.name : 'בחר...'}</Text>
                  </TouchableOpacity>
                </View>
                <LineSpacer />
                <View style={styles.reviewServiceInfoRow}>
                  <View style={styles.reviewServiceInfoIconContainer}>
                    <Image source={require('../../../assets/icons/search/bx-directions.png')} />
                  </View>
                  <TouchableOpacity style={styles.reviewServiceInfoTextContainer} onPress={() => {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    this.reviewForm.measure((x, y, width, height, pageX, pageY) => {
                      this.reviewFormHeight = height;
                      this.props.toggleLocationPicker();
                    })
                  }}>
                    <Text style={styles.reviewServiceInfoHeading}>מקום</Text>
                    { selectedPlaceSuggestion ?
                      <View>
                        <Text style={styles.reviewServiceInfoText}>{selectedPlaceSuggestion.title}</Text>
                        {/* <Text style={styles.reviewLocationAddress}>{selectedPlaceSuggestion.vicinity.replace(/\n|\r/g, ", ")}</Text> */}
                      </View>
                      :
                      <Text style={styles.reviewServiceInfoText}>חיפוש...</Text>
                    }
                  </TouchableOpacity>
                </View>
                <LineSpacer />
                <View style={styles.reviewServiceInfoRow}>
                  <View style={styles.reviewServiceInfoIconContainer}>
                    <Image source={require('../../../assets/icons/search/bx-handicap.png')} />
                  </View>
                  <TouchableOpacity style={styles.reviewServiceInfoTextContainer} onPress={() => {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    this.reviewForm.measure((x, y, width, height, pageX, pageY) => {
                      this.reviewFormHeight = height;
                      this.props.toggleFeaturesList();
                    })
                  }}>
                    <Text style={styles.reviewServiceInfoHeading}>התאמות נגישות</Text>
                    <View style={styles.reviewFeatureInfo}>
                      {selectedFeatures.length > 0 ?
                        selectedFeatures.map((e) => (
                          <View style={styles.reviewFeatureInfoItem} key={e[0]}>
                            <View style={styles.reviewFeatureIconContainer}>
                              <Image style={styles.reviewFeatureIcon} source={{ uri: this.props.featureTypes[e[0]].icon }} />
                            </View>
                            <Text style={styles.reviewFeatureName}>{this.props.featureTypes[e[0]].name} </Text>{/* Fix for rtl */}
                          </View>
                        ))
                        :
                        <Text style={styles.reviewServiceInfoText}>בחר...</Text>
                      }
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            }

            {/* Service type list */}
            {this.props.serviceListOpen &&
            <View style={[styles.reviewServiceListContainer, { height: this.reviewFormHeight || 400 }]}>
              <View style={styles.reviewServiceListHeaderRow}>
                <View></View>
                <Text style={styles.reviewServiceListHeader}>סוג</Text>
                <View></View>
              </View>
              <LineSpacer style={{marginVertical: 8}} />
              <FlatList
                nestedScrollEnabled={true}
                ItemSeparatorComponent={() => <LineSpacer style={{marginVertical: 8}} />}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                data={placeTypes}
                keyExtractor={item => item[1].name}
                contentContainerStyle={{paddingBottom: 24}}
                renderItem={({item}) => (
                  <TouchableOpacity style={styles.reviewServiceListItemContentContainer} onPress={() => {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    this.props.setPlaceType(item[0], item[1]);
                    this.props.toggleServiceList();
                  }}>
                    <View style={styles.reviewServiceListContentContainer}>
                      <View style={styles.reviewPlaceTypeContentContainer}>
                        <View style={styles.reviewPlaceTypeIconContainer}>
                          <Image style={styles.reviewPlaceTypeIcon} source={{ uri: item[1].icon }} />
                        </View>
                        <View style={styles.reviewServiceListTextContainer}>
                          <Text style={styles.reviewPlaceType}>{item[1].name}</Text>
                          {/* <Text style={styles.reviewLocationSearchResultSubheader}>{item.location}</Text> */}
                        </View>
                      </View>
                      <View style={styles.reviewServiceChooseContainer}>
                        <Image source={require('../../../assets/icons/review/bx-arrow.png')} />
                      </View>
                    </View>
                  </TouchableOpacity>
                )}
              />
            </View>
            }

            {/* Location picker */}
            {this.props.locationPickerOpen &&
            <View style={[styles.reviewLocationContainer, { height: this.reviewFormHeight || 400 }]}>
              <View style={styles.reviewLocationPickerHeaderRow}>
                <View style={styles.reviewLocationSearchContainer}>
                  <Text style={styles.reviewServiceListHeader}>מקום</Text>
                  <TextInput
                    autoFocus
                    autoCorrect={false}
                    placeholder="חפש..."
                    style={styles.reviewLocationPickerSearch}
                    enablesReturnKeyAutomatically={true}
                    returnKeyType="search"
                    onChangeText={e => {
                      this.props.placeAutosuggest(e);
                    }}
                  />
                </View>
                <View style={styles.reviewServiceListHeaderIconContainer}>
                  <Image source={require('../../../assets/icons/review/bx-search.png')} />
                </View>
                {/* <TextInput style={styles.reviewServiceInfoText}>בחר...</TextInput> */}
              </View>
              <LineSpacer style={{marginVertical: 8}} />
              <FlatList
                nestedScrollEnabled={true}
                keyboardShouldPersistTaps="always"
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                data={placeSuggestions}
                keyExtractor={item => item.id}
                contentContainerStyle={{paddingBottom: 24}}
                renderItem={({item, index}) => (
                  <View>
                    <TouchableOpacity style={styles.reviewLocationSearchResultContentContainer} onPress={() => {
                      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                      this.props.setPlaceSuggestion(item);
                      this.props.toggleLocationPicker();
                    }}>
                      <View style={styles.reviewLocationSearchResultContentContainer}>
                        <View style={styles.reviewLocationSearchResultTextContainer}>
                          <Text style={styles.reviewLocationSearchResultHeader}>{item.title}</Text>
                          <Text style={styles.reviewLocationSearchResultSubheader}>{item.vicinity.replace(/\n|\r/g, ", ")}</Text>
                        </View>
                        <View style={styles.reviewLocationSearchResultChooseContainer}>
                          <Image source={require('../../../assets/icons/review/bx-arrow.png')} />
                        </View>
                      </View>
                    </TouchableOpacity>
                    {index < placeSuggestions.length - 1 &&
                      <LineSpacer style={{marginVertical: 8}} />
                    }
                  </View>
                )}
              />
            </View>
            }
            
            {/* Features type list */}
            {this.props.featuresListOpen &&
            <View style={[styles.reviewLocationContainer, { height: this.reviewFormHeight || 400 }]}>
              <View style={styles.reviewServiceListHeaderRow}>
                <View style={styles.reviewServiceListHeaderIconContainer}></View>
                <Text style={styles.reviewServiceListHeader}>אמצעי נגישות</Text>
                <TouchableOpacity style={styles.reviewServiceListHeaderIconContainer} onPress={() => {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  this.props.toggleFeaturesList();
                }}>
                  <Image source={require('../../../assets/icons/review/bx-check.png')} />
                </TouchableOpacity>
                {/* <TextInput style={styles.reviewServiceInfoText}>בחר...</TextInput> */}
              </View>
              <LineSpacer style={{marginVertical: 8}} />
              <FlatList    
                nestedScrollEnabled={true}
                data={featuresList}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                keyExtractor={item => item[1].name}
                contentContainerStyle={{paddingBottom: 24}}
                renderItem={({item, index}) => (
                  <View>
                    <TouchableOpacity style={styles.reviewLocationSearchResultContentContainer} onPress={() => {
                      // LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                      // this.props.setPlaceType(item[0], item[1]);
                      // this.props.toggleFeaturesList();
                      this.props.toggleFeature(item[0]);
                    }}>
                      <View style={styles.reviewLocationSearchResultContentContainer}>
                        <View style={styles.reviewPlaceTypeContentContainer}>
                          <View style={styles.reviewPlaceTypeIconContainer}>
                            <Image
                              style={[styles.reviewPlaceTypeIcon, { tintColor: this.props.features[item[0]] ? '#007AFF' : '#000' }]}
                              source={{ uri: item[1].icon }}
                            />
                          </View>
                          <View style={styles.reviewLocationSearchResultTextContainer}>
                            <Text style={[
                              styles.reviewLocationSearchResultHeader,
                              this.props.features[item[0]] && styles.reviewFeatureHeaderActive
                            ]}>{item[1].name}</Text>
                          </View>
                        </View>
                        <View style={styles.reviewServiceChooseContainer}>
                          {this.props.features[item[0]] ? 
                            <Image source={require('../../../assets/icons/review/bx-select-active.png')} />
                            :
                            <Image source={require('../../../assets/icons/review/bx-select.png')} />
                          }
                        </View>
                      </View>
                    </TouchableOpacity>
                    {index < featuresList.length - 1 &&
                      <LineSpacer style={{marginVertical: 8}} />
                    }
                  </View>
                )}
              />
            </View>
            }

            <View style={styles.reviewServicePostContainer}>
              {this.props.imageData && !this.props.imageLoading ?
                <TouchableOpacity style={styles.reviewImageContainer} activeOpacity={0.8} onPress={() => this.actionSheet.show()}>
                  <Image source={{ uri: 'data:image/jpeg;base64,' + this.props.imageData.data }} style={styles.reviewImage} />
                </TouchableOpacity>
                :
                <TouchableOpacity style={styles.reviewServicePostImageContainer} activeOpacity={0.8} onPress={() => this.actionSheet.show()}>
                  {this.props.imageLoading ?
                    <ActivityIndicator size="small" color="#fff" />
                  :
                    <View style={styles.reviewServicePostImagePlaceholder}>
                      <Image source={require('../../../assets/icons/review/bx-image.png')} />
                      <Text style={styles.reviewServicePostImagePlaceholderText}>הוספת תמונה</Text>
                    </View>
                  }
                </TouchableOpacity>
              }
              <ActionSheet
                ref={o => this.actionSheet = o}
                title={'בחר תמונה'}
                options={['צלם תמונה', 'בחר מספריית תמונות', 'ביטול']}
                cancelButtonIndex={2}
                onPress={(index) => {
                  if (index === 0) {
                    this.takeImage();
                  } else if (index === 1) {
                    this.chooseImage();
                  } else {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    this.props.cancelImage();
                    console.log('cancel');
                    // cancel
                  }
                }}
              />

              <View style={styles.reviewServicePostWriteContainer}>
                <View style={styles.reviewServicePostWriteIconContainer}>
                  <Image source={require('../../../assets/icons/review/bx-edit.png')} />
                </View>
                <View style={styles.reviewServicePostWriteTextContainer}>
                  <Text style={styles.reviewServicePostWriteHeading}>כתוב חוות דעת</Text>
                  <TextInput
                    multiline
                    maxLength={500}
                    placeholder={"כתוב חוות דעת בעלת משמעות"}
                    onChangeText={(text) => {
                      this.inputJustChanged = false;
                      this.props.reviewTextChange(text);
                      
                    }}
                    onContentSizeChange={(e) => {
                      if (!this.inputJustChanged) {
                        this.props.getScrollView().props.scrollToFocusedInput(findNodeHandle(e.target), 188, 0);
                      }
                    }}
                    value={this.props.reviewText}
                    style={styles.reviewServicePostWriteText}>
                  </TextInput>
                </View>
              </View>
            </View>

            <TouchableOpacity activeOpacity={0.7} disabled={!formValid} style={[styles.reviewSubmitContainer, formValid && styles.reviewSubmitContainerActive]} onPress={() => {
              this.props.submitReview().then(() => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              });
            }}>
              {this.props.submitLoading ?
                <ActivityIndicator style={{ height: 20 }} size="small" color="#fff" />
              :
                <View style={styles.reviewSubmitButtonContainer}>
                  <Text style={[styles.reviewSubmitText, formValid && styles.reviewSubmitTextActive]}>הוסף חוות דעת</Text>
                  <Image style={[styles.reviewSubmitIcon, formValid && styles.reviewSubmitIconActive]} source={require('../../../assets/icons/bx-send.png')} />
                </View>
              }
            </TouchableOpacity>
          </View>
        }
        
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 24,
  },
  reviewFieldContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#70798C',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  reviewSubmitContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#70798C',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    marginTop: 10,
    marginBottom: 24,
    paddingHorizontal: 24,
    paddingVertical: 16,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewSubmitContainerActive: {
    backgroundColor: '#007aff',
    shadowColor: '#007aff',
    shadowOpacity: 0.2,
  },
  reviewSubmitButtonContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 20
  },
  reviewSubmitText: {
    fontFamily: 'System',
    fontWeight: '500',
    fontSize: 16,
    marginEnd: 6,
    paddingBottom: 1,
    color: '#9fa6b5'
  },
  reviewSubmitTextActive: {
    color: 'white'
  },
  reviewSubmitIcon: {
    tintColor: '#9fa6b5'
  },
  reviewSubmitIconActive: {
    tintColor: 'white'
  },
  reviewFieldContentContainerFocused: {
    justifyContent: 'space-between',
    paddingHorizontal: 0,
  },
  reviewFieldContentContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewFieldButtonContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 24,
  },
  reviewFieldIconContainer: {
    width: 72,
    height: 48,
    flex: 1,
    justifyContent: 'center',
  },
  reviewFieldIconContainerStart: {
    paddingStart: 24,
    alignItems: 'flex-start',
  },
  reviewFieldIconContainerEnd: {
    paddingEnd: 24,
    alignItems: 'flex-end',
  },
  reviewFieldIcon: {
    marginEnd: 12,
    justifyContent: 'center'
  },
  reviewImageContainer: {
    borderTopRightRadius: 8,
    borderTopLeftRadius: 8,
    overflow: 'hidden'
  },
  reviewImage: {
    width: '100%',
    height: 150
  },
  text: {
    fontFamily: 'System',
    fontSize: 16,
    marginTop: 2,
    paddingVertical: 16,
    color: '#4C4C4C'
  },
  reviewServiceInfoContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#70798C',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    display: 'flex',
    paddingVertical: 18,
    paddingHorizontal: 24,
    marginTop: 16,
    flex: 1
  },
  reviewServiceListInfoRow: {
    height: 24,
    display: 'flex',
    flexDirection: 'row'
  },
  reviewServiceInfoRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  reviewServiceInfoIconContainer: {
    width: 36,
    height: '100%',
    paddingTop: 9,
  },
  placeTypeIconContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: 16
  },
  placeTypeIcon: {
    resizeMode: 'contain',
    width: "100%",
    height: 16,
  },
  reviewServiceInfoTextContainer: {
    flex: 1,
    width: '100%'
  },
  reviewServiceInfoHeading: {
    fontFamily: 'System',
    fontSize: 13,
    opacity: 0.75
  },
  reviewServiceInfoText: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: -0.3,
    color: 'black',
  },
  reviewLocationSearchContainer: {
    flexGrow: 1
  },
  reviewLocationPickerSearch: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: -0.3,
    color: 'black',
    writingDirection: 'rtl',
    padding: 0,
  },
  reviewLocationAddress: {
    fontFamily: 'System',
    fontSize: 14,
    letterSpacing: -0.3,
    opacity: 0.8,
    width: '90%'
  },
  reviewFeatureInfo: {

  },
  reviewFeatureInfoItem: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 1,
  },
  reviewFeatureIconContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    width: 13,
    marginEnd: 6
  },
  reviewFeatureIcon: {
    resizeMode: 'contain',
    width: "100%",
    height: 13,
  },
  reviewFeatureName: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: -0.3,
    alignItems: 'center',
  },
  reviewServicePostContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#70798C',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    display: 'flex',
    marginTop: 16
  },
  reviewServicePostImageContainer: {
    height: 150,
    backgroundColor: '#70798C',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  reviewServicePostWriteContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  reviewServicePostWriteIconContainer: {
    width: 36,
    height: '100%',
    paddingTop: 9,
  },
  reviewServicePostImagePlaceholder: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewServicePostImagePlaceholderText: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
    marginStart: 8
  },
  reviewServicePostWriteTextContainer: {
    flex: 1
  },
  reviewServicePostWriteHeading: {
    fontFamily: 'System',
    fontSize: 13,
    opacity: 0.75
  },
  reviewServicePostWriteText: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: -0.3,
    writingDirection: 'rtl'
  },
  reviewLocationContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#70798C',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    display: 'flex',
    paddingHorizontal: 24,
    marginTop: 16,
  },
  reviewServiceListContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#70798C',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    display: 'flex',
    paddingHorizontal: 24,
    marginTop: 16,
  },
  reviewServiceListHeaderRow: {
    marginTop: 8,
    height: 28,
    paddingTop: 2,
    alignItems: 'center',
    justifyContent: 'space-between',
    display: 'flex',
    flexDirection: 'row',
  },
  reviewLocationPickerHeaderRow: {
    marginTop: 8,
    height: 36,
    paddingTop: 2,
    alignItems: 'center',
    justifyContent: 'space-between',
    display: 'flex',
    flexDirection: 'row',
  },
  reviewServiceListHeader: {
    opacity: 0.8
  },
  reviewServiceListHeaderIconContainer: {
    width: 36,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  reviewServiceListContentContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewLocationSearchResultContentContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  reviewServiceListItemContentContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewPlaceTypeContentContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewPlaceTypeIconContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: 16,
    marginEnd: 12
  },
  reviewPlaceTypeIcon: {
    resizeMode: 'contain',
    width: "100%",
    height: 16,
  },
  reviewPlaceType: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: -0.3,
  },
  reviewLocationSearchResultTextContainer: {
    width: '85%'
  },
  reviewServiceListTextContainer: {

  },
  reviewLocationSearchResultHeader: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: -0.3,
  },
  reviewFeatureHeaderActive: {
    color: '#007aff'
  },
  reviewLocationSearchResultSubheader: {
    fontFamily: 'System',
    fontSize: 13,
    opacity: 0.75,
    letterSpacing: -0.3,
  },
  reviewServiceChooseContainer: {
    flex: 1,
    height: 36,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  reviewLocationSearchResultChooseContainer: {
    flex: 1,
    height: 36,
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginStart: 8
  }
})

const mapStateToProps = (state: ApplicationState, ownProps: any): IProps => ({
  isFocused: state.review.isFocused,
  features: state.review.features,
  serviceListOpen: state.review.serviceListOpen,
  featuresListOpen: state.review.featuresListOpen,
  locationPickerOpen: state.review.locationPickerOpen,
  selectedPlaceSuggestion: state.review.selectedPlaceSuggestion,
  imageData: state.review.imageData,
  reviewText: state.review.text,
  imageLoading: state.review.imageLoading,
  submitLoading: state.review.submitLoading,
  placeSuggestions: state.places.suggestions,
  placeType: state.review.placeType,
  featureTypes: state.api.features,
  placeTypes: state.api.placeTypes,
  deviceLoggedIn: state.login.deviceLoggedIn,
  getScrollView: ownProps.getScrollView
})

const mapDispatchToProps = (dispatch: Dispatch): IActions =>{
  return bindActionCreators<IActions, any>({
    focus: focusReview,
    toggleServiceList: toggleService,
    toggleFeaturesList,
    toggleLocationPicker,
    toggleFeature,
    setPlaceSuggestion,
    setPlaceType,
    placeAutosuggest,
    imageChange,
    imageChangeRequest,
    reviewTextChange,
    submitReview,
    cancelImage,
    showSignupMessage
  }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(Review)
