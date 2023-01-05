/*
 * testFormatterManager.js - test the formatter manager
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
import { Formatter, Result } from 'i18nlint-common';

import FormatterManager from '../src/FormatterManager.js';
import ResourceMatcher from '../src/rules/ResourceMatcher.js';

export const testFormatterManager = {
    testFormatterManagerNormal: function(test) {
        test.expect(3);

        const mgr = new FormatterManager();
        test.ok(mgr);

        const formatter = mgr.get("ansi-console-formatter");

        test.ok(formatter);
        test.ok(formatter instanceof Formatter);

        test.done();
    },

    testFormatterManagerNotFound: function(test) {
        test.expect(2);

        const mgr = new FormatterManager();
        test.ok(mgr);
        const formatter = mgr.get("non-existent");

        test.ok(!formatter);

        test.done();
    },

    testFormatterManagerAddDeclarative: function(test) {
        test.expect(4);

        const mgr = new FormatterManager();
        test.ok(mgr);

        let formatter = mgr.get("minimal-formatter");
        test.ok(!formatter);
        
        mgr.add([{
            "name": "minimal-formatter",
            "description": "A minimalistic formatter that only outputs the path and the highlight",
            "template": "{pathName}\n{highlight}\n",
            "highlightStart": ">>",
            "highlightEnd": "<<"
        }]);
        
        formatter = mgr.get("minimal-formatter");
        test.ok(formatter);
        test.equal(formatter.getName(), "minimal-formatter");

        test.done();
    },

    testFormatterManagerAddDeclarativeRightSize: function(test) {
        test.expect(3);

        const mgr = new FormatterManager();
        test.ok(mgr);

        test.equal(mgr.size(), 1);
        
        mgr.add([{
            "name": "minimal-formatter",
            "description": "A minimalistic formatter that only outputs the path and the highlight",
            "template": "{pathName}\n{highlight}\n",
            "highlightStart": ">>",
            "highlightEnd": "<<"
        }]);
        
        test.equal(mgr.size(), 2);

        test.done();
    },

    testFormatterManagerAddDeclarativeRightFormatter: function(test) {
        test.expect(4);

        const mgr = new FormatterManager();
        test.ok(mgr);

        let formatter = mgr.get("minimal-formatter");
        test.ok(!formatter);
        
        mgr.add([{
            "name": "minimal-formatter",
            "description": "A minimalistic formatter that only outputs the path and the highlight",
            "template": "{pathName}:\n{highlight}\n",
            "highlightStart": ">>",
            "highlightEnd": "<<"
        }]);
        
        formatter = mgr.get("minimal-formatter");
        test.ok(formatter);

        const testrule = new ResourceMatcher({
            "name": "x",
            "description": "x",
            "regexps":["x"],
            "note": "x",
            "sourceLocale": "en-US"
        });
        const actual = formatter.format(new Result({
            pathName: "a/b/c/d.txt",
            highlight: "Target: Do not <e0>add</e0> the context.",
            severity: "error",
            rule: testrule,
            description: `target string cannot contain the word "target"`,
            id: "test.id",
            source: "test"
        }));
        const expected = "a/b/c/d.txt:\nTarget: Do not >>add<< the context.\n";
        test.equal(actual, expected);
        test.done();
    }
};

