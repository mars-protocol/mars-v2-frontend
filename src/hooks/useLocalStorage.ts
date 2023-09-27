import { useCallback, useEffect, useRef, useState } from 'react'

import useStore from 'store'

export default function useLocalStorage<T>(key: string, defaultValue: T): [T, (value: T) => void] {
  const keyRef = useRef(key)
  const defaultValueRef = useRef(defaultValue)
  const [value, _setValue] = useState(defaultValueRef.current)

  const updateValue = useCallback((value: T) => {
    useStore.setState({ [keyRef.current]: value })
    _setValue(value)
  }, [])

  useEffect(() => {
    const savedItem = localStorage.getItem(keyRef.current)

    if (!savedItem) {
      localStorage.setItem(keyRef.current, JSON.stringify(defaultValueRef.current))
    }

    updateValue(savedItem ? JSON.parse(savedItem) : defaultValueRef.current)

    function handler(e: StorageEvent) {
      if (e.key !== keyRef.current) return

      const item = localStorage.getItem(keyRef.current)
      updateValue(JSON.parse(item ?? JSON.stringify(defaultValueRef.current)))
    }

    window.addEventListener('storage', handler)

    return () => {
      window.removeEventListener('storage', handler)
    }
  }, [updateValue])

  const setValue = useCallback((value: T) => {
    try {
      updateValue(value)

      localStorage.setItem(keyRef.current, JSON.stringify(value))
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new StorageEvent('storage', { key: keyRef.current }))
      }
    } catch (e) {
      console.error(e)
    }
  }, [])

  return [value, setValue]
}
