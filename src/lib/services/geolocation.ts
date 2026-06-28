export interface GeoLocation {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: string;
}

export async function getCurrentPosition(): Promise<GeoLocation> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        timestamp: new Date(pos.timestamp).toISOString(),
      }),
      (err) => reject(new Error(getGeolocationErrorMessage(err))),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  });
}

export async function watchPosition(
  onPosition: (location: GeoLocation) => void,
  onError?: (error: string) => void
): Promise<number> {
  if (!navigator.geolocation) {
    onError?.('Geolocation not supported');
    return 0;
  }
  return navigator.geolocation.watchPosition(
    (pos) => onPosition({
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
      timestamp: new Date(pos.timestamp).toISOString(),
    }),
    (err) => onError?.(getGeolocationErrorMessage(err)),
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
  );
}

export function clearWatch(watchId: number): void {
  navigator.geolocation.clearWatch(watchId);
}

function getGeolocationErrorMessage(error: GeolocationPositionError): string {
  switch (error.code) {
    case error.PERMISSION_DENIED: return 'Location permission denied';
    case error.POSITION_UNAVAILABLE: return 'Location unavailable';
    case error.TIMEOUT: return 'Location request timed out';
    default: return 'Unknown geolocation error';
  }
}

export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}
