import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { NhanhAuthCallbackView } from 'src/sections/auth';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{`Nhanh.vn Authentication - ${CONFIG.appName}`}</title>
      </Helmet>

      <NhanhAuthCallbackView />
    </>
  );
}
