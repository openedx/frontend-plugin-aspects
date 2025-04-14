import { getConfig, camelCaseObject } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { embedDashboard } from '@superset-ui/embedded-sdk';
import { useQuery } from '@tanstack/react-query';
import * as React from 'react';
import { useParams } from 'react-router-dom';

export type UsageId = string;

export type Block = {
    id: UsageId;
    type: string;
    displayName: string;
    graded: boolean;

    // vertical block
    blockType: string;
    name: string;
};

export type BlockMap = {
    [blockId: UsageId]: Block;
};

type BlockResponse = {
    blocks: BlockMap;
    root: UsageId;
};

const guestTokenUrl = (courseId: string) => `${getConfig().LMS_BASE_URL}/aspects/superset_guest_token/${courseId}`;
const dashboardUrl = (usageKey: string) => `${getConfig().LMS_BASE_URL}/aspects/superset_in_context_dashboard/${usageKey}`;

export const fetchGuestTokenFromBackend = async (courseId: string) => {
  const { data } = await getAuthenticatedHttpClient()
    .get(guestTokenUrl(courseId));
  return data.guestToken;
};

type CourseRunFilterConfig = {
  native_filters: string,
}

export type DashBoardConfig = {
  supersetUrl: string,
  dashboardId: string,
  defaultCourseRun: string,
  courseRuns: CourseRunFilterConfig[],
}

export const useDashboardConfig = (usageKey: string) => {
  const [config, setConfig] = React.useState<DashBoardConfig | null>();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string>("");

  React.useEffect(() => {
    if (!usageKey) { return; }
    (async () => {
      setLoading(true);
      try {
        const { data } = await getAuthenticatedHttpClient()
          .get(dashboardUrl(usageKey));
        setConfig(data);
        setLoading(false);
      } catch (e) {
        setLoading(false);
        console.log("useDashboard error: ", e)
        setError(JSON.parse(e.customAttributes?.httpErrorResponseData ?? "{}")?.detail);
      }
    })();
  }, [usageKey]);

  return {loading, error, config};
}


export const useDashboardEmbed = (containerId: string, usageKey: string, visible: boolean) => {
  const { courseId } = useParams();
  const [dashboardConfig, setDashboardConfig] = React.useState<DashBoardConfig | null>();
  const [loaded, setLoaded] = React.useState<boolean>(false);
  const [error, setError] = React.useState<Error | null>(null);
  console.log("Calling useDashboardEmbed with", containerId, usageKey, visible);

  React.useEffect(() => {
    if (!usageKey) { return; }
    (async () => {
      setError(null);
      try {
        const { data } = await getAuthenticatedHttpClient()
          .get(dashboardUrl(usageKey));
        setDashboardConfig(data);
      } catch (e) {
        setError(e);
      }
    })();
  }, [usageKey]);

  React.useEffect(() => {
    if (!visible || !dashboardConfig?.supersetUrl || !dashboardConfig?.dashboardId) { return; }
    (async () => {
      console.log("Calling the embedDashboard for ", dashboardConfig);
      try {
        await embedDashboard({
          id: dashboardConfig.dashboardId,
          supersetDomain: dashboardConfig.supersetUrl,
          mountPoint: document.getElementById(containerId),
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
        setLoaded(true);
      } catch (e) {
        setError(e);
      }
    })();
  }, [dashboardConfig, containerId, visible, courseId]);
  return { loaded, error };
};

const getCourseBlocksUrl = (courseId: string) => {
  const url = new URL(`${getConfig().LMS_BASE_URL}/api/courses/v1/blocks/`);
  url.searchParams.append('course_id', courseId);
  url.searchParams.append('depth', 'all');
  url.searchParams.append('block_types_filter', 'problem,video');
  url.searchParams.append('all_blocks', 'true');
  return url.toString();
};

export const useCourseBlocks = (courseId?: UsageId) => {
  const { data, error } = useQuery({
    queryKey: ['course-blocks', courseId],
    queryFn: async () => getAuthenticatedHttpClient().get(getCourseBlocksUrl(courseId)),
    enabled: !!courseId,
    select: (response: {data:BlockResponse}) => {
      const videos = [];
      const problems = [];
      Object.values(response.data.blocks).forEach((block) => {
        if (block.type === 'video') {
          videos.push(camelCaseObject(block));
        }
        if (block.type === 'problem') {
          problems.push(camelCaseObject(block));
        }
      });
      return ({
        videos,
        problems,
      });
    },
  });
  return { data, error };
};
