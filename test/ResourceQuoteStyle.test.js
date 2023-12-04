/*
 * ResourceQuoteStyle.test.js - test the rule that checks the quote style
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

describe("testResourceQuoteStyle", () => {
    test("ResourceQuoteStyle", () => {
        expect.assertions(1);

        const rule = new ResourceQuoteStyle();
        expect(rule).toBeTruthy();
    });

    test("ResourceQuoteStyleName", () => {
        expect.assertions(2);

        const rule = new ResourceQuoteStyle();
        expect(rule).toBeTruthy();

        expect(rule.getName()).toBe("resource-quote-style");
    });

    test("ResourceQuoteStyleDescription", () => {
        expect.assertions(2);

        const rule = new ResourceQuoteStyle();
        expect(rule).toBeTruthy();

        expect(rule.getDescription()).toBe("Ensure that the proper quote characters are used in translated resources");
    });

    test("ResourceQuoteStyleSourceLocale", () => {
        expect.assertions(2);

        const rule = new ResourceQuoteStyle({
            sourceLocale: "de-DE"
        });
        expect(rule).toBeTruthy();

        expect(rule.getSourceLocale()).toBe("de-DE");
    });

    test("ResourceQuoteStyleGetRuleType", () => {
        expect.assertions(2);

        const rule = new ResourceQuoteStyle({
            sourceLocale: "de-DE"
        });
        expect(rule).toBeTruthy();

        expect(rule.getRuleType()).toBe("resource");
    });

    test("ResourceQuoteStyleMatchSimpleNative", () => {
        expect.assertions(2);

        const rule = new ResourceQuoteStyle();
        expect(rule).toBeTruthy();

        const resource = new ResourceString({
            key: "quote.test",
            sourceLocale: "en-US",
            source: 'This string contains “quotes” in it.',
            targetLocale: "de-DE",
            target: "Diese Zeichenfolge enthält 'Anführungszeichen'.",
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "x"
        });
        // if the source contains native quotes, the target must too
        const expected = new Result({
            severity: "warning",
            description: "Quote style for the locale de-DE should be „text“",
            id: "quote.test",
            source: 'This string contains “quotes” in it.',
            highlight: 'Target: Diese Zeichenfolge enthält <e0>\'</e0>Anführungszeichen<e1>\'</e1>.',
            rule,
            locale: "de-DE",
            pathName: "x"
        });
        expect(actual).toStrictEqual(expected);
    });

    test("ResourceQuoteStyleMatchSimpleNativeLocaleOnlyOptions", () => {
        expect.assertions(2);

        const rule = new ResourceQuoteStyle({
            param: "localeOnly"
        });
        expect(rule).toBeTruthy();

        const resource = new ResourceString({
            key: "quote.test",
            sourceLocale: "en-US",
            source: 'This string contains “quotes” in it.',
            targetLocale: "de-DE",
            target: 'Diese Zeichenfolge enthält "Anführungszeichen".',
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "x"
        });
        // if the source contains native quotes, the target must too
        const expected = new Result({
            severity: "error",
            description: "Quote style for the locale de-DE should be „text“",
            id: "quote.test",
            source: 'This string contains “quotes” in it.',
            highlight: 'Target: Diese Zeichenfolge enthält <e0>"</e0>Anführungszeichen<e1>"</e1>.',
            rule,
            locale: "de-DE",
            pathName: "x"
        });
        expect(actual).toStrictEqual(expected);
    });

    test("ResourceQuoteStyleMatchAsciiToNative", () => {
        expect.assertions(2);

        const rule = new ResourceQuoteStyle();
        expect(rule).toBeTruthy();

        const resource = new ResourceString({
            key: "quote.test",
            sourceLocale: "en-US",
            source: 'This string contains "quotes" in it.',
            targetLocale: "de-DE",
            target: "Diese Zeichenfolge enthält „Anführungszeichen“.",
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "x"
        });
        // if the source contains ASCII quotes, the target is allowed to have native quotes
        expect(!actual).toBeTruthy();
    });

    test("ResourceQuoteStyleMatchAsciiToNativeRussian", () => {
        expect.assertions(2);

        const rule = new ResourceQuoteStyle();
        expect(rule).toBeTruthy();

        const resource = new ResourceString({
            key: "quote.test",
            sourceLocale: "en-US",
            source: 'Click on "My Documents" to see more',
            targetLocale: "ru-RU",
            target: "Click on «Мои документы» to see more",
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "x"
        });
        // if the source contains ASCII quotes, the target is allowed to have native quotes
        expect(!actual).toBeTruthy();
    });

    test("ResourceQuoteStyleMatchBeginEndOfWord", () => {
        expect.assertions(2);

        const rule = new ResourceQuoteStyle();
        expect(rule).toBeTruthy();

        const resource = new ResourceString({
            key: "quote.test",
            sourceLocale: "en-US",
            source: '"My Documents"',
            targetLocale: "ru-RU",
            target: "«Мои документы»",
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "x"
        });
        // if the source contains ASCII quotes, the target is allowed to have native quotes
        expect(!actual).toBeTruthy();
    });

    test("ResourceQuoteStyleMatchAsciiQuotes", () => {
        expect.assertions(2);

        const rule = new ResourceQuoteStyle();
        expect(rule).toBeTruthy();

        const resource = new ResourceString({
            key: "quote.test",
            sourceLocale: "en-US",
            source: 'This string contains "quotes" in it.',
            targetLocale: "de-DE",
            target: 'Diese Zeichenfolge enthält "Anführungszeichen".',
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });
        expect(!actual).toBeTruthy();
    });

    test("ResourceQuoteStyleMatchAsciiQuotesMismatch", () => {
        expect.assertions(2);

        const rule = new ResourceQuoteStyle();
        expect(rule).toBeTruthy();

        const resource = new ResourceString({
            key: "quote.test",
            sourceLocale: "en-US",
            source: 'This string contains "quotes" in it.',
            targetLocale: "de-DE",
            target: "Diese Zeichenfolge enthält 'Anführungszeichen'.",
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });
        // if the source contains ascii quotes, the target should match
        const expected = new Result({
            severity: "warning",
            description: "Quote style for the locale de-DE should be „text“",
            id: "quote.test",
            source: 'This string contains "quotes" in it.',
            highlight: "Target: Diese Zeichenfolge enthält <e0>'</e0>Anführungszeichen<e1>'</e1>.",
            rule,
            locale: "de-DE",
            pathName: "a/b/c.xliff"
        });
        expect(actual).toStrictEqual(expected);
    });

    test("ResourceQuoteStyleMatchAsciiQuotesDutch", () => {
        expect.assertions(2);

        const rule = new ResourceQuoteStyle();
        expect(rule).toBeTruthy();

        const resource = new ResourceString({
            key: "quote.test",
            sourceLocale: "en-US",
            source: 'This string contains "quotes" in it.',
            targetLocale: "nl-NL",
            target: "Deze string bevat ‘aanhalingstekens’.",
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });
        expect(!actual).toBeTruthy();
    });

    test("ResourceQuoteStyleMatchAlternate", () => {
        expect.assertions(2);

        const rule = new ResourceQuoteStyle();
        expect(rule).toBeTruthy();

        const resource = new ResourceString({
            key: "quote.test",
            sourceLocale: "en-US",
            source: 'This string contains ‘quotes’ in it.',
            targetLocale: "de-DE",
            target: "Diese Zeichenfolge enthält 'Anführungszeichen'.",
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b"
        });
        const expected = new Result({
            severity: "warning",
            description: "Quote style for the locale de-DE should be ‚text‘",
            id: "quote.test",
            source: "This string contains ‘quotes’ in it.",
            highlight: 'Target: Diese Zeichenfolge enthält <e0>\'</e0>Anführungszeichen<e1>\'</e1>.',
            rule,
            locale: "de-DE",
            pathName: "a/b"
        });

        expect(actual).toStrictEqual(expected);
    });

    test("ResourceQuoteStyleMatchSimpleNoError", () => {
        expect.assertions(2);

        const rule = new ResourceQuoteStyle();
        expect(rule).toBeTruthy();

        const resource = new ResourceString({
            key: "quote.test",
            sourceLocale: "en-US",
            source: 'This string contains "quotes" in it.',
            targetLocale: "de-DE",
            target: "Diese Zeichenfolge enthält „Anführungszeichen“.",
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });
        expect(!actual).toBeTruthy();
    });

    test("ResourceQuoteStyleMatchNoQuotesNoError", () => {
        expect.assertions(2);

        const rule = new ResourceQuoteStyle();
        expect(rule).toBeTruthy();

        const resource = new ResourceString({
            key: "quote.test",
            sourceLocale: "en-US",
            source: 'This string contains quotes in it.',
            targetLocale: "de-DE",
            target: "Diese Zeichenfolge enthält Anführungszeichen.",
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });
        expect(!actual).toBeTruthy();
    });

    test("ResourceQuoteStyleFrenchGuillemets", () => {
        expect.assertions(2);

        const rule = new ResourceQuoteStyle();
        expect(rule).toBeTruthy();

        const resource = new ResourceString({
            key: "quote.test",
            sourceLocale: "en-US",
            source: 'This string contains "quotes" in it.',
            targetLocale: "fr-FR",
            target: "Le string contient de «guillemets».",
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });
        expect(!actual).toBeTruthy();
    });

    test("ResourceQuoteStyleFrenchGuillemetsWithSpace", () => {
        expect.assertions(2);

        const rule = new ResourceQuoteStyle();
        expect(rule).toBeTruthy();

        const resource = new ResourceString({
            key: "quote.test",
            sourceLocale: "en-US",
            source: 'This string contains "quotes" in it.',
            targetLocale: "fr-FR",
            target: "Le string contient de « guillemets ».",
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });
        expect(!actual).toBeTruthy();
    });

    test("ResourceQuoteStyleFrenchGuillemetsWithNoBreakSpace", () => {
        expect.assertions(2);

        const rule = new ResourceQuoteStyle();
        expect(rule).toBeTruthy();

        const resource = new ResourceString({
            key: "quote.test",
            sourceLocale: "en-US",
            source: 'This string contains "quotes" in it.',
            targetLocale: "fr-FR",
            target: "Le string contient de « guillemets ».",
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });
        expect(!actual).toBeTruthy();
    });

    test("ResourceQuoteStyleItalianGuillemets", () => {
        expect.assertions(2);

        const rule = new ResourceQuoteStyle();
        expect(rule).toBeTruthy();

        const resource = new ResourceString({
            key: "quote.test",
            sourceLocale: "en-US",
            source: 'This string contains "quotes" in it.',
            targetLocale: "it-IT",
            target: 'Questa stringa contiene «virgolette».',
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });
        expect(!actual).toBeTruthy();
    });

    test("ResourceQuoteStyleItalianNoGuillemets", () => {
        expect.assertions(2);

        const rule = new ResourceQuoteStyle();
        expect(rule).toBeTruthy();

        const resource = new ResourceString({
            key: "quote.test",
            sourceLocale: "en-US",
            source: 'This string contains "quotes" in it.',
            targetLocale: "it-IT",
            target: 'Questa stringa contiene "virgolette".',
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });
        expect(!actual).toBeTruthy();
    });


    test("ResourceQuoteStyleMatchQuotesInTargetOnly", () => {
        expect.assertions(2);

        const rule = new ResourceQuoteStyle();
        expect(rule).toBeTruthy();

        const resource = new ResourceString({
            key: "quote.test",
            sourceLocale: "en-US",
            source: 'This string contains quotes in it.',
            targetLocale: "de-DE",
            target: "Diese Zeichenfolge enthält „Anführungszeichen“.",
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });
        expect(!actual).toBeTruthy();
    });

    test("ResourceQuoteStyleMatchAlternateNoError", () => {
        expect.assertions(2);

        const rule = new ResourceQuoteStyle();
        expect(rule).toBeTruthy();

        const resource = new ResourceString({
            key: "quote.test",
            sourceLocale: "en-US",
            source: 'This string contains ‘quotes’ in it.',
            targetLocale: "de-DE",
            target: "Diese Zeichenfolge enthält ‚Anführungszeichen‘.",
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });
        expect(!actual).toBeTruthy();
    });

    test("ResourceQuoteStyleDontMatchApostrophes", () => {
        expect.assertions(2);

        const rule = new ResourceQuoteStyle();
        expect(rule).toBeTruthy();

        const resource = new ResourceString({
            key: "quote.test",
            sourceLocale: "en-US",
            source: "This string doesn't contain quotes in it.",
            targetLocale: "de-DE",
            target: "Diese Zeichenfolge enthält nicht Anführungszeichen.",
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });
        expect(!actual).toBeTruthy();
    });

    test("ResourceQuoteStyleDontMatchMultipleApostrophes", () => {
        expect.assertions(2);

        const rule = new ResourceQuoteStyle();
        expect(rule).toBeTruthy();

        const resource = new ResourceString({
            key: "quote.test",
            sourceLocale: "en-US",
            source: "This string doesn't contain quotes in it. The user's keyboard is working",
            targetLocale: "de-DE",
            target: "Diese Zeichenfolge enthält nicht Anführungszeichen. Der Tastenbord des Users funktioniert.",
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });
        expect(!actual).toBeTruthy();
    });

    test("ResourceQuoteStyleApostropheInTarget", () => {
        expect.assertions(2);

        const rule = new ResourceQuoteStyle();
        expect(rule).toBeTruthy();

        const resource = new ResourceString({
            key: "quote.test",
            sourceLocale: "en-US",
            source: 'This string contains "quotes" in it.',
            targetLocale: "fr-FR",
            target: "L'expression contient de «guillemets». C'est tres bizarre !",
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });
        expect(!actual).toBeTruthy();
    });

    test("ResourceQuoteStyleApostropheInTargetSpace", () => {
        expect.assertions(2);

        const rule = new ResourceQuoteStyle();
        expect(rule).toBeTruthy();

        const resource = new ResourceString({
            key: "quote.test",
            sourceLocale: "en-US",
            source: 'This string contains "quotes" in it.',
            targetLocale: "fr-FR",
            target: "L'expression contient de « guillemets ». C'est tres bizarre !",
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });
        expect(!actual).toBeTruthy();
    });

    test("ResourceQuoteStyleApostropheInTargetWithNBSpace", () => {
        expect.assertions(2);

        const rule = new ResourceQuoteStyle();
        expect(rule).toBeTruthy();

        const resource = new ResourceString({
            key: "quote.test",
            sourceLocale: "en-US",
            source: 'This string contains "quotes" in it.',
            targetLocale: "fr-FR",
            target: "L'expression contient de « guillemets ». C'est tres bizarre !",
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });
        expect(!actual).toBeTruthy();
    });

    test("ResourceQuoteStyleQuoteApostropheInTargetNoneInSource", () => {
        expect.assertions(2);

        const rule = new ResourceQuoteStyle();
        expect(rule).toBeTruthy();

        const resource = new ResourceString({
            key: "quote.test",
            sourceLocale: "en-US",
            source: 'This string does not contain quotes in it.',
            targetLocale: "fr-FR",
            target: "L'expression ne contient pas de guillemets.",
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });
        expect(!actual).toBeTruthy();
    });

    test("ResourceQuoteStyleRegularApostropheInTargetNoneInSource", () => {
        expect.assertions(2);

        const rule = new ResourceQuoteStyle();
        expect(rule).toBeTruthy();

        const resource = new ResourceString({
            key: "quote.test",
            sourceLocale: "en-US",
            source: 'This string does not contain quotes in it.',
            targetLocale: "fr-FR",
            target: "L’expression ne contient pas de guillemets.",
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });
        expect(!actual).toBeTruthy();
    });

    test("ResourceQuoteStyleIgnoreQuoteAsApostropheInSource", () => {
        expect.assertions(2);

        const rule = new ResourceQuoteStyle();
        expect(rule).toBeTruthy();

        const resource = new ResourceString({
            key: "quote.test",
            sourceLocale: "en-US",
            source: "This string's contents do not contain quotes in it.",
            targetLocale: "fr-FR",
            target: "L'expression ne contient pas de guillemets.",
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });
        expect(!actual).toBeTruthy();
    });

    test("ResourceQuoteStyleIgnoreRegularApostropheInSource", () => {
        expect.assertions(2);

        const rule = new ResourceQuoteStyle();
        expect(rule).toBeTruthy();

        const resource = new ResourceString({
            key: "quote.test",
            sourceLocale: "en-US",
            source: "This string’s contents do not contain quotes in it.",
            targetLocale: "fr-FR",
            target: "L'expression ne contient pas de guillemets.",
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });
        expect(!actual).toBeTruthy();
    });

    test("ResourceQuoteStyleIgnoreRegularApostropheInTarget", () => {
        expect.assertions(2);

        const rule = new ResourceQuoteStyle();
        expect(rule).toBeTruthy();

        const resource = new ResourceString({
            key: "quote.test",
            sourceLocale: "en-US",
            source: "This string’s contents do not contain quotes in it.",
            targetLocale: "fr-FR",
            target: "L’expression ne contient pas de guillemets.",
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });
        expect(!actual).toBeTruthy();
    });

    test("ResourceQuoteStyleIgnoreSApostropheInSource", () => {
        expect.assertions(2);

        const rule = new ResourceQuoteStyle();
        expect(rule).toBeTruthy();

        const resource = new ResourceString({
            key: "quote.test",
            sourceLocale: "en-US",
            source: "These strings' contents do not contain quotes in it.",
            targetLocale: "fr-FR",
            target: "L'expressions ne contient pas de guillemets.",
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });
        expect(!actual).toBeTruthy();
    });

    test("ResourceQuoteStyleIgnoreMissingSwedishQuotes", () => {
        expect.assertions(2);

        const rule = new ResourceQuoteStyle();
        expect(rule).toBeTruthy();

        const actual = rule.match({
            locale: "sv-SE",
            resource: new ResourceString({
                key: "quote.test",
                sourceLocale: "en-US",
                source: `This is a "string."`,
                targetLocale: "sv-SE",
                target: "Det här är ett snöre.",
                pathName: "a/b/c.xliff"
            }),
            file: "x/y"
        });
        expect(!actual).toBeTruthy();
    });

    test("ResourceQuoteStyleSourceOnlyResource", () => {
        expect.assertions(2);

        const rule = new ResourceQuoteStyle();
        expect(rule).toBeTruthy();

        const resource = new ResourceString({
            key: "quote.test",
            sourceLocale: "en-US",
            source: "These 'strings' contents do not contain quotes in it.",
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });
        expect(!actual).toBeTruthy();
    });
});

