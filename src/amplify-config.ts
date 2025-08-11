import { Amplify } from 'aws-amplify';
import awsconfig from '../aws-exports';

// Configure Amplify
export const configureAmplify = (): void => {
  try {
    // Configure Amplify with the AWS exports

    Amplify.configure(awsconfig);

    
    // Note: We're not explicitly setting SQLiteAdapter here because
    // Amplify will use the appropriate adapter based on the platform
    // when using React Native. SQLite is used by default on mobile.
  } catch (error) {
    console.error('Error configuring Amplify:', error);
  }
};
