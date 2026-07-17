import { useState, useCallback } from 'react'

export function useForm(initialValues, onSubmit) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = useCallback((e) => {
    const { name, value } = e.target
    setValues((prev) => ({ ...prev, [name]: value }))
  }, [])

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onSubmit(values)
    } catch (err) {
      setErrors(err.fieldErrors || {})
    } finally {
      setIsSubmitting(false)
    }
  }, [values, onSubmit])

  return { values, errors, isSubmitting, handleChange, handleSubmit, setValues }
}
