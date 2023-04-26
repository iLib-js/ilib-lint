/*
 * testResourceNoTranslation.js - test the built-in rules
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

import ResourceNoTranslation from '../src/rules/ResourceNoTranslation.js';

import { Result } from 'i18nlint-common';

export const testResourceNoTranslation = {
    testResourceNoTranslationNone: function(test) {
        test.expect(2);

        const rule = new ResourceNoTranslation();
        test.ok(rule);

        const actual = rule.match({
            locale: "de-DE",
            resource: new ResourceString({
                key: "translation.test",
                sourceLocale: "en-US",
                source: 'This is the source string.',
                pathName: "a/b/c.xliff",
                state: "new"
            }),
            file: "x/y"
        });
        const expected = new Result({
            severity: "warning",
            description: "Target string is the same as the source string. This is probably an untranslated resource.",
            id: "translation.test",
            highlight: 'Target: <e0></e0>',
            rule,
            pathName: "x/y",
            locale: "de-DE",
            source: 'This is the source string.'
        });
        test.deepEqual(actual, expected);

        test.done();
    },

    testResourceNoTranslationEmptyString: function(test) {
        test.expect(2);

        const rule = new ResourceNoTranslation();
        test.ok(rule);

        const actual = rule.match({
            locale: "de-DE",
            resource: new ResourceString({
                key: "translation.test",
                sourceLocale: "en-US",
                source: 'This is the source string.',
                targetLocale: "de-DE",
                target: "",
                pathName: "a/b/c.xliff",
                state: "new"
            }),
            file: "x/y"
        });
        const expected = new Result({
            severity: "warning",
            description: "Target string is the same as the source string. This is probably an untranslated resource.",
            id: "translation.test",
            highlight: 'Target: <e0></e0>',
            rule,
            pathName: "x/y",
            locale: "de-DE",
            source: 'This is the source string.'
        });
        test.deepEqual(actual, expected);

        test.done();
    },

    testResourceNoTranslationSameAsSource: function(test) {
        test.expect(2);

        const rule = new ResourceNoTranslation();
        test.ok(rule);

        const actual = rule.match({
            locale: "de-DE",
            resource: new ResourceString({
                key: "translation.test",
                sourceLocale: "en-US",
                source: 'This is the source string.',
                targetLocale: "de-DE",
                target: "This is the source string.",
                pathName: "a/b/c.xliff",
                state: "new"
            }),
            file: "x/y"
        });
        const expected = new Result({
            severity: "warning",
            description: "Target string is the same as the source string. This is probably an untranslated resource.",
            id: "translation.test",
            highlight: 'Target: <e0>This is the source string.</e0>',
            rule,
            pathName: "x/y",
            locale: "de-DE",
            source: 'This is the source string.'
        });
        test.deepEqual(actual, expected);

        test.done();
    },

    testResourceNoTranslationSameAsSourceDifferingInWhitespaceOnly: function(test) {
        test.expect(2);

        const rule = new ResourceNoTranslation();
        test.ok(rule);

        const actual = rule.match({
            locale: "de-DE",
            resource: new ResourceString({
                key: "translation.test",
                sourceLocale: "en-US",
                source: 'This is the source string.',
                targetLocale: "de-DE",
                target: "\nThis is \t the source string.   ",
                pathName: "a/b/c.xliff",
                state: "new"
            }),
            file: "x/y"
        });
        const expected = new Result({
            severity: "warning",
            description: "Target string is the same as the source string. This is probably an untranslated resource.",
            id: "translation.test",
            highlight: 'Target: <e0>\nThis is \t the source string.   </e0>',
            rule,
            pathName: "x/y",
            locale: "de-DE",
            source: 'This is the source string.'
        });
        test.deepEqual(actual, expected);

        test.done();
    },

    testResourceNoTranslationSameAsSourceDifferingInCaseOnly: function(test) {
        test.expect(2);

        const rule = new ResourceNoTranslation();
        test.ok(rule);

        const actual = rule.match({
            locale: "de-DE",
            resource: new ResourceString({
                key: "translation.test",
                sourceLocale: "en-US",
                source: 'This is the source string.',
                targetLocale: "de-DE",
                target: "This is the Source String.",
                pathName: "a/b/c.xliff",
                state: "new"
            }),
            file: "x/y"
        });
        const expected = new Result({
            severity: "warning",
            description: "Target string is the same as the source string. This is probably an untranslated resource.",
            id: "translation.test",
            highlight: 'Target: <e0>This is the Source String.</e0>',
            rule,
            pathName: "x/y",
            locale: "de-DE",
            source: 'This is the source string.'
        });
        test.deepEqual(actual, expected);

        test.done();
    },

    testResourceNoTranslationSameAsSourceButSourceLanguage: function(test) {
        test.expect(2);

        const rule = new ResourceNoTranslation();
        test.ok(rule);

        const actual = rule.match({
            locale: "de-DE",
            resource: new ResourceString({
                key: "translation.test",
                sourceLocale: "en-US",
                source: 'This is the source string.',
                targetLocale: "en-GB",
                target: "This is the source string.",
                pathName: "a/b/c.xliff",
                state: "new"
            }),
            file: "x/y"
        });

        // no results because the source and target both have the same
        // language, and it is very common for two dialects of a language
        // to use the same words
        test.ok(!actual);

        test.done();
    },

    testResourceNoTranslationThereIsTranslation: function(test) {
        test.expect(2);

        const rule = new ResourceNoTranslation();
        test.ok(rule);

        const actual = rule.match({
            locale: "de-DE",
            resource: new ResourceString({
                key: "translation.test",
                sourceLocale: "en-US",
                source: 'This is the source string.',
                pathName: "a/b/c.xliff",
                targetLocale: "de-DE",
                target: "Dies ist die Zielzeichenfolge.",
                state: "new"
            }),
            file: "x/y"
        });
        // text is different, so no problem here
        test.ok(!actual);

        test.done();
    },

    testResourceNoTranslationDNT: function(test) {
        test.expect(2);

        const rule = new ResourceNoTranslation();
        test.ok(rule);

        const actual = rule.match({
            locale: "de-DE",
            resource: new ResourceString({
                key: "translation.test",
                sourceLocale: "en-US",
                source: 'This is the source string.',
                dnt: true,
                targetLocale: "en-GB",
                target: "This is the source string.",
                pathName: "a/b/c.xliff",
                state: "new"
            }),
            file: "x/y"
        });

        // no results because the resource has the Do Not
        // Translate flag (dnt)
        test.ok(!actual);

        test.done();
    },

    testResourceNoTranslationSingleWordText1: function(test) {
        test.expect(2);

        const rule = new ResourceNoTranslation();
        test.ok(rule);

        const actual = rule.match({
            locale: "de-DE",
            resource: new ResourceString({
                key: "translation.test",
                sourceLocale: "en-US",
                source: 'this-is-kabab-text',
                targetLocale: "de-DE",
                target: "this-is-kabab-text",
                pathName: "a/b/c.xliff",
                state: "new"
            }),
            file: "x/y"
        });

        // no results because single-word text is automatically DNT
        test.ok(!actual);

        test.done();
    },

    testResourceNoTranslationSingleWordText2: function(test) {
        test.expect(2);

        const rule = new ResourceNoTranslation();
        test.ok(rule);

        const actual = rule.match({
            locale: "de-DE",
            resource: new ResourceString({
                key: "translation.test",
                sourceLocale: "en-US",
                source: 'test',
                targetLocale: "de-DE",
                target: "test",
                pathName: "a/b/c.xliff",
                state: "new"
            }),
            file: "x/y"
        });

        // no results because single word text is automatically DNT
        test.ok(!actual);

        test.done();
    }
};

