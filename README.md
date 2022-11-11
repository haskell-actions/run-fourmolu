# Fourmolu action

![CI](https://github.com/fourmolu/fourmolu-action/workflows/CI/badge.svg?branch=master)

This Fourmolu Action helps to ensure that your Haskell project is
formatted with [Fourmolu][fourmolu]. The action tries to find all Haskell source
code files in your repository and fails if any of them are not formatted. In
case of failure it prints the diff between the actual contents of the file
and its formatted version.

## Example usage

In the simple case all you need to do is to add this step to your job:

```yaml
- uses: fourmolu/fourmolu-action@v1
```

The `@v1` after `fourmolu-action` should be replaced with the version of the
Fourmolu Action you want to use.  See
[Releases](https://github.com/fourmolu/fourmolu-action/releases) for all
versions available.  Each version of the Fourmolu Action generally has a
corresponding version of `fourmolu`.  Make sure you pick a Fourmolu Action
version that uses the version of `fourmolu` you use locally.

### Full Example

Here's a full YAML file you can copy and paste into your repo that runs
`fourmolu-action`.  Add this as a file like `.github/workflows/fourmolu.yaml`.
This Workflow will run everytime you push to a branch.

```yaml
name: fourmolu
on: push
jobs:
  format:
    runs-on: ubuntu-latest
    steps:
      # Note that you must checkout your code before running fourmolu/fourmolu-action
      - uses: actions/checkout@v2
      - uses: fourmolu/fourmolu-action@v1
```

### Example with more Options

Here's a more complicated example that shows more options being used:

```yaml
- uses: fourmolu/fourmolu-action@v1
  with:
    # Only check the format of .hs in the src/ directory.
    pattern: |
      src/**/*.hs

    # Don't follow symbolic links to .hs files.
    follow-symbolic-links: false

    # Extra args to pass to fourmolu on the command line.
    extra-args: "--indent-wheres true"
```

### Example Usage with Build Matrix

If you are using a build matrix, then it is more efficient to have a
separate job for checking of formatting:

```yaml
jobs:
  fourmolu:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: fourmolu/fourmolu-action@v1
  build:
    runs-on: ubuntu-latest
    needs: fourmolu
    ...
```

Here, the `build` job depends on `fourmolu` and will not run unless `fourmolu`
passes.

## Options

The available options are defined in [`./action.yml`](./action.yml).  See that
file for more explanation.

<!-- fourmolu-action currently doesn't support running on Windows. -->
<!--

## Windows

If you are running a workflow on Windows, be wary of [Git's
`core.autocrlf`][git-core-autocrlf]. Fourmolu always converts CRLF endings to
LF endings which may result in spurious diffs, so you probably want to
disable `core.autocrlf`:

```shell
$ git config --global core.autocrlf false
```

-->

## Hacking on this repo

In order to do development on this repo, you first need to install NodeJS and
`npm` to your system.  This has been confirmed to work with the following
versions, but newer (or slightly older) versions may work as well:

- **NodeJS**: 14.19.1
- **`npm`**: 6.14.16

Next, clone this repo:

```console
$ git clone git@github.com:fourmolu/fourmolu-action.git
```

Then, within this repo, install all dependencies defined in `package.json`:

```console
$ npm install
```

Now, you should be setup to start development.  Development consists of hacking
on the [`./index.js`](./index.js) file.  After making changes to this file,
you'll need to regenerate the files in [`./dist/`](./dist).  You can do that
with the following command:

```console
$ npm run prepare
```

When sending a PR, make sure to run `npm run prepare` and commit the changes
to `./dist` whenever you make a change in `./index.js`.

## Making a new release

The following steps describe how to make a new release of `fourmolu-action`.
Before making a new release, make sure you've correctly bumped the version
of `fourmolu` used in `index.js` to match the most recent version
from the [fourmolu][fourmolu] repository.

To make a new release, first find the most recent release version number:

```console
$ gh release list | head -n1
v3	Latest	v3	2022-08-09T15:11:02Z
```

The most recent release in this case is `v3`, so if you want to make a new
release, just bump the version by one to `v4`:

```console
$ vim ./CHANGELOG.md   # add an entry for this new v4 release
$ git commit -m 'bumping to v4 with fourmolu-0.9.0.0'  # create a commit for the new changelog
$ git push  # push the changelog commit to the remote master branch
$ gh release create --notes "This release uses fourmolu-0.9.0.0." --title "v4" v4  # make a Release on GitHub
```

You may then want to run `git fetch` to fetch the new tag that has been
automatically created.


[fourmolu]: https://github.com/fourmolu/fourmolu
[git-core-autocrlf]: https://www.git-scm.com/docs/git-config#Documentation/git-config.txt-coreautocrlf
