import { Box, CircularProgress } from '@mui/material';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from 'src/redux/store/store';
import {
  getPushNotificationByIdRequest,
  updatePushNotificationRequest,
  sendPushNotificationRequest,
  selectPushNotificationCurrent,
  selectPushNotificationCurrentLoading,
  selectPushNotificationUpdateLoading,
  selectPushNotificationSendLoading,
  clearCurrent,
} from 'src/redux/store/pushNotificationSlice';
import type { CreatePushNotificationRequest } from 'src/types/gen/cms/cms/push-notifications/push-notification';
import { PushNotificationForm } from './push-notification-form';

export function PushNotificationEditView() {
  const navigate = useNavigate();
  const { id } = useParams();
  const dispatch = useAppDispatch();

  const current = useAppSelector(selectPushNotificationCurrent);
  const fetchLoading = useAppSelector(selectPushNotificationCurrentLoading);
  const updateLoading = useAppSelector(selectPushNotificationUpdateLoading);
  const sendLoading = useAppSelector(selectPushNotificationSendLoading);

  useEffect(() => {
    if (id) dispatch(getPushNotificationByIdRequest({ id }));
    return () => {
      dispatch(clearCurrent());
    };
  }, [dispatch, id]);

  const handleSubmit = (data: CreatePushNotificationRequest) => {
    if (id) {
      dispatch(
        updatePushNotificationRequest({
          id,
          data,
          onSuccess: () => {
            navigate('/push-notification');
          },
        })
      );
    }
  };

  const handleSend = (data: CreatePushNotificationRequest) => {
    if (!id) return;
    dispatch(
      updatePushNotificationRequest({
        id,
        data: {
          pushNotificationId: id,
          category: data.category,
          title: data.title,
          subtitle: data.subtitle,
          url: data.url,
          scheduledAt: data.scheduledAt,
        },
        silent: true,
        onSuccess: () => {
          dispatch(
            sendPushNotificationRequest({
              id,
              onSuccess: () => navigate('/push-notification'),
            })
          );
        },
      })
    );
  };

  const handleCancel = () => {
    navigate('/push-notification');
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

  const formData = {
    category: current.category,
    title: current.title,
    subtitle: current.subtitle,
    url: current.url ?? undefined,
    scheduledAt: current.scheduledAt ?? undefined,
  };

  return (
    <Box sx={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
      <PushNotificationForm
        mode="edit"
        initialData={formData}
        onSubmit={handleSubmit}
        onSend={handleSend}
        onCancel={handleCancel}
        loading={updateLoading || sendLoading}
      />
    </Box>
  );
}
