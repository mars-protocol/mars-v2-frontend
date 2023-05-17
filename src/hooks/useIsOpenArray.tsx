import { useState } from 'react'

export default function useIsOpenArray(length: number, allowMultiple: boolean) {
  const [isOpen, setIsOpen] = useState<boolean[]>(Array.from({ length }, (_, i) => i === 0))

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
