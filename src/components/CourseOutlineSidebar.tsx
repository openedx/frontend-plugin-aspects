import React, { useMemo } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { AutoGraph } from '@openedx/paragon/icons';

import {
  OutlineSidebarPagesContext,
  useOutlineSidebarPagesContext,
// @ts-ignore
} from 'CourseAuthoring/course-outline/outline-sidebar/OutlineSidebarPagesContext';

import { useCourseBlocks, useAspectsSidebarContext } from '../hooks';
import { BlockTypes } from '../constants';
import { AspectsSidebar } from './AspectsSidebar';
import messages from '../messages';
import { Section, Block, castToBlock } from '../types';

interface CourseOutlineAspectsPageProps {
  courseId: string;
  courseName: string;
  sections: Section[];
}

function* getGradedSubsections(sections: Section[]) {
  for (const section of sections) {
    for (const subsection of section.childInfo.children) {
      if (subsection.graded) {
        yield subsection;
      }
    }
  }
}

export function CourseOutlineAspectsPage({ courseId, courseName, sections }: CourseOutlineAspectsPageProps) {
  const intl = useIntl();
  const { filteredBlocks } = useAspectsSidebarContext();
  const { data } = useCourseBlocks(courseId);

  const gradedSubsections = sections ? Array.from(getGradedSubsections(sections)) : null;
  const problems = data?.problems;
  const videos = data?.videos;

  const contentLists: { title: string, blocks: Block[] }[] = [];

  // graded subsections are shown only when unit-filtering is off
  if (!filteredBlocks?.length && gradedSubsections?.length) {
    contentLists.push({
      title: intl.formatMessage(messages.gradedSubsectionAnalytics),
      blocks: castToBlock(gradedSubsections) as Block[],
    });
  }
  if (problems?.length) {
    contentLists.push({
      title: intl.formatMessage(messages.problemAnalytics),
      blocks: problems,
    });
  }
  if (videos?.length) {
    contentLists.push({
      title: intl.formatMessage(messages.videoAnalytics),
      blocks: videos,
    });
  }

  return (
    <AspectsSidebar
      title={courseName}
      blockType={BlockTypes.course}
      dashboardId={courseId}
      contentLists={contentLists}
    />
  );
}

export function CourseOutlineSidebarWrapper(
  { component, pluginProps }: { component: React.ReactNode, pluginProps: CourseOutlineAspectsPageProps },
) {
  const sidebarPages = useOutlineSidebarPagesContext();

  const AnalyticsPage = React.useCallback(() => <CourseOutlineAspectsPage {...pluginProps} />, [pluginProps]);

  const overridedPages = useMemo(() => ({
    ...sidebarPages,
    analytics: {
      component: AnalyticsPage,
      icon: AutoGraph,
      title: messages.analyticsLabel,
    },
  }), [sidebarPages, AnalyticsPage]);

  return (
    <OutlineSidebarPagesContext.Provider value={overridedPages}>
      {component}
    </OutlineSidebarPagesContext.Provider>
  );
}
