#!/usr/bin/env bash
#
# Manual deploy / update script for the VPS.
# The GitHub Actions workflow does the same thing automatically on push to
# main, but this is handy for the first deploy or for pulling by hand.
#
# Usage (on the VPS):
#   DEPLOY_PATH=/var/www/courser-calc ./deploy.sh
# or just ./deploy.sh if the clone lives at the default path.

set -euo pipefail

DEPLOY_PATH="${DEPLOY_PATH:-/var/www/courser-calc}"

cd "$DEPLOY_PATH"

# Fast-forward to whatever main looks like now. reset --hard (rather than a
# plain pull) keeps the working tree clean even if files were touched on the
# server, so deploys never get stuck on a merge conflict.
git fetch --prune origin
git reset --hard origin/main

echo "Deployed $(git rev-parse --short HEAD) - $(git log -1 --pretty=%s)"
