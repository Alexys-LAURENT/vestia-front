export const generateAPIUrl = (relativePath: string) => {
  const path = relativePath.startsWith('/') ? relativePath : `/${relativePath}`

  const baseUrl = process.env.EXPO_PUBLIC_API_URL
  if (!baseUrl) {
    throw new Error('EXPO_PUBLIC_API_URL is not defined')
  }

  // Remove trailing slash from base URL if present
  return `${baseUrl.replace(/\/+$/, '')}${path}`
}
