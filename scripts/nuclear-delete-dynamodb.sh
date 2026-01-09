#!/bin/bash

#############################################################################
# Nuclear Delete Script for DynamoDB Tables
# 
# This script HARD DELETES all items from all orion-task-system DynamoDB tables.
# 
# CRITICAL: This uses AWS CLI to directly delete from DynamoDB.
#          This is NOT a GraphQL mutation - it's a direct DynamoDB operation.
#          This bypasses DataStore's sync metadata and version tracking.
# 
# USE CASE: When DataStore sync is completely broken and you need to start fresh.
#############################################################################

set -e  # Exit on error

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
REGION="us-east-1"
TABLE_SUFFIX="lhpwtevzhnhixnfnbue6f5q7fa-dev"

# All table names
TABLES=(
  "Task-${TABLE_SUFFIX}"
  "Activity-${TABLE_SUFFIX}"
  "Question-${TABLE_SUFFIX}"
  "TaskAnswer-${TABLE_SUFFIX}"
  "TaskResult-${TABLE_SUFFIX}"
  "TaskHistory-${TABLE_SUFFIX}"
  "TaskTempAnswer-${TABLE_SUFFIX}"
  "DataPoint-${TABLE_SUFFIX}"
  "DataPointInstance-${TABLE_SUFFIX}"
  "Appointment-${TABLE_SUFFIX}"
)

echo ""
echo -e "${RED}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${RED}║                    ⚠️  NUCLEAR DELETE ⚠️                       ║${NC}"
echo -e "${RED}║                                                                ║${NC}"
echo -e "${RED}║  This will HARD DELETE all items from DynamoDB tables:        ║${NC}"
echo -e "${RED}║  - Task, Activity, Question, TaskAnswer, TaskResult            ║${NC}"
echo -e "${RED}║  - TaskHistory, TaskTempAnswer, DataPoint, DataPointInstance   ║${NC}"
echo -e "${RED}║  - Appointment                                                 ║${NC}"
echo -e "${RED}║                                                                ║${NC}"
echo -e "${RED}║  ⚠️  THIS CANNOT BE UNDONE!                                    ║${NC}"
echo -e "${RED}║  ⚠️  ALL DEVICES WILL LOSE ALL DATA!                           ║${NC}"
echo -e "${RED}║  ⚠️  YOU WILL NEED TO DELETE/REINSTALL APPS!                   ║${NC}"
echo -e "${RED}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Region: ${REGION}${NC}"
echo -e "${YELLOW}Table suffix: ${TABLE_SUFFIX}${NC}"
echo ""

# Check AWS CLI is installed
if ! command -v aws &> /dev/null; then
  echo -e "${RED}❌ AWS CLI not found. Please install it first.${NC}"
  exit 1
fi

# Check AWS credentials
if ! aws sts get-caller-identity --region ${REGION} &> /dev/null; then
  echo -e "${RED}❌ AWS credentials not configured. Run 'aws configure' first.${NC}"
  exit 1
fi

# Confirmation
read -p "Type 'DELETE EVERYTHING' to continue: " confirmation
if [ "$confirmation" != "DELETE EVERYTHING" ]; then
  echo -e "${YELLOW}Aborted.${NC}"
  exit 0
fi

echo ""
echo -e "${GREEN}Starting nuclear delete...${NC}"
echo ""

# Function to delete all items from a table
delete_table_items() {
  local table_name=$1
  echo -e "${YELLOW}📋 Processing table: ${table_name}${NC}"
  
  # Check if table exists
  if ! aws dynamodb describe-table --table-name "${table_name}" --region ${REGION} &> /dev/null; then
    echo -e "${RED}   ⚠️  Table not found, skipping${NC}"
    return
  fi
  
  # Get table key schema
  local keys=$(aws dynamodb describe-table \
    --table-name "${table_name}" \
    --region ${REGION} \
    --query 'Table.KeySchema[*].AttributeName' \
    --output text)
  
  echo "   🔑 Keys: ${keys}"
  
  # Scan for all items
  local scan_output=$(aws dynamodb scan \
    --table-name "${table_name}" \
    --region ${REGION} \
    --output json)
  
  local item_count=$(echo "${scan_output}" | jq '.Items | length')
  echo "   📊 Found ${item_count} items"
  
  if [ "${item_count}" -eq 0 ]; then
    echo -e "${GREEN}   ✅ Table already empty${NC}"
    return
  fi
  
  # Delete items in batches
  local deleted=0
  local batch_size=25  # DynamoDB batch write limit
  
  # Convert keys string to array
  IFS=$'\t' read -ra KEY_ARRAY <<< "$keys"
  local pk="${KEY_ARRAY[0]}"
  local sk="${KEY_ARRAY[1]:-}"
  
  echo "   🗑️  Deleting items..."
  
  # Process items
  echo "${scan_output}" | jq -c '.Items[]' | while read -r item; do
    # Extract key values
    local pk_value=$(echo "${item}" | jq -r ".${pk}")
    local delete_request="{\"DeleteRequest\":{\"Key\":{\"${pk}\":$(echo "${item}" | jq ".${pk}")"
    
    # Add sort key if exists
    if [ -n "${sk}" ]; then
      local sk_value=$(echo "${item}" | jq -r ".${sk}")
      delete_request="${delete_request},\"${sk}\":$(echo "${item}" | jq ".${sk}")"
    fi
    
    delete_request="${delete_request}}}}"
    
    # Delete individual item
    aws dynamodb delete-item \
      --table-name "${table_name}" \
      --region ${REGION} \
      --key "$(echo "${item}" | jq "{${pk}: .${pk}$([ -n "${sk}" ] && echo ", ${sk}: .${sk}")}")" \
      &> /dev/null
    
    deleted=$((deleted + 1))
    
    # Progress indicator
    if [ $((deleted % 10)) -eq 0 ]; then
      echo -n "."
    fi
  done
  
  echo ""
  echo -e "${GREEN}   ✅ Deleted ${deleted} items${NC}"
}

# Delete from all tables
for table in "${TABLES[@]}"; do
  delete_table_items "${table}"
  echo ""
done

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                    ✅ NUCLEAR DELETE COMPLETE                   ║${NC}"
echo -e "${GREEN}║                                                                ║${NC}"
echo -e "${GREEN}║  All DynamoDB tables have been cleared.                        ║${NC}"
echo -e "${GREEN}║                                                                ║${NC}"
echo -e "${GREEN}║  NEXT STEPS:                                                   ║${NC}"
echo -e "${GREEN}║  1. Delete and reinstall apps on ALL devices                   ║${NC}"
echo -e "${GREEN}║  2. Add fresh test data on ONE device                          ║${NC}"
echo -e "${GREEN}║  3. Wait 10 seconds for sync                                   ║${NC}"
echo -e "${GREEN}║  4. Verify other devices pull the data                         ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""
