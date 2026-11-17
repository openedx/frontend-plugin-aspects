import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { embedDashboard } from '@superset-ui/embedded-sdk';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import { Dashboard } from './Dashboard';

jest.mock('@superset-ui/embedded-sdk', () => ({
  embedDashboard: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  useParams: () => ({ courseId: 'course-v1:TEST+COURSE+RUN' }),
}));

// One object, as React Query returns it, so only the theme can re-run the embed effect.
const mockDashboardConfig = {
  supersetUrl: 'http://superset.example.com',
  dashboardId: 'dashboard-uuid',
  defaultCourseRun: 0,
  courseRuns: [{ native_filters: '(NATIVE_FILTER-1:())' }],
};

jest.mock('../../hooks', () => ({
  fetchGuestTokenFromBackend: jest.fn(),
  useDashboardConfig: () => ({ isPending: false, error: null, data: mockDashboardConfig }),
}));

const mockEmbeddedDashboard = {
  // Never settles: the component polls the size in a loop, which would outlive the test.
  getScrollSize: jest.fn(() => new Promise(() => {})),
  setThemeConfig: jest.fn(),
  setThemeMode: jest.fn(),
  unmount: jest.fn(),
};

const setBrand = (colors: Record<string, string>) => {
  Object.entries(colors).forEach(([name, value]) => document.documentElement.style.setProperty(name, value));
};

const renderDashboard = (themeVariant: string) => {
  const ui = (variant: string) => (
    <IntlProvider locale="en">
      <AppContext.Provider value={{ paragonTheme: { state: { themeVariant: variant } } }}>
        <Dashboard usageKey="course-v1:TEST+COURSE+RUN" title="Test course" />
      </AppContext.Provider>
    </IntlProvider>
  );
  const result = render(ui(themeVariant));
  return { ...result, switchTheme: (variant: string) => result.rerender(ui(variant)) };
};

describe('Dashboard theme', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    document.documentElement.removeAttribute('style');
    (embedDashboard as jest.Mock).mockResolvedValue(mockEmbeddedDashboard);
  });

  it('sends the light Studio theme with the page brand colours', async () => {
    setBrand({
      '--pgn-color-primary-base': '#254D32FF',
      '--pgn-color-link-base': '#254D32FF',
      '--pgn-color-btn-text-primary': '#FFFFFFFF',
    });

    renderDashboard('light');

    await waitFor(() => expect(mockEmbeddedDashboard.setThemeConfig).toHaveBeenCalledWith({
      theme_default: {
        algorithm: 'default',
        token: { colorPrimary: '#254D32FF', colorLink: '#254D32FF', colorTextLightSolid: '#FFFFFFFF' },
      },
    }));
  });

  it('sends the dark Studio theme when Studio is dark', async () => {
    setBrand({ '--pgn-color-primary-base': '#93C48BFF', '--pgn-color-btn-text-primary': '#1A1A1AFF' });

    renderDashboard('dark');

    await waitFor(() => expect(mockEmbeddedDashboard.setThemeConfig).toHaveBeenCalledWith({
      theme_default: {
        algorithm: 'dark',
        token: { colorPrimary: '#93C48BFF', colorLink: '#93C48BFF', colorTextLightSolid: '#1A1A1AFF' },
      },
    }));
  });

  it('sends only the mode when the page has no brand colours', async () => {
    renderDashboard('dark');

    await waitFor(() => expect(mockEmbeddedDashboard.setThemeConfig).toHaveBeenCalledWith({
      theme_default: { algorithm: 'dark', token: {} },
    }));
  });

  it('re-embeds the dashboard in the new theme when the Studio theme is switched', async () => {
    const { switchTheme } = renderDashboard('light');
    await waitFor(() => expect(mockEmbeddedDashboard.setThemeConfig).toHaveBeenCalledTimes(1));

    switchTheme('dark');

    await waitFor(() => expect(mockEmbeddedDashboard.setThemeConfig).toHaveBeenLastCalledWith({
      theme_default: { algorithm: 'dark', token: {} },
    }));
    expect(embedDashboard).toHaveBeenCalledTimes(2);
  });

  it('unmounts the replaced dashboard and the dashboard of a removed sidebar', async () => {
    const { switchTheme, unmount } = renderDashboard('light');
    await waitFor(() => expect(mockEmbeddedDashboard.setThemeConfig).toHaveBeenCalledTimes(1));

    switchTheme('dark');
    await waitFor(() => expect(mockEmbeddedDashboard.setThemeConfig).toHaveBeenCalledTimes(2));
    expect(mockEmbeddedDashboard.unmount).toHaveBeenCalledTimes(1);

    unmount();
    expect(mockEmbeddedDashboard.unmount).toHaveBeenCalledTimes(2);
  });
});
