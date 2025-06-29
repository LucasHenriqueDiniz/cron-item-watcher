#!/bin/bash
# Start the Item Watcher Server with automatic restarts

echo "Starting Item Watcher Server..."

# Build the project first
npm run build

# Start the server with automatic restart on crashes
while true; do
  echo "$(date) - Starting server process..."
  npm run start:server
  
  # If the server exits with code 0 (clean shutdown), break the loop
  if [ $? -eq 0 ]; then
    echo "Server shut down cleanly. Exiting."
    break
  fi
  
  echo "$(date) - Server crashed or was killed. Restarting in 10 seconds..."
  sleep 10
done
