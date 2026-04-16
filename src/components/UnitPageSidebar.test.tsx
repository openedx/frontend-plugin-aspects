import React from 'react';
import { render, screen } from '@testing-library/react';

import {
  useUnitSidebarPagesContext,
  // @ts-ignore
} from 'CourseAuthoring/course-unit/unit-sidebar/UnitSidebarPagesContext';
import {
  useUnitSidebarContext,
  // @ts-ignore
} from 'CourseAuthoring/course-unit/unit-sidebar/UnitSidebarContext';

import { useAspectsSidebarContext } from '../hooks';
import { type XBlock, type Block, castToBlock } from '../types';
import { UnitOutlineAspectsPage, UnitOutlineSidebarWrapper } from './UnitPageSidebar';
import { AspectsSidebar } from './AspectsSidebar';
import { BlockTypes } from '../constants';

// Mock the AspectsSidebar for testing the props
const mockSendMessageToIframe = jest.fn();
jest.mock('./AspectsSidebar', () => ({
  AspectsSidebar: jest.fn(),
}));

// Mocks the hooks
jest.mock(
  'CourseAuthoring/generic/hooks/context/hooks',
  () => ({
    useIframe: jest.fn(() => ({
      sendMessageToIframe: mockSendMessageToIframe,
    })),
  }),
  { virtual: true },
);

jest.mock(
  'CourseAuthoring/course-unit/unit-sidebar/UnitSidebarContext',
  () => ({
    useUnitSidebarContext: jest.fn(),
  }),
  { virtual: true },
);

jest.mock(
  'CourseAuthoring/course-unit/unit-sidebar/UnitSidebarPagesContext',
  () => {
    const mockUnitSidebarPagesContext = React.createContext({});
    const useUnitSidebarPagesContextMocked = (
      () => React.useContext(mockUnitSidebarPagesContext) as Record<string, any>
    );

    return {
      UnitSidebarPagesContext: mockUnitSidebarPagesContext,
      useUnitSidebarPagesContext: useUnitSidebarPagesContextMocked,
    };
  },
  { virtual: true },
);

jest.mock('../hooks', () => ({
  useCourseBlocks: jest.fn(),
  useChildBlockCounts: jest.fn(),
  useAspectsSidebarContext: jest.fn(),
}));

const mockBlockId = 'block-v1:TestX+TST101+2025@vertical-block:12345';
const mockUnitTitle = 'Test Unit';
const mockXBlocks: XBlock[] = [
  {
    id: 'block-v1:TestX+TST101+2025@html+block@abcdef123456',
    name: 'Introduction Text',
    blockType: 'html',
  },
  {
    id: 'block-v1:TestX+TST101+2025@video+block@fedcba654321',
    name: 'Welcome Video',
    blockType: 'video',
  },
  {
    id: 'block-v1:TestX+TST101+2025@problem+block@123abc456def',
    name: 'Knowledge Check',
    blockType: 'problem',
  },
];

describe('UnitOutlineAspectsPage', () => {
  const MockAspectsSidebar = AspectsSidebar as jest.Mock;
  const mockUseUnitSidebarContext = useUnitSidebarContext as jest.Mock;
  const mockUseAspectsSidebarContext = useAspectsSidebarContext as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseUnitSidebarContext.mockReturnValue({
      selectedComponentId: undefined,
    });
    mockUseAspectsSidebarContext.mockReturnValue({
      setActiveBlock: jest.fn(),
      setFilteredBlocks: jest.fn(),
    });
  });

  const renderComponent = (
    props: Partial<React.ComponentProps<typeof UnitOutlineAspectsPage>> = {},
  ) => {
    const defaultProps = {
      blockId: mockBlockId,
      unitTitle: mockUnitTitle,
      xBlocks: mockXBlocks,
    };
    return render(<UnitOutlineAspectsPage {...defaultProps} {...props} />);
  };

  it('renders the sidebar with the right props', () => {
    renderComponent();

    expect(MockAspectsSidebar).toHaveBeenCalledTimes(1);
    expect(MockAspectsSidebar).toHaveBeenCalledWith(
      {
        title: mockUnitTitle,
        blockType: BlockTypes.vertical,
        dashboardId: mockBlockId,
        contentLists: [
          {
            // no title for the content lists in unit page, as they are not grouped
            title: '',
            // blocks are filtered to include only problem and video blocks
            blocks: [
              {
                id: 'block-v1:TestX+TST101+2025@video+block@fedcba654321',
                type: BlockTypes.video,
                displayName: 'Welcome Video',
                graded: false,
              },
              {
                id: 'block-v1:TestX+TST101+2025@problem+block@123abc456def',
                type: BlockTypes.problem,
                displayName: 'Knowledge Check',
                graded: false,
              },
            ],
          },
        ],
        blockActivatedCallback: expect.any(Function),
      },
      {},
    );
  });

  it('renders the sidebar with an empty content list when xBlocks is null', () => {
    // @ts-ignore - accept null for testing purposes only
    renderComponent({ xBlocks: null });

    expect(MockAspectsSidebar).toHaveBeenCalledTimes(1);
    expect(MockAspectsSidebar).toHaveBeenCalledWith(
      {
        title: mockUnitTitle,
        blockType: BlockTypes.vertical,
        dashboardId: mockBlockId,
        contentLists: [], // Expect empty contentLists
        blockActivatedCallback: expect.any(Function),
      },
      {},
    );
  });

  it('renders the sidebar with an empty content list when xBlocks is an empty array', () => {
    renderComponent({ xBlocks: [] });

    expect(MockAspectsSidebar).toHaveBeenCalledTimes(1);
    expect(MockAspectsSidebar).toHaveBeenCalledWith(
      {
        title: mockUnitTitle,
        blockType: BlockTypes.vertical,
        dashboardId: mockBlockId,
        contentLists: [], // Expect empty contentLists
        blockActivatedCallback: expect.any(Function),
      },
      {},
    );
  });

  it('filters the component blocks if we have a selected component', () => {
    mockUseUnitSidebarContext.mockReturnValue({
      selectedComponentId: mockXBlocks[1].id,
    });
    renderComponent();
    expect(mockUseAspectsSidebarContext().setFilteredBlocks)
      .toHaveBeenCalledWith([mockXBlocks[1].id]);
    expect(mockUseAspectsSidebarContext().setActiveBlock)
      .toHaveBeenCalledWith(castToBlock(mockXBlocks[1]));
  });

  it('calls sendMessageToIframe with the correct arguments when blockActivatedCallback is invoked', () => {
    renderComponent();

    // Get the blockActivatedCallback from the mock call arguments
    const callback = MockAspectsSidebar.mock.calls[0][0].blockActivatedCallback;
    const mockBlock: Block = {
      id: 'mock-block-id',
      type: 'mock-block-type',
      displayName: 'Mock Block',
      graded: false,
    };

    callback(mockBlock);

    expect(mockSendMessageToIframe).toHaveBeenCalledTimes(1);
    expect(mockSendMessageToIframe).toHaveBeenCalledWith('scrollToXBlock', {
      locator: mockBlock.id,
    });
  });
});

function MockComponent() {
  const sidebarPages = useUnitSidebarPagesContext();

  // Return a div with the title of the analytics page, reading from the context
  return (
    <div>
      {sidebarPages.analytics.title.defaultMessage}
    </div>
  );
}

describe('UnitOutlineSidebarWrapper', () => {
  const renderComponent = () => render(<UnitOutlineSidebarWrapper
    component={<MockComponent />}
    pluginProps={{
      blockId: mockBlockId,
      unitTitle: mockUnitTitle,
      xBlocks: mockXBlocks,
    }}
  />);

  it('adds analytics page to the sidebar', () => {
    renderComponent();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
  });
});
