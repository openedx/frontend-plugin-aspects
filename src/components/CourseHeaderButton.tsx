import { useIntl } from '@edx/frontend-platform/i18n';
import { Button } from '@openedx/paragon';
import { AutoGraph } from '@openedx/paragon/icons';
import * as React from 'react';
import messages from '../messages';
import { AspectsSidebarContext, SidebarContext } from './AspectsSidebarContext';

export function CourseHeaderButton() {
  const intl = useIntl();
  const {
    sidebarOpen,
    setSidebarOpen,
  } = React.useContext<SidebarContext>(AspectsSidebarContext);
  return (
    <Button
      variant={sidebarOpen ? 'primary' : 'outline-primary'}
      iconBefore={AutoGraph}
      onClick={() => setSidebarOpen(!sidebarOpen)}
    >
      {intl.formatMessage(messages.analyticsLabel)}
    </Button>
  );
}
