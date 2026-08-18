import { useState, useEffect } from 'react'

export function useGeolocation(defaultLocation = { lat: 20.4782, lng: 85.8621, name: 'Cuttack, Odisha' }) {
  const [location, setLocation] = useState(defaultLocation)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.')
      return
    }

    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          name: 'Current Device Location',
          accuracy: position.coords.accuracy,
        })
        setLoading(false)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      },
      { timeout: 10000, enableHighAccuracy: true }
    )
  }

  useEffect(() => {
    // Optionally trigger on mount
  }, [])

  return { location, setLocation, getCurrentLocation, loading, error }
}
