import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';

import type { Promotion } from 'src/types/promotion';
import {
  PromotionStatus,
  PromotionType,
  promotionTypeToKey,
  promotionSubTypeToKey,
  promotionStatusToKey,
  getPromotionStatusColor,
} from 'src/types/promotion';
import { formatDate, toISOString } from 'src/utils/format';

// ----------------------------------------------------------------------

interface PromotionDetailHeaderProps {
  promotion: Promotion;
  onBack: () => void;
  onPauseResume: () => void;
  onDuplicate: () => void;
  pauseLoading: boolean;
}

export function PromotionDetailHeader({
  promotion,
  onBack,
  onPauseResume,
  onDuplicate,
  pauseLoading,
}: PromotionDetailHeaderProps) {
  const { t } = useTranslation();

  const type = promotion.type;
  const subType =
    promotion.bundleDealConfig?.subType ??
    promotion.orderDiscountConfig?.subType ??
    promotion.productDiscountConfig?.subType;

  const startStr = toISOString(promotion.startTime);
  const endStr = toISOString(promotion.endTime);
  const timeRange = `${startStr ? formatDate(startStr) : '-'} - ${endStr ? formatDate(endStr) : '-'}`;

  const isPaused = promotion.status === PromotionStatus.PROMOTION_STATUS_PAUSED;
  const isEnded = promotion.status === PromotionStatus.PROMOTION_STATUS_ENDED;

  return (
    <Box>
      <Card sx={{ p: 3, mb: 3 }}>
        <Stack spacing={1}>
          <Typography variant="body1">
            <strong>{t('promotionType')}:</strong> {t(promotionTypeToKey(type))}
          </Typography>
          {type !== PromotionType.PROMOTION_TYPE_PRODUCT_DISCOUNT && (
            <Typography variant="body1">
              <strong>{t('classification')}:</strong>{' '}
              {promotionSubTypeToKey(type, subType) !== '-'
                ? t(promotionSubTypeToKey(type, subType))
                : '-'}
            </Typography>
          )}
          <Typography variant="body1">
            <strong>{t('programName')}:</strong> {promotion.name}
          </Typography>
          <Typography variant="body1">
            <strong>{t('promotionTime')}:</strong> {timeRange}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body1">
              <strong>{t('status')}:</strong>
            </Typography>
            <Chip
              label={t(promotionStatusToKey(promotion.status))}
              color={getPromotionStatusColor(promotion.status)}
              size="small"
            />
          </Box>
        </Stack>
      </Card>

      {/* Action buttons at bottom */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          bgcolor: 'background.paper',
          borderTop: '1px solid',
          borderColor: 'divider',
          py: 2,
          px: 3,
          display: 'flex',
          justifyContent: 'center',
          gap: 2,
          zIndex: 10,
        }}
      >
        <Button variant="outlined" onClick={onBack}>
          {t('goBack')}
        </Button>
        {!isEnded && (
          <Button variant="outlined" onClick={onPauseResume} disabled={pauseLoading}>
            {isPaused ? t('resume') : t('pause')}
          </Button>
        )}
        <Button variant="contained" onClick={onDuplicate}>
          {t('duplicatePromotion')}
        </Button>
      </Box>
    </Box>
  );
}
