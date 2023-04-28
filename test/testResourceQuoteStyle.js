/*
 * testResourceQuoteStyle.js - test the rule that checks the quote style
 * of the translations
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
import { ResourceString } from 'ilib-tools-common';

import ResourceQuoteStyle from "../src/rules/ResourceQuoteStyle.js";

import { Result } from 'i18nlint-common';

export const testResourceQuoteStyle = {
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
                source: 'This string contains "quotes" in it.',
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
                target: 'Diese Zeichenfolge enthält "Anführungszeichen".',
                pathName: "a/b/c.xliff"
            }),
            file: "x/y"
        });
        test.ok(!actual);

        test.done();
    },

    testResourceQuoteStyleMatchAsciiQuotesMismatch: function(test) {
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
        // if the source contains ascii quotes, the target should match
        const expected = new Result({
            severity: "warning",
            description: "Quote style for the the locale de-DE should be „text“",
            id: "quote.test",
            source: 'This string contains "quotes" in it.',
            highlight: "Target: Diese Zeichenfolge enthält <e0>'</e0>Anführungszeichen<e0>'</e0>.",
            rule,
            pathName: "x/y"
        });
        test.deepEqual(actual, expected);

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
            description: "Quote style for the the locale de-DE should be ‚text‘",
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

    testResourceQuoteStyleFrenchGuillemets: function(test) {
        test.expect(2);

        const rule = new ResourceQuoteStyle();
        test.ok(rule);

        const actual = rule.match({
            locale: "fr-FR",
            resource: new ResourceString({
                key: "quote.test",
                sourceLocale: "en-US",
                source: 'This string contains "quotes" in it.',
                targetLocale: "fr-FR",
                target: "Le string contient de «guillemets».",
                pathName: "a/b/c.xliff"
            }),
            file: "x/y"
        });
        test.ok(!actual);

        test.done();
    },

    testResourceQuoteStyleFrenchGuillemetsWithSpace: function(test) {
        test.expect(2);

        const rule = new ResourceQuoteStyle();
        test.ok(rule);

        const actual = rule.match({
            locale: "fr-FR",
            resource: new ResourceString({
                key: "quote.test",
                sourceLocale: "en-US",
                source: 'This string contains "quotes" in it.',
                targetLocale: "fr-FR",
                target: "Le string contient de « guillemets ».",
                pathName: "a/b/c.xliff"
            }),
            file: "x/y"
        });
        test.ok(!actual);

        test.done();
    },

    testResourceQuoteStyleFrenchGuillemetsWithNoBreakSpace: function(test) {
        test.expect(2);

        const rule = new ResourceQuoteStyle();
        test.ok(rule);

        const actual = rule.match({
            locale: "fr-FR",
            resource: new ResourceString({
                key: "quote.test",
                sourceLocale: "en-US",
                source: 'This string contains "quotes" in it.',
                targetLocale: "fr-FR",
                target: "Le string contient de « guillemets ».",
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

    testResourceQuoteStyleApostropheInTarget: function(test) {
        test.expect(2);

        const rule = new ResourceQuoteStyle();
        test.ok(rule);

        const actual = rule.match({
            locale: "fr-FR",
            resource: new ResourceString({
                key: "quote.test",
                sourceLocale: "en-US",
                source: 'This string contains "quotes" in it.',
                targetLocale: "fr-FR",
                target: "L'expression contient de «guillemets». C'est tres bizarre !",
                pathName: "a/b/c.xliff"
            }),
            file: "x/y"
        });
        test.ok(!actual);

        test.done();
    },

    testResourceQuoteStyleApostropheInTargetSpace: function(test) {
        test.expect(2);

        const rule = new ResourceQuoteStyle();
        test.ok(rule);

        const actual = rule.match({
            locale: "fr-FR",
            resource: new ResourceString({
                key: "quote.test",
                sourceLocale: "en-US",
                source: 'This string contains "quotes" in it.',
                targetLocale: "fr-FR",
                target: "L'expression contient de « guillemets ». C'est tres bizarre !",
                pathName: "a/b/c.xliff"
            }),
            file: "x/y"
        });
        test.ok(!actual);

        test.done();
    },

    testResourceQuoteStyleApostropheInTargetSpace: function(test) {
        test.expect(2);

        const rule = new ResourceQuoteStyle();
        test.ok(rule);

        const actual = rule.match({
            locale: "fr-FR",
            resource: new ResourceString({
                key: "quote.test",
                sourceLocale: "en-US",
                source: 'This string contains "quotes" in it.',
                targetLocale: "fr-FR",
                target: "L'expression contient de « guillemets ». C'est tres bizarre !",
                pathName: "a/b/c.xliff"
            }),
            file: "x/y"
        });
        test.ok(!actual);

        test.done();
    },

    testResourceQuoteStyleQuoteApostropheInTargetNoneInSource: function(test) {
        test.expect(2);

        const rule = new ResourceQuoteStyle();
        test.ok(rule);

        const actual = rule.match({
            locale: "fr-FR",
            resource: new ResourceString({
                key: "quote.test",
                sourceLocale: "en-US",
                source: 'This string does not contain quotes in it.',
                targetLocale: "fr-FR",
                target: "L'expression ne contient pas de guillemets.",
                pathName: "a/b/c.xliff"
            }),
            file: "x/y"
        });
        test.ok(!actual);

        test.done();
    },

    testResourceQuoteStyleRegularApostropheInTargetNoneInSource: function(test) {
        test.expect(2);

        const rule = new ResourceQuoteStyle();
        test.ok(rule);

        const actual = rule.match({
            locale: "fr-FR",
            resource: new ResourceString({
                key: "quote.test",
                sourceLocale: "en-US",
                source: 'This string does not contain quotes in it.',
                targetLocale: "fr-FR",
                target: "L’expression ne contient pas de guillemets.",
                pathName: "a/b/c.xliff"
            }),
            file: "x/y"
        });
        test.ok(!actual);

        test.done();
    },

    testResourceQuoteStyleIgnoreQuoteAsApostropheInSource: function(test) {
        test.expect(2);

        const rule = new ResourceQuoteStyle();
        test.ok(rule);

        const actual = rule.match({
            locale: "fr-FR",
            resource: new ResourceString({
                key: "quote.test",
                sourceLocale: "en-US",
                source: "This string's contents do not contain quotes in it.",
                targetLocale: "fr-FR",
                target: "L'expression ne contient pas de guillemets.",
                pathName: "a/b/c.xliff"
            }),
            file: "x/y"
        });
        test.ok(!actual);

        test.done();
    },

    testResourceQuoteStyleIgnoreRegularApostropheInSource: function(test) {
        test.expect(2);

        const rule = new ResourceQuoteStyle();
        test.ok(rule);

        const actual = rule.match({
            locale: "fr-FR",
            resource: new ResourceString({
                key: "quote.test",
                sourceLocale: "en-US",
                source: "This string’s contents do not contain quotes in it.",
                targetLocale: "fr-FR",
                target: "L'expression ne contient pas de guillemets.",
                pathName: "a/b/c.xliff"
            }),
            file: "x/y"
        });
        test.ok(!actual);

        test.done();
    },

    testResourceQuoteStyleIgnoreRegularApostropheInTarget: function(test) {
        test.expect(2);

        const rule = new ResourceQuoteStyle();
        test.ok(rule);

        const actual = rule.match({
            locale: "fr-FR",
            resource: new ResourceString({
                key: "quote.test",
                sourceLocale: "en-US",
                source: "This string’s contents do not contain quotes in it.",
                targetLocale: "fr-FR",
                target: "L’expression ne contient pas de guillemets.",
                pathName: "a/b/c.xliff"
            }),
            file: "x/y"
        });
        test.ok(!actual);

        test.done();
    },

    testResourceQuoteStyleIgnoreSApostropheInSource: function(test) {
        test.expect(2);

        const rule = new ResourceQuoteStyle();
        test.ok(rule);

        const actual = rule.match({
            locale: "fr-FR",
            resource: new ResourceString({
                key: "quote.test",
                sourceLocale: "en-US",
                source: "These strings' contents do not contain quotes in it.",
                targetLocale: "fr-FR",
                target: "L'expressions ne contient pas de guillemets.",
                pathName: "a/b/c.xliff"
            }),
            file: "x/y"
        });
        test.ok(!actual);

        test.done();
    },
};

