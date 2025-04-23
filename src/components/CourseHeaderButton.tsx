import { useIntl } from '@edx/frontend-platform/i18n';
import { Button } from '@openedx/paragon';
import { AutoGraph } from '@openedx/paragon/icons';
import * as React from 'react';
import messages from '../messages';
import { useAspectsSidebarContext } from '../hooks';

export function CourseHeaderButton() {
  const intl = useIntl();
  const {
    sidebarOpen,
    setSidebarOpen,
    setActiveBlock,
    setFilterUnit,
    setFilteredBlocks,
  } = useAspectsSidebarContext();
  return (
    <Button
      variant={sidebarOpen ? 'primary' : 'outline-primary'}
      iconBefore={AutoGraph}
      onClick={() => {
        setSidebarOpen(!sidebarOpen);
        setFilterUnit(null);
        setActiveBlock(null);
        setFilteredBlocks([]);
      }}
    >
      {intl.formatMessage(messages.analyticsLabel)}
    </Button>
  );
}
