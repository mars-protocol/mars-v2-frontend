export async function fetchWithTimeout(url: string, timeout: number) {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)

  const response = await fetch(url, {
    signal: controller.signal,
  })
  clearTimeout(id)

  return response
}
