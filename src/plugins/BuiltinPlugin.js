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

import { Plugin } from 'i18nlint-common';
import XliffParser from './XliffParser.js';

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
     * @returns {Array.<Parser>} list of Parser classes implemented by this
     * plugin
     */
    getParsers() {
        return [XliffParser];
    }
};

export default BuiltinPlugin;
