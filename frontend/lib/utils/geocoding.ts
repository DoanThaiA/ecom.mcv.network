export interface GeocodeResult {
  lat: number;
  lng: number;
  formattedAddress?: string;
}

/**
 * Geocode a Vietnamese address to coordinates using Google Maps Geocoding API
 * @param street - Street address
 * @param ward - Ward name
 * @param district - District name
 * @param city - City name
 * @returns Promise with coordinates or null on error
 */
export async function geocodeAddress(
  street: string,
  ward: string,
  district: string,
  city: string
): Promise<GeocodeResult | null> {
  try {
    // Format address for geocoding (Vietnamese format)
    const address = `${street}, ${ward}, ${district}, ${city}, Vietnam`;

    // Use Google Geocoding API
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return null;
    }

    const encodedAddress = encodeURIComponent(address);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return {
        lat: location.lat,
        lng: location.lng,
        formattedAddress: data.results[0].formatted_address,
      };
    }

    return null;
  } catch {
    return null;
  }
}
