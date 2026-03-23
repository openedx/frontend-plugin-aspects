import React from 'react';
import { userEvent } from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';

import {
  useOutlineSidebarContext,
  // @ts-ignore
} from 'CourseAuthoring/course-outline/outline-sidebar/OutlineSidebarContext';

import { useChildBlockCounts } from '../hooks';
import { UnitActionsButton } from './UnitActionsButton';
import type { Unit } from '../types';

// Mock the hooks module
jest.mock('../hooks', () => ({
  useChildBlockCounts: jest.fn(),
}));

// Mock dependencies
jest.mock('@edx/frontend-platform/i18n', () => ({
  defineMessages: jest.fn((messageObject) => messageObject),
  useIntl: () => ({
    formatMessage: (message: { defaultMessage: string }) => message.defaultMessage,
  }),
}));

jest.mock(
  'CourseAuthoring/course-outline/outline-sidebar/OutlineSidebarContext',
  () => ({
    useOutlineSidebarContext: jest.fn(),
  }),
  { virtual: true },
);

// Test Data
const mockUnit: Unit = {
  category: 'vertical',
  displayName: 'My Unit',
  graded: false,
  id: 'unit-id',
};

const mockUseOutlineSidebarContext = useOutlineSidebarContext as jest.Mock;
const mockUseChildBlockCounts = useChildBlockCounts as jest.Mock;

describe('UnitActionsButton', () => {
  const mockSetCurrentPageKey = jest.fn();
  const mockSetSelectedContainerState = jest.fn();

  const defaultSidebarContextValue = {
    setCurrentPageKey: mockSetCurrentPageKey,
    setSelectedContainerState: mockSetSelectedContainerState,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseOutlineSidebarContext.mockReturnValue(defaultSidebarContextValue);
  });

  it('does not show analytics button if unit does have any related blocks', () => {
    mockUseChildBlockCounts.mockReturnValue({ data: { blocks: {}, root: mockUnit.id }, error: null });
    render(<UnitActionsButton unit={mockUnit} />);
    expect(screen.queryByRole('button', { name: /analytics/i })).toBeNull();
  });

  it('opens sidebar and sets current block when clicking button', async () => {
    mockUseChildBlockCounts.mockReturnValue({
      data: {
        blocks: {
          'block-v1:TestX+TST101+2025@problem+block@123abc456def': {},
        },
        root: mockUnit.id,
      },
      error: null,
    });
    const user = userEvent.setup();

    render(<UnitActionsButton unit={mockUnit} />);
    const button = screen.getByRole('button', { name: /analytics/i });
    await user.click(button);

    expect(mockSetSelectedContainerState).toHaveBeenCalledWith(expect.objectContaining({
      currentId: mockUnit.id,
    }));
    expect(mockSetCurrentPageKey).toHaveBeenCalledWith('analytics');
  });
});
