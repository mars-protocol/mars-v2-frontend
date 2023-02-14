export default async function getData() {
  const response = await fetch('https://jsonplaceholder.typicode.com/todos', {
    next: { revalidate: 10 },
  }).then((r) => {
    console.log('fetching')
    return r
  })

  console.log(response.headers)
  return response.json()
}
