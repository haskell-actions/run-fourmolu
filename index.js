import * as path from 'path';
import * as fs from 'fs';

const core = require('@actions/core');
const httpm = require('@actions/http-client');
const tool_cache = require('@actions/tool-cache');
const exec = require('@actions/exec');
const glob = require('@actions/glob');

// Get the latest release of fourmolu by querying the GitHub releases API.
async function getLatestVersion() {
  const apiUrl = "https://api.github.com/repos/fourmolu/fourmolu/releases";

  let _http = new httpm.HttpClient("run-fourmolu github action");

  const response = await _http.getJson(apiUrl);

  const releases = response.result;

  if (releases === null) {
    core.setFailed('Failed to fetch releases from the fourmolu/fourmolu repository');
  }

  if (releases.length === 0) {
    core.setFailed('No releases found for the fourmolu/fourmolu repository');
  }

  // Sort releases by published date in descending order
  releases.sort((a, b) => new Date(b.published_at) - new Date(a.published_at));

  // Return the version number of the latest release
  return releases[0].tag_name.slice(1);
}




// TODO: As of this writing, there are no Windows or MacOSX binaries available
// for fourmolu. However, according to
// https://brandonchinn178.github.io/blog/2022/05/19/automating-fourmolu-releases-with-github-actions.html,
// they should be available from the next release.  We may need to change these URLs
// when the actual binaries are available.
//const fourmolu_windows_url = 'https://github.com/fourmolu/fourmolu/releases/download/v' + fourmolu_version + '/fourmolu-' + fourmolu_version + '-windows-x86_64';
//const fourmolu_macos_url = 'https://github.com/fourmolu/fourmolu/releases/download/v' + fourmolu_version + '/fourmolu-' + fourmolu_version + '-darwin-x86_64';

const input_version = core.getInput('version');
const input_pattern = core.getInput('pattern');
const input_follow_symbolic_links = core.getInput('follow-symbolic-links').toUpperCase() !== 'FALSE';
const input_extra_args = core.getInput('extra-args');
const input_working_directory = core.getInput('working-directory');

async function run() {

  const fourmolu_version = input_version === 'latest' ? await getLatestVersion() : input_version;

  core.info(`version input to run-fourmolu: ${input_version}, version selected for use: ${fourmolu_version}`);

  // XXX: These release binaries appear to be dynamically linked, so they may not
  // run on some systems.
  const fourmolu_linux_url = `https://github.com/fourmolu/fourmolu/releases/download/v${fourmolu_version}/fourmolu-${fourmolu_version}-linux-x86_64`;

  // Declare originalCwd outside the try block so it's accessible in catch below for error handling
  let originalCwd = undefined;

  try {
    // Set working directory if specified
    if (input_working_directory) {
      originalCwd = process.cwd();

      const absoluteWorkingDir = path.resolve(input_working_directory);
      core.info(`Attempting to change to directory: ${absoluteWorkingDir}`);

      if (!fs.existsSync(absoluteWorkingDir)) {
        core.setFailed(`Working directory '${absoluteWorkingDir}' does not exist`);
        return;
      }

      process.chdir(absoluteWorkingDir);
      const newCwd = process.cwd();
      core.info(`Changed working directory to: ${newCwd}`);
    }

    // Download fourmolu binary

    var fourmolu_downloaded_binary;


    if (process.platform === 'linux') {
        fourmolu_downloaded_binary = await tool_cache.downloadTool(fourmolu_linux_url);
    }
    // else if (process.platform === 'darwin') {
    //     fourmolu_downloaded_binary = await tool_cache.downloadTool(fourmolu_macos_url);
    // }
    // else if (process.platform === 'win32') {
    //     fourmolu_downloaded_binary = await tool_cache.downloadTool(fourmolu_windows_url);
    // }
    else {
        core.setFailed("no fourmolu binary found for platform: " + process.platform);
    }

    // At this point, fourmolu_downloaded_binary is the fourmolu binary we just
    // downloaded, but tool_cache.downloadTool() gives it a random UUID as a
    // name.  We rename it to `fourmolu` here.
    const fourmolu_binary = path.join(path.dirname(fourmolu_downloaded_binary), 'fourmolu');
    fs.renameSync(fourmolu_downloaded_binary, fourmolu_binary)

    // Cache fourmolu executable

    const fourmolu_cached_dir = await tool_cache.cacheDir(
        path.dirname(fourmolu_binary),
        'fourmolu',
        fourmolu_version
    );
    const fourmolu_cached_path = path.join(fourmolu_cached_dir, 'fourmolu');

    // Set mode

    await exec.exec('chmod', ['+x', fourmolu_cached_path], {silent: true});

    // Glob for the files to format

    const globber = await glob.create(
        input_pattern,
        {
            followSymbolicLinks: input_follow_symbolic_links
        }
    );
    const files = await globber.glob();

    // Extra args

    var extra_args = [];

    if (input_extra_args) {
        extra_args = input_extra_args.split(' ');
    }

    // Run fourmolu

    await exec.exec(fourmolu_cached_path, ['--version']);

    if (files.length > 0) {
        await exec.exec(
            fourmolu_cached_path,
            ['--color', 'always', '--check-idempotence', '--mode', 'check']
                .concat(extra_args)
                .concat(files)
        );
    }
    else {
        core.warning("The glob patterns did not match any source files");
    }

    // Restore original working directory if it was changed
    if (originalCwd) {
      process.chdir(originalCwd);
      core.info(`Restored working directory to: ${originalCwd}`);
    }

  } catch (error) {
    // Restore original working directory even if there was an error
    if (originalCwd) {
      process.chdir(originalCwd);
      core.info(`Restored working directory to: ${originalCwd}`);
    }
    core.setFailed("fourmolu detected unformatted files");
  }
}

run();
