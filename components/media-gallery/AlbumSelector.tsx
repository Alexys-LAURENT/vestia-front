import { useThemeColor } from "@/hooks/use-theme-color";
import { BottomSheetFlashList } from "@gorhom/bottom-sheet";
import type { Album } from "expo-media-library";
import * as MediaLibrary from "expo-media-library";
import * as VideoThumbnails from "expo-video-thumbnails";
import React, {
  forwardRef,
  JSX,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { Dimensions, Image, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface AlbumSelectorProps {
  visible: boolean;
  onClose?: () => void;
  onSelectAlbum: (album: MediaLibrary.Album | null) => void;
  selectedAlbumId?: string;
}
interface AlbumWithThumbnail extends Album {
  thumbnailUri?: string;
  isVideo?: boolean;
}

export interface AlbumSelectorRef {
  loadAlbums: () => void;
}

export const AlbumSelector = forwardRef<AlbumSelectorRef, AlbumSelectorProps>(
  ({ visible, onClose, onSelectAlbum, selectedAlbumId }, ref) => {
    const [albums, setAlbums] = useState<AlbumWithThumbnail[]>([]);
    const [recentThumbnail, setRecentThumbnail] = useState<{
      uri: string;
      isVideo: boolean;
    } | null>(null);
    const insets = useSafeAreaInsets();
    const screenWidth = Dimensions.get("window").width;
    const itemSize = useMemo(() => (screenWidth - 48) / 2, [screenWidth]);
    const background = useThemeColor({}, "background");

    const loadAlbums = useCallback(async () => {
      try {
        // Charger le dernier média pour "Récents"
        const recentAssets = await MediaLibrary.getAssetsAsync({
          first: 1,
          sortBy: [[MediaLibrary.SortBy.modificationTime, false]],
          mediaType: [
            MediaLibrary.MediaType.photo,
            MediaLibrary.MediaType.video,
          ],
        });

        if (recentAssets.assets.length > 0) {
          const recentAsset = recentAssets.assets[0];
          let thumbnailUri = recentAsset.uri;
          let isVideo = false;

          if (recentAsset.mediaType === MediaLibrary.MediaType.video) {
            isVideo = true;
            try {
              const result = await VideoThumbnails.getThumbnailAsync(
                recentAsset.uri,
                { time: 0 },
              );
              thumbnailUri = result.uri;
            } catch {
              console.error("Error generating video thumbnail for Récents");
            }
          }

          setRecentThumbnail({ uri: thumbnailUri, isVideo });
        }

        const fetchedAlbums = await MediaLibrary.getAlbumsAsync({
          includeSmartAlbums: true,
        });

        // Charger la vignette pour chaque album
        const albumsWithThumbnails = await Promise.all(
          fetchedAlbums.map(async (album) => {
            try {
              const assets = await MediaLibrary.getAssetsAsync({
                album,
                first: 1,
                sortBy: [[MediaLibrary.SortBy.modificationTime, false]], // false = descendant
                mediaType: [
                  MediaLibrary.MediaType.photo,
                  MediaLibrary.MediaType.video,
                ],
              });

              const firstAsset = assets.assets[0];

              if (!firstAsset) {
                console.log(`No assets found in album ${album.title}`);
                return album;
              }

              let thumbnailUri = firstAsset.uri;
              let isVideo = false;

              // Si c'est une vidéo, générer une vignette
              if (firstAsset.mediaType === MediaLibrary.MediaType.video) {
                isVideo = true;
                try {
                  const result = await VideoThumbnails.getThumbnailAsync(
                    firstAsset.uri,
                    {
                      time: 0,
                    },
                  );
                  thumbnailUri = result.uri;
                } catch {
                  console.error(
                    `[Album: ${album.title}] Error generating video thumbnail`,
                  );
                  // Keep the original video URI as fallback
                }
              }

              return {
                ...album,
                thumbnailUri,
                isVideo,
              };
            } catch {
              console.error(`Error loading thumbnail for album ${album.id}:`);
              return album;
            }
          }),
        );

        // Filtrer les albums qui n'ont pas de thumbnailUri (pas de photos/vidéos)
        const albumsWithMedia = albumsWithThumbnails.filter(
          (album): album is AlbumWithThumbnail =>
            "thumbnailUri" in album && !!album.thumbnailUri,
        );

        setAlbums(albumsWithMedia);
      } catch {
        console.error("Error loading albums");
      }
    }, []);

    // Load albums on mount
    useEffect(() => {
      loadAlbums();
    }, [loadAlbums]);

    // Expose loadAlbums via ref
    useImperativeHandle(ref, () => ({
      loadAlbums,
    }));

    const handleSelectAlbum = (album: MediaLibrary.Album | null) => {
      onSelectAlbum(album);
      if (onClose) {
        onClose();
      }
    };

    // Grouper les albums en rangées de 2
    const albumRows = useMemo(() => {
      const allAlbums = [null, ...albums];
      const rows: (AlbumWithThumbnail | null)[][] = [];
      for (let i = 0; i < allAlbums.length; i += 2) {
        rows.push(allAlbums.slice(i, i + 2));
      }
      return rows;
    }, [albums]);

    const renderSingleAlbum = (
      item: AlbumWithThumbnail | null,
    ): JSX.Element => {
      if (item === null) {
        // Option "Récents"
        return (
          <TouchableOpacity
            onPress={() => handleSelectAlbum(null)}
            style={{ width: itemSize, margin: 8 }}
            className="items-center"
          >
            <View
              style={{ width: itemSize, height: itemSize }}
              className="mb-2"
            >
              {recentThumbnail ? (
                <>
                  <Image
                    source={{ uri: recentThumbnail.uri }}
                    style={{ width: itemSize, height: itemSize }}
                    className="rounded-lg"
                  />
                  {recentThumbnail.isVideo && (
                    <View className="absolute items-center justify-center w-6 h-6 rounded-full top-1 right-1 bg-black/60">
                      <Text className="text-xs text-white">▶</Text>
                    </View>
                  )}
                </>
              ) : (
                <View
                  style={{ width: itemSize, height: itemSize }}
                  className="items-center justify-center bg-gray-200 rounded-lg dark:bg-gray-800"
                >
                  <Text className="text-4xl">📷</Text>
                </View>
              )}
            </View>
            <Text
              className="text-sm font-medium text-center text-gray-900 dark:text-white"
              numberOfLines={2}
            >
              Récents
            </Text>
            {!selectedAlbumId && (
              <View className="absolute items-center justify-center w-6 h-6 bg-blue-500 rounded-full top-2 right-2">
                <Text className="text-xs text-white">✓</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      }

      return (
        <TouchableOpacity
          onPress={() => handleSelectAlbum(item)}
          style={{ width: itemSize, margin: 8 }}
          className="items-center"
        >
          <View style={{ width: itemSize, height: itemSize }} className="mb-2">
            {item.thumbnailUri ? (
              <>
                <Image
                  source={{ uri: item.thumbnailUri }}
                  style={{ width: itemSize, height: itemSize }}
                  className="rounded-lg"
                />
                {item.isVideo && (
                  <View className="absolute inset-0 items-center justify-center">
                    <View className="absolute items-center justify-center w-6 h-6 rounded-full top-1 right-1 bg-black/60">
                      <Text className="text-xs text-white">▶</Text>
                    </View>
                  </View>
                )}
              </>
            ) : (
              <View
                style={{ width: itemSize, height: itemSize }}
                className="items-center justify-center bg-gray-200 rounded-lg dark:bg-gray-800"
              >
                <Text className="text-4xl">📁</Text>
              </View>
            )}
          </View>
          <Text
            className="text-sm font-medium text-center text-gray-900 dark:text-white"
            numberOfLines={2}
          >
            {item.title}
          </Text>
          <Text className="text-xs text-center text-gray-500 dark:text-gray-400">
            {item.assetCount}
          </Text>
          {selectedAlbumId === item.id && (
            <View className="absolute items-center justify-center w-6 h-6 bg-blue-500 rounded-full top-2 right-2">
              <Text className="text-xs text-white">✓</Text>
            </View>
          )}
        </TouchableOpacity>
      );
    };

    const renderRow = ({
      item,
    }: {
      item: (AlbumWithThumbnail | null)[];
    }): JSX.Element => {
      return (
        <View className="flex-row">
          {item.map((album, index) => (
            <View key={album?.id || `empty-${index}`}>
              {renderSingleAlbum(album)}
            </View>
          ))}
        </View>
      );
    };

    if (!visible) {
      return <View style={{ display: "none" }} />;
    }

    return (
      <BottomSheetFlashList
        data={albumRows}
        renderItem={renderRow}
        keyExtractor={(item: (AlbumWithThumbnail | null)[], index: number) =>
          `row-${index}-${item.map((a) => a?.id || "null").join("-")}`
        }
        estimatedItemSize={itemSize + 50}
        contentContainerStyle={{
          paddingBottom: insets.bottom,
          paddingHorizontal: 8,
        }}
        style={{
          backgroundColor: background,
        }}
      />
    );
  },
);

AlbumSelector.displayName = "AlbumSelector";
