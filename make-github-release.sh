#!/usr/bin/env bash
#
# A shell script for making a new GitHub release of fourmolu-action.
# See the ./README.md for how to run this.

set -euo pipefail

# Find the current version of fourmolu used by fourmolu-action.
fourmolu_new_version=$(sed -En "s/^const fourmolu_version = '(.*?)';$/\1/p" "./index.js")

# Find the most recent fourmolu-action release number
fourmolu_action_old_version="$(gh release list | head -n1 | cut -f1)"
fourmolu_action_old_version="${fourmolu_action_old_version:1}"

fourmolu_action_new_version=$((fourmolu_action_old_version + 1))

echo "Creating release on GitHub using fourmolu-${fourmolu_new_version}.  Current latest fourmolu-action version: v${fourmolu_action_old_version}.  New fourmolu-action version: v${fourmolu_action_new_version}..."

# Make GitHub Release of fourmolu-action with this version of fourmolu.
gh release create --notes "This release uses fourmolu-${fourmolu_new_version}." --title "v${fourmolu_action_new_version}" "v${fourmolu_action_new_version}"

echo "Fetching newly created tag..."

git fetch
