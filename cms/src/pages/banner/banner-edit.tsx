import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CONFIG } from 'src/config-global';
import { usePageTitle } from 'src/contexts/page-title-context';
import { BannerForm } from 'src/sections/banner';
import { useAppDispatch } from 'src/redux/store/store';
import { getBannerByIdRequest } from 'src/redux/store/bannerSlice';
import type { BannerListItem } from 'src/types/gen/shared/shared/banners/banner';
import { Box, CircularProgress } from '@mui/material';

export default function BannerEditPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { setTitle } = usePageTitle();
  const [banner, setBanner] = useState<BannerListItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTitle(t('editBanner'));
  }, [t, setTitle]);

  useEffect(() => {
    if (id) {
      dispatch(
        getBannerByIdRequest({
          id,
          onSuccess: (data) => {
            setBanner(data);
            setLoading(false);
          },
        })
      );
    }
  }, [id, dispatch]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`${t('editBanner')} - ${CONFIG.appName}`}</title>
      </Helmet>
      {banner && <BannerForm banner={banner} isEdit />}
    </>
  );
}
