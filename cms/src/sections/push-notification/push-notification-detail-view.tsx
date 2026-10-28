import { Box, Card, Typography, Button, Chip, Stack, CircularProgress } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDialog } from 'src/hooks';
import { useAppDispatch, useAppSelector } from 'src/redux/store/store';
import {
  getPushNotificationByIdRequest,
  recallPushNotificationRequest,
  deletePushNotificationRequest,
  selectPushNotificationCurrent,
  selectPushNotificationCurrentLoading,
  selectPushNotificationRecallLoading,
  clearCurrent,
} from 'src/redux/store/pushNotificationSlice';
import {
  PushNotificationStatus,
  PushNotificationCategory,
} from 'src/types/gen/shared/shared/common/enums';
import { DeleteConfirmDialog } from 'src/components/dialog';
import { formatDate } from 'src/utils/format';

const STATUS_COLOR: Record<number, 'default' | 'warning' | 'success' | 'error'> = {
  [PushNotificationStatus.PUSH_NOTIFICATION_STATUS_DRAFT]: 'default',
  [PushNotificationStatus.PUSH_NOTIFICATION_STATUS_PENDING]: 'warning',
  [PushNotificationStatus.PUSH_NOTIFICATION_STATUS_SENT]: 'success',
  [PushNotificationStatus.PUSH_NOTIFICATION_STATUS_RECALLED]: 'error',
};

export function PushNotificationDetailView() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const dispatch = useAppDispatch();

  const current = useAppSelector(selectPushNotificationCurrent);
  const fetchLoading = useAppSelector(selectPushNotificationCurrentLoading);
  const recallLoading = useAppSelector(selectPushNotificationRecallLoading);

  useEffect(() => {
    if (id) dispatch(getPushNotificationByIdRequest({ id }));
    return () => {
      dispatch(clearCurrent());
    };
  }, [dispatch, id]);

  const getStatusLabel = (status: PushNotificationStatus): string => {
    const labels: Record<number, string> = {
      [PushNotificationStatus.PUSH_NOTIFICATION_STATUS_DRAFT]: t('pushNotificationStatusDraft'),
      [PushNotificationStatus.PUSH_NOTIFICATION_STATUS_PENDING]: t('pushNotificationStatusPending'),
      [PushNotificationStatus.PUSH_NOTIFICATION_STATUS_SENT]: t('pushNotificationStatusSent'),
      [PushNotificationStatus.PUSH_NOTIFICATION_STATUS_RECALLED]: t(
        'pushNotificationStatusRecalled'
      ),
    };
    return labels[status] || '';
  };

  const getCategoryLabel = (category: PushNotificationCategory): string => {
    const labels: Record<number, string> = {
      [PushNotificationCategory.PUSH_NOTIFICATION_CATEGORY_NEWS]: t('pushNotificationCategoryNews'),
      [PushNotificationCategory.PUSH_NOTIFICATION_CATEGORY_PROMOTION]: t(
        'pushNotificationCategoryPromotion'
      ),
    };
    return labels[category] || '';
  };

  const deleteDialog = useDialog();

  const handleRecall = () => {
    if (id) {
      dispatch(
        recallPushNotificationRequest({
          id,
          onSuccess: () => navigate('/push-notification'),
        })
      );
    }
  };

  const handleDelete = () => {
    if (id) {
      dispatch(
        deletePushNotificationRequest({
          id,
          onSuccess: () => {
            deleteDialog.close();
            navigate('/push-notification');
          },
        })
      );
    }
  };

  if (fetchLoading || !current) {
    return (
      <Box
        sx={{
          height: 'calc(100vh - 64px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, minHeight: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
      <Card sx={{ p: 3 }}>
        <Stack
          spacing={2}
          sx={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            columnGap: 2,
            rowGap: 1.5,
            alignItems: 'baseline',
          }}
        >
          <Typography variant="subtitle2" color="text.secondary">
            {t('pushNotificationCategory')}:
          </Typography>
          <Typography>{getCategoryLabel(current.category)}</Typography>

          <Typography variant="subtitle2" color="text.secondary">
            {t('pushNotificationTitle')}:
          </Typography>
          <Typography>{current.title}</Typography>

          <Typography variant="subtitle2" color="text.secondary">
            {t('pushNotificationSubtitle')}:
          </Typography>
          <Typography sx={{ whiteSpace: 'pre-wrap' }}>{current.subtitle}</Typography>

          {current.url && (
            <>
              <Typography variant="subtitle2" color="text.secondary">
                {t('pushNotificationUrl')}:
              </Typography>
              <Typography>{current.url}</Typography>
            </>
          )}

          <Typography variant="subtitle2" color="text.secondary">
            {t('pushNotificationSendTime')}:
          </Typography>
          <Typography>
            {current.sentAt
              ? formatDate(current.sentAt)
              : current.scheduledAt
                ? formatDate(current.scheduledAt)
                : '-'}
          </Typography>

          <Typography variant="subtitle2" color="text.secondary">
            {t('pushNotificationStatus')}:
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Chip
              label={getStatusLabel(current.status)}
              color={STATUS_COLOR[current.status]}
              size="small"
            />
          </Box>

          <Typography variant="subtitle2" color="text.secondary">
            {t('pushNotificationReadersCount')}:
          </Typography>
          <Typography>{current.readersCount}</Typography>
        </Stack>
      </Card>

      <Stack direction="row" justifyContent="center" spacing={2} sx={{ mt: 'auto', pt: 3 }}>
        <Button variant="outlined" onClick={() => navigate('/push-notification')}>
          {t('goBack')}
        </Button>
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={() => deleteDialog.open()}
          sx={{
            color: 'error.main',
            borderColor: 'error.main',
            '&:hover': { borderColor: 'error.main' },
          }}
        >
          {t('delete')}
        </Button>
        {current.status === PushNotificationStatus.PUSH_NOTIFICATION_STATUS_SENT && (
          <Button
            variant="contained"
            onClick={handleRecall}
            disabled={recallLoading}
            sx={{ bgcolor: '#0165FC', '&:hover': { bgcolor: '#0052CC' } }}
          >
            {t('recallNotification')}
          </Button>
        )}
      </Stack>

      <DeleteConfirmDialog
        open={deleteDialog.isOpen}
        title="confirm"
        message={t('deletePushNotificationMessage')}
        onClose={deleteDialog.close}
        onConfirm={handleDelete}
      />
    </Box>
  );
}
