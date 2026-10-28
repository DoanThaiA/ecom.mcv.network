import { Helmet } from 'react-helmet-async';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CONFIG } from 'src/config-global';
import { usePageTitle } from 'src/contexts/page-title-context';
import { PushNotificationView } from 'src/sections/push-notification';

export default function PushNotificationPage() {
  const { t } = useTranslation();
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle(t('pushNotificationManagement'));
  }, [t, setTitle]);

  return (
    <>
      <Helmet>
        <title>{`${t('pushNotificationManagement')} - ${CONFIG.appName}`}</title>
      </Helmet>
      <PushNotificationView />
    </>
  );
}
