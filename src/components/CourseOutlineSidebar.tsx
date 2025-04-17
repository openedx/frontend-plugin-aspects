import * as React from 'react';
import { Block, useCourseBlocks } from '../hooks';
import { BlockTypes } from '../constants';
import { AspectsSidebar } from './AspectsSidebar';
import { AspectsSidebarContext } from './AspectsSidebarContext';

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
  let problems = data?.problems;
  let videos = data?.videos;
  const { filteredBlocks } = React.useContext(AspectsSidebarContext);
  if (filteredBlocks.length) {
    problems = problems?.filter(block => filteredBlocks.includes(block.id));
    videos = videos?.filter(block => filteredBlocks.includes(block.id));
  }

  return (
    <AspectsSidebar
      title={courseName}
      blockType={BlockTypes.course}
      dashboardId={courseId}
      subsections={gradedSubsections}
      problemBlocks={problems || null}
      videoBlocks={videos || null}
    />
  );
}
