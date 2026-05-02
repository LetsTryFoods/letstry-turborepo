import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { SDUIService } from '../../src/features/home/services/sdui.service';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SDUIRenderer } from '../../src/lib/sdui/SDUIRenderer';

export default function GenericSDUIScreen() {
  const { screenId } = useLocalSearchParams();

  const { data: sduiData, isLoading } = useQuery({
    queryKey: ['sdui', screenId],
    queryFn: () => SDUIService.getScreenConfig(screenId as string),
    enabled: !!screenId,
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0C5273" />
      </View>
    );
  }

  if (!sduiData || !sduiData.components) {
    return (
      <View style={styles.center}>
        <Text>Screen not found.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView>
        <SDUIRenderer components={sduiData.components} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  }
});
