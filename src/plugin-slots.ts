import { DIRECT_PLUGIN, PLUGIN_OPERATIONS } from '@openedx/frontend-plugin-framework';
import { AspectsSidebarProvider } from './components/AspectsSidebarContext';
import { CourseHeaderButton } from './components/CourseHeaderButton';
import { SidebarToggleWrapper } from './components/SidebarToggleWrapper';
import { UnitActionsButton } from './components/UnitActionsButton';
import { CourseOutlineSidebar } from './components/CourseOutlineSidebar';
import { UnitPageSidebar } from './components/UnitPageSidebar';

export const pluginSlots = {
  course_outline_sidebar: {
    keepDefault: true,
    plugins: [
      {
        op: PLUGIN_OPERATIONS.Insert,
        widget: {
          id: 'outline-sidebar',
          priority: 1,
          type: DIRECT_PLUGIN,
          RenderWidget: CourseOutlineSidebar,
        },
      },
      {
        op: PLUGIN_OPERATIONS.Wrap,
        widgetId: 'default_contents',
        wrapper: SidebarToggleWrapper,
      },
    ],
  },
  course_unit_sidebar: {
    keepDefault: true,
    plugins: [
      {
        op: PLUGIN_OPERATIONS.Insert,
        widget: {
          id: 'course-unit-sidebar',
          priority: 1,
          type: DIRECT_PLUGIN,
          RenderWidget: UnitPageSidebar,
        },
      },
      {
        op: PLUGIN_OPERATIONS.Wrap,
        widgetId: 'default_contents',
        wrapper: SidebarToggleWrapper,
      },
    ],
  },
  course_unit_header_actions_slot: {
    keepDefault: true,
    plugins: [
      {
        op: PLUGIN_OPERATIONS.Insert,
        widget: {
          id: 'unit-header-aspects-button',
          priority: 60,
          type: DIRECT_PLUGIN,
          RenderWidget: CourseHeaderButton,
        },
      },
    ],
  },
  course_outline_header_actions_slot: {
    keepDefault: true,
    plugins: [
      {
        op: PLUGIN_OPERATIONS.Insert,
        widget: {
          id: 'outline-header-aspects-button',
          priority: 60,
          type: DIRECT_PLUGIN,
          RenderWidget: CourseHeaderButton,
        },
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
  authoring_app_wrapper: {
    keepDefault: true,
    plugins: [
      {
        op: PLUGIN_OPERATIONS.Wrap,
        widgetId: 'default_contents',
        wrapper: AspectsSidebarProvider,
      },
    ],
  },
};
