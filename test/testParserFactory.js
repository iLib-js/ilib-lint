/*
 * testParserFactory.js - test the parser factory
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

import ParserFactory from '../src/ParserFactory.js';
import Parser from '../src/Parser.js';

export const testParserFactory = {
    testParserFactoryNormal: function(test) {
        test.expect(3);

        const parsers = ParserFactory({
            extension: "xliff"
        });

        test.ok(parsers);
        test.equal(parsers.length, 1);
        test.ok(Object.getPrototypeOf(parsers[0], Parser));

        test.done();
    },

    testParserFactoryNotFound: function(test) {
        test.expect(2);

        const parsers = ParserFactory({
            extension: "js"
        });

        test.ok(parsers);
        test.equal(parsers.length, 0);

        test.done();
    }

};

