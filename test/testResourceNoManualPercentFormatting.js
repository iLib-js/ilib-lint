/*
 * testResourceNoManualPercentFormatting.js - test the built-in regular-expression-based rules
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
import { ResourceString, ResourceArray, ResourcePlural } from 'ilib-tools-common';

import ResourceSourceChecker from '../src/rules/ResourceSourceChecker.js';
import { regexRules } from '../src/plugins/BuiltinPlugin.js';

import { Result } from 'i18nlint-common';

function findRuleDefinition(name) {
    return regexRules.find(rule => rule.name === name);
}

export const testResourceNoManualPercentageFormatting = {
    testResourceManualPercentFormatting: function(test) {
        test.expect(8);

        const rule = new ResourceSourceChecker(findRuleDefinition("source-no-manual-percentage-formatting"));
        test.ok(rule);

        const resource = new ResourceString({
            key: "matcher.test",
            sourceLocale: "en-US",
            source: "It is {num}% done.",
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });
        test.ok(actual);
        test.equal(actual.length, 1);

        test.equal(actual[0].severity, "warning");
        test.equal(actual[0].id, "matcher.test");
        test.equal(actual[0].description, "Do not format percentages in English strings. Use a locale-sensitive number formatter and substitute the result of that into this string.");
        test.equal(actual[0].highlight, "Source: It is <e0>{num}%</e0> done.");
        test.equal(actual[0].pathName, "a/b/c.xliff");

        test.done();
    },

    testResourceNoManualPercentFormatting: function(test) {
        test.expect(2);

        const rule = new ResourceSourceChecker(findRuleDefinition("source-no-manual-percentage-formatting"));
        test.ok(rule);

        const resource = new ResourceString({
            key: "matcher.test",
            sourceLocale: "en-US",
            source: "It is {num} done.",
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });
        test.ok(!actual);

        test.done();
    },

    testResourceManualPercentFormattingWithWhitespace: function(test) {
        test.expect(8);

        const rule = new ResourceSourceChecker(findRuleDefinition("source-no-manual-percentage-formatting"));
        test.ok(rule);

        const resource = new ResourceString({
            key: "matcher.test",
            sourceLocale: "en-US",
            source: "It is {num} % done.",
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });
        test.ok(actual);
        test.equal(actual.length, 1);

        test.equal(actual[0].severity, "warning");
        test.equal(actual[0].id, "matcher.test");
        test.equal(actual[0].description, "Do not format percentages in English strings. Use a locale-sensitive number formatter and substitute the result of that into this string.");
        test.equal(actual[0].highlight, "Source: It is <e0>{num} %</e0> done.");
        test.equal(actual[0].pathName, "a/b/c.xliff");

        test.done();
    },

    testResourcePercentNotAfterParam1: function(test) {
        test.expect(2);

        const rule = new ResourceSourceChecker(findRuleDefinition("source-no-manual-percentage-formatting"));
        test.ok(rule);

        const resource = new ResourceString({
            key: "matcher.test",
            sourceLocale: "en-US",
            source: "It is 20% done.",
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });
        test.ok(!actual);

        test.done();
    },

    testResourcePercentNotAfterParam2: function(test) {
        test.expect(2);

        const rule = new ResourceSourceChecker(findRuleDefinition("source-no-manual-percentage-formatting"));
        test.ok(rule);

        const resource = new ResourceString({
            key: "matcher.test",
            sourceLocale: "en-US",
            source: "It is %{num} done.",
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });
        test.ok(!actual);

        test.done();
    },

    testResourcePercentNotAfterParam2: function(test) {
        test.expect(2);

        const rule = new ResourceSourceChecker(findRuleDefinition("source-no-manual-percentage-formatting"));
        test.ok(rule);

        const resource = new ResourceString({
            key: "matcher.test",
            sourceLocale: "en-US",
            source: "%{fileCount} files are in %{folderCount} folders.",
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });
        test.ok(!actual);

        test.done();
    },

    testResourceManualPercentFormattingCrazyParamName: function(test) {
        test.expect(8);

        const rule = new ResourceSourceChecker(findRuleDefinition("source-no-manual-percentage-formatting"));
        test.ok(rule);

        const resource = new ResourceString({
            key: "matcher.test",
            sourceLocale: "en-US",
            source: "It is {numCapital_$foo.bar}% done.",
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });
        test.ok(actual);
        test.equal(actual.length, 1);

        test.equal(actual[0].severity, "warning");
        test.equal(actual[0].id, "matcher.test");
        test.equal(actual[0].description, "Do not format percentages in English strings. Use a locale-sensitive number formatter and substitute the result of that into this string.");
        test.equal(actual[0].highlight, "Source: It is <e0>{numCapital_$foo.bar}%</e0> done.");
        test.equal(actual[0].pathName, "a/b/c.xliff");

        test.done();
    }
};
