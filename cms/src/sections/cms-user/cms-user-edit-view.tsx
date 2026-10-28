import { Box, CircularProgress } from '@mui/material';
import { useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from 'src/redux/store/store';
import {
  getCmsUserByIdRequest,
  updateCmsUserRequest,
  selectCurrentCmsUser,
  selectCurrentCmsUserLoading,
  selectUpdateCmsUserLoading,
  clearCurrentCmsUser,
} from 'src/redux/store/cmsUserSlice';
import { CmsUserForm, type CmsUserFormData } from './cms-user-form';
import type { UpdateCmsUserData } from 'src/repositories/cms-user.repository';

// ----------------------------------------------------------------------

export function CmsUserEditView() {
  const navigate = useNavigate();
  const { id } = useParams();
  const dispatch = useAppDispatch();

  const currentUser = useAppSelector(selectCurrentCmsUser);
  const fetchLoading = useAppSelector(selectCurrentCmsUserLoading);
  const updateLoading = useAppSelector(selectUpdateCmsUserLoading);

  // Fetch user data on mount
  useEffect(() => {
    if (id) {
      dispatch(getCmsUserByIdRequest({ id }));
    }

    return () => {
      dispatch(clearCurrentCmsUser());
    };
  }, [dispatch, id]);

  const handleSubmit = useCallback(
    (data: CmsUserFormData) => {
      if (!id) return;

      const payload: UpdateCmsUserData = {
        permissions: data.permissions,
        status: data.status,
      };

      dispatch(
        updateCmsUserRequest({
          id,
          data: payload,
          onSuccess: () => {
            navigate('/cms-users');
          },
        })
      );
    },
    [dispatch, id, navigate]
  );

  const handleCancel = useCallback(() => {
    navigate('/cms-users');
  }, [navigate]);

  const formData: CmsUserFormData | null = useMemo(() => {
    if (!currentUser) return null;
    return {
      accountType: currentUser.accountType,
      email: currentUser.email,
      firstName: currentUser.firstName ?? '',
      lastName: currentUser.lastName ?? '',
      phone: currentUser.phone ?? '',
      password: '',
      permissions: currentUser.permissions ?? [],
      affiliateId: currentUser.affiliateId ?? '',
      status: currentUser.status,
    };
  }, [currentUser]);

  // Show loading state while fetching
  if (fetchLoading || !formData) {
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
    <Box
      sx={{
        height: 'calc(100vh - 64px)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CmsUserForm
        mode="edit"
        initialData={formData}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={updateLoading}
      />
    </Box>
  );
}
