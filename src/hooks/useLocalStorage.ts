import { useCallback, useEffect, useRef, useState } from 'react'

export default function useLocalStorage<T>(key: string, defaultValue: T): [T, (value: T) => void] {
  const keyRef = useRef(key)
  const defaultValueRef = useRef(defaultValue)
  const [value, _setValue] = useState(defaultValueRef.current)

  useEffect(() => {
    const savedItem = localStorage.getItem(keyRef.current)

    if (!savedItem) {
      localStorage.setItem(keyRef.current, JSON.stringify(defaultValueRef.current))
    }

    _setValue(savedItem ? JSON.parse(savedItem) : defaultValueRef.current)

    function handler(e: StorageEvent) {
      if (e.key !== keyRef.current) return

      const item = localStorage.getItem(keyRef.current)
      _setValue(JSON.parse(item ?? JSON.stringify(defaultValueRef.current)))
    }

    window.addEventListener('storage', handler)

    return () => {
      window.removeEventListener('storage', handler)
    }
  }, [])

  const setValue = useCallback((value: T) => {
    try {
      _setValue(value)

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
