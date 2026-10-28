'use client';

import { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';
import { Box, Flex, Text } from '@radix-ui/themes';
import { useTranslations } from 'next-intl';

interface GoogleMapPickerProps {
  onLocationSelect: (_location: { lat: number; lng: number }) => void;
  initialLocation?: { lat: number; lng: number };
  height?: string;
  showConfirmButton?: boolean;
}

const getMapContainerStyle = (height: string) => ({
  width: '100%',
  height,
});

// Default center: Hanoi, Vietnam
const defaultCenter = {
  lat: 21.0285,
  lng: 105.8542,
};

export function GoogleMapPicker({
  onLocationSelect,
  initialLocation,
  height = '400px',
  showConfirmButton = true,
}: GoogleMapPickerProps) {
  const t = useTranslations('common');

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "AIzaSyCaKLtA7loFFSm0aEzsg1gY_BOP5xeUn74"
  });

  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(initialLocation || null);

  // Update selected location when initialLocation prop changes
  useEffect(() => {
    if (initialLocation) {
      setSelectedLocation(initialLocation);
    }
  }, [initialLocation]);

  const handleMapClick = useCallback((event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      const newLocation = { lat, lng };
      setSelectedLocation(newLocation);

      // If confirm button is hidden, auto-confirm on selection
      if (!showConfirmButton) {
        onLocationSelect(newLocation);
      }
    }
  }, [showConfirmButton, onLocationSelect]);

  if (loadError) {
    return (
      <Box className="p-4 bg-red-50 border border-red-200 rounded">
        <Text className="text-red-600">{t('loadError')}</Text>
      </Box>
    );
  }

  if (!isLoaded) {
    return (
      <Box className="flex items-center justify-center" style={{ height }}>
        <Text>{t("status.loading")}</Text>
      </Box>
    );
  }

  return (
    <Flex direction="column" gap="3">
      <GoogleMap
        mapContainerStyle={getMapContainerStyle(height)}
        zoom={15}
        center={selectedLocation || initialLocation || defaultCenter}
        onClick={handleMapClick}
      >
        {selectedLocation && <Marker position={selectedLocation} />}
      </GoogleMap>
    </Flex>
  );
}
