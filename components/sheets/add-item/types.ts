import type { MediaAssetWithUri } from '@/components/media-gallery/types/media-gallery.types'
import type { ItemFormState } from '@/types/item-analysis'

// États possibles du flux de création
export type AddItemStep = 'select-image' | 'camera' | 'analyzing' | 'forms'

// Un item dans la liste des formulaires multi
export interface FormItem {
  image: MediaAssetWithUri
  formState: ItemFormState
  isSubmitting: boolean
}

// Props communes pour les composants de step
export interface StepProps {
  tintColor: string
  textColor: string
}

// Props pour ImageSelector
export interface ImageSelectorProps extends StepProps {
  selectedImages: MediaAssetWithUri[]
  errorMessage: string | null
  onPickImage: () => void
  onOpenCamera: () => void
  onAnalyze: () => void
  onRemoveImage: (index: number) => void
  setErrorMessage: (message: string | null) => void
}

// Props pour AnalyzingStep
export interface AnalyzingStepProps extends StepProps {
  selectedImages: MediaAssetWithUri[]
}

// Props pour ItemForm
export interface ItemFormProps extends StepProps {
  selectedImage: MediaAssetWithUri | null
  imageUrl?: string | null
  formState: ItemFormState
  onUpdateField: <K extends keyof ItemFormState>(field: K, value: ItemFormState[K]) => void
  onSubmit: () => void
  isSubmitDisabled: boolean
  submitButtonText?: string
  /** Utiliser les composants BottomSheet (true par défaut). Passer false dans un FlatList horizontal. */
  useBottomSheet?: boolean
}

// Props pour SubmittingStep (utilisé par LoadingSteps)
export type SubmittingStepProps = StepProps

// État initial du formulaire
export const initialFormState: ItemFormState = {
  name: '',
  description: '',
  type: 'Autres',
  tags: [],
  season: 'printemps',
  formality: 'décontracté',
  mainColor: '',
  additionalColors: [],
  brand: '',
  reference: '',
}
