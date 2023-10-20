/*
 * testResourceNoNounReplacementParams.js - test the built-in regular-expression-based rules
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

import { Result, IntermediateRepresentation } from 'i18nlint-common';

function findRuleDefinition(name) {
    return regexRules.find(rule => rule.name === name);
}

export const testResourceNoNounReplacementParams = {
    testResourceNounParamTheString: function(test) {
        test.expect(8);

        const rule = new ResourceSourceChecker(findRuleDefinition("source-no-noun-replacement-params"));
        test.ok(rule);

        const resource = new ResourceString({
            key: "matcher.test",
            sourceLocale: "en-US",
            source: "Delete the {fileType}.",
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
        test.equal(actual[0].description, "Do not substitute nouns into UI strings. Use separate strings for each noun instead.");
        test.equal(actual[0].highlight, "Source: Delete <e0>the {fileType}</e0>.");
        test.equal(actual[0].pathName, "a/b/c.xliff");

        test.done();
    },

    testResourceNounParamAString: function(test) {
        test.expect(8);

        const rule = new ResourceSourceChecker(findRuleDefinition("source-no-noun-replacement-params"));
        test.ok(rule);

        const resource = new ResourceString({
            key: "matcher.test",
            sourceLocale: "en-US",
            source: "Delete a {fileType}.",
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
        test.equal(actual[0].description, "Do not substitute nouns into UI strings. Use separate strings for each noun instead.");
        test.equal(actual[0].highlight, "Source: Delete <e0>a {fileType}</e0>.");
        test.equal(actual[0].pathName, "a/b/c.xliff");

        test.done();
    },

    testResourceNounParamAnString: function(test) {
        test.expect(8);

        const rule = new ResourceSourceChecker(findRuleDefinition("source-no-noun-replacement-params"));
        test.ok(rule);

        const resource = new ResourceString({
            key: "matcher.test",
            sourceLocale: "en-US",
            source: "Delete an {fileType}.",
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
        test.equal(actual[0].description, "Do not substitute nouns into UI strings. Use separate strings for each noun instead.");
        test.equal(actual[0].highlight, "Source: Delete <e0>an {fileType}</e0>.");
        test.equal(actual[0].pathName, "a/b/c.xliff");

        test.done();
    },

    testResourceNoNounParamString: function(test) {
        test.expect(2);

        const rule = new ResourceSourceChecker(findRuleDefinition("source-no-noun-replacement-params"));
        test.ok(rule);

        const resource = new ResourceString({
            key: "matcher.test",
            sourceLocale: "en-US",
            source: "Delete the file.",
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

    testResourceParamNoArticleString: function(test) {
        test.expect(2);

        const rule = new ResourceSourceChecker(findRuleDefinition("source-no-noun-replacement-params"));
        test.ok(rule);

        const resource = new ResourceString({
            key: "matcher.test",
            sourceLocale: "en-US",
            source: "Delete {fileName}.",
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

    testResourceNoNounParamWithTheElsewhereString: function(test) {
        test.expect(2);

        const rule = new ResourceSourceChecker(findRuleDefinition("source-no-noun-replacement-params"));
        test.ok(rule);

        const resource = new ResourceString({
            key: "matcher.test",
            sourceLocale: "en-US",
            source: "Delete the file {fileName}?",
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

    testResourceNounParamTheMultipleString: function(test) {
        test.expect(13);

        const rule = new ResourceSourceChecker(findRuleDefinition("source-no-noun-replacement-params"));
        test.ok(rule);

        const resource = new ResourceString({
            key: "matcher.test",
            sourceLocale: "en-US",
            source: "Delete the {fileType} and the {otherFileType}.",
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
        test.equal(actual[0].description, "Do not substitute nouns into UI strings. Use separate strings for each noun instead.");
        test.equal(actual[0].highlight, "Source: Delete <e0>the {fileType}</e0> and the {otherFileType}.");
        test.equal(actual[0].pathName, "a/b/c.xliff");

        test.equal(actual[1].severity, "error");
        test.equal(actual[1].id, "matcher.test");
        test.equal(actual[1].description, "Do not substitute nouns into UI strings. Use separate strings for each noun instead.");
        test.equal(actual[1].highlight, "Source: Delete the {fileType} and <e0>the {otherFileType}</e0>.");
        test.equal(actual[1].pathName, "a/b/c.xliff");

        test.done();
    },

    testResourceNounParamThePluralString: function(test) {
        test.expect(13);

        const rule = new ResourceSourceChecker(findRuleDefinition("source-no-noun-replacement-params"));
        test.ok(rule);

        const resource = new ResourceString({
            key: "matcher.test",
            sourceLocale: "en-US",
            source: "{count, plural, one {Delete the {fileType}.} other {Delete the {fileTypePlural}.}}",
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
        test.equal(actual[0].description, "Do not substitute nouns into UI strings. Use separate strings for each noun instead.");
        test.equal(actual[0].highlight, "Source: {count, plural, one {Delete <e0>the {fileType}</e0>.} other {Delete the {fileTypePlural}.}}");
        test.equal(actual[0].pathName, "a/b/c.xliff");

        test.equal(actual[1].severity, "error");
        test.equal(actual[1].id, "matcher.test");
        test.equal(actual[1].description, "Do not substitute nouns into UI strings. Use separate strings for each noun instead.");
        test.equal(actual[1].highlight, "Source: {count, plural, one {Delete the {fileType}.} other {Delete <e0>the {fileTypePlural}</e0>.}}");
        test.equal(actual[1].pathName, "a/b/c.xliff");

        test.done();
    },

    testResourceNounParamThePlural: function(test) {
        test.expect(13);

        const rule = new ResourceSourceChecker(findRuleDefinition("source-no-noun-replacement-params"));
        test.ok(rule);

        const resource = new ResourcePlural({
            key: "matcher.test",
            sourceLocale: "en-US",
            source: {
                one: "Delete the {fileType}.",
                other: "Delete the {fileTypes}."
            },
            pathName: "a/b/c.xliff"
        });
        const ir = new IntermediateRepresentation({
            type: "resource",
            ir: [resource],
            filePath: "a/b/c.xliff"
        });

        const actual = rule.match({
            file: "a/b/c.xliff",
            ir
        });

        test.ok(actual);
        test.equal(actual.length, 2);

        test.equal(actual[0].severity, "error");
        test.equal(actual[0].id, "matcher.test");
        test.equal(actual[0].description, "Do not substitute nouns into UI strings. Use separate strings for each noun instead.");
        test.equal(actual[0].highlight, "Source: Delete <e0>the {fileType}</e0>.");
        test.equal(actual[0].pathName, "a/b/c.xliff");

        test.equal(actual[1].severity, "error");
        test.equal(actual[1].id, "matcher.test");
        test.equal(actual[1].description, "Do not substitute nouns into UI strings. Use separate strings for each noun instead.");
        test.equal(actual[1].highlight, "Source: Delete <e0>the {fileTypes}</e0>.");
        test.equal(actual[1].pathName, "a/b/c.xliff");

        test.done();
    },

    testResourceNounParamTheArray: function(test) {
        test.expect(13);

        const rule = new ResourceSourceChecker(findRuleDefinition("source-no-noun-replacement-params"));
        test.ok(rule);

        const resource = new ResourceArray({
            key: "matcher.test",
            sourceLocale: "en-US",
            source: [
                "Delete the {fileType}.",
                "Delete the {fileTypes}."
            ],
            pathName: "a/b/c.xliff"
        });
        const ir = new IntermediateRepresentation({
            type: "resource",
            ir: [resource],
            filePath: "a/b/c.xliff"
        });

        const actual = rule.match({
            file: "a/b/c.xliff",
            ir
        });

        test.ok(actual);
        test.equal(actual.length, 2);

        test.equal(actual[0].severity, "error");
        test.equal(actual[0].id, "matcher.test");
        test.equal(actual[0].description, "Do not substitute nouns into UI strings. Use separate strings for each noun instead.");
        test.equal(actual[0].highlight, "Source: Delete <e0>the {fileType}</e0>.");
        test.equal(actual[0].pathName, "a/b/c.xliff");

        test.equal(actual[1].severity, "error");
        test.equal(actual[1].id, "matcher.test");
        test.equal(actual[1].description, "Do not substitute nouns into UI strings. Use separate strings for each noun instead.");
        test.equal(actual[1].highlight, "Source: Delete <e0>the {fileTypes}</e0>.");
        test.equal(actual[1].pathName, "a/b/c.xliff");

        test.done();
    },

    testResourceNounParamTheCapitalsString: function(test) {
        test.expect(18);

        const rule = new ResourceSourceChecker(findRuleDefinition("source-no-noun-replacement-params"));
        test.ok(rule);

        const resource = new ResourceString({
            key: "matcher.test",
            sourceLocale: "en-US",
            source: "Delete The {fileType} And A {fileType} and An {fileType}.",
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });
        test.ok(actual);
        test.equal(actual.length, 3);

        test.equal(actual[0].severity, "error");
        test.equal(actual[0].id, "matcher.test");
        test.equal(actual[0].description, "Do not substitute nouns into UI strings. Use separate strings for each noun instead.");
        test.equal(actual[0].highlight, "Source: Delete <e0>The {fileType}</e0> And A {fileType} and An {fileType}.");
        test.equal(actual[0].pathName, "a/b/c.xliff");

        test.equal(actual[1].severity, "error");
        test.equal(actual[1].id, "matcher.test");
        test.equal(actual[1].description, "Do not substitute nouns into UI strings. Use separate strings for each noun instead.");
        test.equal(actual[1].highlight, "Source: Delete The {fileType} And <e0>A {fileType}</e0> and An {fileType}.");
        test.equal(actual[1].pathName, "a/b/c.xliff");

        test.equal(actual[2].severity, "error");
        test.equal(actual[2].id, "matcher.test");
        test.equal(actual[2].description, "Do not substitute nouns into UI strings. Use separate strings for each noun instead.");
        test.equal(actual[2].highlight, "Source: Delete The {fileType} And A {fileType} and <e0>An {fileType}</e0>.");
        test.equal(actual[2].pathName, "a/b/c.xliff");

        test.done();
    },

    testResourceNounParamNotWholeWordString: function(test) {
        test.expect(2);

        const rule = new ResourceSourceChecker(findRuleDefinition("source-no-noun-replacement-params"));
        test.ok(rule);

        // should not match "a" and "the" when it is not a separate word
        const resource = new ResourceString({
            key: "matcher.test",
            sourceLocale: "en-US",
            source: "Paula {verb} loathe {cucumber}.",
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

    testResourceNounParamTheStartOfString: function(test) {
        test.expect(8);

        const rule = new ResourceSourceChecker(findRuleDefinition("source-no-noun-replacement-params"));
        test.ok(rule);

        const resource = new ResourceString({
            key: "matcher.test",
            sourceLocale: "en-US",
            source: "The {fileType} to delete.",
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
        test.equal(actual[0].description, "Do not substitute nouns into UI strings. Use separate strings for each noun instead.");
        test.equal(actual[0].highlight, "Source: <e0>The {fileType}</e0> to delete.");
        test.equal(actual[0].pathName, "a/b/c.xliff");

        test.done();
    },

    testResourceNounParamTheEndOfString: function(test) {
        test.expect(8);

        const rule = new ResourceSourceChecker(findRuleDefinition("source-no-noun-replacement-params"));
        test.ok(rule);

        const resource = new ResourceString({
            key: "matcher.test",
            sourceLocale: "en-US",
            source: "Delete the {fileType}",
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
        test.equal(actual[0].description, "Do not substitute nouns into UI strings. Use separate strings for each noun instead.");
        test.equal(actual[0].highlight, "Source: Delete <e0>the {fileType}</e0>");
        test.equal(actual[0].pathName, "a/b/c.xliff");

        test.done();
    },

};
