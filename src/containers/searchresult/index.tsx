import React, { Component } from 'react'
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity } from 'react-native'
import LineSpacer from '../../components/LineSpacer';
import { ApplicationState } from '../../App';
import { connect } from 'react-redux';

interface Props {
  userId: string,
  title: string,
  subtitle: string,
  features: { [id: string]: string[] },
  votes: { positive: string[], negative: string[] },
  featureTypes: { [id: string]: { name: string, icon: string } },
  reviews: string[],
  onPress: () => void
}

class SearchResult extends Component<Props> {

  render() {
    return (
      <TouchableOpacity activeOpacity={0.8} onPress={this.props.onPress} style={styles.container}>
        <View style={styles.resultHeaderContainer}>
          <View style={styles.resultHeaderTextContainer}>
            <Text style={styles.resultHeader}>{this.props.title}</Text>
            <Text style={styles.resultSubheader}>{this.props.subtitle}</Text>
          </View>
          <Image style={styles.resultAction} source={require('../../../assets/icons/search/bx-arrow.png')} />
        </View>
        <LineSpacer />
        <View style={styles.resultDetailsContainer}>
          <Text style={styles.resultDetailHeader}>אמצעי נגישות</Text>
          <FlatList data={Object.entries(this.props.features)} keyExtractor={item => item[0]} renderItem={({item}) => (
            item[1].length > 0 &&
            <View style={styles.reviewFeatureInfoItem}>
              <View style={styles.reviewFeatureIconContainer}>
                <Image style={styles.reviewFeatureIcon} source={{ uri: this.props.featureTypes[item[0]].icon }} />
              </View>
              <Text style={styles.reviewFeatureName}>{this.props.featureTypes[item[0]].name} </Text>{/* Fix for rtl */}
            </View>
          )} />
        </View>
        <LineSpacer />
        <View style={styles.resultDetailsContainer}>
          <Text style={styles.resultDetailHeader}>דירוג</Text>
          <View style={styles.resultVotesContainer}>
            <View style={styles.voteContainer}>
              <Text style={styles.voteText}>{this.props.votes.positive.length}</Text>
              <Image style={styles.voteIcon} source={require('../../../assets/icons/bx-like.png')} />
            </View>
          </View>
        </View>

      </TouchableOpacity>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#70798C',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
    display: 'flex',
    paddingVertical: 18,
    paddingHorizontal: 24,
    marginBottom: 18
  },
  resultHeaderContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  resultHeaderTextContainer: {

  },
  resultHeader: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '500'
  },
  resultSubheader: {
    fontFamily: 'System',
    fontSize: 11,
    color: '#283044'
  },
  resultAction: {
    marginEnd: 8
  },
  resultDetailsContainer: {

  },
  resultDetailHeader: {
    fontFamily: 'System',
    fontSize: 13,
    opacity: 0.7
  },
  resultVotesContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2
  },
  resultRatingStarsContainer: {
    display: 'flex',
    flexDirection: 'row'
  },
  resultRatingStar: {
    marginHorizontal: 3
  },
  resultRatingText: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '500',
    marginStart: 10
  },
  voteContainer: {
    // width: 48,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor: 'yellow',
    marginEnd: 16
  },
  voteContainerActive: {
    backgroundColor: '#1C6EF2',
    shadowColor: '#1C6EF2',
    shadowOffset: { width: 0, height: 3},
    shadowRadius: 6,
    shadowOpacity: 0.2,
    borderColor: '#1C6EF2',
  },
  voteIcon: {
    marginStart: 6
  },
  voteText: {
    fontFamily: 'System',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 1,
  },
  voteTextActive: {
    color: 'white'
  },
  reviewFeatureInfoItem: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 1,
    height: 18,
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
})

const mapStateToProps = (state: ApplicationState, ownProps: any): Props => ({
  featureTypes: state.api.features,
  userId: !state.login.deviceLoggedIn && state.login.user.id,
  title: ownProps.title,
  subtitle: ownProps.subtitle,
  features: ownProps.features,
  votes: ownProps.votes,
  reviews: ownProps.reviews,
  onPress: ownProps.onPress
});

export default connect(mapStateToProps)(SearchResult)
