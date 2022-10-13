import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

const { result, waitFor } = renderHook(() => useCustomHook(), { wrapper })

await waitFor(() => result.current.isSuccess)

expect(result.current.data).toEqual('Hello')
