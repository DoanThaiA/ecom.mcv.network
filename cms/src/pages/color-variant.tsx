import { Helmet } from 'react-helmet-async';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CONFIG } from 'src/config-global';
import { usePageTitle } from 'src/contexts/page-title-context';
import { ColorVariantView } from 'src/sections/color-variant';

// ----------------------------------------------------------------------

export default function ColorVariantPage() {
  const { t } = useTranslation();
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle(t('colorVariantManagement'));
  }, [t, setTitle]);

  return (
    <>
      <Helmet>
        <title>{`${t('colorVariantManagement')} - ${CONFIG.appName}`}</title>
        <meta name="description" content="Color Variant Management" />
        <meta name="keywords" content="cchat,cms,color-variant" />
      </Helmet>

      <ColorVariantView />
    </>
  );
}
