# resource-no-escaped-curly-braces

Ensure that translations do not contain replacement parameters with
curly braces that are escaped with single single-quotes. Single quotes in the target
string should be doubled to escape them.

Examples:

Source: The name is ''{name}''.
Good translation: "名前は''{name}''です。"
Bad translation: "名前は'{name}'です。"
