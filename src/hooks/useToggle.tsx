import { useState } from 'react'

export default function useToggle(
  defaultValue?: boolean,
): [boolean, (isToggled?: boolean) => void] {
  const [toggle, setToggle] = useState<boolean>(defaultValue ?? false)

  function handleToggle(isToggled?: boolean) {
    if (isToggled !== undefined) return setToggle(isToggled)
    return setToggle(!toggle)
  }

  return [toggle, handleToggle]
}
