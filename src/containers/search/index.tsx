import React, { Component } from 'react'
import { View, Text, Image, StyleSheet, TextInput, TouchableOpacity, LayoutAnimation, FlatList, ActivityIndicator, ScrollView, Platform } from 'react-native'
import { connect } from 'react-redux'
import { ApplicationState } from '../../app';
import LineSpacer from '../../components/LineSpacer';
import { Dispatch, bindActionCreators } from 'redux';
import { toggleFilters, search, queryChange, togglePlaceTypes, setPlaceType, toggleFeatureTypes, toggleFeature, chooseResult } from '../../actions/search';
import { fetchFirstPlaceReviews } from '../../actions/service';
import SearchResult from '../searchresult';
import { Place } from '../../api';

interface IProps {
  filtersOpen: boolean,
  query: string,
  results?: string[],
  loading: boolean,
  placeTypes: { [id: string]: { name: string, icon: string } },
  featureTypes: { [id: string]: { name: string, icon: string} },
  featureTypesOpen: boolean,
  features: { [id: string]: boolean },
  placeTypesOpen: boolean,
  placeType: string,
  places: { [id: string]: Place },
  rootScrollView: () => ScrollView
}

interface IActions {
  queryChange: (text: string) => void,
  search: () => Promise<any>,
  toggleFilters: () => void,
  togglePlaceTypes: () => void,
  toggleFeatureTypes: () => void,
  toggleFeature: (featureId: string) => void,
  setPlaceType: (placeType: string) => void,
  chooseResult: (resultIndex: number) => void,
  fetchFirstPlaceReviews: () => Promise<any>
}

class Search extends Component<IProps & IActions> {

  render() {
    const formValid = this.props.query.length > 0;
    const placeTypes = Object.entries(this.props.placeTypes).sort((a, b) => a[1].name.localeCompare(b[1].name));
    const featuresList = Object.entries(this.props.featureTypes).sort((a, b) => a[1].name.localeCompare(b[1].name));
    const selectedFeatures = Object.entries(this.props.features).filter(e => e[1]).sort((a, b) => {
      return this.props.featureTypes[a[0]].name.localeCompare(this.props.featureTypes[b[0]].name)
    });

    return (
      <View style={styles.container}>
        <View style={styles.searchFieldContainer}>
          <Image source={require('../../../assets/icons/search/location.png')} />
          <TextInput
            style={styles.text}
            placeholder={"חפש מקום..."}
            placeholderTextColor={"#555555"}
            autoCorrect={false}
            enablesReturnKeyAutomatically
            returnKeyType="search"
            value={this.props.query}
            onChangeText={text => this.props.queryChange(text)}
            onSubmitEditing={() => {
              this.props.search().then(() => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              })
            }}
          />
          <TouchableOpacity onPress={() => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            this.props.toggleFilters();
          }}>
            <Image style={{opacity: this.props.filtersOpen ? 1 : 0.25 }} source={require('../../../assets/icons/search/bx-filter.png')} />
          </TouchableOpacity>
        </View>

        {this.props.placeTypesOpen &&
        <View style={styles.typeListContainer}>
          <View style={styles.searchHeaderRow}>
            <TouchableOpacity style={styles.searchHeaderIconContainer} onPress={() => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              this.props.togglePlaceTypes();
            }}>
              <Image source={require('../../../assets/icons/bx-back.png')} />
            </TouchableOpacity>
            <Text style={styles.searchHeader}>סוג</Text>
            <View style={styles.searchHeaderIconContainer}></View>
          </View>
          <LineSpacer style={{marginVertical: 8}} />
          <FlatList
            ItemSeparatorComponent={() => <LineSpacer style={{marginVertical: 8}} />}
            showsVerticalScrollIndicator={false}
            data={placeTypes}
            keyExtractor={item => item[1].name}
            contentContainerStyle={{paddingBottom: 24}}
            keyboardShouldPersistTaps="always"
            renderItem={({item}) => (
              <TouchableOpacity style={styles.typeListItemContentContainer} onPress={() => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                this.props.setPlaceType(item[0]);
                this.props.togglePlaceTypes();
              }}>
                <View style={styles.typeListContentContainer}>
                  <View style={styles.typeContentContainer}>
                    <View style={styles.typeIconContainer}>
                      <Image style={styles.typeIcon} source={{ uri: item[1].icon }} />
                    </View>
                    <View style={styles.typeListTextContainer}>
                      <Text style={styles.type}>{item[1].name}</Text>
                      {/* <Text style={styles.reviewLocationSearchResultSubheader}>{item.location}</Text> */}
                    </View>
                  </View>
                  <View style={styles.typeChooseContainer}>
                    <Image source={require('../../../assets/icons/review/bx-arrow.png')} />
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
        }

        {this.props.featureTypesOpen &&
          <View style={styles.searchFeaturesContainer}>
            <View style={styles.searchHeaderRow}>
            <View style={styles.searchHeaderIconContainer}>
            </View>
            <Text style={styles.searchHeader}>התאמות נגישות</Text>
            <TouchableOpacity style={styles.searchHeaderIconContainerEnd} onPress={() => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              this.props.toggleFeatureTypes();
            }}>
              <Image source={require('../../../assets/icons/review/bx-check.png')} />
            </TouchableOpacity>
          </View>
            <LineSpacer style={{marginVertical: 8}} />
            <FlatList
              showsVerticalScrollIndicator={false}
              data={featuresList}
              keyExtractor={item => item[1].name}
              contentContainerStyle={{paddingBottom: 24}}
              renderItem={({item, index}) => (
                <View>
                  <TouchableOpacity style={styles.searchFeatureContainer} onPress={() => {
                    this.props.toggleFeature(item[0]);
                  }}>
                    <View style={styles.searchFeatureContentContainer}>
                      <View style={styles.searchFeatureHeaderContainer}>
                        <View style={styles.searchFeatureIconContainer}>
                          <Image
                            style={[styles.searchFeatureIcon, { tintColor: this.props.features[item[0]] ? '#007AFF' : '#000' }]}
                            source={{ uri: item[1].icon }}
                          />
                        </View>
                        <View style={styles.searchFeatureTextContainer}>
                          <Text style={[
                            styles.searchFeatureHeader,
                            this.props.features[item[0]] && styles.searchFeatureHeaderActive
                          ]}>{item[1].name}</Text>
                        </View>
                      </View>
                      <View style={styles.searchFeatureChooseContainer}>
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

        {/* Filters */}
        {this.props.filtersOpen && !this.props.placeTypesOpen && !this.props.featureTypesOpen &&
          <View style={styles.filtersContainer}>
            <View style={styles.filterContainer}>
              <View style={styles.filterIconContainer}>
                {this.props.placeType ?
                  <View style={styles.placeTypeIconContainer}>
                    <Image style={styles.placeTypeIcon} source={{ uri: this.props.placeTypes[this.props.placeType].icon }} />
                  </View>
                  :
                  <Image source={require('../../../assets/icons/search/bx-store.png')} />
                }
              </View>
              <TouchableOpacity style={styles.filterContentContainer} onPress={() => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                this.props.togglePlaceTypes();
              }}>
                <Text style={styles.filterHeader}>סוג</Text>
                <Text style={styles.filterContent}>
                  {this.props.placeType ? 
                    this.props.placeTypes[this.props.placeType].name              
                  :
                    'בחר...'
                  }
                </Text>
              </TouchableOpacity>
            </View>
            <LineSpacer />
            {/* <View style={styles.filterContainer}>
              <View style={styles.filterIconContainer}>
                <Image source={require('../../../assets/icons/search/bx-directions.png')} />
              </View>
              <TouchableOpacity style={styles.filterContentContainer}>
                <Text style={styles.filterHeader}>מקום</Text>
                <Text style={styles.filterContent}>Tel Aviv</Text>
              </TouchableOpacity>
            </View>
            <LineSpacer /> */}
            <View style={styles.filterContainer}>
              <View style={styles.filterIconContainer}>
                <Image source={require('../../../assets/icons/search/bx-handicap.png')} />
              </View>
              <TouchableOpacity style={styles.filterContentContainer} onPress={() => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                this.props.toggleFeatureTypes()
              }}>
                <Text style={styles.filterHeader}>אמצעי נגישות</Text>
                <View>
                  {selectedFeatures.length > 0 ?
                    selectedFeatures.map((e) => (
                      <View style={styles.featureInfoItem} key={e[0]}>
                        <View style={styles.featureIconContainer}>
                          <Image style={styles.featureIcon} source={{ uri: this.props.featureTypes[e[0]].icon }} />
                        </View>
                        <Text style={styles.featureName}>{this.props.featureTypes[e[0]].name} </Text>{/* Fix for rtl */}
                      </View>
                    ))
                    :
                    <Text style={styles.filterContent}>בחר...</Text>
                  }
                </View>
              </TouchableOpacity>
            </View>
          </View>
        }

        {this.props.filtersOpen &&
          <TouchableOpacity activeOpacity={0.7} disabled={!formValid} style={[
            styles.searchSubmitContainer,
            formValid && styles.searchSubmitContainerActive
          ]} onPress={() => {
            this.props.search().then(() => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            });
          }}>
            {this.props.loading ?
              <ActivityIndicator style={{ height: 20 }} size="small" color="#fff" />
              :
              <View style={styles.searchSubmitButtonContainer}>
                <Text style={[styles.searchSubmitText, formValid && styles.searchSubmitTextActive]}>חפש </Text>
                <Image style={[styles.searchSubmitIcon, formValid && styles.searchSubmitIconActive]} source={require('../../../assets/icons/search/bx-search.png')} />
              </View>
            }
          </TouchableOpacity>
        }

        {/* Results */}
        {this.props.loading ?
          !this.props.filtersOpen &&
          <ActivityIndicator style={{marginTop: 36}} size="large" />
        :
          <FlatList
            showsVerticalScrollIndicator={false}
            data={this.props.results}
            keyExtractor={item => item}
            contentContainerStyle={{paddingBottom: 24}}
            style={styles.resultsContainer}
            renderItem={({item, index}) => {
              const place = this.props.places[item]
              const ld = place.location;
              let locationText: string;

              if (ld.house) {
                locationText = `${ld.street} ${ld.house}, ${ld.city}`
              } else if (ld.street) {
                locationText = `${ld.street}, ${ld.city}, ${ld.postalCode}`
              } else if (!ld.postalCode) {
                locationText = ld.city;
              } else {
                locationText = `${ld.city}, ${ld.postalCode}`
              }

              return (
                <SearchResult
                  title={place.name}
                  subtitle={locationText}
                  features={place.features}
                  votes={place.votes}
                  reviews={place.reviews}
                  onPress={() => {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    this.props.chooseResult(index);
                    this.props.fetchFirstPlaceReviews()
                      .then(() => {
                        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
                      });
                      if (Platform.OS === 'android') {
                        this.props.rootScrollView().scrollTo({ x: 0, y: 0 });
                      } else {
                        this.props.rootScrollView().scrollToEnd({ animated: true })
                      }
                  }}
                />
              )
            }}
          />
        }
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    
  },
  text: {
    fontFamily: 'System',
    fontSize: 16,
    marginTop: 2,
    marginStart: 12,
    flex: 1,
    textAlign: 'right',
    padding: 0,
  },
  searchFieldContainer: {
    marginTop: 24,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#70798C',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  filtersContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#70798C',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    display: 'flex',
    paddingVertical: 18,
    paddingHorizontal: 24,
    marginTop: 16
  },
  filterContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },
  filterContentContainer: {
    flex: 1,
  },
  filterIconContainer: {
    width: 45,
    paddingStart: 4
  },
  filterHeader: {
    fontFamily: 'System',
    fontSize: 13,
    opacity: 0.7,
  },
  filterContent: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: -0.3
  },
  searchSubmitContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#70798C',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    marginTop: 10,
    paddingHorizontal: 24,
    paddingVertical: 16,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchSubmitContainerActive: {
    backgroundColor: '#007aff',
    shadowColor: '#007aff',
    shadowOpacity: 0.2,
  },
  searchSubmitButtonContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 20,
  },
  searchSubmitIcon: {
    tintColor: '#9fa6b5'
  },
  searchSubmitIconActive: {
    tintColor: 'white'
  },
  searchSubmitText: {
    fontFamily: 'System',
    fontWeight: '500',
    fontSize: 16,
    marginEnd: 6,
    paddingBottom: 1,
    color: '#9fa6b5'
  },
  searchSubmitTextActive: {
    color: 'white'
  },
  typeListContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#70798C',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    display: 'flex',
    paddingHorizontal: 24,
    marginTop: 16,
    height: 260
  },
  searchHeaderRow: {
    marginTop: 8,
    height: 28,
    paddingTop: 2,
    alignItems: 'center',
    justifyContent: 'space-between',
    display: 'flex',
    flexDirection: 'row',
  },
  searchHeader: {
    opacity: 0.8
  },
  searchHeaderIconContainer: {
    width: 36,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  searchHeaderIconContainerEnd: {
    width: 36,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  typeListContentContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeListItemContentContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeContentContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeIconContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: 16,
    marginEnd: 12
  },
  typeIcon: {
    resizeMode: 'contain',
    width: "100%",
    height: 16,
  },
  type: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: -0.3,
  },
  typeListTextContainer: {

  },
  typeChooseContainer: {
    flex: 1,
    height: 36,
    alignItems: 'flex-end',
    justifyContent: 'center',
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
  resultsContainer: {
    marginTop: 16
  },
  searchFeaturesContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#70798C',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    display: 'flex',
    paddingHorizontal: 24,
    marginTop: 16,
    height: 260
  },
  searchFeatureContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  searchFeatureContentContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchFeatureHeaderContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchFeatureIconContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: 16,
    marginEnd: 12
  },
  searchFeatureIcon: {
    resizeMode: 'contain',
    width: "100%",
    height: 16,
  },
  searchFeatureTextContainer: {

  },
  searchFeatureHeader: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: -0.3,
  },
  searchFeatureHeaderActive: {
    color: '#007aff'
  },
  searchFeatureChooseContainer: {
    flex: 1,
    height: 36,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  featureInfoItem: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 1,
    height: 18,
  },
  featureIconContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    width: 13,
    marginEnd: 6
  },
  featureIcon: {
    resizeMode: 'contain',
    width: "100%",
    height: 13,
  },
  featureName: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: -0.3,
    alignItems: 'center',
  }
})

const mapStateToProps = (state: ApplicationState, ownProps: any): IProps => ({
  filtersOpen: state.search.filtersOpen,
  loading: state.search.loading,
  query: state.search.query,
  results: state.search.results,
  placeTypesOpen: state.search.placeTypeOpen,
  placeTypes: state.api.placeTypes,
  placeType: state.search.placeType,
  featureTypes: state.api.features,
  featureTypesOpen: state.search.featureTypesOpen,
  features: state.search.features,
  places: state.api.places,
  rootScrollView: ownProps.rootScrollView
})

const mapDispatchToProps = (dispatch: Dispatch): IActions => {
  return bindActionCreators<IActions, any>({
    toggleFilters,
    queryChange,
    search,
    togglePlaceTypes,
    setPlaceType,
    toggleFeatureTypes,
    toggleFeature,
    chooseResult,
    fetchFirstPlaceReviews
  }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(Search)
