import { useCallback, useState } from 'react'

export default function useToggle(
  defaultValue?: boolean,
): [boolean, (isToggled?: boolean) => void] {
  const [toggle, setToggle] = useState<boolean>(defaultValue ?? false)

  const handleToggle = useCallback((isToggled?: boolean) => {
    if (isToggled !== undefined) return setToggle(isToggled)
    return setToggle((isToggled) => !isToggled)
  }, [])

  return [toggle, handleToggle]
}
