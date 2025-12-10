/**
 * Script to run the seed function
 * 
 * This can be imported and called from your app, or run in a development screen
 */

import { seedQuestionData } from './seed-question-data';

// Run the seed function
seedQuestionData()
  .then((result) => {
    console.log('✅ Seeding completed successfully!');
    console.log('Created:', {
      activities: result.activities.length,
      tasks: result.tasks.length,
    });
  })
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });

