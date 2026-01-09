#!/usr/bin/env python3
"""
Nuclear Delete Script for DynamoDB Tables

HARD DELETES all items from all orion-task-system DynamoDB tables using AWS CLI.
This bypasses DataStore's sync metadata and version tracking.

USE CASE: When DataStore sync is broken and you need to start completely fresh.
"""

import subprocess
import json
import sys
from typing import List, Dict, Any

# Configuration
REGION = "us-east-1"
TABLE_SUFFIX = "lhpwtevzhnhixnfnbue6f5q7fa-dev"

# All table names
TABLES = [
    f"Task-{TABLE_SUFFIX}",
    f"Activity-{TABLE_SUFFIX}",
    f"Question-{TABLE_SUFFIX}",
    f"TaskAnswer-{TABLE_SUFFIX}",
    f"TaskResult-{TABLE_SUFFIX}",
    f"TaskHistory-{TABLE_SUFFIX}",
    f"TaskTempAnswer-{TABLE_SUFFIX}",
    f"DataPoint-{TABLE_SUFFIX}",
    f"DataPointInstance-{TABLE_SUFFIX}",
    f"Appointment-{TABLE_SUFFIX}",
]


def run_aws_command(command: List[str]) -> Dict[str, Any]:
    """Run AWS CLI command and return JSON result."""
    try:
        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
            check=True
        )
        if result.stdout.strip():
            return json.loads(result.stdout)
        return {}
    except subprocess.CalledProcessError as e:
        print(f"❌ AWS CLI error: {e.stderr}")
        return {}
    except json.JSONDecodeError:
        print(f"❌ Failed to parse AWS CLI output")
        return {}


def check_aws_cli():
    """Check if AWS CLI is installed and configured."""
    try:
        subprocess.run(["aws", "--version"], capture_output=True, check=True)
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("❌ AWS CLI not found. Please install it first.")
        sys.exit(1)
    
    # Check credentials
    result = run_aws_command([
        "aws", "sts", "get-caller-identity",
        "--region", REGION
    ])
    if not result:
        print("❌ AWS credentials not configured. Run 'aws configure' first.")
        sys.exit(1)
    
    print(f"✅ AWS CLI configured")
    print(f"   Account: {result.get('Account', 'unknown')}")
    print(f"   Region: {REGION}\n")


def get_table_keys(table_name: str) -> tuple:
    """Get primary key and sort key for a table."""
    result = run_aws_command([
        "aws", "dynamodb", "describe-table",
        "--table-name", table_name,
        "--region", REGION
    ])
    
    if not result:
        return None, None
    
    key_schema = result.get("Table", {}).get("KeySchema", [])
    
    partition_key = None
    sort_key = None
    
    for key in key_schema:
        if key["KeyType"] == "HASH":
            partition_key = key["AttributeName"]
        elif key["KeyType"] == "RANGE":
            sort_key = key["AttributeName"]
    
    return partition_key, sort_key


def delete_table_items(table_name: str) -> int:
    """Delete all items from a table. Returns count of deleted items."""
    print(f"📋 Processing table: {table_name}")
    
    # Check if table exists
    pk, sk = get_table_keys(table_name)
    if pk is None:
        print(f"   ⚠️  Table not found, skipping\n")
        return 0
    
    print(f"   🔑 Primary Key: {pk}" + (f", Sort Key: {sk}" if sk else ""))
    
    # Scan for all items
    result = run_aws_command([
        "aws", "dynamodb", "scan",
        "--table-name", table_name,
        "--region", REGION
    ])
    
    items = result.get("Items", [])
    count = len(items)
    
    print(f"   📊 Found {count} items")
    
    if count == 0:
        print(f"   ✅ Table already empty\n")
        return 0
    
    # Delete items one by one
    print(f"   🗑️  Deleting items...", end="", flush=True)
    deleted = 0
    
    for item in items:
        # Build key dict
        key = {pk: item[pk]}
        if sk and sk in item:
            key[sk] = item[sk]
        
        # Delete item
        subprocess.run([
            "aws", "dynamodb", "delete-item",
            "--table-name", table_name,
            "--region", REGION,
            "--key", json.dumps(key)
        ], capture_output=True, check=False)
        
        deleted += 1
        
        # Progress indicator
        if deleted % 10 == 0:
            print(".", end="", flush=True)
    
    print(f" {deleted} items")
    print(f"   ✅ Deleted {deleted} items\n")
    return deleted


def main():
    """Main function."""
    print("")
    print("╔════════════════════════════════════════════════════════════════╗")
    print("║                    ⚠️  NUCLEAR DELETE ⚠️                       ║")
    print("║                                                                ║")
    print("║  This will HARD DELETE all items from DynamoDB tables:        ║")
    print("║  - Task, Activity, Question, TaskAnswer, TaskResult            ║")
    print("║  - TaskHistory, TaskTempAnswer, DataPoint, DataPointInstance   ║")
    print("║  - Appointment                                                 ║")
    print("║                                                                ║")
    print("║  ⚠️  THIS CANNOT BE UNDONE!                                    ║")
    print("║  ⚠️  ALL DEVICES WILL LOSE ALL DATA!                           ║")
    print("║  ⚠️  YOU WILL NEED TO DELETE/REINSTALL APPS!                   ║")
    print("╚════════════════════════════════════════════════════════════════╝")
    print("")
    
    # Check AWS CLI
    check_aws_cli()
    
    # Confirmation
    confirmation = input("Type 'DELETE EVERYTHING' to continue: ")
    if confirmation != "DELETE EVERYTHING":
        print("Aborted.")
        sys.exit(0)
    
    print("\n🚀 Starting nuclear delete...\n")
    
    # Delete from all tables
    total_deleted = 0
    for table in TABLES:
        deleted = delete_table_items(table)
        total_deleted += deleted
    
    print("╔════════════════════════════════════════════════════════════════╗")
    print("║                    ✅ NUCLEAR DELETE COMPLETE                   ║")
    print("║                                                                ║")
    print(f"║  Deleted {total_deleted:,} items total                                 ║")
    print("║                                                                ║")
    print("║  NEXT STEPS:                                                   ║")
    print("║  1. Delete and reinstall apps on ALL devices                   ║")
    print("║  2. Add fresh test data on ONE device                          ║")
    print("║  3. Wait 10 seconds for sync                                   ║")
    print("║  4. Verify other devices pull the data                         ║")
    print("╚════════════════════════════════════════════════════════════════╝")
    print("")


if __name__ == "__main__":
    main()
