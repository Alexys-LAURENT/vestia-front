import Constants from 'expo-constants';
//TODO: fix (it may not work in production)
export const generateAPIUrl = (relativePath: string) => {
  const path = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;

  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    return `http://${hostUri}${path}`;
  }

  return `http://localhost:8081${path}`;
};