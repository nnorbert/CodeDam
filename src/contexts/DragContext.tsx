import { createContext, useContext, type ReactNode } from "react";

interface DragContextValue {
  activeOverId: string | null;
  overPosition: string | null;
  isToolboxDrag: boolean;
}

const DragContext = createContext<DragContextValue>({
  activeOverId: null,
  overPosition: null,
  isToolboxDrag: false,
});

export const useDragContext = () => useContext(DragContext);

interface DragProviderProps {
  children: ReactNode;
  value: DragContextValue;
}

export const DragProvider = ({ children, value }: DragProviderProps) => {
  return <DragContext.Provider value={value}>{children}</DragContext.Provider>;
};

