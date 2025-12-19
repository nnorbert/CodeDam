import { createContext, useContext, type ReactNode } from "react";

interface DragContextValue {
  activeOverId: string | null;
  overPosition: string | null;
  isToolboxDrag: boolean;
  isEditingLocked: boolean;
}

const DragContext = createContext<DragContextValue>({
  activeOverId: null,
  overPosition: null,
  isToolboxDrag: false,
  isEditingLocked: false,
});

export const useDragContext = () => useContext(DragContext);

interface DragProviderProps {
  children: ReactNode;
  value: DragContextValue;
}

export const DragProvider = ({ children, value }: DragProviderProps) => {
  return <DragContext.Provider value={value}>{children}</DragContext.Provider>;
};

