import { Helmet } from 'react-helmet-async';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CONFIG } from 'src/config-global';
import { usePageTitle } from 'src/contexts/page-title-context';
import { TopicEditView } from 'src/sections/topic';

// ----------------------------------------------------------------------

export default function TopicEditPage() {
  const { t } = useTranslation();
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle(t('updateTopic'));
  }, [t, setTitle]);

  return (
    <>
      <Helmet>
        <title>{`${t('updateTopic')} - ${CONFIG.appName}`}</title>
      </Helmet>

      <TopicEditView />
    </>
  );
}
