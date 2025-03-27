import { useIntl } from "@edx/frontend-platform/i18n";
import { Icon, IconButton } from "@openedx/paragon";
import { Analytics } from "@openedx/paragon/icons";
import * as React from "react";
import messages from "../messages";
import { AspectsSidebarContext, SidebarContext } from "./AspectsSidebarContext";

interface UnitActionsButtonProps {
    cardId: string,
    isVertical: boolean,
    title: string,
}

export const UnitActionsButton = ({
                                      cardId,
                                      isVertical,
                                      title
                                  }: UnitActionsButtonProps) => {
    const intl = useIntl();
    const {
        sidebarOpen,
        location,
        setSidebarOpen,
        setSidebarTitle,
        setLocation
    } = React.useContext<SidebarContext>(AspectsSidebarContext);
    return isVertical && (
        <IconButton
            isActive={sidebarOpen && location === cardId}
            alt={intl.formatMessage(messages.analyticsLabel)}
            src={Analytics}
            iconAs={Icon}
            variant="black"
            onClick={() => {
                if (location === cardId) {
                    setSidebarOpen(false);
                } else {
                    setLocation(cardId);
                    setSidebarOpen(true);
                    setSidebarTitle(title);
                }
            }}
        />
    );
}
