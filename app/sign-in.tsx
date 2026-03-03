import { ThemedText } from '@/components/themed-text'
import { Input } from '@/components/ui/input'
import { Animation, Spacing, Typography } from '@/constants/theme'
import { useSession } from '@/contexts/SessionContext'
import { useBehavior } from '@/hooks/use-behavior'
import { useThemeColor } from '@/hooks/use-theme-color'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
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

export default function SignIn() {
  const { signIn } = useSession()
  const tintColor = useThemeColor({}, 'tint')
  const iconColor = useThemeColor({}, 'icon')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current
  const scaleAnim = useRef(new Animated.Value(0.95)).current
  const shakeAnim = useRef(new Animated.Value(0)).current

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
    ]).start()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Shake animation for errors
  useEffect(() => {
    if (error) {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
      ]).start()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error])

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Veuillez remplir tous les champs')
      return
    }

    setLoading(true)
    setError(null)

    const result = await signIn({ email: email.trim(), password })

    setLoading(false)

    if (result.success) {
      router.replace('/')
    } else {
      setError(result.message || 'Email ou mot de passe incorrect')
    }
  }

  const behaviour = useBehavior()

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-light-background dark:bg-dark-background"
      behavior={behaviour}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          paddingHorizontal: Spacing.xl,
          paddingVertical: Spacing['4xl'],
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            { width: '100%', maxWidth: 400, alignSelf: 'center' },
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            },
          ]}
        >
          {/* Logo & Header */}
          <View className="items-center" style={{ marginBottom: Spacing['3xl'] }}>
            <Text
              className="mb-base text-light-text-primary dark:text-dark-text-primary"
              style={{
                fontFamily: Typography.family.display,
                fontSize: Typography.size.hero,
                fontWeight: Typography.weight.black,
                letterSpacing: Typography.letterSpacing.tight,
              }}
            >
              VESTIA
            </Text>
            <View className="w-[60px] h-[2px] mb-lg" style={{ backgroundColor: tintColor }} />
            <Text
              className="text-body uppercase text-light-text-tertiary dark:text-dark-text-tertiary"
              style={{ letterSpacing: Typography.letterSpacing.wide }}
            >
              Bon retour
            </Text>
          </View>

          {/* Form */}
          <Animated.View
            style={[
              { gap: Spacing.lg },
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
                setEmail(text)
                setError(null)
              }}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              editable={!loading}
              error={error && !password ? error : undefined}
            />

            <View className="relative">
              <Input
                label="Mot de passe"
                placeholder="••••••••"
                value={password}
                onChangeText={(text) => {
                  setPassword(text)
                  setError(null)
                }}
                secureTextEntry={!showPassword}
                autoComplete="password"
                editable={!loading}
                error={error && password ? error : undefined}
              />
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                className="absolute z-10 right-base"
                style={{ top: Spacing.xl + Spacing.sm }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={22}
                  color={iconColor}
                />
              </Pressable>
            </View>

            {error && (
              <Animated.View className="flex-row items-center gap-sm px-base py-sm bg-[#FEE2E2] rounded-sm border border-[#FECACA]">
                <Ionicons name="alert-circle-outline" size={18} color="#DC2626" />
                <Text className="flex-1 text-[#DC2626] text-caption font-medium">{error}</Text>
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
                  <ThemedText
                    style={{ color: '#fff', marginLeft: 8, fontWeight: '600', fontSize: 16 }}
                  >
                    Se connecter
                  </ThemedText>
                </>
              )}
            </TouchableOpacity>

            {/* Footer */}
            <View className="flex-row justify-center items-center gap-xs mt-xl">
              <Text className="text-body-sm text-light-text-secondary dark:text-dark-text-secondary">
                Pas encore de compte ?
              </Text>
              <Pressable
                onPress={() => router.push('/register')}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text className="text-body-sm font-semibold underline" style={{ color: tintColor }}>
                  S&apos;inscrire
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
