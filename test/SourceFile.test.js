/*
 * SourceFile.test.js - test the source file class
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

import ResourceQuoteStyle from '../src/rules/ResourceQuoteStyle.js';
import ResourceICUPlurals from '../src/rules/ResourceICUPlurals.js';
import XliffParser from '../src/plugins/XliffParser.js';
import FileType from '../src/FileType.js';
import SourceFile from '../src/SourceFile.js';
import Project from '../src/Project.js';
import PluginManager from '../src/PluginManager.js';

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
        }
    }
};

const project = new Project(".", {
    pluginManager: new PluginManager()
}, config);

const filetype = new FileType({
    name: "javascript",
    project
});

describe("testSourceFile", () => {
    test("SourceFile", () => {
        expect.assertions(2);

        const sf = new SourceFile("a", {}, project);
        expect(sf).toBeTruthy();
        expect(sf.getFilePath()).toBe("a");
    });

    test("SourceFileMissingParams", () => {
        expect.assertions(1);

        expect(() => {
            new SourceFile();
        }).toThrow();
    });

    test("SourceFileBadParams", () => {
        expect.assertions(1);

        expect(() => {
            new SourceFile("", {}, {});
        }).toThrow();
    });

    test("SourceFileWithSettings", () => {
        expect.assertions(2);

        const sf = new SourceFile("a", {
            settings: {
                template: "x"
            }
        }, project);
        expect(sf).toBeTruthy();
        expect(sf.getFilePath()).toBe("a");
    });

    test("SourceFileGetLocaleFromPath", () => {
        expect.assertions(2);

        const sf = new SourceFile("src/filemanager/xrs/messages_de_DE.properties", {
            settings: {
                template: "[dir]/messages_[localeUnder].properties"
            }
        }, project);
        expect(sf).toBeTruthy();
        expect(sf.getLocaleFromPath()).toBe("de-DE");
    });

    test("SourceFileGetLocaleFromPathNone", () => {
        expect.assertions(2);

        const sf = new SourceFile("src/filemanager/xrs/Excludes.java", {
            settings: {
                template: "[dir]/messages_[localeUnder].properties"
            }
        }, project);
        expect(sf).toBeTruthy();
        expect(sf.getLocaleFromPath()).toBe("");
    });

    test("SourceFileGetLocaleFromPathNoTemplate", () => {
        expect.assertions(2);

        const sf = new SourceFile("src/filemanager/xrs/messages_de_DE.properties", {
            settings: {
            }
        }, project);
        expect(sf).toBeTruthy();
        expect(sf.getLocaleFromPath()).toBe("");
    });

    test("SourceFileParse", () => {
        expect.assertions(3);

        const sf = new SourceFile("test/testfiles/xliff/test.xliff", {
            settings: {
            }
        }, project);
        expect(sf).toBeTruthy();
        const resources = sf.parse();
        expect(resources).toBeTruthy();
        expect(resources.length).toBe(1);
    });

    test("SourceFileParseRightContents", () => {
        expect.assertions(9);

        const sf = new SourceFile("test/testfiles/xliff/test.xliff", {
            settings: {
            }
        }, project);
        expect(sf).toBeTruthy();
        const ir = sf.parse();
        expect(ir).toBeTruthy();
        expect(Array.isArray(ir)).toBeTruthy();
        expect(ir.length).toBe(1);
        expect(ir[0].getType()).toBe("resource");
        const resources = ir[0].getRepresentation();
        expect(resources.length).toBe(1);
        expect(resources[0].source).toBe("Asdf asdf");
        expect(resources[0].target).toBe("foobarfoo");
        expect(resources[0].reskey).toBe("foobar");
    });

    test("SourceFileParseRightTypeResource", () => {
        expect.assertions(5);

        const sf = new SourceFile("test/testfiles/xliff/test.xliff", {
            settings: {
            }
        }, project);
        expect(sf).toBeTruthy();
        const ir = sf.parse();
        expect(ir).toBeTruthy();
        expect(Array.isArray(ir)).toBeTruthy();
        expect(ir.length).toBe(1);
        expect(ir[0].getType()).toBe("resource");
    });

    test("SourceFileParseNonResourceFile", () => {
        expect.assertions(7);

        const sf = new SourceFile("test/ilib-mock/index.js", {
            filetype,
            settings: {
            }
        }, project);
        expect(sf).toBeTruthy();
        const ir = sf.parse();
        expect(ir).toBeTruthy();
        expect(Array.isArray(ir)).toBeTruthy();
        expect(ir.length).toBe(1);
        expect(ir[0].getType()).toBe("string");
        const source = ir[0].getRepresentation();
        expect(source).toBeTruthy();
        expect(source.length).toBe(117); // how many chars in this source file?
    });
});
