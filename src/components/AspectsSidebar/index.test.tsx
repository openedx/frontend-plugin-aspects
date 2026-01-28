import * as React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { BlockTypes } from '../../constants';
import { AspectsSidebar, ContentList } from '.';
import { useAspectsSidebarContext } from '../../hooks';
import messages from '../../messages';
import '@testing-library/jest-dom';
import { Block } from '../../types';

// Mock dependencies
jest.mock('@edx/frontend-platform/i18n', () => ({
  defineMessages: jest.fn((messageObject) => messageObject),
  useIntl: () => ({
    formatMessage: (message: { defaultMessage: string }) => message.defaultMessage,
  }),
}));

const mockDashboard = jest.fn();
jest.mock('./Dashboard', () => ({
  Dashboard: () => mockDashboard,
}));

// Mock the IntersectionObserver window API
const intersectionObserverMock = () => ({
  observe: () => null,
  unobserve: () => null,
});
window.IntersectionObserver = jest.fn().mockImplementation(intersectionObserverMock);

const mockUnit: Block = {
  id: 'block-v1:test-block',
  type: BlockTypes.vertical,
  displayName: 'Test Unit',
  graded: false,
};
const mockContentLists: ContentList[] = [
  {
    title: 'Problem Blocks',
    blocks: [
      {
        id: 'block-v1:TEST+COURSE+SECTION1+prob1',
        type: BlockTypes.problem,
        displayName: 'Problem 1',
        graded: false,
      },
      {
        id: 'block-v1:TEST+COURSE+SECTION1+prob2',
        type: BlockTypes.problem,
        displayName: 'Problem 2',
        graded: true,
      },
    ],
  },
  {
    title: 'Video Blocks',
    blocks: [
      {
        id: 'block-v1:TEST+COURSE+SECTION2+vidoe1',
        type: BlockTypes.video,
        displayName: 'Video',
        graded: false,
      },
    ],
  },
];
const defaultProps = {
  title: 'Test Course',
  blockType: BlockTypes.course,
  dashboardId: 'course-v1:TEST+COURSE',
  contentLists: mockContentLists,
};

type InitialState = {
  activeBlock?: Block | null,
  filterUnit?: Block | null,
  filteredBlocks?: string[]
};

// Helper component to set context values for tests
function TestContextHelper({
  activeBlock = null, filterUnit = null, filteredBlocks = [],
}: InitialState) {
  const {
    setActiveBlock, setFilterUnit, setFilteredBlocks,
  } = useAspectsSidebarContext();

  // The sidebar will clear active/filter stuff to render cleanly on initalization
  // So, we can't set these values in the useEffect above. The only way to cleanly
  // do it is by userEvent.click - simulating real-world scenario
  return (
    <button
      type="button"
      onClick={() => {
        setActiveBlock(activeBlock);
        setFilterUnit(filterUnit);
        setFilteredBlocks(filteredBlocks);
      }}
    >
      Activate Unit
    </button>
  );
}

describe('AspectsSidebar', () => {
  const renderComponent = (
    initialState: InitialState = {},
    props?: Partial<React.ComponentProps<typeof AspectsSidebar>>,
  ) => render(

    <>
      <TestContextHelper {...initialState} />
      <AspectsSidebar
        {...defaultProps}
        {...props}
      />
    </>,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows the back button and changes the title when a block is clicked', () => {
    renderComponent();

    const problemBlockButton = screen.getByRole('button', { name: /Problem 1/ });
    fireEvent.click(problemBlockButton);

    // Verify the back button is visible
    const backButton = screen.getByRole('button', { name: 'Back' });
    expect(backButton).toBeVisible();

    // Verify the sidebar title has changed to the block's display name
    expect(screen.getByTestId('sidebar-title')).toHaveTextContent('Problem 1');
  });

  it('navigates back to the course title when clicking the back button from a block view', () => {
    renderComponent();

    const videoBlock = screen.getByRole('button', { name: /Video/i });
    fireEvent.click(videoBlock);
    expect(screen.getByTestId('sidebar-title')).toHaveTextContent('Video');
    const backButton = screen.getByRole('button', { name: 'Back' });
    fireEvent.click(backButton);

    expect(screen.getByTestId('sidebar-title')).toHaveTextContent(defaultProps.title);
    expect(screen.queryByRole('button', { name: 'Back' })).not.toBeInTheDocument();
  });

  it('shows an Alert message when the content lists are empty on a Unit Page', () => {
    // NOTE: Currently there is not "Unit Page Dashboard", hence the alert
    renderComponent(undefined, { blockType: BlockTypes.vertical, contentLists: [] });

    expect(mockDashboard).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent(messages.noAnalyticsForUnit.defaultMessage);
  });

  it('shows filtered set of components in the Course Outline view when specific unit is selected', () => {
    // render the component as if the "UnitActionsButton" has been clicked
    renderComponent({
      activeBlock: mockUnit,
      filterUnit: mockUnit,
      filteredBlocks: ['block-v1:TEST+COURSE+SECTION1+prob2'],
    });
    fireEvent.click(screen.getByText('Activate Unit'));

    // It should show the unit title on top and only one problem block that's part of the unit
    expect(screen.getByTestId('sidebar-title')).toHaveTextContent(mockUnit.displayName);
    expect(screen.getByRole('button', { name: 'Back' })).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Problem 1' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Problem 2' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Video' })).not.toBeInTheDocument();
  });

  it('navigate to component and back in filtered unit view', () => {
    renderComponent({
      activeBlock: mockUnit,
      filterUnit: mockUnit,
      filteredBlocks: ['block-v1:TEST+COURSE+SECTION1+prob2'],
    });
    fireEvent.click(screen.getByText('Activate Unit'));

    // Looking at the filtered unit view
    expect(screen.getByTestId('sidebar-title')).toHaveTextContent(mockUnit.displayName);
    expect(screen.getByRole('button', { name: 'Back' })).toBeVisible();

    // Go to component View
    fireEvent.click(screen.getByRole('button', { name: 'Problem 2' }));
    expect(screen.getByTestId('sidebar-title')).toHaveTextContent('Problem 2');

    // Come back to filtered Unit View
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByTestId('sidebar-title')).toHaveTextContent(mockUnit.displayName);

    // return all the way back to course view
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByTestId('sidebar-title')).toHaveTextContent(defaultProps.title);
  });

  it('posts a callback with the activatedBlock in Unit Page View', () => {
    const callback = jest.fn();
    renderComponent(undefined, {
      title: 'Test Unit',
      blockType: BlockTypes.vertical,
      contentLists: mockContentLists.slice(0, 1),
      blockActivatedCallback: callback,
      dashboardId: 'test-dashboard',
    });

    // click on a problem block
    fireEvent.click(screen.getByRole('button', { name: mockContentLists[0].blocks[0].displayName }));
    expect(callback).toHaveBeenCalledWith(mockContentLists[0].blocks[0]);
  });
});
