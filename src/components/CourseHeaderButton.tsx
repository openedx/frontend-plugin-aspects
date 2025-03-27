import { useIntl } from "@edx/frontend-platform/i18n";
import { Button } from "@openedx/paragon";
import { Analytics } from "@openedx/paragon/icons";
import * as React from "react";
import { useMatch, useParams } from "react-router-dom";
import messages from "../messages";
import { AspectsSidebarContext, SidebarContext } from "./AspectsSidebarContext";

export const CourseHeaderButton = ({unitTitle = null}: { unitTitle: string | null }) => {
    const intl = useIntl();
    const {blockId} = useParams();
    console.log({blockId, unitTitle, params: useMatch("/container/:blockId")});
    const {
        sidebarOpen,
        setSidebarOpen,
        setLocation,
        setSidebarTitle,
    } = React.useContext<SidebarContext>(AspectsSidebarContext);
    return (
        <Button
            variant={
                sidebarOpen ? "primary" : "outline-primary"
            }
            iconBefore={Analytics}
            onClick={() => {
                setSidebarOpen(!sidebarOpen);
                setLocation(blockId);
                setSidebarTitle(unitTitle);
            }}
        >
            {intl.formatMessage(messages.analyticsLabel)}
        </Button>
    );
};
