import { Asset } from "expo-media-library";
import { VideoView, useVideoPlayer } from "expo-video";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  Text,
  View,
} from "react-native";
import { getLocalUri, isVideoAsset } from "./utils/media-gallery.utils";

interface MediaPreviewModalProps {
  asset: Asset | null;
  visible: boolean;
  onClose: () => void;
}

export function MediaPreviewModal({
  asset,
  visible,
  onClose,
}: MediaPreviewModalProps) {
  const [uri, setUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isVideo = asset ? isVideoAsset(asset) : false;

  const player = useVideoPlayer(uri && isVideo ? uri : "", (player) => {
    player.play();
  });

  useEffect(() => {
    console.log("MediaPreviewModal - visible:", visible, "asset:", asset?.id);
    if (asset && visible) {
      setIsLoading(true);
      getLocalUri(asset).then((mediaUri) => {
        console.log("MediaPreviewModal - loaded uri:", mediaUri);
        setUri(mediaUri);
        setIsLoading(false);
      });
    } else {
      setUri(null);
    }
  }, [asset, visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View className="flex-1 bg-black">
        {/* Close button */}
        <Pressable
          onPress={onClose}
          className="absolute top-14 right-4 z-10 bg-black/50 rounded-full w-10 h-10 items-center justify-center"
        >
          <Text className="text-white text-2xl font-bold">✕</Text>
        </Pressable>

        {/* Media content */}
        <View className="flex-1 items-center justify-center">
          {isLoading ? (
            <ActivityIndicator size="large" color="#fff" />
          ) : uri ? (
            isVideo ? (
              <VideoView
                player={player}
                style={{ width: "100%", height: "100%" }}
                contentFit="contain"
                nativeControls
              />
            ) : (
              <Pressable
                onPress={onClose}
                className="flex-1 items-center justify-center w-full"
              >
                <Image
                  source={{ uri }}
                  style={{ width: "100%", height: "100%" }}
                  resizeMode="contain"
                />
              </Pressable>
            )
          ) : null}
        </View>
      </View>
    </Modal>
  );
}
