## run-fourmolu v9

*   `run-fourmolu` Action now takes a `version` argument to allow you to
    specify the version of Fourmolu you want to use.  If you don't specify the
    `version` argument, then the _latest_ version of Fourmolu will be used.
    **Note that this is a breaking change for all current users of
    `run-fourmolu`**.

    With this change, you're now able to use a single version of `run-fourmolu`
    with different versions of Fourmolu.

    Here's an example of how you'd use `run-fourmolu` with the 0.12.0.0 version
    of Fourmolu:

    ```yaml
    - uses: haskell-actions/run-fourmolu@v9
      with:
        version: "0.12.0.0"
    ```

    It is recommended to always specify the version of Fourmolu you want to
    use, since Fourmolu is often not backwards compatible.  New releases of
    Fourmolu could possibly break your CI.  However, if you want to always
    use the newest release of fourmolu, you can do it like the following:

    ```yaml
    - uses: haskell-actions/run-fourmolu@v9
      with:
        version: "latest"
    ```

    Alternatively, you can leave out the `version` argument and it will default
    to `latest`.

## run-fourmolu v8

* Uses Fourmolu 0.12.0.0

## Fourmolu action v7

* Uses Fourmolu 0.11.0.0

## Fourmolu action v6

* Uses Fourmolu 0.10.1.0

## Fourmolu action v5

* Uses Fourmolu 0.9.0.0.

## Fourmolu action v4

* Uses Fourmolu 0.8.2.0.

## Fourmolu action v3

* Uses Fourmolu 0.8.0.0.

## Fourmolu action v2

* Uses Fourmolu 0.7.0.1.

## Fourmolu action v1

* Uses Fourmolu 0.6.0.0.
