import * as path from 'path';
import * as fs from 'fs';

const core = require('@actions/core');
const github = require('@actions/github');
const tool_cache = require('@actions/tool-cache');
const exec = require('@actions/exec');
const glob = require('@actions/glob');

const fourmolu_version = '0.10.1.0';

// XXX: These release binaries appear to be dynamically linked, so they may not
// run on some systems.
const fourmolu_linux_url = 'https://github.com/fourmolu/fourmolu/releases/download/v' + fourmolu_version + '/fourmolu-' + fourmolu_version + '-linux-x86_64';

// TODO: As of this writing, there are no Windows or MacOSX binaries available
// for fourmolu. However, according to
// https://brandonchinn178.github.io/blog/2022/05/19/automating-fourmolu-releases-with-github-actions.html,
// they should be available from the next release.  We may need to change these URLs
// when the actual binaries are available.
//const fourmolu_windows_url = 'https://github.com/fourmolu/fourmolu/releases/download/v' + fourmolu_version + '/fourmolu-' + fourmolu_version + '-windows-x86_64';
//const fourmolu_macos_url = 'https://github.com/fourmolu/fourmolu/releases/download/v' + fourmolu_version + '/fourmolu-' + fourmolu_version + '-darwin-x86_64';

const input_pattern = core.getInput('pattern');
const input_follow_symbolic_links = core.getInput('follow-symbolic-links').toUpperCase() !== 'FALSE';
const input_extra_args = core.getInput('extra-args');

async function run() {
  try {

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

  } catch (error) {
    core.setFailed("fourmolu detected unformatted files");
  }
}

run();
