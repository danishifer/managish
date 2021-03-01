import React, { Component } from 'react'
import { View, Text, Image, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, TextInput, LayoutAnimation, findNodeHandle, Clipboard, Keyboard } from 'react-native'
import { connect } from 'react-redux'
import { ApplicationState } from '../../App';
import { Review } from '../../constants';
import { Place, Profile } from '../../api';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import likeIcon from '../../../assets/icons/bx-like.png';
import likeIconActive from '../../../assets/icons/bx-like-active.png';
import replyIcon from '../../../assets/icons/bx-reply.png';
import replyIconActive from '../../../assets/icons/bx-reply-active.png';
import { Dispatch, bindActionCreators } from 'redux';
import { toggleReviewLike, toggleReplies, toggleReplyLike, replyTextChange, sendReply, checkAccount } from '../../actions/feed';

interface IProps {
  posts?: Review[],
  photos: {[id: string]: string},
  places: {[id: string]: Place},
  placeTypes: {[id: string]: { name: string, icon: string }},
  newRepliesText: {[reviewId: string]: string},
  newRepliesLoading: {[reviewId: string]: boolean },
  profiles: {[id: string]: Profile},
  userId?: string,
  openReplies: {},
  loadingMore: boolean,
  getScrollView: () => any,
  getScrollViewOffset: () => number
}

interface IActions {
  toggleReviewLike: (reviewId: string) => void,
  toggleReplyLike: (reviewId: string, replyId: string) => void,
  toggleReplies: (reviewId: string) => void,
  replyTextChange: (reviewId: string, text: string) => void,
  sendReply: (reviewId: string) => Promise<any>,
  checkAccount: () => void
}

class Feed extends Component<IProps & IActions> {
  inputJustChanged: boolean = false;
  keyboardOpen: boolean = false;

  componentDidMount() {
    Keyboard.addListener('keyboardDidShow', () => {
      this.keyboardOpen = true;
    })
    Keyboard.addListener('keyboardDidHide', () => {
      this.keyboardOpen = false;
    })
  }

  render() {
    return (
      <View style={styles.container}>
        <FlatList
          data={this.props.posts}
          keyExtractor={e => e.id}
          extraData={{...this.props.openReplies, ...this.props.newRepliesLoading}}
          keyboardShouldPersistTaps="always"
          renderItem={({item}) => {
            const place = this.props.places[item.placeId]
            const placeIcon = this.props.placeTypes[place.type] && this.props.placeTypes[place.type].icon;
            const profile = this.props.profiles[item.userId];
            const locationData = place.location;
            const likedPost = item.votes.positive.includes(this.props.userId);
            const repliesOpen = !!this.props.openReplies[item.id];
            const repliesData = item.replies
              .sort((a, b) => a.timestamp > b.timestamp ? -1 : 1) // sort by time
              // .sort((a, b) => a.votes.positive.length > b.votes.positive.length ? -1 : 1) // sort by votes count
            const replies = repliesOpen ? repliesData : repliesData.slice(0,1);
            
            let locationText: string;

            if (locationData.house) {
              locationText = `${locationData.street} ${locationData.house}, ${locationData.city}`
            } else if (locationData.street) {
              locationText = `${locationData.street}, ${locationData.city}, ${locationData.postalCode}`
            } else if (!locationData.postalCode) {
              locationText = locationData.city;
            } else if (locationData.city) {
              locationText = `${locationData.city}, ${locationData.postalCode}`
            } else {
              locationText = `${locationData.postalCode}, ${locationData.country}`
            }

            return (
              <View style={styles.post}>
                <View style={styles.postContainer}>
                  {!!item.photo && 
                    <View style={styles.postImageContainer}>
                      <Image style={styles.postImage} source={{ uri: `data:image/jpeg;base64,${this.props.photos[item.photo]}` }} />
                    </View>
                  }
                  <View style={styles.postHeaderContainer}>
                    <View style={styles.postHeaderTextContainer}>
                      <View style={styles.postPlaceIconContainer}>
                        <Image style={styles.postPlaceIcon} source={{ uri: placeIcon }} />
                      </View>
                      <Text style={styles.postHeaderText}>{place.name}</Text>
                    </View>
                    <Text style={styles.postHeaderSubheader}>{locationText}</Text>
                    <Text style={styles.postText}>{item.text}</Text>
                    <View style={styles.postActionsContainer}>
                      <View style={styles.postProfileContainer}>
                        <View style={styles.postProfileImageContainer}>
                          <Image style={styles.postProfileImage} source={{ uri: profile.picture }} />
                        </View>
                        <View style={styles.postProfileTextContainer}>
                          <Text style={styles.postProfileName}>{profile.name}</Text>
                          <View style={styles.postProfilePictureContainer}>
                            <Text style={styles.postProfileLocation}>{format(item.timestamp, 'd בMMMM yyyy', { locale: he })}</Text>
                          </View>
                        </View>
                      </View>
                      <View style={{ flexGrow: 1 }} />
                      <View style={styles.postVotesContainer}>
                        <TouchableOpacity
                          style={[
                            styles.postVoteContainer,
                            repliesOpen && styles.postVoteContainerActive
                          ]}
                          onPress={() => {
                            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                            
                            this.props.toggleReplies(item.id)
                            this.inputJustChanged = true;
                          }}
                        >
                          <Text style={[
                            styles.postVoteText,
                            repliesOpen && styles.postVoteTextActive
                          ]}>{item.replies.length}</Text>
                          <Image style={styles.postVoteIcon} source={repliesOpen ? replyIconActive : replyIcon} />
                        </TouchableOpacity>
                        <View style={styles.postVoteSpacer} />
                        <TouchableOpacity
                          style={[
                            styles.postVoteContainer, 
                            likedPost && styles.postVoteContainerActive
                          ]}
                          onPress={() => {
                            this.props.toggleReviewLike(item.id)
                          }}
                        >
                          <Text style={[
                            styles.postVoteText,
                            likedPost && styles.postVoteTextActive
                          ]}>{item.votes.positive.length}</Text>
                          <Image style={styles.postVoteIcon} source={likedPost ? likeIconActive : likeIcon} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>

                {repliesOpen &&
                  <View style={styles.replyFieldContainer}>
                    <Image source={require('../../../assets/icons/bx-comment.png')} />
                    <TextInput
                      multiline
                      style={styles.replyText}
                      placeholder={"פרסם תגובה"}
                      placeholderTextColor={"#676767"}
                      value={this.props.newRepliesText[item.id]}
                      onFocus={() => {
                        this.props.checkAccount();
                      }}
                      onChangeText={text => {
                        this.inputJustChanged = false;
                        this.props.replyTextChange(item.id, text);
                      }}
                      onContentSizeChange={(e) => {
                        if (repliesOpen && !this.inputJustChanged && this.keyboardOpen) {
                          console.log('scrolling to focused input')
                          this.props.getScrollView().props.scrollToFocusedInput(findNodeHandle(e.target), 123, 0);
                        }
                      }}
                    />
                    {(!!this.props.newRepliesText[item.id] && !!(this.props.newRepliesText[item.id].length > 0)) &&
                      <TouchableOpacity style={[
                        styles.replyFieldActionContainer,
                        this.props.newRepliesLoading[item.id] && styles.replyFieldActionContainerActive
                      ]}
                      onPress={() => {
                        this.props.sendReply(item.id).then(() => {
                          this.inputJustChanged = true;
                          Keyboard.dismiss();
                        }
                      )}}>
                        { this.props.newRepliesLoading[item.id] ?
                          <ActivityIndicator color="#fff" size="small" style={styles.replyFieldActionActivityIndicator} />
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
                    <View style={styles.postReplyContainer}>
                      <View style={styles.postReplyProfilePictureContainer}>
                        <Image style={styles.postReplyProfilePicture} source={{ uri: this.props.profiles[reply.item.userId].picture }} />
                      </View>
                      <View style={[styles.postContainer, styles.postReplyBoxContainer]}>
                        <View style={styles.postReplyTextContainer}>
                          <Text style={styles.postReplyText}>{reply.item.text}</Text>
                          <View style={styles.postReplyProfileContainer}>
                            <Text style={styles.postReplyProfileName}>{this.props.profiles[reply.item.userId].name}</Text>
                            <Text style={styles.postReplyTime}>{format(reply.item.timestamp, 'd בMMM yyyy', { locale: he })}</Text>
                          </View>
                        </View>
                        <View style={styles.postReplyVotesContainer}>
                          <TouchableOpacity style={[
                            styles.postVoteContainer,
                            likedReply && styles.postVoteContainerActive
                          ]}
                          onPress={() => {
                            this.inputJustChanged = false;
                            this.props.toggleReplyLike(item.id, reply.item.id);
                          }}>
                            <Text style={[
                              styles.postVoteText,
                              likedReply && styles.postVoteTextActive
                            ]}>{reply.item.votes.positive.length}</Text>
                            <Image style={styles.postVoteIcon} source={likedReply ? likeIconActive: likeIcon} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  )
                }
              } />
              </View>
            )
          }}
        />
        <View style={{ flex: 0 }}>
          {this.props.loadingMore &&
            <ActivityIndicator size="large" color="#000" />
          }
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 28,
    flexGrow: 1,
  },
  post: {
    marginBottom: 28
  },
  postContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#70798C',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
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
    paddingTop: 12,
    flexShrink: 0,
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
    alignSelf: 'flex-start',
    fontFamily: 'System',
    writingDirection: 'rtl',
    fontSize: 14,
    color: '#283044',
    letterSpacing: -0.3,
    marginTop: 18,
    marginBottom: 6,
    lineHeight: 16,
    flex: 1,
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
    borderRadius: 32,
    elevation: 2
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
    elevation: 2
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

const mapStateToProps = (state: ApplicationState, ownProps: any): IProps => {
  return {
    posts: state.feed.posts,
    openReplies: state.feed.openReplies,
    newRepliesText: state.feed.repliesText,
    newRepliesLoading: state.feed.repliesLoading,
    loadingMore: state.feed.loadingMore,
    photos: state.api.photos,
    places: state.api.places,
    placeTypes: state.api.placeTypes,
    profiles: state.api.profiles,
    userId: !state.login.deviceLoggedIn && state.login.user.id,
    getScrollView: ownProps.getScrollView,
    getScrollViewOffset: ownProps.getScrollViewOffset,
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => {
  return bindActionCreators<IActions, any>({
    toggleReviewLike,
    toggleReplies,
    toggleReplyLike,
    replyTextChange,
    sendReply,
    checkAccount
  }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Feed)