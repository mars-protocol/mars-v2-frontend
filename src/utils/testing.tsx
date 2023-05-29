const createMockComponent = (testId?: string, props?: any) => (
  <div {...(testId && { 'data-testid': testId })}>{JSON.stringify(props)}</div>
)

const parseMockComponent = (element: HTMLElement) => JSON.parse(element.innerHTML)

export { createMockComponent, parseMockComponent }
