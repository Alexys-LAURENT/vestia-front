import { Colors } from '@/constants/theme';
import { useSession } from '@/contexts/SessionContext';
import { useBehavior } from '@/hooks/use-behavior';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';

export default function SignIn() {
  const { signIn } = useSession();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    setError(null);

    const result = await signIn({ email: email.trim(), password });

    setLoading(false);

    if (result.success) {
      router.replace('/');
    } else {
      setError(result.message || 'Email ou mot de passe incorrect');
    }
  };

  const styles = createStyles(colors);

  const behaviour = useBehavior()

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={behaviour}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Vestia</Text>
          <Text style={styles.subtitle}>Connectez-vous à votre compte</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="votre@email.com"
              placeholderTextColor={colors.icon}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Mot de passe</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="••••••••"
                placeholderTextColor={colors.icon}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoComplete="password"
                editable={!loading}
              />
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}>
                <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁️'}</Text>
              </Pressable>
            </View>
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Pressable
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSignIn}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Se connecter</Text>
            )}
          </Pressable>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Pas encore de compte ?</Text>
            <Pressable onPress={() => router.push('/register')}>
              <Text style={styles.linkText}>Créer un compte</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: 24,
    },
    header: {
      alignItems: 'center',
      marginBottom: 40,
    },
    title: {
      fontSize: 42,
      fontWeight: 'bold',
      color: colors.tint,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: colors.icon,
    },
    form: {
      gap: 20,
    },
    inputContainer: {
      gap: 8,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    input: {
      height: 52,
      borderWidth: 1,
      borderColor: colors.icon,
      borderRadius: 12,
      paddingHorizontal: 16,
      fontSize: 16,
      color: colors.text,
      backgroundColor: colors.background,
    },
    passwordContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.icon,
      borderRadius: 12,
      backgroundColor: colors.background,
    },
    passwordInput: {
      flex: 1,
      height: 52,
      paddingHorizontal: 16,
      fontSize: 16,
      color: colors.text,
    },
    eyeButton: {
      paddingHorizontal: 16,
      height: 52,
      justifyContent: 'center',
    },
    eyeText: {
      fontSize: 20,
    },
    errorContainer: {
      backgroundColor: '#fee2e2',
      padding: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#fecaca',
    },
    errorText: {
      color: '#dc2626',
      fontSize: 14,
      textAlign: 'center',
    },
    button: {
      height: 52,
      backgroundColor: colors.tint,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 8,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonText: {
      color: colors.background,
      fontSize: 16,
      fontWeight: '600',
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 4,
      marginTop: 16,
    },
    footerText: {
      color: colors.icon,
      fontSize: 14,
    },
    linkText: {
      color: colors.tint,
      fontSize: 14,
      fontWeight: '600',
    },
  });
