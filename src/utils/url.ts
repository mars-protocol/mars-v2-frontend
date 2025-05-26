export const getUrl = (baseUrl: string, path: string = ''): string => {
  const isPlaceholder = baseUrl.split('APP_').length > 1

  if (isPlaceholder) return baseUrl + '/' + path

  let url = new URL(baseUrl)
  if (path !== '') url = new URL(path, url)

  if (process.env.NEXT_PUBLIC_API_KEY)
    url.searchParams.append('x-apikey', process.env.NEXT_PUBLIC_API_KEY)

  return url.toString()
}
