#!/bin/bash
# start-with-ngrok.sh
# Starts ngrok, captures the public URL, then launches Expo with it as the GraphQL endpoint.

BACKEND_PORT=${BACKEND_PORT:-3001}

echo "🚇 Starting ngrok tunnel on port $BACKEND_PORT..."

# Kill any existing ngrok process
pkill -f ngrok 2>/dev/null || true

# Start ngrok in the background
ngrok http $BACKEND_PORT --log=stdout > /tmp/ngrok.log 2>&1 &
NGROK_PID=$!

echo "⏳ Waiting for ngrok to start..."
sleep 3

# Get the public HTTPS URL from ngrok's local API
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | \
  python3 -c "import sys, json; tunnels = json.load(sys.stdin)['tunnels']; \
  https = [t for t in tunnels if t['proto'] == 'https']; \
  print(https[0]['public_url'] if https else '')" 2>/dev/null)

if [ -z "$NGROK_URL" ]; then
  echo "❌ Failed to get ngrok URL. Is ngrok running and authenticated?"
  kill $NGROK_PID 2>/dev/null
  exit 1
fi

GRAPHQL_URL="${NGROK_URL}/graphql"
echo "✅ ngrok tunnel ready: $GRAPHQL_URL"
echo ""
echo "📱 Starting Expo with EXPO_PUBLIC_GRAPHQL_URL=$GRAPHQL_URL"
echo ""

# Export for child processes and start expo
export EXPO_PUBLIC_GRAPHQL_URL=$GRAPHQL_URL
pnpm exec expo start "$@"

# Cleanup ngrok on exit
kill $NGROK_PID 2>/dev/null
