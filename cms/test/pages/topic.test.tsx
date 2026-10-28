import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import Page from 'src/pages/topic';
import { HelmetProvider } from 'react-helmet-async';

vi.mock('src/config-global', () => ({ CONFIG: { appName: 'CCHAT CMS' } }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => ({ topicManagement: 'Topic Management' }[k] || k) }) }));
const mockSetTitle = vi.fn();
vi.mock('src/contexts/page-title-context', () => ({ usePageTitle: () => ({ setTitle: mockSetTitle }) }));
vi.mock('src/sections/topic', () => ({ TopicView: () => <div data-testid="view">View</div> }));

describe('TopicPage', () => {
  it('renders', () => expect(render(<HelmetProvider><Page /></HelmetProvider>).getByTestId('view')).toBeInTheDocument());
  it('calls setTitle', () => { render(<HelmetProvider><Page /></HelmetProvider>); expect(mockSetTitle).toHaveBeenCalledWith('Topic Management'); });
});
