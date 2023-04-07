#!/usr/bin/env bash
#
# A shell script for making a new GitHub release of run-fourmolu.
# See the ./README.md for how to run this.

set -euo pipefail

# Find the current version of fourmolu used by run-fourmolu.
fourmolu_new_version=$(sed -En "s/^const fourmolu_version = '(.*?)';$/\1/p" "./index.js")

# Find the most recent run-fourmolu release number
run_fourmolu_old_version="$(gh release list | head -n1 | cut -f1)"
run_fourmolu_old_version="${run_fourmolu_old_version:1}"

run_fourmolu_new_version=$((run_fourmolu_old_version + 1))

echo "Creating release on GitHub using fourmolu-${fourmolu_new_version}.  Current latest run-fourmolu version: v${run_fourmolu_old_version}.  New run-fourmolu version: v${run_fourmolu_new_version}..."

# Make GitHub Release of run-fourmolu with this version of fourmolu.
gh release create --notes "This release uses fourmolu-${fourmolu_new_version}." --title "v${run_fourmolu_new_version}" "v${run_fourmolu_new_version}"

echo "Fetching newly created tag..."

git fetch
