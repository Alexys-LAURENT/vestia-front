import { ThemedText } from '@/components/themed-text'
import { Input } from '@/components/ui/input'
import { PASSWORD_REGEX } from '@/constants/auth'
import { Animation, Colors, Shadows, Spacing, Typography } from '@/constants/theme'
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
  const isDark = colorScheme === 'dark'
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
  // ─── Initials avatar ────────────────────────────────
  const initials =
    (session?.firstName?.[0] ?? '').toUpperCase() + (session?.lastName?.[0] ?? '').toUpperCase()

  return (
    <SafeAreaView className="flex-1 bg-light-background dark:bg-dark-background" edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={behaviour}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: Spacing.lg,
            paddingTop: Spacing.lg,
            paddingBottom: Spacing['4xl'],
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[
              { width: '100%', maxWidth: 480, alignSelf: 'center' },
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* ─── Header / Avatar ─────────────────── */}
            <View className="items-center mb-xl">
              <View className="mb-base">
                <View
                  className="w-[80px] h-[80px] rounded-full justify-center items-center"
                  style={{ backgroundColor: colors.accentAction, ...shadows.md }}
                >
                  <Text
                    style={{
                      fontSize: Typography.size.heading,
                      fontWeight: Typography.weight.bold,
                      fontFamily: Typography.family.display,
                      letterSpacing: 1,
                      color: theme === 'dark' ? colors.background : '#fff',
                    }}
                  >
                    {initials || '?'}
                  </Text>
                </View>
              </View>
              <Text
                style={{
                  fontSize: Typography.size.subheading,
                  fontWeight: Typography.weight.semibold,
                  marginBottom: 2,
                  color: isDark ? '#FAFAFA' : '#0A0A0A',
                }}
              >
                {session?.firstName} {session?.lastName}
              </Text>
              <Text
                style={{
                  letterSpacing: Typography.letterSpacing.wide,
                  color: isDark ? '#707070' : '#8A8A8A',
                }}
              >
                @{session?.username}
              </Text>
            </View>

            {/* ─── Profile Section ─────────────────── */}
            <Animated.View
              className="mb-xl"
              style={[{ transform: [{ translateX: profileShakeAnim }] }]}
            >
              <View className="flex-row items-center gap-sm mb-md">
                <Ionicons name="person-outline" size={20} color={colors.text} />
                <Text
                  className="text-body font-semibold uppercase"
                  style={{
                    letterSpacing: Typography.letterSpacing.wide,
                    color: isDark ? '#FAFAFA' : '#0A0A0A',
                  }}
                >
                  Informations personnelles
                </Text>
              </View>

              <View
                className="rounded-lg p-lg gap-lg border"
                style={{
                  backgroundColor: colors.backgroundSecondary,
                  borderColor: colors.border,
                  ...shadows.sm,
                }}
              >
                <View className="flex-row gap-base">
                  <View className="flex-1">
                    <Input
                      label="Prénom"
                      placeholder="John"
                      value={profileForm.firstName}
                      onChangeText={(v) => updateProfileField('firstName', v)}
                      autoComplete="given-name"
                      editable={!profileLoading}
                    />
                  </View>
                  <View className="flex-1">
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

                <View className="relative">
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
                  <View
                    className="absolute z-10 right-base"
                    style={{ top: Spacing.xl + Spacing.sm }}
                  >
                    {getUsernameStatusIcon()}
                  </View>
                  {usernameStatus === 'available' && (
                    <Text className="text-caption font-medium mt-xs text-[#22c55e]">
                      ✓ Disponible
                    </Text>
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
                  <View className="flex-row items-center gap-sm px-md py-sm bg-[#FEE2E2] rounded-sm border border-[#FECACA]">
                    <Ionicons name="alert-circle-outline" size={16} color="#DC2626" />
                    <Text className="flex-1 text-[#DC2626] text-caption font-medium">
                      {profileError}
                    </Text>
                  </View>
                )}

                {profileSuccess && (
                  <View className="flex-row items-center gap-sm px-md py-sm bg-[#D1FAE5] rounded-sm border border-[#A7F3D0]">
                    <Ionicons name="checkmark-circle-outline" size={16} color={colors.success} />
                    <Text
                      className="flex-1 text-caption font-medium"
                      style={{ color: colors.success }}
                    >
                      {profileSuccess}
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  className="flex-row items-center justify-center py-md rounded-md"
                  style={[
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
                    <ActivityIndicator color={isDark ? '#0A0A0A' : '#fff'} size="small" />
                  ) : (
                    <ThemedText
                      style={{
                        color: isDark ? '#0A0A0A' : '#fff',
                        fontWeight: Typography.weight.semibold,
                        fontSize: Typography.size.body,
                      }}
                    >
                      Enregistrer
                    </ThemedText>
                  )}
                </TouchableOpacity>
              </View>
            </Animated.View>

            {/* ─── Password Section ────────────────── */}
            <Animated.View
              className="mb-xl"
              style={[{ transform: [{ translateX: passwordShakeAnim }] }]}
            >
              <View className="flex-row items-center gap-sm mb-md">
                <Ionicons name="lock-closed-outline" size={20} color={colors.text} />
                <Text
                  className="text-body font-semibold uppercase"
                  style={{
                    letterSpacing: Typography.letterSpacing.wide,
                    color: isDark ? '#FAFAFA' : '#0A0A0A',
                  }}
                >
                  Modifier le mot de passe
                </Text>
              </View>

              <View
                className="rounded-lg p-lg gap-lg border"
                style={{
                  backgroundColor: colors.backgroundSecondary,
                  borderColor: colors.border,
                  ...shadows.sm,
                }}
              >
                <View className="relative">
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
                    className="absolute z-10 right-base"
                    style={{ top: Spacing.xl + Spacing.sm }}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons
                      name={showCurrentPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={colors.icon}
                    />
                  </Pressable>
                </View>

                <View className="relative">
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
                    className="absolute z-10 right-base"
                    style={{ top: Spacing.xl + Spacing.sm }}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons
                      name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={colors.icon}
                    />
                  </Pressable>
                  {!newPasswordFieldError && passwordForm.newPassword.length === 0 && (
                    <Text className="text-caption mt-xs" style={{ color: colors.textTertiary }}>
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
                  <View className="flex-row items-center gap-sm px-md py-sm bg-[#FEE2E2] rounded-sm border border-[#FECACA]">
                    <Ionicons name="alert-circle-outline" size={16} color="#DC2626" />
                    <Text className="flex-1 text-[#DC2626] text-caption font-medium">
                      {passwordError}
                    </Text>
                  </View>
                )}

                {passwordSuccess && (
                  <View className="flex-row items-center gap-sm px-md py-sm bg-[#D1FAE5] rounded-sm border border-[#A7F3D0]">
                    <Ionicons name="checkmark-circle-outline" size={16} color={colors.success} />
                    <Text
                      className="flex-1 text-caption font-medium"
                      style={{ color: colors.success }}
                    >
                      {passwordSuccess}
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  className="flex-row items-center justify-center py-md rounded-md"
                  style={[
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
                    <ActivityIndicator color={isDark ? '#0A0A0A' : '#fff'} size="small" />
                  ) : (
                    <ThemedText
                      style={{
                        color: isDark ? '#0A0A0A' : '#fff',
                        fontWeight: Typography.weight.semibold,
                        fontSize: Typography.size.body,
                      }}
                    >
                      Modifier le mot de passe
                    </ThemedText>
                  )}
                </TouchableOpacity>
              </View>
            </Animated.View>

            {/* ─── Sign out ────────────────────────── */}
            <TouchableOpacity
              className="flex-row items-center justify-center gap-sm py-md rounded-md border-[1.5px] mt-sm"
              style={{ borderColor: colors.error }}
              onPress={signOut}
              activeOpacity={0.7}
            >
              <Ionicons name="log-out-outline" size={20} color={colors.error} />
              <Text className="text-body font-semibold" style={{ color: colors.error }}>
                Déconnexion
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
