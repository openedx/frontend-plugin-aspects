import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Alert, Button, Icon, IconButton, IconButtonWithTooltip, Spinner, Stack, Sticky,
} from '@openedx/paragon';
import {
  ArrowBack, AutoGraph, ChevronRight, Close,
} from '@openedx/paragon/icons';
import * as React from 'react';
import { useParams } from 'react-router-dom';
import { embedDashboard } from '@superset-ui/embedded-sdk';
import { Block, fetchGuestTokenFromBackend, useDashboardConfig } from '../hooks';
import messages from '../messages';
import { AspectsSidebarContext } from './AspectsSidebarContext';
import '../styles.css';
import { BlockTypes, ICON_MAP } from '../constants';

interface CourseContentListProps {
  title: string,
  contentList?: Block[] | null,
  icon: React.ReactNode,
  activateDashboard: (block: Block) => void,
}

const CourseContentList = ({
  title, contentList, icon, activateDashboard,
}: CourseContentListProps) => {
  if (!contentList || !contentList.length) {
    return;
  }

  return (
    <div className="d-flex flex-column rounded-bottom py-4 px-3 bg-white border-top border-light">
      <h4 className="h4 mb-4">{title}</h4>
      {contentList?.map(block => (
        <Button
          key={block.id}
          className="d-flex flex-row justify-content-start flex-grow-1 mb-2 py-1 px-0"
          variant="inline"
          onClick={() => activateDashboard(block)}
        >
          <h5 className="h5 flex-grow-1 text-left d-flex align-items-center">
            <Icon
              src={icon}
              size="xs"
              className="mr-2 text-gray"
              aria-hidden
            />
            <span>{block.displayName || block.name}</span>
          </h5>
          <Icon src={ChevronRight} aria-hidden />
        </Button>
      ))}
    </div>
  );
};

const Dashboard = ({ usageKey }: { usageKey: string }) => {
  const { loading, error, config: dashboardConfig } = useDashboardConfig(usageKey);
  const dashboardContainerId = 'dashboard-container';
  const { courseId } = useParams();

  React.useEffect(() => {
    if (!dashboardConfig?.supersetUrl || !dashboardConfig?.dashboardId) {
      // The Iframe needs to be explicitly removed as it is populated by the
      // Superset SDK and doesn't update on React State changes.
      document.getElementById(dashboardContainerId).innerHTML = '';
      return;
    }
    (async () => {
      try {
        await embedDashboard({
          id: dashboardConfig.dashboardId,
          supersetDomain: dashboardConfig.supersetUrl,
          mountPoint: document.getElementById(dashboardContainerId),
          fetchGuestToken: async () => fetchGuestTokenFromBackend(courseId),
          dashboardUiConfig: {
            hideTitle: true,
            hideTab: true,
            filters: {
              visible: false,
              expanded: false,
            },
            urlParams: {
              native_filters: dashboardConfig.courseRuns[dashboardConfig.defaultCourseRun].native_filters,
            },
          },
        });
      } catch (e) {

      }
    })();
  }, [dashboardConfig]);

  return (
    <>
      <div id={dashboardContainerId} className="aspects-sidebar-embed-container d-flex w-100" />
      {loading && !error && <Spinner animation="border" className="mie-3" screenReaderText="loading" />}
    </>
  );
};

interface AspectsSidebarProps {
  title: string;
  blockType: BlockTypes;
  // The Unit page level metrics are currently not implemented.
  // This property is used to track it, so we can correctly show "No metrics" alert.
  hasDashboard: boolean;
  dashboardId: string;
  subsections?: Block[] | null;
  problemBlocks: Block[] | null;
  videoBlocks: Block[] | null;
  blockActivatedCallback?: (block: Block) => void;
}

export const AspectsSidebar = ({
  title,
  blockType,
  hasDashboard,
  dashboardId,
  subsections,
  problemBlocks,
  videoBlocks,
  blockActivatedCallback,
}: AspectsSidebarProps) => {
  const intl = useIntl();
  const { sidebarOpen, setSidebarOpen, setLocation } = React.useContext(AspectsSidebarContext);
  const [activeDashboard, setActiveDashboard] = React.useState<string>(dashboardId);
  const [activeTitle, setActiveTitle] = React.useState<string>(title);
  const [activeBlockType, setActiveBlockType] = React.useState<BlockTypes>(blockType);

  const activateDashboard = (block: Block) => {
    setActiveDashboard(block.id);
    setActiveTitle(block.name || block.displayName);
    const currentBlockType = block.category || block.type || block.blockType;
    setActiveBlockType(BlockTypes[currentBlockType]);
    // call the callback only in unit-page
    if (blockType === BlockTypes.vertical) {
      blockActivatedCallback(block);
    }
  };
  // reset all the active values to props
  const goBack = () => {
    setActiveDashboard(dashboardId);
    setActiveTitle(title);
    setActiveBlockType(blockType);
  };

  return sidebarOpen && (
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
              {title !== activeTitle && (
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
              <span>{activeTitle}</span>
            </h3>
          </Stack>
          <Dashboard usageKey={activeDashboard} />
          {
            activeBlockType === 'course' && (
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
          {(!hasDashboard && !problemBlocks?.length && !videoBlocks?.length && !subsections?.length)
            && <Alert variant="danger" className="mb-0">No analytics available!</Alert>}
        </div>
      </Sticky>
    </div>
  );
};
