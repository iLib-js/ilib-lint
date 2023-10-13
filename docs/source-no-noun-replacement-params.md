# source-no-noun-replacement-params

Ensure that source strings do not contain replacement parameters where nouns, noun
phrases, or adjectives are substituted in to the string. The reason is that the
spelling of the nouns and adjectives can vary with the linguistic case of that
part of the sentence. Also, the spelling of the translations of the definite and
indefinite articles "a", "an", and "the" varies with the gender and plurality of
the noun or noun phrase being substituted in.

Examples of bad source strings:

```
Delete the {fileType}.
Would you like to create a new {fileType} file?
The {object} has been sent successfully to your company's admin for review.
```

Very often, the noun, noun phrase or adjective being substituted in has a
fixed list of possible values. If you are like most engineers, you are probably
always thinking about how you can write your code to be efficient in terms of memory
usage, so it seems like it would be better to have one string with a substitution
rather than two or more separate strings that are almost exactly the same except for
one word. Only problem is, this optimization messes up translation.

Let's examine the first example above. In that example, the list of possible
values for the variable fileType is "file" and "folder". That's it. Just two. So
you might be tempted to use the string above rather than the two strings below:

```
Delete the file.
Delete the folder.
```

The only problem with substituting the noun into that spot is that there is no
way to translate the word "the" properly to all languages, as well as the words
"file" and "folder" to fit the linguistic case. In some languages,
the translation for the word "file" is one gender (either masculine, feminine,
neutral, or ungendered), whereas the translation for the word "folder" has a
different gender. And to make matters more complicated, the gender of those
same two words is different in different languages, even in closely related
languages such as Spanish, Portuguese, and Catalan!

The best practice for i18n is to not attempt to "save bytes" using a 
substitution parameter. Instead, just translate the multiple strings separately
in order to get the best translation possible. The memory savings are very small
anyways.

If you are substituting in unknown text, for example something that a user has
entered, you should avoid using definite or indefinite articles with the
substitution parameter. Instead, you might use a non-grammatical construction
to avoid the problem of grammar entirely.

Bad:

```
You would like to upload a {item}
```

Note that the above doesn't even work in English because "item" may start with a vowel!

Preferred:

```
Type of item you would like to upload: {item}
```

In the preferred example, the word substituted in is not grammatically 
related to the rest of phrase and therefore the string does not need to
have gender or plurality agreement.
