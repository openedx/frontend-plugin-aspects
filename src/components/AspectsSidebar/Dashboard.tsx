import * as React from 'react';
import { useParams } from 'react-router-dom';
import { embedDashboard, EmbeddedDashboard, Size } from '@superset-ui/embedded-sdk';
import {
  Alert, Button, ModalDialog, Skeleton, useToggle,
} from '@openedx/paragon';
import { Fullscreen } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';

import { fetchGuestTokenFromBackend, useDashboardConfig } from '../../hooks';
import '../../styles.css';
import messages from '../../messages';

function Embed({ usageKey }: { usageKey: string }) {
  const { loading, error: configError, config: dashboardConfig } = useDashboardConfig(usageKey);
  const containerDiv = React.useRef(null);
  const { courseId } = useParams();
  const [containerHeight, setContainerHeight] = React.useState<number>(0);
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    // Hide the dashboard when navigating
    setContainerHeight(0);

    if (!dashboardConfig?.supersetUrl || !dashboardConfig?.dashboardId || !courseId) {
      return;
    }

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
      if (iframe) {
        await updateHeight();
      }
    })();
    // `containerHeight` is skipped to prevent height changes from re-rendering iframes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dashboardConfig, courseId]);

  if (loading) {
    return <Skeleton />;
  }

  if (configError) {
    return (
      <Alert variant="danger">
        {configError}
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
