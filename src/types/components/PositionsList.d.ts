interface PositionsEntry extends FormattedNumberProps {
  format?: 'number' | 'string'
  type?: 'debt'
}

interface PositionsData {
  [key: string]: PositionsEntry
}
