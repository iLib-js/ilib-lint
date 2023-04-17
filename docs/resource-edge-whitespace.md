# resource-edge-whitespace

Ensure that sequence of whitespaces at either edge of source and target match each other.

If a string extracted for translation from source code has either leading or trailing whitespace, it could mean that it has been used in string concatenation (even though it's incorrect!), so the edge whitespaces might be significant when displaying it in the UI - this rule will detect that such whitespace has been ommited.

If an extra whitespace has been inserted into or removed from the target string (e.g. due to translation typo), it will also detect that.

To fix, ensure that the target string's whitespace exactly matches that of source string - both in front and in the end.

Example:
| Source | Target (incorrect) | Target (correct) | Comment |
| --- | --- | --- | --- |
| `"Today is the "` | `"Heute ist der"` | `"Heute ist der "` | Beginning of a concatenated sentence |
| `" day of the week."` | `"Tag der Woche."` | `" Tag der Woche."` | End of a concatenated sentence |
| `"An example text."` | `"Ein Beispieltext. "` | `"Ein Beispieltext."` | Extra whitespace at the end |
