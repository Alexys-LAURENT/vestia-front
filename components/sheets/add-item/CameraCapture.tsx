import { useThemeColor } from '@/hooks/use-theme-color'
import { Ionicons } from '@expo/vector-icons'
import { CameraView, useCameraPermissions, type CameraType } from 'expo-camera'
import React, { useCallback, useRef, useState } from 'react'
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import type { MediaAssetWithUri } from '../../media-gallery/types/media-gallery.types'

interface CameraCaptureProps {
  onCapture: (image: MediaAssetWithUri) => void
  onClose: () => void
}

export const CameraCapture = ({ onCapture, onClose }: CameraCaptureProps) => {
  const cameraRef = useRef<CameraView>(null)
  const [facing, setFacing] = useState<CameraType>('back')
  const [flash, setFlash] = useState<'off' | 'on' | 'auto'>('off')
  const [isTaking, setIsTaking] = useState(false)
  const [permission, requestPermission] = useCameraPermissions()

  const tintColor = useThemeColor({}, 'tint')

  const toggleFacing = useCallback(() => {
    setFacing((prev) => (prev === 'back' ? 'front' : 'back'))
  }, [])

  const toggleFlash = useCallback(() => {
    setFlash((prev) => {
      if (prev === 'off') return 'on'
      if (prev === 'on') return 'auto'
      return 'off'
    })
  }, [])

  const flashIconName =
    flash === 'off'
      ? ('flash-off' as const)
      : flash === 'on'
        ? ('flash' as const)
        : ('flash-outline' as const)

  const takePicture = useCallback(async () => {
    if (!cameraRef.current || isTaking) return

    setIsTaking(true)
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: false,
      })

      if (photo) {
        const mediaAsset: MediaAssetWithUri = {
          id: `camera-${Date.now()}`,
          uri: photo.uri,
          localUri: photo.uri,
          width: photo.width,
          height: photo.height,
          filename: `photo_${Date.now()}.jpg`,
          mediaType: 'photo',
          duration: 0,
          creationTime: Date.now(),
          modificationTime: Date.now(),
          albumId: '',
          mimeType: 'image/jpeg',
        }
        onCapture(mediaAsset)
      }
    } catch (error) {
      console.error('Erreur prise de photo:', error)
    } finally {
      setIsTaking(false)
    }
  }, [isTaking, onCapture])

  // Permissions en cours de chargement
  if (!permission) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={tintColor} />
      </View>
    )
  }

  // Permissions refusées
  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Text style={styles.permissionText}>
          L&apos;accès à la caméra est nécessaire pour prendre des photos.
        </Text>
        {permission.canAskAgain ? (
          <TouchableOpacity
            style={[styles.permissionButton, { backgroundColor: tintColor }]}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>Autoriser la caméra</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.permissionSubtext}>
            Veuillez autoriser l&apos;accès dans les réglages de votre appareil.
          </Text>
        )}
        <TouchableOpacity style={styles.backButton} onPress={onClose}>
          <Text style={[styles.backButtonText, { color: tintColor }]}>Retour</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        flash={flash}
        mode="picture"
      >
        <SafeAreaView style={styles.overlay}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.headerButton}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleFlash} style={styles.headerButton}>
              <Ionicons name={flashIconName} size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Bottom controls */}
          <View style={styles.bottomControls}>
            {/* Spacer */}
            <View style={styles.sideButton} />

            {/* Shutter */}
            <TouchableOpacity
              style={styles.shutterButton}
              onPress={takePicture}
              disabled={isTaking}
              activeOpacity={0.7}
            >
              <View style={[styles.shutterInner, isTaking && styles.shutterTaking]} />
            </TouchableOpacity>

            {/* Flip camera */}
            <TouchableOpacity style={styles.sideButton} onPress={toggleFacing}>
              <Ionicons name="camera-reverse-outline" size={32} color="#fff" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </CameraView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 30,
  },
  shutterButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#fff',
  },
  shutterTaking: {
    backgroundColor: '#ccc',
  },
  sideButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  permissionText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionSubtext: {
    color: '#aaa',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
  },
  permissionButton: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    marginTop: 20,
    padding: 10,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
})
