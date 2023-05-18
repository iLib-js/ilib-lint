/*
 * ResourceRule.js - subclass of Rule that can iterate over arrays
 * and plurals to check individual strings
 *
 * Copyright © 2023 JEDLSoft
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

import { Rule } from 'i18nlint-common';

class ResourceRule extends Rule {
    /**
     * Construct a new resource checker rule.
     *
     * The options must contain the following required properties:
     *
     * - name - a unique name for this rule
     * - description - a one-line description of what this rule checks for.
     *   Example: "Check that URLs in the source also appear in the target"
     * - note - a one-line note that will be printed on screen when the
     *   check fails. Example: "The URL {matchString} did not appear in the
     *   the target." (Currently, matchString is the only replacement
     *   param that is supported.)
     *
     * @param {Object} options options as documented above
     * @constructor
     */
    constructor(options) {
        super(options);
    }

    /**
     * All rules of this type are resource rules.
     *
     * @override
     */
    getRuleType() {
        return "resource";
    }

    /**
     * Check a string pair for problems. In various resources, there are
     * sometimes no source string or no target string and the source or target
     * parameters may be undefined or the empty string. It is up to the subclass
     * to determine what to do with that situation. For plural or array
     * resources, this method will be called multiple times, once for each pair
     * of array entries, or for each pair of plural category strings.
     *
     * @abstract
     * @param {Object} params parameters for the string matching
     * @param {String|undefined} params.source the source string to match against
     * @param {String|undefined} params.target the target string to match
     * @param {String} params.file the file path where the resources came from
     * @param {Resource} params.resource the resource that contains the source and/or
     * target string
     * @returns {Result|Array.<Result>|undefined} any results
     * found in this string or undefined if no problems were
     * found.
     */
    matchString(params) {}

    /**
     * @override
     */
    match(options = {}) {
        const { ir, file } = options;
        let results;

        // we can only process resource representations
        if (!ir || ir.getType() !== "resource") return;

        const resources = ir.getRepresentation();

        const resultArray = resources.flatMap(resource => {
            switch (resource.getType()) {
                case 'string':
                    return this.matchString({
                        source: resource.getSource(),
                        target: resource.getTarget(),
                        file,
                        resource
                    });

                case 'array':
                    const srcArray = resource.getSource() ?? [];
                    const tarArray = resource.getTarget() ?? [];
                    results = srcArray.flatMap((item, i) => {
                        return this.matchString({
                            source: srcArray[i],
                            target: tarArray[i],
                            file,
                            resource
                        });
                    }).filter(element => element);
                    return results && results.length ? results : undefined;
    
                case 'plural':
                    const srcPlural = resource.getSource() ?? {};
                    const tarPlural = resource.getTarget() ?? {};
                    const categorySet = new Set(Object.keys(srcPlural).concat(Object.keys(tarPlural)));
    
                    results = Array.from(categorySet).flatMap(category => {
                        return this.matchString({
                            source: srcPlural[category] ?? srcPlural.other,
                            target: tarPlural[category],
                            file,
                            resource
                        });
                    }).filter(element => element);
                    return results && results.length ? results : undefined;
            }
        }).filter(element => element);
        return resultArray?.length > 1 ? resultArray : (resultArray?.length === 1 ? resultArray[0] : undefined);
    }
}

export default ResourceRule;