import * as React from 'react';
import {AspectsSidebar} from './AspectsSidebar';
import {Block} from "../hooks";
import {BLOCK_TYPES} from "../constants";

interface Props {
  courseId: string;
  blockId: string;
  unitTitle: string;
  verticalBlocks: Block[];
}

export const UnitPageSidebar = ({courseId, blockId, unitTitle, verticalBlocks}: Props) => {
  const problemBlocks = React.useMemo(() => verticalBlocks.filter(block => block.blockType === "problem"), [verticalBlocks]);
  const videoBlocks = React.useMemo(() => verticalBlocks.filter(block => block.blockType === "video"), [verticalBlocks]);

  return <AspectsSidebar
    title={unitTitle}
    blockType={BLOCK_TYPES.vertical}
    hasDashboard={false}
    dashboardId={blockId}
    subsections={null}
    problemBlocks={problemBlocks}
    videoBlocks={videoBlocks}
  />
}
