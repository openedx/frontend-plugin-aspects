import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Button, Card, Icon, IconButton, IconButtonWithTooltip, Stack,
} from '@openedx/paragon';
import {
  ArrowBack, AutoGraph, ChevronRight, Close, ViewAgenda, VideoCamera, Edit as EditIcon,
} from '@openedx/paragon/icons';
import * as React from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Block, useBlockData, useDashboardEmbed } from '../hooks';
import messages from '../messages';
import { AspectsSidebarContext } from './AspectsSidebarContext';

function* getGradedSubsections(sectionsList) {
  for (const section of sectionsList) {
    for (const subsection of section.childInfo.children) {
      if (subsection.graded) {
        yield subsection;
      }
    }
  }
}

interface CourseContentListProps {
    title: string,
    contentList?: Block[] | null,
    icon: React.ReactNode,
}

const CourseContentList = ({ title, contentList, icon }:CourseContentListProps) => {
  const {
    setLocation,
    setSidebarTitle,
  } = React.useContext(AspectsSidebarContext);

  return (
    <div className="d-flex flex-column shadow p-2 my-2 bg-white">
      <h4>{title}</h4>
      {contentList?.map(block => (
        <Button
          className="d-flex flex-row justify-content-start flex-grow-1 my-1"
          variant="inline"
          onClick={() => {
            setLocation(block.id);
            setSidebarTitle(block.displayName);
          }}
        >
          <Icon src={icon} aria-hidden />
          <span className="d-flex flex-grow-1 text-left ml-2">
            {block.displayName}
          </span>
          <Icon src={ChevronRight} aria-hidden />
        </Button>
      ))}
    </div>
  );
};

export const AspectsSidebar = () => {
  const intl = useIntl();
  const {
    sidebarOpen,
    sidebarTitle,
    location,
    setSidebarOpen,
    setLocation,
  } = React.useContext(AspectsSidebarContext);
  const { courseId } = useParams();
  const courseName = useSelector(state => state.models?.courseDetails?.[courseId]?.name);
  const dashboardContainerId = 'dashboard-container';
  const { data } = useBlockData(courseId);
  const { error } = useDashboardEmbed(dashboardContainerId, location ?? courseId, sidebarOpen);
  const sectionsList = useSelector(state => state.courseOutline.sectionsList);
  const gradedSubsections = sectionsList ? Array.from(getGradedSubsections(sectionsList)) : null;

  return sidebarOpen && (
    <Card className="rounded position-sticky" style={{ top: '2rem' }}>
      <div className="sidebar-header d-flex flex-column shadow p-2 bg-white">
        <Stack className="course-unit-sidebar-header" direction="horizontal">
          <h3 className="course-unit-sidebar-header-title m-0 d-flex align-items-center flex-grow-1">
            {intl.formatMessage(messages.analyticsLabel)} <Icon
              src={AutoGraph}
              aria-hidden
            />
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
            />
          </h3>
        </Stack>
        <div className="d-flex flex-row align-items-center my-2">
          {location && (
          <IconButton
            alt={intl.formatMessage(messages.backButtonLabel)}
            src={ArrowBack}
            iconAs={Icon}
            variant="black"
            onClick={() => setLocation(null)}
            size="inline"
          />
          )}
          {location
            ? sidebarTitle
            : courseName}
        </div>
      </div>
      <div id={dashboardContainerId} className="d-flex w-100" />
      {!location && (
      <>
        <CourseContentList
          title={intl.formatMessage(messages.gradedSubsectionAnalytics)}
          contentList={gradedSubsections}
          icon={ViewAgenda}
        />
        <CourseContentList
          title={intl.formatMessage(messages.videoAnalytics)}
          contentList={data?.videos}
          icon={VideoCamera}
        />
        <CourseContentList
          title={intl.formatMessage(messages.problemAnalytics)}
          contentList={data?.problems}
          icon={EditIcon}
        />
      </>
      )}
      {error && <div>Error: {error.message}</div>}
    </Card>
  );
};
