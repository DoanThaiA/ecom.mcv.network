import { StrictMode, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { Provider } from 'react-redux';

import { BrowserRouter } from 'react-router-dom';
import App from './app';
import { renderAccessGate, shouldShowAccessGate } from './components/access-gate/access-gate';
import { PageTitleProvider } from './contexts/page-title-context';
import './i18next';
import { store } from './redux/store/store';
import ChunkErrorBoundary from './routes/hooks/chuck-error';

// ----------------------------------------------------------------------

const rootElement = document.getElementById('root') as HTMLElement;

if (shouldShowAccessGate()) {
  renderAccessGate(rootElement);
} else {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <HelmetProvider>
        <Provider store={store}>
          <BrowserRouter>
            <PageTitleProvider>
              <ChunkErrorBoundary>
                <Suspense>
                  <App />
                </Suspense>
              </ChunkErrorBoundary>
            </PageTitleProvider>
          </BrowserRouter>
        </Provider>
      </HelmetProvider>
    </StrictMode>
  );
}
