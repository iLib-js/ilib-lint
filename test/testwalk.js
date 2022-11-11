/*
 * testwalk.js - test the assemble utility
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

import walk from '../src/walk.js';

export const testwalk = {
    testWalkDir: function(test) {
        test.expect(2);
        const files = walk("test/ilib-mock", {quiet: true}).sort();
        test.equal(files.length, 11);
        const expected = [
            "test/ilib-mock/assemble.mjs",
            "test/ilib-mock/ilib-mock-1.0.0.tgz",
            "test/ilib-mock/index.js",
            "test/ilib-mock/locale/de/DE/mockdata.json",
            "test/ilib-mock/locale/de/mockdata.json",
            "test/ilib-mock/locale/en/mockdata.json",
            "test/ilib-mock/locale/en/US/mockdata.json",
            "test/ilib-mock/locale/mockdata.json",
            "test/ilib-mock/locale/und/DE/mockdata.json",
            "test/ilib-mock/locale/und/US/mockdata.json",
            "test/ilib-mock/package.json"
        ];
        test.equalIgnoringOrder(files, expected);

        test.done();
    },

    testWalkFile: function(test) {
        test.expect(2);
        const files = walk("test/ilib-mock/index.js", {quiet: true}).sort();
        test.equal(files.length, 1);
        test.equal(files[0], "test/ilib-mock/index.js");

        test.done();
    },

    testWalkNonExistentDir: function(test) {
        test.expect(1);
        const files = walk("test/ilib-mock/asdf", {quiet: true}).sort();
        test.equal(files.length, 0);

        test.done();
    },

    testWalkFileNonJSFile: function(test) {
        test.expect(1);
        const files = walk("test/ilib-mock/locale/mockdata.json", {quiet: true}).sort();
        test.equal(files.length, 1);

        test.done();
    },

    testWalkBadParamsUndefined: function(test) {
        test.expect(1);
        const files = walk({quiet: true}).sort();
        test.equal(files.length, 0);

        test.done();
    },

    testWalkBadParamsBoolean: function(test) {
        test.expect(1);
        const files = walk(true, {quiet: true}).sort();
        test.equal(files.length, 0);

        test.done();
    },

    testWalkBadParamsNumber: function(test) {
        test.expect(1);
        const files = walk(3, {quiet: true}).sort();
        test.equal(files.length, 0);

        test.done();
    },

    testWalkDirWithJsonExtension: function(test) {
        test.expect(8);
        const extensions = new Set();
        extensions.add(".json");
        const files = walk("test/ilib-mock/locale", {quiet: true, extensions }).sort();
        test.equal(files.length, 7);
        test.equal(files[0], "test/ilib-mock/locale/de/DE/mockdata.json");
        test.equal(files[1], "test/ilib-mock/locale/de/mockdata.json");
        test.equal(files[2], "test/ilib-mock/locale/en/US/mockdata.json");
        test.equal(files[3], "test/ilib-mock/locale/en/mockdata.json");
        test.equal(files[4], "test/ilib-mock/locale/mockdata.json");
        test.equal(files[5], "test/ilib-mock/locale/und/DE/mockdata.json");
        test.equal(files[6], "test/ilib-mock/locale/und/US/mockdata.json");

        test.done();
    },

    testWalkDirWithExcludes: function(test) {
        test.expect(2);
        const files = walk("test/ilib-mock", {
            quiet: true,
            excludes: [ "**/*.json" ]
        }).sort();
        test.equal(files.length, 3);
        const expected = [
            "test/ilib-mock/assemble.mjs",
            "test/ilib-mock/ilib-mock-1.0.0.tgz",
            "test/ilib-mock/index.js"
        ];
        test.equalIgnoringOrder(files, expected);

        test.done();
    },

    testWalkDirWithMultipleExcludes: function(test) {
        test.expect(2);
        const files = walk("test/ilib-mock", {
            quiet: true,
            excludes: [ "**/*.json", "*.mjs" ]
        }).sort();
        test.equal(files.length, 3);
        const expected = [
            "test/ilib-mock/ilib-mock-1.0.0.tgz",
            "test/ilib-mock/index.js"
        ];
        test.equalIgnoringOrder(files, expected);

        test.done();
    },

    testWalkDirWithExcludesAndIncludes: function(test) {
        test.expect(2);
        const files = walk("test/ilib-mock", {
            quiet: true,
            excludes: [ "**/*.json" ],
            includes: [ "**/package.json" ]
        }).sort();
        test.equal(files.length, 4);
        const expected = [
            "test/ilib-mock/assemble.mjs",
            "test/ilib-mock/ilib-mock-1.0.0.tgz",
            "test/ilib-mock/index.js",
            "test/ilib-mock/package.json"
        ];
        test.equalIgnoringOrder(files, expected);

        test.done();
    }
};
