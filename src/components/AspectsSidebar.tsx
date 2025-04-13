import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Button, Icon, IconButton, IconButtonWithTooltip, Stack,
} from '@openedx/paragon';
import {
  ArrowBack, AutoGraph, ChevronRight, Close, ViewAgenda, VideoCamera, Edit as EditIcon, SchoolOutline,
} from '@openedx/paragon/icons';
import * as React from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Block, useBlockData, useDashboardEmbed } from '../hooks';
import messages from '../messages';
import { AspectsSidebarContext } from './AspectsSidebarContext';
import "../styles.css";

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
    <div className="d-flex flex-column my-4 px-3 bg-white border-bottom border-light">
      <h4 className="h4 mb-4">{title}</h4>
      {contentList?.map(block => (
        <Button
          className="d-flex flex-row justify-content-start flex-grow-1 mb-2 py-1 px-0"
          variant="inline"
          onClick={() => {
            setLocation(block.id);
            setSidebarTitle(block.displayName);
          }}
        >
          <h5 className="h5 flex-grow-1 text-left d-flex">
            <Icon
              src={icon}
              size="xs"
              className="mr-2 text-gray"
              style={{verticalAlign: "middle"}}
              aria-hidden
            />
            <span>{block.displayName}</span>
          </h5>
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
    <div className="bg-white">
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
        <h3 className="h3 px-4 pb-4 mb-0 border-bottom">
          <IconButton
            alt={intl.formatMessage(messages.backButtonLabel)}
            src={location ? ArrowBack: SchoolOutline}
            iconAs={Icon}
            onClick={() => setLocation(null)}
            size="sm"
            style={{verticalAlign: "middle"}}
            className="mr-2 text-gray bg-white"
            variant="link"
          />
          {location
            ? sidebarTitle
            : courseName}
        </h3>
      </Stack>
      <div id={dashboardContainerId} className="aspects-sidebar-embed-container d-flex w-100 mb-5" />
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
    </div>
  );
};
