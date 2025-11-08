#!/bin/bash
# Script to kill process on port 5001
PORT=5001
PID=$(lsof -ti:$PORT)

if [ -z "$PID" ]; then
  echo "✅ No process found on port $PORT"
  exit 0
fi

echo "🔍 Found process $PID on port $PORT"
kill -9 $PID
echo "✅ Killed process $PID"
sleep 1

# Verify
if lsof -ti:$PORT > /dev/null 2>&1; then
  echo "❌ Process still running on port $PORT"
  exit 1
else
  echo "✅ Port $PORT is now free"
  exit 0
fi

