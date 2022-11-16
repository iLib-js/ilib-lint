# i18nlint

A static analysis linter for many types of source files that looks for i18n problems.

This i18n linter differs from other static linters in the following ways:

* it can recognize the locale of files from the path name of files or from within
  the file itself, and applies locale-sensitive rules. For example, you can apply
  a rule that checks that the translations in a resource file of a plural resource
  contain the correct set of plural categories for the target language.
* it can load plugins that extend its functionality:
    * plugins for parsing any file type
    * plugins to extend add more rules
* it can apply different rulesets to different sets of files. This is useful for
  a number of reasons:
    * when linting a mono-repo that has different subprojects inside of it
      and each subproject needs different rules applied to its files
    * when different file types need different rulesets

## Installation

```
npm install i18nlint

or

yarn add i18nlint
```

Then, in your package.json, add a script:

```
"scripts": {
    "lint": "i18nlint"
}
```

Please note: nodejs version 14 or above is required to run this tool, as it
is written with ESM modules.

Additionally, you can install a number of plugins for i18nlint to extend its
functionality. Here are some examples of plugins:

* `i18nlint-javascript` - rulesets that apply to javascript source files
* `i18nlint-react-intl` - rulesets that apply to the resource files that
are used with react-intl
* `i18nlint-ilib-json` - rulesets that apply to json resource files used
with ilib or ilib-resbundle

All plugins should be named starting with "i18nlint-*" so that they can
be recognized as plugins for i18nlint and loaded automatically.

## Quick Start

Running i18nlint is easy. Just change your directory to the top level directory
of your project and run it with no parameters and no configuration file. When
there are no parameters and no configuration file, it will do all default
behaviours, which for some projects is sufficient.

The default behaviours are:

* it will find and load all i18nlint-* plugins in the same node_modules directory
  that it was originally loaded from
* for each plugin, it will load its rulesets and will apply them to the types
  of files that the plugin normally processes
* for file types that the plugins do not process, there are a few built-in
  types of files handled and default rulesets that apply to them.
* for each rule in a ruleset, it will use the default settings for that rule
* it will use the default set of locales (the top 20 locales on the internet
  by traffic) with "en-US" being the source locale
* it will find all files in the project and apply any rulesets that apply to
  each type of file. If a file type does not have any rulesets that apply to it,
  it will be skipped.
    * the locale of a file will be gleaned from its path name if possible
    * for some types of resource files, the locale is documented in
      the file itself. (eg. xliff files)
* output will be printed on the standard output in human readable form

```
$ cd myproject
$ i18nlint
i18nlint - Copyright (c) 2022 JEDLsoft, All rights reserved.
WARN i18n/ru_RU.properties(45): translation should use the appropriate
quote style
myproject.dialog1.body.text = Нажмите кнопку "Справка", чтобы получить
дополнительную информацию.
Rule (locale-quote-style): quote style for the the locale "ru-RU" should
be «»
$
```

## Command-line Parameters

i18nlint accepts the following command-line parameters:

* help - Print out a help message detailing these command-line parameters
* config - Give an explicit path to a configuration file instead of trying to
  find it in the current directory.
* locales - Locales you want your app to support. Value is a comma-separated
  list of BCP-47 style locale tags.
  Default: the top 20 locales on the internet by traffic.
* quiet - Produce no progress output during the run, except for errors running
  the tool such as the inability to load a plugin. Instead exit with a return
  value. Zero indicates no errors, and a positive exit value indicates errors.

## Configuration

If the named paths contain a file called `i18nlint-config.json`, it
will be read and processed to configure the i18nlint tool for that path. The
`i18nlint-config.json` file can have any of the following properties:

* name (String) - name of this project
* locales (Array of strings) - that name the default set of locales for the
  whole project if they are not configured by each path
* sourceLocale (String) - name the locale for source strings in this app.
  Default if not specified is "en-US".
* paths (Object) - a set of configurations for various paths that are given
  by a [micromatch](https://github.com/micromatch/micromatch) glob expression.
  Each glob expression property should be an object that contains settings
  that apply to files that match the glob expression. The settings can be
  be any of:
    * locales (Array of strings) - a set of locales that override
      the global locales list
    * rules - (Object) a set of rules to use with this set of files.
      Each rule name maps either to a boolean (true means turn it
      on, and false means off) or to a string or object that gives
      options for the rule. (Each rule can be different)
    * rulesets (Array of strings) - list the names of rule sets to
      turn on. Rulesets are groups of rules that are typically
      bundled together for particular purpose, such as rules for a
      particular library in a particular programming languages. For
      example, you might have a "android-kotlin" ruleset that turns
      on a number of rules that are typical for checking Android
      apps written in Kotlin. If a ruleset is given, the
      individual rules in that rule set can still be overridden using
      the "rules" property above. Rulesets are just a short-hand
      to turn on many of them at once.
* plugins (Array of strings) - names the i18nlint plugins to use in this
  project. Once loaded, each plugin can define parsers for file types
  or a set of linting rules that become available to use, or both. The
  plugins must all have a package name starting with the prefix `i18lint-`
  which can be left out when listing the plugins in this property.

The `i18nlint-config.json` file can be written in [JSON5](https://github.com/json5/json5)
syntax, which means it can contain comments and other enhancements.

### Example Config File

Here is an example of a configuration file:

```json
{
    "name": "tester",
    "plugins": [
        "javascript",
        "react-intl"
    ],
    "locales": [
        "en-US",
        "de-DE",
        "ja-JP",
        "ko-KR"
    ],
    "paths": {
        "src/**/*.json": {
            // override the general locales
            "locales": [
                "en-US",
                "de-DE",
                "ja-JP"
            ],
            "rulesets": [
                "javascript-ilib"
            ]
        },
        // check the translations from the translation vendor before
        // we use them in our project
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

## Directive Comments

Some file types can contain comments, such as source code. In these types of
files, it is possible to put special i18nlint directive comments that help to
turn on or off rules temporarily. For example, if a javascript
file contains a concatenation that i18nlint is warning about, but that
warning is not valid in that case, it can be turned off.

There are two styles of directive comments. First, you can turn on or off
rules from that point in the file onwards using `i18nlint-on` and
`i18nlint-off`. With no arguments, those turn on or off all rules. If you
want to turn off specific rules, it should be given as the argument to
the directive. It is highly recommended that you only turn on or off
specific rules instead of turning on or off all rules.

Example:

```javascript
/* i18nlint-off javascript-getstring-of-variable */
const str = rb.getString("a" + id);
/* i18nlint-on javascript-getstring-of-variable */
```

The second style of directive comment is to turn off a specific rule for
a single line. For this style, the comment needs to be on the same line where
you want to turn off the rule.

Example:

```javascript
const str = rb.getString(uniqueId); // i18nlint-line javascript-getstring-of-variable
```

## Plugins

Plugins for i18nlint can provide two different things:

* classes that know how to parse particular file types
* classes that implement rules

Often, the same plugin can provide both types of classes.

The idea behind a parser plugin is that you can get a better understanding of the
file if you know how
to parse it. For example, the `i18nlint-properties` plugin knows how to
parse Java properties files, which allows the linter to be able to check the
ids and values of the resource strings and apply the appropriate rules to each.
Without the plugin, the i18nlint would use the default
parser which does not do much interpretation of the file. It simply splits a
text file into an array of lines, and then goes through them one by one looking
for rules that apply to those lines.

The name of all i18nlint plugins must start with the string `i18nlint-`. This is so
that they can be recognized and loaded as i18nlint plugins if no configuration file
is found. It also makes it easier to find plugins on your favorite package manager.

Each i18nlint plugin should publish the names of all rules it provides, including
what options or parameters are available for that rule. It should also provide a
description of each rule so that when the rule matches in a file, the person who is
responsible for that file can get some clue as to what it means and what they need
to do to fix it.

Some generic rules that apply to many types of files are built-in to i18nlint.

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
- define plugin system and default rules
