/*
 * testProject.js - test the lint object
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

import Lint from '../src/Lint.js';

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

export const testLint = {
    testLintConstructorEmpty: function(test) {
        test.expect(1);

        const options = {
        };

        const project = new Lint(options, genericConfig);
        test.ok(project);

        test.done();
    },

    testLintConstructorWithConfig: function(test) {
        test.expect(1);

        const options = {
        };

        const project = new Lint(options, genericConfig);
        test.ok(project);

        test.done();
    },
};