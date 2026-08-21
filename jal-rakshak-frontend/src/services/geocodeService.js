/**
 * Jal Rakshak AI - Universal Reverse Geocoding Service
 * Converts raw GPS coordinates (lat, lng) to human-readable real place names,
 * landmarks, districts, and full postal addresses.
 */

// In-memory cache for fast lookup
const geocodeCache = new Map()

// Major district bounding boxes and center points for instant offline lookup
const KNOWN_REGION_FALLBACKS = [
  { name: 'Cuttack (CDA & Ring Road)', district: 'Cuttack', state: 'Odisha', lat: 20.4625, lng: 85.8830, radius: 0.15 },
  { name: 'Bhubaneswar (Khurda)', district: 'Khurda', state: 'Odisha', lat: 20.2961, lng: 85.8245, radius: 0.18 },
  { name: 'Puri Coastal Zone', district: 'Puri', state: 'Odisha', lat: 19.8135, lng: 85.8312, radius: 0.15 },
  { name: 'Kendrapara Lowlands', district: 'Kendrapara', state: 'Odisha', lat: 20.5020, lng: 86.4230, radius: 0.25 },
  { name: 'Jagatsinghpur Coastal Basin', district: 'Jagatsinghpur', state: 'Odisha', lat: 20.2675, lng: 86.1667, radius: 0.20 },
  { name: 'Jajpur (Baitarani Flood Zone)', district: 'Jajpur', state: 'Odisha', lat: 20.8500, lng: 86.3333, radius: 0.25 },
  { name: 'Balasore Coastal Belt', district: 'Balasore', state: 'Odisha', lat: 21.4934, lng: 86.9135, radius: 0.25 },
  { name: 'Bhadrak Lowlands', district: 'Bhadrak', state: 'Odisha', lat: 21.0544, lng: 86.4955, radius: 0.20 },
  { name: 'Sambalpur (Hirakud Dam)', district: 'Sambalpur', state: 'Odisha', lat: 21.4669, lng: 83.9812, radius: 0.25 },
  { name: 'Guwahati (Brahmaputra Basin)', district: 'Kamrup', state: 'Assam', lat: 26.1445, lng: 91.7362, radius: 0.30 },
  { name: 'Patna (Ganga Basin)', district: 'Patna', state: 'Bihar', lat: 25.5941, lng: 85.1376, radius: 0.30 },
]

function getOfflineFallback(lat, lng) {
  let closest = null
  let minDistance = Infinity

  for (const region of KNOWN_REGION_FALLBACKS) {
    const dLat = region.lat - lat
    const dLng = region.lng - lng
    const dist = Math.sqrt(dLat * dLat + dLng * dLng)
    if (dist < minDistance && dist <= region.radius) {
      minDistance = dist
      closest = region
    }
  }

  if (closest) {
    return {
      formattedAddress: `${closest.name}, ${closest.district}, ${closest.state}, India`,
      shortName: `${closest.name}, ${closest.district}`,
      landmark: closest.name,
      district: closest.district,
      city: closest.district,
      state: closest.state,
      country: 'India',
      latitude: lat,
      longitude: lng,
      isFallback: true,
    }
  }

  return {
    formattedAddress: `Coordinates: ${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`,
    shortName: `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`,
    landmark: `Lat ${lat.toFixed(4)}°`,
    district: 'Odisha',
    city: 'Disaster Zone',
    state: 'Odisha',
    country: 'India',
    latitude: lat,
    longitude: lng,
    isFallback: true,
  }
}

/**
 * Reverse Geocode coordinates to human-readable place name
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<Object>}
 */
export async function reverseGeocode(latitude, longitude) {
  if (typeof latitude !== 'number' || typeof longitude !== 'number' || isNaN(latitude) || isNaN(longitude)) {
    return null
  }

  const lat = Number(latitude)
  const lng = Number(longitude)
  const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`

  // Check in-memory cache
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey)
  }

  // Check localStorage cache
  try {
    const cached = localStorage.getItem(`geo_${cacheKey}`)
    if (cached) {
      const parsed = JSON.parse(cached)
      geocodeCache.set(cacheKey, parsed)
      return parsed
    }
  } catch (e) {
    // ignore
  }

  // 1. Primary Provider: OpenStreetMap Nominatim
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 4000)

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'en-IN,en;q=0.9',
        },
        signal: controller.signal,
      }
    )
    clearTimeout(timeoutId)

    if (res.ok) {
      const data = await res.json()
      if (data && data.address) {
        const addr = data.address
        const landmark =
          addr.suburb ||
          addr.neighbourhood ||
          addr.village ||
          addr.residential ||
          addr.road ||
          addr.town ||
          addr.commercial ||
          data.name ||
          ''

        const city = addr.city || addr.town || addr.municipality || addr.village || addr.county || ''
        const district = addr.state_district || addr.district || addr.county || city || 'Odisha'
        const state = addr.state || 'Odisha'
        const country = addr.country || 'India'
        const postalCode = addr.postcode || ''

        let shortName = ''
        if (landmark && city && landmark !== city) {
          shortName = `${landmark}, ${city}`
        } else if (landmark) {
          shortName = `${landmark}, ${district}`
        } else if (city) {
          shortName = `${city}, ${state}`
        } else {
          shortName = `${district}, ${state}`
        }

        const formattedAddress = [landmark, city, district, state, postalCode, country]
          .filter(Boolean)
          .filter((v, i, a) => a.indexOf(v) === i)
          .join(', ')

        const result = {
          formattedAddress: formattedAddress || data.display_name || `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`,
          shortName,
          landmark: landmark || city || district,
          district,
          city: city || district,
          state,
          country,
          postalCode,
          latitude: lat,
          longitude: lng,
          isFallback: false,
        }

        geocodeCache.set(cacheKey, result)
        try {
          localStorage.setItem(`geo_${cacheKey}`, JSON.stringify(result))
        } catch {
          // ignore
        }
        return result
      }
    }
  } catch (nominatimErr) {
    // Try secondary API
  }

  // 2. Secondary Provider: BigDataCloud Client-side Geocoding (Free, Fast)
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3500)

    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
      { signal: controller.signal }
    )
    clearTimeout(timeoutId)

    if (res.ok) {
      const data = await res.json()
      if (data && (data.locality || data.city || data.principalSubdivision)) {
        const landmark = data.locality || data.localityInfo?.administrative?.[3]?.name || ''
        const city = data.city || data.localityInfo?.administrative?.[2]?.name || ''
        const state = data.principalSubdivision || 'Odisha'
        const country = data.countryName || 'India'
        const postalCode = data.postcode || ''
        const district = city || state

        const shortName = landmark && city && landmark !== city ? `${landmark}, ${city}` : (landmark || city || state)
        const formattedAddress = [landmark, city, state, postalCode, country]
          .filter(Boolean)
          .filter((v, i, a) => a.indexOf(v) === i)
          .join(', ')

        const result = {
          formattedAddress,
          shortName,
          landmark: landmark || city,
          district,
          city,
          state,
          country,
          postalCode,
          latitude: lat,
          longitude: lng,
          isFallback: false,
        }

        geocodeCache.set(cacheKey, result)
        return result
      }
    }
  } catch (bdcErr) {
    // fallback
  }

  // 3. Smart Offline Region Fallback
  const fallbackResult = getOfflineFallback(lat, lng)
  geocodeCache.set(cacheKey, fallbackResult)
  return fallbackResult
}

/**
 * Format coordinates into a clean string e.g. "CDA Sector 9, Cuttack (20.46° N, 85.88° E)"
 */
export async function formatLocationLabel(latitude, longitude, includeCoords = false) {
  const geo = await reverseGeocode(latitude, longitude)
  if (!geo) return `${latitude?.toFixed?.(4) || latitude}, ${longitude?.toFixed?.(4) || longitude}`

  if (includeCoords) {
    return `${geo.shortName} (${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E)`
  }
  return geo.shortName || geo.formattedAddress
}
