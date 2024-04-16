interface MenuTreeEntry {
  pages: Page[]
  label: string
  externalUrl?: string
  submenu?: MenuTreeSubmenuEntry[]
}

interface MenuTreeSubmenuEntry {
  page: Page
  label: string
  subtitle?: string
  icon?: React.ReactNode
}
