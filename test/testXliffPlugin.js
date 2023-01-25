/*
 * testXliffPlugin.js - test the Xliff plugin
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

import XliffPlugin from '../src/plugins/XliffPlugin.js';
import { Parser } from 'i18nlint-common';

export const testXliffPlugin = {
    testXliffPlugin: function(test) {
        test.expect(1);

        const xp = new XliffPlugin();
        test.ok(xp);

        test.done();
    },

    testXliffPluginGetExtensions: function(test) {
        test.expect(3);

        const xp = new XliffPlugin();
        test.ok(xp);

        const parsers = xp.getParsers();
        test.equal(parsers.length, 1);

        const xliff = new parsers[0]({
            filePath: "x"
        });
        test.equalIgnoringOrder(xliff.getExtensions(), ["xliff", "xlif", "xlf"]);

        test.done();
    },

    testXliffPluginGetParser: function(test) {
        test.expect(3);

        const xp = new XliffPlugin();
        test.ok(xp);

        const parsers = xp.getParsers();
        test.ok(parsers);
        test.equal(parsers.length, 1);

        test.done();
    },

    testXliffParser: function(test) {
        test.expect(4);

        const xp = new XliffPlugin();
        test.ok(xp);

        const parsers = xp.getParsers();
        test.ok(parsers);
        
        const XliffParser = parsers[0];

        const parser = new XliffParser({filePath: "asdf.xliff"});
        test.ok(parser);
        test.ok(parser instanceof Parser);

        test.done();
    },

    testXliffParserGetResources: function(test) {
        test.expect(5);

        const xp = new XliffPlugin();
        test.ok(xp);

        const parsers = xp.getParsers();
        test.ok(parsers);
        
        const XliffParser = parsers[0];

        const parser = new XliffParser({filePath: "./test/testfiles/test.xliff"});
        test.ok(parser);
        parser.parse();

        const resources = parser.getResources();
        test.ok(resources);
        test.equal(resources.length, 1);

        test.done();
    },

    testXliffParserGetResourcesRight: function(test) {
        test.expect(12);

        const xp = new XliffPlugin();
        test.ok(xp);

        const parsers = xp.getParsers();
        test.ok(parsers);
        
        const XliffParser = parsers[0];

        const parser = new XliffParser({filePath: "./test/testfiles/test.xliff"});
        test.ok(parser);
        parser.parse();

        const resources = parser.getResources();
        test.ok(resources);

        test.equal(resources[0].source, "Asdf asdf");
        test.equal(resources[0].sourceLocale, "en-US");
        test.equal(resources[0].target, "foobarfoo");
        test.equal(resources[0].targetLocale, "de-DE");
        test.equal(resources[0].reskey, "foobar");
        test.equal(resources[0].datatype, "plaintext");
        test.equal(resources[0].comment, "foobar is where it's at!");
        test.equal(resources[0].pathName, "foo/bar/asdf.java");

        test.done();
    },
};
