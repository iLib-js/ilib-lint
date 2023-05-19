/*
 * testResourceICUPlurals.js - test the ICU plural syntax checker rule
 *
 * Copyright © 2023 JEDLSoft
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { ResourceArray, ResourcePlural, ResourceString } from 'ilib-tools-common';

import ResourceICUPlurals from '../src/rules/ResourceICUPlurals.js';

import { Result, IntermediateRepresentation } from 'i18nlint-common';

export const testResourceICUPlurals = {
    testResourceICUPluralsMatchNoError: function(test) {
        test.expect(2);

        const rule = new ResourceICUPlurals();
        test.ok(rule);

        const resource = new ResourceString({
            key: "plural.test",
            sourceLocale: "en-US",
            source: '{count, plural, one {This is singular} other {This is plural}}',
            targetLocale: "de-DE",
            target: "{count, plural, one {Dies ist einzigartig} other {Dies ist mehrerartig}}",
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });
        test.ok(!actual);

        test.done();
    },

    testResourceICUPluralsMatchNestedNoError: function(test) {
        test.expect(2);

        const rule = new ResourceICUPlurals();
        test.ok(rule);

        const resource = new ResourceString({
            key: "plural.test",
            sourceLocale: "en-US",
            source: '{count, plural, one {{total, plural, one {There is {count} of {total} item available} other {There is {count} of {total} items available}}} other {{total, plural, one {There are {count} of {total} item available} other {There are {count} of {total} items available}}}}',
            targetLocale: "de-DE",
            target: "{count, plural, one {{total, plural, one {Es gibt {count} von {total} Arkitel verfügbar} other {Es gibt {count} von {total} Arkitel verfügbar}}} other {{total, plural, one {Es gibt {count} von {total} Arkitel verfügbar} other {Es gibt {count} von {total} Arkitel verfügbar}}}}",
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });
        test.ok(!actual);

        test.done();
    },

    testResourceICUPluralsMatchNestedMultiLineNoError: function(test) {
        test.expect(2);

        const rule = new ResourceICUPlurals();
        test.ok(rule);

        const resource = new ResourceString({
            key: "plural.test",
            sourceLocale: "en-US",
            source: `{count, plural,
                one {
                    {total, plural,
                        one {There is {count} of {total} item available}
                        other {There is {count} of {total} items available}
                    }
                }
                other {
                    {total, plural,
                        one {There are {count} of {total} item available}
                        other {There are {count} of {total} items available}
                    }
                }
            }`,
            targetLocale: "de-DE",
            target: `{count, plural,
                one {
                    {total, plural,
                        one {Es gibt {count} von {total} Arkitel verfügbar}
                        other {Es gibt {count} von {total} Arkitel verfügbar}
                    }
                }
                other {
                    {total, plural,
                        one {Es gibt {count} von {total} Arkitel verfügbar}
                        other {Es gibt {count} von {total} Arkitel verfügbar}
                    }
                }
            }`,
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });
        test.ok(!actual);

        test.done();
    },

    testResourceICUPluralsMatchTooManyOpenBraces: function(test) {
        test.expect(2);

        const rule = new ResourceICUPlurals();
        test.ok(rule);

        const resource = new ResourceString({
            key: "plural.test",
            sourceLocale: "en-US",
            source: '{count, plural, one {This is singular} other {This is plural}}',
            targetLocale: "de-DE",
            target: "{count, plural, one {{Dies ist einzigartig} other {Dies ist mehrerartig}}",
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });
        const expected = new Result({
            severity: "error",
            description: "Incorrect plural or select syntax in target string: SyntaxError: MALFORMED_ARGUMENT",
            id: "plural.test",
            source: '{count, plural, one {This is singular} other {This is plural}}',
            highlight: 'Target: {count, plural, one {{Dies <e0>ist einzigartig} other {Dies ist mehrerartig}}</e0>',
            rule,
            locale: "de-DE",
            pathName: "a/b/c.xliff"
        });
        test.deepEqual(actual, expected);

        test.done();
    },

    testResourceICUPluralsMatchUnclosedOpenBraces: function(test) {
        test.expect(2);

        const rule = new ResourceICUPlurals();
        test.ok(rule);

        const resource = new ResourceString({
            key: "plural.test",
            sourceLocale: "en-US",
            source: '{count, plural, one {This is singular} other {This is plural}}',
            targetLocale: "de-DE",
            target: "{count, plural, one {Dies ist einzigartig} other {Dies ist mehrerartig}",
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });
        const expected = new Result({
            severity: "error",
            description: "Incorrect plural or select syntax in target string: SyntaxError: EXPECT_ARGUMENT_CLOSING_BRACE",
            id: "plural.test",
            source: '{count, plural, one {This is singular} other {This is plural}}',
            highlight: 'Target: {count, plural, one {Dies ist einzigartig} other {Dies ist mehrerartig}<e0></e0>',
            rule,
            locale: "de-DE",
            pathName: "a/b/c.xliff"
        });
        test.deepEqual(actual, expected);

        test.done();
    },

    testResourceICUPluralsMatchTranslatedCategories: function(test) {
        test.expect(2);

        const rule = new ResourceICUPlurals();
        test.ok(rule);

        const resource = new ResourceString({
            key: "plural.test",
            sourceLocale: "en-US",
            source: '{count, plural, one {This is singular} other {This is plural}}',
            targetLocale: "de-DE",
            target: "{count, plural, eins {Dies ist einzigartig} andere {Dies ist mehrerartig}}",
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });
        const expected = new Result({
            severity: "error",
            description: "Incorrect plural or select syntax in target string: SyntaxError: MISSING_OTHER_CLAUSE",
            id: "plural.test",
            source: '{count, plural, one {This is singular} other {This is plural}}',
            highlight: 'Target: {count, plural, eins {Dies ist einzigartig} andere {Dies ist mehrerartig}<e0>}</e0>',
            rule,
            locale: "de-DE",
            pathName: "a/b/c.xliff"
        });
        test.deepEqual(actual, expected);

        test.done();
    },

    testResourceICUPluralsMatchMissingCategoriesInTarget: function(test) {
        test.expect(2);

        const rule = new ResourceICUPlurals();
        test.ok(rule);

        const resource = new ResourceString({
            key: "plural.test",
            sourceLocale: "en-US",
            source: '{count, plural, one {This is singular} other {This is plural}}',
            targetLocale: "ru-RU",
            target: "{count, plural, one {Это единственное число} other {это множественное число}}",
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });
        const expected = new Result({
            severity: "error",
            description: "Missing plural categories in target string: few. Expecting these: one, few, other",
            id: "plural.test",
            source: '{count, plural, one {This is singular} other {This is plural}}',
            highlight: 'Target: {count, plural, one {Это единственное число} other {это множественное число}}<e0></e0>',
            rule,
            locale: "ru-RU",
            pathName: "a/b/c.xliff"
        });
        test.deepEqual(actual, expected);

        test.done();
    },

    testResourceICUPluralsMatchMissingCategoriesInSource: function(test) {
        test.expect(2);

        const rule = new ResourceICUPlurals();
        test.ok(rule);

        const resource = new ResourceString({
            key: "plural.test",
            sourceLocale: "en-US",
            source: '{count, plural, other {This is plural}}',
            targetLocale: "ru-RU",
            target: "{count, plural, one {Это единственное число} few {это множественное число} other {это множественное число}}",
            pathName: "a/b/c.xliff"
        });
        const actual = rule.match({
            locale: "ru-RU",
            file: "a/b/c.xliff"
        });
        // this rule does not test for problems in the source string
        test.ok(!actual);

        test.done();
    },

    testResourceICUPluralsMatchExtraCategoriesInTarget: function(test) {
        test.expect(2);

        const rule = new ResourceICUPlurals();
        test.ok(rule);

        const resource = new ResourceString({
            key: "plural.test",
            sourceLocale: "en-US",
            source: '{count, plural, one {This is singular} other {This is plural}}',
            targetLocale: "de-DE",
            target: "{count, plural, one {Dies ist einzigartig} few {This is few} other {Dies ist mehrerartig}}",
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });
        const expected = new Result({
            severity: "warning",
            description: "Extra plural categories in target string: few. Expecting only these: one, other",
            id: "plural.test",
            highlight: 'Target: {count, plural, one {Dies ist einzigartig} few {This is few} other {Dies ist mehrerartig}}<e0></e0>',
            rule,
            pathName: "a/b/c.xliff",
            locale: "de-DE",
            source: '{count, plural, one {This is singular} other {This is plural}}'
        });
        test.deepEqual(actual, expected);

        test.done();
    },

    testResourceICUPluralsMatchSameCategoriesInSourceAndTargetNoError: function(test) {
        test.expect(2);

        const rule = new ResourceICUPlurals();
        test.ok(rule);

        const resource = new ResourceString({
            key: "plural.test",
            sourceLocale: "en-US",
            source: '{count, plural, =1 {This is one} one {This is singular} other {This is plural}}',
            targetLocale: "de-DE",
            target: "{count, plural, =1 {Dies is eins} one {Dies ist einzigartig} other {Dies ist mehrerartig}}",
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });
        test.ok(!actual);

        test.done();
    },

    testResourceICUPluralsMatchTargetIsMissingCategoriesInTarget: function(test) {
        test.expect(2);

        const rule = new ResourceICUPlurals();
        test.ok(rule);

        const resource = new ResourceString({
            key: "plural.test",
            sourceLocale: "en-US",
            source: '{count, plural, =1 {This is one} one {This is singular} other {This is plural}}',
            targetLocale: "de-DE",
            target: "{count, plural, one {Dies ist einzigartig} other {Dies ist mehrerartig}}",
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });
        const expected = new Result({
            severity: "error",
            description: "Missing plural categories in target string: =1. Expecting these: one, other, =1",
            id: "plural.test",
            highlight: 'Target: {count, plural, one {Dies ist einzigartig} other {Dies ist mehrerartig}}<e0></e0>',
            rule,
            pathName: "a/b/c.xliff",
            locale: "de-DE",
            source: '{count, plural, =1 {This is one} one {This is singular} other {This is plural}}'
        });
        test.deepEqual(actual, expected);

        test.done();
    },

    testResourceICUPluralsMatchMissingCategoriesNested: function(test) {
        test.expect(2);

        const rule = new ResourceICUPlurals();
        test.ok(rule);

        const resource = new ResourceString({
            key: "plural.test",
            sourceLocale: "en-US",
            source: `{count, plural,
                one {
                    {total, plural,
                        one {There is {count} of {total} item available}
                        other {There is {count} of {total} items available}
                    }
                }
                other {
                    {total, plural,
                        one {There are {count} of {total} item available}
                        other {There are {count} of {total} items available}
                    }
                }
            }`,
            targetLocale: "ru-RU",
            target: `{count, plural,
                one {
                    {total, plural,
                        one {Есть {count} из {total} статьи}
                        few {Есть {count} из {total} статей}
                        other {Есть {count} из {total} статей}
                    }
                }
                few {
                    {total, plural,
                        one {Есть {count} из {total} статьи}
                        other {Есть {count} из {total} статей}
                    }
                }
                other {
                    {total, plural,
                        one {Есть {count} из {total} статьи}
                        few {Есть {count} из {total} статей}
                        other {Есть {count} из {total} статей}
                    }
                }
            }`,
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });
        const expected = new Result({
            severity: "error",
            description: "Missing plural categories in target string: few. Expecting these: one, few, other",
            id: "plural.test",
            highlight: 'Target: {count, plural,\n' +
                '                one {\n' +
                '                    {total, plural,\n' +
                '                        one {Есть {count} из {total} статьи}\n' +
                '                        few {Есть {count} из {total} статей}\n' +
                '                        other {Есть {count} из {total} статей}\n' +
                '                    }\n' +
                '                }\n' +
                '                few {\n' +
                '                    {total, plural,\n' +
                '                        one {Есть {count} из {total} статьи}\n' +
                '                        other {Есть {count} из {total} статей}\n' +
                '                    }\n' +
                '                }\n' +
                '                other {\n' +
                '                    {total, plural,\n' +
                '                        one {Есть {count} из {total} статьи}\n' +
                '                        few {Есть {count} из {total} статей}\n' +
                '                        other {Есть {count} из {total} статей}\n' +
                '                    }\n' +
                '                }\n' +
                '            }<e0></e0>',
            rule,
            pathName: "a/b/c.xliff",
            locale: "ru-RU",
            source: `{count, plural,
                one {
                    {total, plural,
                        one {There is {count} of {total} item available}
                        other {There is {count} of {total} items available}
                    }
                }
                other {
                    {total, plural,
                        one {There are {count} of {total} item available}
                        other {There are {count} of {total} items available}
                    }
                }
            }`
        });
        test.deepEqual(actual, expected);

        test.done();
    },

    testResourceICUPluralsMatchMultipleMissingCategoriesNested: function(test) {
        test.expect(2);

        const rule = new ResourceICUPlurals();
        test.ok(rule);

        const resource = new ResourceString({
            key: "plural.test",
            sourceLocale: "en-US",
            source: `{count, plural,
                one {
                    {total, plural,
                        one {There is {count} of {total} item available}
                        other {There is {count} of {total} items available}
                    }
                }
                other {
                    {total, plural,
                        one {There are {count} of {total} item available}
                        other {There are {count} of {total} items available}
                    }
                }
            }`,
            targetLocale: "ru-RU",
            target: `{count, plural,
                one {
                    {total, plural,
                        one {Есть {count} из {total} статьи}
                        few {Есть {count} из {total} статей}
                        other {Есть {count} из {total} статей}
                    }
                }
                few {
                    {total, plural,
                        one {Есть {count} из {total} статьи}
                        other {Есть {count} из {total} статей}
                    }
                }
                other {
                    {total, plural,
                        one {Есть {count} из {total} статьи}
                        other {Есть {count} из {total} статей}
                    }
                }
            }`,
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });
        const expected = [
            new Result({
                severity: "error",
                description: "Missing plural categories in target string: few. Expecting these: one, few, other",
                id: "plural.test",
                highlight: 'Target: {count, plural,\n' +
                    '                one {\n' +
                    '                    {total, plural,\n' +
                    '                        one {Есть {count} из {total} статьи}\n' +
                    '                        few {Есть {count} из {total} статей}\n' +
                    '                        other {Есть {count} из {total} статей}\n' +
                    '                    }\n' +
                    '                }\n' +
                    '                few {\n' +
                    '                    {total, plural,\n' +
                    '                        one {Есть {count} из {total} статьи}\n' +
                    '                        other {Есть {count} из {total} статей}\n' +
                    '                    }\n' +
                    '                }\n' +
                    '                other {\n' +
                    '                    {total, plural,\n' +
                    '                        one {Есть {count} из {total} статьи}\n' +
                    '                        other {Есть {count} из {total} статей}\n' +
                    '                    }\n' +
                    '                }\n' +
                    '            }<e0></e0>',
                rule,
                pathName: "a/b/c.xliff",
                locale: "ru-RU",
                source: `{count, plural,
                one {
                    {total, plural,
                        one {There is {count} of {total} item available}
                        other {There is {count} of {total} items available}
                    }
                }
                other {
                    {total, plural,
                        one {There are {count} of {total} item available}
                        other {There are {count} of {total} items available}
                    }
                }
            }`
            }),
            new Result({
                severity: "error",
                description: "Missing plural categories in target string: few. Expecting these: one, few, other",
                id: "plural.test",
                highlight: 'Target: {count, plural,\n' +
                    '                one {\n' +
                    '                    {total, plural,\n' +
                    '                        one {Есть {count} из {total} статьи}\n' +
                    '                        few {Есть {count} из {total} статей}\n' +
                    '                        other {Есть {count} из {total} статей}\n' +
                    '                    }\n' +
                    '                }\n' +
                    '                few {\n' +
                    '                    {total, plural,\n' +
                    '                        one {Есть {count} из {total} статьи}\n' +
                    '                        other {Есть {count} из {total} статей}\n' +
                    '                    }\n' +
                    '                }\n' +
                    '                other {\n' +
                    '                    {total, plural,\n' +
                    '                        one {Есть {count} из {total} статьи}\n' +
                    '                        other {Есть {count} из {total} статей}\n' +
                    '                    }\n' +
                    '                }\n' +
                    '            }<e0></e0>',
                rule,
                pathName: "a/b/c.xliff",
                locale: "ru-RU",
                source: `{count, plural,
                one {
                    {total, plural,
                        one {There is {count} of {total} item available}
                        other {There is {count} of {total} items available}
                    }
                }
                other {
                    {total, plural,
                        one {There are {count} of {total} item available}
                        other {There are {count} of {total} items available}
                    }
                }
            }`
            }),
        ]
        test.deepEqual(actual, expected);

        test.done();
    }
};

