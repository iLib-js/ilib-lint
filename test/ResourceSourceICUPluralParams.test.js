/*
 * ResourceSourceICUPluralParams.test.js
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
import ResourceSourceICUPluralParams from '../src/rules/ResourceSourceICUPluralParams.js';

describe("that parameters in the other category also exist in the one category", () => {
    test("no error when there are no params in the other category", () => {
        expect.assertions(2);

        const rule = new ResourceSourceICUPluralParams();
        expect(rule).toBeTruthy();

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
        expect(result).toBeFalsy();
    });

    test("no error when there are no params in the other category with nested plurals", () => {
        expect.assertions(2);

        const rule = new ResourceSourceICUPluralParams();
        expect(rule).toBeTruthy();

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
        expect(result).toBeFalsy();
    });

    test("no error when the replacement params match", () => {
        expect.assertions(2);

        const rule = new ResourceSourceICUPluralParams();
        expect(rule).toBeTruthy();

        const resource = new ResourceString({
            key: "plural.test",
            sourceLocale: "en-US",
            source: '{count, plural, one {There is {count} item available.} other {There are {count} items available.}}',
            pathName: "a/b/c.xliff"
        });
        const result = rule.matchString({
            source: resource.getSource(),
            resource,
            file: "a/b/c.xliff"
        });
        expect(result).toBeFalsy();
    });

    test("no error when multiple replacement params match", () => {
        expect.assertions(2);

        const rule = new ResourceSourceICUPluralParams();
        expect(rule).toBeTruthy();

        const resource = new ResourceString({
            key: "plural.test",
            sourceLocale: "en-US",
            source: '{count, plural, one {There is {count} {description} item available.} other {There are {count} {description} items available.}}',
            pathName: "a/b/c.xliff"
        });
        const result = rule.matchString({
            source: resource.getSource(),
            resource,
            file: "a/b/c.xliff"
        });
        expect(result).toBeFalsy();
    });

    test("no error when multiple replacement params match", () => {
        expect.assertions(2);

        const rule = new ResourceSourceICUPluralParams();
        expect(rule).toBeTruthy();

        const resource = new ResourceString({
            key: "plural.test",
            sourceLocale: "en-US",
            source: '{count, plural, one {There is {description} {count} item available.} other {There are {count} {description} items available.}}',
            pathName: "a/b/c.xliff"
        });
        const result = rule.matchString({
            source: resource.getSource(),
            resource,
            file: "a/b/c.xliff"
        });
        expect(result).toBeFalsy();
    });

/*
        expect.assertions(2);

        const rule = new ResourceSourceICUPluralParams();
        expect(rule).toBeTruthy();

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
        expect(result).toBeFalsy();
    });

    test("MissingCategoryOther", () => {
        expect.assertions(2);

        const rule = new ResourceSourceICUPluralParams();
        expect(rule).toBeTruthy();

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
        expect(result).toStrictEqual(expected);
    });

    test("SelectString", () => {
        expect.assertions(2);

        const rule = new ResourceSourceICUPluralParams();
        expect(rule).toBeTruthy();

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
        expect(result).toBeFalsy();
    });
*/

    test("Plural embedded in a string that has no error", () => {
        expect.assertions(2);

        const rule = new ResourceSourceICUPluralParams();
        expect(rule).toBeTruthy();

        const resource = new ResourceString({
            key: "plural.test",
            sourceLocale: "en-US",
            source: 'The file is located in {count, plural, one {# collection} other {# collections}} visible to user {name}.' ,
            pathName: "a/b/c.xliff"
        });
        const result = rule.matchString({
            source: resource.getSource(),
            resource,
            file: "a/b/c.xliff"
        });
        expect(result).toBeFalsy();
    });

});

