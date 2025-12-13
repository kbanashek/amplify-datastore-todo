import { Amplify } from "aws-amplify";
import { SQLiteAdapter } from "@aws-amplify/datastore-storage-adapter";
import awsconfig from "../aws-exports";

// Configure Amplify with SQLite adapter for DataStore
export const configureAmplify = () => {
  Amplify.configure({
    ...awsconfig,
    DataStore: {
      storageAdapter: SQLiteAdapter,
    },
  });
};
