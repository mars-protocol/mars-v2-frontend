interface Props {
  condition: boolean
  wrapper: (children: React.JSX.Element) => React.JSX.Element
  children: React.JSX.Element
}

const ConditionalWrapper = ({ condition, wrapper, children }: Props) =>
  condition ? wrapper(children) : children

export default ConditionalWrapper
