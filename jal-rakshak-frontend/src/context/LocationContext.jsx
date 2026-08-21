import React, { createContext, useContext, useState, useCallback } from 'react'
import { reverseGeocode } from '../services/geocodeService'

const LocationContext = createContext(null)

const MANUAL_LOCATION_STORAGE_KEY = 'jalrakshak_manual_location'

async function fetchPlaceName(latitude, longitude) {
  const geo = await reverseGeocode(latitude, longitude)
  if (geo) {
    return {
      name: geo.shortName || geo.landmark,
      district: geo.district,
      state: geo.state,
      formattedAddress: geo.formattedAddress,
    }
  }
  return null
}

export function useLocation() {
  const context = useContext(LocationContext)
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider')
  }
  return context
}

export function LocationProvider({ children }) {
  const [selectedLocation, setSelectedLocation] = useState(() => {
    try {
      const saved = localStorage.getItem(MANUAL_LOCATION_STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed && typeof parsed.latitude === 'number' && typeof parsed.longitude === 'number') {
          return {
            ...parsed,
            source: parsed.source || 'manual',
            updatedAt: parsed.updatedAt || new Date().toISOString(),
          }
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved manual location preference:', e)
    }
    return null
  })

  // Update location from any source (GPS, manual, reverse geocode enrichment)
  const updateLocation = useCallback((locationData) => {
    if (!locationData) return

    setSelectedLocation((prev) => {
      const lat = Number(locationData.latitude ?? prev?.latitude)
      const lng = Number(locationData.longitude ?? prev?.longitude)
      const name = locationData.name !== undefined ? locationData.name : prev?.name || null
      const district = locationData.district !== undefined ? locationData.district : prev?.district || null
      const state = locationData.state !== undefined ? locationData.state : prev?.state || null
      const accuracy = locationData.accuracy !== undefined ? locationData.accuracy : prev?.accuracy || null
      const source = locationData.source || prev?.source || 'gps'

      // Prevent redundant state updates if values are unchanged
      if (
        prev &&
        prev.latitude === lat &&
        prev.longitude === lng &&
        prev.name === name &&
        prev.district === district &&
        prev.state === state &&
        prev.source === source
      ) {
        return prev
      }

      const updated = {
        latitude: lat,
        longitude: lng,
        name,
        district,
        state,
        accuracy,
        source,
        updatedAt: locationData.updatedAt || new Date().toISOString(),
      }

      // If GPS coordinates don't have a place name, enrich them asynchronously
      if (updated.source === 'gps' && (!updated.name || !updated.district)) {
        fetchPlaceName(lat, lng).then((geo) => {
          if (geo && (geo.name || geo.district)) {
            setSelectedLocation((current) => {
              if (current && current.latitude === lat && current.longitude === lng) {
                return {
                  ...current,
                  name: geo.name || current.name,
                  district: geo.district || current.district,
                  state: geo.state || current.state,
                }
              }
              return current
            })
          }
        })
      }

      // Persist only non-sensitive manual preferences if marked as manual
      if (updated.source === 'manual') {
        try {
          localStorage.setItem(
            MANUAL_LOCATION_STORAGE_KEY,
            JSON.stringify({
              latitude: updated.latitude,
              longitude: updated.longitude,
              name: updated.name,
              district: updated.district,
              state: updated.state,
              source: 'manual',
            })
          )
        } catch (err) {
          console.warn('Failed to save manual location preference:', err)
        }
      }
      return updated
    })
  }, [])

  // Explicitly set a manual location (e.g. user selected from city list or map search)
  const setManualLocation = useCallback((manualLocation) => {
    if (!manualLocation || manualLocation.latitude === undefined || manualLocation.longitude === undefined) {
      console.error('Invalid manual location provided:', manualLocation)
      return
    }

    const payload = {
      latitude: Number(manualLocation.latitude),
      longitude: Number(manualLocation.longitude),
      name: manualLocation.name || null,
      district: manualLocation.district || null,
      state: manualLocation.state || null,
      accuracy: null,
      source: 'manual',
      updatedAt: new Date().toISOString(),
    }

    setSelectedLocation((prev) => {
      if (
        prev &&
        prev.latitude === payload.latitude &&
        prev.longitude === payload.longitude &&
        prev.name === payload.name &&
        prev.source === 'manual'
      ) {
        return prev
      }
      return payload
    })

    try {
      localStorage.setItem(
        MANUAL_LOCATION_STORAGE_KEY,
        JSON.stringify({
          latitude: payload.latitude,
          longitude: payload.longitude,
          name: payload.name,
          district: payload.district,
          state: payload.state,
          source: 'manual',
        })
      )
    } catch (err) {
      console.warn('Failed to save manual location preference:', err)
    }
  }, [])

  // Clear stored manual location preference and active state
  const clearLocation = useCallback(() => {
    setSelectedLocation(null)
    try {
      localStorage.removeItem(MANUAL_LOCATION_STORAGE_KEY)
    } catch (e) {
      console.warn('Failed to remove manual location preference:', e)
    }
  }, [])

  // Switch to GPS mode and clear manual preference override
  const useCurrentGpsLocation = useCallback((gpsCoords) => {
    try {
      localStorage.removeItem(MANUAL_LOCATION_STORAGE_KEY)
    } catch (e) {
      // ignore
    }

    if (gpsCoords && gpsCoords.latitude !== undefined && gpsCoords.longitude !== undefined) {
      const payload = {
        latitude: Number(gpsCoords.latitude),
        longitude: Number(gpsCoords.longitude),
        name: gpsCoords.name || null,
        district: gpsCoords.district || null,
        state: gpsCoords.state || null,
        accuracy: gpsCoords.accuracy ?? null,
        source: 'gps',
        updatedAt: new Date().toISOString(),
      }
      if (payload.source === 'gps' && (!payload.name || !payload.district)) {
        fetchPlaceName(payload.latitude, payload.longitude).then((geo) => {
          if (geo && (geo.name || geo.district)) {
            setSelectedLocation((current) => {
              if (current && current.latitude === payload.latitude && current.longitude === payload.longitude) {
                return {
                  ...current,
                  name: geo.name || current.name,
                  district: geo.district || current.district,
                  state: geo.state || current.state,
                }
              }
              return current
            })
          }
        })
      }
      setSelectedLocation((prev) => {
        if (
          prev &&
          prev.latitude === payload.latitude &&
          prev.longitude === payload.longitude &&
          prev.source === 'gps'
        ) {
          return prev
        }
        return payload
      })
    }
  }, [])

  return (
    <LocationContext.Provider
      value={{
        selectedLocation,
        updateLocation,
        setManualLocation,
        clearLocation,
        useCurrentGpsLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  )
}
