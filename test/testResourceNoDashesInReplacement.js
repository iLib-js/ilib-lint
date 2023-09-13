/*
 * testResourceNoDashesInReplacement.js - test the built-in regular-expression-based rules
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

export const testResourceNoDashesInReplacement = {
    testResourceNoDashes: function(test) {
        test.expect(8);

        const rule = new ResourceSourceChecker(findRuleDefinition("source-no-dashes-in-replacement-params"));
        test.ok(rule);

        const resource = new ResourceString({
            key: "matcher.test",
            sourceLocale: "en-US",
            source: "The name is {bad-name}.",
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

        test.equal(actual[0].severity, "error");
        test.equal(actual[0].id, "matcher.test");
        test.equal(actual[0].description, "Dashes are not allowed in replacement parameters. Use a different character such as underscore.");
        test.equal(actual[0].highlight, "Source: The name is <e0>{bad-name}</e0>.");
        test.equal(actual[0].pathName, "a/b/c.xliff");

        test.done();
    },

    testResourceNoDashesMultiple: function(test) {
        test.expect(13);

        const rule = new ResourceSourceChecker(findRuleDefinition("source-no-dashes-in-replacement-params"));
        test.ok(rule);

        const resource = new ResourceString({
            key: "matcher.test",
            sourceLocale: "en-US",
            source: "The name is {bad-name} and the id is {dine-n-run}.",
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });
        test.ok(actual);
        test.equal(actual.length, 2);

        test.equal(actual[0].severity, "error");
        test.equal(actual[0].id, "matcher.test");
        test.equal(actual[0].description, "Dashes are not allowed in replacement parameters. Use a different character such as underscore.");
        test.equal(actual[0].highlight, "Source: The name is <e0>{bad-name}</e0> and the id is {dine-n-run}.");
        test.equal(actual[0].pathName, "a/b/c.xliff");

        test.equal(actual[1].severity, "error");
        test.equal(actual[1].id, "matcher.test");
        test.equal(actual[1].description, "Dashes are not allowed in replacement parameters. Use a different character such as underscore.");
        test.equal(actual[1].highlight, "Source: The name is {bad-name} and the id is <e0>{dine-n-run}</e0>.");
        test.equal(actual[1].pathName, "a/b/c.xliff");

        test.done();
    },

    testResourceNoDashesStart: function(test) {
        test.expect(8);

        const rule = new ResourceSourceChecker(findRuleDefinition("source-no-dashes-in-replacement-params"));
        test.ok(rule);

        const resource = new ResourceString({
            key: "matcher.test",
            sourceLocale: "en-US",
            source: "{blank-and-stuff} is the word, it's got groove, it's got meaning.",
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

        test.equal(actual[0].severity, "error");
        test.equal(actual[0].id, "matcher.test");
        test.equal(actual[0].description, "Dashes are not allowed in replacement parameters. Use a different character such as underscore.");
        test.equal(actual[0].highlight, "Source: <e0>{blank-and-stuff}</e0> is the word, it's got groove, it's got meaning.");
        test.equal(actual[0].pathName, "a/b/c.xliff");

        test.done();
    },

    testResourceNoDashesEnd: function(test) {
        test.expect(8);

        const rule = new ResourceSourceChecker(findRuleDefinition("source-no-dashes-in-replacement-params"));
        test.ok(rule);

        const resource = new ResourceString({
            key: "matcher.test",
            sourceLocale: "en-US",
            source: "Say the word I'm thinking of. Have you heard? The word is {love-or-something-like-that}",
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

        test.equal(actual[0].severity, "error");
        test.equal(actual[0].id, "matcher.test");
        test.equal(actual[0].description, "Dashes are not allowed in replacement parameters. Use a different character such as underscore.");
        test.equal(actual[0].highlight, "Source: Say the word I'm thinking of. Have you heard? The word is <e0>{love-or-something-like-that}</e0>");
        test.equal(actual[0].pathName, "a/b/c.xliff");

        test.done();
    },

    testResourceSkipUnderscore: function(test) {
        test.expect(2);

        const rule = new ResourceSourceChecker(findRuleDefinition("source-no-dashes-in-replacement-params"));
        test.ok(rule);

        const resource = new ResourceString({
            key: "matcher.test",
            sourceLocale: "en-US",
            source: 'The name is "{name_or_id}".',
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

    testResourceSkipResourcesWithNoReplacements: function(test) {
        test.expect(2);

        const rule = new ResourceSourceChecker(findRuleDefinition("source-no-dashes-in-replacement-params"));
        test.ok(rule);

        const resource = new ResourceString({
            key: "matcher.test",
            sourceLocale: "en-US",
            source: "The name is a word.",
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

    testResourceSkipResourcesWithNoDashes: function(test) {
        test.expect(2);

        const rule = new ResourceSourceChecker(findRuleDefinition("source-no-dashes-in-replacement-params"));
        test.ok(rule);

        const resource = new ResourceString({
            key: "matcher.test",
            sourceLocale: "en-US",
            source: "The name is a {word}.",
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
    }
};
