import { ITEM_FORMALITIES, ITEM_SEASONS, ITEM_TYPES } from "@/constants/file_types"

export type Item = {
  idItem: number
  idUser: number
  name: string
  description: string
  tags: string[]
  imageUrl: string
  type: (typeof ITEM_TYPES)[number]
  season: (typeof ITEM_SEASONS)[number]
  formality: (typeof ITEM_FORMALITIES)[number]
  mainColor: string
  additionnalColors: string[] | null
  brand: string | null
  reference: string | null
  createdAt: string
  updatedAt: string | null
}

export type Look = {
  idLook: number
  idUser: number
  event: string | null
  avatarImageUrl: string | null
  isAiGenerated: boolean
  createdAt: string
  updatedAt: string | null
  items: Item[]
}