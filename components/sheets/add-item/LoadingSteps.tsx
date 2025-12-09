import { ThemedText } from '@/components/themed-text';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import type { AnalyzingStepProps, SubmittingStepProps } from './types';

export const AnalyzingStep = ({ tintColor, selectedImage }: AnalyzingStepProps) => {
  const imageUri = selectedImage?.croppedUri || selectedImage?.localUri || selectedImage?.uri;
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, {
        duration: 1500,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, [pulse]);

  const overlayAnimatedStyle = useAnimatedStyle(() => ({
    opacity: 0.1 + pulse.value * 0.3,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.selectedImageContainer} className="relative">
        <Animated.Image
          source={{ uri: imageUri }}
          style={styles.selectedImage}
          resizeMode="cover"
        />
        <Animated.View style={[StyleSheet.absoluteFill, overlayAnimatedStyle]}>
          <LinearGradient
            colors={['#06b6d4', '#8b5cf6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ flex: 1 }}
          />
        </Animated.View>
      </View>
      <ThemedText style={styles.text}>Analyse du vêtement en cours...</ThemedText>
      <ThemedText style={[styles.subtext, { opacity: 0.6 }]}>
        L&apos;IA analyse votre vêtement pour pré-remplir les informations
      </ThemedText>
    </View>
  );
};

export const SubmittingStep = ({ tintColor }: SubmittingStepProps) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={tintColor} />
      <ThemedText style={styles.text}>Création en cours...</ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  selectedImageContainer: {
    width: '100%',
    maxWidth: 300,
    alignItems: 'center',
    borderRadius: 20,
    overflow: 'hidden',
  },
  selectedImage: {
    width: '100%',
    aspectRatio: 1,
  },
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
