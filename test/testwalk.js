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
import SourceFile from '../src/SourceFile.js';

function cmp(left, right) {
    return (left.pathName < right.pathName) ? -1 :
        ((left.pathName > right.pathName) ? 1 : 0);
}

export const testWalk = {
    testWalkDir: function(test) {
        test.expect(2);
        const files = walk("test/ilib-mock", {quiet: true}).sort(cmp);
        test.equal(files.length, 11);
        const expected = [
            new SourceFile({filePath: "test/ilib-mock/assemble.mjs"}),
            new SourceFile({filePath: "test/ilib-mock/ilib-mock-1.0.0.tgz"}),
            new SourceFile({filePath: "test/ilib-mock/index.js"}),
            new SourceFile({filePath: "test/ilib-mock/locale/de/DE/mockdata.json"}),
            new SourceFile({filePath: "test/ilib-mock/locale/de/mockdata.json"}),
            new SourceFile({filePath: "test/ilib-mock/locale/en/US/mockdata.json"}),
            new SourceFile({filePath: "test/ilib-mock/locale/en/mockdata.json"}),
            new SourceFile({filePath: "test/ilib-mock/locale/mockdata.json"}),
            new SourceFile({filePath: "test/ilib-mock/locale/und/DE/mockdata.json"}),
            new SourceFile({filePath: "test/ilib-mock/locale/und/US/mockdata.json"}),
            new SourceFile({filePath: "test/ilib-mock/package.json"})
        ];
        test.equalIgnoringOrder(files, expected);

        test.done();
    },

    testWalkFile: function(test) {
        test.expect(2);
        const files = walk("test/ilib-mock/index.js", {quiet: true});
        test.equal(files.length, 1);
        test.deepEqual(files[0], new SourceFile({filePath: "test/ilib-mock/index.js"}));

        test.done();
    },

    testWalkNonExistentDir: function(test) {
        test.expect(1);
        const files = walk("test/ilib-mock/asdf", {quiet: true}).sort(cmp);
        test.equal(files.length, 0);

        test.done();
    },

    testWalkFileNonJSFile: function(test) {
        test.expect(1);
        const files = walk("test/ilib-mock/locale/mockdata.json", {quiet: true}).sort(cmp);
        test.equal(files.length, 1);

        test.done();
    },

    testWalkBadParamsUndefined: function(test) {
        test.expect(1);
        const files = walk({quiet: true}).sort(cmp);
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
        test.expect(2);
        const config = {
            paths: {
                "**/*.json": {
                }
            }
        };
        const files = walk("test/ilib-mock/locale", {
            quiet: true,
            config
        }).sort(cmp);
        test.equal(files.length, 7);
        const expected = [
            new SourceFile({filePath: "test/ilib-mock/locale/de/DE/mockdata.json", settings: config.paths["**/*.json"]}),
            new SourceFile({filePath: "test/ilib-mock/locale/de/mockdata.json", settings: config.paths["**/*.json"]}),
            new SourceFile({filePath: "test/ilib-mock/locale/en/US/mockdata.json", settings: config.paths["**/*.json"]}),
            new SourceFile({filePath: "test/ilib-mock/locale/en/mockdata.json", settings: config.paths["**/*.json"]}),
            new SourceFile({filePath: "test/ilib-mock/locale/mockdata.json", settings: config.paths["**/*.json"]}),
            new SourceFile({filePath: "test/ilib-mock/locale/und/DE/mockdata.json", settings: config.paths["**/*.json"]}),
            new SourceFile({filePath: "test/ilib-mock/locale/und/US/mockdata.json", settings: config.paths["**/*.json"]})
        ];
        test.deepEqual(files, expected);
        test.done();
    },

    testWalkDirWithExcludes: function(test) {
        test.expect(2);
        const config = {
            paths: {
                "**": {
                    excludes: [ "**/*.json" ]
                }
            }
        };
        const files = walk("test/ilib-mock", {
            quiet: true,
            config
        }).sort(cmp);
        test.equal(files.length, 3);
        const expected = [
            new SourceFile({filePath: "test/ilib-mock/assemble.mjs", settings: config.paths["**"]}),
            new SourceFile({filePath: "test/ilib-mock/ilib-mock-1.0.0.tgz", settings: config.paths["**"]}),
            new SourceFile({filePath: "test/ilib-mock/index.js", settings: config.paths["**"]})
        ];
        test.equalIgnoringOrder(files, expected);

        test.done();
    },

    testWalkDirWithExcludeDirectory: function(test) {
        test.expect(2);
        const config = {
            paths: {
                "**": {
                    excludes: [ "test/ilib-mock/locale/**" ]
                }
            }
        };
        const files = walk("test/ilib-mock", {
            quiet: true,
            config
        }).sort(cmp);
        test.equal(files.length, 4);
        const expected = [
            new SourceFile({filePath: "test/ilib-mock/assemble.mjs", settings: config.paths["**"]}),
            new SourceFile({filePath: "test/ilib-mock/ilib-mock-1.0.0.tgz", settings: config.paths["**"]}),
            new SourceFile({filePath: "test/ilib-mock/index.js", settings: config.paths["**"]}),
            new SourceFile({filePath: "test/ilib-mock/package.json", settings: config.paths["**"]})
        ];
        test.equalIgnoringOrder(files, expected);

        test.done();
    },

    testWalkDirWithMultipleExcludes: function(test) {
        test.expect(2);
        const config = {
            paths: {
                "**": {
                    excludes: [ "**/*.json", "**/*.mjs" ]
                }
            }
        };
        const files = walk("test/ilib-mock", {
            quiet: true,
            config
        }).sort(cmp);
        test.equal(files.length, 2);
        const expected = [
            new SourceFile({filePath: "test/ilib-mock/ilib-mock-1.0.0.tgz", settings: config.paths["**"]}),
            new SourceFile({filePath: "test/ilib-mock/index.js", settings: config.paths["**"]})
        ];
        test.equalIgnoringOrder(files, expected);

        test.done();
    },

    testWalkDirWithExcludesAndIncludes: function(test) {
        test.expect(2);
        const config = {
            paths: {
                "**/package.json": {
                    template: "[dir]/[localedir]/package.json"
                },
                "**": {
                    excludes: [ "**/*.json" ],
                }
            }
        };
        const files = walk("test/ilib-mock", {
            quiet: true,
            config
        }).sort(cmp);
        test.equal(files.length, 4);
        const expected = [
            new SourceFile({filePath: "test/ilib-mock/assemble.mjs", settings: config.paths["**"]}),
            new SourceFile({filePath: "test/ilib-mock/ilib-mock-1.0.0.tgz", settings: config.paths["**"]}),
            new SourceFile({filePath: "test/ilib-mock/index.js", settings: config.paths["**"]}),
            new SourceFile({filePath: "test/ilib-mock/package.json", settings: config.paths["**/package.json"]}),
        ];
        test.equalIgnoringOrder(files, expected);

        test.done();
    }
};
