import * as React from 'react';
import { Block, useCourseBlocks } from '../hooks';
import { BlockTypes } from '../constants';
import { AspectsSidebar } from './AspectsSidebar';

interface ChildInfo {
  children: Block[]
}

interface Section {
  id: string;
  displayName: string;
  childInfo: ChildInfo;
}

interface Props {
  courseId: string;
  courseName: string;
  sections: Section[];
}

function* getGradedSubsections(sections: Section[]) {
  for (const section of sections) {
    for (const subsection of section.childInfo.children) {
      if (subsection.graded) {
        yield subsection;
      }
    }
  }
}

export function CourseOutlineSidebar({ courseId, courseName, sections }: Props) {
  const gradedSubsections = sections ? Array.from(getGradedSubsections(sections)) : null;
  const { data } = useCourseBlocks(courseId);

  return (
    <AspectsSidebar
      title={courseName}
      blockType={BlockTypes.course}
      hasDashboard
      dashboardId={courseId}
      subsections={gradedSubsections}
      problemBlocks={data.problems}
      videoBlocks={data.videos}
    />
  );
}
