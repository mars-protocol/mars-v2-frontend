import { useCallback, useEffect, useRef, useState } from 'react'

import useStore from 'store'

export default function useLocalStorage<T>(key: string, defaultValue: T): [T, (value: T) => void] {
  const keyRef = useRef(key)
  const defaultValueRef = useRef(defaultValue)
  const [value, _setValue] = useState(defaultValue)
  const updateValue = useCallback((value: T) => {
    useStore.setState({ [keyRef.current]: value })
    _setValue(value)
  }, [])

  useEffect(() => {
    const savedItem = localStorage.getItem(keyRef.current)

    const isString = typeof defaultValueRef.current === 'string'
    if (!savedItem) {
      localStorage.setItem(
        keyRef.current,
        isString ? (defaultValueRef.current as string) : JSON.stringify(defaultValueRef.current),
      )
    }

    updateValue(
      savedItem ? (isString ? savedItem : JSON.parse(savedItem)) : defaultValueRef.current,
    )

    function handler(e: StorageEvent) {
      if (e.key !== keyRef.current) return

      const item = localStorage.getItem(keyRef.current)

      if (isString) {
        updateValue((item as T) ?? (defaultValueRef.current as T))
      } else {
        updateValue(JSON.parse(item ?? JSON.stringify(defaultValueRef.current)))
      }
    }

    window.addEventListener('storage', handler)

    return () => {
      window.removeEventListener('storage', handler)
    }
  }, [updateValue])

  const setValue = useCallback(
    (value: T) => {
      try {
        updateValue(value)

        localStorage.setItem(
          keyRef.current,
          typeof value === 'string' ? (value as string) : JSON.stringify(value),
        )
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new StorageEvent('storage', { key: keyRef.current }))
        }
      } catch (e) {
        console.error(e)
      }
    },
    [updateValue],
  )

  return [value, setValue]
}
