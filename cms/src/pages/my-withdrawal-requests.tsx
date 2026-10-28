import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { CONFIG } from 'src/config-global';
import { usePageTitle } from 'src/contexts/page-title-context';
import { MyWithdrawalRequestsView } from 'src/sections/affiliate-portal/my-withdrawal-requests-view';

export default function MyWithdrawalRequestsPage() {
  const { t } = useTranslation();
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle(t('myWithdrawalRequests'));
  }, [t, setTitle]);

  return (
    <>
      <Helmet>
        <title>{`${t('myWithdrawalRequests')} | ${CONFIG.appName}`}</title>
      </Helmet>
      <MyWithdrawalRequestsView />
    </>
  );
}
