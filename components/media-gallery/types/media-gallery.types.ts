import { Asset } from "expo-media-library";

export type MediaType = "photo" | "video" | "all";
export type CropShape = "rectangle" | "circle";

export interface CropConfig {
  aspectRatio: number; // Ex: 1 pour carré, 16/9, 4/3, etc.
  shape: CropShape;
}

export interface MediaAssetWithUri extends Asset {
  localUri?: string;
  croppedUri?: string; // URI de l'image croppée si edit activé
  mimeType?: string; // Type MIME du fichier (ex: image/jpeg, video/mp4)
}

export interface ImageGallerySheetProps {
  isOpen: boolean;
  onClose: () => void;
  onValidateSelection: (media: MediaAssetWithUri[]) => void;
  stackBehavior?: "push" | "replace" | "switch" | undefined;
  allowedMediaTypes?: MediaType;
  allowMultipleSelection?: boolean;
  maxSelection?: number;
  excludedExtensions?: string[];
  enableCrop?: boolean;
  cropConfig?: CropConfig;
  cropHeight?: number;
}

export interface GalleryHeaderProps {
  currentFilter: MediaType;
  onFilterChange: (filter: MediaType) => void;
  onClose: () => void;
  onValidate: () => void;
  selectedCount: number;
  isValidateDisabled: boolean;
  canShowFilters: boolean;
  onOpenAlbumSelector?: () => void;
  selectedAlbumTitle?: string;
  isAlbumSelectorOpen?: boolean;
}

export interface SelectionCounterProps {
  selectedCount: number;
  maxSelection?: number;
}

export interface ValidateButtonProps {
  selectedCount: number;
  onValidate: () => void;
  disabled: boolean;
}

export interface GalleryImageProps {
  asset: Asset;
  size: number;
  onPress: () => void;
  onLongPress?: () => void;
  isSelected: boolean;
  showVideoIndicator?: boolean;
}

export interface ImageCropEditorProps {
  imageUri: string;
  cropConfig: CropConfig;
  onCancel: () => void;
  onSave: (croppedUri: string) => void;
}

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}
