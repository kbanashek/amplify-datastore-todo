import React, { createContext, useContext, ReactNode } from "react";
import { useAmplifyState, AmplifyState } from "@hooks/useAmplifyState";

type AmplifyContextType = AmplifyState;

const AmplifyContext = createContext<AmplifyContextType | null>(null);

export const useAmplify = (): AmplifyContextType => {
  const context = useContext(AmplifyContext);
  if (!context) {
    throw new Error("useAmplify must be used within an AmplifyProvider");
  }
  return context;
};

interface AmplifyProviderProps {
  children: ReactNode;
  /**
   * If true, task-system will start DataStore on mount (after host Amplify.configure()).
   * Default is true for this repo harness. LX can set false and own DataStore lifecycle.
   */
  autoStartDataStore?: boolean;
}
export const AmplifyProvider: React.FC<AmplifyProviderProps> = ({
  children,
  autoStartDataStore = true,
}) => {
  const value = useAmplifyState({ autoStartDataStore });

  return (
    <AmplifyContext.Provider value={value}>{children}</AmplifyContext.Provider>
  );
};
