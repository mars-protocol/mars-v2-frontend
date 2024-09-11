const createMockComponent = (testId?: string, props?: any) => (
  <div {...(testId && { 'data-testid': testId })} data-props={JSON.stringify(props)}>
    {props.children}
  </div>
)

const parseMockComponentProps = (element: HTMLElement) =>
  JSON.parse(element.getAttribute('data-props') ?? '{}')

export { createMockComponent, parseMockComponentProps }
