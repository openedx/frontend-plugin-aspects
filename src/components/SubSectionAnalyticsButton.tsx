import * as React from 'react';
import { IconButton } from '@openedx/paragon';
import { AutoGraph } from '@openedx/paragon/icons';
import { Block } from '../hooks';
import { useAspectsSidebarContext } from './AspectsSidebarContext';

export function SubSectionAnalyticsButton({ subsection }: { subsection: Block }) {
  const { activeBlock, setActiveBlock } = useAspectsSidebarContext();
  if (!subsection.graded) {
    return null;
  }
  return (
    <IconButton
      alt="Analytics"
      iconAs={AutoGraph}
      isActive={activeBlock?.id === subsection.id}
      onClick={() => setActiveBlock(subsection)}
    />
  );
}
