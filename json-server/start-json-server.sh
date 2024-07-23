#!/bin/bash

# Fetch the local IP address
IP_ADDRESS=$(hostname -I | awk '{print $1}')

# Start json-server with the detected host
npx json-server --host $IP_ADDRESS --watch db.json
