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
  const problemBlocks = React.useMemo(() => verticalBlocks.filter(block => block.blockType === 'problem'), [verticalBlocks]);
  const videoBlocks = React.useMemo(() => verticalBlocks.filter(block => block.blockType === 'video'), [verticalBlocks]);
  const { sendMessageToIframe } = useIframe();

  return (
    <AspectsSidebar
      title={unitTitle}
      blockType={BlockTypes.vertical}
      hasDashboard={false}
      dashboardId={blockId}
      problemBlocks={problemBlocks}
      videoBlocks={videoBlocks}
      blockActivatedCallback={(block: Block) => sendMessageToIframe('scrollToXBlock', { locator: block.id })}
    />
  );
}
