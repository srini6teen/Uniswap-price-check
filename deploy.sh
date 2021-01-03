#!/bin/sh

# Enter the source directory to make sure the script runs where the user expects
cd "/home/site/wwwroot"

export NODE_PATH=/home/site/wwwroot/node_modules:$NODE_PATH
if [ -z "$PORT" ]; then
		export PORT=8080
fi

PATH="$PATH:/home/site/wwwroot"
npm start
