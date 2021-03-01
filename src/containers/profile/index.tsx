import React, { Component } from 'react'
import { View, Text, Image, StyleSheet, TextInput } from 'react-native'
import { connect } from 'react-redux'
import { ApplicationState } from '../../app';
import LineSpacer from '../../components/LineSpacer';

class Review extends Component {

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.profileImageContainer}>
          <Image source={require('../../../assets/icons/profile/profile-01.png')} />
        </View>
        <Text style={styles.profileName}>Brenda Nichols</Text>
        <View style={styles.profileDetailContainer}>
          <View style={styles.profileDetailHeadingContainer}>
            <Image source={require('../../../assets/icons/profile/location.png')} />
            <Text style={styles.profileDetailHeading}>Location</Text>
          </View>
          <TextInput style={styles.profileDetailText}>Tel Aviv</TextInput>
        </View>
        <LineSpacer />
        <View style={styles.profileDetailContainer}>
          <View style={styles.profileDetailHeadingContainer}>
            <Image source={require('../../../assets/icons/profile/bx-envelope.png')} />
            <Text style={styles.profileDetailHeading}>Email</Text>
          </View>
          <TextInput style={styles.profileDetailText}>brenda.nichols@example.com</TextInput>
        </View>
        <LineSpacer />
        <View style={styles.profileDetailContainer}>
          <View style={styles.profileDetailHeadingContainer}>
            <Image source={require('../../../assets/icons/profile/bx-key.png')} />
            <Text style={styles.profileDetailHeading}>Password</Text>
          </View>
          <Text style={styles.profileDetailText}>••••••••••••</Text>
        </View>
        <LineSpacer />
        <View style={styles.profileStatisticsContainer}>
          <View style={styles.profileStatisticContainer}>
            <Text style={styles.profileStatisticHeading}>1,348</Text>
            <Text style={styles.profileStatisticSubheading}>Likes</Text>
          </View>
          <View style={styles.profileStatisticContainer}>
            <Text style={styles.profileStatisticHeading}>62</Text>
            <Text style={styles.profileStatisticSubheading}>Posts</Text>
          </View>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#70798C',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    display: 'flex',
    paddingVertical: 24,
    paddingHorizontal: 24,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  profileName: {
    textAlign: 'center',
    fontFamily: 'System',
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 28,
  },
  profileDetailContainer: {
  },
  profileDetailHeadingContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileDetailHeading: {
    fontFamily: 'System',
    fontSize: 13,
    opacity: 0.75,
    marginStart: 5
  },
  profileDetailText: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '500',
  },
  profileStatisticsContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: "12%",
  },
  profileStatisticContainer: {
    alignItems: 'center'
  },
  profileStatisticHeading: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '500'
  },
  profileStatisticSubheading: {
    fontFamily: 'System',
    fontSize: 13,
    opacity: 0.75
  }
})

const mapStateToProps = (state: ApplicationState) => ({
  
})

const mapDispatchToProps = {
  
}

export default connect(mapStateToProps, mapDispatchToProps)(Review)
