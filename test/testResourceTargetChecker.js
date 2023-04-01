/*
 * testResourceTargetChecker.js - test the built-in regular-expression-based rules
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
import { ResourceString } from 'ilib-tools-common';

import ResourceTargetChecker from '../src/rules/ResourceTargetChecker.js';
import { regexRules } from '../src/PluginManager.js';

import { Result } from 'i18nlint-common';

export const testResourceTargetChecker = {
    testResourceNoFullwidth: function(test) {
        test.expect(9);

        const rule = new ResourceTargetChecker(regexRules[2]);
        test.ok(rule);

        const actual = rule.match({
            locale: "ja-JP",
            resource: new ResourceString({
                key: "matcher.test",
                sourceLocale: "en-US",
                source: 'Upload to Box',
                targetLocale: "ja-JP",
                target: "Ｂｏｘにアップロード",
                pathName: "a/b/c.xliff"
            }),
            file: "x/y"
        });
        test.ok(actual);
        test.equal(actual.length, 1);

        test.equal(actual[0].severity, "error");
        test.equal(actual[0].id, "matcher.test");
        test.equal(actual[0].description, "The full width characters 'Ｂｏｘ' are not allowed in the target string. Use ASCII instead.");
        test.equal(actual[0].highlight, "Target: <e0>Ｂｏｘ</e0>にアップロード");
        test.equal(actual[0].source, 'Upload to Box');
        test.equal(actual[0].pathName, "x/y");

        test.done();
    },

    testResourceNoFullwidthSuccess: function(test) {
        test.expect(2);

        const rule = new ResourceTargetChecker(regexRules[2]);
        test.ok(rule);

        const actual = rule.match({
            locale: "ja-JP",
            resource: new ResourceString({
                key: "matcher.test",
                sourceLocale: "en-US",
                source: 'Upload to Box',
                targetLocale: "ja-JP",
                target: "Boxにアップロード",
                pathName: "a/b/c.xliff"
            }),
            file: "x/y"
        });
        test.ok(!actual);

        test.done();
    },

    testResourceNoFullwidthMultiple: function(test) {
        test.expect(15);

        const rule = new ResourceTargetChecker(regexRules[2]);
        test.ok(rule);

        const actual = rule.match({
            locale: "ja-JP",
            resource: new ResourceString({
                key: "matcher.test",
                sourceLocale: "en-US",
                source: 'Upload to Box',
                targetLocale: "ja-JP",
                target: "プロＢｏｘにアップロードＢｏｘ",
                pathName: "a/b/c.xliff"
            }),
            file: "x/y"
        });
        test.ok(actual);
        test.equal(actual.length, 2);

        test.equal(actual[0].severity, "error");
        test.equal(actual[0].id, "matcher.test");
        test.equal(actual[0].description, "The full width characters 'Ｂｏｘ' are not allowed in the target string. Use ASCII instead.");
        test.equal(actual[0].highlight, "Target: プロ<e0>Ｂｏｘ</e0>にアップロードＢｏｘ");
        test.equal(actual[0].source, 'Upload to Box');
        test.equal(actual[0].pathName, "x/y");

        test.equal(actual[1].severity, "error");
        test.equal(actual[1].id, "matcher.test");
        test.equal(actual[1].description, "The full width characters 'Ｂｏｘ' are not allowed in the target string. Use ASCII instead.");
        test.equal(actual[1].highlight, "Target: プロＢｏｘにアップロード<e0>Ｂｏｘ</e0>");
        test.equal(actual[1].source, 'Upload to Box');
        test.equal(actual[1].pathName, "x/y");

        test.done();
    }
};

