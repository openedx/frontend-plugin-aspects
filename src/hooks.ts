import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { useQuery } from '@tanstack/react-query';
import * as React from 'react';

export type UsageId = string;

export type Block = {
  id: UsageId;
  type: string;
  displayName: string;
  graded: boolean;
  // block type of things from API
  category: string;

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
};

export type DashBoardConfig = {
  supersetUrl: string,
  dashboardId: string,
  defaultCourseRun: string,
  courseRuns: CourseRunFilterConfig[],
};

export const useDashboardConfig = (usageKey: string) => {
  const [config, setConfig] = React.useState<DashBoardConfig | null>();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string>('');

  React.useEffect(() => {
    if (!usageKey) {
      return;
    }
    (async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await getAuthenticatedHttpClient()
          .get(dashboardUrl(usageKey));
        setConfig(data);
        setLoading(false);
      } catch (e) {
        setLoading(false);
        setConfig(null);
        setError('Dashboard not found.');
      }
    })();
  }, [usageKey]);

  return { loading, error, config };
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
    queryFn: async () => (
      courseId ? getAuthenticatedHttpClient().get(getCourseBlocksUrl(courseId)) : Promise.resolve(null)
    ),
    enabled: !!courseId,
    select: (response: { data: BlockResponse }) => {
      const videos: Block[] = [];
      const problems: Block[] = [];
      Object.values(response.data.blocks).forEach((block) => {
        if (block.type === 'video') {
          videos.push(camelCaseObject(block));
        }
        if (block.type === 'problem') {
          problems.push(camelCaseObject(block));
        }
      });
      return ({ videos, problems });
    },
  });
  return { data, error };
};

export const useChildBlockCounts = (usageKey: string) : { data: BlockResponse | undefined, error: Error | null } => {
  const url = new URL(`${getConfig().LMS_BASE_URL}/api/courses/v1/blocks/${usageKey}`);
  url.searchParams.append('all_blocks', 'true');
  url.searchParams.append('block_types_filter', 'problem,video');
  url.searchParams.append('depth', '1');

  return useQuery({
    queryKey: ['blocks', usageKey],
    queryFn: async () => getAuthenticatedHttpClient().get(url.toString()),
    select: (response: { data: BlockResponse }) => (response.data),
  });
};
