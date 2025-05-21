import * as React from 'react';
import { render } from '@testing-library/react';
import { XBlock } from '../types';
import { UnitPageSidebar } from './UnitPageSidebar';
import { AspectsSidebar } from './AspectsSidebar';
import { BlockTypes } from '../constants';

// Mock the AspectsSidebar for testing the props
jest.mock('./AspectsSidebar', () => ({
  AspectsSidebar: jest.fn(),
}));

// Mocks the hooks
jest.mock(
  'CourseAuthoring/generic/hooks/context/hooks',
  () => ({
    useIframe: jest.fn(() => ({
      sendMessageToIframe: jest.fn(),
    })),
  }),
  { virtual: true },
);

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

describe('UnitPageSidebar', () => {
  const MockAspectsSidebar = AspectsSidebar;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = (
    props: Partial<React.ComponentProps<typeof UnitPageSidebar>> = {},
  ) => {
    const defaultProps = {
      blockId: mockBlockId,
      unitTitle: mockUnitTitle,
      xBlocks: mockXBlocks,
    };
    return render(<UnitPageSidebar {...defaultProps} {...props} />);
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
});
