/**
 * This file provides synchronous Amplify initialization
 * It must be imported before any other imports that might use Amplify
 * 
 * NOTE: Polyfills (like structuredClone) should be imported BEFORE this file
 */
import { Amplify } from 'aws-amplify';
import awsconfig from '../aws-exports';

// Use a self-executing function to ensure synchronous execution
(function initializeAmplify() {
  try {

    Amplify.configure(awsconfig);

  } catch (error) {
    console.error('Failed to initialize Amplify synchronously:', error);
  }
})();

// Export a dummy value to ensure this file is not tree-shaken
export const AMPLIFY_INITIALIZED = true;
