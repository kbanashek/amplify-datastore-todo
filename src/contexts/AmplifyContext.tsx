import React, { createContext, useContext, ReactNode } from 'react';
import { useAmplifyState, AmplifyStateResult } from '../hooks/useAmplifyState';

// Use the types from our custom hook
type AmplifyContextType = AmplifyStateResult;

// Create context
const AmplifyContext = createContext<AmplifyContextType | null>(null);

// Custom hook to use the Amplify context
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

// Provider component
export const AmplifyProvider: React.FC<AmplifyProviderProps> = ({ children }) => {
  // Use our custom hook to handle all the Amplify state logic
  const value = useAmplifyState();
  
  // The value from our hook is directly used as the context value

  return (
    <AmplifyContext.Provider value={value}>
      {children}
    </AmplifyContext.Provider>
  );
};
