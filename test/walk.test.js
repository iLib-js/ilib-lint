/*
 * walk.test.js - test the assemble utility
 *
 * Copyright ©  2022-2023JEDLSoft
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

describe("testWalk", () => {
    test("WalkDir", () => {
        expect.assertions(2);
        const project = new Project("test/ilib-mock", {
            pluginManager: new PluginManager()
        }, config);

        const files = project.walk("test/ilib-mock").sort(cmp);
        expect(files.length).toBe(11);
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
        expect(files.map(file => file.getFilePath())).toEqual(expected);
    });

    test("WalkFile", () => {
        expect.assertions(2);

        const project = new Project("test/ilib-mock", {
            pluginManager: new PluginManager()
        }, config);

        const files = project.walk("test/ilib-mock/index.js");
        expect(files.length).toBe(1);
        expect(files[0].getFilePath()).toStrictEqual("test/ilib-mock/index.js");
    });

    test("WalkNonExistentDir", () => {
        expect.assertions(1);

        const project = new Project("test/ilib-mock/asdf", {
            pluginManager: new PluginManager()
        }, config);
        const files = project.walk("test/ilib-mock/asdf").sort(cmp);
        expect(files.length).toBe(0);
    });

    test("WalkFileNonJSFile", () => {
        expect.assertions(1);

        const project = new Project("test/ilib-mock/locale", {
            pluginManager: new PluginManager()
        }, config);
        const files = project.walk("test/ilib-mock/locale/mockdata.json").sort(cmp);
        expect(files.length).toBe(1);
    });

    test("WalkBadParamsUndefined", () => {
        expect.assertions(1);

        const project = new Project("test/ilib-mock/locale", {
            pluginManager: new PluginManager()
        }, config);
        const files = project.walk(undefined).sort(cmp);
        expect(files.length).toBe(0);
    });

    test("WalkBadParamsBoolean", () => {
        expect.assertions(1);

        const project = new Project("test/ilib-mock/locale", {
            pluginManager: new PluginManager()
        }, config);
        const files = project.walk(true).sort();
        expect(files.length).toBe(0);
    });

    test("WalkBadParamsNumber", () => {
        expect.assertions(1);

        const project = new Project("test/ilib-mock/locale", {
            pluginManager: new PluginManager()
        }, config);
        const files = project.walk(3).sort();
        expect(files.length).toBe(0);
    });

    test("WalkDirWithJsonExtension", () => {
        expect.assertions(2);

        const config = {
            paths: {
                "**/*.json": {
                }
            }
        };
        const proj = new Project(".", {
            pluginManager: new PluginManager()
        }, config);
        const files = proj.walk("test/ilib-mock/locale").sort(cmp);
        expect(files.length).toBe(7);
        const expected = [
            "test/ilib-mock/locale/de/DE/mockdata.json",
            "test/ilib-mock/locale/de/mockdata.json",
            "test/ilib-mock/locale/en/US/mockdata.json",
            "test/ilib-mock/locale/en/mockdata.json",
            "test/ilib-mock/locale/mockdata.json",
            "test/ilib-mock/locale/und/DE/mockdata.json",
            "test/ilib-mock/locale/und/US/mockdata.json"
        ];
        expect(files.map(file => file.getFilePath())).toStrictEqual(expected);
    });

    test("WalkDirWithExcludes", () => {
        expect.assertions(2);
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
        const files = proj.walk("test/ilib-mock").sort(cmp);
        expect(files.length).toBe(3);
        const expected = [
            "test/ilib-mock/assemble.mjs",
            "test/ilib-mock/ilib-mock-1.0.0.tgz",
            "test/ilib-mock/index.js"
        ];
        expect(files.map(file => file.getFilePath())).toEqual(expected);
    });

    test("WalkDirWithExcludeDirectory", () => {
        expect.assertions(2);
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
        const files = proj.walk("test/ilib-mock").sort(cmp);
        expect(files.length).toBe(4);
        const expected = [
            "test/ilib-mock/assemble.mjs",
            "test/ilib-mock/ilib-mock-1.0.0.tgz",
            "test/ilib-mock/index.js",
            "test/ilib-mock/package.json"
        ];
        expect(files.map(file => file.getFilePath())).toEqual(expected);
    });

    test("WalkDirWithMultipleExcludes", () => {
        expect.assertions(2);
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
        const files = proj.walk("test/ilib-mock").sort(cmp);
        expect(files.length).toBe(2);
        const expected = [
            "test/ilib-mock/ilib-mock-1.0.0.tgz",
            "test/ilib-mock/index.js"
        ];
        expect(files.map(file => file.getFilePath())).toEqual(expected);
    });

    test("WalkDirWithExcludesAndIncludes", () => {
        expect.assertions(2);
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
        const files = proj.walk("test/ilib-mock").sort(cmp);
        expect(files.length).toBe(4);
        const expected = [
            "test/ilib-mock/assemble.mjs",
            "test/ilib-mock/ilib-mock-1.0.0.tgz",
            "test/ilib-mock/index.js",
            "test/ilib-mock/package.json"
        ];
        expect(files.map(file => file.getFilePath())).toEqual(expected);
    });
});
