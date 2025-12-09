import type { MediaAssetWithUri } from '@/components/media-gallery/types/media-gallery.types';
import type { ItemFormState } from '@/types/item-analysis';

// États possibles du flux de création
export type AddItemStep = 'select-image' | 'analyzing' | 'form' | 'submitting';

// Props communes pour les composants de step
export interface StepProps {
  tintColor: string;
  textColor: string;
}

// Props pour ImageSelector
export interface ImageSelectorProps extends StepProps {
  selectedImage: MediaAssetWithUri | null;
  errorMessage: string | null;
  onPickImage: () => void;
  setStep: (step: AddItemStep) => void;
  setErrorMessage: (message: string | null) => void;
  setFormState: (state: ItemFormState) => void;
  setSelectedImage: (image: MediaAssetWithUri | null) => void;
}

// Props pour AnalyzingStep
export interface AnalyzingStepProps extends StepProps {
  selectedImage: MediaAssetWithUri | null;
}

// Props pour ItemForm
export interface ItemFormProps extends StepProps {
  selectedImage: MediaAssetWithUri | null;
  imageUrl?: string | null;
  formState: ItemFormState;
  onUpdateField: <K extends keyof ItemFormState>(field: K, value: ItemFormState[K]) => void;
  onSubmit: () => void;
  isSubmitDisabled: boolean;
  submitButtonText?: string;
}

// Props pour SubmittingStep
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
};
