import * as MediaLibrary from "expo-media-library";
import { useCallback, useEffect, useRef, useState } from "react";
import { MediaAssetWithUri, MediaType } from "../types/media-gallery.types";
import {
  canAddMoreToSelection,
  enrichAssetWithLocalUri,
  isAssetExcluded,
  mapMediaTypeToLibraryType,
} from "../utils/media-gallery.utils";

/**
 * Props du hook useMediaGallery
 */
interface UseMediaGalleryProps {
  /** Type de média autorisé ("photo" | "video" | "all"). Défaut: "all" */
  allowedMediaTypes?: MediaType;
  /** Active la sélection multiple. Défaut: false */
  allowMultipleSelection?: boolean;
  /** Nombre maximum de sélections (undefined = illimité) */
  maxSelection?: number;
  /** Extensions de fichiers à exclure (ex: ["gif", "webp"]) */
  excludedExtensions?: string[];
}

/**
 * Hook personnalisé pour gérer une galerie de médias
 *
 * @param props - Configuration du hook
 * @returns Objet contenant l'état et les fonctions de gestion de la galerie
 *
 * @description
 * Gère le chargement paginé des médias depuis expo-media-library,
 * la sélection (simple/multiple), les filtres (photo/video/all),
 * et les permissions.
 *
 * @example
 * ```tsx
 * const {
 *   photos,
 *   selectedIds,
 *   toggleSelection,
 *   loadPhotos,
 *   getSelectedAssets
 * } = useMediaGallery({
 *   allowedMediaTypes: "photo",
 *   allowMultipleSelection: true,
 *   maxSelection: 5
 * });
 * ```
 */
export function useMediaGallery({
  allowedMediaTypes = "all",
  allowMultipleSelection = false,
  maxSelection,
  excludedExtensions,
}: UseMediaGalleryProps) {
  const [photos, setPhotos] = useState<MediaLibrary.Asset[]>([]);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [endCursor, setEndCursor] = useState<string | undefined>(undefined);
  const [permission, setPermission] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentFilter, setCurrentFilter] = useState<MediaType>(
    allowedMediaTypes || "all",
  );
  const [selectedAlbum, setSelectedAlbum] = useState<MediaLibrary.Album | null>(
    null,
  );
  const isFirstMount = useRef(true);
  const isFirstAlbumChange = useRef(true);

  // Memoize loadPhotos for FlashList performance
  const loadPhotos = useCallback(
    async (reset: boolean = false) => {
      if ((!hasNextPage && !reset) || isLoading) return;

      setIsLoading(true);
      try {
        const mediaTypes = mapMediaTypeToLibraryType(currentFilter);
        const result = await MediaLibrary.getAssetsAsync({
          first: 30,
          after: reset ? undefined : endCursor,
          mediaType: mediaTypes,
          sortBy: ["modificationTime"],
          album: selectedAlbum || undefined,
        });

        const filteredAssets = result.assets.filter(
          (asset) => !isAssetExcluded(asset, excludedExtensions),
        );

        setPhotos((prev) =>
          reset ? filteredAssets : [...prev, ...filteredAssets],
        );
        setHasNextPage(result.hasNextPage);
        setEndCursor(result.endCursor);
      } catch (error) {
        console.error("Error loading photos:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [
      hasNextPage,
      isLoading,
      currentFilter,
      endCursor,
      excludedExtensions,
      selectedAlbum,
    ],
  );

  const requestPermissionAndLoadPhotos = useCallback(async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    const granted = status === "granted";
    setPermission(granted);
    if (granted) {
      loadPhotos();
    }
  }, [loadPhotos]);

  const resetAndLoadPhotos = useCallback(() => {
    setPhotos([]);
    setEndCursor(undefined);
    setHasNextPage(true);
    loadPhotos(true);
  }, [loadPhotos]);

  // Synchroniser currentFilter avec allowedMediaTypes uniquement quand allowedMediaTypes change
  useEffect(() => {
    if (allowedMediaTypes && allowedMediaTypes !== currentFilter) {
      setCurrentFilter(allowedMediaTypes);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowedMediaTypes]);

  useEffect(() => {
    requestPermissionAndLoadPhotos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    resetAndLoadPhotos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFilter]);

  // Recharger les photos quand l'album change
  useEffect(() => {
    if (isFirstAlbumChange.current) {
      isFirstAlbumChange.current = false;
      return;
    }
    resetAndLoadPhotos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAlbum]);

  const toggleSelection = useCallback(
    (assetId: string) => {
      setSelectedIds((prev) => {
        const newSet = new Set(prev);

        if (newSet.has(assetId)) {
          newSet.delete(assetId);
        } else {
          if (!allowMultipleSelection) {
            newSet.clear();
            newSet.add(assetId);
          } else {
            if (canAddMoreToSelection(newSet.size, maxSelection)) {
              newSet.add(assetId);
            }
          }
        }

        return newSet;
      });
    },
    [allowMultipleSelection, maxSelection],
  );

  const getSelectedAssets = useCallback(async (): Promise<
    MediaAssetWithUri[]
  > => {
    // Récupérer tous les assets sélectionnés depuis la bibliothèque média
    // au lieu de filtrer depuis le tableau photos qui ne contient que le type actuel
    const selectedAssetsPromises = Array.from(selectedIds).map(async (id) => {
      try {
        const asset = await MediaLibrary.getAssetInfoAsync(id);
        return asset;
      } catch (error) {
        console.error(`Error loading asset ${id}:`, error);
        return null;
      }
    });

    const selectedAssets = (await Promise.all(selectedAssetsPromises)).filter(
      (asset): asset is MediaLibrary.Asset => asset !== null,
    );

    const enrichedAssets = await Promise.all(
      selectedAssets.map(enrichAssetWithLocalUri),
    );
    return enrichedAssets;
  }, [selectedIds]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const isSelected = useCallback(
    (assetId: string): boolean => {
      return selectedIds.has(assetId);
    },
    [selectedIds],
  );

  const canChangeFilter = !allowedMediaTypes;

  return {
    photos,
    permission,
    isLoading,
    selectedIds,
    currentFilter,
    hasNextPage,
    loadPhotos,
    toggleSelection,
    getSelectedAssets,
    clearSelection,
    isSelected,
    setCurrentFilter,
    canChangeFilter,
    selectedAlbum,
    setSelectedAlbum,
  };
}
