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