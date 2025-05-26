export const getUrl = (baseUrl: string, path: string = ''): string => {
  const isPlaceholder = baseUrl.split('APP_').length > 1

  if (isPlaceholder) return baseUrl + '/' + path

  const url = new URL(path, baseUrl)
  // API key should no longer be appended here to avoid exposing it client-side
  return url.toString()
}
