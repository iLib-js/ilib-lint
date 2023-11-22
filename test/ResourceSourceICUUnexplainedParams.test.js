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
import { ResourceString } from "ilib-tools-common";
import { Result } from "i18nlint-common";
import ResourceSourceICUUnexplainedParams from "../src/rules/ResourceSourceICUUnexplainedParams.js";

describe("ResourceSourceICUUnexplainedParams", () => {
    const rule = new ResourceSourceICUUnexplainedParams();

    test("replacement parameter not mentioned in comment for translators", () => {
        const resource = new ResourceString({
            key: "icu.test",
            sourceLocale: "en-US",
            source: "{featuresLink} about the new features.",
            pathName: "a/b/c.xliff",
            comment: "Prompt about new features."
        });

        const result = rule.matchString({
            source: /** @type {string} */ (resource.getSource()),
            resource,
            file: "a/b/c.xliff"
        });

        const expected = [
            new Result({
                severity: "warning",
                description: `Replacement parameter "featuresLink" is not mentioned in the string's comment for translators.`,
                id: "icu.test",
                source: "{featuresLink} about the new features.",
                highlight: "<e0>{featuresLink}</e0> about the new features.",
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
            source: "{featuresLink} about the new features.",
            pathName: "a/b/c.xliff",
            comment: `Prompt about new features. featuresLink is a hyperlink with text "Read".`
        });

        const result = rule.matchString({
            source: /** @type {string} */ (resource.getSource()),
            resource,
            file: "a/b/c.xliff"
        });

        expect(result).toEqual([]);
    });

    test("multiple replacement parameters not mentioned in comment for translators", () => {
        const resource = new ResourceString({
            key: "icu.test",
            sourceLocale: "en-US",
            source: "{featuresLink} about the {type} features.",
            pathName: "a/b/c.xliff",
            comment: "Prompt about features."
        });

        const result = rule.matchString({
            source: /** @type {string} */ (resource.getSource()),
            resource,
            file: "a/b/c.xliff"
        });

        const expected = [
            new Result({
                severity: "warning",
                description: `Replacement parameter "featuresLink" is not mentioned in the string's comment for translators.`,
                id: "icu.test",
                source: "{featuresLink} about the {type} features.",
                highlight: "<e0>{featuresLink}</e0> about the {type} features.",
                rule,
                pathName: "a/b/c.xliff"
            }),
            new Result({
                severity: "warning",
                description: `Replacement parameter "type" is not mentioned in the string's comment for translators.`,
                id: "icu.test",
                source: "{featuresLink} about the {type} features.",
                highlight: "{featuresLink} about the <e0>{type}</e0> features.",
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
            source: "{featuresLink} about the {type} features.",
            pathName: "a/b/c.xliff",
            comment: `Prompt about features. featuresLink is a hyperlink with text "Read". type denotes a kind of feature, e.g. new or beta`
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
            source: "{count, plural, one {{featuresLink} about our new feature.} other {{featuresLink} about all our new features.}}",
            pathName: "a/b/c.xliff",
            comment: "Prompt about one or more new features."
        });

        const result = rule.matchString({
            source: /** @type {string} */ (resource.getSource()),
            resource,
            file: "a/b/c.xliff"
        });

        const expected = [
            new Result({
                severity: "warning",
                description: `Replacement parameter "featuresLink" is not mentioned in the string's comment for translators.`,
                id: "icu.test",
                source: "{count, plural, one {{featuresLink} about our new feature.} other {{featuresLink} about all our new features.}}",
                highlight:
                    "{count, plural, one {<e0>{featuresLink}</e0> about our new feature.} other {{featuresLink} about all our new features.}}",
                rule,
                pathName: "a/b/c.xliff"
            }),
            new Result({
                severity: "warning",
                description: `Replacement parameter "featuresLink" is not mentioned in the string's comment for translators.`,
                id: "icu.test",
                source: "{count, plural, one {{featuresLink} about our new feature.} other {{featuresLink} about all our new features.}}",
                highlight:
                    "{count, plural, one {{featuresLink} about our new feature.} other {<e0>{featuresLink}</e0> about all our new features.}}",
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
            source: "{featuresLink} about the new features.",
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
});
