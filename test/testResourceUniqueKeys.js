/*
 * testResourceUniqueKeys.js - test the resource unique key checker
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

import fs from 'node:fs';
import { Result, IntermediateRepresentation } from 'i18nlint-common';
import { ResourceString } from 'ilib-tools-common';

import ResourceUniqueKeys from '../src/rules/ResourceUniqueKeys.js';

export const testResourceUniqueKeys = {
    testResourceUniqueKeys: function(test) {
        test.expect(1);

        const rule = new ResourceUniqueKeys();
        test.ok(rule);

        test.done();
    },

    testResourceUniqueKeysOneResource: function(test) {
        test.expect(2);

        const rule = new ResourceUniqueKeys();
        test.ok(rule);

        const ir = new IntermediateRepresentation({
            filePath: "a/b/c.xliff",
            type: "resource",
            ir: [new ResourceString({
                key: "resource1",
                sourceLocale: "en-US",
                source: "source string",
                targetLocale: "de-DE",
                target: "target string",
                pathName: "a/b/c.xliff",
                state: "translated",
            })]
        });
        const actual = rule.match({
            ir,
            file: "a/b/c.xliff"
        });
        test.ok(!actual);

        test.done();
    },

    testResourceUniqueKeysTwoResourcesOkay: function(test) {
        test.expect(2);

        const rule = new ResourceUniqueKeys();
        test.ok(rule);

        const ir = new IntermediateRepresentation({
            filePath: "a/b/c.xliff",
            type: "resource",
            ir: [new ResourceString({
                key: "resource1",
                sourceLocale: "en-US",
                source: "source string",
                targetLocale: "de-DE",
                target: "target string",
                pathName: "a/b/c.xliff",
                state: "translated",
            }),new ResourceString({
                key: "resource2",
                sourceLocale: "en-US",
                source: "source string",
                targetLocale: "de-DE",
                target: "target string",
                pathName: "a/b/c.xliff",
                state: "translated",
            })]
        });
        const actual = rule.match({
            ir,
            file: "a/b/c.xliff"
        });
        test.ok(!actual);

        test.done();
    },

    testResourceUniqueKeysTwoResourcesConflicting: function(test) {
        test.expect(7);

        const rule = new ResourceUniqueKeys();
        test.ok(rule);

        const ir = new IntermediateRepresentation({
            filePath: "a/b/c.xliff",
            type: "resource",
            ir: [new ResourceString({
                key: "resource1",
                sourceLocale: "en-US",
                source: "source string",
                targetLocale: "de-DE",
                target: "target string",
                pathName: "a/b/c.xliff",
                state: "translated",
            }),new ResourceString({
                key: "resource1",
                sourceLocale: "en-US",
                source: "source string",
                targetLocale: "de-DE",
                target: "target string",
                pathName: "a/b/c.xliff",
                state: "translated",
            })]
        });
        const actual = rule.match({
            ir,
            file: "a/b/c.xliff"
        });
        test.ok(actual);
        test.equal(actual.length, 1);

        test.equal(actual[0].severity, "error");
        test.equal(actual[0].description, "Key is not unique within locale de-DE.");
        test.equal(actual[0].highlight, 'Key is also defined in this file: a/b/c.xliff');
        test.equal(actual[0].pathName, "a/b/c.xliff");

        test.done();
    },

    testResourceUniqueKeysMultipleResourcesConflicting: function(test) {
        test.expect(11);

        const rule = new ResourceUniqueKeys();
        test.ok(rule);

        const ir = new IntermediateRepresentation({
            filePath: "a/b/c.xliff",
            type: "resource",
            ir: [new ResourceString({
                key: "resource1",
                sourceLocale: "en-US",
                source: "source string",
                targetLocale: "de-DE",
                target: "target string",
                pathName: "a/b/c.xliff",
                state: "translated",
            }),new ResourceString({
                key: "resource1",
                sourceLocale: "en-US",
                source: "source string",
                targetLocale: "de-DE",
                target: "target string",
                pathName: "a/b/c.xliff",
                state: "translated",
            }),new ResourceString({
                key: "resource2",
                sourceLocale: "en-US",
                source: "source string",
                targetLocale: "de-DE",
                target: "target string",
                pathName: "a/b/c.xliff",
                state: "translated",
            }),new ResourceString({
                key: "resource2",
                sourceLocale: "en-US",
                source: "source string",
                targetLocale: "de-DE",
                target: "target string",
                pathName: "a/b/c.xliff",
                state: "translated",
            })]
        });
        const actual = rule.match({
            ir,
            file: "a/b/c.xliff"
        });
        test.ok(actual);
        test.equal(actual.length, 2);

        test.equal(actual[0].severity, "error");
        test.equal(actual[0].description, "Key is not unique within locale de-DE.");
        test.equal(actual[0].highlight, 'Key is also defined in this file: a/b/c.xliff');
        test.equal(actual[0].pathName, "a/b/c.xliff");

        test.equal(actual[1].severity, "error");
        test.equal(actual[1].description, "Key is not unique within locale de-DE.");
        test.equal(actual[1].highlight, 'Key is also defined in this file: a/b/c.xliff');
        test.equal(actual[1].pathName, "a/b/c.xliff");

        test.done();
    },

    testResourceUniqueKeysMultipleResourcesOkay: function(test) {
        test.expect(2);

        const rule = new ResourceUniqueKeys();
        test.ok(rule);

        const ir = new IntermediateRepresentation({
            filePath: "a/b/c.xliff",
            type: "resource",
            ir: [new ResourceString({
                key: "resource1",
                sourceLocale: "en-US",
                source: "source string",
                targetLocale: "de-DE",
                target: "target string",
                pathName: "a/b/c.xliff",
                state: "translated",
            }),new ResourceString({
                key: "resource2",
                sourceLocale: "en-US",
                source: "source string",
                targetLocale: "de-DE",
                target: "target string",
                pathName: "a/b/c.xliff",
                state: "translated",
            }),new ResourceString({
                key: "resource3",
                sourceLocale: "en-US",
                source: "source string",
                targetLocale: "de-DE",
                target: "target string",
                pathName: "a/b/c.xliff",
                state: "translated",
            }),new ResourceString({
                key: "resource4",
                sourceLocale: "en-US",
                source: "source string",
                targetLocale: "de-DE",
                target: "target string",
                pathName: "a/b/c.xliff",
                state: "translated",
            })]
        });
        const actual = rule.match({
            ir,
            file: "a/b/c.xliff"
        });
        test.ok(!actual);

        test.done();
    },
};
