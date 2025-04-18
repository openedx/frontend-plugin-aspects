import * as React from 'react';
// @ts-ignore
import { useIframe } from 'CourseAuthoring/generic/hooks/context/hooks';
import { Block } from '../hooks';
import { BlockTypes } from '../constants';
import { AspectsSidebar } from './AspectsSidebar';

interface Props {
  blockId: string;
  unitTitle: string;
  verticalBlocks: Block[];
}

export function UnitPageSidebar({
  blockId, unitTitle, verticalBlocks,
}: Props) {
  const { sendMessageToIframe } = useIframe();
  const contentList = {
    title: '',
    blocks: React.useMemo(() => (
      verticalBlocks.filter(block => (block.blockType === 'problem') || (block.blockType === 'video'))
    ), [verticalBlocks]),
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
