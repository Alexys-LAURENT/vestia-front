# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Vestia is a React Native mobile application built with Expo that helps users manage their wardrobe and create outfits. The app features AI-powered outfit generation, item management, and look creation.

## Development Commands

### Running the app
- `npm start` or `npx expo start` - Start the development server
- `npm run ios` - Run on iOS simulator
- `npm run android` - Run on Android emulator
- `npm run web` - Run web version

### Code quality
- `npm run lint` - Run ESLint (uses `expo lint`)

### Environment setup
- Requires `EXPO_PUBLIC_API_URL` environment variable pointing to the backend API
- Node version managed by Volta (22.11.0)

## Architecture

### Routing and Navigation
- Uses **Expo Router v6** with file-based routing
- Routes are defined in `app/` directory
- Protected routes use `<Stack.Protected guard={!!session}>` pattern
- Tab navigation at `app/(tabs)/` with screens: wardrobe, create, calendar, profile, index
- Dynamic routes like `app/item/[id].tsx` for detail pages

### Authentication Flow
- Session management via `SessionContext` ([contexts/SessionContext.tsx](contexts/SessionContext.tsx))
- Tokens stored in **SecureStore** (native) or **localStorage** (web)
- Authentication state accessed via `useSession()` hook
- Root navigator in [app/_layout.tsx](app/_layout.tsx) handles route protection
- Public routes: sign-in, register; Protected routes: tabs, item details

### API Integration Pattern
The app uses a centralized API utility ([utils/fetchApi.ts](utils/fetchApi.ts)):
- `api.get()`, `api.post()`, `api.put()`, `api.patch()`, `api.delete()`
- `api.postFormData()`, `api.putFormData()` for multipart uploads
- Automatic JWT token injection from stored session
- Custom `FetchApiError` class with helper methods:
  - `error.isValidationError()` - Check for validation errors
  - `error.isNotFoundError()` - Check for 404/not found errors
- TypeScript response types: `SuccessResponse<T>`, `PaginatedResponse<T>`, `ApiError`

Example usage:
```typescript
import { api, FetchApiError } from '@/utils/fetchApi';
import type { SuccessResponse } from '@/types/requests';

try {
  const response = await api.get<Item[]>('/items') as SuccessResponse<Item[]>;
  console.log(response.data);
} catch (error) {
  if (error instanceof FetchApiError) {
    if (error.isValidationError()) {
      // Handle validation errors
    }
  }
}
```

### Data Fetching Patterns
- **Pagination**: Use `usePaginatedFetch<T>()` hook from [hooks/usePaginatedFetch.ts](hooks/usePaginatedFetch.ts)
  - Returns: `{ data, isLoading, isLoadingMore, error, hasMore, refresh, loadMore }`
  - Automatically handles pagination, loading states, and error handling
  - Example: `usePaginatedFetch<Item>('/items', { search, type })`
- **Storage**: Use `useStorageState()` for persistent state across sessions

### Styling and Theming
- **NativeWind v4** (TailwindCSS for React Native) configured in [tailwind.config.js](tailwind.config.js)
- Custom color tokens for light/dark modes: `light.*` and `dark.*` colors
- Theme accessed via `useThemeColor()` hook
- Dark mode set to "class" mode (manual control)
- Use Tailwind classes in components: `className="bg-light-background dark:bg-dark-background"`

### Component Organization
- **app/** - Route screens (Expo Router convention)
- **components/** - Reusable components organized by feature:
  - `components/media-gallery/` - Image picker, cropping, gallery management
  - `components/sheets/` - Bottom sheet components (add-item, edit-item, etc.)
  - `components/wardrobe/` - Wardrobe-specific components (ItemCard, LookCard, filters)
  - `components/create/` - Outfit creation components
  - `components/ui/` - Generic UI components (header, icons, collapsible)
- **contexts/** - React contexts (SessionContext)
- **hooks/** - Custom hooks
- **types/** - TypeScript type definitions
- **constants/** - App constants (theme, file types, auth)
- **utils/** - Utility functions

### Key Dependencies
- **@gorhom/bottom-sheet** - Bottom sheet modals
- **react-native-gesture-handler** & **react-native-reanimated** - Gestures and animations
- **expo-image-manipulator** - Image cropping/editing
- **expo-media-library** - Photo gallery access
- **expo-secure-store** - Secure token storage

### Type System
Key type definitions in `types/`:
- **entities.ts**: Core domain types (`Item`, `Look`)
  - Items have: type, season, formality, colors, tags, brand
- **requests.ts**: API response types (`SuccessResponse<T>`, `PaginatedResponse<T>`, `ApiError`)
- **auth.ts**: Authentication types (`UserSession`, `LoginData`, `RegisterData`)
- **item-analysis.ts**: AI analysis response types

### Provider Hierarchy
Root layout wraps app in these providers (order matters):
1. `SessionProvider` - Authentication/session state
2. `ThemeProvider` - React Navigation theming
3. `GestureHandlerRootView` - Gesture support
4. `BottomSheetModalProvider` - Bottom sheet modals
5. `ImagePickerProvider` - Image selection functionality

### Platform-Specific Code
- Uses `.ios.tsx` and `.web.tsx` suffixes for platform-specific implementations
- Example: `use-color-scheme.ts` vs `use-color-scheme.web.ts`
- SecureStore (native) vs localStorage (web) handled in `useStorageState`

## Common Patterns

### Adding a new authenticated API endpoint
1. Define TypeScript types in `types/` if needed
2. Call using `api.get()`, `api.post()`, etc. from `utils/fetchApi`
3. Wrap in try-catch and handle `FetchApiError`
4. For lists, consider using `usePaginatedFetch` hook

### Creating a new screen
1. Add `.tsx` file in `app/` (e.g., `app/new-screen.tsx`)
2. Add Stack.Screen in `app/_layout.tsx` if not using file-based routing defaults
3. Use `SafeAreaView` from `react-native-safe-area-context` for proper insets
4. Access theme colors via `useThemeColor()` hook

### Adding a bottom sheet modal
1. Create component in `components/sheets/`
2. Import `@gorhom/bottom-sheet` components
3. Use `BottomSheetModal` with ref pattern
4. Ensure parent screen has `BottomSheetModalProvider` (already in root layout)

### Working with images
- Use `ImagePickerProvider` context for image selection
- Access via custom hook provided by ImagePickerProvider
- Image cropping handled by `InlineImageCropEditor` component
- Upload using `api.postFormData()` with FormData

## Project Configuration

- **Expo SDK**: v54
- **React**: 19.1.0
- **React Native**: 0.81.5
- **New Architecture**: Enabled (`newArchEnabled: true`)
- **Typed Routes**: Enabled in experiments
- **React Compiler**: Enabled in experiments
- **Bundle Identifier**: com.anonymous.vestia
- **Path Alias**: `@/*` maps to project root
