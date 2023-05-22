/*
 * testRules.js - test the built-in rules
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
import { ResourceArray, ResourcePlural, ResourceString } from 'ilib-tools-common';

import ResourceStateChecker from '../src/rules/ResourceStateChecker.js';
import ResourceEdgeWhitespace from '../src/rules/ResourceEdgeWhitespace.js';
import ResourceCompleteness from "../src/rules/ResourceCompleteness.js";
import ResourceDNTTerms from '../src/rules/ResourceDNTTerms.js';
import ResourceNoTranslation from '../src/rules/ResourceNoTranslation.js';

import { Result, IntermediateRepresentation } from 'i18nlint-common';

export const testRules = {
    testResourceEdgeWhitespaceEdgesMatch: function(test) {
        test.expect(2);

        const rule = new ResourceEdgeWhitespace();
        test.ok(rule);

        const resource = new ResourceString({
            key: "resource-edge-whitespace.both-edges-match",
            sourceLocale: "en-US",
            source: "Some source string. ",
            targetLocale: "de-DE",
            target: "Some target string. ",
            pathName: "resource-edge-whitespace-test.xliff",
            state: "translated",
        });
        const subject = {
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        };

        const result = rule.matchString(subject);
        test.equal(result, undefined); // for a valid resource match result should not be produced
        test.done();
    },

    testResourceEdgeWhitespaceLeadingSpaceMissing: function(test) {
        test.expect(2);

        const rule = new ResourceEdgeWhitespace();
        test.ok(rule);

        const resource = new ResourceString({
            key: "resource-edge-whitespace.leading-space-missing",
            sourceLocale: "en-US",
            source: " some source string.",
            targetLocale: "de-DE",
            target: "some target string.",
            pathName: "resource-edge-whitespace-test.xliff",
            state: "translated",
        });
        const subject = {
            // accidentally ommited space in front of target string
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        };
        const result = rule.matchString(subject);
        test.deepEqual(
            result,
            new Result({
                rule,
                severity: "error",
                pathName: "a/b/c.xliff",
                locale: "de-DE",
                source: " some source string.",
                id: "resource-edge-whitespace.leading-space-missing",
                description: "Leading whitespace in target does not match leading whitespace in source",
                highlight: `Source: <e0>⎵</e0>some… Target: <e1></e1>some…`,
            })
        );
        test.done();
    },

    testResourceEdgeWhitespaceLeadingSpaceExtra: function(test) {
        test.expect(2);

        const rule = new ResourceEdgeWhitespace();
        test.ok(rule);

        const resource = new ResourceString({
            key: "resource-edge-whitespace.leading-space-extra",
            sourceLocale: "en-US",
            source: "Some source string.",
            targetLocale: "de-DE",
            target: " Some target string.",
            pathName: "resource-edge-whitespace-test.xliff",
            state: "translated",
        });
        const subject = {
            // accidentally added space in front of target string
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        };
        const result = rule.matchString(subject);
        test.deepEqual(
            result,
            new Result({
                rule,
                severity: "error",
                pathName: "a/b/c.xliff",
                locale: "de-DE",
                source: "Some source string.",
                id: "resource-edge-whitespace.leading-space-extra",
                description: "Leading whitespace in target does not match leading whitespace in source",
                highlight: `Source: <e0></e0>Some… Target: <e1>⎵</e1>Some…`,
            })
        );
        test.done();
    },

    testResourceEdgeWhitespaceTrailingSpaceMissing: function(test) {
        test.expect(2);

        const rule = new ResourceEdgeWhitespace();
        test.ok(rule);

        const resource = new ResourceString({
            key: "resource-edge-whitespace.trailing-space-missing",
            sourceLocale: "en-US",
            source: "Some source string ",
            targetLocale: "de-DE",
            target: "Some target string",
            pathName: "resource-edge-whitespace-test.xliff",
            state: "translated",
        });
        const subject = {
            // accidentally ommited space in the end of target string
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        };
        const result = rule.matchString(subject);
        test.deepEqual(
            result,
            new Result({
                rule,
                severity: "error",
                pathName: "a/b/c.xliff",
                locale: "de-DE",
                source: "Some source string ",
                id: "resource-edge-whitespace.trailing-space-missing",
                description: "Trailing whitespace in target does not match trailing whitespace in source",
                highlight: `Source: …ring<e0>⎵</e0> Target: …ring<e1></e1>`,
            })
        );
        test.done();
    },

    testResourceEdgeWhitespaceTrailingSpaceExtra: function(test) {
        test.expect(2);

        const rule = new ResourceEdgeWhitespace();
        test.ok(rule);

        const resource = new ResourceString({
            key: "resource-edge-whitespace.trailing-space-extra",
            sourceLocale: "en-US",
            source: "Some source string.",
            targetLocale: "de-DE",
            target: "Some target string. ",
            pathName: "resource-edge-whitespace-test.xliff",
            state: "translated",
        });
        const subject = {
            // accidentally added space in the end of target string
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        };
        const result = rule.matchString(subject);
        test.deepEqual(
            result,
            new Result({
                rule,
                severity: "error",
                pathName: "a/b/c.xliff",
                locale: "de-DE",
                source: "Some source string.",
                id: "resource-edge-whitespace.trailing-space-extra",
                description: "Trailing whitespace in target does not match trailing whitespace in source",
                highlight: `Source: …ing.<e0></e0> Target: …ing.<e1>⎵</e1>`,
            })
        );
        test.done();
    },

    testResourceEdgeWhitespaceTrailingSpaceExtraMore: function(test) {
        test.expect(2);

        const rule = new ResourceEdgeWhitespace();
        test.ok(rule);

        const resource = new ResourceString({
            key: "resource-edge-whitespace.trailing-space-extra-more",
            sourceLocale: "en-US",
            source: "Some source string ",
            targetLocale: "de-DE",
            target: "Some target string  ",
            pathName: "resource-edge-whitespace-test.xliff",
            state: "translated",
        });
        const subject = {
            // accidentally added space in the end of target string
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        };
        const result = rule.matchString(subject);
        test.deepEqual(
            result,
            new Result({
                rule,
                severity: "error",
                pathName: "a/b/c.xliff",
                locale: "de-DE",
                source: "Some source string ",
                id: "resource-edge-whitespace.trailing-space-extra-more",
                description: "Trailing whitespace in target does not match trailing whitespace in source",
                highlight: `Source: …ring<e0>⎵</e0> Target: …ring<e1>⎵⎵</e1>`,
            })
        );
        test.done();
    },

    testResourceEdgeWhitespaceBothEdgesSpaceMissing: function(test) {
        test.expect(2);

        const rule = new ResourceEdgeWhitespace();
        test.ok(rule);

        const resource = new ResourceString({
            key: "resource-edge-whitespace.both-spaces-missing",
            sourceLocale: "en-US",
            source: " some source string ",
            targetLocale: "de-DE",
            target: "some target string",
            pathName: "resource-edge-whitespace-test.xliff",
            state: "translated",
        });
        const subject = {
            // accidentally ommited space in front and in the end of target string
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        };
        const result = rule.matchString(subject);
        test.deepEqual(result, [
            new Result({
                rule,
                severity: "error",
                pathName: "a/b/c.xliff",
                locale: "de-DE",
                source: " some source string ",
                id: "resource-edge-whitespace.both-spaces-missing",
                description: "Leading whitespace in target does not match leading whitespace in source",
                highlight: `Source: <e0>⎵</e0>some… Target: <e1></e1>some…`,
            }),
            new Result({
                rule,
                severity: "error",
                pathName: "a/b/c.xliff",
                locale: "de-DE",
                source: " some source string ",
                id: "resource-edge-whitespace.both-spaces-missing",
                description: "Trailing whitespace in target does not match trailing whitespace in source",
                highlight: `Source: …ring<e0>⎵</e0> Target: …ring<e1></e1>`,
            }),
        ]);
        test.done();
    },

    testResourceEdgeWhitespaceSpacesOnlyMatch: function(test) {
        test.expect(2);

        const rule = new ResourceEdgeWhitespace();
        test.ok(rule);

        const resource = new ResourceString({
            key: "resource-edge-whitespace.spaces-only-match",
            sourceLocale: "en-US",
            source: " ",
            targetLocale: "de-DE",
            target: " ",
            pathName: "resource-edge-whitespace-test.xliff",
            state: "translated",
        });
        const subject = {
            // all-whitespace string
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        };
        const result = rule.matchString(subject);
        test.equal(result, undefined); // for a valid resource match result should not be produced
        test.done();
    },

    testResourceEdgeWhitespaceSpacesOnlyExtra: function(test) {
        test.expect(2);

        const rule = new ResourceEdgeWhitespace();
        test.ok(rule);

        const resource = new ResourceString({
            key: "resource-edge-whitespace.spaces-only-extra",
            sourceLocale: "en-US",
            source: " ",
            targetLocale: "de-DE",
            target: "  ",
            pathName: "resource-edge-whitespace-test.xliff",
            state: "translated",
        });
        const subject = {
            // all-whitespace string
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        };
        const result = rule.matchString(subject);
        test.deepEqual(
            result,
            new Result({
                rule,
                severity: "error",
                pathName: "a/b/c.xliff",
                locale: "de-DE",
                source: " ",
                id: "resource-edge-whitespace.spaces-only-extra",
                description: "Leading whitespace in target does not match leading whitespace in source",
                highlight: `Source: <e0>⎵</e0> Target: <e1>⎵⎵</e1>`,
            })
        );
        test.done();
    },

    testResourceEdgeWhitespaceUndefinedSource: function(test) {
        test.expect(2);

        const rule = new ResourceEdgeWhitespace();
        test.ok(rule);

        const resource = new ResourceString({
            key: "resource-edge-whitespace.undefined-source",
            sourceLocale: "en-US",
            source: undefined,
            targetLocale: "de-DE",
            target: " ",
            pathName: "resource-edge-whitespace-test.xliff",
            state: "translated",
        });
        const subject = {
            // missing source
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        };
        const result = rule.matchString(subject);
        test.equal(result, undefined); // this rule should not process a resource where source is not a string
        test.done();
    },

    testResourceEdgeWhitespaceUndefinedTarget: function(test) {
        test.expect(2);

        const rule = new ResourceEdgeWhitespace();
        test.ok(rule);

        const resource = new ResourceString({
            key: "resource-edge-whitespace.undefined-target",
            sourceLocale: "en-US",
            source: " ",
            targetLocale: "de-DE",
            target: undefined,
            pathName: "resource-edge-whitespace-test.xliff",
            state: "translated",
        });
        const subject = {
            // missing target
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        };
        const result = rule.matchString(subject);
        test.equal(result, undefined); // this rule should not process a resource where target is not a string
        test.done();
    },

    testResourceCompletenessResourceComplete: function(test) {
        test.expect(2);

        const rule = new ResourceCompleteness();
        test.ok(rule);

        const resource = new ResourceString({
            key: "resource-completeness-test.complete",
            sourceLocale: "en-US",
            source: "Some source string.",
            targetLocale: "de-DE",
            target: "Some target string.",
            pathName: "completeness-test.xliff",
            state: "translated",
        });
        const subject = {
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        };

        const result = rule.matchString(subject);
        test.equal(result, undefined); // for a valid resource match result should not be produced
        test.done();
    },

    testResourceCompletenessResourceExtraTarget: function(test) {
        test.expect(2);

        const rule = new ResourceCompleteness();
        test.ok(rule);

        const resource = new ResourceString({
            key: "resource-completeness-test.extra-target",
            sourceLocale: "en-US",
            source: undefined,
            targetLocale: "de-DE",
            target: "Some target string.",
            pathName: "completeness-test.xliff",
            state: "translated",
        });
        const subject = {
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        };

        const result = rule.matchString(subject);
        test.deepEqual(
            result,
            new Result({
                rule,
                severity: "warning",
                pathName: "a/b/c.xliff",
                locale: "de-DE",
                source: undefined,
                id: "resource-completeness-test.extra-target",
                description: "Extra target string in resource",
                highlight: "<e0>Some target string.</e0>",
            })
        );
        test.done();
    },

    testResourceCompletenessResourceTargetMissing: function(test) {
        test.expect(2);

        const rule = new ResourceCompleteness();
        test.ok(rule);

        const resource = new ResourceString({
            key: "resource-completeness-test.target-missing",
            sourceLocale: "en-US",
            source: "Some source string.",
            targetLocale: "de-DE",
            target: undefined,
            pathName: "completeness-test.xliff",
            state: "translated",
        });
        const subject = {
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        };

        const result = rule.matchString(subject);
        test.deepEqual(
            result,
            new Result({
                rule,
                severity: "error",
                pathName: "a/b/c.xliff",
                locale: "de-DE",
                source: "Some source string.",
                id: "resource-completeness-test.target-missing",
                description: "Missing target string in resource",
                highlight: undefined,
            })
        );
        test.done();
    },

    testResourceCompletenessResourceTargetMissingSameLanguage: function(test) {
        test.expect(2);

        const rule = new ResourceCompleteness();
        test.ok(rule);

        const resource = new ResourceString({
            key: "resource-completeness-test.target-missing-same-language",
            sourceLocale: "en-US",
            source: "Some source string.",
            targetLocale: "en-GB",
            target: undefined,
            pathName: "completeness-test.xliff",
            state: "translated",
        });
        const subject = {
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        };

        const result = rule.matchString(subject);
        // no error should be produced -
        // en-US and en-GB have same language so target value is optional in this case
        // (it can be ommited for those resources where target is equal to source)
        test.equal(result, undefined);
        test.done()
    },

    testResourceDNTTerms: function(test) {
        test.expect(2);

        const rule = new ResourceDNTTerms({
            terms: [
                "Some DNT term"
            ]
        });
        test.ok(rule);

        const subject = new IntermediateRepresentation({
            filePath: "a/b/c.xliff",
            type: "resource",
            ir: [new ResourceString({
                key: "resource-dnt-test.dnt-missing",
                sourceLocale: "en-US",
                source: "Some source string with Some DNT term in it.",
                targetLocale: "de-DE",
                target: "Some target string with an incorrecly translated DNT term in it.",
                pathName: "dnt-test.xliff",
                state: "translated",
            })]
        });

        const result = rule.match({
            ir: subject,
            file: "a/b/c.xliff"
        });
        test.deepEqual(
            result,
            new Result({
                rule,
                severity: "error",
                pathName: "a/b/c.xliff",
                locale: "de-DE",
                source: "Some source string with Some DNT term in it.",
                id: "resource-dnt-test.dnt-missing",
                description: "A DNT term is missing in target string.",
                highlight: `Missing term: <e0>Some DNT term</e0>`,
            })
        );
        test.done();
    },

    testResourceDNTTermsWithTermsFromTxtFile: function(test) {
        test.expect(2);

        // "Some DNT term" from TXT file should be matched

        const rule = new ResourceDNTTerms({
            termsFilePath: "./test/testfiles/dnt-test.txt",
        });
        test.ok(rule);

        const subject = new IntermediateRepresentation({
            filePath: "a/b/c.xliff",
            type: "resource",
            ir: [new ResourceString({
                key: "resource-dnt-test.dnt-terms-from-txt",
                sourceLocale: "en-US",
                source: "Some source string with Some DNT term in it.",
                targetLocale: "de-DE",
                target: "Some target string with an incorrecly translated DNT term in it.",
                pathName: "dnt-test.xliff",
                state: "translated",
            })]
        });

        const result = rule.match({
            ir: subject,
            file: "a/b/c.xliff"
        });
        test.deepEqual(
            result,
            new Result({
                rule,
                severity: "error",
                pathName: "a/b/c.xliff",
                locale: "de-DE",
                source: "Some source string with Some DNT term in it.",
                id: "resource-dnt-test.dnt-terms-from-txt",
                description: "A DNT term is missing in target string.",
                highlight: `Missing term: <e0>Some DNT term</e0>`,
            })
        );
        test.done();
    },

    testResourceDNTTermsWithTermsFromJsonFile: function(test) {
        test.expect(2);

        // "Some DNT term" from JSON file should be matched

        const rule = new ResourceDNTTerms({
            termsFilePath: "./test/testfiles/dnt-test.json",
        });
        test.ok(rule);

        const subject = new IntermediateRepresentation({
            filePath: "a/b/c.xliff",
            type: "resource",
            ir: [new ResourceString({
                key: "resource-dnt-test.dnt-terms-from-json",
                sourceLocale: "en-US",
                source: "Some source string with Some DNT term in it.",
                targetLocale: "de-DE",
                target: "Some target string with an incorrecly translated DNT term in it.",
                pathName: "dnt-test.xliff",
                state: "translated",
            })]
        });

        const result = rule.match({
            ir: subject,
            file: "a/b/c.xliff"
        });
        test.deepEqual(
            result,
            new Result({
                rule,
                severity: "error",
                pathName: "a/b/c.xliff",
                locale: "de-DE",
                source: "Some source string with Some DNT term in it.",
                id: "resource-dnt-test.dnt-terms-from-json",
                description: "A DNT term is missing in target string.",
                highlight: `Missing term: <e0>Some DNT term</e0>`,
            })
        );
        test.done();
    },

    testResourceDNTTermsMultiple: function(test) {
        test.expect(2);

        const rule = new ResourceDNTTerms({
            terms: [
                "Some DNT term",
                "Another DNT term",
                "Yet another DNT term",
            ]
        });
        test.ok(rule);

        const subject = new IntermediateRepresentation({
            filePath: "a/b/c.xliff",
            type: "resource",
            ir: [new ResourceString({
                key: "resource-dnt-test.dnt-missing-multiple",
                sourceLocale: "en-US",
                source: "Some source string with Some DNT term and Another DNT term in it.",
                targetLocale: "de-DE",
                target: "Some target string with an incorrecly translated DNT term and another incorrecly translated DNT term in it.",
                pathName: "dnt-test.xliff",
                state: "translated",
            })]
        });

        const result = rule.match({
            ir: subject,
            file: "a/b/c.xliff"
        });
        test.deepEqual(
            result,
            [
                new Result({
                    rule,
                    severity: "error",
                    pathName: "a/b/c.xliff",
                    locale: "de-DE",
                    source: "Some source string with Some DNT term and Another DNT term in it.",
                    id: "resource-dnt-test.dnt-missing-multiple",
                    description: "A DNT term is missing in target string.",
                    highlight: `Missing term: <e0>Some DNT term</e0>`,
                }),
                new Result({
                    rule,
                    severity: "error",
                    pathName: "a/b/c.xliff",
                    locale: "de-DE",
                    source: "Some source string with Some DNT term and Another DNT term in it.",
                    id: "resource-dnt-test.dnt-missing-multiple",
                    description: "A DNT term is missing in target string.",
                    highlight: `Missing term: <e0>Another DNT term</e0>`,
                })
            ]
        );
        test.done();
    },

    testResourceDNTTermsResourceArray: function(test) {
        test.expect(2);

        const rule = new ResourceDNTTerms({
            terms: [
                "Some DNT term"
            ]
        });
        test.ok(rule);

        const subject = new IntermediateRepresentation({
            filePath: "a/b/c.xliff",
            type: "resource",
            ir: [new ResourceArray({
                key: "resource-dnt-test.dnt-missing-resource-array",
                sourceLocale: "en-US",
                source: ["not a DNT term item", "Some DNT term item"],
                targetLocale: "de-DE",
                target: ["translated term item", "incorrecly translated DNT term item"],
                pathName: "dnt-test.xliff",
                state: "translated",
            })]
        });

        const result = rule.match({
            ir: subject,
            file: "a/b/c.xliff"
        });
        test.deepEqual(
            result,
            new Result({
                rule,
                severity: "error",
                pathName: "a/b/c.xliff",
                locale: "de-DE",
                source: "Some DNT term item",
                id: "resource-dnt-test.dnt-missing-resource-array",
                description: "A DNT term is missing in target string.",
                highlight: `Missing term: <e0>Some DNT term</e0>`,
            })
        );
        test.done();
    },

    testResourceDNTTermsResourcePluralAllCategories: function(test) {
        test.expect(2);

        const rule = new ResourceDNTTerms({
            terms: [
                "Some DNT term",
                "Another DNT term"
            ]
        });
        test.ok(rule);

        const subject = new IntermediateRepresentation({
            filePath: "a/b/c.xliff",
            type: "resource",
            ir: [new ResourcePlural({
                key: "resource-dnt-test.dnt-missing-resource-plural-all-categories",
                sourceLocale: "en-US",
                source: {
                    "one": "This is Some DNT term singular",
                    "other": "This is Some DNT term many"
                },
                targetLocale: "de-DE",
                target: {
                    "one": "This is incorrectly translated DNT term singular",
                    "two": "This is incorrectly translated DNT term double",
                    "many": "This is correctly translated Some DNT term many"
                },
                pathName: "dnt-test.xliff",
                state: "translated",
            })]
        });

        const result = rule.match({
            ir: subject,
            file: "a/b/c.xliff"
        });
        test.deepEqual(result, [
            new Result({
                rule,
                severity: "error",
                pathName: "a/b/c.xliff",
                locale: "de-DE",
                source: "This is Some DNT term singular",
                id: "resource-dnt-test.dnt-missing-resource-plural-all-categories",
                description: "A DNT term is missing in target string.",
                highlight: `Missing term: <e0>Some DNT term</e0>`,
            }),
            new Result({
                rule,
                severity: "error",
                pathName: "a/b/c.xliff",
                locale: "de-DE",
                // no category `two` defined in source, so use "other"
                source: "This is Some DNT term many",
                id: "resource-dnt-test.dnt-missing-resource-plural-all-categories",
                description: "A DNT term is missing in target string.",
                highlight: `Missing term: <e0>Some DNT term</e0>`,
            }),
        ]);
        test.done();
    },

    testResourceDNTTermsResourcePluralSomeCategories: function(test) {
        test.expect(2);

        const rule = new ResourceDNTTerms({
            terms: [
                "Some DNT term",
                "Another DNT term"
            ]
        });
        test.ok(rule);

        const subject = new IntermediateRepresentation({
            filePath: "a/b/c.xliff",
            type: "resource",
            ir: [new ResourcePlural({
                key: "resource-dnt-test.dnt-missing-resource-plural-some-categories",
                sourceLocale: "en-US",
                source: {
                    "one": "This is Some DNT term singular",
                    "many": "This is not a DNT term many"
                },
                targetLocale: "de-DE",
                target: {
                    "one": "This is incorrectly translated DNT term singular",
                    "two": "This is incorrectly translated DNT term double",
                    "many": "This is correctly translated Some DNT term many"
                },
                pathName: "dnt-test.xliff",
                state: "translated",
            })]
        });

        const result = rule.match({
            ir: subject,
            file: "a/b/c.xliff"
        });
        test.deepEqual(result, new Result({
            rule,
            severity: "error",
            pathName: "a/b/c.xliff",
            locale: "de-DE",
            source: "This is Some DNT term singular",
            id: "resource-dnt-test.dnt-missing-resource-plural-some-categories",
            description: "A DNT term is missing in target string.",
            highlight: `Missing term: <e0>Some DNT term</e0>`,
        }));
        test.done();
    },

    testResourceDNTTermsOk: function(test) {
        test.expect(2);

        const rule = new ResourceDNTTerms({
            terms: [
                "Some DNT term"
            ]
        });
        test.ok(rule);

        const subject = new IntermediateRepresentation({
            filePath: "a/b/c.xliff",
            type: "resource",
            ir: [new ResourceString({
                key: "resource-dnt-test.dnt-ok",
                sourceLocale: "en-US",
                source: "Some source string with Some DNT term in it.",
                targetLocale: "de-DE",
                target: "Some target string with Some DNT term in it.",
                pathName: "dnt-test.xliff",
                state: "translated",
            })]
        });

        const result = rule.match({
            ir: subject,
            file: "a/b/c.xliff"
        });
        test.ok(!result);
        test.done();
    },

    testResourceDNTTermsOkArray: function(test) {
        test.expect(2);

        const rule = new ResourceDNTTerms({
            terms: [
                "Some DNT term"
            ]
        });
        test.ok(rule);

        const subject = new IntermediateRepresentation({
            filePath: "a/b/c.xliff",
            type: "resource",
            ir: [new ResourceArray({
                key: "resource-dnt-test.dnt-ok-resource-array",
                sourceLocale: "en-US",
                source: ["not a DNT term item", "Some DNT term item"],
                targetLocale: "de-DE",
                target: ["translated term item", "correctly translated Some DNT term item"],
                pathName: "dnt-test.xliff",
                state: "translated",
            })]
        });

        const result = rule.match({
            ir: subject,
            file: "a/b/c.xliff"
        });
        test.ok(!result);
        test.done();
    },

    testResourceDNTTermsOkPluralAllCategories: function(test) {
        test.expect(2);

        const rule = new ResourceDNTTerms({
            terms: [
                "Some DNT term"
            ]
        });
        test.ok(rule);

        const subject = new IntermediateRepresentation({
            filePath: "a/b/c.xliff",
            type: "resource",
            ir: [new ResourcePlural({
                key: "resource-dnt-test.dnt-ok-resource-plural-all-categories",
                sourceLocale: "en-US",
                source: {
                    "one": "This is Some DNT term singular",
                    "many": "This is Some DNT term many"
                },
                targetLocale: "de-DE",
                target: {
                    "one": "This is correctly translated Some DNT term singular",
                    "two": "This is correctly translated Some DNT term double",
                    "many": "This is correctly translated Some DNT term many"
                },
                pathName: "dnt-test.xliff",
                state: "translated",
            })]
        });

        const result = rule.match({
            ir: subject,
            file: "a/b/c.xliff"
        });
        test.ok(!result);
        test.done();
    },

    testResourceDNTTermsOkPluralSomeCategories: function(test) {
        test.expect(2);

        const rule = new ResourceDNTTerms({
            terms: [
                "Some DNT term"
            ]
        });
        test.ok(rule);

        const subject = new IntermediateRepresentation({
            filePath: "a/b/c.xliff",
            type: "resource",
            ir: [new ResourcePlural({
                key: "resource-dnt-test.dnt-ok-resource-plural-some-categories",
                sourceLocale: "en-US",
                source: {
                    "one": "This is Some DNT term singular",
                    "many": "This is not a DNT term many"
                },
                targetLocale: "de-DE",
                target: {
                    "one": "This is correctly translated Some DNT term singular",
                    "two": "This is correctly translated not a DNT term double",
                    "many": "This is correctly translated not a DNT term many"
                },
                pathName: "dnt-test.xliff",
                state: "translated",
            })]
        });

        const result = rule.match({
            ir: subject,
            file: "a/b/c.xliff"
        });
        test.ok(!result);
        test.done();
    },

    testResourceDNTTermsParseTermsFromJSONFile: function(test) {
        test.expect(1);

        const terms = ResourceDNTTerms.parseTermsFromJsonFile("./test/testfiles/dnt-test.json");

        test.deepEqual(terms, [
            "Some DNT term",
            "Another DNT term"
        ]);

        test.done();
    },

    testResourceDNTTermsParseTermsFromTxtFile: function(test) {
        test.expect(1);

        const terms = ResourceDNTTerms.parseTermsFromTxtFile("./test/testfiles/dnt-test.txt");

        test.deepEqual(terms, [
            "Some DNT term",
            "Another DNT term",
            "A DNT term that should be trimmed",
            "Yet another DNT term that should be trimmed",
            "A DNT term after an empty line",
        ]);

        test.done();
    },
};

