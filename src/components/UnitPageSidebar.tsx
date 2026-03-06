import React, { useCallback, useEffect,useMemo } from 'react';
import { AutoGraph } from '@openedx/paragon/icons';

import {
  useUnitSidebarContext,
} from 'CourseAuthoring/course-unit/unit-sidebar/UnitSidebarContext';
import {
  UnitSidebarPagesContext,
  useUnitSidebarPagesContext,
} from 'CourseAuthoring/course-unit/unit-sidebar/UnitSidebarPagesContext';
import { useIframe } from 'CourseAuthoring/generic/hooks/context/hooks';

import { BlockTypes } from '../constants';
import messages from '../messages';
import { useAspectsSidebarContext } from '../hooks';
import { castToBlock, XBlock, Block } from '../types';
import { AspectsSidebar, ContentList } from './AspectsSidebar';

interface UnitOutlineAspectsPageProps {
  blockId: string;
  unitTitle: string;
  xBlocks: XBlock[];
}

export function UnitOutlineAspectsPage({
  blockId, unitTitle, xBlocks,
}: UnitOutlineAspectsPageProps) {
  const { sendMessageToIframe } = useIframe();
  const contentLists: ContentList[] = [];

  const { selectedComponentId } = useUnitSidebarContext();
  const {
    activeBlock,
    filteredBlocks,
    setActiveBlock,
    setFilteredBlocks,
  } = useAspectsSidebarContext();


  useEffect(() => {
    // This effect is called when the selectedComponentId changes.
    // It sets the activeBlock and filteredBlocks based on the selectedComponentId
    // and the childBlockData.
    const xBlock = xBlocks.find(xblock => xblock.id === selectedComponentId);
    const block = xBlock && castToBlock(xBlock);
    if (block && ['problem', 'video'].includes(block.type)) {
      setActiveBlock(block);
      setFilteredBlocks([selectedComponentId]);
    } else {
      setActiveBlock(null);
      setFilteredBlocks([]);
    }
  }, [selectedComponentId, xBlocks]);

  if (xBlocks && xBlocks.length) {
    const blocks = castToBlock(xBlocks) as Block[];
    contentLists.push({
      title: '',
      blocks: blocks.filter(block => (block.type === 'problem') || (block.type === 'video')),
    });
  }

  return (
    <AspectsSidebar
      title={unitTitle}
      blockType={BlockTypes.vertical}
      dashboardId={blockId}
      contentLists={contentLists}
      blockActivatedCallback={(block: Block) => sendMessageToIframe('scrollToXBlock', { locator: block.id })}
    />
  );
}

export function UnitOutlineSidebarWrapper(
  { component, pluginProps }: { component: React.ReactNode, pluginProps: UnitOutlineAspectsPageProps },
) {
  const sidebarPages = useUnitSidebarPagesContext();

  const AnalyticsPage = useCallback(() => <UnitOutlineAspectsPage {...pluginProps} />, [pluginProps]);

  const overridedPages = useMemo(() => ({
    ...sidebarPages,
    analytics: {
      component: AnalyticsPage,
      icon: AutoGraph,
      title: messages.analyticsLabel,
    },
  }), [sidebarPages, AnalyticsPage]);

  return (
    <UnitSidebarPagesContext.Provider value={overridedPages}>
      {component}
    </UnitSidebarPagesContext.Provider>
  );
}
