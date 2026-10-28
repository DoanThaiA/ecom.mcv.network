import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { CONFIG } from 'src/config-global';
import { usePageTitle } from 'src/contexts/page-title-context';
import { ReviewView } from 'src/sections/review';

// ----------------------------------------------------------------------

export default function ReviewPage() {
  const { t } = useTranslation();
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle(t('reviewManagement'));
  }, [t, setTitle]);

  return (
    <>
      <Helmet>
        <title>{`${t('reviewManagement')} - ${CONFIG.appName}`}</title>
        <meta name="description" content="Review Management" />
        <meta name="keywords" content="cchat,cms,review" />
      </Helmet>

      <ReviewView />
    </>
  );
}
