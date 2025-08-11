import React, { createContext, useContext, ReactNode } from 'react';
import { useAmplifyState, AmplifyState } from '../hooks/useAmplifyState';


type AmplifyContextType = AmplifyState;

const AmplifyContext = createContext<AmplifyContextType | null>(null);

export const useAmplify = (): AmplifyContextType => {
  const context = useContext(AmplifyContext);
  if (!context) {
    throw new Error('useAmplify must be used within an AmplifyProvider');
  }
  return context;
};

interface AmplifyProviderProps {
  children: ReactNode;
}
export const AmplifyProvider: React.FC<AmplifyProviderProps> = ({ children }) => {
  const value = useAmplifyState();
  
  return (
    <AmplifyContext.Provider value={value}>
      {children}
    </AmplifyContext.Provider>
  );
};
