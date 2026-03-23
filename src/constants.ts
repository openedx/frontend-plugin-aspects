import {
  HelpOutline,
  SchoolOutline,
  VideoCamera,
  ViewDay,
  WidthWide,
} from '@openedx/paragon/icons';

export enum BlockTypes {
  course = 'course',
  sequential = 'sequential',
  vertical = 'vertical',
  problem = 'problem',
  video = 'video',
}

export const ICON_MAP: Record<BlockTypes, React.FC> = {
  [BlockTypes.course]: SchoolOutline,
  [BlockTypes.sequential]: WidthWide,
  [BlockTypes.vertical]: ViewDay,
  [BlockTypes.problem]: HelpOutline,
  [BlockTypes.video]: VideoCamera,
};
