import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { ImagePickerProvider, ImagePickerSheetRenderer } from '@/components/media-gallery';
import { SessionProvider, useSession } from '@/contexts/SessionContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SplashScreenController } from '../splash';

import "../global.css";

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function Root() {
  const colorScheme = useColorScheme();

  // Set up the auth context and render your layout inside of it.
  return (
    <SessionProvider>
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <ImagePickerProvider>

      <SplashScreenController />
      <RootNavigator />
       <ImagePickerSheetRenderer />
        </ImagePickerProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
    </ThemeProvider>


    </SessionProvider>
  );
}

// Create a new component that can access the SessionProvider context later.
function RootNavigator() {
  const { session } = useSession();
  return (
    <>
      <Stack>
        {/* Protected routes */}
        <Stack.Protected guard={!!session}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="item/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="look/[id]" options={{ headerShown: false }} />
        </Stack.Protected>
        {/* Public routes */}
        <Stack.Protected guard={!session}>
          <Stack.Screen name="sign-in" options={{ headerShown: false }}/>
          <Stack.Screen name="register" options={{ headerShown: false }}/>
        </Stack.Protected>
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}