# 0.6.0
- Added new option for Recovering placeholders.
    - This allows us to recover placeholders even when the translator eats them. There are four styles:
        - At End: the placeholder will be added at the end of the sentence if the translator ate it.
        - At Start: the placeholder will be added at the start of sentence if the translator ate it.
        - Perfect Only: the placeholder will be discarded if the translator ate it.
        - Guessing: Uses *magic* to find the spot closest to the placeholder's position on the original string.
    - So now placeholders can be as water tight as splitting!

# 0.5.1
- Exports constants for developing

# 0.5.0
- Pattern types now allow for arrays of strings (direct matching) and functions (which can return an array of strings, a regexp, or nothing)
- If invalid/empty translation is added, the processing happens as usual, but affected lines will return "undefined"

# 0.4.0
- Sentences comprised entirely of placeholders no longer request translation.
- TextProcessorRowLine no longer allows more than one call to init().

# 0.3.0
- Add noRepeat option

# 0.2.0
- Fix recoverPadding implementation
- Add trimLines option

# 0.1.0
- Initial release