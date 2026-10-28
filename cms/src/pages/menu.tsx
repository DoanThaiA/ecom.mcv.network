import { Helmet } from 'react-helmet-async';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CONFIG } from 'src/config-global';
import { usePageTitle } from 'src/contexts/page-title-context';
import { MenuView } from 'src/sections/menu';

// ----------------------------------------------------------------------

export default function MenuPage() {
  const { t } = useTranslation();
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle(t('menuManagement'));
  }, [t, setTitle]);

  return (
    <>
      <Helmet>
        <title>{`${t('menuManagement')} - ${CONFIG.appName}`}</title>
        <meta name="description" content="Menu Management" />
        <meta name="keywords" content="cchat,cms,menu" />
      </Helmet>

      <MenuView />
    </>
  );
}
