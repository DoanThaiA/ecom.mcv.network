'use client';

import { Dialog, Flex, Text, VisuallyHidden } from '@radix-ui/themes';
import { GoogleMapPicker } from '@/components/map/GoogleMapPicker';
import { useTranslations } from 'next-intl';
import { preventDialogCloseOnToast } from '@/lib/utils/dialog';

interface LocationPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLocationConfirm: (location: { lat: number; lng: number }) => void;
  initialLocation?: { lat: number; lng: number };
}

export function LocationPickerDialog({
  open,
  onOpenChange,
  onLocationConfirm,
  initialLocation,
}: LocationPickerDialogProps) {
  const t = useTranslations('map');

  const handleLocationSelect = (location: { lat: number; lng: number }) => {
    onLocationConfirm(location);
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content
        maxWidth="600px"
        onPointerDownOutside={preventDialogCloseOnToast}
      >
        <Dialog.Title>{t('selectLocation')}</Dialog.Title>

        <Flex direction="column" gap="4" className="mt-4">
          <Text size="2" className="text-gray-600">
            {t('clickMapInstruction')}
          </Text>

          <GoogleMapPicker
            onLocationSelect={handleLocationSelect}
            initialLocation={initialLocation}
          />
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
