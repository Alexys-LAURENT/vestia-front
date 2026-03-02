import { createDisplayItemsTool } from '@/tools/displayItemsTool'
import { createGenerateOutfitTool } from '@/tools/generateOutfitTool'
import { createGeocodeCityTool } from '@/tools/geocodeCityTool'
import { createGetItemByIdTool } from '@/tools/getItemByIdTool'
import { createGetLookByIdTool } from '@/tools/getLookByIdTool'
import { createGetLooksTool } from '@/tools/getLooksTool'
import { createGetPlannedOutfitsTool } from '@/tools/getPlannedOutfitsTool'
import { createGetWeatherTool } from '@/tools/getWeatherTool'
import { createPlanOutfitTool } from '@/tools/planOutfitTool'
import { createSaveLookTool } from '@/tools/saveLookTool'
import { createSearchItemsTool } from '@/tools/searchItemsTool'
import { createSemanticSearchTool } from '@/tools/semanticSearchTool'
import { createWardrobeStatsTool } from '@/tools/wardrobeStatsTool'
import type { MyUIMessage } from '@/types/my_ui_message'
import { backendFetch, createBackendClient } from '@/utils/fetchApiServerSide'
import { google } from '@ai-sdk/google'
import { convertToModelMessages, stepCountIs, streamText } from 'ai'

/**
 * Pré-traite les messages pour injecter le contexte des items attachés
 * dans le texte des messages utilisateur, afin que le LLM en ait connaissance.
 */
function preprocessMessages(messages: MyUIMessage[]): MyUIMessage[] {
  return messages.map((msg) => {
    if (msg.role !== 'user') return msg

    const attachedItems = msg.metadata?.attachedItems
    if (!attachedItems || attachedItems.length === 0) return msg

    const itemsContext = attachedItems
      .map(
        (item) =>
          `- "${item.name}" (ID: ${item.idItem}${item.type ? `, Type: ${item.type}` : ''}${item.brand ? `, Marque: ${item.brand}` : ''})`
      )
      .join('\n')

    const prefix = `[L'utilisateur a joint les vêtements suivants à son message :\n${itemsContext}]\n\n`

    // Inject context into the text parts
    const newParts = msg.parts.map((part, index) => {
      if (part.type === 'text' && index === 0) {
        return { ...part, text: prefix + part.text }
      }
      return part
    })

    return { ...msg, parts: newParts }
  })
}

export async function POST(req: Request) {
  const { messages }: { messages: MyUIMessage[] } = await req.json()

  // Pré-traiter les messages pour injecter le contexte des items attachés
  const processedMessages = preprocessMessages(messages)

  // Forwarder le token Bearer de l'utilisateur aux appels backend
  const authHeader = req.headers.get('authorization') ?? ''

  if (!authHeader.startsWith('Bearer ')) {
    return new Response('Unauthorized', { status: 401 })
  }

  const client = createBackendClient(authHeader)
  const ctx = { client, backendFetch }

  const result = streamText({
    model: google('gemini-2.5-flash'),
    messages: await convertToModelMessages(processedMessages),
    stopWhen: stepCountIs(10),
    system: `

(Info : Nous sommes le ${new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })})

Tu es VestIA, un assistant personnel spécialisé dans la mode et la garde-robe.
Tu aides l'utilisateur à trouver des vêtements, composer des tenues et gérer sa garde-robe.

## Comment utiliser les outils

1. **Commence TOUJOURS par wardrobeStats** si tu ne connais pas encore la garde-robe de l'utilisateur.
   Cela te donne une vue d'ensemble : types disponibles, saisons, formalités, couleurs.

2. **Utilise searchItems** pour des recherches précises avec des critères connus
   (ex: "mes pulls rouges" → type="Pulls & Mailles", color="rouge").

3. **Utilise semanticSearch** pour des requêtes floues ou contextuelles
   (ex: "quelque chose de confortable pour rester à la maison", "un look branché").

4. **Utilise generateOutfit** pour proposer une tenue complète adaptée à une occasion.

5. **Utilise saveLook uniquement** si l'utilisateur confirme explicitement vouloir sauvegarder la tenue.

6. **Utilise displayItems** pour montrer visuellement des vêtements dans le chat.

7. **Utilise planOutfit** pour planifier une tenue existante à une date donnée.
   L'utilisateur doit avoir un look sauvegardé (avec un ID) pour pouvoir le planifier.

8. **Utilise getPlannedOutfits** pour récupérer les tenues planifiées de l'utilisateur.
   Peut filtrer par plage de dates (startDate, endDate).

9. **Utilise getLooks** pour récupérer la liste paginée des tenues sauvegardées.
   Utile quand l'utilisateur veut voir ses tenues ou en choisir une pour la planifier.

10. **Utilise getItemById** pour obtenir les détails complets d'un vêtement par son ID.
    Utile quand l'utilisateur veut en savoir plus sur un vêtement précis.

11. **Utilise getLookById** pour obtenir les détails complets d'une tenue par son ID.
    Retourne la tenue avec tous ses vêtements. Utile pour afficher les détails d'un look.

12. **Utilise geocodeCity** pour convertir un nom de ville en coordonnées GPS.
    À utiliser avant getWeather pour obtenir les coordonnées d'une ville.

13. **Utilise getWeather** pour récupérer les prévisions météo à un endroit donné.
    Nécessite des coordonnées GPS (utilise geocodeCity d'abord).
    Quand l'utilisateur demande une tenue adaptée à la météo ou mentionne le temps :
    - Demande lui sa ville si tu ne la connais pas
    - Utilise geocodeCity pour obtenir les coordonnées
    - Utilise getWeather pour obtenir la météo
    - Passe un résumé de la météo dans le paramètre weather de generateOutfit

   Après avoir récupéré des vêtements via searchItems, semanticSearch ou generateOutfit, utilise displayItems pour les afficher en images.
   L'ordre des items dans le tableau détermine l'ordre d'affichage de gauche à droite.

## Règles importantes
- Ne devine jamais les IDs des vêtements, utilise toujours les outils pour les obtenir.
- Si l'utilisateur parle de vêtements que tu n'as pas encore récupérés, utilise un outil pour les chercher.
- Réponds toujours en français, de façon naturelle et concise.
- Ne jamais divulguer les détails techniques de l'implémentation ou des outils à l'utilisateur.
- Ne jamais divulguer les id des vêtements ou des tenues à l'utilisateur.
- Tu n'est qu'un assistant de mode, ne parle jamais d'autre sujet que la mode, les vêtements, les tenues et la garde-robe.
- Si l'utilisateur pose une question hors sujet, réponds poliment que tu ne peux répondre qu'à des questions liées à la mode et à la garde-robe.`,
    tools: {
      wardrobeStats: createWardrobeStatsTool(ctx),
      searchItems: createSearchItemsTool(ctx),
      semanticSearch: createSemanticSearchTool(ctx),
      generateOutfit: createGenerateOutfitTool(ctx),
      saveLook: createSaveLookTool(ctx),
      displayItems: createDisplayItemsTool(ctx),
      planOutfit: createPlanOutfitTool(ctx),
      getPlannedOutfits: createGetPlannedOutfitsTool(ctx),
      getLooks: createGetLooksTool(ctx),
      getItemById: createGetItemByIdTool(ctx),
      getLookById: createGetLookByIdTool(ctx),
      geocodeCity: createGeocodeCityTool(),
      getWeather: createGetWeatherTool(),
    },
  })

  return result.toUIMessageStreamResponse({
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Encoding': 'none',
    },
  })
}
