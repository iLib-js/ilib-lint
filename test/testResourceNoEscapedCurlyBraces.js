/*
 * testResourceNoEscapedCurlyBraces.js - test the built-in regular-expression-based rules
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

import ResourceTargetChecker from '../src/rules/ResourceTargetChecker.js';
import ResourceSourceChecker from '../src/rules/ResourceSourceChecker.js';
import { regexRules } from '../src/plugins/BuiltinPlugin.js';

import { Result } from 'i18nlint-common';

function findRuleDefinition(name) {
    return regexRules.find(rule => rule.name === name);
}

export const testResourceNoEscapedCurlyBraces = {
    testResourceNoEscapedSourceCurlies: function(test) {
        test.expect(8);

        const rule = new ResourceSourceChecker(findRuleDefinition("source-no-escaped-curly-braces"));
        test.ok(rule);

        const resource = new ResourceString({
            key: "matcher.test",
            sourceLocale: "en-US",
            source: "The name is '{name}'.",
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
        test.equal(actual[0].description, "There should be no escaped replacement parameters. Use Unicode quotes ‘like this’ (U+2018 and U+2019) or double quotes instead.");
        test.equal(actual[0].highlight, "Source: The name is <e0>'{name}'</e0>.");
        test.equal(actual[0].pathName, "a/b/c.xliff");

        test.done();
    },

    testResourceNoEscapedSourceCurliesMultiple: function(test) {
        test.expect(13);

        const rule = new ResourceSourceChecker(findRuleDefinition("source-no-escaped-curly-braces"));
        test.ok(rule);

        const resource = new ResourceString({
            key: "matcher.test",
            sourceLocale: "en-US",
            source: "The name is '{name}' and the id is '{id}'.",
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
        test.equal(actual[0].description, "There should be no escaped replacement parameters. Use Unicode quotes ‘like this’ (U+2018 and U+2019) or double quotes instead.");
        test.equal(actual[0].highlight, "Source: The name is <e0>'{name}'</e0> and the id is '{id}'.");
        test.equal(actual[0].pathName, "a/b/c.xliff");

        test.equal(actual[1].severity, "error");
        test.equal(actual[1].id, "matcher.test");
        test.equal(actual[1].description, "There should be no escaped replacement parameters. Use Unicode quotes ‘like this’ (U+2018 and U+2019) or double quotes instead.");
        test.equal(actual[1].highlight, "Source: The name is '{name}' and the id is <e0>'{id}'</e0>.");
        test.equal(actual[1].pathName, "a/b/c.xliff");

        test.done();
    },

    testResourceNoEscapedSourceCurliesStart: function(test) {
        test.expect(8);

        const rule = new ResourceSourceChecker(findRuleDefinition("source-no-escaped-curly-braces"));
        test.ok(rule);

        const resource = new ResourceString({
            key: "matcher.test",
            sourceLocale: "en-US",
            source: "'{blank}' is the word, it's got groove, it's got meaning.",
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
        test.equal(actual[0].description, "There should be no escaped replacement parameters. Use Unicode quotes ‘like this’ (U+2018 and U+2019) or double quotes instead.");
        test.equal(actual[0].highlight, "Source: <e0>'{blank}'</e0> is the word, it's got groove, it's got meaning.");
        test.equal(actual[0].pathName, "a/b/c.xliff");

        test.done();
    },

    testResourceNoEscapedSourceCurliesEnd: function(test) {
        test.expect(8);

        const rule = new ResourceSourceChecker(findRuleDefinition("source-no-escaped-curly-braces"));
        test.ok(rule);

        const resource = new ResourceString({
            key: "matcher.test",
            sourceLocale: "en-US",
            source: "Say the word I'm thinking of. Have you heard? The word is '{blank}'",
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
        test.equal(actual[0].description, "There should be no escaped replacement parameters. Use Unicode quotes ‘like this’ (U+2018 and U+2019) or double quotes instead.");
        test.equal(actual[0].highlight, "Source: Say the word I'm thinking of. Have you heard? The word is <e0>'{blank}'</e0>");
        test.equal(actual[0].pathName, "a/b/c.xliff");

        test.done();
    },

    testResourceSkipDoubleQuotedCurlies: function(test) {
        test.expect(2);

        const rule = new ResourceSourceChecker(findRuleDefinition("source-no-escaped-curly-braces"));
        test.ok(rule);

        const resource = new ResourceString({
            key: "matcher.test",
            sourceLocale: "en-US",
            source: 'The name is "{name}".',
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

    testResourceSkipDoubleSingleQuotedCurlies: function(test) {
        test.expect(2);

        const rule = new ResourceSourceChecker(findRuleDefinition("source-no-escaped-curly-braces"));
        test.ok(rule);

        const resource = new ResourceString({
            key: "matcher.test",
            sourceLocale: "en-US",
            source: "The name is ''{name}''.",
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

    testResourceSkipResourcesWithNoCurlies: function(test) {
        test.expect(2);

        const rule = new ResourceSourceChecker(findRuleDefinition("source-no-escaped-curly-braces"));
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

    testResourceSkipResourcesWithNoQuotes: function(test) {
        test.expect(2);

        const rule = new ResourceSourceChecker(findRuleDefinition("source-no-escaped-curly-braces"));
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
    },

    testResourceSkipResourcesWithNoReplacementParam: function(test) {
        test.expect(2);

        const rule = new ResourceSourceChecker(findRuleDefinition("source-no-escaped-curly-braces"));
        test.ok(rule);

        const resource = new ResourceString({
            key: "matcher.test",
            sourceLocale: "en-US",
            source: "The name is a 'word'.",
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

    testResourceTargetNoEscapedSourceCurlies: function(test) {
        test.expect(8);

        const rule = new ResourceTargetChecker(findRuleDefinition("resource-no-escaped-curly-braces"));
        test.ok(rule);

        const resource = new ResourceString({
            key: "matcher.test",
            sourceLocale: "en-US",
            source: "The name is '{name}'.",
            target: "名前は'{name}'です。",
            targetLocale: "ja-JP",
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
        test.equal(actual[0].description, "There should be no escaped replacement parameters in the translation. Use quotes that are native for the target language or use tripled single-quotes instead.");
        test.equal(actual[0].highlight, "Target: 名前は<e0>'{name}'</e0>です。");
        test.equal(actual[0].pathName, "a/b/c.xliff");

        test.done();
    },

    testResourceTargetNoEscapedSourceCurliesMultiple: function(test) {
        test.expect(13);

        const rule = new ResourceTargetChecker(findRuleDefinition("resource-no-escaped-curly-braces"));
        test.ok(rule);

        const resource = new ResourceString({
            key: "matcher.test",
            sourceLocale: "en-US",
            source: "The name is '{name}' and the id is '{id}'.",
            target: "名前は'{name}'、ID は'{id}'です。",
            targetLocale: "ja-JP",
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
        test.equal(actual[0].description, "There should be no escaped replacement parameters in the translation. Use quotes that are native for the target language or use tripled single-quotes instead.");
        test.equal(actual[0].highlight, "Target: 名前は<e0>'{name}'</e0>、ID は'{id}'です。");
        test.equal(actual[0].pathName, "a/b/c.xliff");

        test.equal(actual[1].severity, "error");
        test.equal(actual[1].id, "matcher.test");
        test.equal(actual[1].description, "There should be no escaped replacement parameters in the translation. Use quotes that are native for the target language or use tripled single-quotes instead.");
        test.equal(actual[1].highlight, "Target: 名前は'{name}'、ID は<e0>'{id}'</e0>です。");
        test.equal(actual[1].pathName, "a/b/c.xliff");

        test.done();
    },

    testResourceTargetSkipDoubleQuotedCurlies: function(test) {
        test.expect(2);

        const rule = new ResourceTargetChecker(findRuleDefinition("resource-no-escaped-curly-braces"));
        test.ok(rule);

        const resource = new ResourceString({
            key: "matcher.test",
            sourceLocale: "en-US",
            source: 'The name is "{name}".',
            target: '名前は"{name}"です。',
            targetLocale: "ja-JP",
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

    testResourceTargetSkipDoubleSingleQuotedCurlies: function(test) {
        test.expect(2);

        const rule = new ResourceTargetChecker(findRuleDefinition("resource-no-escaped-curly-braces"));
        test.ok(rule);

        const resource = new ResourceString({
            key: "matcher.test",
            sourceLocale: "en-US",
            source: "The name is ''{name}''.",
            target: "名前は''{name}''です。",
            targetLocale: "ja-JP",
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

    testResourceTargetSkipResourcesWithNoCurlies: function(test) {
        test.expect(2);

        const rule = new ResourceTargetChecker(findRuleDefinition("resource-no-escaped-curly-braces"));
        test.ok(rule);

        const resource = new ResourceString({
            key: "matcher.test",
            sourceLocale: "en-US",
            source: "The name is a word.",
            target: "名前は言葉です。",
            targetLocale: "ja-JP",
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

    testResourceTargetSkipResourcesWithNoQuotes: function(test) {
        test.expect(2);

        const rule = new ResourceTargetChecker(findRuleDefinition("resource-no-escaped-curly-braces"));
        test.ok(rule);

        const resource = new ResourceString({
            key: "matcher.test",
            sourceLocale: "en-US",
            source: "The name is a {word}.",
            target: "名前は{言葉}です。",
            targetLocale: "ja-JP",
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

    testResourceTargetSkipResourcesWithNoReplacementParam: function(test) {
        test.expect(2);

        const rule = new ResourceTargetChecker(findRuleDefinition("resource-no-escaped-curly-braces"));
        test.ok(rule);

        const resource = new ResourceString({
            key: "matcher.test",
            sourceLocale: "en-US",
            source: "The name is a 'word'.",
            target: "名前は'言葉'です。",
            targetLocale: "ja-JP",
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

    testResourceTargetProblemInSourceNotInTarget: function(test) {
        test.expect(2);

        const rule = new ResourceTargetChecker(findRuleDefinition("resource-no-escaped-curly-braces"));
        test.ok(rule);

        const resource = new ResourceString({
            key: "matcher.test",
            sourceLocale: "en-US",
            source: "The name is '{name}'.",
            target: "名前は「{名前}」です。",
            targetLocale: "ja-JP",
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

    testResourceTargetNoEscapedSourceCurliesStart: function(test) {
        test.expect(8);

        const rule = new ResourceTargetChecker(findRuleDefinition("resource-no-escaped-curly-braces"));
        test.ok(rule);

        const resource = new ResourceString({
            key: "matcher.test",
            sourceLocale: "en-US",
            source: "'{blank}' is the word, it's got groove, it's got meaning.",
            target: "'{blank}' ist das Wort",
            targetLocale: "de-DE",
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
        test.equal(actual[0].description, "There should be no escaped replacement parameters in the translation. Use quotes that are native for the target language or use tripled single-quotes instead.");
        test.equal(actual[0].highlight, "Target: <e0>'{blank}'</e0> ist das Wort");
        test.equal(actual[0].pathName, "a/b/c.xliff");

        test.done();
    },

    testResourceTargetNoEscapedSourceCurliesEnd: function(test) {
        test.expect(8);

        const rule = new ResourceTargetChecker(findRuleDefinition("resource-no-escaped-curly-braces"));
        test.ok(rule);

        const resource = new ResourceString({
            key: "matcher.test",
            sourceLocale: "en-US",
            source: "Say the word I'm thinking of. Have you heard? The word is '{blank}'",
            target: "Das Wort ist '{blank}'",
            targetLocale: "de-DE",
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
        test.equal(actual[0].description, "There should be no escaped replacement parameters in the translation. Use quotes that are native for the target language or use tripled single-quotes instead.");
        test.equal(actual[0].highlight, "Target: Das Wort ist <e0>'{blank}'</e0>");
        test.equal(actual[0].pathName, "a/b/c.xliff");

        test.done();
    }
};
