import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { ZaloAuthCallbackView } from 'src/sections/auth';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{`Zalo OA Authentication - ${CONFIG.appName}`}</title>
      </Helmet>

      <ZaloAuthCallbackView />
    </>
  );
}
