/*
 * testResourceNoLazyPlurals.js - test the built-in regular-expression-based rules
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

export const testResourceNoLazyPlurals = {
    testResourceLazyPluralString: function(test) {
        test.expect(8);

        const rule = new ResourceSourceChecker(findRuleDefinition("source-no-lazy-plurals"));
        test.ok(rule);

        const resource = new ResourceString({
            key: "matcher.test",
            sourceLocale: "en-US",
            source: "There are {num} file(s) in the folder.",
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
        test.equal(actual[0].description, "The (s) construct is not allowed in source strings. Use real plural syntax instead.");
        test.equal(actual[0].highlight, "Source: There are {num} <e0>file(s)</e0> in the folder.");
        test.equal(actual[0].pathName, "a/b/c.xliff");

        test.done();
    },

    testResourceNoLazyPluralString: function(test) {
        test.expect(2);

        const rule = new ResourceSourceChecker(findRuleDefinition("source-no-lazy-plurals"));
        test.ok(rule);

        const resource = new ResourceString({
            key: "matcher.test",
            sourceLocale: "en-US",
            source: "There are {num} file in the folder.",
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

    testResourceNoLazyPluralMidWordString: function(test) {
        test.expect(2);

        const rule = new ResourceSourceChecker(findRuleDefinition("source-no-lazy-plurals"));
        test.ok(rule);

        const resource = new ResourceString({
            key: "matcher.test",
            sourceLocale: "en-US",
            source: "There are {num} file(s)asdf in the folder.",
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

    testResourceNoLazyPluralNotPluralString: function(test) {
        test.expect(2);

        const rule = new ResourceSourceChecker(findRuleDefinition("source-no-lazy-plurals"));
        test.ok(rule);

        // no word before the (s) means no match
        const resource = new ResourceString({
            key: "matcher.test",
            sourceLocale: "en-US",
            source: "There are {num} file (s) in the folder.",
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

    testResourceLazyPluralEndOfString: function(test) {
        test.expect(8);

        const rule = new ResourceSourceChecker(findRuleDefinition("source-no-lazy-plurals"));
        test.ok(rule);

        const resource = new ResourceString({
            key: "matcher.test",
            sourceLocale: "en-US",
            source: "There are {num} files in {folderNum} folder(s)",
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
        test.equal(actual[0].description, "The (s) construct is not allowed in source strings. Use real plural syntax instead.");
        test.equal(actual[0].highlight, "Source: There are {num} files in {folderNum} <e0>folder(s)</e0>");
        test.equal(actual[0].pathName, "a/b/c.xliff");

        test.done();
    },

    testResourceLazyPluralBeginningOfString: function(test) {
        test.expect(8);

        const rule = new ResourceSourceChecker(findRuleDefinition("source-no-lazy-plurals"));
        test.ok(rule);

        const resource = new ResourceString({
            key: "matcher.test",
            sourceLocale: "en-US",
            source: "File(s) deleted",
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
        test.equal(actual[0].description, "The (s) construct is not allowed in source strings. Use real plural syntax instead.");
        test.equal(actual[0].highlight, "Source: <e0>File(s)</e0> deleted");
        test.equal(actual[0].pathName, "a/b/c.xliff");

        test.done();
    },

    testResourceLazyPluralMultipleString: function(test) {
        test.expect(13);

        const rule = new ResourceSourceChecker(findRuleDefinition("source-no-lazy-plurals"));
        test.ok(rule);

        const resource = new ResourceString({
            key: "matcher.test",
            sourceLocale: "en-US",
            source: "There are {num} file(s) in the folder(s)",
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

        test.equal(actual[0].severity, "warning");
        test.equal(actual[0].id, "matcher.test");
        test.equal(actual[0].description, "The (s) construct is not allowed in source strings. Use real plural syntax instead.");
        test.equal(actual[0].highlight, "Source: There are {num} <e0>file(s)</e0> in the folder(s)");
        test.equal(actual[0].pathName, "a/b/c.xliff");

        test.equal(actual[1].severity, "warning");
        test.equal(actual[1].id, "matcher.test");
        test.equal(actual[1].description, "The (s) construct is not allowed in source strings. Use real plural syntax instead.");
        test.equal(actual[1].highlight, "Source: There are {num} file(s) in the <e0>folder(s)</e0>");
        test.equal(actual[1].pathName, "a/b/c.xliff");

        test.done();
    },

    testResourceLazyPluralEndingInPunctString: function(test) {
        test.expect(8);

        const rule = new ResourceSourceChecker(findRuleDefinition("source-no-lazy-plurals"));
        test.ok(rule);

        const resource = new ResourceString({
            key: "matcher.test",
            sourceLocale: "en-US",
            source: "There are {num} file(s).",
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
        test.equal(actual[0].description, "The (s) construct is not allowed in source strings. Use real plural syntax instead.");
        test.equal(actual[0].highlight, "Source: There are {num} <e0>file(s)</e0>.");
        test.equal(actual[0].pathName, "a/b/c.xliff");

        test.done();
    }
};
