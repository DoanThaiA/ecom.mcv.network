import { Helmet } from 'react-helmet-async';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CONFIG } from 'src/config-global';
import { usePageTitle } from 'src/contexts/page-title-context';
import { PushNotificationCreateView } from 'src/sections/push-notification';

export default function PushNotificationCreatePage() {
  const { t } = useTranslation();
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle(t('addPushNotification'));
  }, [t, setTitle]);

  return (
    <>
      <Helmet>
        <title>{`${t('addPushNotification')} - ${CONFIG.appName}`}</title>
      </Helmet>
      <PushNotificationCreateView />
    </>
  );
}
