import React from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Alert,
} from '@openedx/paragon';
import {
  Warning,
} from '@openedx/paragon/icons';

import { SidebarContent, SidebarSection, SidebarTitle } from 'CourseAuthoring/generic/sidebar';

import { BlockTypes, ICON_MAP } from '../../constants';
import { useAspectsSidebarContext } from '../../hooks';
import messages from '../../messages';
import { Block } from '../../types';
import { CourseContentList } from './CourseContentList';
import { Dashboard } from './Dashboard';

export type ContentList = {
  title: string;
  blocks: Block[];
};

interface AspectsSidebarProps {
  title: string;
  blockType: BlockTypes;
  dashboardId: string;
  contentLists: ContentList[];
  blockActivatedCallback?: (block: Block) => void;
  showNoAnalyticsMessage?: boolean;
}

export function AspectsSidebar({
  title,
  blockType,
  dashboardId,
  contentLists,
  blockActivatedCallback,
  showNoAnalyticsMessage,
}: AspectsSidebarProps) {
  const intl = useIntl();

  const {
    setFilteredBlocks, activeBlock, setActiveBlock,
    filterUnit, setFilterUnit, filteredBlocks,
  } = useAspectsSidebarContext();

  // The activeBlock is not reset during page navigations, leading to stale dashboards.
  // This useEffect ensures things are reset. The "set" functions are not included in
  // the dependency list as they are recreated everytime the "hookState" changes, thus
  // resetting everything to null state on every re-render. Setting it to an empty
  // array makes sure it is run only on the first render after navigation.
  React.useEffect(() => {
    setActiveBlock(null);
    setFilterUnit(null);
    setFilteredBlocks([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hideDashboard: boolean = (
    (!!activeBlock && (activeBlock.type === 'vertical'))
    || (!activeBlock && (blockType === 'vertical'))
  );
  const topTitle = activeBlock?.displayName || title;
  const activeBlockType = activeBlock?.type || blockType;
  const contentListSize: number = contentLists.reduce((acc, list) => acc + list.blocks.length, 0);

  const activateDashboard = (block: Block) => {
    setActiveBlock(block);
    if (activeBlockType === BlockTypes.vertical && !!blockActivatedCallback) {
      blockActivatedCallback(block);
    }
  };
  // reset all the active values to props
  const goBack = () => {
    // Currently viewing component dashboard of a filtered view of a specific unit
    // Go back to the filtered view of the unit
    if (filterUnit && (activeBlock?.id !== filterUnit.id)) {
      // Viewing a component inside a filtered view of a unit - go back to the filtered view of the unit
      setActiveBlock(filterUnit);
    } else if (filterUnit?.id === activeBlock?.id) {
      // Viewing the filtered view of a unit - go back to full course view
      setActiveBlock(null);
      setFilterUnit(null);
      setFilteredBlocks([]);
    } else {
      // reset to default view for all other cases
      setActiveBlock(null);
      setFilteredBlocks([]);
    }
  };

  const messageNoAnalyticsFor = {
    undefined: messages.noAnalyticsForCourse,
    course: messages.noAnalyticsForCourse,
    chapter: messages.noAnalyticsForSection,
    vertical: messages.noAnalyticsForUnit,
  };

  return (
    <div data-testid="sidebar">
      <div data-testid="sidebar-title">
        <SidebarTitle
          title={topTitle}
          icon={ICON_MAP[activeBlockType]}
          onBackBtnClick={activeBlock ? goBack : undefined}
          data-testid="sidebar-title"
        />
      </div>
      <SidebarContent>
        { !showNoAnalyticsMessage && !hideDashboard && (
          <SidebarSection>
            <Dashboard usageKey={activeBlock?.id || dashboardId} title={topTitle} />
          </SidebarSection>
        )}
        { !showNoAnalyticsMessage && (
          (activeBlockType === BlockTypes.course) || (activeBlockType === BlockTypes.vertical)
        ) && (
          contentLists.map(({ title: listTitle, blocks }) => {
            const resultBlocks = (filteredBlocks && filteredBlocks.length)
              ? blocks.filter((block) => filteredBlocks.includes(block.id))
              : blocks;

            return resultBlocks.length ? (
              <SidebarSection key={listTitle} title={listTitle}>
                <CourseContentList
                  blocks={resultBlocks}
                  activateDashboard={activateDashboard}
                />
              </SidebarSection>
            ) : null;
          })
        )}
        {(showNoAnalyticsMessage || (hideDashboard && !contentListSize)) && (
          <Alert icon={Warning} variant="warning" className="mb-0">
            {(activeBlockType in messageNoAnalyticsFor) ? (
              intl.formatMessage(messageNoAnalyticsFor[activeBlockType])
            ) : null}
          </Alert>
        )}
      </SidebarContent>
    </div>
  );
}
