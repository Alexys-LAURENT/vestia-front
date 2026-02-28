import { ThemedText } from '@/components/themed-text';
import { Input } from '@/components/ui/input';
import { PASSWORD_REGEX } from '@/constants/auth';
import { Animation, Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useSession } from '@/contexts/SessionContext';
import { useBehavior } from '@/hooks/use-behavior';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { api, FetchApiError } from '@/utils/fetchApi';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
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

export default function Register() {
  const { register, signIn } = useSession();
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[theme];

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    birthDate: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Validation en temps réel
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [usernameError, setUsernameError] = useState<string | null>(null);

  // Ref pour le debounce
  const usernameDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  // Formater la date au format DD/MM/YYYY avec ajout automatique des "/"
  const handleBirthDateChange = (value: string) => {
    // Supprimer tout ce qui n'est pas un chiffre
    const numbers = value.replace(/\D/g, '');
    
    let formatted = '';
    if (numbers.length > 0) {
      // Jour (2 chiffres max)
      formatted = numbers.slice(0, 2);
      if (numbers.length > 2) {
        // Mois (2 chiffres max)
        formatted += '/' + numbers.slice(2, 4);
        if (numbers.length > 4) {
          // Année (4 chiffres max)
          formatted += '/' + numbers.slice(4, 8);
        }
      }
    }
    
    updateField('birthDate', formatted);
  };

  // Convertir DD/MM/YYYY vers YYYY-MM-DD pour l'API
  const formatBirthDateForApi = (displayDate: string): string => {
    const parts = displayDate.split('/');
    if (parts.length === 3 && parts[0].length === 2 && parts[1].length === 2 && parts[2].length === 4) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return '';
  };

  // Valider le format de date DD/MM/YYYY
  const isValidBirthDate = (date: string): boolean => {
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(date)) return false;
    
    const [day, month, year] = date.split('/').map(Number);
    const dateObj = new Date(year, month - 1, day);
    
    return (
      dateObj.getFullYear() === year &&
      dateObj.getMonth() === month - 1 &&
      dateObj.getDate() === day &&
      year >= 1900 &&
      year <= new Date().getFullYear()
    );
  };

  // Validation du mot de passe en temps réel
  const handlePasswordChange = (value: string) => {
    updateField('password', value);

    if (value.length === 0) {
      setPasswordError(null);
    } else if (value.length < 6) {
      setPasswordError('Minimum 6 caractères');
    } else if (!/[A-Z]/.test(value)) {
      setPasswordError('Au moins une majuscule requise');
    } else if (!/\d/.test(value)) {
      setPasswordError('Au moins un chiffre requis');
    } else {
      setPasswordError(null);
    }

    // Vérifier aussi la confirmation si elle est remplie
    if (formData.confirmPassword && value !== formData.confirmPassword) {
      setConfirmPasswordError('Les mots de passe ne correspondent pas');
    } else {
      setConfirmPasswordError(null);
    }
  };

  // Validation de la confirmation du mot de passe
  const handleConfirmPasswordChange = (value: string) => {
    updateField('confirmPassword', value);

    if (value.length > 0 && value !== formData.password) {
      setConfirmPasswordError('Les mots de passe ne correspondent pas');
    } else {
      setConfirmPasswordError(null);
    }
  };

  // Vérification du username avec debounce
  const checkUsernameAvailability = useCallback(async (username: string) => {
    if (username.length < 3) {
      setUsernameStatus('idle');
      setUsernameError(username.length > 0 ? 'Minimum 3 caractères' : null);
      return;
    }

    setUsernameStatus('checking');
    setUsernameError(null);

    try {
      await api.post('/auth/check-username', { username }, { requireAuth: false });
      setUsernameStatus('available');
      setUsernameError(null);
    } catch (err) {
      if (err instanceof FetchApiError) {
        setUsernameStatus('taken');
        setUsernameError("Ce nom d'utilisateur est déjà pris");
      } else {
        setUsernameStatus('idle');
        setUsernameError('Erreur de vérification');
      }
    }
  }, []);

  const handleUsernameChange = (value: string) => {
    const cleanValue = value.toLowerCase().replace(/\s/g, '');
    updateField('username', cleanValue);

    // Annuler le debounce précédent
    if (usernameDebounceRef.current) {
      clearTimeout(usernameDebounceRef.current);
    }

    if (cleanValue.length === 0) {
      setUsernameStatus('idle');
      setUsernameError(null);
      return;
    }

    if (cleanValue.length < 3) {
      setUsernameStatus('idle');
      setUsernameError('Minimum 3 caractères');
      return;
    }

    // Debounce de 500ms
    usernameDebounceRef.current = setTimeout(() => {
      checkUsernameAvailability(cleanValue);
    }, 500);
  };

  // Cleanup du timeout au démontage
  useEffect(() => {
    return () => {
      if (usernameDebounceRef.current) {
        clearTimeout(usernameDebounceRef.current);
      }
    };
  }, []);

  const validateForm = (): string | null => {
    if (!formData.firstName.trim()) return 'Le prénom est requis';
    if (!formData.lastName.trim()) return 'Le nom est requis';
    if (!formData.username.trim()) return "Le nom d'utilisateur est requis";
    if (formData.username.length < 3) return "Le nom d'utilisateur doit contenir au moins 3 caractères";
    if (usernameStatus === 'taken') return "Ce nom d'utilisateur est déjà pris";
    if (!formData.birthDate.trim()) return 'La date de naissance est requise';
    if (!isValidBirthDate(formData.birthDate)) return 'Date de naissance invalide';
    if (!formData.email.trim()) return "L'email est requis";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return 'Email invalide';
    if (!formData.password) return 'Le mot de passe est requis';
    if (!PASSWORD_REGEX.test(formData.password)) {
      return 'Le mot de passe doit contenir au moins 6 caractères, une majuscule et un chiffre';
    }
    if (formData.password !== formData.confirmPassword) {
      return 'Les mots de passe ne correspondent pas';
    }
    return null;
  };

  const isFormValid = (): boolean => {
    return (
      formData.firstName.trim().length > 0 &&
      formData.lastName.trim().length > 0 &&
      formData.username.length >= 3 &&
      usernameStatus === 'available' &&
      isValidBirthDate(formData.birthDate) &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
      PASSWORD_REGEX.test(formData.password) &&
      formData.password === formData.confirmPassword
    );
  };

  const handleRegister = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    const result = await register({
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      username: formData.username.trim(),
      birthDate: formatBirthDateForApi(formData.birthDate),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
    });

    if (result.success) {
      // Connexion automatique après inscription
      const loginResult = await signIn({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      setLoading(false);

      if (loginResult.success) {
        router.replace('/');
      } else {
        // Inscription réussie mais connexion échouée
        router.replace('/sign-in');
      }
    } else {
      setLoading(false);
      setError(result.message || "Erreur lors de l'inscription");
    }
  };

  const getUsernameStatusIcon = () => {
    switch (usernameStatus) {
      case 'checking':
        return <ActivityIndicator size="small" color={colors.icon} />;
      case 'available':
        return <Text style={styles.statusIcon}>✓</Text>;
      case 'taken':
        return <Text style={[styles.statusIcon, styles.errorIcon]}>✗</Text>;
      default:
        return null;
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
            <Text style={styles.subtitle}>Create your account</Text>
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
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Input
                label="Prénom"
                placeholder="John"
                value={formData.firstName}
                onChangeText={v => updateField('firstName', v)}
                autoComplete="given-name"
                editable={!loading}
              />
            </View>

            <View style={styles.halfInput}>
              <Input
                label="Nom"
                placeholder="Doe"
                value={formData.lastName}
                onChangeText={v => updateField('lastName', v)}
                autoComplete="family-name"
                editable={!loading}
              />
            </View>
          </View>

          <View style={styles.usernameContainer}>
            <Input
              label="Nom d'utilisateur"
              placeholder="johndoe"
              value={formData.username}
              onChangeText={handleUsernameChange}
              autoCapitalize="none"
              autoComplete="username"
              editable={!loading}
              error={usernameError || undefined}
            />
            <View style={styles.usernameStatus}>
              {getUsernameStatusIcon()}
            </View>
            {usernameStatus === 'available' && (
              <Text style={styles.fieldSuccess}>✓ Nom d&apos;utilisateur disponible</Text>
            )}
          </View>

          <Input
            label="Date de naissance"
            placeholder="15/01/1990"
            value={formData.birthDate}
            onChangeText={handleBirthDateChange}
            keyboardType="number-pad"
            maxLength={10}
            editable={!loading}
          />

          <Input
            label="Email"
            placeholder="john@example.com"
            value={formData.email}
            onChangeText={v => updateField('email', v)}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            editable={!loading}
          />

          <View style={styles.passwordWrapper}>
            <Input
              label="Mot de passe"
              placeholder="••••••••"
              value={formData.password}
              onChangeText={handlePasswordChange}
              secureTextEntry={!showPassword}
              autoComplete="new-password"
              editable={!loading}
              error={passwordError || undefined}
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
            {!passwordError && formData.password.length === 0 && (
              <Text style={styles.hint}>
                Min. 6 caractères, 1 majuscule, 1 chiffre
              </Text>
            )}
          </View>

          <Input
            label="Confirmer le mot de passe"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChangeText={handleConfirmPasswordChange}
            secureTextEntry={!showPassword}
            autoComplete="new-password"
            editable={!loading}
            error={confirmPasswordError || undefined}
          />

          {error && (
            <Animated.View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={18} color="#DC2626" />
              <Text style={styles.errorText}>{error}</Text>
            </Animated.View>
          )}

          <TouchableOpacity
            className="flex-row items-center justify-center flex-1 py-3 rounded-xl"
            style={{ backgroundColor: tintColor, opacity: loading || !isFormValid() ? 0.6 : 1 }}
            onPress={handleRegister}
            disabled={loading || !isFormValid()}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <ThemedText style={{ color: '#fff', marginLeft: 8, fontWeight: '600', fontSize: 16 }}>
                Créer mon compte
              </ThemedText>
            )}
          </TouchableOpacity>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Déjà un compte ?</Text>
            <Pressable
              onPress={() => router.push('/sign-in')}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.linkText}>Se connecter</Text>
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
    row: {
      flexDirection: 'row',
      gap: Spacing.base,
    },
    halfInput: {
      flex: 1,
    },
    usernameContainer: {
      position: 'relative',
    },
    usernameStatus: {
      position: 'absolute',
      right: Spacing.base,
      top: Spacing.xl + Spacing.sm,
      zIndex: 10,
    },
    statusIcon: {
      fontSize: 18,
      color: '#22c55e',
      fontWeight: 'bold',
    },
    errorIcon: {
      color: '#dc2626',
    },
    fieldSuccess: {
      fontSize: Typography.size.caption,
      color: '#22c55e',
      marginTop: Spacing.xs,
      fontWeight: Typography.weight.medium,
    },
    passwordWrapper: {
      position: 'relative',
    },
    eyeButton: {
      position: 'absolute',
      right: Spacing.base,
      top: Spacing.xl + Spacing.sm,
      zIndex: 10,
    },
    hint: {
      fontSize: Typography.size.caption,
      color: colors.textTertiary,
      marginTop: Spacing.xs,
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
