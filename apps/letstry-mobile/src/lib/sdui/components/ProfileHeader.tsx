import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ProfileHeaderProps {
  title?: string;
  textColor?: string;
  fontSize?: number;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  title = 'Profile',
  textColor = '#1A1A1A',
  fontSize = 28,
}) => {
  return (
    <View style={styles.header}>
      <Text style={[styles.title, { color: textColor, fontSize }]}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  title: {
    fontWeight: '800',
    letterSpacing: -0.5,
  },
});

export default ProfileHeader;
