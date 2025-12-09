import { ITEM_FORMALITIES, ITEM_SEASONS, ITEM_TYPES } from '@/constants/file_types';

// Types pour l'analyse d'item
export type ItemType = (typeof ITEM_TYPES)[number];
export type ItemSeason = (typeof ITEM_SEASONS)[number];
export type ItemFormality = (typeof ITEM_FORMALITIES)[number];

// Réponse de l'API d'analyse
export interface ItemAnalysisData {
  name: string;
  description: string;
  tags: string[];
  type: ItemType;
  main_color: string;
  additional_colors: string[];
  season: ItemSeason[];
  formality: ItemFormality;
}

export interface ItemAnalysisSuccessResponse {
  success: true;
  data: ItemAnalysisData;
}

export interface ItemAnalysisErrorResponse {
  success: false;
  message: string;
  reason: string;
}

export type ItemAnalysisResponse = ItemAnalysisSuccessResponse | ItemAnalysisErrorResponse;

// Données du formulaire pour créer un item
export interface CreateItemFormData {
  image: File | Blob;
  name: string;
  description: string;
  type: ItemType;
  tags: string[];
  season: ItemSeason;
  formality: ItemFormality;
  mainColor: string;
  additionalColors: string[] | null;
  brand: string | null;
  reference: string | null;
}

// État du formulaire (pour le composant React)
export interface ItemFormState {
  name: string;
  description: string;
  type: ItemType;
  tags: string[];
  season: ItemSeason;
  formality: ItemFormality;
  mainColor: string;
  additionalColors: string[];
  brand: string;
  reference: string;
}
