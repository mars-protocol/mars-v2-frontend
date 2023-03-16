export function getContractQuery(key: string, contractAddress: string, query: string) {
  const contractKey = key.length > 0 ? `${key}: ` : ``
  return `
          ${contractKey}contractQuery(contractAddress: "${contractAddress}", query: ${query})
                  `
}

export function denomToKey(denom: string) {
  return denom.replace('ibc/', 'ibc_')
}

export function keyToDenom(key: string) {
  return key.replace('ibc_', 'ibc/')
}
