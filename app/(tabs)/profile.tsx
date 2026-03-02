import { ThemedText } from '@/components/themed-text'
import { Input } from '@/components/ui/input'
import { PASSWORD_REGEX } from '@/constants/auth'
import { Animation, Colors, Radius, Shadows, Spacing, Typography } from '@/constants/theme'
import { useSession } from '@/contexts/SessionContext'
import { useBehavior } from '@/hooks/use-behavior'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { useThemeColor } from '@/hooks/use-theme-color'
import type { SuccessResponse } from '@/types/requests'
import { api, FetchApiError } from '@/utils/fetchApiClientSide'
import { Ionicons } from '@expo/vector-icons'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

// ─── Types ──────────────────────────────────────────────
interface ProfileFormData {
  firstName: string
  lastName: string
  username: string
  birthDate: string
  email: string
}

interface PasswordFormData {
  currentPassword: string
  newPassword: string
  confirmNewPassword: string
}

// ─── Helpers ────────────────────────────────────────────
/** YYYY-MM-DD → DD/MM/YYYY */
const apiDateToDisplay = (apiDate: string): string => {
  if (!apiDate) return ''
  const parts = apiDate.split('T')[0].split('-')
  if (parts.length === 3 && parts[0].length === 4) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`
  }
  return apiDate
}

/** DD/MM/YYYY → YYYY-MM-DD */
const displayDateToApi = (displayDate: string): string => {
  const parts = displayDate.split('/')
  if (
    parts.length === 3 &&
    parts[0].length === 2 &&
    parts[1].length === 2 &&
    parts[2].length === 4
  ) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`
  }
  return ''
}

const isValidBirthDate = (date: string): boolean => {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(date)) return false
  const [day, month, year] = date.split('/').map(Number)
  const dateObj = new Date(year, month - 1, day)
  return (
    dateObj.getFullYear() === year &&
    dateObj.getMonth() === month - 1 &&
    dateObj.getDate() === day &&
    year >= 1900 &&
    year <= new Date().getFullYear()
  )
}

// ─── Component ──────────────────────────────────────────
export default function ProfileScreen() {
  const { session, signOut, updateSession } = useSession()
  const colorScheme = useColorScheme()
  const theme = colorScheme === 'dark' ? 'dark' : 'light'
  const colors = Colors[theme]
  const shadows = Shadows[theme]
  const tintColor = useThemeColor({}, 'tint')
  const behaviour = useBehavior()

  // ─── Profile form state ─────────────────────────────
  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    firstName: '',
    lastName: '',
    username: '',
    birthDate: '',
    email: '',
  })
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null)
  const [profileError, setProfileError] = useState<string | null>(null)

  // Username availability
  const [usernameStatus, setUsernameStatus] = useState<
    'idle' | 'checking' | 'available' | 'taken' | 'current'
  >('current')
  const [usernameError, setUsernameError] = useState<string | null>(null)
  const usernameDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ─── Password form state ────────────────────────────
  const [passwordForm, setPasswordForm] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  })
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [newPasswordFieldError, setNewPasswordFieldError] = useState<string | null>(null)
  const [confirmPasswordFieldError, setConfirmPasswordFieldError] = useState<string | null>(null)

  // ─── Animations ─────────────────────────────────────
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current
  const profileShakeAnim = useRef(new Animated.Value(0)).current
  const passwordShakeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
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
    ]).start()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(() => {
    if (session) {
      setProfileForm({
        firstName: session.firstName ?? '',
        lastName: session.lastName ?? '',
        username: session.username ?? '',
        birthDate: apiDateToDisplay(session.birthDate ?? ''),
        email: session.email ?? '',
      })
      setUsernameStatus('current')
    }
  }, [session])

  // Shake on profile error
  useEffect(() => {
    if (profileError) {
      Animated.sequence([
        Animated.timing(profileShakeAnim, { toValue: 10, duration: 80, useNativeDriver: true }),
        Animated.timing(profileShakeAnim, { toValue: -10, duration: 80, useNativeDriver: true }),
        Animated.timing(profileShakeAnim, { toValue: 10, duration: 80, useNativeDriver: true }),
        Animated.timing(profileShakeAnim, { toValue: 0, duration: 80, useNativeDriver: true }),
      ]).start()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileError])

  // Shake on password error
  useEffect(() => {
    if (passwordError) {
      Animated.sequence([
        Animated.timing(passwordShakeAnim, { toValue: 10, duration: 80, useNativeDriver: true }),
        Animated.timing(passwordShakeAnim, { toValue: -10, duration: 80, useNativeDriver: true }),
        Animated.timing(passwordShakeAnim, { toValue: 10, duration: 80, useNativeDriver: true }),
        Animated.timing(passwordShakeAnim, { toValue: 0, duration: 80, useNativeDriver: true }),
      ]).start()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passwordError])

  // Cleanup
  useEffect(() => {
    return () => {
      if (usernameDebounceRef.current) clearTimeout(usernameDebounceRef.current)
    }
  }, [])

  // ─── Profile handlers ───────────────────────────────
  const updateProfileField = (field: keyof ProfileFormData, value: string) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }))
    setProfileError(null)
    setProfileSuccess(null)
  }

  const handleBirthDateChange = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    let formatted = ''
    if (numbers.length > 0) {
      formatted = numbers.slice(0, 2)
      if (numbers.length > 2) {
        formatted += '/' + numbers.slice(2, 4)
        if (numbers.length > 4) {
          formatted += '/' + numbers.slice(4, 8)
        }
      }
    }
    updateProfileField('birthDate', formatted)
  }

  const checkUsernameAvailability = useCallback(async (username: string) => {
    if (username.length < 3) {
      setUsernameStatus('idle')
      setUsernameError(username.length > 0 ? 'Minimum 3 caractères' : null)
      return
    }
    setUsernameStatus('checking')
    setUsernameError(null)
    try {
      await api.post('/auth/check-username', { username }, { requireAuth: false })
      setUsernameStatus('available')
      setUsernameError(null)
    } catch (err) {
      if (err instanceof FetchApiError) {
        setUsernameStatus('taken')
        setUsernameError("Ce nom d'utilisateur est déjà pris")
      } else {
        setUsernameStatus('idle')
        setUsernameError('Erreur de vérification')
      }
    }
  }, [])

  const handleUsernameChange = (value: string) => {
    const cleanValue = value.toLowerCase().replace(/\s/g, '')
    updateProfileField('username', cleanValue)

    if (usernameDebounceRef.current) clearTimeout(usernameDebounceRef.current)

    // If same as session username, no need to check
    if (cleanValue === (session?.username ?? '')) {
      setUsernameStatus('current')
      setUsernameError(null)
      return
    }

    if (cleanValue.length === 0) {
      setUsernameStatus('idle')
      setUsernameError(null)
      return
    }
    if (cleanValue.length < 3) {
      setUsernameStatus('idle')
      setUsernameError('Minimum 3 caractères')
      return
    }

    usernameDebounceRef.current = setTimeout(() => {
      checkUsernameAvailability(cleanValue)
    }, 500)
  }

  const getUsernameStatusIcon = () => {
    switch (usernameStatus) {
      case 'checking':
        return <ActivityIndicator size="small" color={colors.icon} />
      case 'available':
        return <Text style={{ fontSize: 18, color: '#22c55e', fontWeight: 'bold' }}>✓</Text>
      case 'taken':
        return <Text style={{ fontSize: 18, color: '#dc2626', fontWeight: 'bold' }}>✗</Text>
      default:
        return null
    }
  }

  const hasProfileChanges = (): boolean => {
    if (!session) return false
    return (
      profileForm.firstName !== (session.firstName ?? '') ||
      profileForm.lastName !== (session.lastName ?? '') ||
      profileForm.username !== (session.username ?? '') ||
      profileForm.birthDate !== apiDateToDisplay(session.birthDate ?? '') ||
      profileForm.email !== (session.email ?? '')
    )
  }

  const handleSaveProfile = async () => {
    setProfileError(null)
    setProfileSuccess(null)

    // Validate
    if (!profileForm.firstName.trim()) {
      setProfileError('Le prénom est requis')
      return
    }
    if (!profileForm.lastName.trim()) {
      setProfileError('Le nom est requis')
      return
    }
    if (profileForm.username.length < 3) {
      setProfileError("Le nom d'utilisateur doit contenir au moins 3 caractères")
      return
    }
    if (usernameStatus === 'taken') {
      setProfileError("Ce nom d'utilisateur est déjà pris")
      return
    }
    if (profileForm.birthDate && !isValidBirthDate(profileForm.birthDate)) {
      setProfileError('Date de naissance invalide')
      return
    }
    if (profileForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.email)) {
      setProfileError('Email invalide')
      return
    }

    setProfileLoading(true)

    try {
      // Build body with only changed fields
      const body: Record<string, string> = {}
      if (profileForm.firstName !== (session?.firstName ?? ''))
        body.firstName = profileForm.firstName.trim()
      if (profileForm.lastName !== (session?.lastName ?? ''))
        body.lastName = profileForm.lastName.trim()
      if (profileForm.username !== (session?.username ?? ''))
        body.username = profileForm.username.trim()
      if (profileForm.birthDate !== apiDateToDisplay(session?.birthDate ?? ''))
        body.birthDate = displayDateToApi(profileForm.birthDate)
      if (profileForm.email !== (session?.email ?? ''))
        body.email = profileForm.email.trim().toLowerCase()

      if (Object.keys(body).length === 0) {
        setProfileLoading(false)
        return
      }

      await api.put<SuccessResponse<unknown>>('/auth/profile', body)

      // Update session locally
      updateSession({
        firstName: profileForm.firstName.trim(),
        lastName: profileForm.lastName.trim(),
        username: profileForm.username.trim(),
        birthDate: body.birthDate ?? session?.birthDate ?? '',
        email: profileForm.email.trim().toLowerCase() || session?.email || '',
      })

      setUsernameStatus('current')
      setProfileSuccess('Profil mis à jour avec succès')

      setTimeout(() => setProfileSuccess(null), 3000)
    } catch (error) {
      if (error instanceof FetchApiError) {
        setProfileError(error.message)
      } else {
        setProfileError('Une erreur est survenue')
      }
    } finally {
      setProfileLoading(false)
    }
  }

  // ─── Password handlers ──────────────────────────────
  const handleNewPasswordChange = (value: string) => {
    setPasswordForm((prev) => ({ ...prev, newPassword: value }))
    setPasswordError(null)
    setPasswordSuccess(null)

    if (value.length === 0) {
      setNewPasswordFieldError(null)
    } else if (value.length < 6) {
      setNewPasswordFieldError('Minimum 6 caractères')
    } else if (!/[A-Z]/.test(value)) {
      setNewPasswordFieldError('Au moins une majuscule requise')
    } else if (!/\d/.test(value)) {
      setNewPasswordFieldError('Au moins un chiffre requis')
    } else {
      setNewPasswordFieldError(null)
    }

    if (passwordForm.confirmNewPassword && value !== passwordForm.confirmNewPassword) {
      setConfirmPasswordFieldError('Les mots de passe ne correspondent pas')
    } else {
      setConfirmPasswordFieldError(null)
    }
  }

  const handleConfirmNewPasswordChange = (value: string) => {
    setPasswordForm((prev) => ({ ...prev, confirmNewPassword: value }))
    setPasswordError(null)
    setPasswordSuccess(null)

    if (value.length > 0 && value !== passwordForm.newPassword) {
      setConfirmPasswordFieldError('Les mots de passe ne correspondent pas')
    } else {
      setConfirmPasswordFieldError(null)
    }
  }

  const handleChangePassword = async () => {
    setPasswordError(null)
    setPasswordSuccess(null)

    if (!passwordForm.currentPassword) {
      setPasswordError('Le mot de passe actuel est requis')
      return
    }
    if (!PASSWORD_REGEX.test(passwordForm.newPassword)) {
      setPasswordError(
        'Le nouveau mot de passe doit contenir au moins 6 caractères, une majuscule et un chiffre'
      )
      return
    }
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      setPasswordError('Les mots de passe ne correspondent pas')
      return
    }

    setPasswordLoading(true)

    try {
      await api.put('/auth/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })

      setPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' })
      setNewPasswordFieldError(null)
      setConfirmPasswordFieldError(null)
      setPasswordSuccess('Mot de passe modifié avec succès')

      setTimeout(() => setPasswordSuccess(null), 3000)
    } catch (error) {
      if (error instanceof FetchApiError) {
        setPasswordError(error.message)
      } else {
        setPasswordError('Une erreur est survenue')
      }
    } finally {
      setPasswordLoading(false)
    }
  }

  const isPasswordFormValid = (): boolean => {
    return (
      passwordForm.currentPassword.length > 0 &&
      PASSWORD_REGEX.test(passwordForm.newPassword) &&
      passwordForm.newPassword === passwordForm.confirmNewPassword
    )
  }

  // ─── Styles ─────────────────────────────────────────
  const styles = createStyles(colors, shadows)

  // ─── Initials avatar ────────────────────────────────
  const initials =
    (session?.firstName?.[0] ?? '').toUpperCase() + (session?.lastName?.[0] ?? '').toUpperCase()

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={behaviour}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* ─── Header / Avatar ─────────────────── */}
            <View style={styles.header}>
              <View style={styles.avatarContainer}>
                <View style={[styles.avatar, { backgroundColor: colors.accentAction }]}>
                  <Text
                    style={[
                      styles.avatarText,
                      { color: theme === 'dark' ? colors.background : '#fff' },
                    ]}
                  >
                    {initials || '?'}
                  </Text>
                </View>
              </View>
              <Text style={styles.headerName}>
                {session?.firstName} {session?.lastName}
              </Text>
              <Text style={styles.headerUsername}>@{session?.username}</Text>
            </View>

            {/* ─── Profile Section ─────────────────── */}
            <Animated.View
              style={[styles.section, { transform: [{ translateX: profileShakeAnim }] }]}
            >
              <View style={styles.sectionHeader}>
                <Ionicons name="person-outline" size={20} color={colors.text} />
                <Text style={styles.sectionTitle}>Informations personnelles</Text>
              </View>

              <View style={styles.sectionCard}>
                <View style={styles.row}>
                  <View style={styles.halfInput}>
                    <Input
                      label="Prénom"
                      placeholder="John"
                      value={profileForm.firstName}
                      onChangeText={(v) => updateProfileField('firstName', v)}
                      autoComplete="given-name"
                      editable={!profileLoading}
                    />
                  </View>
                  <View style={styles.halfInput}>
                    <Input
                      label="Nom"
                      placeholder="Doe"
                      value={profileForm.lastName}
                      onChangeText={(v) => updateProfileField('lastName', v)}
                      autoComplete="family-name"
                      editable={!profileLoading}
                    />
                  </View>
                </View>

                <View style={styles.usernameContainer}>
                  <Input
                    label="Nom d'utilisateur"
                    placeholder="johndoe"
                    value={profileForm.username}
                    onChangeText={handleUsernameChange}
                    autoCapitalize="none"
                    autoComplete="username"
                    editable={!profileLoading}
                    error={usernameError || undefined}
                  />
                  <View style={styles.usernameStatus}>{getUsernameStatusIcon()}</View>
                  {usernameStatus === 'available' && (
                    <Text style={styles.fieldSuccess}>✓ Disponible</Text>
                  )}
                </View>

                <Input
                  label="Date de naissance"
                  placeholder="15/01/1990"
                  value={profileForm.birthDate}
                  onChangeText={handleBirthDateChange}
                  keyboardType="number-pad"
                  maxLength={10}
                  editable={!profileLoading}
                />

                <Input
                  label="Email"
                  placeholder="john@example.com"
                  value={profileForm.email}
                  onChangeText={(v) => updateProfileField('email', v)}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                  editable={!profileLoading}
                />

                {profileError && (
                  <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={16} color="#DC2626" />
                    <Text style={styles.errorText}>{profileError}</Text>
                  </View>
                )}

                {profileSuccess && (
                  <View style={styles.successContainer}>
                    <Ionicons name="checkmark-circle-outline" size={16} color={colors.success} />
                    <Text style={[styles.successText, { color: colors.success }]}>
                      {profileSuccess}
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  style={[
                    styles.primaryButton,
                    {
                      backgroundColor: tintColor,
                      opacity:
                        profileLoading || !hasProfileChanges() || usernameStatus === 'taken'
                          ? 0.45
                          : 1,
                    },
                  ]}
                  onPress={handleSaveProfile}
                  disabled={profileLoading || !hasProfileChanges() || usernameStatus === 'taken'}
                  activeOpacity={0.7}
                >
                  {profileLoading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <ThemedText style={styles.primaryButtonText}>Enregistrer</ThemedText>
                  )}
                </TouchableOpacity>
              </View>
            </Animated.View>

            {/* ─── Password Section ────────────────── */}
            <Animated.View
              style={[styles.section, { transform: [{ translateX: passwordShakeAnim }] }]}
            >
              <View style={styles.sectionHeader}>
                <Ionicons name="lock-closed-outline" size={20} color={colors.text} />
                <Text style={styles.sectionTitle}>Modifier le mot de passe</Text>
              </View>

              <View style={styles.sectionCard}>
                <View style={styles.passwordWrapper}>
                  <Input
                    label="Mot de passe actuel"
                    placeholder="••••••••"
                    value={passwordForm.currentPassword}
                    onChangeText={(v) => {
                      setPasswordForm((prev) => ({ ...prev, currentPassword: v }))
                      setPasswordError(null)
                      setPasswordSuccess(null)
                    }}
                    secureTextEntry={!showCurrentPassword}
                    autoComplete="password"
                    editable={!passwordLoading}
                  />
                  <Pressable
                    onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                    style={styles.eyeButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons
                      name={showCurrentPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={colors.icon}
                    />
                  </Pressable>
                </View>

                <View style={styles.passwordWrapper}>
                  <Input
                    label="Nouveau mot de passe"
                    placeholder="••••••••"
                    value={passwordForm.newPassword}
                    onChangeText={handleNewPasswordChange}
                    secureTextEntry={!showNewPassword}
                    autoComplete="new-password"
                    editable={!passwordLoading}
                    error={newPasswordFieldError || undefined}
                  />
                  <Pressable
                    onPress={() => setShowNewPassword(!showNewPassword)}
                    style={styles.eyeButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons
                      name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={colors.icon}
                    />
                  </Pressable>
                  {!newPasswordFieldError && passwordForm.newPassword.length === 0 && (
                    <Text style={[styles.hint, { color: colors.textTertiary }]}>
                      Min. 6 caractères, 1 majuscule, 1 chiffre
                    </Text>
                  )}
                </View>

                <Input
                  label="Confirmer le nouveau mot de passe"
                  placeholder="••••••••"
                  value={passwordForm.confirmNewPassword}
                  onChangeText={handleConfirmNewPasswordChange}
                  secureTextEntry={!showNewPassword}
                  autoComplete="new-password"
                  editable={!passwordLoading}
                  error={confirmPasswordFieldError || undefined}
                />

                {passwordError && (
                  <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={16} color="#DC2626" />
                    <Text style={styles.errorText}>{passwordError}</Text>
                  </View>
                )}

                {passwordSuccess && (
                  <View style={styles.successContainer}>
                    <Ionicons name="checkmark-circle-outline" size={16} color={colors.success} />
                    <Text style={[styles.successText, { color: colors.success }]}>
                      {passwordSuccess}
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  style={[
                    styles.primaryButton,
                    {
                      backgroundColor: tintColor,
                      opacity: passwordLoading || !isPasswordFormValid() ? 0.45 : 1,
                    },
                  ]}
                  onPress={handleChangePassword}
                  disabled={passwordLoading || !isPasswordFormValid()}
                  activeOpacity={0.7}
                >
                  {passwordLoading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <ThemedText style={styles.primaryButtonText}>
                      Modifier le mot de passe
                    </ThemedText>
                  )}
                </TouchableOpacity>
              </View>
            </Animated.View>

            {/* ─── Sign out ────────────────────────── */}
            <TouchableOpacity
              style={[styles.signOutButton, { borderColor: colors.error }]}
              onPress={signOut}
              activeOpacity={0.7}
            >
              <Ionicons name="log-out-outline" size={20} color={colors.error} />
              <Text style={[styles.signOutText, { color: colors.error }]}>Déconnexion</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

// ─── Styles ───────────────────────────────────────────────
const createStyles = (colors: (typeof Colors)['light'], shadows: (typeof Shadows)['light']) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: Spacing.lg,
      paddingTop: Spacing.lg,
      paddingBottom: Spacing['4xl'],
    },
    content: {
      width: '100%',
      maxWidth: 480,
      alignSelf: 'center',
    },

    // Header / Avatar
    header: {
      alignItems: 'center',
      marginBottom: Spacing.xl,
    },
    avatarContainer: {
      marginBottom: Spacing.base,
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      justifyContent: 'center',
      alignItems: 'center',
      ...shadows.md,
    },
    avatarText: {
      fontSize: Typography.size.heading,
      fontWeight: Typography.weight.bold,
      fontFamily: Typography.family.display,
      letterSpacing: 1,
    },
    headerName: {
      fontSize: Typography.size.subheading,
      fontWeight: Typography.weight.semibold,
      color: colors.text,
      marginBottom: 2,
    },
    headerUsername: {
      fontSize: Typography.size.bodySmall,
      fontWeight: Typography.weight.regular,
      color: colors.textTertiary,
      letterSpacing: Typography.letterSpacing.wide,
    },

    // Sections
    section: {
      marginBottom: Spacing.xl,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
      marginBottom: Spacing.md,
    },
    sectionTitle: {
      fontSize: Typography.size.body,
      fontWeight: Typography.weight.semibold,
      color: colors.text,
      letterSpacing: Typography.letterSpacing.wide,
      textTransform: 'uppercase',
    },
    sectionCard: {
      backgroundColor: colors.backgroundSecondary,
      borderRadius: Radius.lg,
      padding: Spacing.lg,
      gap: Spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
      ...shadows.sm,
    },

    // Form
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
      marginTop: Spacing.xs,
    },

    // Feedback
    errorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
      paddingHorizontal: Spacing.md,
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
    successContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      backgroundColor: '#D1FAE5',
      borderRadius: Radius.sm,
      borderWidth: 1,
      borderColor: '#A7F3D0',
    },
    successText: {
      flex: 1,
      fontSize: Typography.size.caption,
      fontWeight: Typography.weight.medium,
    },

    // Buttons
    primaryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: Spacing.md,
      borderRadius: Radius.md,
    },
    primaryButtonText: {
      color: '#fff',
      fontWeight: Typography.weight.semibold,
      fontSize: Typography.size.body,
    },
    signOutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.sm,
      paddingVertical: Spacing.md,
      borderRadius: Radius.md,
      borderWidth: 1.5,
      marginTop: Spacing.sm,
    },
    signOutText: {
      fontSize: Typography.size.body,
      fontWeight: Typography.weight.semibold,
    },
  })
