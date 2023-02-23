export function getContractQuery(key: string, contractAddress: string, query: string) {
  const contractKey = key.length > 0 ? `${key}: ` : ``
  return `
          ${contractKey}contractQuery(contractAddress: "${contractAddress}", query: ${query})
                  `
}
