import '@tanstack/react-table'

declare module '*.svg' {
  const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>
  export default content
}

declare module '@tanstack/table-core' {
  interface ColumnMeta<TData extends RowData, TValue> {
    className?: string
  }
}

declare module 'eslint-plugin-react' {
  import type { ESLint } from 'eslint'
  const plugin: Omit<ESLint.Plugin, 'configs'> & {
    // eslint-plugin-react does not use FlatConfig yet
    configs: Record<string, ESLint.ConfigData>
  }
  export default plugin
}
