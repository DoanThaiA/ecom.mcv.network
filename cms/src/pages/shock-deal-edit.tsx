import { Helmet } from 'react-helmet-async';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CONFIG } from 'src/config-global';
import { usePageTitle } from 'src/contexts/page-title-context';
import { ShockDealEditView } from 'src/sections/shock-deal';

// ----------------------------------------------------------------------

export default function ShockDealEditPage() {
  const { t } = useTranslation();
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle(t('editShockDeal'));
  }, [t, setTitle]);

  return (
    <>
      <Helmet>
        <title>{`${t('editShockDeal')} - ${CONFIG.appName}`}</title>
      </Helmet>

      <ShockDealEditView />
    </>
  );
}
