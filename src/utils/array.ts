export const byDenom = (denom: string) => (entity: any) => entity.denom === denom
export const bySymbol = (symbol: string) => (entity: any) => entity.symbol === symbol
export const byTokenDenom = (denom: string) => (entity: any) => entity.token.denom === denom

export function partition<T>(arr: Array<T>, predicate: (val: T) => boolean): [Array<T>, Array<T>] {
  const partitioned: [Array<T>, Array<T>] = [[], []]

  arr.forEach((val: T) => {
    const partitionIndex: 0 | 1 = predicate(val) ? 0 : 1
    partitioned[partitionIndex].push(val)
  })

  return partitioned
}
