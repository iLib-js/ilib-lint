/*
 * testFileType.js - test the file type object
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

import FileType from '../src/FileType.js';
import Project from '../src/Project.js';
import PluginManager from '../src/PluginManager.js';

const pluginManager = new PluginManager();
const ruleMgr = pluginManager.getRuleManager();

ruleMgr.addRuleSetDefinition("asdf", {
    "resource-icu-plurals": true,
    "resource-quote-style": "localeOnly"
});

const project = new Project("x", {
    locales: ["fr-FR", "nl-NL"],
    pluginManager
}, {});

export const testFileType = {
    testFileTypeConstructorEmpty: function(test) {
        test.expect(1);

        const ft = new FileType({
            name: "test",
            project
        });
        test.ok(ft);

        test.done();
    },

    testFileTypeConstructorInsufficientParamsName: function(test) {
        test.expect(1);

        test.throws(() => {
            const ft = new FileType({
                project
            });
        });

        test.done();
    },

    testFileTypeConstructorInsufficientParamsProject: function(test) {
        test.expect(1);

        test.throws(() => {
            const ft = new FileType({
                name: "test"
            });
        });

        test.done();
    },

    testFileTypeGetName: function(test) {
        test.expect(2);

        const ft = new FileType({
            name: "test",
            project
        });
        test.ok(ft);

        test.equal(ft.getName(), "test");

        test.done();
    },

    testFileTypeGetProject: function(test) {
        test.expect(2);

        const ft = new FileType({
            name: "test",
            project
        });
        test.ok(ft);

        test.equal(ft.getProject(), project);

        test.done();
    },

    testFileTypeGetLocales: function(test) {
        test.expect(2);

        const locales = ["en-US", "de-DE"];
        const ft = new FileType({
            name: "test",
            locales,
            project
        });
        test.ok(ft);

        test.equal(ft.getLocales(), locales);

        test.done();
    },

    testFileTypeGetLocalesFromProject: function(test) {
        test.expect(2);

        const ft = new FileType({
            name: "test",
            project
        });
        test.ok(ft);

        test.equalIgnoringOrder(ft.getLocales(), ["fr-FR", "nl-NL"]);

        test.done();
    },

    testFileTypeGetTemplate: function(test) {
        test.expect(2);

        const template = "[dir]/[locale].json";
        const ft = new FileType({
            name: "test",
            template,
            project
        });
        test.ok(ft);

        test.equal(ft.getTemplate(), template);

        test.done();
    },

    testFileTypeGetRuleSetNamesSingle: function(test) {
        test.expect(2);

        const ruleset = "ruleset1";
        const ft = new FileType({
            name: "test",
            ruleset,
            project
        });
        test.ok(ft);

        test.deepEqual(ft.getRuleSetNames(), [ "ruleset1" ]);

        test.done();
    },

    testFileTypeGetRuleSetNamesMultiple: function(test) {
        test.expect(2);

        const ruleset = [ "ruleset1", "ruleset2" ];
        const ft = new FileType({
            name: "test",
            ruleset,
            project
        });
        test.ok(ft);

        test.deepEqual(ft.getRuleSetNames(), ruleset);

        test.done();
    },

    testFileTypeGetRuleSetNamesSingleArray: function(test) {
        test.expect(2);

        const ruleset = [ "ruleset1" ];
        const ft = new FileType({
            name: "test",
            ruleset,
            project
        });
        test.ok(ft);

        test.deepEqual(ft.getRuleSetNames(), ruleset);

        test.done();
    },

    testFileTypeGetRuleSetNamesUnnamed: function(test) {
        test.expect(4);

        const ruleset = {
            "resource-icu-plurals": true,
            "resource-quote-style": "localeOnly"
        };
        const ft = new FileType({
            name: "test",
            ruleset,
            project
        });
        test.ok(ft);

        const names = ft.getRuleSetNames();
        test.ok(Array.isArray(names));
        test.equal(names.length, 1);
        test.equal(names[0], "test-unnamed-ruleset");

        test.done();
    },

    testFileTypeGetRuleSet: function(test) {
        test.expect(5);

        const ruleset = [ "asdf" ]; // defined at the top of this file
        const ft = new FileType({
            name: "test",
            ruleset,
            project
        });
        test.ok(ft);

        const rules = ft.getRules();

        test.ok(Array.isArray(rules));
        test.equal(rules.length, 2);
        test.equal(typeof(rules[0]), 'object');
        test.equal(typeof(rules[1]), 'object');

        test.done();
    },

};

