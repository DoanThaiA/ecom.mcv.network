import 'src/global.css';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BreadcrumbProvider } from 'src/contexts/breadcrumb-context';
import { ThemeProvider } from 'src/theme/theme-provider';
import { Router } from './routes/sections';

// ----------------------------------------------------------------------

export default function App() {
  return (
    <ThemeProvider>
      <BreadcrumbProvider>
        <Router />
        <ToastContainer />
      </BreadcrumbProvider>
    </ThemeProvider>
  );
}
