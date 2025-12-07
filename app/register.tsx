import { PASSWORD_REGEX } from '@/constants/auth';
import { Colors } from '@/constants/theme';
import { useSession } from '@/contexts/SessionContext';
import { useBehavior } from '@/hooks/use-behavior';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { api, FetchApiError } from '@/utils/fetchApi';
import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
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

export default function Register() {
  const { register, signIn } = useSession();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

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

  // Validation en temps réel
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [usernameError, setUsernameError] = useState<string | null>(null);

  // Ref pour le debounce
  const usernameDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const behaviour = useBehavior()

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={behaviour}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Créer un compte</Text>
          <Text style={styles.subtitle}>Rejoignez Vestia dès maintenant</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.halfInput]}>
              <Text style={styles.label}>Prénom</Text>
              <TextInput
                style={styles.input}
                placeholder="John"
                placeholderTextColor={colors.icon}
                value={formData.firstName}
                onChangeText={v => updateField('firstName', v)}
                autoComplete="given-name"
                editable={!loading}
              />
            </View>

            <View style={[styles.inputContainer, styles.halfInput]}>
              <Text style={styles.label}>Nom</Text>
              <TextInput
                style={styles.input}
                placeholder="Doe"
                placeholderTextColor={colors.icon}
                value={formData.lastName}
                onChangeText={v => updateField('lastName', v)}
                autoComplete="family-name"
                editable={!loading}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nom d&apos;utilisateur</Text>
            <View style={[
              styles.inputWithStatus,
              usernameStatus === 'available' && styles.inputSuccess,
              usernameStatus === 'taken' && styles.inputError,
            ]}>
              <TextInput
                style={styles.inputInner}
                placeholder="johndoe"
                placeholderTextColor={colors.icon}
                value={formData.username}
                onChangeText={handleUsernameChange}
                autoCapitalize="none"
                autoComplete="username"
                editable={!loading}
              />
              <View style={styles.statusContainer}>
                {getUsernameStatusIcon()}
              </View>
            </View>
            {usernameError && <Text style={styles.fieldError}>{usernameError}</Text>}
            {usernameStatus === 'available' && (
              <Text style={styles.fieldSuccess}>Nom d&apos;utilisateur disponible</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Date de naissance</Text>
            <TextInput
              style={styles.input}
              placeholder="15/01/1990"
              placeholderTextColor={colors.icon}
              value={formData.birthDate}
              onChangeText={handleBirthDateChange}
              keyboardType="number-pad"
              maxLength={10}
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="john@example.com"
              placeholderTextColor={colors.icon}
              value={formData.email}
              onChangeText={v => updateField('email', v)}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Mot de passe</Text>
            <View style={[
              styles.passwordContainer,
              passwordError && styles.inputError,
              formData.password.length > 0 && !passwordError && styles.inputSuccess,
            ]}>
              <TextInput
                style={styles.passwordInput}
                placeholder="••••••••"
                placeholderTextColor={colors.icon}
                value={formData.password}
                onChangeText={handlePasswordChange}
                secureTextEntry={!showPassword}
                autoComplete="new-password"
                editable={!loading}
              />
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}>
                <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁️'}</Text>
              </Pressable>
            </View>
            {passwordError ? (
              <Text style={styles.fieldError}>{passwordError}</Text>
            ) : (
              <Text style={styles.hint}>
                Min. 6 caractères, 1 majuscule, 1 chiffre
              </Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirmer le mot de passe</Text>
            <TextInput
              style={[
                styles.input,
                confirmPasswordError && styles.inputError,
                formData.confirmPassword.length > 0 && !confirmPasswordError && formData.password === formData.confirmPassword && styles.inputSuccess,
              ]}
              placeholder="••••••••"
              placeholderTextColor={colors.icon}
              value={formData.confirmPassword}
              onChangeText={handleConfirmPasswordChange}
              secureTextEntry={!showPassword}
              autoComplete="new-password"
              editable={!loading}
            />
            {confirmPasswordError && (
              <Text style={styles.fieldError}>{confirmPasswordError}</Text>
            )}
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Pressable
            style={[styles.button, (loading || !isFormValid()) && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading || !isFormValid()}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Créer mon compte</Text>
            )}
          </Pressable>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Déjà un compte ?</Text>
            <Pressable onPress={() => router.back()}>
              <Text style={styles.linkText}>Se connecter</Text>
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
      padding: 24,
      paddingTop: 60,
    },
    header: {
      alignItems: 'center',
      marginBottom: 32,
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: colors.icon,
    },
    form: {
      gap: 16,
    },
    row: {
      flexDirection: 'row',
      gap: 12,
    },
    inputContainer: {
      gap: 6,
    },
    halfInput: {
      flex: 1,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    hint: {
      fontSize: 12,
      color: colors.icon,
      marginTop: 4,
    },
    input: {
      height: 48,
      borderWidth: 1,
      borderColor: colors.icon,
      borderRadius: 10,
      paddingHorizontal: 14,
      fontSize: 16,
      color: colors.text,
      backgroundColor: colors.background,
    },
    inputWithStatus: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.icon,
      borderRadius: 10,
      backgroundColor: colors.background,
    },
    inputInner: {
      flex: 1,
      height: 48,
      paddingHorizontal: 14,
      fontSize: 16,
      color: colors.text,
    },
    statusContainer: {
      paddingHorizontal: 12,
      height: 48,
      justifyContent: 'center',
      minWidth: 40,
      alignItems: 'center',
    },
    statusIcon: {
      fontSize: 18,
      color: '#22c55e',
      fontWeight: 'bold',
    },
    errorIcon: {
      color: '#dc2626',
    },
    inputSuccess: {
      borderColor: '#22c55e',
      borderWidth: 1.5,
    },
    inputError: {
      borderColor: '#dc2626',
      borderWidth: 1.5,
    },
    fieldError: {
      fontSize: 12,
      color: '#dc2626',
      marginTop: 4,
    },
    fieldSuccess: {
      fontSize: 12,
      color: '#22c55e',
      marginTop: 4,
    },
    passwordContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.icon,
      borderRadius: 10,
      backgroundColor: colors.background,
    },
    passwordInput: {
      flex: 1,
      height: 48,
      paddingHorizontal: 14,
      fontSize: 16,
      color: colors.text,
    },
    eyeButton: {
      paddingHorizontal: 14,
      height: 48,
      justifyContent: 'center',
    },
    eyeText: {
      fontSize: 18,
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
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 4,
      marginTop: 16,
      paddingBottom: 24,
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
