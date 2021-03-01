import React from 'react';
import { StyleSheet } from 'react-native';
import Dash from 'react-native-dash';

export default (props: any) => {
  const styles = StyleSheet.create({
    spacer: {
      flexDirection: 'row',
      width: '100%',
      opacity: 0.25,
      marginVertical: 15
    }
  })

  return (
    <Dash dashGap={4} dashLength={6} dashThickness={1} dashColor="#70798C" style={[styles.spacer, props.style]} />
  )
}

