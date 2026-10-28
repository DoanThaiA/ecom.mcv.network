import { Box } from '@mui/material';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from 'src/redux/store/store';
import { createCmsUserRequest, selectCreateCmsUserLoading } from 'src/redux/store/cmsUserSlice';
import { CmsUserForm, type CmsUserFormData } from './cms-user-form';
import type { CreateCmsUserData } from 'src/repositories/cms-user.repository';

// ----------------------------------------------------------------------

export function CmsUserCreateView() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectCreateCmsUserLoading);

  const handleSubmit = useCallback(
    (data: CmsUserFormData) => {
      const payload: CreateCmsUserData = {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        accountType: data.accountType,
        permissions: data.permissions,
        status: data.status,
      };

      if (data.password) {
        payload.password = data.password;
      }

      if (data.affiliateId) {
        payload.affiliateId = data.affiliateId;
      }

      dispatch(
        createCmsUserRequest({
          data: payload,
          onSuccess: () => {
            navigate('/cms-users');
          },
        })
      );
    },
    [dispatch, navigate]
  );

  const handleCancel = useCallback(() => {
    navigate('/cms-users');
  }, [navigate]);

  return (
    <Box
      sx={{
        height: 'calc(100vh - 64px)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CmsUserForm
        mode="create"
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
      />
    </Box>
  );
}
