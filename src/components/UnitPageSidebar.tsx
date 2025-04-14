import * as React from 'react';
import {AspectsSidebar} from './AspectsSidebar';
import {Block} from "../hooks";
import {ChromeReaderMode} from "@openedx/paragon/icons";

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
    icon={ChromeReaderMode}
    hasDashboard={false}
    dashboardId={blockId}
    subsections={null}
    problemBlocks={problemBlocks}
    videoBlocks={videoBlocks}
  />
}
