import { ThemedText } from '@/components/themed-text';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import type { AnalyzingStepProps } from './types';

export const AnalyzingStep = ({ tintColor }: AnalyzingStepProps) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={tintColor} />
      <ThemedText style={styles.text}>Analyse du vêtement en cours...</ThemedText>
      <ThemedText style={[styles.subtext, { opacity: 0.6 }]}>
        L&apos;IA analyse votre vêtement pour pré-remplir les informations
      </ThemedText>
    </View>
  );
};

export const SubmittingStep = ({ tintColor }: AnalyzingStepProps) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={tintColor} />
      <ThemedText style={styles.text}>Création en cours...</ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  subtext: {
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
  },
});
