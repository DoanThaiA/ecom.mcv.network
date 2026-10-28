import { Helmet } from 'react-helmet-async';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CONFIG } from 'src/config-global';
import { usePageTitle } from 'src/contexts/page-title-context';
import { PushNotificationEditView } from 'src/sections/push-notification';

export default function PushNotificationEditPage() {
  const { t } = useTranslation();
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle(t('editPushNotification'));
  }, [t, setTitle]);

  return (
    <>
      <Helmet>
        <title>{`${t('editPushNotification')} - ${CONFIG.appName}`}</title>
      </Helmet>
      <PushNotificationEditView />
    </>
  );
}
