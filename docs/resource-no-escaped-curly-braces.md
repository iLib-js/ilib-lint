# source-no-escaped-curly-braces

Ensure that source strings do not contain replacement parameters surrounded by
single single-quotes. Single quotes in the source string should either be doubled
to escape the quotes themselves, or the string should use double-quotes instead. This
is a change in recent versions of react-intl to comply more closely with the
ICU messageformat syntax that it claims to support.

Examples:

Bad: The name is '{name}'.
Good: The name is ''{name}''.
Good: The name is "{name}".
