/*
 * XliffParser.test.js - test the built-in XliffParser plugin
 *
 * Copyright © 2024 JEDLSoft
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
import fs from 'fs';

import { ResourceArray, ResourcePlural, ResourceString } from 'ilib-tools-common';

import { IntermediateRepresentation, SourceFile } from 'ilib-lint-common';
import XliffParser from '../src/plugins/XliffParser.js';

describe("test the XliffParser plugin", () => {
    test("No arg constructor gives default values", () => {
        expect.assertions(4);

        const xp = new XliffParser();

        expect(xp.getDescription()).toBe("A parser for xliff files. This can handle xliff v1.2 and v2.0 format files.");
        expect(xp.getExtensions()).toEqual(["xliff", "xlif", "xlf"]);
        expect(xp.getType()).toBe("resource");
        expect(xp.getName()).toBe("xliff");
    });

    test("Parse a regular xliff file", () => {
        expect.assertions(11);

        const xp = new XliffParser();

        const sourceFile = new SourceFile("test/testfiles/xliff/test.xliff", {});

        const ir = xp.parse(sourceFile);
        expect(ir).toBeTruthy();
        expect(ir.length).toBe(1);
        expect(ir[0] instanceof IntermediateRepresentation).toBeTruthy();

        const resources = ir[0].getRepresentation();
        expect(resources).toBeTruthy();
        expect(resources.length).toBe(1);

        const resource = resources[0];
        expect(resource instanceof ResourceString).toBeTruthy();
        expect(resource.getSourceLocale()).toBe("en-US");
        expect(resource.getSource()).toBe("Asdf asdf");

        expect(resource.getTargetLocale()).toBe("de-DE");
        expect(resource.getTarget()).toBe("foobarfoo");

        expect(resource.getComment()).toBe("foobar is where it's at!");
    });

    test("Correctly throw when parsing a malformed xliff file", () => {
        expect.assertions(1);

        const xp = new XliffParser();

        const sourceFile = new SourceFile("test/testfiles/xliff/bad.xliff", {});

        expect(() => {
            xp.parse(sourceFile);
        }).toThrow();
    });

    test("Correctly throw when parsing a non-xliff file", () => {
        expect.assertions(1);

        const xp = new XliffParser();

        const sourceFile = new SourceFile("test/testfiles/strings.xyz", {});

        expect(() => {
            xp.parse(sourceFile);
        }).toThrow();
    });

    test("Correctly throw when given a non-existent file", () => {
        expect.assertions(1);

        const xp = new XliffParser();

        const sourceFile = new SourceFile("test/testfiles/xliff/nonexistent.xliff", {});

        expect(() => {
            xp.parse(sourceFile);
        }).toThrow();
    });

    test("Correctly throw when given a directory instead of a file", () => {
        expect.assertions(1);

        const xp = new XliffParser();

        const sourceFile = new SourceFile("test/testfiles/xliff", {});

        expect(() => {
            xp.parse(sourceFile);
        }).toThrow();
    });

    test("Write a regular xliff file but don't change the content", () => {
        expect.assertions(3);

        const xp = new XliffParser();

        const sourceFile = new SourceFile("test/testfiles/xliff/test.xliff", {});
        const expected = sourceFile.getContent();

        const ir = xp.parse(sourceFile);
        expect(ir).toBeTruthy();
        expect(xp.write(ir[0])).toBe(sourceFile);

        // the content has not changed
        expect(sourceFile.getContent()).toBe(expected);
    });

    test("Write a regular xliff file and change the content", () => {
        expect.assertions(4);

        const xp = new XliffParser();

        const sourceFile = new SourceFile("test/testfiles/xliff/test.xliff", {});
        const oldContent = sourceFile.getContent();

        const ir = xp.parse(sourceFile);
        expect(ir).toBeTruthy();

        const resources = ir[0].getRepresentation();
        resources[0].setTarget("new target");

        // write to a different file so we can compare the content
        ir[0].sourceFile.filePath = "test/testfiles/xliff/test-changed.xliff";

        const newSourceFile = xp.write(ir[0]);
        expect(newSourceFile).toBe(sourceFile);

        // the content has changed
        const newContent = newSourceFile.getContent();
        expect(newContent).not.toBe(oldContent);

        // the content is what we expect
        expect(newContent).toBe(
`<?xml version="1.0" encoding="utf-8"?>
<xliff version="1.2">
  <file original="foo/bar/asdf.java" source-language="en-US" target-language="de-DE" product-name="webapp">
    <body>
      <trans-unit id="1" resname="foobar" restype="string" datatype="plaintext">
        <source>Asdf asdf</source>
        <target>new target</target>
        <note>foobar is where it's at!</note>
      </trans-unit>
    </body>
  </file>
</xliff>`);

    });

    test("Write a regular xliff file and change the content on disk", () => {
        expect.assertions(4);

        const xp = new XliffParser();

        const sourceFile = new SourceFile("test/testfiles/xliff/test.xliff", {});
        const oldContent = sourceFile.getContent();

        const ir = xp.parse(sourceFile);
        expect(ir).toBeTruthy();

        const resources = ir[0].getRepresentation();
        resources[0].setTarget("new target");

        // write to a different file so we can compare the content
        ir[0].sourceFile.filePath = "test/testfiles/xliff/test-changed.xliff";

        const newSourceFile = xp.write(ir[0]);
        expect(newSourceFile).toBe(sourceFile);

        // the content has changed
        const newContent = fs.readFileSync("test/testfiles/xliff/test-changed.xliff", "utf-8");
        expect(newContent).not.toBe(oldContent);

        // the content is what we expect
        expect(newContent).toBe(
`<?xml version="1.0" encoding="utf-8"?>
<xliff version="1.2">
  <file original="foo/bar/asdf.java" source-language="en-US" target-language="de-DE" product-name="webapp">
    <body>
      <trans-unit id="1" resname="foobar" restype="string" datatype="plaintext">
        <source>Asdf asdf</source>
        <target>new target</target>
        <note>foobar is where it's at!</note>
      </trans-unit>
    </body>
  </file>
</xliff>`);

    });
});
