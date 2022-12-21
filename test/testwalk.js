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
import Project from '../src/Project.js';
import PluginManager from '../src/PluginManager.js';

function cmp(left, right) {
    return (left.pathName < right.pathName) ? -1 :
        ((left.pathName > right.pathName) ? 1 : 0);
}


const config = {
    "name": "test",
    "locales": [
        "en-US",
        "de-DE",
        "ja-JP",
        "ko-KR"
    ],
    "paths": {
        "**/*.json": {
            "locales": [
                "en-US",
                "de-DE",
                "ja-JP"
            ]
        },
        "**/*.xliff": {
            "rules": {
                "resource-icu-plurals": true,
                "resource-quote-style": true,
                "resource-url-match": true,
                "resource-named-params": "localeOnly"
            }
        },
        "**": {
        }
    }
};

const project = new Project(".", {
    pluginManager: new PluginManager()
}, config);

export const testWalk = {
    testWalkDir: function(test) {
        test.expect(2);
        const files = walk("test/ilib-mock", project).sort(cmp);
        test.equal(files.length, 11);
        const expected = [
            "test/ilib-mock/assemble.mjs",
            "test/ilib-mock/ilib-mock-1.0.0.tgz",
            "test/ilib-mock/index.js",
            "test/ilib-mock/locale/de/DE/mockdata.json",
            "test/ilib-mock/locale/de/mockdata.json",
            "test/ilib-mock/locale/en/US/mockdata.json",
            "test/ilib-mock/locale/en/mockdata.json",
            "test/ilib-mock/locale/mockdata.json",
            "test/ilib-mock/locale/und/DE/mockdata.json",
            "test/ilib-mock/locale/und/US/mockdata.json",
            "test/ilib-mock/package.json"
        ];
        test.equalIgnoringOrder(files.map(file => file.getFilePath()), expected);

        test.done();
    },

    testWalkFile: function(test) {
        test.expect(2);
        project.clear();

        const files = walk("test/ilib-mock/index.js", project);
        test.equal(files.length, 1);
        test.deepEqual(files[0].getFilePath(), "test/ilib-mock/index.js");

        test.done();
    },

    testWalkNonExistentDir: function(test) {
        test.expect(1);
        project.clear();

        const files = walk("test/ilib-mock/asdf", project).sort(cmp);
        test.equal(files.length, 0);

        test.done();
    },

    testWalkFileNonJSFile: function(test) {
        test.expect(1);
        project.clear();

        const files = walk("test/ilib-mock/locale/mockdata.json", project).sort(cmp);
        test.equal(files.length, 1);

        test.done();
    },

    testWalkBadParamsUndefined: function(test) {
        test.expect(1);
        project.clear();

        const files = walk(undefined, project).sort(cmp);
        test.equal(files.length, 0);

        test.done();
    },

    testWalkBadParamsBoolean: function(test) {
        test.expect(1);
        project.clear();

        const files = walk(true, project).sort();
        test.equal(files.length, 0);

        test.done();
    },

    testWalkBadParamsNumber: function(test) {
        test.expect(1);
        project.clear();

        const files = walk(3, project).sort();
        test.equal(files.length, 0);

        test.done();
    },

    testWalkDirWithJsonExtension: function(test) {
        test.expect(2);
        project.clear();

        const config = {
            paths: {
                "**/*.json": {
                }
            }
        };
        const proj = new Project(".", {
            pluginManager: new PluginManager()
        }, config);
        const files = walk("test/ilib-mock/locale", proj).sort(cmp);
        test.equal(files.length, 7);
        const expected = [
            "test/ilib-mock/locale/de/DE/mockdata.json",
            "test/ilib-mock/locale/de/mockdata.json",
            "test/ilib-mock/locale/en/US/mockdata.json",
            "test/ilib-mock/locale/en/mockdata.json",
            "test/ilib-mock/locale/mockdata.json",
            "test/ilib-mock/locale/und/DE/mockdata.json",
            "test/ilib-mock/locale/und/US/mockdata.json"
        ];
        test.deepEqual(files.map(file => file.getFilePath()), expected);
        test.done();
    },

    testWalkDirWithExcludes: function(test) {
        test.expect(2);
        project.clear();

        const config = {
            paths: {
                "**": {
                    excludes: [ "**/*.json" ]
                }
            }
        };
        const proj = new Project(".", {
            pluginManager: new PluginManager()
        }, config);
        const files = walk("test/ilib-mock", proj).sort(cmp);
        test.equal(files.length, 3);
        const expected = [
            "test/ilib-mock/assemble.mjs",
            "test/ilib-mock/ilib-mock-1.0.0.tgz",
            "test/ilib-mock/index.js"
        ];
        test.equalIgnoringOrder(files.map(file => file.getFilePath()), expected);

        test.done();
    },

    testWalkDirWithExcludeDirectory: function(test) {
        test.expect(2);
        project.clear();

        const config = {
            paths: {
                "**": {
                    excludes: [ "test/ilib-mock/locale/**" ]
                }
            }
        };
        const proj = new Project(".", {
            pluginManager: new PluginManager()
        }, config);
        const files = walk("test/ilib-mock", proj).sort(cmp);
        test.equal(files.length, 4);
        const expected = [
            "test/ilib-mock/assemble.mjs",
            "test/ilib-mock/ilib-mock-1.0.0.tgz",
            "test/ilib-mock/index.js",
            "test/ilib-mock/package.json"
        ];
        test.equalIgnoringOrder(files.map(file => file.getFilePath()), expected);

        test.done();
    },

    testWalkDirWithMultipleExcludes: function(test) {
        test.expect(2);
        project.clear();

        const config = {
            paths: {
                "**": {
                    excludes: [ "**/*.json", "**/*.mjs" ]
                }
            }
        };
        const proj = new Project(".", {
            pluginManager: new PluginManager()
        }, config);
        const files = walk("test/ilib-mock", proj).sort(cmp);
        test.equal(files.length, 2);
        const expected = [
            "test/ilib-mock/ilib-mock-1.0.0.tgz",
            "test/ilib-mock/index.js"
        ];
        test.equalIgnoringOrder(files.map(file => file.getFilePath()), expected);

        test.done();
    },

    testWalkDirWithExcludesAndIncludes: function(test) {
        test.expect(2);
        project.clear();

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
        const proj = new Project(".", {
            pluginManager: new PluginManager()
        }, config);
        const files = walk("test/ilib-mock", proj).sort(cmp);
        test.equal(files.length, 4);
        const expected = [
            "test/ilib-mock/assemble.mjs",
            "test/ilib-mock/ilib-mock-1.0.0.tgz",
            "test/ilib-mock/index.js",
            "test/ilib-mock/package.json"
        ];
        test.equalIgnoringOrder(files.map(file => file.getFilePath()), expected);

        test.done();
    }
};
