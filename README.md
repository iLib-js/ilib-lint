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
* excludes (Array of String) - an array of micromatch expressions for files
  or folders in the project to exclude from the recursive search.
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
* formatters (Array of Object) - a set of declarative formatters. Each array element is
  an object that contains the following properties:
    * name - a unique name for this formatter
    * description - a description of this formatter to show to users
    * template - a template string that shows how the various fields of a Result instance should be
      formatted, plus two extras that come from the rule: ruleName and ruleDescription
    * highlightStart - string to use as the highlight starting marker in the highlight string
    * highlightEnd - string to use as the highlight ending marker in the highlight string
* rulesets (Object) - configure named sets of rules. Some rules can be shared between
  file types and others are more specific to the file type. As such, it is sometimes
  convenient to to name a set of rules and refer to the whole set by its name instead
  of listing them all out. The properties of the rulesets object are the names of the
  sets, and the values is also a Object that configures each rule that should be
  included in that set. The rules are turned on with a value "true" or with a
  rule-specific option. They are turned off with a falsy value.
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
    * ruleset (String, Array of String, or Object) - name the rule set or
      list of rule sets to use with files of this type if the value is
      a string or an array of strings. When the value is a list of strings,
      the rules are a superset of all of the rules in the named rule sets.
      If the value is an object, then it is considered to be an on-the-fly
      unnamed rule set defined directly.
* paths (Object) - this maps sets of files to file types. The properties in this
  object are [micromatch](https://github.com/micromatch/micromatch) glob expressions
  that select a subset of files within the current project. The glob expressions
  can only be relative to the root of the project.
  The value of each glob expression property should be either a string that names
  a file type for files that match the glob expression, or an on-the-fly unnamed
  definition of the file type. If you specify the file type directly, it cannot be
  shared with other mappings, so it is usually a good idea to define a named file type
  in the "filetypes" property first.

The `ilib-lint-config.json` file can be written in [JSON5](https://github.com/json5/json5)
syntax, which means it can contain comments and other enhancements.

### Example Config File

Here is an example of a configuration file:

```json
{
    // the name is required and should be unique amongst all your projects
    "name": "tester",
    // this is the global set of locales that applies unless something else overrides it
    "locales": [
        "en-US",
        "de-DE",
        "ja-JP",
        "ko-KR"
    ],
    // list of plugins to load
    "plugins": [
        "react"
    ],
    // default micromatch expressions to exclude from recursive dir searches
    "excludes": [
        "node_modules/**",
        ".git/**",
        "test/**"
    ],
    // declarative definitions of new rules
    "rules": [
        // test that named parameters like {param} appear in both the source and target
        {
            "name": "resource-named-params",
            "type": "resource-matcher",
            "description": "Ensure that named parameters that appear in the source string are also used in the translated string",
            "note": "The named parameter '{matchString}' from the source string does not appear in the target string",
            "regexps": [ "\\{\\w+\\}" ],
            "link": "https://github.com/ilib-js/i18nlint/blob/main/README.md"
        }
    ],
    "formatters": [
        {
            "name": "minimal",
            "description": "A minimalistic formatter that only outputs the path and the highlight",
            "template": "{pathName}\n{highlight}\n",
            "highlightStart": ">>",
            "highlightEnd": "<<"
        }
    ],
    // named rule sets to be used with the file types
    "rulesets": {
        "react-rules": {
            // this is the declarative rule defined above
            "resource-named-params": true,
            // the "localeOnly" is an option that the quote matcher supports
            // so this both includes the rule in the rule set and instantiates
            // it with the "localeOnly" option
            "resource-quote-matcher": "localeOnly"
        }
    },
    // defines common settings for a particular types of file
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
    // this maps micromatch path expressions to a file type definition
    "paths": {
        // use the file type defined above
        "src/**/*.json": "json",
        "src/**/*.js": "javascript",
        "src/**/*.jsx": "jsx",
        // define a file type on the fly
        "**/*.xliff": {
            "ruleset": {
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
- resource-state-checker - Ensure that all resources have a particular state
  field value, or one of an array of state field values. The parameter for this
  rule should either be a string or an array of strings that name the allowed
  values.

## Writing Plugins

The linter tool can support plugins that provide parsers, formatters, or rules,
or any of them at the same time.

## Common Code

All plugins should import and use the classes in the
[i18nlint-common](https://github.com/ilib-js/i18nlint-common) package.
This defines the super classes for each plugin type, as well as a number
of utility classes and functions.

### Linter Plugins

Linter plugins are simple wrappers around the parser, formatter, and rule
plugins, which allow the plugin to define multiple plugins. For example, many
plugins define multiple related rules at the same time which check for
different aspects of a string.

The linter plugin should override and implement these three methods:

- getParsers - return an array of classes that inherit from the Parser class
- getRules - return an array of classes that inherit from the Rule class
- getFormatters - return an array of classes that inherit from the Formatter class

For rules and formatters, each array entry can be either declarative or
programmatic. See the descriptions below about declarative and programmatic
plugins.

When returning programmatic plugins, make sure to return the actual class
itself instead of instances of the class. The linter will need to create
multiple instances of each class during the run of the program.

### Parsers

The job of the parser is to convert a source file into an intermediate representation
that rules can easily digest. There are two standard representations that many
rules use, but your parser and rules can use their own representation, as
long as the parser and the rules agree on what that format is. Typically, the
parser will produce something like an abstract syntax tree (AST) that the rules
know how to traverse and interpret.

The two standard representations are:

- resources - the file is converted into a set of Resource instances
- lines - the file in converted into a simple array of lines

The resources representation is intended to represent entries in resource files
such as xliff files, gnu po files, or java properties files. Each entry in the
resource file is represented as an instance of one of the standard resource
classes all defined in the
[ilib-tools-common](https://github.com/ilib-js/ilib-tools-common)
project:

- ResourceString - the resource is a single string
- ResourceArray - the resource is an array of strings
- ResourcePlural - the resource is a plural string

The power of a resource file is that resources can contain both a source and a
target string, so the rules are able to check the source strings against the target
strings. Regularly, source files only have source strings in them (if any) so
the target translations cannot be checked.

Parsers should extend the `Parser` class from the `i18nlint-common` package. The constructor
for your class should define the following properties:

- `this.name` - a unique name for this parser
- `this.description` - a description of this type of parser to display to users

It should also override the
[parseData()](https://github.com/iLib-js/i18nlint-common/blob/main/src/Parser.js)
method which parses a string, and the
[parse()](https://github.com/iLib-js/i18nlint-common/blob/main/src/Parser.js)
method, which loads data from the file and then parses it.

You can see an example of a parser plugin by looking at the gnu PO file parser at
[ilib-lint-python-gnu](https://github.com/ilib-js/ilib-lint-python-gnu/blob/main/src/POParser.js).
That parser interprets a .po file as a resource file and returns a set of
Resource instances.

### Rules

Rules interpret the intermediate representation of a file produced by a Parser
and produce a single
[Result](https://github.com/iLib-js/i18nlint-common/blob/main/src/Result.js)
instance, an array of Result instances, one for each problem found, or undefined
if there are no problems found.

There are two types of rules, declarative and programmatic.

Declarative rules are simply a list of regular expressions with metadata. The
linter searches for matches to those regular expressions and produces Result
instances when found. (Or when they are not found in some cases!)

These can be declared in the config file. (See the example config file above.)

Each declarative rule should have the following properties:

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
* link (String) - an URL to a website with a more complete explanation
  of the problem that was found and how the problem can be resolved
  and avoided in the future. Often, this is a link to a markdown file
  in the docs folder on the github repo for the plugin, but it can be
  any link you like.

Programmatic rules are used when the requirements for the rules are more complicated
than a simple regular expression string can handle. For example, a rule that checks
if the target string of a resource has the correct quote style for the target
locale first needs to look up what the correct quote style even is in
order to apply the rule.

In order to create a rule instance, create a class that extends the
[Rule](https://github.com/ilib-js/i18nlint-common/blob/main/src/Rule.js)
class in the [i18nlint-common](https://github.com/ilib-js/i18nlint-common/] project.
The constructor of this class should define the following properties:

- `this.name` - a unique name for this rule
- `this.description` - a description of this type of rule to display to users

There are no rules for what to name your Rule, but the Rules written by the ilib-js
organization generally follow some conventions. Resource checkers start with
"resource-" and source file checkers start with "source-". For resource checkers,
the word "match" is used at the end when checking both the source and target,
"source" is used at the end when checking only the source string, and "target"
when checking only the target string. So, "resource-urls-match" is a Rule that
checks resource files for URLs in both the source and target. You are free to name
your rules anything you like or to follow the conventions above. The important
part is that the name should uniquely identify your Rule so that you can use it
in config files.

The rule should also override and implement the getRuleType() method and the
[match()](https://github.com/iLib-js/i18nlint-common/blob/main/src/Rule.js) method,
which takes an intermediate representation as a parameter and returns either
a single Result, an array of Result, or undefined.

If you would like to see an example rule plugin, see the definition of
the built-in ICU plural matcher rule:
[resource-icu-plurals](https://github.com/ilib-js/i18nlint/blob/main/src/rules/ResourceICUPlurals.js)
which checks resources to make sure that plurals in source and target strings
have the correct syntax for ICU and formatjs.

### Formatters

Formatters transform a [Result object](https://github.com/iLib-js/i18nlint-common/blob/main/src/Result.js) into a format that the consumer can use. For the most part, the consumer
is a human, so the result should be formatted in text so that the user can read
it easily. Other times, the consumer is another program, so the result should be
formatted for easy parsing. Formatters can formats the results in any way necessary.

There are two types of formatters, declarative and programmatic.

Declarative formatters are simply a template string where properties of the Result
instances are formatted into it. These can be declared in the config file. (See the
example config file above.)

The template strings may have any of the following fields from the Result instance
in them:

- severity
- pathName
- lineNumber
- source
- highlight
- id

Additionally, they may have the following fields from the Rule instance in them:

- ruleDescription
- ruleName
- ruleLink

Programmatic formatters are used when the requirements for formatting are more complicated
than a simple template string can handle. For example, a CSV formatter would have to make
sure that fields in a CSV file are escaped properly to conform to CSV syntax, and would
include escaping code in it.

In order to create a formatter instance, create a class that extends the
[Formatter](https://github.com/ilib-js/i18nlint-common/blob/main/src/Formatter.js)
class in the [i18nlint-common](https://github.com/ilib-js/i18nlint-common/] project.
The constructor of this class should define the following properties:

- `this.name` - a unique name for this formatter
- `this.description` - a description of this type of formatter to display to users
- `this.link` - (optional) a link to a web page that gives a more complete explanation
  the the rule and how to resolve the problem it found

The formatter should also override and implement the
[format()](https://github.com/iLib-js/i18nlint-common/blob/main/src/Formatter.js) method,
which takes a Result instance as a parameter and returns a formatted string.

If you would like to look at an example formatter plugin, see the definition of
the built-in default formatter
[ansi-console-formatter](https://github.com/ilib-js/i18nlint/blob/main/src/formatters/AnsiConsoleFormatter.js)
which formats a Result for colorful output on an ANSI console.

## Example Plugin

You can take a look at the [ilib-lint-python](https://github.com/ilib-js/ilib-lint-python)
plugin as a working example of ilib-lint plugin. It implements some rules that
check the various types of substitution parameters that python/django and
gnu gettext support.

Additionally, there is a [sample python project](https://github.com/ilib-js/ilib-samples/lint)
that uses the ilib-lint-python plugin. It has purposeful errors built into it which
violate the rules implemented in the plugin so that the linter will produce some output.
Clone the project, cd to the lint directory, run `npm install`, and then `npm run lint`
to see the results.

## License

Copyright © 2022-2023, JEDLSoft

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

### Pending release

- added rule to ensure whitespaces at the edges of string are preserved in the same form
- added rule to check if resources have both source and target defined
- fixed bug where resources of type array or plural were not getting
  processed properly in the declarative rules
- added rule to check Do Not Translate terms in resources
- added rule to warn against half-width kana characters
- added rule to warn against double-byte whitespace characters
- added rule to warn of whitespace adjacent to certain fullwidth punctuation characters

### v1.5.0

- removed ability for the ICU plural rule to report results on the
  source text
    - now it only checks the target text
    - a different rule should be implemented to check the
      source text

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
