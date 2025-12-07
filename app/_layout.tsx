import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { SessionProvider, useSession } from '@/contexts/SessionContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { SplashScreenController } from '../splash';



export const unstable_settings = {
  anchor: '(tabs)',
};

export default function Root() {
  const colorScheme = useColorScheme();

  // Set up the auth context and render your layout inside of it.
  return (
    <SessionProvider>
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>

      <SplashScreenController />
      <RootNavigator />
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
        <Stack.Protected guard={!!session}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack.Protected>
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