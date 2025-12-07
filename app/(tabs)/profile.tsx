import { ThemedText } from '@/components/themed-text';
import { useSession } from '@/contexts/SessionContext';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

const ProfileScreen = () => {
    const { signOut } = useSession();
  return (
    <SafeAreaView>
      <ThemedText>
        Profile page under construction...
      </ThemedText>
       <ThemedText
       onPress={signOut}
       >
        Déconnexion
      </ThemedText>
    </SafeAreaView>
  );
};

export default ProfileScreen;