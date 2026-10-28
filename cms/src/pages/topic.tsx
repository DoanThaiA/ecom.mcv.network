import { Helmet } from 'react-helmet-async';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CONFIG } from 'src/config-global';
import { usePageTitle } from 'src/contexts/page-title-context';
import { TopicView } from 'src/sections/topic';

// ----------------------------------------------------------------------

export default function TopicPage() {
  const { t } = useTranslation();
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle(t('topicManagement'));
  }, [t, setTitle]);

  return (
    <>
      <Helmet>
        <title>{`${t('topicManagement')} - ${CONFIG.appName}`}</title>
        <meta name="description" content="Topic Management" />
        <meta name="keywords" content="cchat,cms,topic" />
      </Helmet>

      <TopicView />
    </>
  );
}
