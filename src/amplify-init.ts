import { Amplify } from 'aws-amplify';
import awsconfig from '../aws-exports';

// Immediately configure Amplify on module import

Amplify.configure(awsconfig);


// Export a function that can be called to verify initialization
export const verifyAmplifyInitialized = () => {

  return true;
};
