import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { CONFIG } from 'src/config-global';
import { usePageTitle } from 'src/contexts/page-title-context';
import { MyWithdrawalRequestDetailView } from 'src/sections/affiliate-portal/my-withdrawal-request-detail-view';

export default function MyWithdrawalRequestDetailPage() {
  const { t } = useTranslation();
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle(t('withdrawalRequestDetail'));
  }, [t, setTitle]);

  return (
    <>
      <Helmet>
        <title>{`${t('withdrawalRequestDetail')} | ${CONFIG.appName}`}</title>
      </Helmet>
      <MyWithdrawalRequestDetailView />
    </>
  );
}
