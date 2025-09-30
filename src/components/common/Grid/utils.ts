/**
 * Utility functions for grid layout
 */

export interface GridArea {
  rowStart: number
  colStart: number
  rowEnd: number
  colEnd: number
}

/**
 * Create a grid area string from coordinates
 * @param rowStart Starting row (1-indexed)
 * @param colStart Starting column (1-indexed)
 * @param rowEnd Ending row (1-indexed)
 * @param colEnd Ending column (1-indexed)
 * @returns CSS grid-area string
 */
export const createGridArea = (
  rowStart: number,
  colStart: number,
  rowEnd: number,
  colEnd: number,
): string => {
  return `${rowStart} / ${colStart} / ${rowEnd} / ${colEnd}`
}

/**
 * Parse a grid area string into coordinates
 * @param gridArea CSS grid-area string
 * @returns GridArea object
 */
export const parseGridArea = (gridArea: string): GridArea => {
  const parts = gridArea.split(' / ').map((part) => parseInt(part.trim(), 10))
  return {
    rowStart: parts[0],
    colStart: parts[1],
    rowEnd: parts[2],
    colEnd: parts[3],
  }
}

/**
 * Create responsive grid columns
 * @param minSize Minimum column size (e.g., '200px')
 * @param maxCols Maximum number of columns
 * @returns CSS grid-template-columns string
 */
export const createResponsiveColumns = (
  minSize: string = '200px',
  maxCols: number = 12,
): string => {
  return `repeat(auto-fit, minmax(${minSize}, 1fr))`
}

/**
 * Standard grid layouts for common use cases
 */
export const GRID_LAYOUTS = {
  // Trading interface layout (similar to Aster)
  TRADING: {
    columns: 'repeat(12, 1fr)',
    rows: 'repeat(8, 1fr)',
    areas: {
      CHART: createGridArea(1, 1, 6, 9), // Large chart area - about 75% width
      ORDER_FORM: createGridArea(1, 9, 8, 13), // Right panel - narrower, more like Aster
      BALANCE: createGridArea(6, 1, 8, 9), // Balance table - matches chart width exactly
    },
  },

  // Portfolio layout
  PORTFOLIO: {
    columns: 'repeat(12, 1fr)',
    rows: 'repeat(6, 1fr)',
    areas: {
      SUMMARY: createGridArea(1, 1, 2, 13), // Portfolio summary
      ASSETS: createGridArea(2, 1, 6, 8), // Asset list
      PERFORMANCE: createGridArea(2, 8, 6, 13), // Performance chart
    },
  },

  // Dashboard layout
  DASHBOARD: {
    columns: 'repeat(12, 1fr)',
    rows: 'repeat(6, 1fr)',
    areas: {
      HEADER: createGridArea(1, 1, 2, 13), // Dashboard header
      MAIN_CHART: createGridArea(2, 1, 6, 9), // Main chart
      SIDEBAR: createGridArea(2, 9, 6, 13), // Sidebar widgets
    },
  },
} as const
