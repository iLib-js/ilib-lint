# ilib-lint

A static analysis linter for many types of source files that looks for i18n problems.

This i18n linter differs from other static linters in the following ways:

* It can apply different rulesets to different sets of files. This is useful for
  a number of reasons:
    * when linting a mono-repo that has different subprojects inside of it
      and each subproject needs different rules applied to its files
    * when different sets of files need different rulesets, even within the same file type
* It can handle any file type
    * most linters are specific to a programming language and its related files. This linter
      can read any type of file and apply the appropriate set of rules.
* Rules can be locale-sensitive
    * most linters apply the same rules blindly to all files, regardless of the locale
    * for resource files, it can apply the appropriate locale for each resource individually
* It can recognize the locale of files from the path name of files
    * this allows it to apply the locale-sensitive rules automatically. For example, you can apply
      a rule that checks that the translations in a resource file of a plural resource
      contain the correct set of plural categories for the target language.
* It can load plugins
    * Parsers - you can add parsers for new programming languages or resource file types
    * Formatters - you can make the output look exactly the way you want
    * Rules - you can add new rules declaratively or programmatically

## Installation

```
npm install ilib-lint

or

yarn add ilib-lint
```

Then, in your package.json, add a script:

```
"scripts": {
    "lint": "ilib-lint"
}
```

Please note: nodejs version 14 or above is required to run this tool, as it
is written with ESM modules.

## Quick Start

Running ilib-lint is easy. Just change your directory to the top level directory
of your project and run it with no parameters and no configuration file. It will
do all default behaviours and apply the default rules, which for some projects
is sufficient:

```
$ cd myproject
$ ilib-lint
ilib-lint - Copyright (c) 2022-2023 JEDLsoft, All rights reserved.
WARN: i18n/ru_RU.properties(45): translation should use the appropriate
quote style
  myproject.dialog1.body.text = Нажмите кнопку "Справка", чтобы получить
дополнительную информацию.
  Rule (locale-quote-style): quote style for the the locale "ru-RU" should
be «text»
$
```

## Default Behaviours

The default behaviour is to recursively search the current directory for all
xliff files, and then apply all of the built-in resource rules to those files
and report human-readable results to the standard output.

The default behaviours are:

* Start in the current directory and recursively find all xliff files
  underneath there. The xliff file type is built-in to the linter.
* All built-in rules will be added to the current rule set, and it will
  instantiate each rule with its default settings.
* It will use the default set of locales (the top 20 locales on the internet
  by traffic) with "en-US" being the source locale
* For each file found, it applies each rule in the ruleset.
  If a file type does not have any rulesets that apply to it,
  it will be skipped.
    * the locale of a file can sometimes be gleaned from its path name
    * for some types of resource files, the locale is documented in
      the file itself. (eg. xliff or other resource files)
* Output will be printed on the standard output in human readable form


## Command-line Parameters

ilib-lint accepts the following command-line parameters:

* help - Print out a help message detailing these command-line parameters
* config - Give an explicit path to a configuration file instead of trying to
  find it in the current directory.
* errorsOnly - Only give information on errors, not warnings. Also, only exit
  with status 2 if there are errors, and status 0 if there are warnings. This
  flag allows you to squelch the warnings and only fail a script if there are
  actual errors.
* locales - Locales you want your app to support globally. Value is a comma-separated
  list of BCP-47 style locale tags. File types can override this list.
  Default: the top 20 locales on the internet by traffic.
* sourceLocale - locale of the source files or the source locale for resource
  files. Default: "en-US"
* quiet - Produce no progress output during the run, except for errors running
  the tool such as the inability to load a plugin. Instead exit with a return
  value. Zero indicates no errors, and a positive exit value indicates errors.

## Exit Status

If you want to use this linter in a script, you can check for the following
exit status:

* 0 - no problems found
* 1 - warnings found
* 2 - errors found

When the `--errorsOnly` flag is given, the program will return 0 unless at least
one error was found.

## Configuration

The paths to process are given on the command-line. If no path is specified
on the command-line, the tool will default to the current directory.
If any named path contains a file called `ilib-lint-config.json`, that
file will be read and processed to configure a project within the ilib-lint tool
with that path as the root directory for the project.

This json config file will be parsed as [JSON5](https://json5.org), which means
it can contain comments and other nice features that make it easier for humans
to read and write.

The `ilib-lint-config.json` file can have any of the following properties:

* name (String, required) - name of this project
* locales (Array of strings) - that name the default set of locales for the
  whole project if they are not configured by each path
* sourceLocale (String) - name the locale for source strings in this app.
  Default if not specified is "en-US".
* rules (Array of Object) - an array of declarative regular-expression-based rules to use
  with this project. Resource rules are applied to resources loaded from a
  resource file. Source file rules are applied to regular programming source
  files. Each item in the rules array should be an
  object that contains the following properties, all of which are required:
    * type (String) - the type of this rule. This may be any of the
      following:
        * resource-matcher - check resources in a resource file. The
          regular expressions that match in the
          source strings must also match in the target string
        * resource-source - check resources in a resource file. If
          the regular expressions match in the source string of a
          resource, a result will be generated
        * resource-target - check resources in a resource file. If
          the regular expressions match in the target string of a
          resource, a result will be generated
        * sourcefile - Check the text in a source file, such as a
          java file or a python file. Regular expressions that match
          in the source file will generate results
    * name (String) - a unique dash-separated name of this rule.
      eg. "resource-url-match",
    * description (String) - a description of what this rule is trying
      to do. eg. "Ensure that URLs that appear in the source string are
      also used in the translated string"
    * note (String) - string to use when the regular expression check fails.
      eg. "URL '{matchString}' from the source string does not appear in
      the target string"
      Note that you can use `{matchString}` to show the user the string
      that the regular expression matched in the source but not in the target.
    * regexps (Array.<String>) - an array of regular expressions to match
      in the source and target strings. If any one of those expressions
      matches in the source, but not the target, the rule will create
      a Result that will be formatted for the user.
* rulesets (Object) - configured named sets of rules. Some rules can be shared between
  file types and others are more specific to the file type. As such, it is sometimes
  convenient to to name a set of rules and refer to the whole set by its name instead
  of listing them all out. The properties of the rulesets object are the names of the
  sets, and the values is also a Object that configures each rule. The rules are turned
  on with a value "true" or with a rule-specific option. They are turned off with
  a falsy value.
* filetypes (Object) - a set of configurations for various file types. The file types
  are given dash-separated names such as "python-source-files" so that they can be referred
  to in the
  paths object below. Properties in the filetypes object are the name of the file type,
  and the values are an object that gives the settings for that file type. The value
  object can contain any of the following properties:
    * template (String, required) - a template that can be used to parse the
      file name for the locale of that file.
    * locales (Array of String) - a set of locales that override
      the global locales list. If not specified, the file type uses the
      global set of locales.
    * rules - (Object) names a set of rules to use with this set of files.
      Each rule name maps either to a boolean (true means turn it
      on, and false means off) or to a string or object that gives
      options for the rule. (Each rule can be different)
    * rulesets (Array of String) - list the names of rule sets to
      turn on. Rulesets are groups of rules that are typically
      bundled together for particular purpose, such as rules for a
      particular library in a particular programming languages. For
      example, you might have a "android-kotlin" ruleset that turns
      on a number of rules that are typical for checking Android
      apps written in Kotlin. If a ruleset is given, the
      individual rules in that rule set can still be overridden using
      the "rules" property above. Rulesets are just a short-hand
      to turn on many of them at once.
* paths (Object) - this maps sets of files to file types. The properties in this
  object are [micromatch](https://github.com/micromatch/micromatch) glob expressions
  that select a subset of files within the current project. The glob expressions
  can only be relative to the root of the project.
  The value of each glob expression property should be either a string that names
  a file type, or the definition of the file type directly. If you give the file
  type directly, it cannot be shared, so it is usually a good idea to define the
  file type in the "filetypes" property.

The `ilib-lint-config.json` file can be written in [JSON5](https://github.com/json5/json5)
syntax, which means it can contain comments and other enhancements.

### Example Config File

Here is an example of a configuration file:

```json
{
    "name": "tester",
    "locales": [
        "en-US",
        "de-DE",
        "ja-JP",
        "ko-KR"
    ],
    "plugins": [
        "react"
    ],
    "excludes": {
        "node_modules/**",
        ".git/**",
        "test/**"
    },
    rules: [
        // test that named parameters like {param} appear in both the source and target
        {
            "type": "resource-matcher",
            "name": "resource-named-params",
            "description": "Ensure that named parameters that appear in the source string are also used in the translated string",
            "note": "The named parameter '{matchString}' from the source string does not appear in the target string",
            "regexps": [ "\\{\\w+\\}" ]
        }
    ],
    "rulesets": {
        "react-rules": {
            "resource-named-params": true,
            // the "localeOnly" is an option that the quote matcher supports
            // so this both includes the rule in the rule set and instantiates
            // it with the "localeOnly" option
            "resource-quote-matcher": "localeOnly"
        }
    },
    "filetypes": {
        "json": {
            // override the general locales
            "locales": [
                "en-US",
                "de-DE",
                "ja-JP"
            ]
        },
        "javascript": {
            "rulesets": [
                "react-rules"
            ]
        },
        "jsx": {
            "rulesets": [
                "react-rules"
            ]
        }
    },
    "paths": {
        // use the file type defined above
        "src/**/*.json": "json",
        "src/**/*.js": "javascript",
        "src/**/*.jsx": "jsx",
        // define a file type on the fly
        "**/*.xliff": {
            "rules": {
                "formatjs-plural-syntax": true,
                "formatjs-plural-categories": true,
                "formatjs-match-substitution-params": true,
                "match-quote-style": "localeOnly"
            }
        }
    }
}
```

## Built-in Rules

Some generic rules that apply to many types of files are built-in to ilib-lint.
This apply mostly to resource files, such as XLIFF files.

The built-in rules are:

- resource-icu-plurals - check for ICU-style plurals. Also works with formatjs
  plurals, as it has the same syntax.
- resource-quote-style - if the source string has quotes, check that the target
  string also has quotes and that those quotes are appropriate for the locale
- resource-url-match - if the source string contains references to URLs, check
  that the target string also contains references to the same URLs
- resource-named-params - Ensure that named parameters that appear in the source
  string are also used in the translated string
- resource-unique-key - Ensure that the keys are unique within a locale across
  all resource files

## License

Copyright © 2022, JEDLSoft

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.

See the License for the specific language governing permissions and
limitations under the License.

## Release Notes

### v1.0.0

- initial version
- define initial code and default built-in rules
- this is an ESM-only project, which is why it can only be run with
  nodejs v14+
