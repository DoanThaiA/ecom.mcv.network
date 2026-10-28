import { Helmet } from 'react-helmet-async';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CONFIG } from 'src/config-global';
import { usePageTitle } from 'src/contexts/page-title-context';
import { NewsView } from 'src/sections/news';

// ----------------------------------------------------------------------

export default function NewsPage() {
  const { t } = useTranslation();
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle(t('newsManagement'));
  }, [t, setTitle]);

  return (
    <>
      <Helmet>
        <title>{`${t('newsManagement')} - ${CONFIG.appName}`}</title>
        <meta name="description" content="News Management" />
        <meta name="keywords" content="cchat,cms,news,article" />
      </Helmet>

      <NewsView />
    </>
  );
}
