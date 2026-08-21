import { useState, useEffect, useCallback, useRef } from 'react'
import { reverseGeocode } from '../services/geocodeService'

export function useGeolocation(options = {}) {
  const [latitude, setLatitude] = useState(null)
  const [longitude, setLongitude] = useState(null)
  const [accuracy, setAccuracy] = useState(null)
  const [timestamp, setTimestamp] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [permission, setPermission] = useState('prompt') // 'prompt' | 'granted' | 'denied'
  const [locationName, setLocationName] = useState('')
  const [district, setDistrict] = useState('')
  const [state, setState] = useState('')
  const [formattedAddress, setFormattedAddress] = useState('')

  const optionsRef = useRef({
    enableHighAccuracy: true,
    timeout: 20000,
    maximumAge: 0,
    ...options,
  })

  // Check Permissions API if supported
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: 'geolocation' })
        .then((result) => {
          setPermission(result.state)
          result.onchange = () => {
            setPermission(result.state)
          }
        })
        .catch(() => {
          // Ignore permissions query failure on unsupported browsers
        })
    }
  }, [])

  const refreshLocation = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      const errMsg = 'Geolocation is not supported by your browser.'
      setError(errMsg)
      setPermission('denied')
      return Promise.reject(new Error(errMsg))
    }

    setLoading(true)
    setError(null)

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude
          const acc = position.coords.accuracy
          const ts = position.timestamp || Date.now()

          setLatitude(lat)
          setLongitude(lng)
          setAccuracy(acc)
          setTimestamp(ts)
          setLoading(false)
          setError(null)
          setPermission('granted')

          // Reverse geocode to real location name
          let geoInfo = null
          try {
            geoInfo = await reverseGeocode(lat, lng)
            if (geoInfo) {
              setLocationName(geoInfo.shortName)
              setDistrict(geoInfo.district)
              setState(geoInfo.state)
              setFormattedAddress(geoInfo.formattedAddress)
            }
          } catch (e) {
            // fallback
          }

          const result = {
            latitude: lat,
            longitude: lng,
            accuracy: acc,
            timestamp: ts,
            locationName: geoInfo?.shortName || `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`,
            district: geoInfo?.district || 'Odisha',
            state: geoInfo?.state || 'Odisha',
            formattedAddress: geoInfo?.formattedAddress || '',
          }

          resolve(result)
        },
        (err) => {
          let message = 'Unable to retrieve location.'
          let permState = 'denied'

          switch (err.code) {
            case 1: // PERMISSION_DENIED
              message = 'Location access permission was denied. Please search or pick a location manually.'
              permState = 'denied'
              break
            case 2: // POSITION_UNAVAILABLE
              message = 'Location information is currently unavailable from your device/network.'
              permState = 'prompt'
              break
            case 3: // TIMEOUT
              message = 'Location acquisition timed out. Please retry or pick a location manually.'
              permState = 'prompt'
              break
            default:
              message = err.message || message
              break
          }

          setError(message)
          setLoading(false)
          setPermission(permState)
          reject(new Error(message))
        },
        optionsRef.current
      )
    })
  }, [])

  return {
    latitude,
    longitude,
    accuracy,
    timestamp,
    loading,
    error,
    permission,
    locationName,
    district,
    state,
    formattedAddress,
    refreshLocation,
  }
}

export default useGeolocation
