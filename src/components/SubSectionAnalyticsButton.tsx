import React from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Icon, IconButton } from '@openedx/paragon';
import { AutoGraph } from '@openedx/paragon/icons';

import {
  useOutlineSidebarContext,
} from 'CourseAuthoring/course-outline/outline-sidebar/OutlineSidebarContext';

import messages from '../messages';
import type { SubSection } from '../types';

export function SubSectionAnalyticsButton({ subsection }: { subsection: SubSection }) {
  const intl = useIntl();
  const { setCurrentPageKey, setSelectedContainerState } = useOutlineSidebarContext();

  if (!subsection.graded) {
    return null;
  }

  return (
    <IconButton
      alt={intl.formatMessage(messages.analyticsLabel)}
      iconAs={Icon}
      src={AutoGraph}
      onClick={() => {
        setSelectedContainerState({ currentId: subsection.id });
        setCurrentPageKey('analytics');
      }}
    />
  );
}
