import { Helmet } from 'react-helmet-async';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CONFIG } from 'src/config-global';
import { usePageTitle } from 'src/contexts/page-title-context';
import { TopicCreateView } from 'src/sections/topic';

// ----------------------------------------------------------------------

export default function TopicCreatePage() {
  const { t } = useTranslation();
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle(t('createTopic'));
  }, [t, setTitle]);

  return (
    <>
      <Helmet>
        <title>{`${t('createTopic')} - ${CONFIG.appName}`}</title>
      </Helmet>

      <TopicCreateView />
    </>
  );
}
