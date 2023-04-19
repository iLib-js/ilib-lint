/*
 * testRules.js - test the built-in rules
 *
 * Copyright © 2022 JEDLSoft
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
import { ResourceString } from 'ilib-tools-common';

import ResourceQuoteStyle from '../src/rules/ResourceQuoteStyle.js';
import ResourceICUPlurals from '../src/rules/ResourceICUPlurals.js';
import ResourceStateChecker from '../src/rules/ResourceStateChecker.js';

import { Result } from 'i18nlint-common';

export const testRules = {
    testResourceQuoteStyle: function(test) {
        test.expect(1);

        const rule = new ResourceQuoteStyle();
        test.ok(rule);

        test.done();
    },

    testResourceQuoteStyleName: function(test) {
        test.expect(2);

        const rule = new ResourceQuoteStyle();
        test.ok(rule);

        test.equal(rule.getName(), "resource-quote-style");

        test.done();
    },

    testResourceQuoteStyleDescription: function(test) {
        test.expect(2);

        const rule = new ResourceQuoteStyle();
        test.ok(rule);

        test.equal(rule.getDescription(), "Ensure that the proper quote characters are used in translated resources");

        test.done();
    },

    testResourceQuoteStyleSourceLocale: function(test) {
        test.expect(2);

        const rule = new ResourceQuoteStyle({
            sourceLocale: "de-DE"
        });
        test.ok(rule);

        test.equal(rule.getSourceLocale(), "de-DE");

        test.done();
    },

    testResourceQuoteStyleGetRuleType: function(test) {
        test.expect(2);

        const rule = new ResourceQuoteStyle({
            sourceLocale: "de-DE"
        });
        test.ok(rule);

        test.equal(rule.getRuleType(), "resource");

        test.done();
    },

    testResourceQuoteStyleMatchSimpleNative: function(test) {
        test.expect(2);

        const rule = new ResourceQuoteStyle();
        test.ok(rule);

        const actual = rule.match({
            locale: "de-DE",
            resource: new ResourceString({
                key: "quote.test",
                sourceLocale: "en-US",
                source: 'This string contains “quotes” in it.',
                targetLocale: "de-DE",
                target: "Diese Zeichenfolge enthält 'Anführungszeichen'.",
                pathName: "a/b/c.xliff"
            }),
            file: "x"
        });
        // if the source contains native quotes, the target must too
        const expected = new Result({
            severity: "warning",
            description: "Quote style for the the locale de-DE should be „text“",
            id: "quote.test",
            source: 'This string contains “quotes” in it.',
            highlight: 'Target: Diese Zeichenfolge enthält <e0>\'</e0>Anführungszeichen<e0>\'</e0>.',
            rule,
            pathName: "x"
        });
        test.deepEqual(actual, expected);

        test.done();
    },

    testResourceQuoteStyleMatchSimpleNativeLocaleOnlyOptions: function(test) {
        test.expect(2);

        const rule = new ResourceQuoteStyle({
            param: "localeOnly"
        });
        test.ok(rule);

        const actual = rule.match({
            locale: "de-DE",
            resource: new ResourceString({
                key: "quote.test",
                sourceLocale: "en-US",
                source: 'This string contains “quotes” in it.',
                targetLocale: "de-DE",
                target: 'Diese Zeichenfolge enthält "Anführungszeichen".',
                pathName: "a/b/c.xliff"
            }),
            file: "x"
        });
        // if the source contains native quotes, the target must too
        const expected = new Result({
            severity: "error",
            description: "Quote style for the the locale de-DE should be „text“",
            id: "quote.test",
            source: 'This string contains “quotes” in it.',
            highlight: 'Target: Diese Zeichenfolge enthält <e0>"</e0>Anführungszeichen<e0>"</e0>.',
            rule,
            pathName: "x"
        });
        test.deepEqual(actual, expected);

        test.done();
    },

    testResourceQuoteStyleMatchAsciiToNative: function(test) {
        test.expect(2);

        const rule = new ResourceQuoteStyle();
        test.ok(rule);

        const actual = rule.match({
            locale: "de-DE",
            resource: new ResourceString({
                key: "quote.test",
                sourceLocale: "en-US",
                source: "This string contains 'quotes' in it.",
                targetLocale: "de-DE",
                target: "Diese Zeichenfolge enthält „Anführungszeichen“.",
                pathName: "a/b/c.xliff"
            }),
            file: "x"
        });
        // if the source contains ASCII quotes, the target is allowed to have native quotes
        test.ok(!actual);

        test.done();
    },

    testResourceQuoteStyleMatchAsciiToNativeRussian: function(test) {
        test.expect(2);

        const rule = new ResourceQuoteStyle();
        test.ok(rule);

        const actual = rule.match({
            locale: "ru-RU",
            resource: new ResourceString({
                key: "quote.test",
                sourceLocale: "en-US",
                source: 'Click on "My Documents" to see more',
                targetLocale: "ru-RU",
                target: "Click on «Мои документы» to see more",
                pathName: "a/b/c.xliff"
            }),
            file: "x"
        });
        // if the source contains ASCII quotes, the target is allowed to have native quotes
        test.ok(!actual);

        test.done();
    },

    testResourceQuoteStyleMatchBeginEndOfWord: function(test) {
        test.expect(2);

        const rule = new ResourceQuoteStyle();
        test.ok(rule);

        const actual = rule.match({
            locale: "ru-RU",
            resource: new ResourceString({
                key: "quote.test",
                sourceLocale: "en-US",
                source: '"My Documents"',
                targetLocale: "ru-RU",
                target: "«Мои документы»",
                pathName: "a/b/c.xliff"
            }),
            file: "x"
        });
        // if the source contains ASCII quotes, the target is allowed to have native quotes
        test.ok(!actual);

        test.done();
    },

    testResourceQuoteStyleMatchAsciiQuotes: function(test) {
        test.expect(2);

        const rule = new ResourceQuoteStyle();
        test.ok(rule);

        const actual = rule.match({
            locale: "de-DE",
            resource: new ResourceString({
                key: "quote.test",
                sourceLocale: "en-US",
                source: 'This string contains "quotes" in it.',
                targetLocale: "de-DE",
                target: "Diese Zeichenfolge enthält 'Anführungszeichen'.",
                pathName: "a/b/c.xliff"
            }),
            file: "x/y"
        });
        test.ok(!actual);

        test.done();
    },

    testResourceQuoteStyleMatchAlternate: function(test) {
        test.expect(2);

        const rule = new ResourceQuoteStyle();
        test.ok(rule);

        const actual = rule.match({
            locale: "de-DE",
            resource: new ResourceString({
                key: "quote.test",
                sourceLocale: "en-US",
                source: 'This string contains ‘quotes’ in it.',
                targetLocale: "de-DE",
                target: "Diese Zeichenfolge enthält 'Anführungszeichen'.",
                pathName: "a/b/c.xliff"
            }),
            file: "a/b"
        });
        const expected = new Result({
            severity: "warning",
            description: "Quote style for the the locale de-DE should be „text“",
            id: "quote.test",
            source: "This string contains ‘quotes’ in it.",
            highlight: 'Target: Diese Zeichenfolge enthält <e0>\'</e0>Anführungszeichen<e0>\'</e0>.',
            rule,
            pathName: "a/b"
        });

        test.deepEqual(actual, expected);

        test.done();
    },

    testResourceQuoteStyleMatchSimpleNoError: function(test) {
        test.expect(2);

        const rule = new ResourceQuoteStyle();
        test.ok(rule);

        const actual = rule.match({
            locale: "de-DE",
            resource: new ResourceString({
                key: "quote.test",
                sourceLocale: "en-US",
                source: 'This string contains "quotes" in it.',
                targetLocale: "de-DE",
                target: "Diese Zeichenfolge enthält „Anführungszeichen“.",
                pathName: "a/b/c.xliff"
            }),
            file: "x/y"
        });
        test.ok(!actual);

        test.done();
    },

    testResourceQuoteStyleMatchNoQuotesNoError: function(test) {
        test.expect(2);

        const rule = new ResourceQuoteStyle();
        test.ok(rule);

        const actual = rule.match({
            locale: "de-DE",
            resource: new ResourceString({
                key: "quote.test",
                sourceLocale: "en-US",
                source: 'This string contains quotes in it.',
                targetLocale: "de-DE",
                target: "Diese Zeichenfolge enthält Anführungszeichen.",
                pathName: "a/b/c.xliff"
            }),
            file: "x/y"
        });
        test.ok(!actual);

        test.done();
    },

    testResourceQuoteStyleMatchQuotesInTargetOnly: function(test) {
        test.expect(2);

        const rule = new ResourceQuoteStyle();
        test.ok(rule);

        const actual = rule.match({
            locale: "de-DE",
            resource: new ResourceString({
                key: "quote.test",
                sourceLocale: "en-US",
                source: 'This string contains quotes in it.',
                targetLocale: "de-DE",
                target: "Diese Zeichenfolge enthält „Anführungszeichen“.",
                pathName: "a/b/c.xliff"
            }),
            file: "x/y"
        });
        test.ok(!actual);

        test.done();
    },

    testResourceQuoteStyleMatchAlternateNoError: function(test) {
        test.expect(2);

        const rule = new ResourceQuoteStyle();
        test.ok(rule);

        const actual = rule.match({
            locale: "de-DE",
            resource: new ResourceString({
                key: "quote.test",
                sourceLocale: "en-US",
                source: 'This string contains ‘quotes’ in it.',
                targetLocale: "de-DE",
                target: "Diese Zeichenfolge enthält ‚Anführungszeichen‘.",
                pathName: "a/b/c.xliff"
            }),
            file: "x/y"
        });
        test.ok(!actual);

        test.done();
    },

    testResourceQuoteStyleDontMatchApostrophes: function(test) {
        test.expect(2);

        const rule = new ResourceQuoteStyle();
        test.ok(rule);

        const actual = rule.match({
            locale: "de-DE",
            resource: new ResourceString({
                key: "quote.test",
                sourceLocale: "en-US",
                source: "This string doesn't contain quotes in it.",
                targetLocale: "de-DE",
                target: "Diese Zeichenfolge enthält nicht Anführungszeichen.",
                pathName: "a/b/c.xliff"
            }),
            file: "x/y"
        });
        test.ok(!actual);

        test.done();
    },

    testResourceQuoteStyleDontMatchMultipleApostrophes: function(test) {
        test.expect(2);

        const rule = new ResourceQuoteStyle();
        test.ok(rule);

        const actual = rule.match({
            locale: "de-DE",
            resource: new ResourceString({
                key: "quote.test",
                sourceLocale: "en-US",
                source: "This string doesn't contain quotes in it. The user's keyboard is working",
                targetLocale: "de-DE",
                target: "Diese Zeichenfolge enthält nicht Anführungszeichen. Der Tastenbord des Users funktioniert.",
                pathName: "a/b/c.xliff"
            }),
            file: "x/y"
        });
        test.ok(!actual);

        test.done();
    },

    testResourceICUPluralsMatchNoError: function(test) {
        test.expect(2);

        const rule = new ResourceICUPlurals();
        test.ok(rule);

        const actual = rule.match({
            locale: "de-DE",
            resource: new ResourceString({
                key: "plural.test",
                sourceLocale: "en-US",
                source: '{count, plural, one {This is singular} other {This is plural}}',
                targetLocale: "de-DE",
                target: "{count, plural, one {Dies ist einzigartig} other {Dies ist mehrerartig}}",
                pathName: "a/b/c.xliff"
            }),
            file: "x/y"
        });
        test.ok(!actual);

        test.done();
    },

    testResourceICUPluralsMatchNestedNoError: function(test) {
        test.expect(2);

        const rule = new ResourceICUPlurals();
        test.ok(rule);

        const actual = rule.match({
            locale: "de-DE",
            resource: new ResourceString({
                key: "plural.test",
                sourceLocale: "en-US",
                source: '{count, plural, one {{total, plural, one {There is {count} of {total} item available} other {There is {count} of {total} items available}}} other {{total, plural, one {There are {count} of {total} item available} other {There are {count} of {total} items available}}}}',
                targetLocale: "de-DE",
                target: "{count, plural, one {{total, plural, one {Es gibt {count} von {total} Arkitel verfügbar} other {Es gibt {count} von {total} Arkitel verfügbar}}} other {{total, plural, one {Es gibt {count} von {total} Arkitel verfügbar} other {Es gibt {count} von {total} Arkitel verfügbar}}}}",
                pathName: "a/b/c.xliff"
            }),
            file: "x/y"
        });
        test.ok(!actual);

        test.done();
    },

    testResourceICUPluralsMatchNestedMultiLineNoError: function(test) {
        test.expect(2);

        const rule = new ResourceICUPlurals();
        test.ok(rule);

        const actual = rule.match({
            locale: "de-DE",
            resource: new ResourceString({
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
            }),
            file: "x/y"
        });
        test.ok(!actual);

        test.done();
    },

    testResourceICUPluralsMatchTooManyOpenBraces: function(test) {
        test.expect(2);

        const rule = new ResourceICUPlurals();
        test.ok(rule);

        const actual = rule.match({
            locale: "de-DE",
            resource: new ResourceString({
                key: "plural.test",
                sourceLocale: "en-US",
                source: '{count, plural, one {This is singular} other {This is plural}}',
                targetLocale: "de-DE",
                target: "{count, plural, one {{Dies ist einzigartig} other {Dies ist mehrerartig}}",
                pathName: "a/b/c.xliff"
            }),
            file: "x/y"
        });
        const expected = new Result({
            severity: "error",
            description: "Incorrect plural or select syntax in target string: SyntaxError: MALFORMED_ARGUMENT",
            id: "plural.test",
            source: '{count, plural, one {This is singular} other {This is plural}}',
            highlight: 'Target: {count, plural, one {{Dies <e0>ist einzigartig} other {Dies ist mehrerartig}}</e0>',
            rule,
            pathName: "x/y"
        });
        test.deepEqual(actual, expected);

        test.done();
    },

    testResourceICUPluralsMatchUnclosedOpenBraces: function(test) {
        test.expect(2);

        const rule = new ResourceICUPlurals();
        test.ok(rule);

        const actual = rule.match({
            locale: "de-DE",
            resource: new ResourceString({
                key: "plural.test",
                sourceLocale: "en-US",
                source: '{count, plural, one {This is singular} other {This is plural}}',
                targetLocale: "de-DE",
                target: "{count, plural, one {Dies ist einzigartig} other {Dies ist mehrerartig}",
                pathName: "a/b/c.xliff"
            }),
            file: "x/y"
        });
        const expected = new Result({
            severity: "error",
            description: "Incorrect plural or select syntax in target string: SyntaxError: EXPECT_ARGUMENT_CLOSING_BRACE",
            id: "plural.test",
            source: '{count, plural, one {This is singular} other {This is plural}}',
            highlight: 'Target: {count, plural, one {Dies ist einzigartig} other {Dies ist mehrerartig}<e0></e0>',
            rule,
            pathName: "x/y"
        });
        test.deepEqual(actual, expected);

        test.done();
    },

    testResourceICUPluralsMatchTranslatedCategories: function(test) {
        test.expect(2);

        const rule = new ResourceICUPlurals();
        test.ok(rule);

        const actual = rule.match({
            locale: "de-DE",
            resource: new ResourceString({
                key: "plural.test",
                sourceLocale: "en-US",
                source: '{count, plural, one {This is singular} other {This is plural}}',
                targetLocale: "de-DE",
                target: "{count, plural, eins {Dies ist einzigartig} andere {Dies ist mehrerartig}}",
                pathName: "a/b/c.xliff"
            }),
            file: "x/y"
        });
        const expected = new Result({
            severity: "error",
            description: "Incorrect plural or select syntax in target string: SyntaxError: MISSING_OTHER_CLAUSE",
            id: "plural.test",
            source: '{count, plural, one {This is singular} other {This is plural}}',
            highlight: 'Target: {count, plural, eins {Dies ist einzigartig} andere {Dies ist mehrerartig}<e0>}</e0>',
            rule,
            pathName: "x/y"
        });
        test.deepEqual(actual, expected);

        test.done();
    },

    testResourceICUPluralsMatchMissingCategoriesInTarget: function(test) {
        test.expect(2);

        const rule = new ResourceICUPlurals();
        test.ok(rule);

        const actual = rule.match({
            locale: "ru-RU",
            resource: new ResourceString({
                key: "plural.test",
                sourceLocale: "en-US",
                source: '{count, plural, one {This is singular} other {This is plural}}',
                targetLocale: "de-DE",
                target: "{count, plural, one {Это единственное число} other {это множественное число}}",
                pathName: "a/b/c.xliff"
            }),
            file: "x/y"
        });
        const expected = new Result({
            severity: "error",
            description: "Missing plural categories in target string: few. Expecting these: one, few, other",
            id: "plural.test",
            source: '{count, plural, one {This is singular} other {This is plural}}',
            highlight: 'Target: {count, plural, one {Это единственное число} other {это множественное число}}<e0></e0>',
            rule,
            pathName: "x/y"
        });
        test.deepEqual(actual, expected);

        test.done();
    },

    testResourceICUPluralsMatchMissingCategoriesInSource: function(test) {
        test.expect(2);

        const rule = new ResourceICUPlurals();
        test.ok(rule);

        const actual = rule.match({
            locale: "ru-RU",
            resource: new ResourceString({
                key: "plural.test",
                sourceLocale: "en-US",
                source: '{count, plural, other {This is plural}}',
                targetLocale: "de-DE",
                target: "{count, plural, one {Это единственное число} few {это множественное число} other {это множественное число}}",
                pathName: "a/b/c.xliff"
            }),
            file: "x/y"
        });
        // this rule does not test for problems in the source string
        test.ok(!actual);

        test.done();
    },

    testResourceICUPluralsMatchExtraCategoriesInTarget: function(test) {
        test.expect(2);

        const rule = new ResourceICUPlurals();
        test.ok(rule);

        const actual = rule.match({
            locale: "de-DE",
            resource: new ResourceString({
                key: "plural.test",
                sourceLocale: "en-US",
                source: '{count, plural, one {This is singular} other {This is plural}}',
                targetLocale: "de-DE",
                target: "{count, plural, one {Dies ist einzigartig} few {This is few} other {Dies ist mehrerartig}}",
                pathName: "a/b/c.xliff"
            }),
            file: "x/y"
        });
        const expected = new Result({
            severity: "warning",
            description: "Extra plural categories in target string: few. Expecting only these: one, other",
            id: "plural.test",
            highlight: 'Target: {count, plural, one {Dies ist einzigartig} few {This is few} other {Dies ist mehrerartig}}<e0></e0>',
            rule,
            pathName: "x/y",
            source: '{count, plural, one {This is singular} other {This is plural}}'
        });
        test.deepEqual(actual, expected);

        test.done();
    },

    testResourceICUPluralsMatchSameCategoriesInSourceAndTargetNoError: function(test) {
        test.expect(2);

        const rule = new ResourceICUPlurals();
        test.ok(rule);

        const actual = rule.match({
            locale: "de-DE",
            resource: new ResourceString({
                key: "plural.test",
                sourceLocale: "en-US",
                source: '{count, plural, =1 {This is one} one {This is singular} other {This is plural}}',
                targetLocale: "de-DE",
                target: "{count, plural, =1 {Dies is eins} one {Dies ist einzigartig} other {Dies ist mehrerartig}}",
                pathName: "a/b/c.xliff"
            }),
            file: "x/y"
        });
        test.ok(!actual);

        test.done();
    },

    testResourceICUPluralsMatchTargetIsMissingCategoriesInTarget: function(test) {
        test.expect(2);

        const rule = new ResourceICUPlurals();
        test.ok(rule);

        const actual = rule.match({
            locale: "de-DE",
            resource: new ResourceString({
                key: "plural.test",
                sourceLocale: "en-US",
                source: '{count, plural, =1 {This is one} one {This is singular} other {This is plural}}',
                targetLocale: "de-DE",
                target: "{count, plural, one {Dies ist einzigartig} other {Dies ist mehrerartig}}",
                pathName: "a/b/c.xliff"
            }),
            file: "x/y"
        });
        const expected = new Result({
            severity: "error",
            description: "Missing plural categories in target string: =1. Expecting these: one, other, =1",
            id: "plural.test",
            highlight: 'Target: {count, plural, one {Dies ist einzigartig} other {Dies ist mehrerartig}}<e0></e0>',
            rule,
            pathName: "x/y",
            source: '{count, plural, =1 {This is one} one {This is singular} other {This is plural}}'
        });
        test.deepEqual(actual, expected);

        test.done();
    },

    testResourceICUPluralsMatchMissingCategoriesNested: function(test) {
        test.expect(2);

        const rule = new ResourceICUPlurals();
        test.ok(rule);

        const actual = rule.match({
            locale: "ru-RU",
            resource: new ResourceString({
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
            }),
            file: "x/y"
        });
        const expected = new Result({
            severity: "error",
            description: "Missing plural categories in target string: few. Expecting these: one, few, other",
            id: "plural.test",
            highlight: 'Target: {count, plural,\n' +
                '                    one {\n' +
                '                        {total, plural,\n' +
                '                            one {Есть {count} из {total} статьи}\n' +
                '                            few {Есть {count} из {total} статей}\n' +
                '                            other {Есть {count} из {total} статей}\n' +
                '                        }\n' +
                '                    }\n' +
                '                    few {\n' +
                '                        {total, plural,\n' +
                '                            one {Есть {count} из {total} статьи}\n' +
                '                            other {Есть {count} из {total} статей}\n' +
                '                        }\n' +
                '                    }\n' +
                '                    other {\n' +
                '                        {total, plural,\n' +
                '                            one {Есть {count} из {total} статьи}\n' +
                '                            few {Есть {count} из {total} статей}\n' +
                '                            other {Есть {count} из {total} статей}\n' +
                '                        }\n' +
                '                    }\n' +
                '                }<e0></e0>',
            rule,
            pathName: "x/y",
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

        const actual = rule.match({
            locale: "ru-RU",
            resource: new ResourceString({
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
            }),
            file: "x/y"
        });
        const expected = [
            new Result({
                severity: "error",
                description: "Missing plural categories in target string: few. Expecting these: one, few, other",
                id: "plural.test",
                highlight: 'Target: {count, plural,\n' +
                    '                    one {\n' +
                    '                        {total, plural,\n' +
                    '                            one {Есть {count} из {total} статьи}\n' +
                    '                            few {Есть {count} из {total} статей}\n' +
                    '                            other {Есть {count} из {total} статей}\n' +
                    '                        }\n' +
                    '                    }\n' +
                    '                    few {\n' +
                    '                        {total, plural,\n' +
                    '                            one {Есть {count} из {total} статьи}\n' +
                    '                            other {Есть {count} из {total} статей}\n' +
                    '                        }\n' +
                    '                    }\n' +
                    '                    other {\n' +
                    '                        {total, plural,\n' +
                    '                            one {Есть {count} из {total} статьи}\n' +
                    '                            other {Есть {count} из {total} статей}\n' +
                    '                        }\n' +
                    '                    }\n' +
                    '                }<e0></e0>',
                rule,
                pathName: "x/y",
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
                    '                    one {\n' +
                    '                        {total, plural,\n' +
                    '                            one {Есть {count} из {total} статьи}\n' +
                    '                            few {Есть {count} из {total} статей}\n' +
                    '                            other {Есть {count} из {total} статей}\n' +
                    '                        }\n' +
                    '                    }\n' +
                    '                    few {\n' +
                    '                        {total, plural,\n' +
                    '                            one {Есть {count} из {total} статьи}\n' +
                    '                            other {Есть {count} из {total} статей}\n' +
                    '                        }\n' +
                    '                    }\n' +
                    '                    other {\n' +
                    '                        {total, plural,\n' +
                    '                            one {Есть {count} из {total} статьи}\n' +
                    '                            other {Есть {count} из {total} статей}\n' +
                    '                        }\n' +
                    '                    }\n' +
                    '                }<e0></e0>',
                rule,
                pathName: "x/y",
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
    },

    testResourceStateCheckerMatchNoError: function(test) {
        test.expect(2);

        const rule = new ResourceStateChecker({
            // all resources should have this state:
            param: "translated"
        });
        test.ok(rule);

        const actual = rule.match({
            locale: "de-DE",
            resource: new ResourceString({
                key: "plural.test",
                sourceLocale: "en-US",
                source: '{count, plural, one {This is singular} other {This is plural}}',
                targetLocale: "de-DE",
                target: "{count, plural, one {Dies ist einzigartig} other {Dies ist mehrerartig}}",
                pathName: "a/b/c.xliff",
                state: "translated"
            }),
            file: "x/y"
        });
        test.ok(!actual);

        test.done();
    },

    testResourceStateCheckerMatchArrayNoError: function(test) {
        test.expect(2);

        const rule = new ResourceStateChecker({
            // all resources should have this state:
            param: [ "translated", "needs-review" ]
        });
        test.ok(rule);

        const actual = rule.match({
            locale: "de-DE",
            resource: new ResourceString({
                key: "plural.test",
                sourceLocale: "en-US",
                source: '{count, plural, one {This is singular} other {This is plural}}',
                targetLocale: "de-DE",
                target: "{count, plural, one {Dies ist einzigartig} other {Dies ist mehrerartig}}",
                pathName: "a/b/c.xliff",
                state: "needs-review"
            }),
            file: "x/y"
        });
        test.ok(!actual);

        test.done();
    },

    testResourceStateCheckerMatchError: function(test) {
        test.expect(2);

        const rule = new ResourceStateChecker({
            // all resources should have this state:
            param: "translated"
        });
        test.ok(rule);

        const actual = rule.match({
            locale: "de-DE",
            resource: new ResourceString({
                key: "plural.test",
                sourceLocale: "en-US",
                source: '{count, plural, one {This is singular} other {This is plural}}',
                targetLocale: "de-DE",
                target: "{count, plural, one {Dies ist einzigartig} other {Dies ist mehrerartig}}",
                pathName: "a/b/c.xliff",
                state: "new"
            }),
            file: "x/y"
        });
        const expected = new Result({
            severity: "error",
            description: "Resources must have the following state: translated",
            id: "plural.test",
            highlight: 'Resource found with disallowed state: <e0>new</e0>',
            rule,
            pathName: "x/y",
            locale: "de-DE",
            source: '{count, plural, one {This is singular} other {This is plural}}'
        });
        test.deepEqual(actual, expected);

        test.done();
    },

    testResourceStateCheckerMatchArrayError: function(test) {
        test.expect(2);

        const rule = new ResourceStateChecker({
            // all resources should have this state:
            param: [ "translated", "needs-review" ]
        });
        test.ok(rule);

        const actual = rule.match({
            locale: "de-DE",
            resource: new ResourceString({
                key: "plural.test",
                sourceLocale: "en-US",
                source: '{count, plural, one {This is singular} other {This is plural}}',
                targetLocale: "de-DE",
                target: "{count, plural, one {Dies ist einzigartig} other {Dies ist mehrerartig}}",
                pathName: "a/b/c.xliff",
                state: "new"
            }),
            file: "x/y"
        });
        const expected = new Result({
            severity: "error",
            description: "Resources must have one of the following states: translated, needs-review",
            id: "plural.test",
            highlight: 'Resource found with disallowed state: <e0>new</e0>',
            rule,
            pathName: "x/y",
            locale: "de-DE",
            source: '{count, plural, one {This is singular} other {This is plural}}'
        });
        test.deepEqual(actual, expected);

        test.done();
    },

    testResourceStateCheckerMatchDefaultNoError: function(test) {
        test.expect(2);

        const rule = new ResourceStateChecker();
        test.ok(rule);

        const actual = rule.match({
            locale: "de-DE",
            resource: new ResourceString({
                key: "plural.test",
                sourceLocale: "en-US",
                source: '{count, plural, one {This is singular} other {This is plural}}',
                targetLocale: "de-DE",
                target: "{count, plural, one {Dies ist einzigartig} other {Dies ist mehrerartig}}",
                pathName: "a/b/c.xliff",
                state: "translated"
            }),
            file: "x/y"
        });
        test.ok(!actual);

        test.done();
    },

    testResourceStateCheckerMatchDefaultError: function(test) {
        test.expect(2);

        const rule = new ResourceStateChecker();
        test.ok(rule);

        const actual = rule.match({
            locale: "de-DE",
            resource: new ResourceString({
                key: "plural.test",
                sourceLocale: "en-US",
                source: '{count, plural, one {This is singular} other {This is plural}}',
                targetLocale: "de-DE",
                target: "{count, plural, one {Dies ist einzigartig} other {Dies ist mehrerartig}}",
                pathName: "a/b/c.xliff",
                state: "new"
            }),
            file: "x/y"
        });
        const expected = new Result({
            severity: "error",
            description: "Resources must have the following state: translated",
            id: "plural.test",
            highlight: 'Resource found with disallowed state: <e0>new</e0>',
            rule,
            pathName: "x/y",
            locale: "de-DE",
            source: '{count, plural, one {This is singular} other {This is plural}}'
        });
        test.deepEqual(actual, expected);

        test.done();
    }
};

