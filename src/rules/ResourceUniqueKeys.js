/*
 * ResourceUniqueKeys.js - rule to check quotes in the target string
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

import LocaleInfo from 'ilib-localeinfo';
import { TranslationSet } from 'ilib-tools-common';

import Rule from '../Rule.js';
import Result from '../Result.js';

/**
 * @class Represent an i18nlint rule.
 */
class ResourceUniqueKeys extends Rule {
    constructor(options) {
        super(options);
        this.name = "resource-unique-keys";
        this.description = "Ensure that the keys are unique within a locale across all resource files";
        this.sourceLocale = (options && options.sourceLocale) || "en-US";

        this.ts = new TranslationSet();
    }

    getRuleType() {
        return "resource";
    }

    /**
     * @override
     */
    match(options) {
        const { locale, resource, file } = options || {};

        const hash = resource.hashKey();
        const other = this.ts.get(hash);

        if (other) {
            let value = {
                severity: "error",
                id: resource.getKey(),
                rule: this,
                pathName: file,
                highlight: `Also defined in this file: ${other.resfile}`,
                description: `Key is not unique within locale ${locale}.`,
                locale
            };
            if (typeof(options.lineNumber) !== 'undefined') {
                value.lineNumber = options.lineNumber;
            }
            return new Result(value);
        }

        resource.resfile = file;
        this.ts.add(resource);

        // no result
        return;
    }
}

export default ResourceUniqueKeys;