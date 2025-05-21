import * as React from 'react';
import { render } from '@testing-library/react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { CourseOutlineSidebar } from './CourseOutlineSidebar';
import { useCourseBlocks, useAspectsSidebarContext } from '../hooks';
import { AspectsSidebar } from './AspectsSidebar';
import { BlockTypes } from '../constants';
import messages from '../messages';
import { Section, Block } from '../types';
import '@testing-library/jest-dom';

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
  useAspectsSidebarContext: jest.fn(),
}));

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
            category: 'vertical',
            children: [],
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

// Test Suite
describe('CourseOutlineSidebar', () => {
  // Mock implementations setup
  const mockFormatMessage = jest.fn((message) => message.defaultMessage || message.id);
  const mockUseIntl = useIntl as jest.Mock;
  const mockUseCourseBlocks = useCourseBlocks as jest.Mock;
  const mockUseAspectsSidebarContext = useAspectsSidebarContext as jest.Mock;
  const MockAspectsSidebar = AspectsSidebar as jest.Mock; // Get the mock constructor

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Default mock implementations
    mockUseIntl.mockReturnValue({ formatMessage: mockFormatMessage });
    mockUseCourseBlocks.mockReturnValue({ data: null, isLoading: true }); // Default to loading state
    mockUseAspectsSidebarContext.mockReturnValue({ filteredBlocks: undefined }); // Default to no filtering
    MockAspectsSidebar.mockClear(); // Clear calls specifically for the component mock
  });

  const renderComponent = (props: Partial<React.ComponentProps<typeof CourseOutlineSidebar>> = {}) => {
    const defaultProps = {
      courseId: mockCourseId,
      courseName: mockCourseName,
      sections: mockSections,
    };
    return render(<CourseOutlineSidebar {...defaultProps} {...props} />);
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
    mockUseAspectsSidebarContext.mockReturnValue({ filteredBlocks: [] });
    renderComponent({ sections: mockSections });

    expect(mockFormatMessage).toHaveBeenCalledWith(messages.gradedSubsectionAnalytics);
    const expectedGradedTitle = messages.gradedSubsectionAnalytics.defaultMessage;

    expect(MockAspectsSidebar).toHaveBeenCalledWith(
      expect.objectContaining({
        contentLists: [
          {
            title: expectedGradedTitle,
            blocks: [
              {
                id: 'subsection1_1',
                type: 'sequential',
                displayName: 'Graded Sub 1',
                graded: true,
                childInfo: {
                  category: 'vertical', children: [], displayName: 'Unit',
                },
              },
              {
                id: 'subsection2_1',
                type: 'sequential',
                displayName: 'Graded Sub 2',
                graded: true,
                childInfo: {
                  category: 'vertical', children: [], displayName: 'Unit',
                },
              },
            ],
          },
        ],
      }),
      {},
    );
  });

  it('displays problems when available', () => {
    mockUseCourseBlocks.mockReturnValue({ data: { problems: mockProblems, videos: [] } });
    mockUseAspectsSidebarContext.mockReturnValue({ filteredBlocks: undefined });
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
    mockUseAspectsSidebarContext.mockReturnValue({ filteredBlocks: undefined });
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
    mockUseAspectsSidebarContext.mockReturnValue({ filteredBlocks: [] });
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
    mockUseAspectsSidebarContext.mockReturnValue({ filteredBlocks: ['problem1'] }); // Filtering active
    renderComponent({ sections: mockSections });

    const expectedProblemTitle = messages.problemAnalytics.defaultMessage;

    expect(MockAspectsSidebar).toHaveBeenCalledWith(
      expect.objectContaining({
        contentLists: [
          {
            title: expectedProblemTitle,
            blocks: [mockProblems[0]], // Only problem1 due to filter
          },
          // Videos list would be empty due to filter, so not included
        ],
      }),
      {},
    );
  });

  it('filters problems based on filteredBlocks from context', () => {
    mockUseCourseBlocks.mockReturnValue({ data: { problems: mockProblems, videos: [] } });
    mockUseAspectsSidebarContext.mockReturnValue({ filteredBlocks: ['problem2'] }); // Filter for problem2
    renderComponent({ sections: [] });

    const expectedProblemTitle = messages.problemAnalytics.defaultMessage;

    expect(MockAspectsSidebar).toHaveBeenCalledWith(
      expect.objectContaining({
        contentLists: [
          {
            title: expectedProblemTitle,
            blocks: [mockProblems[1]], // Only problem2
          },
        ],
      }),
      {},
    );
  });

  it('filters videos based on filteredBlocks from context', () => {
    mockUseCourseBlocks.mockReturnValue({ data: { problems: [], videos: mockVideos } });
    mockUseAspectsSidebarContext.mockReturnValue({ filteredBlocks: ['video1'] }); // Filter for video1
    renderComponent({ sections: [] });

    const expectedVideoTitle = messages.videoAnalytics.defaultMessage;

    expect(MockAspectsSidebar).toHaveBeenCalledWith(
      expect.objectContaining({
        contentLists: [
          {
            title: expectedVideoTitle,
            blocks: [mockVideos[0]], // Only video1
          },
        ],
      }),
      {},
    );
  });

  it('handles empty data gracefully', () => {
    mockUseCourseBlocks.mockReturnValue({ data: { problems: [], videos: [] } });
    mockUseAspectsSidebarContext.mockReturnValue({ filteredBlocks: undefined });
    renderComponent({ sections: [] }); // No sections either

    expect(MockAspectsSidebar).toHaveBeenCalledWith(
      expect.objectContaining({
        contentLists: [], // Expect empty content list
      }),
      {},
    );
  });

  it('handles null sections gracefully', () => {
    mockUseCourseBlocks.mockReturnValue({ data: { problems: mockProblems, videos: [] } });
    mockUseAspectsSidebarContext.mockReturnValue({ filteredBlocks: undefined });
    // @ts-expect-error Testing null case even if type doesn't strictly allow it
    renderComponent({ sections: null });

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
    // Ensure graded section title wasn't attempted
    expect(mockFormatMessage).not.toHaveBeenCalledWith(messages.gradedSubsectionAnalytics);
  });
});
