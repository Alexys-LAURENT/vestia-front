import { useRecyclingState } from "@shopify/flash-list";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { GalleryImageProps } from "./types/media-gallery.types";
import {
  formatDuration,
  getMediaUri,
  isVideoAsset,
} from "./utils/media-gallery.utils";

function GalleryImageComponent({
  asset,
  size,
  onPress,
  onLongPress,
  isSelected,
}: GalleryImageProps) {
  // Utiliser useRecyclingState pour gérer correctement le recycling de FlashList
  const [uri, setUri] = useRecyclingState<string | null>(null, [asset.id]);
  const [isLoading, setIsLoading] = useRecyclingState(true, [asset.id]);
  const isVideo = isVideoAsset(asset);

  useEffect(() => {
    let isMounted = true;

    const loadUri = async () => {
      try {
        const mediaUri = await getMediaUri(asset);
        if (isMounted && mediaUri) {
          setUri(mediaUri);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadUri();

    return () => {
      isMounted = false;
    };
    // setUri and setIsLoading are stable from useRecyclingState
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asset]);

  return (
    <TouchableOpacity
      style={{ width: size, height: size, padding: 1 }}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={300}
      activeOpacity={0.7}
    >
      <View className="flex-1 overflow-hidden rounded-sm">
        {uri && !isLoading ? (
          <>
            <Image source={{ uri }} className="flex-1" resizeMode="cover" />

            {isVideo && (
              <>
                <View className="absolute bottom-1 right-1 bg-black/60 px-1.5 py-0.5 rounded">
                  <Text className="text-xs font-medium text-white">
                    {formatDuration(asset.duration)}
                  </Text>
                </View>
                <View className="absolute items-center justify-center w-6 h-6 rounded-full top-1 right-1 bg-black/60">
                  <Text className="text-xs text-white">▶</Text>
                </View>
              </>
            )}
          </>
        ) : (
          <View className="items-center justify-center flex-1 bg-gray-200">
            <ActivityIndicator size="small" color="#999" />
          </View>
        )}

        {isSelected && (
          <View className="absolute inset-0 items-center justify-center bg-blue-500/30">
            <View className="items-center justify-center w-8 h-8 bg-blue-500 rounded-full">
              <Text className="text-lg font-bold text-white">✓</Text>
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

// FlashList handles recycling intelligently, so we use default memo comparison
export const GalleryImage = React.memo(GalleryImageComponent);
