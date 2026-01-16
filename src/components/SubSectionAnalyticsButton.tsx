import { IconButton } from '@openedx/paragon';
import { AutoGraph } from '@openedx/paragon/icons';
import { useAspectsSidebarContext } from '../hooks';
import { Block, SubSection, castToBlock } from '../types';

export function SubSectionAnalyticsButton({ subsection }: { subsection: SubSection }) {
  const {
    activeBlock, setActiveBlock, setFilterUnit,
  } = useAspectsSidebarContext();
  if (!subsection.graded) {
    return null;
  }
  return (
    <IconButton
      alt="Analytics"
      iconAs={AutoGraph}
      isActive={activeBlock?.id === subsection.id}
      onClick={() => {
        if (activeBlock?.id === subsection.id) {
          setActiveBlock(null);
        } else {
          setActiveBlock(castToBlock(subsection) as Block);
          setFilterUnit(null);
        }
      }}
    />
  );
}
