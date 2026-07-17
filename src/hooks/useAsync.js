import { useState, useCallback } from 'react'

export function useAsync(asyncFunction, immediate = true) {
  const [status, setStatus] = useState('idle')
  const [value, setValue] = useState(null)
  const [error, setError] = useState(null)

  const execute = useCallback(async () => {
    setStatus('pending')
    try {
      const result = await asyncFunction()
      setValue(result)
      setStatus('success')
      return result
    } catch (err) {
      setError(err)
      setStatus('error')
      throw err
    }
  }, [asyncFunction])

  if (immediate) {
    if (status === 'idle') {
      execute()
    }
  }

  return { execute, status, value, error }
}
