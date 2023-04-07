#!/usr/bin/env bash
#
# A simple shell script for bumping the version of run-fourmolu to use the
# latest GitHub release of Fourmolu.  This script also creates a PR for this
# version bump.

set -euo pipefail

# find current version of fourmolu used in run-fourmolu
fourmolu_old_version=$(sed -En "s/^const fourmolu_version = '(.*?)';$/\1/p" "./index.js")

# This is the latest release version of spago on GitHub.
fourmolu_new_version=$(curl --silent "https://api.github.com/repos/fourmolu/fourmolu/releases" | jq '.[0].tag_name' --raw-output)

# Fourmolu has tags like "v0.10.1.0", so we need to drop the first 'v'
# character.
fourmolu_new_version="${fourmolu_new_version:1}"

echo "Updating run-fourmolu from fourmolu-${fourmolu_old_version} to fourmolu-${fourmolu_new_version} ..."

# Update the version in ./index.js
sed -i -e "s/^const fourmolu_version = '.*';/const fourmolu_version = '${fourmolu_new_version}';/" "./index.js"

# Regenerate the dist/index.js file
npm run prepare

# Find the most recent run-fourmolu release number
run_fourmolu_old_version="$(gh release list | head -n1 | cut -f1)"
run_fourmolu_old_version="${run_fourmolu_old_version:1}"

run_fourmolu_new_version=$((run_fourmolu_old_version + 1))

echo "Current run-fourmolu version: v${run_fourmolu_old_version}.  Next run-fourmolu version: v${run_fourmolu_new_version}."

echo "Updating CHANGELOG.md with info about new release..."

cat << EOF > ./new-changelog-entry
## run-fourmolu v${run_fourmolu_new_version}

* Uses Fourmolu ${fourmolu_new_version}

EOF

cat ./new-changelog-entry ./CHANGELOG.md > ./new-changelog
mv ./new-changelog ./CHANGELOG.md
rm ./new-changelog-entry

new_git_branch="bump-to-fourmolu-${fourmolu_new_version}"

echo "Create new git branch named '${new_git_branch}'..."

git checkout -b "$new_git_branch"

echo "Doing git add on ./CHANGELOG.md ./index.js ./dist/index.js..."

git add ./CHANGELOG.md ./index.js ./dist/index.js

echo "Creating git commit..."

git commit -m "Bumping to fourmolu-${fourmolu_new_version}"

echo "Pushing branch to github..."

git push origin HEAD

echo "Opening PR on GitHub..."

gh pr create --title "Bump to fourmolu-${fourmolu_new_version}" --body "https://github.com/fourmolu/fourmolu/releases/tag/v${fourmolu_new_version}"
