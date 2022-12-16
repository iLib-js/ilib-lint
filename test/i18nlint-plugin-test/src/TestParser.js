/*
 * TestParser.js - test an i18nlint Parser plugin
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

import fs from 'node:fs';

import { Parser } from 'i18nlint-common';
import json5 from 'json5';
import { ResourceString, TranslationSet } from 'ilib-tools-common';

class TestParser extends Parser {
    constructor(options) {
        super(options);
        this.filePath = options.filePath;
    }

    init() {
        console.log("TestParser.init called");
    }

    /**
     * Parse the current file into an intermediate representation.
     */
    parse() {
        // parse the xyz files as json for simplicity
        const data = fs.readFileSync(this.filePath, "utf-8");
        const json = json5.parse(data);

        this.ts = new TranslationSet();

        for (let prop of json) {
            this.ts.add(new ResourceString({
                sourceLocale: "en-US",
                source: json[prop],
                reskey: prop,
                resType: "x-xyz",
                pathName: this.filePath
            }));
        }
    }

    getResources() {
        return this.ts.getAll();
    }
}

export default TestParser;
