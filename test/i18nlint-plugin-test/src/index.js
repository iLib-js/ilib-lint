/*
 * index.js - main program of i18nlint plugin test
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

import { Plugin } from 'i18nlint-common';

import TestParser from './TestParser.js';
import TestRule from './TestRule.js';
import TestFormatter from './TestFormatter.js';

class TestPlugin extends Plugin {
    constructor(options) {
        super(options);
    }

    init() {
        console.log("TestPlugin.init() called");
    }

    getType() {
        return "resource";
    }

    getExtensions() {
        return [ "xyz" ];
    }

    getRules() {
        return [ TestRule ];
    }

    getParsers() {
        return [ TestParser ];
    }

    getFormatters() {
        return [ TestFormatter ];
    }

}

export default TestPlugin;