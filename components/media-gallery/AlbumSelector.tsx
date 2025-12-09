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
import { MediaType } from "./types/media-gallery.types";
import { isAssetExcluded, mapMediaTypeToLibraryType } from "./utils/media-gallery.utils";

interface AlbumSelectorProps {
  visible: boolean;
  onClose?: () => void;
  onSelectAlbum: (album: MediaLibrary.Album | null) => void;
  selectedAlbumId?: string;
  /** Type de média autorisé ("photo" | "video" | "all") */
  allowedMediaTypes?: MediaType;
  /** Extensions de fichiers à exclure (ex: ["gif", "webp"]) */
  excludedExtensions?: string[];
}
interface AlbumWithThumbnail extends Album {
  thumbnailUri?: string;
  isVideo?: boolean;
}

export interface AlbumSelectorRef {
  loadAlbums: () => void;
}

export const AlbumSelector = forwardRef<AlbumSelectorRef, AlbumSelectorProps>(
  ({ visible, onClose, onSelectAlbum, selectedAlbumId, allowedMediaTypes = "all", excludedExtensions }, ref) => {
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
        // Déterminer les types de médias à charger
        const mediaTypes = mapMediaTypeToLibraryType(allowedMediaTypes);

        // Fonction pour trouver le premier asset valide (non exclu)
        const findFirstValidAsset = async (
          album?: MediaLibrary.Album,
        ): Promise<MediaLibrary.Asset | null> => {
          let endCursor: string | undefined = undefined;
          let hasNextPage = true;

          while (hasNextPage) {
            const assets = await MediaLibrary.getAssetsAsync({
              album: album || undefined,
              first: 20, // Charger par lots pour trouver un asset valide
              after: endCursor,
              sortBy: [[MediaLibrary.SortBy.modificationTime, false]],
              mediaType: mediaTypes,
            });

            // Trouver le premier asset qui n'est pas exclu
            for (const asset of assets.assets) {
              if (!isAssetExcluded(asset, excludedExtensions)) {
                return asset;
              }
            }

            hasNextPage = assets.hasNextPage;
            endCursor = assets.endCursor;
          }

          return null;
        };

        // Fonction pour compter les assets valides d'un album
        const countValidAssets = async (
          album?: MediaLibrary.Album,
        ): Promise<number> => {
          let count = 0;
          let endCursor: string | undefined = undefined;
          let hasNextPage = true;

          while (hasNextPage) {
            const assets = await MediaLibrary.getAssetsAsync({
              album: album || undefined,
              first: 100,
              after: endCursor,
              sortBy: [[MediaLibrary.SortBy.modificationTime, false]],
              mediaType: mediaTypes,
            });

            for (const asset of assets.assets) {
              if (!isAssetExcluded(asset, excludedExtensions)) {
                count++;
              }
            }

            hasNextPage = assets.hasNextPage;
            endCursor = assets.endCursor;
          }

          return count;
        };

        // Charger le premier média valide pour "Récents"
        const recentAsset = await findFirstValidAsset();

        if (recentAsset) {
          let thumbnailUri = recentAsset.uri;
          let isVideo = false;

          // Sur iOS, les URIs ph:// ne sont pas supportées directement
          // Il faut obtenir l'URI locale pour les photos et vidéos
          try {
            const assetInfo = await MediaLibrary.getAssetInfoAsync(recentAsset);
            if (assetInfo.localUri) {
              thumbnailUri = assetInfo.localUri;
            }
          } catch {
            console.error("Error getting local URI for Récents");
          }

          if (recentAsset.mediaType === MediaLibrary.MediaType.video) {
            isVideo = true;
            try {
              const result = await VideoThumbnails.getThumbnailAsync(
                thumbnailUri,
                { time: 0 },
              );
              thumbnailUri = result.uri;
            } catch {
              console.error("Error generating video thumbnail for Récents");
            }
          }

          setRecentThumbnail({ uri: thumbnailUri, isVideo });
        } else {
          setRecentThumbnail(null);
        }

        const fetchedAlbums = await MediaLibrary.getAlbumsAsync({
          includeSmartAlbums: true,
        });

        // Filtrer l'album "Recents" du système sur iOS pour éviter le doublon
        // car on a déjà notre propre entrée "Récents" (null)
        const filteredSystemAlbums = fetchedAlbums.filter(
          (album) => album.title.toLowerCase() !== "recents",
        );

        // Charger la vignette pour chaque album
        const albumsWithThumbnails = await Promise.all(
          filteredSystemAlbums.map(async (album) => {
            try {
              // Trouver le premier asset valide (non exclu) de l'album
              const firstAsset = await findFirstValidAsset(album);

              if (!firstAsset) {
                // Pas d'asset valide dans cet album après filtrage
                return album;
              }

              // Compter les assets valides pour afficher le bon nombre
              const validAssetCount = await countValidAssets(album);

              let thumbnailUri = firstAsset.uri;
              let isVideo = false;

              // Sur iOS, les URIs ph:// ne sont pas supportées directement
              // Il faut obtenir l'URI locale pour les photos et vidéos
              try {
                const assetInfo = await MediaLibrary.getAssetInfoAsync(firstAsset);
                if (assetInfo.localUri) {
                  thumbnailUri = assetInfo.localUri;
                }
              } catch {
                console.error(`[Album: ${album.title}] Error getting local URI`);
              }

              // Si c'est une vidéo, générer une vignette
              if (firstAsset.mediaType === MediaLibrary.MediaType.video) {
                isVideo = true;
                try {
                  const result = await VideoThumbnails.getThumbnailAsync(
                    thumbnailUri,
                    {
                      time: 0,
                    },
                  );
                  thumbnailUri = result.uri;
                } catch(error) {
                  console.log(error);
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
                assetCount: validAssetCount, // Override avec le compte filtré
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
    }, [allowedMediaTypes, excludedExtensions]);

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
