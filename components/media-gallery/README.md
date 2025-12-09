# Media Gallery Component

Composant de galerie média complet pour React Native avec support de la sélection multiple, du crop d'images, et du filtrage par type de média.

## Table des matières

- [Installation](#installation)
- [Configuration](#configuration)
- [Utilisation](#utilisation)
- [Architecture](#architecture)
- [API](#api)
- [Exemples](#exemples)

## Installation

Le composant utilise les dépendances suivantes :

```bash
npm install expo-media-library expo-image-manipulator expo-video-thumbnails
npm install @gorhom/bottom-sheet react-native-gesture-handler react-native-reanimated
npm install @shopify/flash-list
```

## Configuration

### 1. Configuration du Provider

Le composant nécessite une hiérarchie spécifique de providers dans votre app :

```tsx
// app/_layout.tsx
import {
  ImagePickerProvider,
  ImagePickerSheetRenderer,
} from "@/components/media-gallery";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";

export default function RootLayout() {
  return (
    <ImagePickerProvider>
      {" "}
      {/* 1. Provider de contexte */}
      <BottomSheetModalProvider>
        {" "}
        {/* 2. Provider de BottomSheet */}
        {/* Votre app */}
        <YourApp />
        {/* 3. Renderer de la sheet (doit être dans BottomSheetModalProvider) */}
        <ImagePickerSheetRenderer />
      </BottomSheetModalProvider>
    </ImagePickerProvider>
  );
}
```

### 2. Permissions

Ajoutez les permissions nécessaires dans votre `app.json` :

```json
{
  "expo": {
    "plugins": [
      [
        "expo-media-library",
        {
          "photosPermission": "Allow $(PRODUCT_NAME) to access your photos.",
          "savePhotosPermission": "Allow $(PRODUCT_NAME) to save photos."
        }
      ]
    ]
  }
}
```

## Utilisation

### Utilisation basique

```tsx
import { useImagePicker } from "@/components/media-gallery";

function MyComponent() {
  const { pick } = useImagePicker();

  const handlePickImage = async () => {
    const medias = await pick({
      allowedMediaTypes: "photo",
      allowMultipleSelection: false,
    });

    if (medias) {
      console.log("Selected:", medias[0].uri);
    }
  };

  return <Button onPress={handlePickImage}>Choisir une image</Button>;
}
```

### Sélection d'albums

La galerie inclut un sélecteur d'albums natif :

- Cliquez sur le nom de l'album dans le header pour ouvrir le sélecteur
- Les albums sont affichés sous forme de grille avec leur dernière photo/vidéo
- Les vignettes des vidéos sont générées automatiquement avec `expo-video-thumbnails`
- L'option "Récents" permet de voir tous les médias de l'appareil
- Le sélecteur est préchargé à l'ouverture de la galerie pour une navigation fluide

### Prévisualisation des médias

La galerie inclut une fonctionnalité de prévisualisation en plein écran :

- **Long press** (maintenir appuyé pendant 500ms) sur une image ou vidéo pour l'ouvrir en grand
- Les images s'affichent en mode `contain` pour voir le média en entier
- Les vidéos sont lues automatiquement avec les contrôles natifs
- Appuyez n'importe où ou sur le bouton ✕ pour fermer

### Sélection multiple avec limite

```tsx
const handlePickMultiple = async () => {
  const medias = await pick({
    allowedMediaTypes: "all",
    allowMultipleSelection: true,
    maxSelection: 5,
  });

  if (medias) {
    console.log(`${medias.length} médias sélectionnés`);
  }
};
```

### Crop d'image avec ratio personnalisé

```tsx
const handlePickAvatar = async () => {
  const medias = await pick({
    allowedMediaTypes: "photo",
    enableCrop: true,
    cropConfig: {
      aspectRatio: 1, // Ratio 1:1 (carré)
      shape: "circle", // Forme circulaire
    },
    cropHeight: 300, // Hauteur de la zone de crop
  });

  if (medias) {
    // L'image croppée est disponible dans croppedUri
    console.log("Image croppée:", medias[0].croppedUri);
  }
};
```

### Crop pour bannière

```tsx
const handlePickBanner = async () => {
  const medias = await pick({
    allowedMediaTypes: "photo",
    enableCrop: true,
    cropConfig: {
      aspectRatio: 29 / 9, // Ratio bannière
      shape: "rectangle",
    },
    cropHeight: 250,
  });
};
```

### Exclure certaines extensions

```tsx
const handlePickImage = async () => {
  const medias = await pick({
    allowedMediaTypes: "all",
    excludedExtensions: ["gif", "webp"],
  });
};
```

## Architecture

### Structure des fichiers

```
components/media-gallery/
├── README.md                           # Documentation
├── index.ts                            # Point d'entrée avec exports
│
├── ImagePickerProvider.tsx             # Provider global et renderer
├── useImagePicker.ts                   # Hook pour utiliser le picker
├── ImageGallerySheet.tsx               # Composant principal (Bottom Sheet)
│
├── InlineImageCropEditor.tsx           # Éditeur de crop inline
├── GalleryHeader.tsx                   # Header avec filtres et actions
├── GalleryImage.tsx                    # Item de la grille d'images
├── AlbumSelector.tsx                   # Sélecteur d'albums
├── SelectionCounter.tsx                # Compteur de sélection
├── EmptyState.tsx                      # État vide
├── CropFramePlaceholder.tsx            # Placeholder pour le crop
├── MediaPreviewModal.tsx               # Modal de prévisualisation
│
├── hooks/
│   └── useMediaGallery.ts             # Hook de gestion de la galerie
│
├── utils/
│   ├── media-gallery.utils.ts         # Utilitaires pour la galerie
│   └── image-crop.utils.ts            # Utilitaires pour le crop
│
└── types/
    └── media-gallery.types.ts         # Types TypeScript
```

### Flux de données

```
1. Appel de pick()
   ↓
2. ImagePickerProvider ouvre la sheet
   ↓
3. ImagePickerSheetRenderer affiche ImageGallerySheet
   ↓
4. useMediaGallery charge les photos depuis MediaLibrary
   ↓
5. L'utilisateur sélectionne des médias
   ↓
6. (Optionnel) InlineImageCropEditor pour crop
   ↓
7. Validation → Promise résolue avec les médias
```

### Composants principaux

#### ImagePickerProvider

Provider de contexte qui gère l'état global du picker et les promesses.

**Responsabilités :**

- Gérer l'ouverture/fermeture de la sheet
- Stocker la configuration du picker
- Gérer les promesses de sélection

#### ImagePickerSheetRenderer

Composant qui rend la Bottom Sheet avec accès au contexte BottomSheet.

**Responsabilités :**

- Rendre la sheet au bon endroit dans l'arbre
- Passer la configuration à ImageGallerySheet

#### ImageGallerySheet

Composant principal qui affiche la galerie dans une Bottom Sheet.

**Responsabilités :**

- Afficher la grille d'images/vidéos
- Gérer la sélection
- Afficher l'éditeur de crop si activé
- Valider et retourner les médias sélectionnés

#### InlineImageCropEditor

Éditeur de crop inline avec gestes (pan, pinch).

**Responsabilités :**

- Afficher l'image dans une zone de crop
- Gérer les gestes de déplacement et zoom
- Contraindre l'image dans la zone de crop
- Générer l'image croppée

#### AlbumSelector

Sélecteur d'albums avec grille de vignettes.

**Responsabilités :**

- Charger tous les albums de l'appareil
- Générer des thumbnails pour les vidéos
- Afficher les albums en grille avec leur dernière photo
- Permettre la sélection d'un album ou "Récents"
- Précharger les données pour une navigation fluide

#### useMediaGallery

Hook personnalisé pour gérer la galerie de médias.

**Responsabilités :**

- Charger les médias depuis MediaLibrary
- Gérer la pagination
- Gérer les filtres (photo/video/all)
- Gérer la sélection (simple/multiple)
- Filtrer par album sélectionné

## API

### useImagePicker()

Hook pour utiliser le picker d'images.

**Retourne :**

```typescript
{
  pick: (config?: ImagePickerConfig) => Promise<MediaAssetWithUri[] | null>;
}
```

### ImagePickerConfig

Configuration du picker :

```typescript
interface ImagePickerConfig {
  // Type de média autorisé
  allowedMediaTypes?: "photo" | "video" | "all"; // Défaut: "all"

  // Sélection multiple
  allowMultipleSelection?: boolean; // Défaut: false
  maxSelection?: number; // Limite de sélection (undefined = illimité)

  // Exclusions
  excludedExtensions?: string[]; // Ex: ["gif", "webp"]

  // Crop d'image
  enableCrop?: boolean; // Défaut: false
  cropConfig?: CropConfig;
  cropHeight?: number; // Hauteur de la zone de crop (défaut: 300)
}
```

### CropConfig

Configuration du crop :

```typescript
interface CropConfig {
  aspectRatio: number; // Ex: 1 (carré), 16/9, 29/9
  shape: "rectangle" | "circle";
}
```

### MediaAssetWithUri

Média retourné après sélection :

```typescript
interface MediaAssetWithUri extends Asset {
  localUri?: string; // URI locale du média
  croppedUri?: string; // URI de l'image croppée (si crop activé)
  mimeType?: string; // Type MIME (ex: "image/jpeg", "video/mp4")

  // + tous les champs de expo-media-library Asset :
  id: string;
  filename: string;
  uri: string;
  mediaType: "photo" | "video";
  width: number;
  height: number;
  creationTime: number;
  modificationTime: number;
  duration: number; // Pour les vidéos
  // ...
}
```

## Exemples

### Avatar avec crop circulaire

```tsx
function ProfilePicturePicker() {
  const { pick } = useImagePicker();
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  const handlePickAvatar = async () => {
    const medias = await pick({
      allowedMediaTypes: "photo",
      enableCrop: true,
      cropConfig: {
        aspectRatio: 1,
        shape: "circle",
      },
      cropHeight: 300,
    });

    if (medias && medias[0].croppedUri) {
      setAvatarUri(medias[0].croppedUri);
    }
  };

  return (
    <View>
      {avatarUri && <Image source={{ uri: avatarUri }} style={styles.avatar} />}
      <Button onPress={handlePickAvatar}>Choisir une photo</Button>
    </View>
  );
}
```

### Bannière avec crop rectangulaire

```tsx
function BannerPicker() {
  const { pick } = useImagePicker();
  const [bannerUri, setBannerUri] = useState<string | null>(null);

  const handlePickBanner = async () => {
    const medias = await pick({
      allowedMediaTypes: "photo",
      enableCrop: true,
      cropConfig: {
        aspectRatio: 29 / 9,
        shape: "rectangle",
      },
      cropHeight: 250,
    });

    if (medias && medias[0].croppedUri) {
      setBannerUri(medias[0].croppedUri);
    }
  };

  return (
    <View>
      {bannerUri && <Image source={{ uri: bannerUri }} style={styles.banner} />}
      <Button onPress={handlePickBanner}>Choisir une bannière</Button>
    </View>
  );
}
```

### Sélection multiple de photos pour un album

```tsx
function AlbumPhotoPicker() {
  const { pick } = useImagePicker();
  const [photos, setPhotos] = useState<MediaAssetWithUri[]>([]);

  const handlePickPhotos = async () => {
    const medias = await pick({
      allowedMediaTypes: "photo",
      allowMultipleSelection: true,
      maxSelection: 10,
      excludedExtensions: ["gif"],
    });

    if (medias) {
      setPhotos(medias);
    }
  };

  return (
    <View>
      <Button onPress={handlePickPhotos}>
        Choisir des photos ({photos.length}/10)
      </Button>
      <FlatList
        data={photos}
        renderItem={({ item }) => (
          <Image source={{ uri: item.localUri }} style={styles.thumb} />
        )}
      />
    </View>
  );
}
```

### Upload avec MIME type

```tsx
function MediaUploader() {
  const { pick } = useImagePicker();

  const handleUpload = async () => {
    const medias = await pick({
      allowedMediaTypes: "all",
      allowMultipleSelection: true,
    });

    if (medias) {
      for (const media of medias) {
        const formData = new FormData();
        formData.append("file", {
          uri: media.localUri,
          name: media.filename,
          type: media.mimeType, // Type MIME disponible
        });

        await uploadToServer(formData);
      }
    }
  };

  return <Button onPress={handleUpload}>Upload médias</Button>;
}
```

## Fonctionnalités avancées

### Gestion du crop

Le crop d'image utilise :

- **React Native Gesture Handler** pour les gestes (pan, pinch)
- **React Native Reanimated** pour les animations fluides
- **expo-image-manipulator** pour générer l'image croppée

Caractéristiques :

- Déplacement de l'image avec contraintes (ne sort jamais de la zone)
- Zoom/dézoom avec pinch gesture
- Scale minimum calculé automatiquement
- Compensation du transform origin (React Native vs CSS)
- Normalisation des dimensions pour les grandes images

### Cache des URIs

Le composant cache automatiquement :

- Les URIs des photos
- Les thumbnails des vidéos

Pour nettoyer le cache manuellement :

```typescript
import { clearMediaCache } from "@/components/media-gallery/utils/media-gallery.utils";

clearMediaCache();
```

### Performance

Optimisations implémentées :

- **FlashList** pour le rendu performant de la grille
- **useRecyclingState** pour le recycling correct des items
- **Memoization** des composants avec React.memo
- **Cache** des URIs et thumbnails
- **Pagination** automatique (30 items par page)
- **Draw distance** optimisée (800px)

## Troubleshooting

### La sheet ne s'ouvre pas

Vérifiez la hiérarchie des providers :

- `ImagePickerProvider` doit être au-dessus de `BottomSheetModalProvider`
- `ImagePickerSheetRenderer` doit être à l'intérieur de `BottomSheetModalProvider`

### Erreur "useImagePicker must be used within ImagePickerProvider"

Le composant qui appelle `useImagePicker()` n'est pas un enfant de `ImagePickerProvider`.

### Les filtres ne changent pas

Assurez-vous que `allowedMediaTypes` est bien passé dans la config du `pick()`.

### Le crop ne fonctionne pas

- Vérifiez que `enableCrop` est à `true`
- `enableCrop` nécessite `allowMultipleSelection: false`
- L'image croppée est dans `croppedUri`, pas `uri`

## License

MIT
