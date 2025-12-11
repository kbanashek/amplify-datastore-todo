// Import polyfills FIRST, before any AWS SDK imports
import './src/polyfills/structuredClone';

// Initialize Amplify before anything else
import { Amplify } from 'aws-amplify';
import awsconfig from './aws-exports';
// Import Expo Router at the top level
import 'expo-router/entry';

// Configure Amplify immediately

Amplify.configure(awsconfig);

