/*
 * XliffParser.js - Parser for XLIFF files
 *
 * Copyright © 2022-2024 JEDLSoft
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

import fs from 'node:fs';
import { ResourceXliff } from 'ilib-tools-common';
import { FileStats, Parser, IntermediateRepresentation } from 'ilib-lint-common';

/**
 * @class Parser for XLIFF files based on the ilib-xliff library.
 */
class XliffParser extends Parser {
    /**
     * Construct a new plugin.
     * @constructor
     */
    constructor(options) {
        super(options);
        this.path = options.filePath;
        this.xliff = new ResourceXliff({
            path: options.filePath
        });

        this.extensions = [ "xliff", "xlif", "xlf" ];
        this.name = "xliff";
        this.description = "A parser for xliff files. This can handle xliff v1.2 and v2.0 format files."
    }

    /**
     * Parse the current file into an intermediate representation.
     */
    parse() {
        const data = fs.readFileSync(this.path, "utf-8");
        this.xliff.parse(data);
        const resources = this.xliff.getResources();
        return [new IntermediateRepresentation({
            type: "resource",
            ir: resources,
            filePath: this.path,
            stats: new FileStats({
                lines: this.xliff.getLines(),
                bytes: this.xliff.size(),
                modules: resources.length
            })
        })];
    }

    getType() {
        return "resource";
    }

    getExtensions() {
        return this.extensions;
    }
};

export default XliffParser;
