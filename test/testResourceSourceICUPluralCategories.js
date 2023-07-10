/*
 * testResourceSourceICUPluralCategories.js
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
import { ResourceString } from "ilib-tools-common";
import { Result } from "i18nlint-common";
import ResourceSourceICUPluralCategories from "../src/rules/ResourceSourceICUPluralCategories.js";

const testFlat = {
    testMatchNoError: function (test) {
        test.expect(2);

        const rule = new ResourceSourceICUPluralCategories();
        test.ok(rule);

        const resource = new ResourceString({
            key: "plural.test",
            sourceLocale: "en-US",
            source: "{count, plural, one {This is singular} other {This is plural}}",
            pathName: "a/b/c.xliff",
        });
        const result = rule.matchString({
            source: resource.getSource(),
            resource,
            file: "a/b/c.xliff",
        });
        test.deepEqual(result, []);

        test.done();
    },

    testMissingCategoryOne: function (test) {
        test.expect(2);

        const rule = new ResourceSourceICUPluralCategories();
        test.ok(rule);

        const resource = new ResourceString({
            key: "plural.test",
            sourceLocale: "en-US",
            source: "{count, plural, other {This is plural}}",
            pathName: "a/b/c.xliff",
        });
        const result = rule.matchString({
            source: resource.getSource(),
            resource,
            file: "a/b/c.xliff",
        });

        const expected = [
            new Result({
                severity: "error",
                description: 'Missing required plural category "one"',
                pathName: "a/b/c.xliff",
                rule,
                highlight: "<e0>{count, plural, other {This is plural}}</e0>",
                id: "plural.test",
                source: "{count, plural, other {This is plural}}",
            }),
        ];
        test.deepEqual(result, expected);

        test.done();
    },

    testMissingCategoryOther: function (test) {
        test.expect(2);

        const rule = new ResourceSourceICUPluralCategories();
        test.ok(rule);

        const resource = new ResourceString({
            key: "plural.test",
            sourceLocale: "en-US",
            source: "{count, plural, one {This is singular}}",
            pathName: "a/b/c.xliff",
        });
        const result = rule.matchString({
            source: resource.getSource(),
            resource,
            file: "a/b/c.xliff",
        });

        // missing "other" is an ICU plural syntax error,
        // so a different rule should catch that
        test.deepEqual(result, []);

        test.done();
    },

    testExtraCategoryTwo: function (test) {
        test.expect(2);

        const rule = new ResourceSourceICUPluralCategories();
        test.ok(rule);

        const resource = new ResourceString({
            key: "plural.test",
            sourceLocale: "en-US",
            source: "{count, plural, one {This is singular} two {This is a pair} other {This is plural}}",
            pathName: "a/b/c.xliff",
        });
        const result = rule.matchString({
            source: resource.getSource(),
            resource,
            file: "a/b/c.xliff",
        });

        const expected = [
            new Result({
                severity: "warning",
                description: 'Unexpected category "two" in plural',
                pathName: "a/b/c.xliff",
                rule,
                highlight: "<e0>{This is a pair}</e0>",
                id: "plural.test",
                source: "{count, plural, one {This is singular} two {This is a pair} other {This is plural}}",
            }),
        ];
        test.deepEqual(result, expected);

        test.done();
    },

    testInvalidOneCategory: function (test) {
        test.expect(2);

        const rule = new ResourceSourceICUPluralCategories();
        test.ok(rule);

        // category "=1" instead of "one"
        const resource = new ResourceString({
            key: "plural.test",
            sourceLocale: "en-US",
            source: "{count, plural, =1 {This is singular} other {This is plural}}",
            pathName: "a/b/c.xliff",
        });
        const result = rule.matchString({
            source: resource.getSource(),
            resource,
            file: "a/b/c.xliff",
        });

        const expected = [
            new Result({
                severity: "error",
                description: 'Missing required plural category "one"',
                pathName: "a/b/c.xliff",
                rule,
                highlight: "<e0>{count, plural, =1 {This is singular} other {This is plural}}</e0>",
                id: "plural.test",
                source: "{count, plural, =1 {This is singular} other {This is plural}}",
            }),
            new Result({
                severity: "warning",
                description: 'Unexpected category "=1" in plural',
                pathName: "a/b/c.xliff",
                rule,
                highlight: "<e0>{This is singular}</e0>",
                id: "plural.test",
                source: "{count, plural, =1 {This is singular} other {This is plural}}",
            }),
        ];
        test.deepEqual(result, expected);

        test.done();
    },
};

const testNested = {
    testMatchNestedNoError: function (test) {
        test.expect(2);

        const rule = new ResourceSourceICUPluralCategories();
        test.ok(rule);

        const resource = new ResourceString({
            key: "plural.test",
            sourceLocale: "en-US",
            source: "{count, plural, one {{total, plural, one {There is {count} of {total} item available} other {There is {count} of {total} items available}}} other {{total, plural, one {There are {count} of {total} item available} other {There are {count} of {total} items available}}}}",
            pathName: "a/b/c.xliff",
        });
        const result = rule.matchString({
            source: resource.getSource(),
            resource,
            file: "a/b/c.xliff",
        });
        test.deepEqual(result, []);

        test.done();
    },

    testMatchNestedMissingSingleOne: function (test) {
        test.expect(2);

        const rule = new ResourceSourceICUPluralCategories();
        test.ok(rule);

        const resource = new ResourceString({
            key: "plural.test",
            sourceLocale: "en-US",
            source: "{count, plural, one {{total, plural, other {There is {count} of {total} items available}}} other {{total, plural, one {There are {count} of {total} item available} other {There are {count} of {total} items available}}}}",
            pathName: "a/b/c.xliff",
        });
        const result = rule.matchString({
            source: resource.getSource(),
            resource,
            file: "a/b/c.xliff",
        });

        const expected = [
            new Result({
                severity: "error",
                description: 'Missing required plural category "one"',
                pathName: "a/b/c.xliff",
                rule,
                highlight: "<e0>{total, plural, other {There is {count} of {total} items available}}</e0>",
                id: "plural.test",
                source: "{count, plural, one {{total, plural, other {There is {count} of {total} items available}}} other {{total, plural, one {There are {count} of {total} item available} other {There are {count} of {total} items available}}}}",
            }),
        ];

        test.deepEqual(result, expected);

        test.done();
    },

    testMatchNestedMissingMultipleOne: function (test) {
        test.expect(2);

        const rule = new ResourceSourceICUPluralCategories();
        test.ok(rule);

        const resource = new ResourceString({
            key: "plural.test",
            sourceLocale: "en-US",
            source: "{count, plural, one {{total, plural, other {There is {count} of {total} items available}}} other {{total, plural, other {There are {count} of {total} items available}}}}",
            pathName: "a/b/c.xliff",
        });
        const result = rule.matchString({
            source: resource.getSource(),
            resource,
            file: "a/b/c.xliff",
        });

        const expected = [
            new Result({
                severity: "error",
                description: 'Missing required plural category "one"',
                pathName: "a/b/c.xliff",
                rule,
                highlight: "<e0>{total, plural, other {There is {count} of {total} items available}}</e0>",
                id: "plural.test",
                source: "{count, plural, one {{total, plural, other {There is {count} of {total} items available}}} other {{total, plural, other {There are {count} of {total} items available}}}}",
            }),
            new Result({
                severity: "error",
                description: 'Missing required plural category "one"',
                pathName: "a/b/c.xliff",
                rule,
                highlight: "<e0>{total, plural, other {There are {count} of {total} items available}}</e0>",
                id: "plural.test",
                source: "{count, plural, one {{total, plural, other {There is {count} of {total} items available}}} other {{total, plural, other {There are {count} of {total} items available}}}}",
            }),
        ];

        test.deepEqual(result, expected);

        test.done();
    },

    testMatchNestedMissingSingleOther: function (test) {
        test.expect(2);

        const rule = new ResourceSourceICUPluralCategories();
        test.ok(rule);

        const resource = new ResourceString({
            key: "plural.test",
            sourceLocale: "en-US",
            source: "{count, plural, one {{total, plural, one {There is {count} of {total} item available} other {There is {count} of {total} items available}}} other {{total, plural, one {There are {count} of {total} item available}}}}",
            pathName: "a/b/c.xliff",
        });
        const result = rule.matchString({
            source: resource.getSource(),
            resource,
            file: "a/b/c.xliff",
        });

        // missing "other" is an ICU plural syntax error,
        // so a different rule should catch that
        test.deepEqual(result, []);

        test.done();
    },

    testMatchNestedMissingMultipleOther: function (test) {
        test.expect(2);

        const rule = new ResourceSourceICUPluralCategories();
        test.ok(rule);

        const resource = new ResourceString({
            key: "plural.test",
            sourceLocale: "en-US",
            source: "{count, plural, one {{total, plural, one {There is {count} of {total} item available}}} other {{total, plural, one {There are {count} of {total} item available}}}}",
            pathName: "a/b/c.xliff",
        });
        const result = rule.matchString({
            source: resource.getSource(),
            resource,
            file: "a/b/c.xliff",
        });

        // missing "other" is an ICU plural syntax error,
        // so a different rule should catch that
        test.deepEqual(result, []);

        test.done();
    },

    testMatchNestedMultiLineNoError: function (test) {
        test.expect(2);

        const rule = new ResourceSourceICUPluralCategories();
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
            pathName: "a/b/c.xliff",
        });
        const result = rule.matchString({
            source: resource.getSource(),
            resource,
            file: "a/b/c.xliff",
        });
        test.deepEqual(result, []);

        test.done();
    },

    testMatchNestedExtra: function (test) {
        test.expect(2);

        const rule = new ResourceSourceICUPluralCategories();
        test.ok(rule);

        const resource = new ResourceString({
            key: "plural.test",
            sourceLocale: "en-US",
            source: "{count, plural, one {{total, plural, one {There is {count} of {total} item available} =2 {There is {count} of two items available} other {There is {count} of {total} items available}}} other {{total, plural, one {There are {count} of {total} item available} other {There are {count} of {total} items available}}}}",
            pathName: "a/b/c.xliff",
        });
        const result = rule.matchString({
            source: resource.getSource(),
            resource,
            file: "a/b/c.xliff",
        });

        const expected = [
            new Result({
                severity: "warning",
                description: 'Unexpected category "=2" in plural',
                pathName: "a/b/c.xliff",
                rule,
                highlight: "<e0>{There is {count} of two items available}</e0>",
                id: "plural.test",
                source: "{count, plural, one {{total, plural, one {There is {count} of {total} item available} =2 {There is {count} of two items available} other {There is {count} of {total} items available}}} other {{total, plural, one {There are {count} of {total} item available} other {There are {count} of {total} items available}}}}",
            }),
        ];
        test.deepEqual(result, expected);

        test.done();
    },
};

export const testResourceSourceICUPluralCategories = {
    ...testFlat,
    ...testNested,
};
