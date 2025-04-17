import * as React from 'react';
import { useParams } from 'react-router-dom';
import { embedDashboard, EmbeddedDashboard, Size } from '@superset-ui/embedded-sdk';
import { Alert, Skeleton } from '@openedx/paragon';
import { fetchGuestTokenFromBackend, useDashboardConfig } from '../../hooks';
import '../../styles.css';

export function Dashboard({ usageKey }: { usageKey: string }) {
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
