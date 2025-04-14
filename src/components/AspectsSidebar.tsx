import {useIntl} from '@edx/frontend-platform/i18n';
import {Alert, Button, Icon, IconButton, IconButtonWithTooltip, Spinner, Stack,} from '@openedx/paragon';
import {
  ArrowBack,
  AutoGraph,
  ChevronRight,
  Close,
  Edit as EditIcon,
  SchoolOutline,
  VideoCamera,
  ViewAgenda,
} from '@openedx/paragon/icons';
import * as React from 'react';
import {useParams} from 'react-router-dom';
import {Block, fetchGuestTokenFromBackend, useDashboardConfig,} from '../hooks';
import messages from '../messages';
import {AspectsSidebarContext} from './AspectsSidebarContext';
import "../styles.css";
import {embedDashboard} from "@superset-ui/embedded-sdk";


interface CourseContentListProps {
  title: string,
  contentList?: Block[] | null,
  icon: React.ReactNode,
}

const CourseContentList = ({title, contentList, icon}: CourseContentListProps) => {
  const {
    setLocation,
    setSidebarTitle,
  } = React.useContext(AspectsSidebarContext);

  if (!contentList || !contentList.length) { return; }

  return (
    <div className="d-flex flex-column rounded-bottom py-4 px-3 bg-white border-top border-light">
      <h4 className="h4 mb-4">{title}</h4>
      {contentList?.map(block => (
        <Button
          key={block.id}
          className="d-flex flex-row justify-content-start flex-grow-1 mb-2 py-1 px-0"
          variant="inline"
          onClick={() => {
            setLocation(block.id);
            setSidebarTitle(block.displayName);
          }}
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
          <Icon src={ChevronRight} aria-hidden/>
        </Button>
      ))}
    </div>
  );
};

const Dashboard = ({usageKey}: { usageKey: string }) => {
  const {loading, error, config: dashboardConfig} = useDashboardConfig(usageKey);
  const dashboardContainerId = 'dashboard-container';
  const {courseId} = useParams();

  React.useEffect(() => {
    if (!dashboardConfig?.supersetUrl || !dashboardConfig?.dashboardId) {
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

        const container = document.getElementById(dashboardContainerId);
        const iframe = container.querySelector('iframe');
        console.log(iframe.contentWindow.innerHeight);

      } catch (e) {
        console.error(e);
        return;
      }
    })();
  }, [dashboardConfig]);

  return (
    <div
      id={dashboardContainerId}
      className="aspects-sidebar-embed-container d-flex w-100"
    >
      {loading && <Spinner animation="border" className="mie-3" screenReaderText="loading"/>}
    </div>
  );

}


interface Props {
  title: string;
  icon: React.FC;
  hasDashboard: boolean;
  dashboardId: string;
  subsections: Block[] | null;
  problemBlocks: Block[] | null;
  videoBlocks: Block[] | null;
}


export const AspectsSidebar = ({
  title, icon, hasDashboard, dashboardId, subsections, problemBlocks, videoBlocks,
}: Props) => {
  const intl = useIntl();
  const { sidebarOpen, setSidebarOpen, setLocation } = React.useContext(AspectsSidebarContext);

  return sidebarOpen && (
    <div className="bg-white rounded shadow">
      <Stack className="sidebar-header">
        <Stack className="course-unit-sidebar-header px-4 pt-4" direction="horizontal">
          <h5 className="course-unit-sidebar-header-title h5 flex-grow-1 text-gray">
            {intl.formatMessage(messages.analyticsLabel)}
            <Icon
              src={AutoGraph}
              size="xs"
              className="d-inline-block ml-1"
              aria-hidden
              style={{verticalAlign: "middle"}}
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
          <IconButton
            alt={intl.formatMessage(messages.backButtonLabel)}
            src={ArrowBack}
            iconAs={Icon}
            onClick={() => setLocation(null)}
            size="sm"
            style={{display: "none"}}
            className="text-gray bg-white"
          />
          <Icon
            src={icon}
            size="sm"
            className="d-inline-block mr-1"
            aria-hidden
          />
          <span>{title}</span>
        </h3>
      </Stack>
      {hasDashboard && <Dashboard usageKey={dashboardId}/>}
      <CourseContentList
        title={intl.formatMessage(messages.gradedSubsectionAnalytics)}
        contentList={subsections}
        icon={ViewAgenda}
      />
      <CourseContentList
        title={intl.formatMessage(messages.problemAnalytics)}
        contentList={problemBlocks}
        icon={EditIcon}
      />
      <CourseContentList
        title={intl.formatMessage(messages.videoAnalytics)}
        contentList={videoBlocks}
        icon={VideoCamera}
      />
      {(!hasDashboard && !problemBlocks?.length && !videoBlocks?.length && !subsections?.length)
        && <Alert variant="danger" className="mb-0">No analytics available!</Alert>
      }
    </div>
  );
};
