import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { WithdrawalRequestDetailView } from 'src/sections/withdrawal-request';

// ----------------------------------------------------------------------

export default function WithdrawalRequestDetailPage() {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>{t('withdrawalRequestDetail')}</title>
      </Helmet>

      <WithdrawalRequestDetailView />
    </>
  );
}
