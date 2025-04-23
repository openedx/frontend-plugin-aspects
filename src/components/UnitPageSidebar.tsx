import * as React from 'react';
// @ts-ignore
import { useIframe } from 'CourseAuthoring/generic/hooks/context/hooks';
import { BlockTypes } from '../constants';
import { AspectsSidebar } from './AspectsSidebar';
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
  const contentList = {
    title: '',
    blocks: React.useMemo(
      () => {
        const blocks = castToBlock(xBlocks) as Block[];
        return blocks.filter(block => (block.type === 'problem') || (block.type === 'video'));
      },
      [xBlocks],
    ),
  };

  return (
    <AspectsSidebar
      title={unitTitle}
      blockType={BlockTypes.vertical}
      dashboardId={blockId}
      contentLists={[contentList]}
      blockActivatedCallback={(block: Block) => sendMessageToIframe('scrollToXBlock', { locator: block.id })}
    />
  );
}
