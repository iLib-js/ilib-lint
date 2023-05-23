/*
 * BuiltinPlugin.js - plugin that houses all of the built-in
 * rules and parsers
 *
 * Copyright © 2022-2023 JEDLSoft
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

import { Parser, Plugin } from 'i18nlint-common';
import XliffParser from './XliffParser.js';
import LineParser from './LineParser.js';
import StringParser from './StringParser.js';
import StringFixer from './StringFixer.js';

/**
 * @class ilib-lint plugin that can parse XLIFF files
 */
class BuiltinPlugin extends Plugin {
    /**
     * Create a new xliff plugin instance.
     * @constructor
     */
    constructor(options) {
        super(options);
    }

    /**
     * For a "parser" type of plugin, this returns a list of Parser classes
     * that this plugin implements.
     *
     * @returns {Array.<typeof Parser<any>>} list of Parser classes implemented by this
     * plugin
     */
    getParsers() {
        return [XliffParser, LineParser, StringParser];
    }

    getFixers() {
        return [StringFixer];
    }
};

export default BuiltinPlugin;
