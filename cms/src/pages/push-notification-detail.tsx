import { Helmet } from 'react-helmet-async';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CONFIG } from 'src/config-global';
import { usePageTitle } from 'src/contexts/page-title-context';
import { PushNotificationDetailView } from 'src/sections/push-notification';

export default function PushNotificationDetailPage() {
  const { t } = useTranslation();
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle(t('pushNotificationDetail'));
  }, [t, setTitle]);

  return (
    <>
      <Helmet>
        <title>{`${t('pushNotificationDetail')} - ${CONFIG.appName}`}</title>
      </Helmet>
      <PushNotificationDetailView />
    </>
  );
}
