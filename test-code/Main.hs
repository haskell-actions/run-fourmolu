module Main (main) where


-- This is an example Haskell file.  The CI for this repo will run the Fourmolu
-- GitHub Action defined in this repo on this file.  If you want to check that
-- this repo is working correctly, make some changes to this file, commit, and
-- send a PR.  A GitHub Action should run, and then fail.

main :: IO ()
main =
    do
        print
            [ "hello"
            , "bad"
            , "good"
            , "bye"
            ]
        pure ()
    where
        x = 1
