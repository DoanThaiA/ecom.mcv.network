import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { CONFIG } from 'src/config-global';
import { usePageTitle } from 'src/contexts/page-title-context';
import { MyInfoView } from 'src/sections/affiliate-portal/my-info-view';

export default function MyInfoPage() {
  const { t } = useTranslation();
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle(t('myInfo'));
  }, [t, setTitle]);

  return (
    <>
      <Helmet>
        <title>{`${t('myInfo')} | ${CONFIG.appName}`}</title>
      </Helmet>
      <MyInfoView />
    </>
  );
}
