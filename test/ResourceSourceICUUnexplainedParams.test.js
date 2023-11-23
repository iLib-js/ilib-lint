/*
 * ResourceSourceICUUnexplainedParams.test.js
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
import { ResourceArray, ResourcePlural, ResourceString } from "ilib-tools-common";
import { IntermediateRepresentation, Result } from "i18nlint-common";
import ResourceSourceICUUnexplainedParams from "../src/rules/ResourceSourceICUUnexplainedParams.js";

describe("ResourceSourceICUUnexplainedParams", () => {
    const rule = new ResourceSourceICUUnexplainedParams();

    test("replacement parameter not mentioned in comment for translators", () => {
        const resource = new ResourceString({
            key: "icu.test",
            sourceLocale: "en-US",
            source: "Examine other usage by {ruleUser}.",
            pathName: "a/b/c.xliff",
            comment: "Notice about other usage examples."
        });

        const result = rule.matchString({
            source: /** @type {string} */ (resource.getSource()),
            resource,
            file: "a/b/c.xliff"
        });

        const expected = [
            new Result({
                severity: "warning",
                description: `Replacement parameter "ruleUser" is not mentioned in the string's comment for translators.`,
                id: "icu.test",
                source: "Examine other usage by {ruleUser}.",
                highlight: "Examine other usage by <e0>{ruleUser}</e0>.",
                rule,
                pathName: "a/b/c.xliff"
            })
        ];

        expect(result).toStrictEqual(expected);
    });

    test("replacement parameter mentioned in comment for translators", () => {
        const resource = new ResourceString({
            key: "icu.test",
            sourceLocale: "en-US",
            source: "Examine other usage by {ruleUser}.",
            pathName: "a/b/c.xliff",
            comment: `Notice about other usage examples. ruleUser is an email address of the user that violated the rule.`
        });

        const result = rule.matchString({
            source: /** @type {string} */ (resource.getSource()),
            resource,
            file: "a/b/c.xliff"
        });

        expect(result).toEqual([]);
    });

    test("replacement parameter mentioned in comment for translators with different case", () => {
        const resource = new ResourceString({
            key: "icu.test",
            sourceLocale: "en-US",
            source: "Examine other usage by {ruleUser}.",
            pathName: "a/b/c.xliff",
            comment: `Notice about other usage examples. RuleUser is an email address of the user that violated the rule.`
        });

        const result = rule.matchString({
            source: /** @type {string} */ (resource.getSource()),
            resource,
            file: "a/b/c.xliff"
        });

        expect(result).toEqual([]);
    });

    test("replacement parameter mentioned in comment for translators wrapped in brackets", () => {
        const resource = new ResourceString({
            key: "icu.test",
            sourceLocale: "en-US",
            source: "Examine other usage by {ruleUser}.",
            pathName: "a/b/c.xliff",
            comment: `Notice about other usage examples. {ruleUser} is an email address of the user that violated the rule.`
        });

        const result = rule.matchString({
            source: /** @type {string} */ (resource.getSource()),
            resource,
            file: "a/b/c.xliff"
        });

        expect(result).toEqual([]);
    });

    test("replacement parameter mentioned in comment for translators denoted by colon", () => {
        const resource = new ResourceString({
            key: "icu.test",
            sourceLocale: "en-US",
            source: "Examine other usage by {ruleUser}.",
            pathName: "a/b/c.xliff",
            comment: `Notice about other usage examples. ruleUser: an email address of the user that violated the rule;`
        });

        const result = rule.matchString({
            source: /** @type {string} */ (resource.getSource()),
            resource,
            file: "a/b/c.xliff"
        });

        expect(result).toEqual([]);
    });

    test("replacement parameter not mentioned in comment for translators but is a part of some other word", () => {
        const resource = new ResourceString({
            key: "icu.test",
            sourceLocale: "en-US",
            source: "Examine other usage by {user}.",
            pathName: "a/b/c.xliff",
            comment: "Notice about other usage examples containing a username."
        });

        const result = rule.matchString({
            source: /** @type {string} */ (resource.getSource()),
            resource,
            file: "a/b/c.xliff"
        });

        const expected = [
            new Result({
                severity: "warning",
                description: `Replacement parameter "user" is not mentioned in the string's comment for translators.`,
                id: "icu.test",
                source: "Examine other usage by {user}.",
                highlight: "Examine other usage by <e0>{user}</e0>.",
                rule,
                pathName: "a/b/c.xliff"
            })
        ];

        expect(result).toStrictEqual(expected);
    });

    test("multiple replacement parameters not mentioned in comment for translators", () => {
        const resource = new ResourceString({
            key: "icu.test",
            sourceLocale: "en-US",
            source: "Examine other {usageKind} by {ruleUser}.",
            pathName: "a/b/c.xliff",
            comment: `Notice about other usage examples.`
        });

        const result = rule.matchString({
            source: /** @type {string} */ (resource.getSource()),
            resource,
            file: "a/b/c.xliff"
        });

        const expected = [
            new Result({
                severity: "warning",
                description: `Replacement parameter "usageKind" is not mentioned in the string's comment for translators.`,
                id: "icu.test",
                source: "Examine other {usageKind} by {ruleUser}.",
                highlight: "Examine other <e0>{usageKind}</e0> by {ruleUser}.",
                rule,
                pathName: "a/b/c.xliff"
            }),
            new Result({
                severity: "warning",
                description: `Replacement parameter "ruleUser" is not mentioned in the string's comment for translators.`,
                id: "icu.test",
                source: "Examine other {usageKind} by {ruleUser}.",
                highlight: "Examine other {usageKind} by <e0>{ruleUser}</e0>.",
                rule,
                pathName: "a/b/c.xliff"
            })
        ];

        expect(result).toStrictEqual(expected);
    });

    test("multiple replacement parameters all mentioned in comment for translators", () => {
        const resource = new ResourceString({
            key: "icu.test",
            sourceLocale: "en-US",
            source: "Examine other {usageKind} by {ruleUser}.",
            pathName: "a/b/c.xliff",
            comment: `Notice about other usage examples. usageKind can be a usage or a violation. ruleUser is an email address of the user.`
        });

        const result = rule.matchString({
            source: /** @type {string} */ (resource.getSource()),
            resource,
            file: "a/b/c.xliff"
        });

        expect(result).toStrictEqual([]);
    });

    test("replacement parameter nested deeper within the message not mentioned in comment for translators", () => {
        const resource = new ResourceString({
            key: "icu.test",
            sourceLocale: "en-US",
            source: "{count, plural, one {Examine this usage by {ruleUser}.} other {Examine those usages by {ruleUser}.}}",
            pathName: "a/b/c.xliff",
            comment: "Notice about other usage examples."
        });

        const result = rule.matchString({
            source: /** @type {string} */ (resource.getSource()),
            resource,
            file: "a/b/c.xliff"
        });

        const expected = [
            new Result({
                severity: "warning",
                description: `Replacement parameter "ruleUser" is not mentioned in the string's comment for translators.`,
                id: "icu.test",
                source: "{count, plural, one {Examine this usage by {ruleUser}.} other {Examine those usages by {ruleUser}.}}",
                highlight:
                "{count, plural, one {Examine this usage by <e0>{ruleUser}</e0>.} other {Examine those usages by {ruleUser}.}}",
                rule,
                pathName: "a/b/c.xliff"
            }),
            new Result({
                severity: "warning",
                description: `Replacement parameter "ruleUser" is not mentioned in the string's comment for translators.`,
                id: "icu.test",
                source: "{count, plural, one {Examine this usage by {ruleUser}.} other {Examine those usages by {ruleUser}.}}",
                highlight:
                "{count, plural, one {Examine this usage by {ruleUser}.} other {Examine those usages by <e0>{ruleUser}</e0>.}}",
                rule,
                pathName: "a/b/c.xliff"
            })
        ];

        expect(result).toStrictEqual(expected);
    });

    test("no comment for translators provided", () => {
        const resource = new ResourceString({
            key: "icu.test",
            sourceLocale: "en-US",
            source: "Examine other usage by {ruleUser}.",
            pathName: "a/b/c.xliff"
        });

        const result = rule.matchString({
            source: /** @type {string} */ (resource.getSource()),
            resource,
            file: "a/b/c.xliff"
        });

        expect(result).toEqual(undefined);
    });

    test("no source string available in the resource", () => {
        const resource = new ResourceString({
            key: "icu.test",
            sourceLocale: "en-US",
            source: undefined,
            pathName: "a/b/c.xliff"
        });

        const result = rule.matchString({
            source: /** @type {string} */ (resource.getSource()),
            resource,
            file: "a/b/c.xliff"
        });

        expect(result).toEqual(undefined);
    });

    test("replacement parameter not mentioned in comments for a resourceArray", () => {
        const resource = new ResourceArray({
            key: "icu.test",
            sourceLocale: "en-US",
            source: [
                "Examine this usage by {ruleUser}.",
                "Examine those usages by {ruleUser}."
            ],
            pathName: "a/b/c.xliff",
            comment: "Notice about other usage examples."
        });

        const result = rule.match({
            file: "a/b/c.xliff",
            ir: new IntermediateRepresentation({
                type: "resource",
                ir: [resource],
                filePath: "a/b/c.xliff"
            })
        });

        const expected = [
            new Result({
                severity: "warning",
                description: `Replacement parameter "ruleUser" is not mentioned in the string's comment for translators.`,
                id: "icu.test",
                source: "Examine this usage by {ruleUser}.",
                highlight: "Examine this usage by <e0>{ruleUser}</e0>.",
                rule,
                pathName: "a/b/c.xliff"
            }),
            new Result({
                severity: "warning",
                description: `Replacement parameter "ruleUser" is not mentioned in the string's comment for translators.`,
                id: "icu.test",
                source: "Examine those usages by {ruleUser}.",
                highlight: "Examine those usages by <e0>{ruleUser}</e0>.",
                rule,
                pathName: "a/b/c.xliff"
            })
        ];

        expect(result).toStrictEqual(expected);
    });

    test("replacement parameter not mentioned in comments for a resourcePlural", () => {
        const resource = new ResourcePlural({
            key: "icu.test",
            sourceLocale: "en-US",
            source: {
                one: "Examine this usage by {ruleUser}.",
                other: "Examine those usages by {ruleUser}."
            },
            pathName: "a/b/c.xliff",
            comment: "Notice about other usage examples."
        });

        const result = rule.match({
            file: "a/b/c.xliff",
            ir: new IntermediateRepresentation({
                type: "resource",
                ir: [resource],
                filePath: "a/b/c.xliff"
            })
        });

        const expected = [
            new Result({
                severity: "warning",
                description: `Replacement parameter "ruleUser" is not mentioned in the string's comment for translators.`,
                id: "icu.test",
                source: "Examine this usage by {ruleUser}.",
                highlight: "Examine this usage by <e0>{ruleUser}</e0>.",
                rule,
                pathName: "a/b/c.xliff"
            }),
            new Result({
                severity: "warning",
                description: `Replacement parameter "ruleUser" is not mentioned in the string's comment for translators.`,
                id: "icu.test",
                source: "Examine those usages by {ruleUser}.",
                highlight: "Examine those usages by <e0>{ruleUser}</e0>.",
                rule,
                pathName: "a/b/c.xliff"
            })
        ];

        expect(result).toStrictEqual(expected);
    });
});
