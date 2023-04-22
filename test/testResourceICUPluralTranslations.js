/*
 * testResourceICUPluralTranslations.js - test that the translations in
 * ICU/formatjs plurals are different than the source
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

import ResourceICUPluralTranslation from "../src/rules/ResourceICUPluralTranslation.js";

import { Result } from 'i18nlint-common';

export const testResourceICUPluralTranslation = {
    testResourceICUPluralTranslationsMatchNoError: function(test) {
        test.expect(2);

        const rule = new ResourceICUPluralTranslation();
        test.ok(rule);

        const actual = rule.match({
            locale: "de-DE",
            resource: new ResourceString({
                key: "plural.test",
                sourceLocale: "en-US",
                source: 'There {count, plural, one {is # file} other {are # files}} in the folder.',
                targetLocale: "de-DE",
                target: "Es {count, plural, one {gibt # Datei} other {gibt # Dateien}} in dem Ordner.",
                pathName: "a/b/c.xliff"
            }),
            file: "x/y"
        });
        test.ok(!actual);

        test.done();
    },

    testResourceICUPluralTranslationsMatchMissingTranslation: function(test) {
        test.expect(2);

        const rule = new ResourceICUPluralTranslation();
        test.ok(rule);

        const actual = rule.match({
            locale: "de-DE",
            resource: new ResourceString({
                key: "plural.test",
                sourceLocale: "en-US",
                source: 'There {count, plural, one {is # file} other {are # files}} in the folder.',
                targetLocale: "de-DE",
                target: "Es {count, plural, one {is # file} other {gibt # Dateien}} in dem Ordner.",
                pathName: "a/b/c.xliff"
            }),
            file: "x/y"
        });
        const expected = new Result({
            severity: "warning",
            description: "Plural category 'one' is the same as the source and does not seem to be translated.",
            id: "plural.test",
            highlight: '<e0>one {is # file}</e0>',
            rule,
            pathName: "x/y",
            locale: "de-DE",
            source: 'There {count, plural, one {is # file} other {are # files}} in the folder.'
        });
        test.deepEqual(actual, expected);

        test.done();
    },

    testResourceICUPluralTranslationsMatchMissingTranslationNestedLevel2: function(test) {
        test.expect(2);

        const rule = new ResourceICUPluralTranslation();
        test.ok(rule);

        const actual = rule.match({
            locale: "de-DE",
            resource: new ResourceString({
                key: "plural.test",
                sourceLocale: "en-US",
                source: 'There {count, plural, one {is # file and {num, number, currency/GBP} {num, selectordinal, one {first} two {second} other {nth}} {date, date, medium} {time, time, medium} {foo, select, male {male string} female {female string} other {other string}} <tagName> {folderCount, plural, one {{folderCount} folder} other {{folderCount} folders}} </tagName>} other {are # files and {folderCount, plural, one {{folderCount} folder} other {{folderCount} folders}}}} in the folder.',
                targetLocale: "de-DE",
                target: "Es {count, plural, one {gibt # Datei und {folderCount, plural, one {{folderCount} folder} other {{folderCount} folders}}} other {gibt # Dateien und {folderCount, plural, one {{folderCount} folder} other {{folderCount} folders}}}} in dem Ordner.",
                pathName: "a/b/c.xliff"
            }),
            file: "x/y"
        });
        const expected = new Result({
            severity: "warning",
            description: "Plural category 'one' is the same as the source and does not seem to be translated.",
            id: "plural.test",
            highlight: '<e0>one {is # file}</e0>',
            rule,
            pathName: "x/y",
            locale: "de-DE",
            source: 'There {count, plural, one {is # file} other {are # files}} in the folder.'
        });
        test.deepEqual(actual, expected);

        test.done();
    },

    testResourceICUPluralTranslationsMatchMissingTranslationNestedLevel1: function(test) {
        test.expect(2);

        const rule = new ResourceICUPluralTranslation();
        test.ok(rule);

        const actual = rule.match({
            locale: "de-DE",
            resource: new ResourceString({
                key: "plural.test",
                sourceLocale: "en-US",
                source: 'There {count, plural, one {is # file and {folderCount, plural, one {{folderCount} folder} other {{folderCount} folders}}} other {are # files and {folderCount, plural, one {{folderCount} folder} other {{folderCount} folders}}}} in the folder.',
                targetLocale: "de-DE",
                target: "Es {count, plural, one {is # file and {folderCount, plural, one {{folderCount} folder} other {{folderCount} folders}}} other {are # files and {folderCount, plural, one {{folderCount} folder} other {{folderCount} folders}}}} in dem Ordner.",
                pathName: "a/b/c.xliff"
            }),
            file: "x/y"
        });
        const expected = new Result({
            severity: "warning",
            description: "Plural category 'one' is the same as the source and does not seem to be translated.",
            id: "plural.test",
            highlight: '<e0>one {is # file}</e0>',
            rule,
            pathName: "x/y",
            locale: "de-DE",
            source: 'There {count, plural, one {is # file} other {are # files}} in the folder.'
        });
        test.deepEqual(actual, expected);

        test.done();
    },
};

