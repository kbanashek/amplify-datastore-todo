const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

/**
 * @type {import('@types/aws-lambda').AppSyncResolverHandler}
 */
exports.handler = async (event) => {
  console.log('getTempAnswers Lambda invoked', JSON.stringify(event, null, 2));

  const { taskPk } = event.arguments;
  const tableName = process.env.TASK_TEMP_ANSWERS_TABLE;

  if (!taskPk) {
    console.error('taskPk is missing from event.arguments');
    throw new Error('taskPk is required');
  }

  if (!tableName) {
    console.error('TASK_TEMP_ANSWERS_TABLE environment variable not set');
    throw new Error('TASK_TEMP_ANSWERS_TABLE environment variable not set');
  }

  console.log(`Querying table: ${tableName} for taskPk: ${taskPk}`);

  try {
    const params = {
      TableName: tableName,
      KeyConditionExpression: 'taskPk = :taskPk',
      ExpressionAttributeValues: {
        ':taskPk': taskPk,
      },
      ScanIndexForward: false, // Sort by updatedAt descending (most recent first)
      Limit: 10,
    };

    const result = await dynamodb.query(params).promise();
    
    console.log(`Query returned ${result.Items?.length || 0} items`);
    
    if (result.Items && result.Items.length > 0) {
      console.log('First item (raw):', JSON.stringify(result.Items[0], null, 2));
      
      // Parse the 'answers' field from JSON string to object
      // AppSync AWSJSON type expects an object, not a string
      const processedItems = result.Items.map(item => ({
        ...item,
        answers: typeof item.answers === 'string' ? JSON.parse(item.answers) : item.answers
      }));
      
      console.log('First item (processed):', JSON.stringify(processedItems[0], null, 2));
      return processedItems;
    }

    // Return empty array if no items found (schema expects non-nullable array)
    return [];
  } catch (error) {
    console.error('Error querying DynamoDB:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    throw error;
  }
};
