import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { ImageGallerySheet } from "./ImageGallerySheet";
import {
  CropConfig,
  MediaAssetWithUri,
  MediaType,
} from "./types/media-gallery.types";

/**
 * Configuration du picker d'images
 */
export interface ImagePickerConfig {
  /** Type de média autorisé ("photo" | "video" | "all"). Défaut: "all" */
  allowedMediaTypes?: MediaType;
  /** Active la sélection multiple. Défaut: false */
  allowMultipleSelection?: boolean;
  /** Nombre maximum de sélections (undefined = illimité) */
  maxSelection?: number;
  /** Extensions de fichiers à exclure (ex: ["gif", "webp"]) */
  excludedExtensions?: string[];
  /** Active le mode crop (nécessite allowMultipleSelection: false). Défaut: false */
  enableCrop?: boolean;
  /** Configuration du crop (aspectRatio, shape) */
  cropConfig?: CropConfig;
  /** Hauteur de la zone de crop en pixels. Défaut: 300 */
  cropHeight?: number;
  /** Comportement de la pile de navigation dans la sheet */
  stackBehavior?: "push" | "replace" | "switch" | undefined;
}

/**
 * Valeur du contexte du picker d'images
 */
interface ImagePickerContextValue {
  /** Fonction pour ouvrir le picker et sélectionner des médias */
  pick: (config?: ImagePickerConfig) => Promise<MediaAssetWithUri[] | null>;
  /** État d'ouverture de la sheet */
  isOpen: boolean;
  /** Configuration actuelle du picker */
  config: ImagePickerConfig;
  /** Callback pour fermer la sheet */
  handleClose: () => void;
  /** Callback pour valider la sélection */
  handleValidate: (medias: MediaAssetWithUri[]) => void;
}

/**
 * Contexte du picker d'images global
 */
export const ImagePickerContext = createContext<
  ImagePickerContextValue | undefined
>(undefined);

interface ImagePickerProviderProps {
  children: React.ReactNode;
}

/**
 * Provider qui gère l'état et la logique du picker d'images
 *
 * @description
 * Ce provider doit être placé au-dessus de BottomSheetModalProvider dans l'arbre des composants.
 * Il gère l'état global du picker (ouvert/fermé) et les promesses de sélection.
 *
 * @example
 * ```tsx
 * <ImagePickerProvider>
 *   <BottomSheetModalProvider>
 *     <App />
 *     <ImagePickerSheetRenderer />
 *   </BottomSheetModalProvider>
 * </ImagePickerProvider>
 * ```
 *
 * @param props - Props du provider
 * @param props.children - Composants enfants
 */
export function ImagePickerProvider({ children }: ImagePickerProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<ImagePickerConfig>({});

  // Refs pour gérer les Promises
  const resolveRef = useRef<
    ((value: MediaAssetWithUri[] | null) => void) | null
  >(null);
  const rejectRef = useRef<((reason?: any) => void) | null>(null);

  /**
   * Ouvre le picker d'images et retourne une Promise avec les médias sélectionnés
   *
   * @param pickerConfig - Configuration du picker (optionnel)
   * @returns Promise qui se résout avec les médias sélectionnés ou null si annulé
   *
   * @example
   * ```tsx
   * const medias = await pick({
   *   allowedMediaTypes: "photo",
   *   enableCrop: true,
   *   cropConfig: { aspectRatio: 1, shape: "circle" }
   * });
   * ```
   */
  const pick = useCallback((pickerConfig: ImagePickerConfig = {}) => {
    return new Promise<MediaAssetWithUri[] | null>((resolve, reject) => {
      // Stocker les callbacks
      resolveRef.current = resolve;
      rejectRef.current = reject;

      // Configurer et ouvrir la Sheet
      setConfig(pickerConfig);
      setIsOpen(true);
    });
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    // Résoudre avec null quand l'utilisateur annule
    if (resolveRef.current) {
      resolveRef.current(null);
      resolveRef.current = null;
      rejectRef.current = null;
    }
  }, []);

  const handleValidate = useCallback((medias: MediaAssetWithUri[]) => {
    setIsOpen(false);
    // Résoudre avec les médias sélectionnés
    if (resolveRef.current) {
      resolveRef.current(medias);
      resolveRef.current = null;
      rejectRef.current = null;
    }
  }, []);

  return (
    <ImagePickerContext.Provider
      value={{ pick, isOpen, config, handleClose, handleValidate }}
    >
      {children}
    </ImagePickerContext.Provider>
  );
}

/**
 * Composant qui rend la Bottom Sheet du picker d'images
 *
 * @description
 * Ce composant doit être placé à l'intérieur de BottomSheetModalProvider
 * pour avoir accès au contexte BottomSheet. Il consomme le contexte ImagePickerContext
 * et affiche la sheet quand isOpen est true.
 *
 * @example
 * ```tsx
 * <ImagePickerProvider>
 *   <BottomSheetModalProvider>
 *     <App />
 *     <ImagePickerSheetRenderer />
 *   </BottomSheetModalProvider>
 * </ImagePickerProvider>
 * ```
 *
 * @throws {Error} Si utilisé en dehors de ImagePickerProvider
 */
export function ImagePickerSheetRenderer() {
  const context = useContext(ImagePickerContext);

  if (!context) {
    throw new Error(
      "ImagePickerSheetRenderer must be used within ImagePickerProvider",
    );
  }

  const { isOpen, config, handleClose, handleValidate } = context;

  return (
    <ImageGallerySheet
      isOpen={isOpen}
      onClose={handleClose}
      onValidateSelection={handleValidate}
      allowedMediaTypes={config.allowedMediaTypes || "all"}
      allowMultipleSelection={config.allowMultipleSelection}
      maxSelection={config.maxSelection}
      excludedExtensions={config.excludedExtensions}
      enableCrop={config.enableCrop}
      cropConfig={config.cropConfig}
      cropHeight={config.cropHeight}
      stackBehavior={config.stackBehavior}
    />
  );
}
