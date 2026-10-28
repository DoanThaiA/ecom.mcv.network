import { Helmet } from 'react-helmet-async';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CONFIG } from 'src/config-global';
import { usePageTitle } from 'src/contexts/page-title-context';
import { ShockDealCreateView } from 'src/sections/shock-deal';

// ----------------------------------------------------------------------

export default function ShockDealCreatePage() {
  const { t } = useTranslation();
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle(t('createShockDeal'));
  }, [t, setTitle]);

  return (
    <>
      <Helmet>
        <title>{`${t('createShockDeal')} - ${CONFIG.appName}`}</title>
      </Helmet>

      <ShockDealCreateView />
    </>
  );
}
