import { useIntl } from '@edx/frontend-platform/i18n';
import { Icon, IconButton } from '@openedx/paragon';
import { AutoGraph } from '@openedx/paragon/icons';
import * as React from 'react';
import messages from '../messages';
import { AspectsSidebarContext, SidebarContext } from './AspectsSidebarContext';
import { useChildBlockCounts, Block } from '../hooks';

export function UnitActionsButton({
  unit,
}: { unit: Block }) {
  const intl = useIntl();
  const {
    sidebarOpen,
    setSidebarOpen,
    setFilteredBlocks,
    setActiveBlock,
    filterUnit,
    setFilterUnit,
  } = React.useContext<SidebarContext>(AspectsSidebarContext);
  const { data, error } = useChildBlockCounts(unit?.id);

  if (error || !data || (data?.blocks && (Object.keys(data?.blocks).length === 0))) {
    return null;
  }

  return (
    <IconButton
      isActive={sidebarOpen && (filterUnit?.id === unit.id)}
      alt={intl.formatMessage(messages.analyticsLabel)}
      src={AutoGraph}
      iconAs={Icon}
      variant="black"
      onClick={() => {
        setSidebarOpen(true);
        if (filterUnit?.id === unit.id) {
          setActiveBlock(null);
          setFilteredBlocks([]);
          setFilterUnit(null);
        } else {
          setActiveBlock(unit);
          setFilteredBlocks(Object.keys(data.blocks));
          setFilterUnit(unit);
        }
      }}
    />
  );
}
