/*
 * testParserManager.js - test the parser factory
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

import { Parser } from 'i18nlint-common';

import ParserManager from '../src/ParserManager.js';

class MockParser extends Parser {
    constructor(options) {
        super(options);
        this.name = "mock-parser";
        this.extensions = [ "xyz" ];
    }

    getExtensions() {
        return this.extensions;
    }

    parse() {}

    getResources() {
        return [];
    }
}

// does not extend Parser
class NotMockParser {
    constructor(options) {
        this.extensions = [ "xyz" ];
    }

    getExtensions() {
        return this.extensions;
    }
}

export const testParserManager = {
    testParserManagerEmpty: function(test) {
        test.expect(2);

        const mgr = new ParserManager();
        const parsers = mgr.get({
            extension: "js"
        });

        test.ok(parsers);
        test.equal(parsers.length, 0);

        test.done();
    },

    testParserManagerAddParsers: function(test) {
        test.expect(3);

        const mgr = new ParserManager();
        let parsers = mgr.get({
            extension: "xyz"
        });
        test.ok(parsers);
        test.equal(parsers.length, 0);

        mgr.add([MockParser]);
        parsers = mgr.get({
            extension: "xyz"
        });

        test.ok(parsers);
        test.equal(parsers.length, 1);
        test.ok(Object.is(parsers[0], MockParser));

        test.done();
    },

    testParserManagerAddParsersNotParser: function(test) {
        test.expect(2);

        const mgr = new ParserManager();
        let parsers = mgr.get({
            extension: "xyz"
        });
        test.ok(parsers);

        mgr.add([NotMockParser]);
        parsers = mgr.get({
            extension: "xyz"
        });

        test.ok(parsers);
        test.equal(parsers.length, 0);

        test.done();
    }

};

