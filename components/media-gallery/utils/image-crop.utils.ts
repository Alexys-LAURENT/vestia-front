import * as ImageManipulator from "expo-image-manipulator";
import { Image } from "react-native";

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface CropRegion {
  originX: number;
  originY: number;
  width: number;
  height: number;
}

/**
 * Calcule le scale minimum pour que l'image couvre entièrement la zone de crop
 *
 * @param imageWidth - Largeur de l'image
 * @param imageHeight - Hauteur de l'image
 * @param cropWidth - Largeur de la zone de crop
 * @param cropHeight - Hauteur de la zone de crop
 * @returns Le scale minimum (toujours >= 1)
 *
 * @description
 * Retourne le ratio le plus grand entre cropWidth/imageWidth et cropHeight/imageHeight
 * pour garantir que l'image couvre toujours toute la zone de crop.
 */
export function calculateMinScale(
  imageWidth: number,
  imageHeight: number,
  cropWidth: number,
  cropHeight: number,
): number {
  const scaleX = cropWidth / imageWidth;
  const scaleY = cropHeight / imageHeight;
  return Math.max(scaleX, scaleY);
}

/**
 * Contraint la position pour que l'image ne sorte jamais de la zone de crop
 * Garantit que les bords de l'image sont toujours au maximum coll�s aux bords de la zone
 */
export function constrainPosition(
  x: number,
  y: number,
  scale: number,
  imageWidth: number,
  imageHeight: number,
  cropWidth: number,
  cropHeight: number,
): Position {
  // Taille de l'image apr�s scaling
  const scaledWidth = imageWidth * scale;
  const scaledHeight = imageHeight * scale;

  // Limites pour que l'image couvre toujours la zone de crop
  // minX/minY sont n�gatifs si l'image est plus grande que la zone
  // maxX/maxY sont toujours 0 (l'image commence au bord gauche/haut)
  const minX = cropWidth - scaledWidth;
  const maxX = 0;
  const minY = cropHeight - scaledHeight;
  const maxY = 0;

  return {
    x: Math.max(minX, Math.min(maxX, x)),
    y: Math.max(minY, Math.min(maxY, y)),
  };
}

/**
 * Calcule la r�gion � cropper dans l'image originale en fonction
 * du scale et de la position actuels
 */
export function calculateCropRegion(
  position: Position,
  scale: number,
  imageWidth: number,
  imageHeight: number,
  cropWidth: number,
  cropHeight: number,
): CropRegion {
  // La position est n�gative quand on a scroll� vers le bas/droite
  // On doit convertir cette position en coordonn�es de l'image originale
  const originX = -position.x / scale;
  const originY = -position.y / scale;

  // Taille de la zone de crop dans les coordonn�es de l'image originale
  const width = cropWidth / scale;
  const height = cropHeight / scale;

  return {
    originX: Math.max(0, originX),
    originY: Math.max(0, originY),
    width: Math.min(width, imageWidth - originX),
    height: Math.min(height, imageHeight - originY),
  };
}

/**
 * Obtient les dimensions d'une image � partir de son URI
 */
export function getImageDimensions(uri: string): Promise<ImageDimensions> {
  return new Promise((resolve, reject) => {
    Image.getSize(
      uri,
      (width, height) => {
        resolve({ width, height });
      },
      (error) => {
        reject(error);
      },
    );
  });
}

/**
 * Croppe une image selon la position et le scale actuels
 *
 * @param imageUri - URI de l'image à cropper
 * @param position - Position de l'image {x, y}
 * @param scale - Scale appliqué à l'image
 * @param cropWidth - Largeur de la zone de crop
 * @param cropHeight - Hauteur de la zone de crop
 * @returns Promise qui se résout avec l'URI de l'image croppée
 *
 * @description
 * Utilise expo-image-manipulator pour extraire la portion visible de l'image.
 * L'image résultante est au format JPEG avec les dimensions de la zone de crop.
 *
 * @throws {Error} Si le crop échoue ou si les dimensions sont invalides
 */
export async function cropImage(
  imageUri: string,
  position: Position,
  scale: number,
  cropWidth: number,
  cropHeight: number,
): Promise<string> {
  try {
    // Obtenir les dimensions de l'image originale
    const { width: imageWidth, height: imageHeight } =
      await getImageDimensions(imageUri);

    // Calculer la r�gion � cropper
    const cropRegion = calculateCropRegion(
      position,
      scale,
      imageWidth,
      imageHeight,
      cropWidth,
      cropHeight,
    );

    // Utiliser expo-image-manipulator pour cropper
    const manipResult = await ImageManipulator.manipulateAsync(imageUri, [
      {
        crop: {
          originX: cropRegion.originX,
          originY: cropRegion.originY,
          width: cropRegion.width,
          height: cropRegion.height,
        },
      },
      {
        resize: {
          width: Math.round(cropRegion.width),
          height: Math.round(cropRegion.height),
        },
      },
    ]);

    return manipResult.uri;
  } catch (error) {
    console.error("Error cropping image:", error);
    throw error;
  }
}

/**
 * Calcule le scale � appliquer lors d'un pinch gesture
 */
export function calculateNewScale(
  currentScale: number,
  pinchScale: number,
  minScale: number,
  maxScale: number = 5,
): number {
  const newScale = currentScale * pinchScale;
  return Math.max(minScale, Math.min(maxScale, newScale));
}
