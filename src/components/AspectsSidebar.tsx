import { useIntl } from "@edx/frontend-platform/i18n";
import {
    Card,
    Dropdown,
    DropdownButton,
    Icon,
    IconButton,
    IconButtonWithTooltip,
    Stack
} from "@openedx/paragon";
import { Analytics, ArrowBack, AvTimer, Close } from "@openedx/paragon/icons";
import * as React from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useDashboardEmbed } from "../hooks";
import messages from "../messages";
import { AspectsSidebarContext } from "./AspectsSidebarContext";

export const AspectsSidebar = () => {
    const intl = useIntl();
    const {
        sidebarOpen,
        sidebarTitle,
        location,
        setSidebarOpen,
        setLocation
    } = React.useContext(AspectsSidebarContext);
    const {courseId} = useParams();
    const courseName = useSelector(state => state.models?.courseDetails?.[courseId]?.name);
    const dashboardContainerId = 'dashboard-container';

    useDashboardEmbed(dashboardContainerId, location ?? courseId);

    return sidebarOpen && (
        <Card className="bg-white rounded">
            <div className="sidebar-header d-flex flex-column shadow p-2">
                <Stack className="course-unit-sidebar-header" direction="horizontal">
                    <h3 className="course-unit-sidebar-header-title m-0 d-flex align-items-center flex-grow-1">
                        {intl.formatMessage(messages.analyticsLabel)} <Icon src={Analytics}
                                                                            aria-hidden/>
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
                    {location &&
                            <IconButton
                                    alt={intl.formatMessage(messages.backButtonLabel)}
                                    src={ArrowBack}
                                    iconAs={Icon}
                                    variant="black"
                                    onClick={() => setLocation(null)} size="inline"
                            />
                    }
                    {location
                        ? sidebarTitle
                        : courseName}
                </div>
                <DropdownButton variant="outline-primary" title={
                    <span className="d-flex align-items-center mr-1 p-0"><Icon src={AvTimer}/>Dropdown button</span>
                }>
                    <Dropdown.Item href="#/action-1">Action</Dropdown.Item>
                    <Dropdown.Item href="#/action-2">Another action</Dropdown.Item>
                    <Dropdown.Item href="#/action-3">Something else</Dropdown.Item>
                </DropdownButton>
            </div>
            <div id={dashboardContainerId}
                 className="d-flex w-100 align-items-center justify-content-center align-content-center"/>
        </Card>
    );
};
