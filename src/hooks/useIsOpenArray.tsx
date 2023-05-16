import { useState } from 'react'

export default function useIsOpenArray(length: number, allowMultiple: boolean) {
  const [isOpen, setIsOpen] = useState<boolean[]>(Array.from({ length }, (_, i) => i === 0))

  function toggleOpen(index: number) {
    setIsOpen((prev) => {
      const list = prev.map((_, i) => {
        if (i === index) return allowMultiple ? !prev[i] : true
        return allowMultiple ? prev[i] : false
      })

      if (list.every((item) => item === false)) {
        list[index] = true
      }

      return list
    })
  }

  return [isOpen, toggleOpen] as const
}
