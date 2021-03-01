import React, { Component } from 'react'
import { View, Text, Image, StyleSheet, TextInput, ActivityIndicator, TouchableOpacity, FlatList, LayoutAnimation, Keyboard, findNodeHandle } from 'react-native'
import { connect } from 'react-redux'
import { ApplicationState } from '../../app';
import LineSpacer from '../../components/LineSpacer';
import { Dispatch, bindActionCreators } from 'redux';
import { Profile, Place } from '../../api';
import likeIcon from '../../../assets/icons/bx-like.png';
import likeIconActive from '../../../assets/icons/bx-like-active.png';
import dislikeIcon from '../../../assets/icons/bx-dislike.png';
import dislikeIconActive from '../../../assets/icons/bx-dislike-active.png';
import replyIcon from '../../../assets/icons/bx-reply.png';
import replyIconActive from '../../../assets/icons/bx-reply-active.png';
import { Review } from '../../constants';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { replyTextChange, sendReply, toggleReplyLike, toggleReplies, toggleReviewLike, togglePlaceLike } from '../../actions/service';

interface IProps {
  imagesLoading: boolean,
  images: string[],
  apiPhotos: { [id: string]: string },
  reviewsLoading: boolean,
  placeId?: string,
  places: { [id: string]: Place },
  placeTypes: { [id: string]: { name: string, icon: string }},
  featureTypes: { [id: string]: { name: string, icon: string }},
  reviews: { [id: string]: Review },
  profiles: { [id: string]: Profile },
  userId: string,
  newRepliesText: {[reviewId: string]: string},
  newRepliesLoading: {[reviewId: string]: boolean },
  openReplies: {},
  getScrollView: () => any
}

interface IActions {
  toggleReviewLike: (reviewId: string) => void,
  toggleReplyLike: (reviewId: string, replyId: string) => void,
  toggleReplies: (reviewId: string) => void,
  togglePlaceLike: (positive: boolean) => void,
  replyTextChange: (reviewId: string, text: string) => void,
  sendReply: (reviewId: string) => Promise<any>
}

class Service extends Component<IProps & IActions> {

  inputJustChanged: boolean = false;

  render() {
    const { placeId, places } = this.props;

    const place = placeId && places[placeId];
    let features = [];

    let locationText: string;
    let likedPlace: boolean;
    let dislikedPlace: boolean;

    if (place) {
      const ld = place.location;
      
      likedPlace = place.votes.positive.includes(this.props.userId)
      dislikedPlace = place.votes.negative.includes(this.props.userId)

      if (ld.house) {
        locationText = `${ld.street} ${ld.house}, ${ld.city}`
      } else if (ld.street) {
        locationText = `${ld.street}, ${ld.city}, ${ld.postalCode}`
      } else if (!ld.postalCode) {
        locationText = ld.city;
      } else {
        locationText = `${ld.city}, ${ld.postalCode}`
      }

      features = Object.entries(place.features).map((e) => (
        e[1].length > 0 &&
        <View style={styles.serviceFeatureInfoItem} key={e[0]}>
          <View style={styles.serviceFeatureIconContainer}>
            <Image style={styles.serviceFeatureIcon} source={{ uri: this.props.featureTypes[e[0]].icon }} />
          </View>
          <Text style={styles.serviceFeatureName}>{this.props.featureTypes[e[0]].name} </Text>{/* Fix for rtl */}
        </View>
      ));
    }

    const reviews = place ? place.reviews.map(review => (
      this.props.reviews[review]
    )).filter(e => e).sort((a, b) => a.timestamp > b.timestamp ? -1 : 1) : [];
    
    return (
      <View style={styles.container}>
        <View style={styles.serviceCard}>
          {this.props.imagesLoading ?
            <View style={styles.serviceImagePlaceholderContainer}>
              <ActivityIndicator color="gray" size="small" />
            </View>
            :
            this.props.images.length > 0 &&
            <View style={styles.serviceImageContainer}>
              <Image style={styles.serviceImage} source={{ uri: `data:image/jpeg;base64,${this.props.apiPhotos[this.props.images[0]]}` }} />
            </View>
          }

          {placeId ?
            <View style={styles.serviceContainer}>
              <View style={styles.serviceHeaderContainer}>
                <View style={styles.serviceHeaderTextContainer}>
                  <View style={styles.servicePlaceIconContainer}>
                    <Image style={styles.servicePlaceIcon} source={{ uri: this.props.placeTypes[place.type].icon }} />
                  </View>
                  <Text style={styles.serviceHeaderText}>{place.name}</Text>
                </View>
                <Text style={styles.serviceHeaderSubheader}>{locationText}</Text>
                <LineSpacer />
                <View style={styles.serviceDetailsContainer}>
                  <Text style={styles.serviceDetailHeader}>אמצעי נגישות</Text>
                  <View>
                    {features.length > 0 ? features : <Text style={styles.serviceHeaderText}>אין מידע</Text>}
                  </View>
                </View>
                <LineSpacer />
                <View style={styles.serviceRatingsContainer}>
                  <TouchableOpacity
                    style={[
                      styles.serviceVoteContainer, 
                      dislikedPlace && styles.serviceVoteContainerActive
                    ]}
                    onPress={() => {
                      this.props.togglePlaceLike(false);
                      // this.props.toggleReviewLike(item.id)
                    }}
                  >
                    <Text style={[
                      styles.serviceVoteText,
                      dislikedPlace && styles.serviceVoteTextActive
                    ]}>{place.votes.negative.length}</Text>
                    <Image style={styles.serviceVoteIcon} source={dislikedPlace ? dislikeIconActive : dislikeIcon} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.serviceVoteContainer, 
                      likedPlace && styles.serviceVoteContainerActive
                    ]}
                    onPress={() => {
                      this.props.togglePlaceLike(true);
                    }}
                  >
                    <Text style={[
                      styles.serviceVoteText,
                      likedPlace && styles.serviceVoteTextActive
                    ]}>{place.votes.positive.length}</Text>
                    <Image style={styles.serviceVoteIcon} source={likedPlace ? likeIconActive : likeIcon} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          :
          <View style={styles.servicePlaceholderContainer}>
            <ActivityIndicator size="small" color="black" />
          </View>
        }
        </View>
        {this.props.reviewsLoading ?
          <ActivityIndicator style={styles.serviceReviewsPlaceholder} size="large" color="gray" />
        :
          <FlatList
            style={styles.serviceReviewsContainer}
            data={reviews}
            keyExtractor={e => e.id}
            keyboardShouldPersistTaps="always"
            nestedScrollEnabled={true}
            renderItem={({item}) => {
              const profile = this.props.profiles[item.userId];
              const likedPost = item.votes.positive.includes(this.props.userId);
              const repliesOpen = this.props.openReplies[item.id];
              const repliesData = item.replies
                .sort((a, b) => a.timestamp > b.timestamp ? -1 : 1);
              const replies = repliesOpen ? repliesData : [];

              return (
                <View style={reviewStyles.post}>
                  <View style={reviewStyles.postContainer}>
                    <View style={reviewStyles.postHeaderContainer}>
                      <Text style={reviewStyles.postText}>{item.text}</Text>
                      <View style={reviewStyles.postActionsContainer}>
                        <View style={reviewStyles.postProfileContainer}>
                          <View style={reviewStyles.postProfileImageContainer}>
                            <Image style={reviewStyles.postProfileImage} source={{ uri: profile.picture }} />
                          </View>
                          <View style={reviewStyles.postProfileTextContainer}>
                            <Text style={reviewStyles.postProfileName}>{profile.name}</Text>
                            <View style={reviewStyles.postProfilePictureContainer}>
                              <Text style={reviewStyles.postProfileLocation}>{format(item.timestamp, 'd בMMMM yyyy', { locale: he })}</Text>
                            </View>
                          </View>
                        </View>
                        <View style={{ flexGrow: 1 }} />
                        <View style={reviewStyles.postVotesContainer}>
                          <TouchableOpacity
                            style={[
                              reviewStyles.postVoteContainer,
                              repliesOpen && reviewStyles.postVoteContainerActive
                            ]}
                            onPress={() => {
                              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                              
                              this.props.toggleReplies(item.id)
                              this.inputJustChanged = true;
                            }}
                          >
                            <Text style={[
                              reviewStyles.postVoteText,
                              repliesOpen && reviewStyles.postVoteTextActive
                            ]}>{item.replies.length}</Text>
                            <Image style={reviewStyles.postVoteIcon} source={repliesOpen ? replyIconActive : replyIcon} />
                          </TouchableOpacity>
                          <View style={reviewStyles.postVoteSpacer} />
                          <TouchableOpacity
                            style={[
                              reviewStyles.postVoteContainer, 
                              likedPost && reviewStyles.postVoteContainerActive
                            ]}
                            onPress={() => {
                              this.props.toggleReviewLike(item.id)
                            }}
                          >
                            <Text style={[
                              reviewStyles.postVoteText,
                              likedPost && reviewStyles.postVoteTextActive
                            ]}>{item.votes.positive.length}</Text>
                            <Image style={reviewStyles.postVoteIcon} source={likedPost ? likeIconActive : likeIcon} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </View>

                  {repliesOpen &&
                    <View style={reviewStyles.replyFieldContainer}>
                      <Image source={require('../../../assets/icons/bx-comment.png')} />
                      <TextInput
                        multiline
                        style={reviewStyles.replyText}
                        placeholder={"פרסם תגובה"}
                        placeholderTextColor={"#676767"}
                        value={this.props.newRepliesText[item.id]}
                        onChangeText={text => {
                          this.props.replyTextChange(item.id, text);
                          this.inputJustChanged = false;
                        }}
                        onContentSizeChange={(e) => {
                          if (repliesOpen && !this.inputJustChanged) {
                            this.props.getScrollView().props.scrollToFocusedInput(findNodeHandle(e.target), 123, 0);
                          }
                        }}
                      />
                      {(!!this.props.newRepliesText[item.id] && !!(this.props.newRepliesText[item.id].length > 0)) &&
                        <TouchableOpacity style={[
                          reviewStyles.replyFieldActionContainer,
                          this.props.newRepliesLoading[item.id] && reviewStyles.replyFieldActionContainerActive
                        ]}
                        onPress={() => {
                          this.props.sendReply(item.id).then(() => {
                            this.inputJustChanged = true;
                            Keyboard.dismiss();
                          }
                        )}}>
                          { this.props.newRepliesLoading[item.id] ?
                            <ActivityIndicator color="#fff" size="small" style={reviewStyles.replyFieldActionActivityIndicator} />
                            :
                            <Image source={require('../../../assets/icons/bx-send.png')} />
                          }
                        </TouchableOpacity>
                      }
                    </View>
                  }

                  <FlatList data={replies} keyExtractor={e => e.id} renderItem={(reply) => {
                    const likedReply = reply.item.votes.positive.includes(this.props.userId)
                    return (
                      <View style={reviewStyles.postReplyContainer}>
                        <View style={reviewStyles.postReplyProfilePictureContainer}>
                          <Image style={reviewStyles.postReplyProfilePicture} source={{ uri: this.props.profiles[reply.item.userId].picture }} />
                        </View>
                        <View style={[reviewStyles.postContainer, reviewStyles.postReplyBoxContainer]}>
                          <View style={reviewStyles.postReplyTextContainer}>
                            <Text style={reviewStyles.postReplyText}>{reply.item.text}</Text>
                            <View style={reviewStyles.postReplyProfileContainer}>
                              <Text style={reviewStyles.postReplyProfileName}>{this.props.profiles[reply.item.userId].name}</Text>
                              <Text style={reviewStyles.postReplyTime}>{format(reply.item.timestamp, 'd בMMM yyyy', { locale: he })}</Text>
                            </View>
                          </View>
                          <View style={reviewStyles.postReplyVotesContainer}>
                            <TouchableOpacity style={[
                              reviewStyles.postVoteContainer,
                              likedReply && reviewStyles.postVoteContainerActive
                            ]}
                            onPress={() => {
                              this.props.toggleReplyLike(item.id, reply.item.id);
                            }}>
                              <Text style={[
                                reviewStyles.postVoteText,
                                likedReply && reviewStyles.postVoteTextActive
                              ]}>{reply.item.votes.positive.length}</Text>
                              <Image style={reviewStyles.postVoteIcon} source={likedReply ? likeIconActive: likeIcon} />
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    )
                  }
                } />
                </View>
              );

              // return (
              //   <View style={styles.serviceReviewContainer}>
              //     <Text style={styles.serviceReviewText}>{item.text}</Text>
              //     <View style={styles.serviceReviewActionsContainer}>
              //       <View style={styles.serviceReviewProfilePictureContainer}>
              //         <Image style={styles.serviceReviewProfilePicture} source={{ uri: profile.picture }} />
              //       </View>
              //       <View style={styles.serviceReviewProfileTextContainer}>
              //         <Text style={styles.serviceReviewProfileName}>{profile.name}</Text>
              //         <Text style={styles.serviceReviewProfileLocation}>{format(item.timestamp, 'd בMMM yyyy', { locale: he })}</Text>
              //       </View>
              //       <View style={{ flexGrow: 1 }} />
              //       <View style={styles.serviceReviewVotesContainer}>
              //         <TouchableOpacity
              //           style={[
              //             styles.serviceVoteContainer, 
              //             false && styles.serviceVoteContainerActive
              //           ]}
              //           onPress={() => {
              //             // this.props.toggleReviewLike(item.id)
              //           }}
              //         >
              //           <Text style={[
              //             styles.serviceVoteText,
              //             false && styles.serviceVoteTextActive
              //           ]}>{place.votes.positive.length}</Text>
              //           <Image style={styles.serviceVoteIcon} source={false ? likeIconActive : likeIcon} />
              //         </TouchableOpacity>
              //       </View>
              //     </View>
              //   </View>
              // );
            }}
          />
        }
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24
  },
  serviceCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#70798C',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    display: 'flex',
  },
  serviceContainer: {
    display: 'flex',
    marginVertical: 16
  },
  servicePlaceholderContainer: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center'
  },
  serviceReplyDashVerticalSpacer: {
    height: 20,
    flexDirection: 'column',
    marginStart: 16,
  },
  serviceReplyContainer: {
    flexDirection: 'row',
    position: 'relative',
    flexGrow: 0,
    flexShrink: 0,
  },
  serviceReplyBoxContainer: {
    width: "85%",
    paddingHorizontal: 20,
  },
  serviceReplyDashContainer: {
    display: 'flex',
    flexDirection: 'row',
    width: "15%",
    height: '100%',
  },
  serviceReplyDashVerticalContainer: {
    marginStart: 16,
    height: 100,
    width: 1,
  },
  serviceReplyDashVertical: {
    height: '50%',
    width: 1,
    flexDirection: 'column'
  },
  serviceReplyDashVerticalNext: {
    marginTop: '50%',
    height: '50%',
    width: 1,
    flexDirection: 'column',
  },
  serviceReplyDashHorizontalContainer: {
    flex: 1,
    height: "50%",
    display: 'flex',
    flexDirection: 'row',
  },
  serviceReplyDashHorizontal: {
    flex: 1,
    height: 1,
    flexDirection: 'row',
    alignSelf: 'flex-end',
  },
  serviceImageContainer: {
    width: "100%",
    overflow: "hidden",
    borderTopRightRadius: 8,
    borderTopLeftRadius: 8,
  },
  serviceImagePlaceholderContainer: {
    width: "100%",
    height: 150,
    borderTopRightRadius: 8,
    borderTopLeftRadius: 8,
    backgroundColor: '#1f1f1f',
    alignItems: 'center',
    justifyContent: 'center'
  },
  serviceImage: {
    height: 150,
    width: "100%",
  },
  serviceHeaderContainer: {
    display: 'flex',
    paddingHorizontal: 24,
  },
  serviceHeaderTextContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceHeaderText: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: 'bold',
  },
  serviceHeaderSubheader: {
    fontFamily: 'System',
    fontSize: 11,
    color: '#283044',
    letterSpacing: -0.3
  },
  serviceText: {
    fontFamily: 'System',
    fontSize: 14,
    color: '#283044',
    letterSpacing: -0.3,
    marginVertical: 18,
  },
  serviceActionsContainer: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 16,
  },
  serviceVotesContainer: {
    display: 'flex',
    flexDirection: 'row',
  },
  serviceVoteContainer: {
    width: 36,
    height: 43,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#283044',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 1,
    marginEnd: 6
  },
  serviceVoteContainerActive: {
    backgroundColor: '#1C6EF2',
    shadowColor: '#1C6EF2',
    shadowOffset: { width: 0, height: 3},
    shadowRadius: 6,
    shadowOpacity: 0.2,
    borderColor: '#1C6EF2',
  },
  serviceVoteIcon: {
    marginBottom: 5
  },
  serviceProfileContainer: {
    display: 'flex',
    flexDirection: 'row',
  },
  serviceProfileTextContainer: {
    display: 'flex',
    marginStart: 8
  },
  serviceProfilePictureContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceProfileName: {
    fontFamily: 'System',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: -0.3,
  },
  serviceProfileLocation: {
    fontFamily: 'System',
    fontSize: 12,
    color: '#283044',
    marginStart: 4
  },
  serviceVoteText: {
    marginTop: 3,
    fontFamily: 'System',
    fontSize: 13,
    fontWeight: '500',
  },
  serviceVoteActive: {
    color: '#0800D0'
  },
  serviceVoteSpacer: {
    width: 12
  },
  serviceDetailsContainer: {

  },
  serviceDetailHeader: {
    fontFamily: 'System',
    fontSize: 13,
    opacity: 0.7
  },
  serviceDetail: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: -0.3
  },
  serviceRatingsContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceRatingStarsContainer: {
    display: 'flex',
  },
  serviceRatingStarsContentContainer: {
    display: 'flex',
    flexDirection: 'row'
  },
  serviceRatingIconsContainer: {
    display: 'flex',
    flexDirection: 'row'
  },
  serviceRatingStar: {
    marginEnd: 6
  },
  serviceRatingText: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '500',
    marginStart: 4
  },
  serviceRatingSubheading: {
    fontFamily: 'System',
    fontSize: 12,
    fontWeight: '500',
    opacity: 0.75,
    marginTop: 2
  },
  serviceRatingActionContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 48,
    marginEnd: 8
  },
  serviceReviewsPlaceholder: {
    marginTop: 36
  },
  serviceReviewsContainer: {
    paddingBottom: 64
  },
  serviceReviewContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#70798C',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    display: 'flex',
    paddingHorizontal: 20,
    marginTop: 18
  },
  serviceRatingAction: {
    
  },
  serviceReviewActionsContainer: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 16,
  },
  serviceReviewVotesContainer: {
    display: 'flex',
    flexDirection: 'row',
  },
  serviceReviewVoteContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceReviewProfileContainer: {
    display: 'flex',
    flexDirection: 'row',
  },
  serviceReviewProfilePicture: {
    width: 32,
    height: 32,
  },
  serviceReviewProfileTextContainer: {
    display: 'flex',
    marginStart: 8
  },
  serviceReviewProfilePictureContainer: {
    width: 32,
    height: 32,
    borderRadius: 32,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  serviceReviewProfileName: {
    fontFamily: 'System',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: -0.3,
  },
  serviceReviewProfileLocation: {
    fontFamily: 'System',
    fontSize: 12,
    color: '#283044',
  },
  serviceReviewVoteText: {
    marginEnd: 3,
    fontFamily: 'System',
    fontSize: 13,
    fontWeight: '500',
  },
  serviceReviewVoteActive: {
    color: '#0800D0'
  },
  serviceReviewVoteSpacer: {
    width: 12
  },
  servicePlaceIconContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: 14,
    marginEnd: 5
  },
  servicePlaceIcon: {
    resizeMode: 'contain',
    width: "100%",
    height: 14,
  },
  serviceFeatureInfoItem: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 1,
    height: 18,
  },
  serviceFeatureIconContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    width: 13,
    marginEnd: 6
  },
  serviceFeatureIcon: {
    resizeMode: 'contain',
    width: "100%",
    height: 13,
  },
  serviceFeatureName: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: -0.3,
    alignItems: 'center',
  },
  serviceVoteTextActive: {
    color: 'white'
  },
})

const reviewStyles = StyleSheet.create({
  post: {
    marginTop: 16
  },
  postContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#70798C',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    display: 'flex',
  },
  postImageContainer: {
    width: "100%",
    overflow: "hidden",
    borderTopRightRadius: 8,
    borderTopLeftRadius: 8,
  },
  postImage: {
    height: 150,
    width: "100%",
  },
  postHeaderContainer: {
    display: 'flex',
    paddingHorizontal: 24,
    paddingTop: 12
  },
  postHeaderTextContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  postPlaceIconContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: 16
  },
  postPlaceIcon: {
    resizeMode: 'contain',
    width: "100%",
    height: 16,
  },
  postHeaderText: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: 'bold',
    marginStart: 5
  },
  postHeaderSubheader: {
    alignSelf: 'flex-start',
    direction: 'rtl',
    textAlign: 'right',
    fontFamily: 'System',
    fontSize: 11,
    color: '#283044'
  },
  postText: {
    fontFamily: 'System',
    fontSize: 14,
    color: '#283044',
    letterSpacing: -0.3,
    marginTop: 4,
    marginBottom: 14,
  },
  postActionsContainer: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 16,
  },
  postVotesContainer: {
    display: 'flex',
    flexDirection: 'row',
  },
  postVoteContainer: {
    width: 36,
    height: 43,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#283044',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 1,
  },
  postVoteContainerActive: {
    backgroundColor: '#1C6EF2',
    shadowColor: '#1C6EF2',
    shadowOffset: { width: 0, height: 3},
    shadowRadius: 6,
    shadowOpacity: 0.2,
    borderColor: '#1C6EF2',
  },
  postVoteIcon: {
    marginBottom: 5
  },
  postProfileContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignSelf: 'center'
  },
  postProfileImageContainer: {
    width: 32,
    height: 32,
    overflow: 'hidden',
    borderRadius: 32
  },
  postProfileImage: {
    width: 32,
    height: 32,
    resizeMode: 'cover'
  },
  postProfileTextContainer: {
    display: 'flex',
    marginStart: 8,
    borderRadius: 32
  },
  postProfilePictureContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  postProfileName: {
    alignSelf: 'flex-start',
    direction: 'rtl',
    textAlign: 'right',
    fontFamily: 'System',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: -0.3,
  },
  postProfileLocation: {
    alignSelf: 'flex-start',
    direction: 'rtl',
    textAlign: 'right',
    fontFamily: 'System',
    fontSize: 12,
    color: '#283044',
  },
  postVoteText: {
    fontFamily: 'System',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 4,
  },
  postVoteTextActive: {
    color: 'white'
  },
  postVoteSpacer: {
    width: 6
  },
  replyFieldContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#70798C',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginStart: 16,
    marginTop: 10,
    paddingStart: 12,
    paddingTop: 10,
    paddingBottom: 8,
    paddingEnd:24
  },
  replyFieldActionContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#283044',
    alignItems: 'center',
    justifyContent: 'center',
    marginStart: 8
  },
  replyFieldActionContainerActive: {
    backgroundColor: '#1C6EF2',
    shadowColor: '#1C6EF2',
    shadowOffset: { width: 0, height: 3},
    shadowRadius: 6,
    shadowOpacity: 0.2,
    borderColor: '#1C6EF2',
  },
  replyFieldActionActivityIndicator: {
    transform: [{ scale: 0.75 }]
  },
  replyText: {
    alignSelf: 'center',
    marginStart: 12,
    textAlign: 'right',
    flex: 1,
    paddingBottom: 6 // fix for ios
  },
  postReplyContainer: {
    flexDirection: 'row',
    position: 'relative',
    flexGrow: 0,
    flexShrink: 0,
    marginTop: 10,
  },
  postReplyProfilePictureContainer: {
    width: 32,
    height: 32,
    borderRadius: 32,
    overflow: 'hidden',
    position: 'absolute',
    left: 0,
    zIndex: 1,
    alignSelf: 'center',
  },
  postReplyProfilePicture: {
    width: 32,
    height: 32,
  },
  postReplyBoxContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    marginStart: 16,
  },
  postReplyTextContainer: {
    flex: 1,
    marginStart: 36,
    paddingEnd: 18,
    marginTop: 16,
    marginBottom: 18,
    alignSelf: 'center',
  },
  postReplyText: {
    alignSelf: 'flex-start',
    fontFamily: 'System',
    writingDirection: 'rtl',
    fontSize: 14,
    color: '#283044',
    letterSpacing: -0.3,
  },
  postReplyProfileContainer: {
    display: 'flex',
    marginTop: 4,
  },
  postReplyProfileName: {
    alignSelf: 'flex-start',
    direction: 'rtl',
    textAlign: 'right',
    fontFamily: 'System',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: -0.3,
  },
  postReplyTime: {
    writingDirection: 'rtl',
    fontFamily: 'System',
    fontSize: 12,
    color: '#283044',
    marginTop: 1
  },
  postReplyVotesContainer: {
    display: 'flex',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
    marginEnd: 24,
  },
  postReplyVoteContainer: {
    width: 32,
    height: 32,
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: '#1C6EF2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  postReplyVoteActive: {
    backgroundColor: '#1C6EF2',
    shadowColor: '#1C6EF2',
    shadowOffset: { width: 0, height: 3},
    shadowRadius: 6,
    shadowOpacity: 0.2,
  },
  postReplyVoteText: {
    fontFamily: 'System',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4
  },
})

const mapStateToProps = (state: ApplicationState, ownProps: { resultIndex?: number, getScrollView: () => any }): IProps => ({
  imagesLoading: state.service.imagesLoading,
  images: state.service.images,
  reviewsLoading: state.service.reviewsLoading,
  placeTypes: state.api.placeTypes,
  featureTypes: state.api.features,
  reviews: state.api.reviews,
  profiles: state.api.profiles,
  places: state.api.places,
  placeId: typeof ownProps.resultIndex !== 'undefined' ? state.search.results[ownProps.resultIndex] : undefined,
  userId: !state.login.deviceLoggedIn && state.login.user.id,
  openReplies: state.service.openReplies,
  newRepliesText: state.service.repliesText,
  newRepliesLoading: state.service.repliesLoading,
  apiPhotos: state.api.photos,
  getScrollView: ownProps.getScrollView
})

const mapDispatchToProps = (dispatch: Dispatch): IActions => {
  return bindActionCreators<IActions, any>({
    replyTextChange,
    sendReply,
    toggleReplyLike,
    toggleReplies,
    toggleReviewLike,
    togglePlaceLike
  }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(Service)
