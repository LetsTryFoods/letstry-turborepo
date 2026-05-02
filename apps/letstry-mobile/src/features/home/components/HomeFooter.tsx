import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { wp, hp } from '../../../lib/utils/ui-utils';

interface HomeFooterProps {
  mainText?: string;
  brandText?: string;
}

const HomeFooter: React.FC<HomeFooterProps> = ({ 
  mainText = "Tasty, healthy snacks crafted with care. ❤️", 
  brandText = "Let's Try" 
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.mainText}>
        {mainText}
      </Text>
      <View style={styles.line} />
      <Text style={styles.brandText}>{brandText}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: wp('6%'),
    paddingTop: hp('2%'),
    paddingBottom: hp('1%'),
    backgroundColor: '#FFFFFF',
    alignItems: 'flex-start',
  },
  mainText: {
    fontSize: wp('8%'),
    fontWeight: '700',
    color: '#BBBBBB',
    lineHeight: wp('10%'),
    marginBottom: hp('2%'),
  },
  line: {
    width: '100%',
    height: 1,
    backgroundColor: '#DDDDDD',
    marginBottom: hp('2%'),
  },
  brandText: {
    fontSize: wp('6%'),
    fontWeight: '600',
    color: '#CCCCCC',
  },
});

export default HomeFooter;
