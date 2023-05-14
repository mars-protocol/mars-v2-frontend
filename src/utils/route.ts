export function navigateToPage(href: string, page: Page) {
  const segments = href.split('/')
  segments.pop()
  segments.push(page)
  return segments.join('/')
}
