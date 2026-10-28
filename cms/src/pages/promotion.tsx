import { Helmet } from 'react-helmet-async';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CONFIG } from 'src/config-global';
import { usePageTitle } from 'src/contexts/page-title-context';
import { PromotionView } from 'src/sections/promotion';

// ----------------------------------------------------------------------

export default function PromotionPage() {
  const { t } = useTranslation();
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle(t('promotionManagement'));
  }, [t, setTitle]);

  return (
    <>
      <Helmet>
        <title>{`${t('promotionManagement')} - ${CONFIG.appName}`}</title>
      </Helmet>

      <PromotionView />
    </>
  );
}
