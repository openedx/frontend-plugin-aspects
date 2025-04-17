import { useIntl } from '@edx/frontend-platform/i18n';
import * as React from 'react';
import {
  Alert, Icon, IconButton, IconButtonWithTooltip, Stack, Sticky,
} from '@openedx/paragon';
import { ArrowBack, AutoGraph, Close } from '@openedx/paragon/icons';
import { BlockTypes, ICON_MAP } from '../../constants';
import { Block } from '../../hooks';
import { AspectsSidebarContext } from '../AspectsSidebarContext';
import messages from '../../messages';
import { CourseContentList } from './CourseContentList';
import { Dashboard } from './Dashboard';

interface AspectsSidebarProps {
  title: string;
  blockType: BlockTypes;
  dashboardId: string;
  subsections?: Block[] | null;
  problemBlocks: Block[] | null;
  videoBlocks: Block[] | null;
  blockActivatedCallback?: (block: Block) => void;
}

export function AspectsSidebar({
  title,
  blockType,
  dashboardId,
  subsections,
  problemBlocks,
  videoBlocks,
  blockActivatedCallback,
}: AspectsSidebarProps) {
  const intl = useIntl();
  const {
    sidebarOpen, setSidebarOpen, filteredBlocks, setFilteredBlocks, activeBlock, setActiveBlock,
    filterUnit, setFilterUnit,
  } = React.useContext(AspectsSidebarContext);

  // The activeBlock is not reset during page navigations, leading to
  // stale dashboards. This useEffect ensures it is reset.
  React.useEffect(() => setActiveBlock(null), [setActiveBlock]);

  if (!sidebarOpen) {
    return null;
  }

  const hideDashboard: boolean = (
    (!!activeBlock && (activeBlock.category === 'vertical'))
    || (!activeBlock && (blockType === 'vertical'))
  );
  const topTitle = activeBlock?.name || activeBlock?.displayName || title;
  const activeBlockType = activeBlock?.type || activeBlock?.category || activeBlock?.blockType || blockType;

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
      setActiveBlock(filterUnit);
    } else if (filterUnit?.id === activeBlock?.id) {
      // Viewing the filtered view of a unit - go back to full course view
      setActiveBlock(null);
      setFilterUnit(null);
      setFilteredBlocks([]);
    } else {
      // reset to default view for all other cases
      setActiveBlock(null);
    }
  };

  return (
    <div className="w-100 h-100">
      <Sticky className="shadow rounded" offset={2}>
        <div className="bg-white rounded w-100">
          <Stack className="sidebar-header">
            <Stack className="course-unit-sidebar-header px-4 pt-4" direction="horizontal">
              <h5 className="course-unit-sidebar-header-title h5 flex-grow-1 text-gray">
                {intl.formatMessage(messages.analyticsLabel)}
                <Icon
                  src={AutoGraph}
                  size="xs"
                  className="d-inline-block ml-1"
                  aria-hidden
                  style={{ verticalAlign: 'middle' }}
                />
              </h5>
              <IconButtonWithTooltip
                className="ml-auto"
                tooltipContent={intl.formatMessage(messages.closeButtonLabel)}
                tooltipPlacement="top"
                alt={intl.formatMessage(messages.closeButtonLabel)}
                src={Close}
                iconAs={Icon}
                variant="black"
                onClick={() => {
                  setSidebarOpen(false);
                }}
                size="sm"
              />
            </Stack>
            <h3 className="h3 px-4 pb-4 mb-0 d-flex align-items-center">
              {(activeBlock) && (
                <IconButton
                  className="mr-2"
                  alt={intl.formatMessage(messages.backButtonLabel)}
                  src={ArrowBack}
                  iconAs={Icon}
                  onClick={() => goBack()}
                  size="sm"
                />
              )}
              <Icon
                src={ICON_MAP[activeBlockType]}
                size="sm"
                className="d-inline-block mr-2 text-gray"
                aria-hidden
              />
              <span>{topTitle}</span>
            </h3>
          </Stack>
          { !hideDashboard && (
            <Dashboard usageKey={activeBlock?.id || dashboardId} title={topTitle} />
          )}
          {
            (activeBlockType === 'course' && !filteredBlocks.length) && (
              <CourseContentList
                title={intl.formatMessage(messages.gradedSubsectionAnalytics)}
                contentList={subsections}
                icon={ICON_MAP[BlockTypes.sequential]}
                activateDashboard={activateDashboard}
              />
            )
          }
          {
            ((activeBlockType === 'course') || (activeBlockType === 'vertical')) && (
              <>
                <CourseContentList
                  title={intl.formatMessage(messages.problemAnalytics)}
                  contentList={problemBlocks}
                  icon={ICON_MAP[BlockTypes.problem]}
                  activateDashboard={activateDashboard}
                />
                <CourseContentList
                  title={intl.formatMessage(messages.videoAnalytics)}
                  contentList={videoBlocks}
                  icon={ICON_MAP[BlockTypes.video]}
                  activateDashboard={activateDashboard}
                />
              </>
            )
          }
          {(hideDashboard && !problemBlocks?.length && !videoBlocks?.length && !subsections?.length)
            && <Alert variant="danger" className="mb-0">No analytics available!</Alert>}
        </div>
      </Sticky>
    </div>
  );
}
