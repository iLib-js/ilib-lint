/*
 * testResourceMatcher.js - test the built-in regular-expression-based rules
 *
 * Copyright © 2022-2023 JEDLSoft
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
import { ResourceString, ResourceArray, ResourcePlural } from 'ilib-tools-common';

import ResourceMatcher from '../src/rules/ResourceMatcher.js';
import { regexRules } from '../src/PluginManager.js';

import { Result } from 'i18nlint-common';

function findRuleDefinition(name) {
    return regexRules.find(rule => rule.name === name);
}

export const testResourceMatcher = {
    testResourceMatcher: function(test) {
        test.expect(1);

        const rule = new ResourceMatcher(findRuleDefinition("resource-url-match"));
        test.ok(rule);

        test.done();
    },

    testResourceMatcherMissingName: function(test) {
        test.expect(1);

        test.throws(() => {
            const rule = new ResourceMatcher({
                description: "a",
                note: "b",
                regexps: [ "a" ]
            });
        });

        test.done();
    },

    testResourceMatcherMissingDescription: function(test) {
        test.expect(1);

        test.throws(() => {
            const rule = new ResourceMatcher({
                name: "a",
                note: "b",
                regexps: [ "a" ]
            });
        });

        test.done();
    },

    testResourceMatcherMissingNote: function(test) {
        test.expect(1);

        test.throws(() => {
            const rule = new ResourceMatcher({
                name: "a",
                description: "a",
                regexps: [ "a" ]
            });
        });

        test.done();
    },

    testResourceMatcherMissingRegexps: function(test) {
        test.expect(1);

        test.throws(() => {
            const rule = new ResourceMatcher({
                name: "a",
                description: "a",
                note: "b"
            });
        });

        test.done();
    },

    testResourceURLMatch: function(test) {
        test.expect(2);

        const rule = new ResourceMatcher(findRuleDefinition("resource-url-match"));
        test.ok(rule);

        const actual = rule.match({
            locale: "de-DE",
            resource: new ResourceString({
                key: "url.test",
                sourceLocale: "en-US",
                source: 'This has an URL in it http://www.box.com',
                targetLocale: "de-DE",
                target: "Dies hat ein URL http://www.box.com",
                pathName: "a/b/c.xliff"
            }),
            file: "x/y"
        });
        test.ok(!actual);

        test.done();
    },

    testResourceURLMatchArray: function(test) {
        test.expect(2);

        const rule = new ResourceMatcher(findRuleDefinition("resource-url-match"));
        test.ok(rule);

        const actual = rule.match({
            locale: "de-DE",
            resource: new ResourceArray({
                key: "url.test",
                sourceLocale: "en-US",
                source: [
                    'This has an URL in it http://www.box.com'
                ],
                targetLocale: "de-DE",
                target: [
                    "Dies hat ein URL http://www.box.com"
                ],
                pathName: "a/b/c.xliff"
            }),
            file: "x/y"
        });
        test.ok(!actual);

        test.done();
    },

    testResourceURLMatchPlural: function(test) {
        test.expect(2);

        const rule = new ResourceMatcher(findRuleDefinition("resource-url-match"));
        test.ok(rule);

        const actual = rule.match({
            locale: "de-DE",
            resource: new ResourceArray({
                key: "url.test",
                sourceLocale: "en-US",
                source: {
                    one: 'This has an URL in it http://www.box.com',
                    other: "x"
                },
                targetLocale: "de-DE",
                target: {
                    one: "Dies hat ein URL http://www.box.com",
                    other: "y"
                },
                pathName: "a/b/c.xliff"
            }),
            file: "x/y"
        });
        test.ok(!actual);

        test.done();
    },

    testResourceURLMatchPluralTargetDoesNotUseCategory: function(test) {
        test.expect(2);

        const rule = new ResourceMatcher(findRuleDefinition("resource-url-match"));
        test.ok(rule);

        const actual = rule.match({
            locale: "de-DE",
            resource: new ResourceArray({
                key: "url.test",
                sourceLocale: "en-US",
                source: {
                    one: 'This has an URL in it http://www.box.com',
                    other: "x"
                },
                targetLocale: "ja-JP",
                target: {
                    other: "y"
                },
                pathName: "a/b/c.xliff"
            }),
            file: "x/y"
        });
        test.ok(!actual);

        test.done();
    },

    testResourceURLMatchMismatch: function(test) {
        test.expect(9);

        const rule = new ResourceMatcher(findRuleDefinition("resource-url-match"));
        test.ok(rule);

        const actual = rule.match({
            locale: "de-DE",
            resource: new ResourceString({
                key: "url.test",
                sourceLocale: "en-US",
                source: 'This has an URL in it http://www.box.com',
                targetLocale: "de-DE",
                target: "Dies hat ein URL http://www.yahoo.com",
                pathName: "a/b/c.xliff"
            }),
            file: "x/y"
        });
        test.ok(actual);
        test.equal(actual.length, 1);

        test.equal(actual[0].severity, "error");
        test.equal(actual[0].id, "url.test");
        test.equal(actual[0].description, "URL 'http://www.box.com' from the source string does not appear in the target string");
        test.equal(actual[0].highlight, "Target: Dies hat ein URL http://www.yahoo.com<e0></e0>");
        test.equal(actual[0].source, 'This has an URL in it http://www.box.com');
        test.equal(actual[0].pathName, "x/y");

        test.done();
    },

    testResourceURLMatchMismatchArray: function(test) {
        test.expect(9);

        const rule = new ResourceMatcher(findRuleDefinition("resource-url-match"));
        test.ok(rule);

        const actual = rule.match({
            locale: "de-DE",
            resource: new ResourceArray({
                key: "url.test",
                sourceLocale: "en-US",
                source: [
                    'This has an URL in it http://www.box.com',
                    'This also has an URL in it http://www.google.com'
                ],
                targetLocale: "de-DE",
                target: [
                    "Dies hat ein URL http://www.yahoo.com",
                    "Dies hat auch ein URL darin http://www.google.com"
                ],
                pathName: "a/b/c.xliff"
            }),
            file: "x/y"
        });
        test.ok(actual);
        test.equal(actual.length, 1);

        test.equal(actual[0].severity, "error");
        test.equal(actual[0].id, "url.test");
        test.equal(actual[0].description, "URL 'http://www.box.com' from the source string does not appear in the target string");
        test.equal(actual[0].highlight, "Target: Dies hat ein URL http://www.yahoo.com<e0></e0>");
        test.equal(actual[0].source, 'This has an URL in it http://www.box.com');
        test.equal(actual[0].pathName, "x/y");

        test.done();
    },

    testResourceURLMatchMismatchPlural: function(test) {
        test.expect(9);

        const rule = new ResourceMatcher(findRuleDefinition("resource-url-match"));
        test.ok(rule);

        const actual = rule.match({
            locale: "de-DE",
            resource: new ResourcePlural({
                key: "url.test",
                sourceLocale: "en-US",
                source: {
                    one: "This has an URL in it http://www.box.com",
                    other: "This also has an URL in it http://www.google.com"
                },
                targetLocale: "de-DE",
                target: {
                    one: "Dies hat ein URL http://www.yahoo.com",
                    other: "Dies hat auch ein URL darin http://www.google.com"
                },
                pathName: "a/b/c.xliff"
            }),
            file: "x/y"
        });
        test.ok(actual);
        test.equal(actual.length, 1);

        test.equal(actual[0].severity, "error");
        test.equal(actual[0].id, "url.test");
        test.equal(actual[0].description, "URL 'http://www.box.com' from the source string does not appear in the target string");
        test.equal(actual[0].highlight, "Target: Dies hat ein URL http://www.yahoo.com<e0></e0>");
        test.equal(actual[0].source, 'This has an URL in it http://www.box.com');
        test.equal(actual[0].pathName, "x/y");

        test.done();
    },

    testResourceURLMatchMultiple: function(test) {
        test.expect(2);

        const rule = new ResourceMatcher(findRuleDefinition("resource-url-match"));
        test.ok(rule);

        const actual = rule.match({
            locale: "de-DE",
            resource: new ResourceString({
                key: "url.test",
                sourceLocale: "en-US",
                source: 'This has a few URLs in it http://www.box.com http://www.google.com/',
                targetLocale: "de-DE",
                target: "Dies hat ein URL http://www.box.com http://www.google.com/",
                pathName: "a/b/c.xliff"
            }),
            file: "x/y"
        });
        test.ok(!actual);

        test.done();
    },

    testResourceURLMatchMultipleReverseOrder: function(test) {
        test.expect(2);

        const rule = new ResourceMatcher(findRuleDefinition("resource-url-match"));
        test.ok(rule);

        const actual = rule.match({
            locale: "de-DE",
            resource: new ResourceString({
                key: "url.test",
                sourceLocale: "en-US",
                source: 'This has a few URLs in it http://www.box.com http://www.google.com/',
                targetLocale: "de-DE",
                target: "Dies hat ein URL http://www.google.com/ http://www.box.com",
                pathName: "a/b/c.xliff"
            }),
            file: "x/y"
        });
        test.ok(!actual);

        test.done();
    },

    testResourceURLMatchMultipleMissing: function(test) {
        test.expect(3);

        const rule = new ResourceMatcher(findRuleDefinition("resource-url-match"));
        test.ok(rule);

        const actual = rule.match({
            locale: "de-DE",
            resource: new ResourceString({
                key: "url.test",
                sourceLocale: "en-US",
                source: 'This has a few URLs in it http://www.box.com http://www.google.com/',
                targetLocale: "de-DE",
                target: "Dies hat ein URL http://www.google.com/",
                pathName: "a/b/c.xliff"
            }),
            file: "x/y"
        });
        test.ok(actual);
        test.equal(actual.length, 1);

        test.done();
    },

    testResourceURLNonMatch1: function(test) {
        test.expect(2);

        const rule = new ResourceMatcher(findRuleDefinition("resource-url-match"));
        test.ok(rule);

        const actual = rule.match({
            locale: "de-DE",
            resource: new ResourceString({
                key: "url.test",
                sourceLocale: "en-US",
                source: 'Click on the menu choice "Open with..." to select a different program.',
                targetLocale: "de-DE",
                target: 'Klicken Sie auf die Menüauswahl "Öffnen mit...", um ein anderes Programm auszuwählen.',
                pathName: "a/b/c.xliff"
            }),
            file: "x/y"
        });
        test.ok(!actual);

        test.done();
    },

    testResourceURLNonMatch2: function(test) {
        test.expect(2);

        const rule = new ResourceMatcher(findRuleDefinition("resource-url-match"));
        test.ok(rule);

        const actual = rule.match({
            locale: "de-DE",
            resource: new ResourceString({
                key: "url.test",
                sourceLocale: "en-US",
                source: 'You can remove any of these to reset the association. (e.g. removing an association will allow you to use another acccount.)',
                targetLocale: "de-DE",
                target: 'Sie können diese entfernen, um die Zuordnung zurückzusetzen. (z.B. Wenn Sie eine Verknüpfung entfernen, können Sie ein anderes Konto verwenden.)',
                pathName: "a/b/c.xliff"
            }),
            file: "x/y"
        });
        test.ok(!actual);

        test.done();
    },

    testResourceNamedParamsMatch: function(test) {
        test.expect(9);

        const rule = new ResourceMatcher(findRuleDefinition("resource-named-params"));
        test.ok(rule);

        const actual = rule.match({
            locale: "de-DE",
            resource: new ResourceString({
                key: "url.test",
                sourceLocale: "en-US",
                source: 'This has an {URL} in it.',
                targetLocale: "de-DE",
                target: "Dies hat ein {job} drin.",
                pathName: "a/b/c.xliff"
            }),
            file: "x/y"
        });
        test.ok(actual);
        test.equal(actual.length, 1);

        test.equal(actual[0].severity, "error");
        test.equal(actual[0].id, "url.test");
        test.equal(actual[0].description, "The named parameter '{URL}' from the source string does not appear in the target string");
        test.equal(actual[0].highlight, "Target: Dies hat ein {job} drin.<e0></e0>");
        test.equal(actual[0].source, 'This has an {URL} in it.');
        test.equal(actual[0].pathName, "x/y");

        test.done();
    },

    testResourceNamedParamsNoMatch: function(test) {
        test.expect(2);

        const rule = new ResourceMatcher(findRuleDefinition("resource-named-params"));
        test.ok(rule);

        const actual = rule.match({
            locale: "de-DE",
            resource: new ResourceString({
                key: "url.test",
                sourceLocale: "en-US",
                source: 'This has an {job} in it.',
                targetLocale: "de-DE",
                target: "Dies hat ein {job} drin.",
                pathName: "a/b/c.xliff"
            }),
            file: "x/y"
        });
        test.ok(!actual);

        test.done();
    },

    testResourceNamedParamsNoMatchCapitals: function(test) {
        test.expect(2);

        const rule = new ResourceMatcher(findRuleDefinition("resource-named-params"));
        test.ok(rule);

        const actual = rule.match({
            locale: "de-DE",
            resource: new ResourceString({
                key: "url.test",
                sourceLocale: "en-US",
                source: 'This has an {URL} in it.',
                targetLocale: "de-DE",
                target: "Dies hat ein {URL} drin.",
                pathName: "a/b/c.xliff"
            }),
            file: "x/y"
        });
        test.ok(!actual);

        test.done();
    },

    testResourceNamedParamsMatch: function(test) {
        test.expect(9);

        const rule = new ResourceMatcher(findRuleDefinition("resource-named-params"));
        test.ok(rule);

        const actual = rule.match({
            locale: "de-DE",
            resource: new ResourceString({
                key: "url.test",
                sourceLocale: "en-US",
                source: 'This has an {URL} in it.',
                targetLocale: "de-DE",
                target: "Dies hat ein {job} drin.",
                pathName: "a/b/c.xliff"
            }),
            file: "x/y"
        });
        test.ok(actual);
        test.equal(actual.length, 1);

        test.equal(actual[0].severity, "error");
        test.equal(actual[0].id, "url.test");
        test.equal(actual[0].description, "The named parameter '{URL}' from the source string does not appear in the target string");
        test.equal(actual[0].highlight, "Target: Dies hat ein {job} drin.<e0></e0>");
        test.equal(actual[0].source, 'This has an {URL} in it.');
        test.equal(actual[0].pathName, "x/y");

        test.done();
    },

    testResourceNamedParamsNotInPlurals: function(test) {
        test.expect(2);

        const rule = new ResourceMatcher(findRuleDefinition("resource-named-params"));
        test.ok(rule);

        const actual = rule.match({
            locale: "de-DE",
            resource: new ResourceString({
                key: "url.test",
                sourceLocale: "en-US",
                source: 'In {number} {days, plural, one {day} other {days}}',
                targetLocale: "de-DE",
                target: "In {number} {days, plural, one {Tag} other {Tagen}}",
                pathName: "a/b/c.xliff"
            }),
            file: "x/y"
        });

        // {day} is part of the plural, not a replacement param
        test.ok(!actual);

        test.done();
    },

    testResourceNamedParamsNotInPluralsButOutsideOfThem: function(test) {
        test.expect(9);

        const rule = new ResourceMatcher(findRuleDefinition("resource-named-params"));
        test.ok(rule);

        const actual = rule.match({
            locale: "de-DE",
            resource: new ResourceString({
                key: "url.test",
                sourceLocale: "en-US",
                source: 'In {number} {days, plural, one {day} other {days}}',
                targetLocale: "de-DE",
                target: "In {num} {days, plural, one {Tag} other {Tagen}}",
                pathName: "a/b/c.xliff"
            }),
            file: "x/y"
        });
        test.ok(actual);
        test.equal(actual.length, 1);

        test.equal(actual[0].severity, "error");
        test.equal(actual[0].id, "url.test");
        test.equal(actual[0].description, "The named parameter '{number}' from the source string does not appear in the target string");
        test.equal(actual[0].highlight, "Target: In {num} {days, plural, one {Tag} other {Tagen}}<e0></e0>");
        test.equal(actual[0].source, 'In {number} {days, plural, one {day} other {days}}');
        test.equal(actual[0].pathName, "x/y");

        test.done();
    },

    testResourceNamedParamsInsidePlurals: function(test) {
        test.expect(2);

        const rule = new ResourceMatcher(findRuleDefinition("resource-named-params"));
        test.ok(rule);

        const actual = rule.match({
            locale: "de-DE",
            resource: new ResourceString({
                key: "url.test",
                sourceLocale: "en-US",
                source: '{days, plural, one {{count} day} other {all the days}}',
                targetLocale: "zh-Hans-CN",
                target: "{days, plural, other {所有的日子}}",
                pathName: "a/b/c.xliff"
            }),
            file: "x/y"
        });

        // should not match the parameters inside of the plural because sometimes the
        // translation of the plural adds or subtracts plural categories creating false matches
        test.ok(!actual);

        test.done();
    }

};

