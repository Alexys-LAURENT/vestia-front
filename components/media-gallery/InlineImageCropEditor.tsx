import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { Dimensions, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { CropConfig } from "./types/media-gallery.types";
import {
  calculateMinScale,
  cropImage,
  getImageDimensions,
} from "./utils/image-crop.utils";

/**
 * Props du composant InlineImageCropEditor
 */
interface InlineImageCropEditorProps {
  /** URI de l'image à cropper */
  imageUri: string;
  /** Configuration du crop (aspectRatio, shape) */
  cropConfig: CropConfig;
  /** Hauteur minimale de la zone de crop. Défaut: 300 */
  height?: number;
}

/**
 * Interface exposée par la ref du composant
 */
export interface InlineImageCropEditorRef {
  /** Retourne une Promise avec l'URI de l'image croppée */
  getCroppedImage: () => Promise<string>;
}

const SCREEN_WIDTH = Dimensions.get("window").width;
const CROP_WIDTH = Math.min(SCREEN_WIDTH - 40, 360); // Zone de crop avec marges
const MAX_IMAGE_DIMENSION = 1000; // Taille max pour normaliser l'image

/**
 * Éditeur de crop d'image inline avec gestes interactifs
 *
 * @description
 * Composant qui permet de cropper une image en utilisant des gestes :
 * - Pan (déplacement) pour positionner l'image
 * - Pinch (zoom) pour ajuster le scale
 *
 * L'image est contrainte pour ne jamais sortir de la zone de crop.
 * Utilise React Native Reanimated pour des animations fluides.
 *
 * @example
 * ```tsx
 * const cropEditorRef = useRef<InlineImageCropEditorRef>(null);
 *
 * <InlineImageCropEditor
 *   ref={cropEditorRef}
 *   imageUri={selectedImage}
 *   cropConfig={{ aspectRatio: 1, shape: "circle" }}
 *   height={300}
 * />
 *
 * const croppedUri = await cropEditorRef.current?.getCroppedImage();
 * ```
 */
export const InlineImageCropEditor = forwardRef<
  InlineImageCropEditorRef,
  InlineImageCropEditorProps
>(({ imageUri, cropConfig, height = 300 }, ref) => {
  // Dimensions normalisées pour l'affichage
  const [displayDimensions, setDisplayDimensions] = useState({
    width: 0,
    height: 0,
  });

  // Ratio entre dimensions naturelles et dimensions d'affichage
  const [dimensionRatio, setDimensionRatio] = useState(1);
  const [isReady, setIsReady] = useState(false);

  // Valeurs animées pour la position et le scale
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  // Dimensions de l'image en shared values pour les worklets
  const imageWidth = useSharedValue(0);
  const imageHeight = useSharedValue(0);

  // Scale minimum en shared value pour les worklets
  const minScaleShared = useSharedValue(1);

  // Valeurs pour le contexte du gesture
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);
  const savedScale = useSharedValue(1);

  // Calculer les dimensions de la zone de crop selon l'aspect ratio
  const cropWidth = CROP_WIDTH;
  const cropHeight =
    cropConfig.aspectRatio !== undefined
      ? cropWidth / cropConfig.aspectRatio
      : height;

  // Charger les dimensions de l'image et les normaliser
  useEffect(() => {
    const loadImage = async () => {
      try {
        const dimensions = await getImageDimensions(imageUri);

        // Normaliser les dimensions pour l'affichage
        // On réduit l'image à une taille raisonnable (max MAX_IMAGE_DIMENSION)
        const maxDim = Math.max(dimensions.width, dimensions.height);
        const ratio =
          maxDim > MAX_IMAGE_DIMENSION ? MAX_IMAGE_DIMENSION / maxDim : 1;

        const displayWidth = dimensions.width * ratio;
        const displayHeight = dimensions.height * ratio;

        setDisplayDimensions({
          width: displayWidth,
          height: displayHeight,
        });
        setDimensionRatio(1 / ratio); // ratio pour reconvertir vers les vraies dimensions

        // Stocker les dimensions dans les shared values
        imageWidth.value = displayWidth;
        imageHeight.value = displayHeight;

        // Calculer le scale minimum avec les dimensions d'affichage
        const minScaleValue = calculateMinScale(
          displayWidth,
          displayHeight,
          cropWidth,
          cropHeight,
        );

        scale.value = minScaleValue;
        savedScale.value = minScaleValue;
        minScaleShared.value = minScaleValue;

        // Position initiale: coin supérieur gauche (0, 0) sans contrainte
        // Les contraintes seront appliquées automatiquement
        translateX.value = 0;
        translateY.value = 0;
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;

        setIsReady(true);
      } catch (error) {
        console.error("Error loading image dimensions:", error);
      }
    };

    loadImage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageUri, cropWidth, cropHeight]);

  // Fonction pour contraindre la position (utilisable depuis les gestures)
  const constrainPositionValues = (
    x: number,
    y: number,
    currentScale: number,
  ) => {
    "worklet";
    if (
      imageWidth.value === 0 ||
      imageHeight.value === 0 ||
      currentScale <= 0
    ) {
      return { x: 0, y: 0 };
    }

    const scaledWidth = imageWidth.value * currentScale;
    const scaledHeight = imageHeight.value * currentScale;

    // Limites pour que l'image couvre toujours la zone de crop
    const minX = cropWidth - scaledWidth;
    const maxX = 0;
    const minY = cropHeight - scaledHeight;
    const maxY = 0;

    return {
      x: Math.max(minX, Math.min(maxX, x)),
      y: Math.max(minY, Math.min(maxY, y)),
    };
  };

  // Gesture de pan (déplacement)
  const panGesture = Gesture.Pan()
    .onStart(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    })
    .onUpdate((event) => {
      if (imageWidth.value === 0) return;

      const newX = savedTranslateX.value + event.translationX;
      const newY = savedTranslateY.value + event.translationY;

      const constrained = constrainPositionValues(newX, newY, scale.value);
      translateX.value = constrained.x;
      translateY.value = constrained.y;
    });

  // Gesture de pinch (zoom)
  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      savedScale.value = scale.value;
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    })
    .onUpdate((event) => {
      "worklet";
      // Vérifications pour éviter les crashs
      if (
        imageWidth.value === 0 ||
        imageHeight.value === 0 ||
        !event.scale ||
        event.scale <= 0 ||
        !isFinite(event.scale)
      ) {
        return;
      }

      // Calculer le nouveau scale directement dans la worklet
      const MAX_SCALE = 5;
      const rawScale = savedScale.value * event.scale;
      const newScale = Math.max(
        minScaleShared.value,
        Math.min(MAX_SCALE, rawScale),
      );

      scale.value = newScale;

      // Ajuster la position pour maintenir l'image dans les limites
      const constrained = constrainPositionValues(
        savedTranslateX.value,
        savedTranslateY.value,
        newScale,
      );
      translateX.value = constrained.x;
      translateY.value = constrained.y;
    });

  // Combiner les gestures
  const composedGesture = Gesture.Simultaneous(panGesture, pinchGesture);

  // Style animé pour l'image
  // En React Native, scale se fait depuis le centre, pas depuis top-left
  // Il faut donc compenser pour simuler transform-origin: top left
  const animatedStyle = useAnimatedStyle(() => {
    // Compensation pour avoir le comportement de transform-origin: top left
    const scaleOffsetX = (imageWidth.value * (scale.value - 1)) / 2;
    const scaleOffsetY = (imageHeight.value * (scale.value - 1)) / 2;

    return {
      transform: [
        { translateX: translateX.value + scaleOffsetX },
        { translateY: translateY.value + scaleOffsetY },
        { scale: scale.value },
      ],
    };
  });

  // Exposer la méthode pour obtenir l'image croppée
  useImperativeHandle(ref, () => ({
    getCroppedImage: async () => {
      try {
        // Convertir les coordonnées d'affichage vers les dimensions naturelles
        // Le scale reste le même (c'est un ratio sans unité)
        const naturalPosition = {
          x: translateX.value * dimensionRatio,
          y: translateY.value * dimensionRatio,
        };

        const croppedUri = await cropImage(
          imageUri,
          naturalPosition,
          scale.value, // Le scale s'applique de la même manière
          cropWidth * dimensionRatio,
          cropHeight * dimensionRatio,
        );
        return croppedUri;
      } catch (error) {
        console.error("Error getting cropped image:", error);
        throw error;
      }
    },
  }));

  if (!isReady) {
    return (
      <View
        className="flex items-center justify-center px-5 py-8 overflow-hidden bg-black"
        style={{ minHeight: height }}
      >
        <View
          className="relative bg-[#1a1a1a] rounded-lg"
          style={{
            width: cropWidth,
            height: cropHeight,
          }}
        />
      </View>
    );
  }

  return (
    <View
      className="flex items-center justify-center px-5 py-8 overflow-hidden bg-black"
      style={{ minHeight: height }}
    >
      <View
        className="relative bg-[#1a1a1a] rounded-lg"
        style={{
          width: cropWidth,
          height: cropHeight,
        }}
      >
        <GestureDetector gesture={composedGesture}>
          <Animated.Image
            source={{ uri: imageUri }}
            className="absolute top-0 left-0"
            style={[
              {
                width: displayDimensions.width,
                height: displayDimensions.height,
              },
              animatedStyle,
            ]}
          />
        </GestureDetector>

        {/* Bordure de la zone de crop */}
        <View
          className={`absolute top-0 left-0 w-full h-full border-2 border-white border-dashed pointer-events-none ${
            cropConfig.shape === "circle" ? "rounded-full" : ""
          }`}
        />
      </View>
    </View>
  );
});

InlineImageCropEditor.displayName = "InlineImageCropEditor";
