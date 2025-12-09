import * as MediaLibrary from "expo-media-library";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  BackHandler,
  Dimensions,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AlbumSelector } from "@/components/media-gallery/AlbumSelector";
import { CropFramePlaceholder } from "@/components/media-gallery/CropFramePlaceholder";
import { EmptyState } from "@/components/media-gallery/EmptyState";
import { GalleryHeader } from "@/components/media-gallery/GalleryHeader";
import { GalleryImage } from "@/components/media-gallery/GalleryImage";
import { useMediaGallery } from "@/components/media-gallery/hooks/useMediaGallery";
import {
  InlineImageCropEditor,
  InlineImageCropEditorRef,
} from "@/components/media-gallery/InlineImageCropEditor";
import { MediaPreviewModal } from "@/components/media-gallery/MediaPreviewModal";
import { SelectionCounter } from "@/components/media-gallery/SelectionCounter";
import { BottomSheetFlashList } from "@gorhom/bottom-sheet";
import { Sheet, useSheetRef } from "../sheets/Sheet";
import { ImageGallerySheetProps } from "./types/media-gallery.types";
import { getLocalUri } from "./utils/media-gallery.utils";

/**
 * Composant principal de la galerie d'images dans une Bottom Sheet
 *
 * @description
 * Affiche une grille d'images/vidéos depuis la bibliothèque média de l'appareil.
 * Supporte la sélection simple/multiple, le filtrage par type de média,
 * et le crop d'images inline.
 *
 * @param props - Props du composant
 * @param props.isOpen - État d'ouverture de la sheet
 * @param props.onClose - Callback appelé lors de la fermeture
 * @param props.onValidateSelection - Callback appelé lors de la validation avec les médias sélectionnés
 * @param props.allowedMediaTypes - Type de média autorisé ("photo" | "video" | "all")
 * @param props.allowMultipleSelection - Active la sélection multiple
 * @param props.maxSelection - Nombre maximum de sélections
 * @param props.excludedExtensions - Extensions de fichiers à exclure
 * @param props.enableCrop - Active le mode crop
 * @param props.cropConfig - Configuration du crop (aspectRatio, shape)
 * @param props.cropHeight - Hauteur de la zone de crop
 */
export function ImageGallerySheet({
  isOpen,
  onClose,
  onValidateSelection,
  allowedMediaTypes,
  allowMultipleSelection = false,
  maxSelection,
  excludedExtensions,
  enableCrop = false,
  cropConfig = { aspectRatio: 1, shape: "rectangle" },
  cropHeight = 300,
  stackBehavior,
}: ImageGallerySheetProps) {
  const sheetRef = useSheetRef();
  const cropEditorRef = useRef<InlineImageCropEditorRef>(null);
  const insets = useSafeAreaInsets();
  const screenWidth = Dimensions.get("window").width;
  const imageSize = useMemo(() => (screenWidth - 8) / 3, [screenWidth]);

  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [previewAsset, setPreviewAsset] = useState<MediaLibrary.Asset | null>(
    null,
  );
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [isAlbumSelectorVisible, setIsAlbumSelectorVisible] = useState(false);
  const albumSelectorRef = useRef<{ loadAlbums: () => void }>(null);

  const {
    photos,
    permission,
    isLoading,
    selectedIds,
    currentFilter,
    loadPhotos,
    toggleSelection,
    getSelectedAssets,
    clearSelection,
    isSelected,
    setCurrentFilter,
    selectedAlbum,
    setSelectedAlbum,
  } = useMediaGallery({
    allowedMediaTypes,
    allowMultipleSelection,
    maxSelection,
    excludedExtensions,
  });

  const selectedArray = Array.from(selectedIds);
  const selectedAssetId = selectedArray.length > 0 ? selectedArray[0] : null;

  // Charger l'URI de l'image sélectionnée pour le crop
  useEffect(() => {
    const loadSelectedImage = async () => {
      if (enableCrop && selectedAssetId && !allowMultipleSelection) {
        const asset = photos.find((p) => p.id === selectedAssetId);
        if (asset) {
          const uri = await getLocalUri(asset);
          setSelectedImageUri(uri);
        }
      } else {
        setSelectedImageUri(null);
      }
    };

    loadSelectedImage();
  }, [selectedAssetId, enableCrop, allowMultipleSelection, photos]);

  React.useEffect(() => {
    if (isOpen) {
      sheetRef.current?.present();
      // Preload albums when sheet opens
      albumSelectorRef.current?.loadAlbums();
      // Reset to "Récents" on open
      setSelectedAlbum(null);
    } else {
      sheetRef.current?.dismiss();
    }
  }, [isOpen, sheetRef, setSelectedAlbum]);

  const handleClose = useCallback(() => {
    sheetRef.current?.dismiss();
    clearSelection();
    setSelectedImageUri(null);
    setIsAlbumSelectorVisible(false); // Reset album selector visibility
    onClose();
  }, [clearSelection, onClose, sheetRef]);

  // Gérer le bouton retour natif Android
  useEffect(() => {
    if (!isOpen) return;

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        handleClose();
        return true; // Empêche le comportement par défaut
      },
    );

    return () => backHandler.remove();
  }, [isOpen, handleClose]);

  const handleValidate = useCallback(async () => {
    if (
      enableCrop &&
      selectedImageUri &&
      cropEditorRef.current &&
      !allowMultipleSelection
    ) {
      // Mode crop: récupérer l'image croppée
      try {
        const croppedUri = await cropEditorRef.current.getCroppedImage();
        const selectedAssets = await getSelectedAssets();

        if (selectedAssets.length > 0) {
          const assetWithCrop = {
            ...selectedAssets[0],
            croppedUri,
            uri: croppedUri,
            localUri: croppedUri,
            mimeType: "image/jpeg", // expo-image-manipulator outputs JPEG by default
          };
          onValidateSelection([assetWithCrop]);
          handleClose();
        }
      } catch (error) {
        console.error("Error getting cropped image:", error);
      }
    } else {
      // Mode normal: retourner les assets sélectionnés
      const selectedAssets = await getSelectedAssets();

      if (selectedAssets.length > 0) {
        if (allowMultipleSelection) {
          onValidateSelection(selectedAssets);
        } else {
          onValidateSelection([selectedAssets[0]]);
        }
        handleClose();
      }
    }
  }, [
    enableCrop,
    selectedImageUri,
    allowMultipleSelection,
    getSelectedAssets,
    onValidateSelection,
    handleClose,
  ]);

  const handleToggleSelection = useCallback(
    (id: string) => {
      toggleSelection(id);
    },
    [toggleSelection],
  );

  const handleLongPress = useCallback((asset: MediaLibrary.Asset) => {
    console.log("Long press detected on asset:", asset.id);
    setPreviewAsset(asset);
    setIsPreviewVisible(true);
    console.log("Modal should be visible now");
  }, []);

  const handleClosePreview = useCallback(() => {
    setIsPreviewVisible(false);
    setPreviewAsset(null);
  }, []);

  const handleOpenAlbumSelector = useCallback(() => {
    setIsAlbumSelectorVisible((prev) => !prev);
  }, []);

  const handleSelectAlbum = useCallback(
    (album: MediaLibrary.Album | null) => {
      setSelectedAlbum(album);
      setIsAlbumSelectorVisible(false);
    },
    [setSelectedAlbum],
  );

  const renderItem = useCallback(
    ({ item }: { item: MediaLibrary.Asset }) => (
      <GalleryImage
        asset={item}
        size={imageSize}
        onPress={() => handleToggleSelection(item.id)}
        onLongPress={() => handleLongPress(item)}
        isSelected={isSelected(item.id)}
      />
    ),
    [imageSize, handleToggleSelection, handleLongPress, isSelected],
  );

  const renderFooter = useCallback(() => {
    if (!isLoading) return null;
    return (
      <View className="items-center py-5">
        <ActivityIndicator size="small" />
      </View>
    );
  }, [isLoading]);

  // Memoize FlashList props for optimal performance (FlashList v2 requirement)
  const keyExtractor = useCallback((item: MediaLibrary.Asset) => item.id, []);

  const contentContainerStyle = useMemo(() => ({ padding: 2 }), []);

  const canShowFilters =
    (!allowedMediaTypes || allowedMediaTypes === "all") && !enableCrop;

  return (
    <>
      <Sheet
        ref={sheetRef}
        onDismiss={handleClose}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        enableDismissOnClose
        snapPoints={["70%", "100%"]}
        enableDynamicSizing={false}
        handleStyle={{ height: 0 }}
        handleIndicatorStyle={{ width: 50, height: 4, backgroundColor: "#ccc" }}
        enableOverDrag={false}
        topInset={insets.top}
        stackBehavior={stackBehavior}
      >
        <GalleryHeader
          currentFilter={currentFilter}
          onFilterChange={setCurrentFilter}
          onClose={handleClose}
          onValidate={handleValidate}
          selectedCount={selectedIds.size}
          isValidateDisabled={selectedIds.size === 0}
          canShowFilters={canShowFilters && !isAlbumSelectorVisible}
          onOpenAlbumSelector={handleOpenAlbumSelector}
          selectedAlbumTitle={selectedAlbum?.title}
          isAlbumSelectorOpen={isAlbumSelectorVisible}
        />

        {permission === null && (
          <View className="items-center justify-center flex-1 p-5">
            <ActivityIndicator size="large" />
          </View>
        )}

        {permission === false && (
          <View className="items-center justify-center flex-1 p-5">
            <Text className="mb-2 text-base font-semibold text-center">
              Permission d&apos;accès aux photos refusée
            </Text>
            <Text className="text-sm text-center text-gray-600">
              Veuillez autoriser l&apos;accès dans les paramètres
            </Text>
          </View>
        )}

        {permission === true && (
          <View className="flex-1">
            {allowMultipleSelection && (
              <SelectionCounter
                selectedCount={selectedIds.size}
                maxSelection={maxSelection}
              />
            )}

            {/* Cadrant de crop (toujours visible quand enableCrop est activé) */}
            {enableCrop && !allowMultipleSelection && (
              <>
                {selectedImageUri ? (
                  <InlineImageCropEditor
                    ref={cropEditorRef}
                    imageUri={selectedImageUri}
                    cropConfig={cropConfig}
                    height={cropHeight}
                  />
                ) : (
                  <CropFramePlaceholder height={cropHeight} />
                )}
              </>
            )}

            {/* Always render AlbumSelector to allow ref access */}
            <AlbumSelector
              ref={albumSelectorRef}
              visible={isAlbumSelectorVisible}
              onSelectAlbum={handleSelectAlbum}
              selectedAlbumId={selectedAlbum?.id}
            />

            {!isAlbumSelectorVisible &&
              (photos.length === 0 && !isLoading ? (
                <EmptyState currentFilter={currentFilter} />
              ) : (
                <BottomSheetFlashList
                  data={photos}
                  renderItem={renderItem}
                  keyExtractor={keyExtractor}
                  numColumns={3}
                  onEndReached={loadPhotos}
                  onEndReachedThreshold={0.5}
                  ListFooterComponent={renderFooter}
                  contentContainerStyle={contentContainerStyle}
                  estimatedItemSize={imageSize}
                  drawDistance={800}
                />
              ))}
          </View>
        )}
      </Sheet>

      <MediaPreviewModal
        asset={previewAsset}
        visible={isPreviewVisible}
        onClose={handleClosePreview}
      />
    </>
  );
}
