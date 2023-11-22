# source-icu-unexplaiend-params

This rule checks if replacement parameters mentioned in the source string are mentioned in the comment for translators as well.

It's good practice to provide some description for replacement parameters to translators. They can do a much better job translating if they know what each replacement parameter represents.

Example:

```js
export default defineMessages({
    newFeatureNotice: {
        defaultMessage: '{readMoreLink} about our cool new features.',
        description: 'Notice about new features.',
        id: 'app.popups.newFeatureNotice',
    },
}
```

Given the string description above, it's hard to tell for certain what the parameter will contain. To ensure translators correctly interpret this message, provide a description like so:

```js
export default defineMessages({
    newFeatureNotice: {
        defaultMessage: '{readMoreLink} about our cool new features.',
        description: 'Notice about new features. readMoreLink is a hyperlink with text "Read more".',
        id: 'app.popups.newFeatureNotice',
    },
}
```