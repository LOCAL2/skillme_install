#!/bin/bash
ORIGIN=$1
if [ -z "$ORIGIN" ]; then
  ORIGIN="http://localhost:5173"
fi

if command -v node &> /dev/null; then
  node -e "$(curl -fsSL $ORIGIN/install.js)" -- "$ORIGIN"
elif command -v bun &> /dev/null; then
  bun -e "$(curl -fsSL $ORIGIN/install.js)" -- "$ORIGIN"
else
  echo "Error: Node.js or Bun is required to run this installer. Please install Node.js or Bun."
  exit 1
fi