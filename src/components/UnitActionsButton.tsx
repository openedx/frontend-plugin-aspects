import React from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Icon, IconButton } from '@openedx/paragon';
import { AutoGraph } from '@openedx/paragon/icons';

import {
  useOutlineSidebarContext,
} from 'CourseAuthoring/course-outline/outline-sidebar/OutlineSidebarContext';

import { useAspectsSidebarContext, useChildBlockCounts } from '../hooks';
import messages from '../messages';
import { Block, Unit, castToBlock } from '../types';

export function UnitActionsButton({
  unit,
}: { unit: Unit }) {
  const intl = useIntl();
  const { data, error } = useChildBlockCounts(unit?.id);
  const { setCurrentPageKey, setSelectedContainerState } = useOutlineSidebarContext();

  if (error || !data || (data?.blocks && (Object.keys(data?.blocks).length === 0))) {
    return null;
  }

  return (
    <IconButton
      alt={intl.formatMessage(messages.analyticsLabel)}
      src={AutoGraph}
      iconAs={Icon}
      onClick={() => {
        setSelectedContainerState({ currentId: unit.id })
        setCurrentPageKey('analytics');
      }}
    />
  );
}
