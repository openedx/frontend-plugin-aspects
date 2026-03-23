import React from 'react';
import { render, screen } from '@testing-library/react';
import { useIntl } from '@edx/frontend-platform/i18n';

import {
  useOutlineSidebarContext,
  // @ts-ignore
} from 'CourseAuthoring/course-outline/outline-sidebar/OutlineSidebarContext';
import {
  useOutlineSidebarPagesContext,
  // @ts-ignore
} from 'CourseAuthoring/course-outline/outline-sidebar/OutlineSidebarPagesContext';

import { CourseOutlineAspectsPage, CourseOutlineSidebarWrapper } from './CourseOutlineSidebar';
import { useCourseBlocks, useChildBlockCounts, useAspectsSidebarContext } from '../hooks';
import { AspectsSidebar } from './AspectsSidebar';
import { BlockTypes } from '../constants';
import messages from '../messages';
import { type Section, type Block, castToBlock } from '../types';

// Mock the AspectsSidebar to check props
jest.mock('./AspectsSidebar', () => ({
  AspectsSidebar: jest.fn(() => null),
}));

// Mock hooks
jest.mock('@edx/frontend-platform/i18n', () => ({
  defineMessages: jest.fn((messageObject) => messageObject),
  useIntl: jest.fn(),
}));
jest.mock('../hooks', () => ({
  useCourseBlocks: jest.fn(),
  useChildBlockCounts: jest.fn(),
  useAspectsSidebarContext: jest.fn(),
}));

jest.mock(
  'CourseAuthoring/course-outline/outline-sidebar/OutlineSidebarPagesContext',
  () => {
    const mockOutlineSidebarPagesContext = React.createContext({});
    const useOutlineSidebarPagesContextMocked = (
      () => React.useContext(mockOutlineSidebarPagesContext) as Record<string, any>
    );

    return {
      OutlineSidebarPagesContext: mockOutlineSidebarPagesContext,
      useOutlineSidebarPagesContext: useOutlineSidebarPagesContextMocked,
    };
  },
  { virtual: true },
);

jest.mock(
  'CourseAuthoring/course-outline/outline-sidebar/OutlineSidebarContext',
  () => ({
    useOutlineSidebarContext: jest.fn(),
  }),
  { virtual: true },
);

// Test Data
const mockCourseId = 'course-v1:TestX+TST101+2025';
const mockCourseName = 'Test Course 101';

const mockSections: Section[] = [
  {
    id: 'section1',
    category: 'chapter',
    displayName: 'Chapter 1',
    graded: false,
    childInfo: {
      category: 'sequential',
      displayName: 'SubSection',
      children: [
        {
          id: 'subsection1_1',
          category: 'sequential',
          displayName: 'Graded Sub 1',
          graded: true,
          childInfo: {
            category: 'vertical', children: [], displayName: 'Unit',
          },
        },
        {
          id: 'subsection1_2',
          category: 'sequential',
          displayName: 'Non-Graded Sub 1',
          graded: false,
          childInfo: {
            category: 'vertical', children: [], displayName: 'Unit',
          },
        },
      ],
    },
  },
  {
    id: 'section2',
    category: 'chapter',
    displayName: 'Chapter 2',
    graded: false,
    childInfo: {
      category: 'sequential',
      displayName: 'SubSection',
      children: [
        {
          id: 'subsection2_1',
          category: 'sequential',
          displayName: 'Graded Sub 2',
          graded: true,
          childInfo: {
            category:
            'vertical',
            children: [{
              id: 'unit-id',
              category: 'vertical',
              displayName: 'Unit 1',
              graded: false,
            }],
            displayName: 'Unit',
          },
        },
      ],
    },
  },
];

const mockProblems: Block[] = [
  {
    id: 'problem1', type: BlockTypes.problem, displayName: 'Problem A',
  },
  {
    id: 'problem2', type: BlockTypes.problem, displayName: 'Problem B',
  },
];

const mockVideos: Block[] = [
  {
    id: 'video1', type: BlockTypes.video, displayName: 'Video X',
  },
  {
    id: 'video2', type: BlockTypes.video, displayName: 'Video Y',
  },
];

const mockProblemsBlockCount = {
  problem1: mockProblems[0],
  problem2: mockProblems[1],
};

const mockVideosBlockCount = {
  video1: mockVideos[0],
  video2: mockVideos[1],
};

// Test Suite
describe('CourseOutlineAspectsPage', () => {
  // Mock implementations setup
  const mockFormatMessage = jest.fn((message) => message.defaultMessage || message.id);
  const mockUseIntl = useIntl as jest.Mock;
  const mockUseCourseBlocks = useCourseBlocks as jest.Mock;
  const mockUseChildBlockCounts = useChildBlockCounts as jest.Mock;
  const mockUseAspectsSidebarContext = useAspectsSidebarContext as jest.Mock;
  const MockAspectsSidebar = AspectsSidebar as jest.Mock; // Get the mock constructor
  const mockUseOutlineSidebarContext = useOutlineSidebarContext as jest.Mock;

  const defaultUseAspectsSidebarContext = {
    filteredBlocks: undefined,
    setActiveBlock: jest.fn(),
    setFilterUnit: jest.fn(),
    setFilteredBlocks: jest.fn(),
  };

  const defaultUseOutlineSidebarContext = {
    currenntItemData: undefined,
  };

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Default mock implementations
    mockUseIntl.mockReturnValue({ formatMessage: mockFormatMessage });
    mockUseCourseBlocks.mockReturnValue({ data: null, isLoading: true }); // Default to loading state
    mockUseChildBlockCounts.mockReturnValue({ data: null, isLoading: true }); // Default to loading state
    mockUseAspectsSidebarContext.mockReturnValue(defaultUseAspectsSidebarContext); // Default to no filtering
    MockAspectsSidebar.mockClear(); // Clear calls specifically for the component mock
    mockUseOutlineSidebarContext.mockReturnValue(defaultUseOutlineSidebarContext);
  });

  const renderComponent = (props: Partial<React.ComponentProps<typeof CourseOutlineAspectsPage>> = {}) => {
    const defaultProps = {
      courseId: mockCourseId,
      courseName: mockCourseName,
      sections: mockSections,
    };
    return render(<CourseOutlineAspectsPage {...defaultProps} {...props} />);
  };

  // --- Test Cases ---

  it('renders AspectsSidebar with basic props', () => {
    mockUseCourseBlocks.mockReturnValue({ data: null }); // No data yet
    renderComponent();

    expect(MockAspectsSidebar).toHaveBeenCalledTimes(1);
    expect(MockAspectsSidebar).toHaveBeenCalledWith(
      expect.objectContaining({
        title: mockCourseName,
        blockType: BlockTypes.course,
        dashboardId: mockCourseId,
        contentLists: expect.any(Array),
      }),
      {},
    );
  });

  it('displays graded subsections when available and no filtering is active', () => {
    mockUseCourseBlocks.mockReturnValue({ data: { problems: [], videos: [] } });
    mockUseAspectsSidebarContext.mockReturnValue({
      ...defaultUseAspectsSidebarContext,
      filteredBlocks: [],
    });
    renderComponent({ sections: mockSections });

    expect(mockFormatMessage).toHaveBeenCalledWith(messages.gradedSubsectionAnalytics);
    const expectedGradedTitle = messages.gradedSubsectionAnalytics.defaultMessage;

    expect(MockAspectsSidebar).toHaveBeenCalledWith(
      expect.objectContaining({
        contentLists: [
          {
            title: expectedGradedTitle,
            blocks: [
              // Only graded subsections are shown
              castToBlock(mockSections[0].childInfo.children[0]),
              castToBlock(mockSections[1].childInfo.children[0]),
            ],
          },
        ],
      }),
      {},
    );
  });

  it('displays problems when available', () => {
    mockUseCourseBlocks.mockReturnValue({ data: { problems: mockProblems, videos: [] } });
    mockUseChildBlockCounts.mockReturnValue({
      data: {
        blocks: {
          ...mockProblemsBlockCount,
        },
      },
    });
    renderComponent({ sections: [] }); // No sections to avoid graded list

    expect(mockFormatMessage).toHaveBeenCalledWith(messages.problemAnalytics);
    const expectedProblemTitle = messages.problemAnalytics.defaultMessage;

    expect(MockAspectsSidebar).toHaveBeenCalledWith(
      expect.objectContaining({
        contentLists: [
          {
            title: expectedProblemTitle,
            blocks: mockProblems,
          },
        ],
      }),
      {},
    );
  });

  it('displays videos when available', () => {
    mockUseCourseBlocks.mockReturnValue({ data: { problems: [], videos: mockVideos } });
    mockUseChildBlockCounts.mockReturnValue({
      data: {
        blocks: {
          ...mockVideosBlockCount,
        },
      },
    });
    renderComponent({ sections: [] }); // No sections

    expect(mockFormatMessage).toHaveBeenCalledWith(messages.videoAnalytics);
    const expectedVideoTitle = messages.videoAnalytics.defaultMessage;

    expect(MockAspectsSidebar).toHaveBeenCalledWith(
      expect.objectContaining({
        contentLists: [
          {
            title: expectedVideoTitle,
            blocks: mockVideos,
          },
        ],
      }),
      {},
    );
  });

  it('displays all available content lists in order (graded, problems, videos) without filtering', () => {
    mockUseCourseBlocks.mockReturnValue({ data: { problems: mockProblems, videos: mockVideos } });
    mockUseChildBlockCounts.mockReturnValue({
      data: {
        blocks: {
          ...mockProblemsBlockCount,
          ...mockVideosBlockCount,
        },
      },
    });
    mockUseAspectsSidebarContext.mockReturnValue({
      ...defaultUseAspectsSidebarContext,
      filteredBlocks: [],
    }); // Filtering active
    renderComponent({ sections: mockSections });

    const expectedGradedTitle = messages.gradedSubsectionAnalytics.defaultMessage;
    const expectedProblemTitle = messages.problemAnalytics.defaultMessage;
    const expectedVideoTitle = messages.videoAnalytics.defaultMessage;

    expect(MockAspectsSidebar).toHaveBeenCalledWith(
      expect.objectContaining({
        contentLists: [
          {
            title: expectedGradedTitle,
            blocks: expect.arrayContaining([
              expect.objectContaining({ id: 'subsection1_1' }),
              expect.objectContaining({ id: 'subsection2_1' }),
            ]),
          },
          {
            title: expectedProblemTitle,
            blocks: mockProblems,
          },
          {
            title: expectedVideoTitle,
            blocks: mockVideos,
          },
        ],
      }),
      {},
    );
  });

  it('does NOT display graded subsections when filtering is active', () => {
    mockUseCourseBlocks.mockReturnValue({ data: { problems: mockProblems, videos: mockVideos } });
    mockUseAspectsSidebarContext.mockReturnValue({
      ...defaultUseAspectsSidebarContext,
      filteredBlocks: ['problem1'],
    }); // Filtering active
    renderComponent({ sections: mockSections });

    expect(MockAspectsSidebar.mock.calls[0][0].contentLists[0].title).not.toEqual(
      messages.gradedSubsectionAnalytics.defaultMessage,
    );
  });

  it('handles empty data gracefully', () => {
    mockUseCourseBlocks.mockReturnValue({ data: { problems: [], videos: [] } });
    renderComponent({ sections: [] }); // No sections either

    expect(MockAspectsSidebar).toHaveBeenCalledWith(
      expect.objectContaining({
        contentLists: [], // Expect empty content list
      }),
      {},
    );
  });

  it('handles the effects where we have currentItemData set to a Section', () => {
    mockUseCourseBlocks.mockReturnValue({ data: { problems: mockProblems, videos: [] } });
    mockUseChildBlockCounts.mockReturnValue({
      data: {
        blocks: {
          ...mockProblemsBlockCount,
        },
      },
      error: null,
    });
    mockUseAspectsSidebarContext.mockReturnValue({
      ...defaultUseAspectsSidebarContext,
      filteredBlocks: [],
    });
    const mockSection = mockSections[1];
    mockUseOutlineSidebarContext.mockReturnValue({
      ...defaultUseOutlineSidebarContext,
      currentItemData: mockSection,
    });

    renderComponent({ sections: [] });

    expect(defaultUseAspectsSidebarContext.setActiveBlock).toHaveBeenCalledWith(castToBlock(mockSection));
    expect(defaultUseAspectsSidebarContext.setFilteredBlocks).toHaveBeenCalledWith([]);
    expect(defaultUseAspectsSidebarContext.setFilterUnit).toHaveBeenCalledWith(null);

    // Sections don't have analytics sidebar
    expect(MockAspectsSidebar).toHaveBeenCalledWith(
      expect.objectContaining({
        showNoAnalyticsMessage: true,
      }),
      {},
    );
  });

  it('handles the effects where we have currentItemData set to a Subsection', () => {
    mockUseCourseBlocks.mockReturnValue({ data: { problems: mockProblems, videos: [] } });
    mockUseChildBlockCounts.mockReturnValue({
      data: {
        blocks: {
          ...mockProblemsBlockCount,
        },
      },
      error: null,
    });
    mockUseAspectsSidebarContext.mockReturnValue({
      ...defaultUseAspectsSidebarContext,
      filteredBlocks: [],
    });
    const mockSubsection = mockSections[1].childInfo.children[0];
    mockUseOutlineSidebarContext.mockReturnValue({
      ...defaultUseOutlineSidebarContext,
      currentItemData: mockSubsection,
    });

    renderComponent({ sections: [] });

    expect(defaultUseAspectsSidebarContext.setActiveBlock).toHaveBeenCalledWith(castToBlock(mockSubsection));
    expect(defaultUseAspectsSidebarContext.setFilteredBlocks).toHaveBeenCalledWith([]);
    expect(defaultUseAspectsSidebarContext.setFilterUnit).toHaveBeenCalledWith(null);

    expect(MockAspectsSidebar).toHaveBeenCalledWith(
      expect.objectContaining({
        showNoAnalyticsMessage: false,
      }),
      {},
    );
  });

  it('handles the effects where we have currentItemData set to a Unit', () => {
    mockUseCourseBlocks.mockReturnValue({ data: { problems: mockProblems, videos: [] } });
    mockUseChildBlockCounts.mockReturnValue({
      data: {
        blocks: {
          ...mockProblemsBlockCount,
        },
      },
      error: null,
    });
    mockUseAspectsSidebarContext.mockReturnValue({
      ...defaultUseAspectsSidebarContext,
      filteredBlocks: [],
    });
    const mockUnit = mockSections[1].childInfo.children[0].childInfo.children![0];
    mockUseOutlineSidebarContext.mockReturnValue({
      ...defaultUseOutlineSidebarContext,
      currentItemData: mockUnit,
    });

    renderComponent({ sections: [] });

    const expectedFilteredBlocks = Object.keys(mockProblemsBlockCount);
    expect(defaultUseAspectsSidebarContext.setActiveBlock).toHaveBeenCalledWith(castToBlock(mockUnit));
    expect(defaultUseAspectsSidebarContext.setFilteredBlocks).toHaveBeenCalledWith(expectedFilteredBlocks);
    expect(defaultUseAspectsSidebarContext.setFilterUnit).toHaveBeenCalledWith(castToBlock(mockUnit));

    expect(MockAspectsSidebar).toHaveBeenCalledWith(
      expect.objectContaining({
        showNoAnalyticsMessage: false,
      }),
      {},
    );
  });
});

function MockComponent() {
  const sidebarPages = useOutlineSidebarPagesContext();

  // Return a div with the title of the analytics page, reading from the context
  return (
    <div>
      {sidebarPages.analytics.title.defaultMessage}
    </div>
  );
}

describe('CourseOutlineSidebarWrapper', () => {
  const renderComponent = () => render(<CourseOutlineSidebarWrapper
    component={<MockComponent />}
    pluginProps={{
      courseId: mockCourseId,
      courseName: mockCourseName,
      sections: mockSections,
    }}
  />);

  it('adds analytics page to the sidebar', () => {
    renderComponent();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
  });
});
