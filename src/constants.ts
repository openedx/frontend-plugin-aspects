import * as React from 'react';
import {
  ChromeReaderMode,
  HelpOutline,
  SchoolOutline,
  VideoCamera,
  ViewAgenda,
} from '@openedx/paragon/icons';

export enum BlockTypes {
  course = 'course',
  sequential = 'sequential',
  vertical = 'vertical',
  problem = 'problem',
  video = 'video',
}

export const ICON_MAP: Record<BlockTypes, React.ReactNode> = {
  [BlockTypes.course]: SchoolOutline,
  [BlockTypes.sequential]: ViewAgenda,
  [BlockTypes.vertical]: ChromeReaderMode,
  [BlockTypes.problem]: HelpOutline,
  [BlockTypes.video]: VideoCamera,
};
