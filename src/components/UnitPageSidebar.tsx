import * as React from 'react';
// @ts-ignore
import { useIframe } from 'CourseAuthoring/generic/hooks/context/hooks';
import { BlockTypes } from '../constants';
import { AspectsSidebar, ContentList } from './AspectsSidebar';
import { castToBlock, XBlock, Block } from '../types';

interface Props {
  blockId: string;
  unitTitle: string;
  xBlocks: XBlock[];
}

export function UnitPageSidebar({
  blockId, unitTitle, xBlocks,
}: Props) {
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
