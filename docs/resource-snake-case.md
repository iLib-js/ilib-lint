# resource-snake-case

If source string contains only snake case and no whitespace, then the target must be the same.

Snake case is a way of writing phrases without spaces, where spaces are replaced with underscores _,
and the words are typically all lower case.

The source string is treated as Do Not Translate because snake_case strings are typically not translatable text.
Instead, they are usually used in software as identifiers, variable names or control strings.

If the target is different than the source, then it is an error.


Example of correctly matched snake case variations in a Spanish translation - both source and target are the same:

1. snake_case
   - source: `access_granted`
   - target: `access_granted`

2. SCREAMING_SNAKE_CASE
   - source: `ACCESS_GRANTED`
   - target: `ACCESS_GRANTED`

3. camel_Snake_Case
   - source: `access_Granted`
   - target: `access_Granted`

Example of incorrectly matched snake case in a Spanish translation:

1. snake_case
- source: `access_granted`
- target: `acceso_concedido`

Problems in the above incorrect translation:

1. The `access_granted` snake cased string was translated, and should be treated as Do Not Translate instead.
