import * as React from 'react';
import { ReactNode } from 'react';
import { Block } from '../hooks';

export type SidebarContext = {
  sidebarOpen: boolean,
  setSidebarOpen: (value: boolean) => void,
  activeBlock: Block | null,
  setActiveBlock: (block: Block | null) => void,
  filteredBlocks: string[],
  setFilteredBlocks: (blocks: string[]) => void,
  filterUnit: Block | null,
  setFilterUnit: (block: Block | null) => void,
};

export const AspectsSidebarContext = React.createContext<SidebarContext>({} as SidebarContext);

export function AspectsSidebarProvider({ component }: { component: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = React.useState<boolean>(false);
  const [activeBlock, setActiveBlock] = React.useState<Block | null>(null);
  const [filteredBlocks, setFilteredBlocks] = React.useState<string[]>([]);
  const [filterUnit, setFilterUnit] = React.useState<Block | null>(null);

  return (
    <AspectsSidebarContext.Provider
      value={React.useMemo(() => ({
        sidebarOpen,
        activeBlock,
        setSidebarOpen,
        setActiveBlock,
        filteredBlocks,
        setFilteredBlocks,
        filterUnit,
        setFilterUnit,
      }), [sidebarOpen, activeBlock, filteredBlocks, filterUnit])}
    >
      {component}
    </AspectsSidebarContext.Provider>
  );
}
