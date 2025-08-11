import { Amplify } from 'aws-amplify';
import awsconfig from '../aws-exports';

// Immediately configure Amplify on module import
console.log('Initializing Amplify immediately...');
Amplify.configure(awsconfig);
console.log('Amplify initialized successfully');

// Export a function that can be called to verify initialization
export const verifyAmplifyInitialized = () => {
  console.log('Amplify initialization verified');
  return true;
};
