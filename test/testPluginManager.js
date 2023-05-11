/*
 * testPluginManager.js - test the plugin manager
 *
 * Copyright © 2022 JEDLSoft
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

import PluginManager from '../src/PluginManager.js';
import { Parser, Result } from 'i18nlint-common';
import { ResourceString } from 'ilib-tools-common';

export const testPluginManager = {
    testPluginManagerNormal: function(test) {
        test.expect(1);

        const pm = new PluginManager();

        test.ok(pm);

        test.done();
    },

    testPluginManagerGetParserManager: function(test) {
        test.expect(2);

        const plgmgr = new PluginManager();
        test.ok(plgmgr);

        const parserMgr = plgmgr.getParserManager();
        test.ok(parserMgr);

        test.done();
    },

    testPluginManagerGetFormatterManager: function(test) {
        test.expect(2);

        const plgmgr = new PluginManager();
        test.ok(plgmgr);

        const formatterMgr = plgmgr.getFormatterManager();
        test.ok(formatterMgr);

        test.done();
    },

    testPluginManagerGetRuleManager: function(test) {
        test.expect(2);

        const plgmgr = new PluginManager();
        test.ok(plgmgr);

        const rm = plgmgr.getRuleManager();
        test.ok(rm);

        test.done();
    },

    testPluginManagerGetLoadPlugin: function(test) {
        test.expect(4);

        const plgmgr = new PluginManager();
        test.ok(plgmgr);

        plgmgr.load([
            "ilib-lint-plugin-test"
        ]).then(result => {
            test.ok(result);
            test.equal(result.length, 1);
            test.equal(result[0].status, "fulfilled");

            test.done();
        });

    },

    testPluginManagerGetLoadPluginRightParser: function(test) {
        test.expect(6);

        const plgmgr = new PluginManager();
        test.ok(plgmgr);

        plgmgr.load([
            "ilib-lint-plugin-test"
        ]).then(result => {
            test.ok(result);

            const pm = plgmgr.getParserManager();
            test.ok(pm);
            const parsers = pm.get("xyz");
            test.ok(parsers);
            test.equal(parsers.length, 1);

            const testParser = new parsers[0]();
            test.equal(testParser.getName(), "parser-xyz");

            test.done();
        });
    },

    testPluginManagerGetLoadPluginParserWorks: function(test) {
        test.expect(12);

        const plgmgr = new PluginManager();
        test.ok(plgmgr);

        plgmgr.load([
            "ilib-lint-plugin-test"
        ]).then(result => {
            test.ok(result);

            const pm = plgmgr.getParserManager();
            const parsers = pm.get("xyz");
            const testParser = new parsers[0]({filePath: "./test/testfiles/strings.xyz"});
            test.ok(testParser);
            test.equal(testParser.getName(), "parser-xyz");

            const ir = testParser.parse();
            const resources = ir[0].getRepresentation();
            test.ok(resources);
            test.equal(resources.length, 3);

            for (let i = 0; i < 3; i++) {
                test.equal(resources[i].getSource(), `string${i+1}`);
                test.equal(resources[i].getTarget(), `value${i+1}`);
            }
            test.done();
        });
    },

    testPluginManagerGetLoadPluginRightFormatter: function(test) {
        test.expect(5);

        const plgmgr = new PluginManager();
        test.ok(plgmgr);

        plgmgr.load([
            "ilib-lint-plugin-test"
        ]).then(result => {
            test.ok(result);

            const fm = plgmgr.getFormatterManager();
            test.ok(fm);
            const formatter = fm.get("formatter-test");
            test.ok(formatter);
            test.equal(formatter.getName(), "formatter-test");

            test.done();
        });
    },

    testPluginManagerGetLoadPluginFormatterWorks: function(test) {
        test.expect(6);

        const plgmgr = new PluginManager();
        test.ok(plgmgr);
        const fm = plgmgr.getFormatterManager();
        const rm = plgmgr.getRuleManager();

        plgmgr.load([
            "ilib-lint-plugin-test"
        ]).then(result => {
            test.ok(result);

            const formatter = fm.get("formatter-test");
            test.ok(formatter);
            const rule = rm.get("resource-test");
            test.ok(rule);

            const str = formatter.format(new Result({
                severity: "warning",
                description: 'Source string should not contain the word "test"',
                id: "formatter.test",
                highlight: "Source: This string has the word <e0>test</e0> in it.",
                pathName: "z/y/a.xyz",
                rule
            }));

            test.ok(str);
            test.equal(str, `z/y/a.xyz:
__Source_string_should_not_contain_the_word_"test"
__Key:_formatter.test
__Source:_This_string_has_the_word_>>test<<_in_it.
__Rule_(resource-test):_Test_for_the_existence_of_the_word_'test'_in_the_strings.\n`);

            test.done();
        });
    },

    testPluginManagerGetLoadPluginRightRules: function(test) {
        test.expect(9);

        const plgmgr = new PluginManager();
        test.ok(plgmgr);
        const rm = plgmgr.getRuleManager();
        test.ok(rm);
        const size = rm.size();

        plgmgr.load([
            "ilib-lint-plugin-test"
        ]).then(result => {
            test.ok(result);
            test.equal(rm.size(), size + 1); // the plugin added 1 new one

            const rules = rm.getRules();
            test.ok(rules);
            test.equal(rules.length, size + 1);
            test.equal(typeof(rules[size]), 'function');
            const rule = rm.get("resource-test");
            test.equal(Object.getPrototypeOf(rule).constructor.name, "TestRule");
            test.equal(rule.getName(), "resource-test");

            test.done();
        });
    },

    testPluginManagerGetLoadPluginRulesWork: function(test) {
        test.expect(13);

        const plgmgr = new PluginManager();
        test.ok(plgmgr);
        const rm = plgmgr.getRuleManager();
        test.ok(rm);

        plgmgr.load([
            "ilib-lint-plugin-test"
        ]).then(loadResult => {
            test.ok(loadResult);

            const rule = rm.get("resource-test");

            test.ok(rule);
            let result = rule.match({
                locale: "de-DE",
                resource: new ResourceString({
                    key: "quote.test",
                    sourceLocale: "en-US",
                    source: 'This string contains “quotes” in it.',
                    targetLocale: "de-DE",
                    target: 'Diese Zeichenfolge enthält "Anführungszeichen".',
                    pathName: "a/b/c.xliff"
                }),
                file: "x"
            });
            test.ok(!result);

            result = rule.match({
                locale: "de-DE",
                resource: new ResourceString({
                    key: "plugin.test",
                    sourceLocale: "en-US",
                    source: 'This string contains the word test in it.',
                    targetLocale: "de-DE",
                    target: 'Diese Zeichenfolge enthält den Wort "Test" drin.',
                    pathName: "a/b/c.xliff"
                }),
                file: "x"
            });
            test.ok(result);
            test.ok(!Array.isArray(result));
            test.equal(result.severity, "warning");
            test.equal(result.description, 'Source string should not contain the word "test"');
            test.equal(result.rule, rule);
            test.equal(result.id, "plugin.test");
            test.equal(result.highlight, "Source: This string contains the word <e0>test</e0> in it.");
            test.equal(result.pathName, "x");

            test.done();
        });
    },

    testPluginManagerGetLoadPluginRightRuleSets: function(test) {
        test.expect(7);

        const plgmgr = new PluginManager();
        test.ok(plgmgr);
        const rm = plgmgr.getRuleManager();
        test.ok(rm);
        const size = rm.sizeRuleSetDefinitions();

        plgmgr.load([
            "ilib-lint-plugin-test"
        ]).then(result => {
            test.ok(result);
            test.equal(rm.sizeRuleSetDefinitions(), size + 1); // the plugin added 1 new one

            const set = rm.getRuleSetDefinition("test");
            test.ok(set);
            test.ok(set["resource-test"]);
            test.equal(typeof(set["resource-test"]), 'boolean');

            test.done();
        });
    },

    testPluginManagerGetBuiltInRuleSets: function(test) {
        test.expect(8);

        const plgmgr = new PluginManager();
        test.ok(plgmgr);
        const rm = plgmgr.getRuleManager();
        test.ok(rm);
        const size = rm.sizeRuleSetDefinitions();

        test.equal(rm.sizeRuleSetDefinitions(), 1);

        const set = rm.getRuleSetDefinition("generic");
        test.ok(set);
        test.ok(set["resource-icu-plurals"]);
        test.ok(set["resource-url-match"]);
        test.equal(typeof(set["resource-icu-plurals"]), 'boolean');
        test.equal(typeof(set["resource-url-match"]), 'boolean');

        test.done();
    }
};

