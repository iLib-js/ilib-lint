/*
 * testProject.js - test the project object
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

import Project from '../src/Project.js';
import PluginManager from '../src/PluginManager.js';

const pluginManager = new PluginManager();

const genericConfig = {
    // the name is reaquired and should be unique amongst all your projects
    "name": "tester",
    // this is the global set of locales that applies unless something else overrides it
    "locales": [
        "en-US",
        "de-DE",
        "ja-JP",
        "ko-KR"
    ],
    // list of plugins to load
    "plugins": [
        "plugin-test"
    ],
    // default micromatch expressions to exclude from recursive dir searches
    "excludes": [
        "node_modules/**",
        ".git/**",
        "docs/**"
    ],
    // declarative definitions of new rules
    "rules": [
        // test that named parameters like {param} appear in both the source and target
        {
            "type": "resource-matcher",
            "name": "resource-named-params",
            "description": "Ensure that named parameters that appear in the source string are also used in the translated string",
            "note": "The named parameter '{matchString}' from the source string does not appear in the target string",
            "regexps": [ "\\{\\w+\\}" ]
        },
        {
            "type": "source-checker",
            "name": "source-no-normalize",
            "severity": "warning",
            "description": "Ensure that the normalize function is not called.",
            "note": "Do not call the normalize function, as it is deprecated.",
            "regexps": [ "\\.normalize\\s*\\(" ]
        }
    ],
    "formatters": [
        {
            "name": "minimal",
            "description": "A minimalistic formatter that only outputs the path and the highlight",
            "template": "{pathName}\n{highlight}\n",
            "highlightStart": ">>",
            "highlightEnd": "<<"
        }
    ],
    // named rule sets to be used with the file types
    "rulesets": {
        "react-rules": {
            // this is the declarative rule defined above
            "resource-named-params": true,
            // the "localeOnly" is an option that the quote matcher supports
            // so this both includes the rule in the rule set and instantiates
            // it with the "localeOnly" option
            "resource-quote-matcher": "localeOnly"
        },
        "js-rules": {
            "source-no-normalize": true
        }
    },
    // defines common settings for a particular types of file
    "filetypes": {
        "json": {
            // override the general locales
            "locales": [
                "en-US",
                "de-DE",
                "ja-JP"
            ],
            "template": "[dir]/[localeDir]/[basename].json"
        },
        "javascript": {
            "type": "source",
            "ruleset": [
                "js-rules"
            ]
        },
        "jsx": {
            "ruleset": [
                "react-rules"
            ]
        }
    },
    // this maps micromatch path expressions to a file type definition
    "paths": {
        // use the file type defined above
        "src/**/*.json": "json",
        "{src,test}/**/*.js": "javascript",
        "src/**/*.jsx": "jsx",
        // define a file type on the fly
        "**/*.xliff": {
            "ruleset": {
                "formatjs-plural-syntax": true,
                "formatjs-plural-categories": true,
                "formatjs-match-substitution-params": true,
                "match-quote-style": "localeOnly"
            }
        }
    }
};

export const testProject = {
    testProjectConstructorEmpty: function(test) {
        test.expect(1);

        const project = new Project("x", {pluginManager}, {});
        test.ok(project);

        test.done();
    },

    testProjectConstructorInsufficientParamsRoot: function(test) {
        test.expect(1);

        test.throws(() => {
            const project = new Project(undefined, {pluginManager}, {});
        });

        test.done();
    },

    testProjectConstructorInsufficientParamsOptions: function(test) {
        test.expect(1);

        test.throws(() => {
            const project = new Project("x", undefined, {});
        });

        test.done();
    },

    testProjectConstructorInsufficientParamsConfig: function(test) {
        test.expect(1);

        test.throws(() => {
            const project = new Project("x", {pluginManager});
        });

        test.done();
    },

    testProjectGetRoot: function(test) {
        test.expect(2);

        const project = new Project("x", {pluginManager}, {});
        test.ok(project);

        test.equal(project.getRoot(), "x");
        test.done();
    },

    testProjectGetPluginManager: function(test) {
        test.expect(2);

        const project = new Project("x", {pluginManager}, {});
        test.ok(project);

        test.equal(project.getPluginManager(), pluginManager);
        test.done();
    },

    testProjectGetRuleManager: function(test) {
        test.expect(2);

        const project = new Project("x", {pluginManager}, {});
        test.ok(project);

        test.equal(project.getRuleManager(), pluginManager.getRuleManager());
        test.done();
    },

    testProjectGetParserManager: function(test) {
        test.expect(2);

        const project = new Project("x", {pluginManager}, {});
        test.ok(project);

        test.equal(project.getParserManager(), pluginManager.getParserManager());
        test.done();
    },

    testProjectGetExcludes: function(test) {
        test.expect(2);

        const project = new Project("x", {pluginManager}, genericConfig);
        test.ok(project);

        test.equal(project.getExcludes(), genericConfig.excludes);
        test.done();
    },

    testProjectGetOptions: function(test) {
        test.expect(2);

        const options = {
            "test": "x",
            "test2": "y",
            pluginManager
        };
        const project = new Project("x", options, genericConfig);
        test.ok(project);

        test.equal(project.getOptions(), options);
        test.done();
    },

    testProjectGetLocalesOptions: function(test) {
        test.expect(2);

        const options = {
            "locales": ["en-US", "ko-KR"],
            pluginManager
        };
        const project = new Project("x", options, genericConfig);
        test.ok(project);

        test.equal(project.getLocales(), options.locales);
        test.done();
    },

    testProjectGetLocalesFallbackToConfig: function(test) {
        test.expect(2);

        const options = {
            pluginManager
        };
        const project = new Project("x", options, genericConfig);
        test.ok(project);

        test.equal(project.getLocales(), genericConfig.locales);
        test.done();
    },

    testProjectGetFileTypeForPath1: function(test) {
        test.expect(2);

        const project = new Project("x", {pluginManager}, genericConfig);
        test.ok(project);

        const ft = project.getFileTypeForPath("src/foo/ja/asdf.json");
        test.equal(ft.getName(), "json");
        test.done();
    },

    testProjectGetFileTypeForPath2: function(test) {
        test.expect(2);

        const project = new Project("x", {pluginManager}, genericConfig);
        test.ok(project);

        const ft = project.getFileTypeForPath("src/foo/asdf.js");
        test.equal(ft.getName(), "javascript");
        test.done();
    },

    testProjectGetFileTypeForPathUnknown: function(test) {
        test.expect(2);

        const project = new Project("x", {pluginManager}, genericConfig);
        test.ok(project);

        const ft = project.getFileTypeForPath("notsrc/foo/ja/asdf.json");
        test.equal(ft.getName(), "unknown");
        test.done();
    },

    testProjectGetFileTypeForPathNormalizePath: function(test) {
        test.expect(2);

        const project = new Project("x", {pluginManager}, genericConfig);
        test.ok(project);

        const ft = project.getFileTypeForPath("./src/foo/ja/asdf.json");
        test.equal(ft.getName(), "json");
        test.done();
    },

    testProjectGetFileTypeForPathAnonymousFileType: function(test) {
        test.expect(2);

        const project = new Project("x", {pluginManager}, genericConfig);
        test.ok(project);

        const ft = project.getFileTypeForPath("i18n/it-IT.xliff");
        // since it is not a pre-defined xliff with a real name, it uses
        // the mapping's glob as the name
        test.equal(ft.getName(), "**/*.xliff");
        test.done();
    },

    testProjectInit: function(test) {
        test.expect(5);

        const project = new Project("x", {pluginManager}, genericConfig);
        test.ok(project);

        const pluginMgr = project.getPluginManager();
        test.ok(pluginMgr);

        project.init().then((result) => {
            // verify that the init indeed loaded the test plugin
            const fmtmgr = pluginMgr.getFormatterManager();
            const fmtr = fmtmgr.get("formatter-test");
            test.ok(fmtr);

            const parserMgr = pluginMgr.getParserManager();
            const prsr = parserMgr.get("parser-xyz");
            test.ok(prsr);

            const ruleMgr = pluginMgr.getRuleManager();
            const rule = ruleMgr.get("resource-test");
            test.ok(rule);

            test.done();
        });
    },

    testProjectWalk: function(test) {
        test.expect(6);

        const project = new Project("x", {pluginManager}, genericConfig);
        test.ok(project);

        const pluginMgr = project.getPluginManager();
        test.ok(pluginMgr);

        project.init().then((result) => {
            // verify that the init indeed loaded the test plugin
            test.ok(result);

            const files = project.walk("./test/testfiles/js");
            test.ok(files);
            test.equal(files.length, 1);
            test.equal(files[0].getFilePath(), "test/testfiles/js/Path.js");

            test.done();
        });
    },

    testProjectFindIssues: function(test) {
        test.expect(20);

        const project = new Project("x", {pluginManager}, genericConfig);
        test.ok(project);

        const pluginMgr = project.getPluginManager();
        test.ok(pluginMgr);

        project.init().then((result) => {
            // verify that the init indeed loaded the test plugin
            test.ok(result);

            project.walk("./test/testfiles/js");
            const results = project.findIssues(genericConfig.locales);
            test.ok(results);
            test.equal(results.length, 3);

            test.equal(results[0].severity, "warning");
            test.equal(results[0].description, "Do not call the normalize function, as it is deprecated.");
            test.equal(results[0].highlight, '    pathname = Path<e0>.normalize(</e0>pathname);');
            test.equal(results[0].pathName, "test/testfiles/js/Path.js");
            test.equal(results[0].lineNumber, 51);

            test.equal(results[1].severity, "warning");
            test.equal(results[1].description, "Do not call the normalize function, as it is deprecated.");
            test.equal(results[1].highlight, '    return (pathname === ".") ? ".." : Path<e0>.normalize(</e0>pathname + "/..");');
            test.equal(results[1].pathName, "test/testfiles/js/Path.js");
            test.equal(results[1].lineNumber, 52);

            test.equal(results[2].severity, "warning");
            test.equal(results[2].description, "Do not call the normalize function, as it is deprecated.");
            test.equal(results[2].highlight, '    return Path<e0>.normalize(</e0>arr.join("/"));');
            test.equal(results[2].pathName, "test/testfiles/js/Path.js");
            test.equal(results[2].lineNumber, 92);

            test.done();
        });
    },

};

