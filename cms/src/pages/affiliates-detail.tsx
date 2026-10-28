import { Helmet } from 'react-helmet-async';
import { AffiliatesDetailView } from 'src/sections/affiliates/affiliates-detail-view';

export default function AffiliatesDetailPage() {
  return (
    <>
      <Helmet>
        <title>Affiliate Detail</title>
      </Helmet>
      <AffiliatesDetailView />
    </>
  );
}
