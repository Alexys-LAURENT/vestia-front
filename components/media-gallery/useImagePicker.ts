import { useContext } from "react";
import { ImagePickerContext } from "./ImagePickerProvider";

/**
 * Hook pour utiliser le picker d'images global
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { pick } = useImagePicker();
 *
 *   const handlePickImage = async () => {
 *     const medias = await pick({
 *       allowedMediaTypes: "photo",
 *       enableCrop: true,
 *       cropConfig: { aspectRatio: 1, shape: "circle" }
 *     });
 *
 *     if (medias) {
 *       console.log("Selected medias:", medias);
 *     } else {
 *       console.log("User cancelled");
 *     }
 *   };
 *
 *   return <Button onPress={handlePickImage}>Pick Image</Button>;
 * }
 * ```
 */
export function useImagePicker() {
  const context = useContext(ImagePickerContext);

  if (!context) {
    throw new Error("useImagePicker must be used within ImagePickerProvider");
  }

  return context;
}
