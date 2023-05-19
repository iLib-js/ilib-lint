/*
 * testResourceStateChecker.js - test the rule that checks each resource's
 * state attribute
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

import { Result, IntermediateRepresentation } from 'i18nlint-common';

export const testResourceStateChecker = {
    testResourceStateCheckerMatchNoError: function(test) {
        test.expect(2);

        const rule = new ResourceStateChecker({
            // all resources should have this state:
            param: "translated"
        });
        test.ok(rule);

        const actual = rule.match({
            file: "a/b/c.xliff",
            ir: new IntermediateRepresentation({
                type: "resource",
                ir: [new ResourceString({
                    key: "plural.test",
                    sourceLocale: "en-US",
                    source: '{count, plural, one {This is singular} other {This is plural}}',
                    targetLocale: "de-DE",
                    target: "{count, plural, one {Dies ist einzigartig} other {Dies ist mehrerartig}}",
                    pathName: "a/b/c.xliff",
                    state: "translated"
                })],
                filePath: "a/b/c.xliff"
            })
        });
        test.ok(!actual);

        test.done();
    },

    testResourceStateCheckerMatchArrayNoError: function(test) {
        test.expect(2);

        const rule = new ResourceStateChecker({
            // all resources should have this state:
            param: [ "translated", "needs-review" ]
        });
        test.ok(rule);

        const actual = rule.match({
            file: "a/b/c.xliff",
            ir: new IntermediateRepresentation({
                type: "resource",
                ir: [new ResourceString({
                    key: "plural.test",
                    sourceLocale: "en-US",
                    source: '{count, plural, one {This is singular} other {This is plural}}',
                    targetLocale: "de-DE",
                    target: "{count, plural, one {Dies ist einzigartig} other {Dies ist mehrerartig}}",
                    pathName: "a/b/c.xliff",
                    state: "needs-review"
                })],
                filePath: "a/b/c.xliff"
            })
        });
        test.ok(!actual);

        test.done();
    },

    testResourceStateCheckerMatchError: function(test) {
        test.expect(2);

        const rule = new ResourceStateChecker({
            // all resources should have this state:
            param: "translated"
        });
        test.ok(rule);

        const actual = rule.match({
            file: "a/b/c.xliff",
            ir: new IntermediateRepresentation({
                type: "resource",
                ir: [new ResourceString({
                    key: "plural.test",
                    sourceLocale: "en-US",
                    source: '{count, plural, one {This is singular} other {This is plural}}',
                    targetLocale: "de-DE",
                    target: "{count, plural, one {Dies ist einzigartig} other {Dies ist mehrerartig}}",
                    pathName: "a/b/c.xliff",
                    state: "new"
                })],
                filePath: "a/b/c.xliff"
            })
        });
        const expected = new Result({
            severity: "error",
            description: "Resources must have the following state: translated",
            id: "plural.test",
            highlight: 'Resource found with disallowed state: <e0>new</e0>',
            rule,
            pathName: "a/b/c.xliff",
            locale: "de-DE",
            source: '{count, plural, one {This is singular} other {This is plural}}'
        });
        test.deepEqual(actual, expected);

        test.done();
    },

    testResourceStateCheckerMatchArrayError: function(test) {
        test.expect(2);

        const rule = new ResourceStateChecker({
            // all resources should have this state:
            param: [ "translated", "needs-review" ]
        });
        test.ok(rule);

        const actual = rule.match({
            file: "a/b/c.xliff",
            ir: new IntermediateRepresentation({
                type: "resource",
                ir: [new ResourceString({
                    key: "plural.test",
                    sourceLocale: "en-US",
                    source: '{count, plural, one {This is singular} other {This is plural}}',
                    targetLocale: "de-DE",
                    target: "{count, plural, one {Dies ist einzigartig} other {Dies ist mehrerartig}}",
                    pathName: "a/b/c.xliff",
                    state: "new"
                })],
                filePath: "a/b/c.xliff"
            })
        });
        const expected = new Result({
            severity: "error",
            description: "Resources must have one of the following states: translated, needs-review",
            id: "plural.test",
            highlight: 'Resource found with disallowed state: <e0>new</e0>',
            rule,
            pathName: "a/b/c.xliff",
            locale: "de-DE",
            source: '{count, plural, one {This is singular} other {This is plural}}'
        });
        test.deepEqual(actual, expected);

        test.done();
    },

    testResourceStateCheckerMatchDefaultNoError: function(test) {
        test.expect(2);

        const rule = new ResourceStateChecker();
        test.ok(rule);

        const actual = rule.match({
            file: "a/b/c.xliff",
            ir: new IntermediateRepresentation({
                type: "resource",
                ir: [new ResourceString({
                    key: "plural.test",
                    sourceLocale: "en-US",
                    source: '{count, plural, one {This is singular} other {This is plural}}',
                    targetLocale: "de-DE",
                    target: "{count, plural, one {Dies ist einzigartig} other {Dies ist mehrerartig}}",
                    pathName: "a/b/c.xliff",
                    state: "translated"
                })],
                filePath: "a/b/c.xliff"
            })
        });
        test.ok(!actual);

        test.done();
    },

    testResourceStateCheckerMatchDefaultError: function(test) {
        test.expect(2);

        const rule = new ResourceStateChecker();
        test.ok(rule);

        const actual = rule.match({
            file: "a/b/c.xliff",
            ir: new IntermediateRepresentation({
                type: "resource",
                ir: [new ResourceString({
                    key: "plural.test",
                    sourceLocale: "en-US",
                    source: '{count, plural, one {This is singular} other {This is plural}}',
                    targetLocale: "de-DE",
                    target: "{count, plural, one {Dies ist einzigartig} other {Dies ist mehrerartig}}",
                    pathName: "a/b/c.xliff",
                    state: "new"
                })],
                filePath: "a/b/c.xliff"
            })
        });
        const expected = new Result({
            severity: "error",
            description: "Resources must have the following state: translated",
            id: "plural.test",
            highlight: 'Resource found with disallowed state: <e0>new</e0>',
            rule,
            pathName: "a/b/c.xliff",
            locale: "de-DE",
            source: '{count, plural, one {This is singular} other {This is plural}}'
        });
        test.deepEqual(actual, expected);

        test.done();
    },

    testResourceStateCheckerNoState: function(test) {
        test.expect(2);

        const rule = new ResourceStateChecker({
            // all resources should have this state:
            param: [ "translated" ]
        });
        test.ok(rule);

        const actual = rule.match({
            file: "a/b/c.xliff",
            ir: new IntermediateRepresentation({
                type: "resource",
                ir: [new ResourceString({
                    key: "plural.test",
                    sourceLocale: "en-US",
                    source: '{count, plural, one {This is singular} other {This is plural}}',
                    targetLocale: "de-DE",
                    target: "{count, plural, one {Dies ist einzigartig} other {Dies ist mehrerartig}}",
                    pathName: "a/b/c.xliff"
                })],
                filePath: "a/b/c.xliff"
            })
        });
        const expected = new Result({
            severity: "error",
            description: "Resources must have the following state: translated",
            id: "plural.test",
            highlight: 'Resource found with no state.',
            rule,
            pathName: "a/b/c.xliff",
            locale: "de-DE",
            source: '{count, plural, one {This is singular} other {This is plural}}'
        });
        test.deepEqual(actual, expected);

        test.done();
    }
};
