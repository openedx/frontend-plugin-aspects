import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Alert, Button, Icon, IconButton, IconButtonWithTooltip, Skeleton, Stack, Sticky,
} from '@openedx/paragon';
import {
  ArrowBack, AutoGraph, ChevronRight, ArrowDropDown, ArrowDropUp, Close,
} from '@openedx/paragon/icons';
import * as React from 'react';
import { useParams } from 'react-router-dom';
import { embedDashboard, EmbeddedDashboard, Size } from '@superset-ui/embedded-sdk';
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
  const intl = useIntl();
  const [showCount, setShowCount] = React.useState<number>(5);

  return (contentList?.length) && (
    <div className="d-flex flex-column rounded-bottom py-4 px-3 bg-white border-top border-light">
      <h4 className="h4 mb-4">{title}</h4>
      {contentList?.slice(0, showCount).map(block => (
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
      {(contentList?.length > 5) && (
        <Button
          variant="tertiary"
          size="sm"
          iconAfter={showCount === 5 ? ArrowDropDown : ArrowDropUp}
          onClick={() => setShowCount(showCount === 5 ? undefined : 5)}
        >
          { showCount === 5 ? intl.formatMessage(messages.showMore) : intl.formatMessage(messages.showLess) }
        </Button>
      )}
    </div>
  );
};

const Dashboard = ({ usageKey }: { usageKey: string }) => {
  const { loading, error, config: dashboardConfig } = useDashboardConfig(usageKey);
  const containerDiv = React.useRef(null);
  const { courseId } = useParams();
  const [containerHeight, setContainerHeight] = React.useState<number>(30);

  React.useEffect(() => {
    // Hide the dashboard when navigating
    setContainerHeight(0);

    if (!dashboardConfig?.supersetUrl || !dashboardConfig?.dashboardId) {
      return;
    }

    (async () => {
      let iframe: EmbeddedDashboard|null = null;
      /**
       * The Superset Embed SDK provides a `getScrollSize` method that can return
       * the height and width of the iframe. However, the value is resolved as soon
       * as the DOM finishes loading. The charts take a while to render fully making
       * the value stale and the charts get hidden.
       *
       * The updateHeight method gets around this by using `setTimeout` to poll for
       * the height. The polling is stopped when the height stops changing.
       */
      const updateHeight = async () => {
        if (iframe) {
          const size: Size = await iframe.getScrollSize();
          if (size.height !== containerHeight) {
            setContainerHeight(size.height);
            setTimeout(updateHeight, 1000);
          }
        }
      };

      try {
        iframe = await embedDashboard({
          id: dashboardConfig.dashboardId,
          supersetDomain: dashboardConfig.supersetUrl,
          mountPoint: containerDiv.current,
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
        console.error(e);
      }
      if (iframe) {
        await updateHeight();
      }
    })();
    // `containerHeight` is skipped to prevent height changes from re-rendering iframes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dashboardConfig, courseId]);

  return (
    <>
      {loading && !error && <Skeleton />}
      <div
        ref={containerDiv}
        className="aspects-sidebar-embed-container d-flex w-100"
        style={{ height: containerHeight }}
      />
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
