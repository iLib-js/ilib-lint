/*
 * testSourceFile.js - test the source file class
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

import ResourceQuoteStyle from '../src/rules/ResourceQuoteStyle.js';
import ResourceICUPlurals from '../src/rules/ResourceICUPlurals.js';
import XliffParser from '../src/plugins/XliffParser.js';
import SourceFile from '../src/SourceFile.js';

export const testSourceFile = {
    testSourceFile: function(test) {
        test.expect(2);

        const sf = new SourceFile({
            filePath: "a"
        });
        test.ok(sf);
        test.equal(sf.getFilePath(), "a");

        test.done();
    },

    testSourceFileMissingParams: function(test) {
        test.expect(1);

        test.throws(() => {
            new SourceFile();
        });

        test.done();
    },

    testSourceFileBadParams: function(test) {
        test.expect(1);

        test.throws(() => {
            new SourceFile({});
        });

        test.done();
    },

    testSourceFileWithSettings: function(test) {
        test.expect(2);

        const sf = new SourceFile({
            filePath: "a",
            settings: {
                template: "x"
            }
        });
        test.ok(sf);
        test.equal(sf.getFilePath(), "a");

        test.done();
    },

    testSourceFileGetLocaleFromPath: function(test) {
        test.expect(2);

        const sf = new SourceFile({
            filePath: "src/filemanager/xrs/messages_de_DE.properties",
            settings: {
                template: "[dir]/messages_[localeUnder].properties"
            }
        });
        test.ok(sf);
        test.equal(sf.getLocaleFromPath(), "de-DE");

        test.done();
    },

    testSourceFileGetLocaleFromPathNone: function(test) {
        test.expect(2);

        const sf = new SourceFile({
            filePath: "src/filemanager/xrs/Excludes.java",
            settings: {
                template: "[dir]/messages_[localeUnder].properties"
            }
        });
        test.ok(sf);
        test.equal(sf.getLocaleFromPath(), "");

        test.done();
    },

    testSourceFileGetLocaleFromPathNoTemplate: function(test) {
        test.expect(2);

        const sf = new SourceFile({
            filePath: "src/filemanager/xrs/messages_de_DE.properties",
            settings: {
            }
        });
        test.ok(sf);
        test.equal(sf.getLocaleFromPath(), "");

        test.done();
    },

    testSourceFileParse: function(test) {
        test.expect(3);

        const sf = new SourceFile({
            filePath: "test/testfiles/test.xliff",
            settings: {
            }
        });
        test.ok(sf);
        const resources = sf.parse([XliffParser]);
        test.ok(resources);
        test.equal(resources.length, 1);

        test.done();
    },

    testSourceFileParseRightContents: function(test) {
        test.expect(5);

        const sf = new SourceFile({
            filePath: "test/testfiles/test.xliff",
            settings: {
            }
        });
        test.ok(sf);
        const resources = sf.parse([XliffParser]);
        test.ok(resources);
        test.equal(resources[0].source, "Asdf asdf");
        test.equal(resources[0].target, "foobarfoo");
        test.equal(resources[0].reskey, "foobar");

        test.done();
    },

    testSourceFileParseRightType: function(test) {
        test.expect(3);

        const sf = new SourceFile({
            filePath: "test/testfiles/test.xliff",
            settings: {
            }
        });
        test.ok(sf);
        test.ok(!sf.getType());
        const resources = sf.parse([XliffParser]);
        test.equal(sf.getType(), "resource");

        test.done();
    },

    testSourceFileParseNonResourceFile: function(test) {
        test.expect(3);

        const sf = new SourceFile({
            filePath: "test/ilib-mock/index.js",
            settings: {
            }
        });
        test.ok(sf);
        const lines = sf.parse();
        test.ok(lines);
        test.equal(lines.length, 4);

        test.done();
    },

    testSourceFileParseNonResRightType: function(test) {
        test.expect(3);

        const sf = new SourceFile({
            filePath: "test/ilib-mock/index.js",
            settings: {
            }
        });
        test.ok(sf);
        test.ok(!sf.getType());
        const resources = sf.parse();
        test.equal(sf.getType(), "line");

        test.done();
    },
};

