# source-no-lazy-plurals

This rule ensures that source strings do not punt on doing proper
formatjs plurals.

If you use the construct "(s)" at the end of a word to indicate a
plural, it will not be easily translatable to many different languages
for a variety of reasons.

For example: in German, the plural of "Blat" (paper) is "Bl&auml;tter"
In this case, the spelling of the word changes in addition to the
adding the plural suffix. It's impossible to come up with some sort of
bracketed expression to capture that in a way that a regular German
speaker would readily understand.

Example failure case:

```js
    "message": "There are {count} file(s) in the folder."
```

This should use a formatjs plural instead:

```js
    "message": "{count, plural, one {There is # file.} other {There are # files.}}"
```

This ensures that the plurality is handled properly in all languages.
(Including English!)

