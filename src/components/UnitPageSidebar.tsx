import React, { useCallback, useMemo } from 'react';
import { AutoGraph } from '@openedx/paragon/icons';


import {
  UnitSidebarPagesContext,
  useUnitSidebarPagesContext,
} from 'CourseAuthoring/course-unit/unit-sidebar/UnitSidebarPagesContext';
import { useIframe } from 'CourseAuthoring/generic/hooks/context/hooks';

import { BlockTypes } from '../constants';
import messages from '../messages';
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
  { component, pluginProps }: { component: React.ReactNode, pluginProps: UnitOutlineAspectsPageProps},
) {
  const sidebarPages = useUnitSidebarPagesContext();
  console.log('Inside UnitOutlineSidebarWrapper');

  const AnalyticsPage = useCallback(() => <UnitOutlineAspectsPage {...pluginProps} />, [pluginProps]);

  const overridedPages = useMemo(() => ({
    ...sidebarPages,
    analytics: {
      component: AnalyticsPage,
      icon: AutoGraph,
      title: messages.analyticsLabel,
    },
  }), [sidebarPages, AnalyticsPage]);

  console.log('overridedPages', overridedPages);

  return (
    <UnitSidebarPagesContext.Provider value={overridedPages}>
      {component}
    </UnitSidebarPagesContext.Provider>
  );
}
