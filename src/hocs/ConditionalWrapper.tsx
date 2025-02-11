import { ReactElement } from 'react'

interface Props {
  condition: boolean
  wrapper: (children: ReactElement) => ReactElement
  children: ReactElement
}

const ConditionalWrapper = ({ condition, wrapper, children }: Props) =>
  condition ? wrapper(children) : children

export default ConditionalWrapper
