import { ThemedText } from '@/components/themed-text';
import { Input } from '@/components/ui/input';
import { Animation, Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useSession } from '@/contexts/SessionContext';
import { useBehavior } from '@/hooks/use-behavior';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
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

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: Animation.duration.slow,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 40,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Shake animation for errors
  useEffect(() => {
    if (error) {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
      ]).start();
    }
  }, [error]);

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
  const behaviour = useBehavior();
  const tintColor = useThemeColor({}, 'tint');

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={behaviour}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim },
              ],
            },
          ]}
        >
          {/* Logo & Header */}
          <View style={styles.header}>
            <Text style={styles.logo}>VESTIA</Text>
            <View style={styles.divider} />
            <Text style={styles.subtitle}>Bon retour</Text>
          </View>

          {/* Form */}
          <Animated.View
            style={[
              styles.form,
              {
                transform: [{ translateX: shakeAnim }],
              },
            ]}
          >
            <Input
              label="Email"
              placeholder="votre@email.com"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setError(null);
              }}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              editable={!loading}
              error={error && !password ? error : undefined}
            />

            <View style={styles.passwordWrapper}>
              <Input
                label="Mot de passe"
                placeholder="••••••••"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setError(null);
                }}
                secureTextEntry={!showPassword}
                autoComplete="password"
                editable={!loading}
                error={error && password ? error : undefined}
              />
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={22}
                  color={colors.icon}
                />
              </Pressable>
            </View>

            {error && (
              <Animated.View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={18} color="#DC2626" />
                <Text style={styles.errorText}>{error}</Text>
              </Animated.View>
            )}

            <TouchableOpacity
                  className="flex-row items-center justify-center flex-1 py-3 rounded-xl"
                  style={{ backgroundColor: tintColor, opacity: loading ? 0.6 : 1 }}
                  onPress={handleSignIn}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <>
                      <ThemedText style={{ color: '#fff', marginLeft: 8, fontWeight: '600', fontSize: 16 }}>
                        Se connecter
                      </ThemedText>
                    </>
                  )}
            </TouchableOpacity>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Pas encore de compte ?</Text>
              <Pressable
                onPress={() => router.push('/register')}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.linkText}>S&apos;inscrire</Text>
              </Pressable>
            </View>
          </Animated.View>
        </Animated.View>
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
      paddingHorizontal: Spacing.xl,
      paddingVertical: Spacing['4xl'],
    },
    content: {
      width: '100%',
      maxWidth: 400,
      alignSelf: 'center',
    },
    header: {
      alignItems: 'center',
      marginBottom: Spacing['3xl'],
    },
    logo: {
      fontFamily: Typography.family.display,
      fontSize: Typography.size.hero,
      fontWeight: Typography.weight.black,
      color: colors.text,
      letterSpacing: Typography.letterSpacing.tight,
      marginBottom: Spacing.base,
    },
    divider: {
      width: 60,
      height: 2,
      backgroundColor: colors.tint,
      marginBottom: Spacing.lg,
    },
    subtitle: {
      fontSize: Typography.size.body,
      fontWeight: Typography.weight.regular,
      color: colors.textTertiary,
      letterSpacing: Typography.letterSpacing.wide,
      textTransform: 'uppercase',
    },
    form: {
      gap: Spacing.lg,
    },
    passwordWrapper: {
      position: 'relative',
    },
    eyeButton: {
      position: 'absolute',
      right: Spacing.base,
      top: Spacing.xl + Spacing.sm, // Align with input center (label + padding)
      zIndex: 10,
    },
    errorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
      paddingHorizontal: Spacing.base,
      paddingVertical: Spacing.sm,
      backgroundColor: '#FEE2E2',
      borderRadius: Radius.sm,
      borderWidth: 1,
      borderColor: '#FECACA',
    },
    errorText: {
      flex: 1,
      color: '#DC2626',
      fontSize: Typography.size.caption,
      fontWeight: Typography.weight.medium,
    },
    signInButton: {
      marginTop: Spacing.base,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: Spacing.xs,
      marginTop: Spacing.xl,
    },
    footerText: {
      color: colors.textSecondary,
      fontSize: Typography.size.bodySmall,
      fontWeight: Typography.weight.regular,
    },
    linkText: {
      color: colors.tint,
      fontSize: Typography.size.bodySmall,
      fontWeight: Typography.weight.semibold,
      textDecorationLine: 'underline',
    },
  });
