module Main (main) where

main :: IO ()
main =
           do
            print [ "hello",
               "bad",   "good",

                      "bye" ]
            pure ()
      where
  x = 1
