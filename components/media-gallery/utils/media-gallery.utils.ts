import * as MediaLibrary from "expo-media-library";
import * as VideoThumbnails from "expo-video-thumbnails";
import { MediaAssetWithUri, MediaType } from "../types/media-gallery.types";

// Cache pour les URIs des photos et vidéos
const photoUriCache = new Map<string, string>();
const videoThumbnailCache = new Map<string, string>();

/**
 * Récupère l'URI locale d'un asset média avec mise en cache
 *
 * @param asset - L'asset MediaLibrary dont on veut récupérer l'URI
 * @returns Promise qui se résout avec l'URI locale ou null en cas d'erreur
 *
 * @description
 * Cette fonction utilise un cache pour éviter de charger plusieurs fois la même URI.
 * Elle tente d'abord d'utiliser `getAssetInfoAsync`, puis fallback sur `asset.uri`.
 */
export async function getLocalUri(
  asset: MediaLibrary.Asset,
): Promise<string | null> {
  // Vérifier le cache d'abord
  if (photoUriCache.has(asset.id)) {
    return photoUriCache.get(asset.id)!;
  }

  try {
    const assetInfo = await MediaLibrary.getAssetInfoAsync(asset);
    const uri = assetInfo.localUri || asset.uri;

    // Mettre en cache
    if (uri) {
      photoUriCache.set(asset.id, uri);
    }

    return uri;
  } catch (error) {
    console.warn("Error getting local URI, falling back to asset.uri:", error);
    const uri = asset.uri;

    // Mettre en cache même le fallback
    if (uri) {
      photoUriCache.set(asset.id, uri);
    }

    return uri;
  }
}

/**
 * Génère et récupère le thumbnail d'une vidéo avec mise en cache
 *
 * @param asset - L'asset vidéo dont on veut générer le thumbnail
 * @returns Promise qui se résout avec l'URI du thumbnail ou null en cas d'erreur
 *
 * @description
 * Génère un thumbnail à partir d'une frame à 1 seconde de la vidéo.
 * Le résultat est mis en cache pour éviter de régénérer le thumbnail.
 */
export async function getVideoThumbnail(
  asset: MediaLibrary.Asset,
): Promise<string | null> {
  // Vérifier le cache d'abord
  if (videoThumbnailCache.has(asset.id)) {
    return videoThumbnailCache.get(asset.id)!;
  }

  try {
    let videoUri: string;
    try {
      const assetInfo = await MediaLibrary.getAssetInfoAsync(asset);
      videoUri = assetInfo.localUri || asset.uri;
    } catch (assetInfoError) {
      console.warn(
        "getAssetInfoAsync failed, using asset.uri:",
        assetInfoError,
      );
      videoUri = asset.uri;
    }

    const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, {
      time: 1000, // Prendre une frame à 1 seconde
      quality: 0.5,
    });

    // Mettre en cache
    videoThumbnailCache.set(asset.id, uri);

    return uri;
  } catch (error) {
    console.error("Error generating video thumbnail:", error);
    return asset.uri;
  }
}

/**
 * Récupère l'URI appropriée pour un média (thumbnail pour vidéo, URI locale pour photo)
 *
 * @param asset - L'asset média
 * @returns Promise qui se résout avec l'URI appropriée
 *
 * @description
 * Fonction optimisée qui décide automatiquement quelle URI utiliser :
 * - Pour les vidéos : retourne un thumbnail généré
 * - Pour les photos : retourne l'URI locale
 */
export async function getMediaUri(
  asset: MediaLibrary.Asset,
): Promise<string | null> {
  if (isVideoAsset(asset)) {
    return getVideoThumbnail(asset);
  }
  return getLocalUri(asset);
}

/**
 * Nettoie tous les caches de médias (photos et vidéos)
 *
 * @description
 * Vide les caches d'URIs de photos et de thumbnails de vidéos.
 * Utile pour libérer de la mémoire ou forcer le rechargement des médias.
 */
export function clearMediaCache() {
  photoUriCache.clear();
  videoThumbnailCache.clear();
}

// Backward compatibility
export function clearThumbnailCache() {
  clearMediaCache();
}

/**
 * Convertit un MediaType vers un tableau de MediaLibrary.MediaTypeValue
 *
 * @param mediaType - Type de média ("photo" | "video" | "all")
 * @returns Tableau de types pour l'API MediaLibrary
 *
 * @description
 * Transforme nos types simplifiés en types compatibles avec expo-media-library
 */
export function mapMediaTypeToLibraryType(
  mediaType: MediaType,
): MediaLibrary.MediaTypeValue[] {
  switch (mediaType) {
    case "photo":
      return ["photo"];
    case "video":
      return ["video"];
    case "all":
      return ["photo", "video"];
    default:
      return ["photo", "video"];
  }
}

/**
 * Enrichit un asset avec son URI locale et son type MIME
 *
 * @param asset - L'asset MediaLibrary à enrichir
 * @returns Promise qui se résout avec l'asset enrichi (MediaAssetWithUri)
 *
 * @description
 * Ajoute les champs `localUri` et `mimeType` à un asset MediaLibrary.
 * Cette fonction est utilisée pour préparer les assets avant de les retourner à l'utilisateur.
 */
export async function enrichAssetWithLocalUri(
  asset: MediaLibrary.Asset,
): Promise<MediaAssetWithUri> {
  const localUri = await getLocalUri(asset);
  const mimeType = getMimeTypeFromFilename(asset.filename);
  return {
    ...asset,
    localUri: localUri || undefined,
    mimeType,
  };
}

export function isVideoAsset(asset: MediaLibrary.Asset): boolean {
  return asset.mediaType === "video";
}

export function canAddMoreToSelection(
  currentCount: number,
  maxSelection?: number,
): boolean {
  if (!maxSelection) return true;
  return currentCount < maxSelection;
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function getFileExtension(filename: string): string {
  const parts = filename.toLowerCase().split(".");
  return parts.length > 1 ? parts[parts.length - 1] : "";
}

/**
 * Détermine le type MIME d'un fichier à partir de son extension
 *
 * @param filename - Nom du fichier avec extension
 * @returns Type MIME correspondant (ex: "image/jpeg", "video/mp4")
 *
 * @description
 * Supporte les formats courants d'images et de vidéos.
 * Retourne "application/octet-stream" pour les extensions inconnues.
 */
export function getMimeTypeFromFilename(filename: string): string {
  const extension = getFileExtension(filename);

  // Image types
  const imageTypes: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    bmp: "image/bmp",
    svg: "image/svg+xml",
    heic: "image/heic",
    heif: "image/heif",
  };

  // Video types
  const videoTypes: Record<string, string> = {
    mp4: "video/mp4",
    mov: "video/quicktime",
    avi: "video/x-msvideo",
    wmv: "video/x-ms-wmv",
    flv: "video/x-flv",
    mkv: "video/x-matroska",
    webm: "video/webm",
    m4v: "video/x-m4v",
    "3gp": "video/3gpp",
  };

  return (
    imageTypes[extension] || videoTypes[extension] || "application/octet-stream"
  );
}

export function isAssetExcluded(
  asset: MediaLibrary.Asset,
  excludedExtensions?: string[],
): boolean {
  if (!excludedExtensions || excludedExtensions.length === 0) {
    return false;
  }

  const extension = getFileExtension(asset.filename);
  return excludedExtensions.some(
    (excluded) => excluded.toLowerCase() === extension,
  );
}
