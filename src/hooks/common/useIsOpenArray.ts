import { useState } from 'react'

export default function useIsOpenArray(length: number, allowMultiple: boolean, preset?: boolean[]) {
  const presetArray = preset ?? Array.from({ length }, (_, i) => i === 0)
  const [isOpen, setIsOpen] = useState<boolean[]>(presetArray)

  function toggleOpen(index: number) {
    setIsOpen((prev) => {
      return prev.map((_, i) => {
        if (i === index) return !prev[i]
        return allowMultiple ? prev[i] : false
      })
    })
  }

  return [isOpen, toggleOpen] as const
}
