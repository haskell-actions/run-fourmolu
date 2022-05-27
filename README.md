# Fourmolu action

![CI](https://github.com/bitnomial/fourmolu-action/workflows/CI/badge.svg?branch=master)

This Fourmolu Action helps to ensure that your Haskell project is
formatted with [Fourmolu][fourmolu]. The action tries to find all Haskell source
code files in your repository and fails if any of them are not formatted. In
case of failure it prints the diff between the actual contents of the file
and its formatted version.

## Example usage

In the simple case all you need to do is to add this step to your job:

```yaml
- uses: bitnomial/fourmolu-action@v1
```

The `@v1` after `fourmolu-action` should be replaced with the version of the
Fourmolu Action you want to use.  See
[Releases](https://github.com/bitnomial/fourmolu-action/releases) for all
versions available.  Each version of the Fourmolu Action generally has a
corresponding version of `fourmolu`.  Make sure you pick a Fourmolu Action
version that uses the version of `fourmolu` you use locally.

Here's a more complicated example that shows more options being used:

```yaml
- uses: bitnomial/fourmolu-action@v1
  with:
    # Only check the format of .hs in the src/ directory.
    path: |
      src/**/*.hs

    # Don't follow symbolic links to .hs files.
    follow-symbolic-links: false

    # Extra args to pass to fourmolu on the command line.
    extra-args: "--indent-wheres true"
```

## Example Usage with Build Matrix

If you are using a build matrix, then it is more efficient to have a
separate job for checking of formatting:

```yaml
jobs:
  fourmolu:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: bitnomial/fourmolu-action@v6
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

## Windows

If you are running a workflow on Windows, be wary of [Git's
`core.autocrlf`][git-core-autocrlf]. Fourmolu always converts CRLF endings to
LF endings which may result in spurious diffs, so you probably want to
disable `core.autocrlf`:

```shell
$ git config --global core.autocrlf false
```

[fourmolu]: https://github.com/fourmolu/fourmolu
[git-core-autocrlf]: https://www.git-scm.com/docs/git-config#Documentation/git-config.txt-coreautocrlf
