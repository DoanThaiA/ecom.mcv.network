import { Helmet } from 'react-helmet-async';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CONFIG } from 'src/config-global';
import { usePageTitle } from 'src/contexts/page-title-context';
import { ColorVariantCreateView } from 'src/sections/color-variant';

// ----------------------------------------------------------------------

export default function ColorVariantCreatePage() {
  const { t } = useTranslation();
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle(t('createColorVariant'));
  }, [t, setTitle]);

  return (
    <>
      <Helmet>
        <title>{`${t('createColorVariant')} - ${CONFIG.appName}`}</title>
        <meta name="description" content="Create Color Variant" />
        <meta name="keywords" content="cchat,cms,color-variant,create" />
      </Helmet>

      <ColorVariantCreateView />
    </>
  );
}
