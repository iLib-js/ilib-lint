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
import { Parser } from 'i18nlint-common';

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

    testPluginManagerGetRuleSet: function(test) {
        test.expect(2);

        const plgmgr = new PluginManager();
        test.ok(plgmgr);

        const rs = plgmgr.getRuleSet();
        test.ok(rs);

        test.done();
    },

    testPluginManagerGetLoadPlugin: function(test) {
        test.expect(4);

        const plgmgr = new PluginManager();
        test.ok(plgmgr);

        plgmgr.load([
            "i18nlint-plugin-test"
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
            "i18nlint-plugin-test"
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

    testPluginManagerGetLoadPluginRightFormatter: function(test) {
        test.expect(5);

        const plgmgr = new PluginManager();
        test.ok(plgmgr);

        plgmgr.load([
            "i18nlint-plugin-test"
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

    testPluginManagerGetLoadPluginRightRules: function(test) {
        test.expect(8);

        const plgmgr = new PluginManager();
        test.ok(plgmgr);
        const rs = plgmgr.getRuleSet();
        test.ok(rs);
        const size = rs.getSize();

        plgmgr.load([
            "i18nlint-plugin-test"
        ]).then(result => {
            test.ok(result);
            test.equal(rs.getSize(), size + 1); // the plugin added 1 new one

            const rules = rs.getRules("resource");
            test.ok(rules);
            test.equal(rules.length, size + 1);
            test.ok(rules[size] instanceof Function);
            const rule = new rules[size]();
            test.equal(rule.getName(), "resource-test");

            test.done();
        });
    },

};

