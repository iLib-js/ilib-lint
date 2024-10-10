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
import { ResourceArray, ResourcePlural, ResourceString } from 'ilib-tools-common';

import { IntermediateRepresentation, SourceFile } from 'ilib-lint-common';
import XliffParser from '../src/plugins/XliffParser.js';

const sourceFile = new SourceFile("a/b/c.xliff", {});

describe("test the XliffParser plugin", () => {
    test("No arg constructor gives default values", () => {
        expect.assertions(1);

        const xp = new XliffParser();

        expect(xp.getDescription()).toBe("A parser for xliff files. This can handle xliff v1.2 and v2.0 format files.");
    });
});
