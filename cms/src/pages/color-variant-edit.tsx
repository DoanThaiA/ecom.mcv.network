import { Helmet } from 'react-helmet-async';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CONFIG } from 'src/config-global';
import { usePageTitle } from 'src/contexts/page-title-context';
import { ColorVariantEditView } from 'src/sections/color-variant';

// ----------------------------------------------------------------------

export default function ColorVariantEditPage() {
  const { t } = useTranslation();
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle(t('updateColorVariant'));
  }, [t, setTitle]);

  return (
    <>
      <Helmet>
        <title>{`${t('updateColorVariant')} - ${CONFIG.appName}`}</title>
        <meta name="description" content="Update Color Variant" />
        <meta name="keywords" content="cchat,cms,color-variant,edit" />
      </Helmet>

      <ColorVariantEditView />
    </>
  );
}
