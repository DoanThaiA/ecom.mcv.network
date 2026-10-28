import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from 'src/redux/store/store';
import {
  createPushNotificationRequest,
  selectPushNotificationCreateLoading,
} from 'src/redux/store/pushNotificationSlice';
import type { CreatePushNotificationRequest } from 'src/types/gen/cms/cms/push-notifications/push-notification';
import { PushNotificationForm } from './push-notification-form';

export function PushNotificationCreateView() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectPushNotificationCreateLoading);

  const handleSubmit = (data: CreatePushNotificationRequest) => {
    dispatch(
      createPushNotificationRequest({
        data,
        onSuccess: () => {
          navigate('/push-notification');
        },
      })
    );
  };

  const handleCancel = () => {
    navigate('/push-notification');
  };

  return (
    <Box sx={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
      <PushNotificationForm
        mode="create"
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
      />
    </Box>
  );
}
