import { DIRECT_PLUGIN, PLUGIN_OPERATIONS } from '@openedx/frontend-plugin-framework';
import { UnitActionsButton } from './components/UnitActionsButton';
import { CourseOutlineSidebarWrapper } from './components/CourseOutlineSidebar';
import { UnitOutlineSidebarWrapper } from './components/UnitPageSidebar';

export const pluginSlots = {
  course_authoring_outline_sidebar_slot: {
    keepDefault: true,
    plugins: [
      {
        op: PLUGIN_OPERATIONS.Wrap,
        widgetId: 'default_contents',
        wrapper: CourseOutlineSidebarWrapper,
      },
    ],
  },
  course_authoring_unit_sidebar_slot: {
    keepDefault: true,
    plugins: [
      {
        op: PLUGIN_OPERATIONS.Wrap,
        widgetId: 'default_contents',
        wrapper: UnitOutlineSidebarWrapper,
      },
    ],
  },
  course_outline_unit_card_extra_actions_slot: {
    keepDefault: true,
    plugins: [
      {
        op: PLUGIN_OPERATIONS.Insert,
        widget: {
          id: 'units-action-aspects-button',
          priority: 60,
          type: DIRECT_PLUGIN,
          RenderWidget: UnitActionsButton,
        },
      },
    ],
  },
  course_outline_subsection_card_extra_actions_slot: {
    keepDefault: true,
    plugins: [
      {
        op: PLUGIN_OPERATIONS.Insert,
        widget: {
          id: 'units-action-aspects-button',
          priority: 60,
          type: DIRECT_PLUGIN,
          RenderWidget: UnitActionsButton,
        },
      },
    ],
  },
};
