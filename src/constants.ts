import * as React from 'react';
import {
  ChromeReaderMode,
  HelpOutline,
  SchoolOutline,
  VideoCamera,
  ViewAgenda,
} from '@openedx/paragon/icons';

export enum BLOCK_TYPES {
  course = 'course',
  sequential = 'sequential',
  vertical = 'vertical',
  problem = 'problem',
  video = 'video',
}

export const ICON_MAP: Record<BLOCK_TYPES, React.ReactNode> = {
  [BLOCK_TYPES.course]: SchoolOutline,
  [BLOCK_TYPES.sequential]: ViewAgenda,
  [BLOCK_TYPES.vertical]: ChromeReaderMode,
  [BLOCK_TYPES.problem]: HelpOutline,
  [BLOCK_TYPES.video]: VideoCamera,
}
