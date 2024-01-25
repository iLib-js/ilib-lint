Release Notes
============================

### v1.14.0

- added a new rule to check whether or not replacement parameters in the
  source string are explained in the translator's comments.
- fixed a bug where the quote style checker was not checking quotes properly
  when the quotes surrounded a replacement parameter like "{this}"
- added the ability to set sourceLocale through the config file.
- added time eplased information in the result.
- added a `progressinfo` option to know the which file is checking while the tool is running.

### v1.13.1

- fixed a bug with the sorting of resultsd
### v1.13.0

- make sure the results are sorted by file path and also line number within
  that file path
- updated the rule that checks for spaces between double- and single-byte
  characters. The rule now allows for spaces between double-byte characters
  and single-byte punctuation.

### v1.12.0

- added source-icu-plural-params rule to check if a replacement parameter
  is used in the "other" category. If so, then the same replacement
  parameter must also appear in the "one" category string. The idea is
  to support languages where there are multiple numbers that are considered
  singular.
- resolved a bug with the `--config path` command-line parameter where
  the linter could not load the config file if the path was given as relative
  to the current directory instead of an absolute path.

### v1.11.0

- added source-no-noun-replacement-params rule to check if a noun is being
  substituted into a replacement parameter in the source English text. Nouns
  and the articles "a", "an", and "the" are not translatable to all languages
  because of gender and plurality agreement rules.
- converted all unit tests from  nodeunit to jest
- updated dependencies

### v1.10.0

- added rule source-no-dashes-in-replacement-params to check that replacement
  parameter do not contain dashes, which is not allowed in ICU syntax.
- added rule source-no-manual-percentage-formatting to check that source
  string do not contain manually formatted percentages. Tell the engineer to
  use a locale-sensitive number formatter instead.

### v1.9.0

- make sure the rule resource-no-space-with-fullwidth-punctuation only applies to
  Japanese and specifically not Chinese
- added rule to check source ICU plural syntax
- added rule to check required categories in source ICU plural
- added rule to check that source and target string do not contain
  escaped replacement parameters '{likeThis}'. In later versions of react-intl,
  single-quoted replacement params are left alone when rendered.
- fix a bug where the ICU Plural checker would throw an exeception if
  it encountered a resource that was supposed to be translated, but for some
  reason, did not have a target string

### v1.8.0

- added auto-fixing support
    - Parser can now implement writing out a modified IntermediateRepresentation
      back to the file from which it was parsed
    - Rule can produce and attach a Fix to the given Result
    - a Fixer should be able to apply provided Fixes onto the IntermediateRepresentation
      so that a fixed content would then be written out to the file
    - auto-fixing can be enabled either via CLI flag "fix" or in project config file "autofix"
- implemented a mechanism for fixing strings
- improved ICU plural checker to be able to parse plurals properly when the plurals
  are embedded in the middle of a string. Previously, it only checked the plurals
  when they were they only thing in the string.

### v1.7.0

- added the ability to include or exclude locales from declarative rules
    - the "locales" property gives the list of locales that the
      the rule applies to
    - the "skipLocales" property gives the list of locales that
      the rule does not apply to
    - modified a few locales to be Japanese-only:
        - resource-no-fullwidth-punctuation-subset
        - resource-no-space-between-double-and-single-byte-character
        - resource-no-double-byte-space
        - this fixes a bug where these rules erroneously applied to
          Chinese
- fixed plural checker to not produce a result if the source plural
  category is empty. Previously, if the source category and the target
  category were both empty, it would complain that the target string
  is the same as the source string.
- fixed parsing of select and selectordinal plurals so they don't complain
  about a missing "one" category

### v1.6.1

- resource-quote-style: don't emit error when quotes are missing in SV target
- fixed a problem of false positives when there is a plural and the target
  language has less plural categories than the source language
- having no state attribute on the target tag of a translation unit would
  cause an exception. Now it properly gives an error that no state was found.
- fixed a problem where the same results were printed out multiple times

### v1.6.0

- added the ability to scan source code files and apply rules
    - added source-checker Rule for declarative rules
- moved functionality into Project class
    - main loop moved from index.js into the run() method
    - directory walk function moved to a method of Project
- added I18N score into the summary at the end of the run
    - gives a score from 0 to 100 where 0 means your project
      is not localization ready at all, and 100 means it is completely
      ready for localization.
    - added command-line parameters to control the exit code
      from the linter based on the score

### v1.5.3

- fixed a problem where the quote checker rule would not handle ASCII single quote
  characters used as apostophes properly.

### v1.5.2

- update the documentation above to enumerate all the current resource plugins
- fixed a bug where some resources cause a crash in the
  resource-icu-plurals-translated rule

### v1.5.1

- state checker rule was not configured properly, so it did not run. Now, it will.

### v1.5.0

- added rule to ensure whitespaces at the edges of string are preserved in the same form
- added rule to check if resources have both source and target defined
- fixed bug where resources of type array or plural were not getting
  processed properly in the declarative rules
- added rule to check Do Not Translate terms in resources
- added rule to warn against half-width kana characters
- added rule to warn against double-byte whitespace characters
- added rule to warn of whitespace adjacent to certain fullwidth punctuation characters
- added rule to warn of a space between double-byte and single-byte character 
- added rule to check whether or not there is a translation for each source string in
  a resource
- removed ability for the ICU plural rule to report results on the
  source text
    - now it only checks the target text
    - a different rule should be implemented to check the
      source text
- added rule to check if any of the categories of a plural, select,
  or selectordinal are not translated

### v1.4.0

- added rules to detect some double-byte (fullwidth) characters

### v1.3.0

- added resource-state-checker Rule so that you can ensure that all
  resources have a particular state field value

### v1.2.1

- fixed packaging problem where the test plugin was listed in the
  dependencies instead of the devDependencies

### v1.2.0

- added Rule links to give rule writers a way of giving a more complete explanation
  of the rule and how to resolve the problem.

### v1.1.0

- added support for plugins
- added count at the end of the output
- added the --list option to show what things are available to
  put in the config file

### v1.0.0

- initial version
- define initial code and default built-in rules
- this is an ESM-only project, which is why it can only be run with
  nodejs v14+
