import React from 'react';
import { useParams } from 'react-router-dom';
import { embedDashboard, EmbeddedDashboard, Size } from '@superset-ui/embedded-sdk';
import {
  Alert, Button, ModalDialog, Skeleton, useToggle,
} from '@openedx/paragon';
import { Fullscreen } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';

import { fetchGuestTokenFromBackend, useDashboardConfig } from '../../hooks';
import '../../styles.css';
import messages from '../../messages';

/**
 * Superset picks its theme from the OS colour scheme; send it the Studio one instead: the light/dark
 * mode and the brand colours of the page's Paragon theme, so the dashboard follows whatever brand the
 * MFE has. A single theme in `setThemeConfig` is applied regardless of the OS (Superset 6.0+).
 */
const applyStudioTheme = (dashboard: EmbeddedDashboard, themeVariant?: string) => {
  if (!themeVariant) {
    return;
  }
  const style = getComputedStyle(document.documentElement);
  const brand = (name: string) => style.getPropertyValue(name).trim();
  const primary = brand('--pgn-color-primary-base');
  const link = brand('--pgn-color-link-base') || primary;
  const textOnPrimary = brand('--pgn-color-btn-text-primary');
  dashboard.setThemeConfig({
    theme_default: {
      algorithm: themeVariant === 'dark' ? 'dark' : 'default',
      token: {
        ...(primary && { colorPrimary: primary }),
        ...(link && { colorLink: link }),
        ...(textOnPrimary && { colorTextLightSolid: textOnPrimary }),
      },
    },
  });
};

function Embed({ usageKey }: { usageKey: string }) {
  const { isPending, error: configError, data: dashboardConfig } = useDashboardConfig(usageKey);
  const containerDiv = React.useRef(null);
  const { courseId } = useParams();
  const [containerHeight, setContainerHeight] = React.useState<number>(0);
  const [count, setCount] = React.useState(0);
  const themeVariant = React.useContext(AppContext).paragonTheme?.state?.themeVariant;

  React.useEffect(() => {
    // Hide the dashboard when navigating
    setContainerHeight(0);

    if (!dashboardConfig?.supersetUrl || !dashboardConfig?.dashboardId || !courseId) {
      return undefined;
    }

    let cancelled = false;
    let embedded: EmbeddedDashboard | null = null;

    (async () => {
      let iframe: EmbeddedDashboard | null = null;
      /**
       * The Superset Embed SDK provides a `getScrollSize` method that can return
       * the height and width of the iframe. However, the value is resolved as soon
       * as the DOM finishes loading. The charts take a while to render fully making
       * the value stale and the charts get hidden.
       *
       * The updateHeight method gets around this by using `setTimeout` to poll for
       * the height for 10 seconds or longer if the height keeps changing.
       */
      const updateHeight = async () => {
        if (iframe) {
          const size: Size = await iframe.getScrollSize();
          if ((count < 20) || (size.height !== containerHeight)) {
            setContainerHeight(size.height);
            setTimeout(updateHeight, 500);
            setCount(count + 1);
          }
        }
      };

      if (!containerDiv.current) {
        return;
      }

      try {
        iframe = await embedDashboard({
          id: dashboardConfig.dashboardId,
          supersetDomain: dashboardConfig.supersetUrl,
          mountPoint: containerDiv.current,
          fetchGuestToken: async () => fetchGuestTokenFromBackend(courseId),
          dashboardUiConfig: {
            hideTitle: true,
            hideTab: true,
            filters: {
              visible: false,
              expanded: false,
            },
            urlParams: {
              native_filters: dashboardConfig.courseRuns[dashboardConfig.defaultCourseRun].native_filters,
            },
          },
        });
      } catch (e) {
        return;
      }
      // A newer embed owns the mount point now; unmounting this one would clear it.
      if (cancelled) {
        return;
      }
      embedded = iframe;
      if (iframe) {
        applyStudioTheme(iframe, themeVariant);
        await updateHeight();
      }
    })();

    return () => {
      cancelled = true;
      // Stops the guest token refresh of the dashboard being replaced or removed.
      embedded?.unmount();
    };
    // `containerHeight` is skipped to prevent height changes from re-rendering iframes.
    // A Studio theme switch re-embeds the dashboard: switching the theme of a rendered one remounts
    // it in Superset and drops the dashboard's own CSS.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dashboardConfig, courseId, themeVariant]);

  if (isPending) {
    return <Skeleton />;
  }

  if (configError) {
    return (
      <Alert variant="danger">
        {configError.toString()}
      </Alert>
    );
  }

  return (
    <div
      ref={containerDiv}
      className="aspects-sidebar-embed-container d-flex w-100"
      style={{ minHeight: containerHeight }}
    />
  );
}

export function Dashboard({ usageKey, title }: { usageKey: string, title: string }) {
  const [isModalOpen, openModal, closeModal] = useToggle();
  const intl = useIntl();
  return (
    <>
      <Embed usageKey={usageKey} />
      <div className="px-3">
        <Button
          size="sm"
          variant="link"
          className="justify-content-end"
          iconAfter={Fullscreen}
          onClick={openModal}
          block
        >
          {intl.formatMessage(messages.viewLarger)}
        </Button>
      </div>
      <ModalDialog
        title={title}
        onClose={closeModal}
        isOpen={isModalOpen}
        size="xl"
        hasCloseButton
      >
        <ModalDialog.Header>
          <ModalDialog.Title>{title}</ModalDialog.Title>
        </ModalDialog.Header>
        <ModalDialog.Body>
          <Embed usageKey={usageKey} />
        </ModalDialog.Body>
      </ModalDialog>
    </>
  );
}
