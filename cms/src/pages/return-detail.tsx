import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { CONFIG } from 'src/config-global';
import { usePageTitle } from 'src/contexts/page-title-context';
import { ReturnDetailView } from 'src/sections/return';

// ----------------------------------------------------------------------

export default function ReturnDetailPage() {
  const { t } = useTranslation();
  const { setTitle } = usePageTitle();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    setTitle(`${t('returnDetail')} #${id?.slice(-4) || ''}`);
  }, [t, setTitle, id]);

  return (
    <>
      <Helmet>
        <title>{`${t('returnDetail')} - ${CONFIG.appName}`}</title>
        <meta name="description" content="Return Detail" />
        <meta name="keywords" content="cchat,cms,return,detail" />
      </Helmet>

      <ReturnDetailView />
    </>
  );
}
