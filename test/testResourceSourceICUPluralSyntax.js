/*
 * ResourceSourceICUPluralSyntax.js
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
import { Result } from 'i18nlint-common';
import ResourceSourceICUPluralSyntax from '../src/rules/ResourceSourceICUPluralSyntax.js';

export const testResourceSourceICUPluralSyntax = {
    testMatchNoError: function(test) {
        test.expect(2);

        const rule = new ResourceSourceICUPluralSyntax();
        test.ok(rule);

        const resource = new ResourceString({
            key: "plural.test",
            sourceLocale: "en-US",
            source: '{count, plural, one {This is singular} other {This is plural}}',
            pathName: "a/b/c.xliff"
        });
        const result = rule.matchString({
            source: resource.getSource(),
            resource,
            file: "a/b/c.xliff"
        });
        test.ok(!result);

        test.done();
    },

    testMatchNestedNoError: function(test) {
        test.expect(2);

        const rule = new ResourceSourceICUPluralSyntax();
        test.ok(rule);

        const resource = new ResourceString({
            key: "plural.test",
            sourceLocale: "en-US",
            source: '{count, plural, one {{total, plural, one {There is {count} of {total} item available} other {There is {count} of {total} items available}}} other {{total, plural, one {There are {count} of {total} item available} other {There are {count} of {total} items available}}}}',
            pathName: "a/b/c.xliff"
        });
        const result = rule.matchString({
            source: resource.getSource(),
            resource,
            file: "a/b/c.xliff"
        });
        test.ok(!result);

        test.done();
    },

    testMatchNestedMultiLineNoError: function(test) {
        test.expect(2);

        const rule = new ResourceSourceICUPluralSyntax();
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
            pathName: "a/b/c.xliff"
        });
        const result = rule.matchString({
            source: resource.getSource(),
            resource,
            file: "a/b/c.xliff"
        });
        test.ok(!result);

        test.done();
    },

    testMatchTooManyOpenBraces: function(test) {
        test.expect(2);

        const rule = new ResourceSourceICUPluralSyntax();
        test.ok(rule);

        const resource = new ResourceString({
            key: "plural.test",
            sourceLocale: "en-US",
            source: '{count, plural, one {{This is singular} other {This is plural}}',
            pathName: "a/b/c.xliff"
        });
        const result = rule.matchString({
            source: resource.getSource(),
            resource,
            file: "a/b/c.xliff"
        });
        const expected = new Result({
            severity: "error",
            description: "Incorrect ICU plural syntax in source string: SyntaxError: MALFORMED_ARGUMENT",
            id: "plural.test",
            source: '{count, plural, one {{This is singular} other {This is plural}}',
            highlight: '{count, plural, one {<e0>{This </e0>is singular} other {This is plural}}',
            rule,
            pathName: "a/b/c.xliff"
        });
        test.deepEqual(result, expected);

        test.done();
    },

    testMatchUnclosedOpenBraces: function(test) {
        test.expect(2);

        const rule = new ResourceSourceICUPluralSyntax();
        test.ok(rule);

        const resource = new ResourceString({
            key: "plural.test",
            sourceLocale: "en-US",
            source: '{count, plural, one {This is singular} other {This is plural}',
            pathName: "a/b/c.xliff"
        });
        const result = rule.matchString({
            source: resource.getSource(),
            resource,
            file: "a/b/c.xliff"
        });
        const expected = new Result({
            severity: "error",
            description: "Incorrect ICU plural syntax in source string: SyntaxError: EXPECT_ARGUMENT_CLOSING_BRACE",
            id: "plural.test",
            source: '{count, plural, one {This is singular} other {This is plural}',
            highlight: '<e0>{count, plural, one {This is singular} other {This is plural}</e0>',
            rule,
            pathName: "a/b/c.xliff"
        });
        test.deepEqual(result, expected);

        test.done();
    },

    testMissingCategoryOther: function(test) {
        test.expect(2);

        const rule = new ResourceSourceICUPluralSyntax();
        test.ok(rule);

        const resource = new ResourceString({
            key: "plural.test",
            sourceLocale: "en-US",
            source: '{count, plural, one {This is singular}}',
            pathName: "a/b/c.xliff"
        });
        const result = rule.matchString({
            source: resource.getSource(),
            resource,
            file: "a/b/c.xliff"
        });
        const expected = new Result({
            severity: "error",
            description: "Incorrect ICU plural syntax in source string: SyntaxError: MISSING_OTHER_CLAUSE",
            id: "plural.test",
            source: '{count, plural, one {This is singular}}',
            highlight: '{count, plural, one {This is singular}<e0></e0>}',
            rule,
            pathName: "a/b/c.xliff"
        });
        test.deepEqual(result, expected);

        test.done();
    },

    testSelectString: function(test) {
        test.expect(2);

        const rule = new ResourceSourceICUPluralSyntax();
        test.ok(rule);

        const resource = new ResourceString({
            key: "plural.test",
            sourceLocale: "en-US",
            source: '{count, select, male {He said} female {She said} other {They said}}',
            pathName: "a/b/c.xliff"
        });
        const result = rule.matchString({
            source: resource.getSource(),
            resource,
            file: "a/b/c.xliff"
        });
        test.ok(!result);

        test.done();
    },

    testEmbeddedPluralNoError: function(test) {
        test.expect(2);

        const rule = new ResourceSourceICUPluralSyntax();
        test.ok(rule);

        const resource = new ResourceString({
            key: "plural.test",
            sourceLocale: "en-US",
            source: 'The file is located in {count, plural, one {# collection} other {# collections}} visible to user {name}.' ,
            targetLocale: "de-DE",
            target: "Die Datei befindet sich in {count, plural, one {# Sammlung} other {# Sammlungen}} die für Benutzer {name} sichtbar ist.",
            pathName: "a/b/c.xliff"
        });
        const result = rule.matchString({
            source: resource.getSource(),
            resource,
            file: "a/b/c.xliff"
        });
        test.ok(!result);

        test.done();
    },

    testEmbeddedPluralMissingClosingBrace: function(test) {
        test.expect(2);

        const rule = new ResourceSourceICUPluralSyntax();
        test.ok(rule);

        const resource = new ResourceString({
            key: "plural.test",
            sourceLocale: "en-US",
            source: 'The file is located in {count, plural, one {# collection} other {# collections} visible to user {name}.' ,
            pathName: "a/b/c.xliff"
        });
        const result = rule.matchString({
            source: resource.getSource(),
            resource,
            file: "a/b/c.xliff"
        });
        const expected = new Result({
            severity: "error",
            description: "Incorrect ICU plural syntax in source string: SyntaxError: EXPECT_PLURAL_ARGUMENT_SELECTOR_FRAGMENT",
            id: "plural.test",
            highlight: 'The file is located in {count, plural, one {# collection} other {# collections} visible <e0></e0>to user {name}.',
            rule,
            pathName: "a/b/c.xliff",
            source: 'The file is located in {count, plural, one {# collection} other {# collections} visible to user {name}.'
        });
        test.deepEqual(result, expected);

        test.done();
    },
};

