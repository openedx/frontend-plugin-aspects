import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { SubSectionAnalyticsButton } from './SubSectionAnalyticsButton';
import { useAspectsSidebarContext } from '../hooks';
import { SubSection } from '../types';
import '@testing-library/jest-dom';

// Mock the hooks module
jest.mock('../hooks', () => ({
  useAspectsSidebarContext: jest.fn(),
}));

// Test Data
const mockSubsections: SubSection[] = [
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
];

const mockUseAspectsSidebarContext = useAspectsSidebarContext as jest.Mock;

describe('SubSectionAnalyticsButton', () => {
  const mockSetSidebarOpen = jest.fn();
  const mockSetActiveBlock = jest.fn();
  const mockSetFilterUnit = jest.fn();

  const defaultContextValue = {
    activeBlock: null,
    sidebarOpen: false,
    setActiveBlock: mockSetActiveBlock,
    setSidebarOpen: mockSetSidebarOpen,
    setFilterUnit: mockSetFilterUnit,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAspectsSidebarContext.mockReturnValue(defaultContextValue);
  });

  it('does not show analytics button if subsection is not graded', () => {
    const mockSubsection = mockSubsections[1];

    render(<SubSectionAnalyticsButton subsection={mockSubsection} />);
    expect(screen.queryByRole('button', { name: /analytics/i })).toBeNull();
  });

  it('opens sidebar and sets active block when clicking inactive button', () => {
    const mockSubsection = mockSubsections[0];

    render(<SubSectionAnalyticsButton subsection={mockSubsection} />);
    const button = screen.getByRole('button', { name: /analytics/i });
    fireEvent.click(button);

    expect(mockSetSidebarOpen).toHaveBeenCalledWith(true);
    expect(mockSetActiveBlock).toHaveBeenCalledWith(expect.objectContaining({
      id: mockSubsection.id,
    }));
    expect(mockSetFilterUnit).toHaveBeenCalledWith(null);
  });

  it('closes active block when clicking active button', () => {
    const mockSubsection = mockSubsections[0];
    mockUseAspectsSidebarContext.mockReturnValue({
      ...defaultContextValue,
      activeBlock: { id: mockSubsection.id } as any,
      sidebarOpen: true,
    });

    render(<SubSectionAnalyticsButton subsection={mockSubsection} />);
    const button = screen.getByRole('button', { name: /analytics/i });
    fireEvent.click(button);

    expect(mockSetSidebarOpen).toHaveBeenCalledWith(true);
    expect(mockSetActiveBlock).toHaveBeenCalledWith(null);
    expect(mockSetFilterUnit).not.toHaveBeenCalled();
  });

  it('shows active state when sidebar is open and block matches', () => {
    const mockSubsection = mockSubsections[2];
    mockUseAspectsSidebarContext.mockReturnValue({
      ...defaultContextValue,
      activeBlock: { id: mockSubsection.id } as any,
      sidebarOpen: true,
    });

    render(<SubSectionAnalyticsButton subsection={mockSubsection} />);
    const button = screen.getByRole('button', { name: /analytics/i });
    fireEvent.click(button);

    expect(button.className).toContain('-active');
  });

  it('shows inactive state when different block is active', () => {
    const mockSubsection1 = mockSubsections[2];
    const mockSubsection2 = mockSubsections[0];
    mockUseAspectsSidebarContext.mockReturnValue({
      ...defaultContextValue,
      activeBlock: { id: mockSubsection1 } as any,
      sidebarOpen: true,
    });

    render(<SubSectionAnalyticsButton subsection={mockSubsection2} />);
    const button = screen.getByRole('button', { name: /analytics/i });
    fireEvent.click(button);

    expect(mockSetActiveBlock).toHaveBeenCalledWith(expect.objectContaining({
      id: mockSubsection2.id,
    }));

    expect(button.className).not.toContain('-active');
  });

  it('shows inactive state when no block is active', async () => {
    const mockSubsection = mockSubsections[0];
    mockUseAspectsSidebarContext.mockReturnValue({
      ...defaultContextValue,
      activeBlock: { id: mockSubsection } as any,
      sidebarOpen: true,
    });

    const { rerender } = render(<SubSectionAnalyticsButton subsection={mockSubsection} />);
    const button = screen.getByRole('button', { name: /analytics/i });
    await fireEvent.click(button);

    rerender(<SubSectionAnalyticsButton subsection={mockSubsection} />);
    expect(button.className).not.toContain('-active');
  });
});
