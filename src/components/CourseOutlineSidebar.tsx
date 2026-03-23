import React, { useEffect, useMemo, useState } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { AutoGraph } from '@openedx/paragon/icons';

import {
  useOutlineSidebarContext,
} from 'CourseAuthoring/course-outline/outline-sidebar/OutlineSidebarContext';
import {
  OutlineSidebarPagesContext,
  useOutlineSidebarPagesContext,
} from 'CourseAuthoring/course-outline/outline-sidebar/OutlineSidebarPagesContext';

import { useCourseBlocks, useChildBlockCounts, useAspectsSidebarContext } from '../hooks';
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
  const {
    filteredBlocks, setActiveBlock, setFilteredBlocks, setFilterUnit,
  } = useAspectsSidebarContext();
  const { data: courseBlockData } = useCourseBlocks(courseId);
  const { currentItemData } = useOutlineSidebarContext();
  const { data: childBlockData } = useChildBlockCounts(currentItemData?.id);
  const [showNoAnalyticsMessage, setShowNoAnalyticsMessage] = useState(false);

  const gradedSubsections = sections ? Array.from(getGradedSubsections(sections)) : null;
  const problems = courseBlockData?.problems;
  const videos = courseBlockData?.videos;

  useEffect(() => {
    // This effect is called when the currentItemData changes.
    // It sets the activeBlock and filteredBlocks based on the currentItemData
    // and the childBlockData.
    if (currentItemData?.id) {
      if (currentItemData.category === 'vertical') {
        // Show all the blocks of the current unit
        setActiveBlock(castToBlock(currentItemData));
        const childBlocks = childBlockData ? Object.keys(childBlockData.blocks) : [];
        // If we doesn't have the child blocks, show the "no analytics" message
        setShowNoAnalyticsMessage(childBlocks.length === 0);
        setFilteredBlocks(childBlocks.length ? childBlocks : []);
        setFilterUnit(castToBlock(currentItemData));
      } else if (currentItemData.category === 'sequential') {
        // Show graded subsections data
        setActiveBlock(castToBlock(currentItemData));
        setShowNoAnalyticsMessage(false);
        setFilteredBlocks([]);
        setFilterUnit(null);
      } else {
        // We don't have any specific view for Sections, so we'll show the "no analytics" message
        setShowNoAnalyticsMessage(true);
        setActiveBlock(castToBlock(currentItemData));
        setFilteredBlocks([]);
        setFilterUnit(null);
      }
    } else {
      setActiveBlock(null);
      setShowNoAnalyticsMessage(false);
      setFilterUnit(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentItemData, childBlockData]);

  const contentLists: { title: string, blocks: Block[] }[] = [];

  // Only show the content lists if we have analytics to show
  if (!showNoAnalyticsMessage) {
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
  }

  return (
    <AspectsSidebar
      title={courseName}
      blockType={currentItemData?.category === 'vertical' ? BlockTypes.vertical : BlockTypes.course}
      dashboardId={courseId}
      contentLists={contentLists}
      showNoAnalyticsMessage={showNoAnalyticsMessage}
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
