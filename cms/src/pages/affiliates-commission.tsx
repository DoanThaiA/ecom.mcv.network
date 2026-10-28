import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { CONFIG } from 'src/config-global';
import { usePageTitle } from 'src/contexts/page-title-context';
import { AffiliatesCommissionView } from 'src/sections/affiliates';

export default function AffiliatesCommissionPage() {
  const { t } = useTranslation();
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle(t('affiliatesCommission'));
  }, [t, setTitle]);

  return (
    <>
      <Helmet>
        <title>{`${t('affiliatesCommission')} - ${CONFIG.appName}`}</title>
      </Helmet>
      <AffiliatesCommissionView />
    </>
  );
}
