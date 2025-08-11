// Initialize Amplify before anything else
import { Amplify } from 'aws-amplify';
import awsconfig from './aws-exports';
// Import Expo Router at the top level
import 'expo-router/entry';

// Configure Amplify immediately
console.log('Entry point: Initializing Amplify before Expo Router loads...');
Amplify.configure(awsconfig);
console.log('Entry point: Amplify initialized successfully');
