/*
 * DeclarativeResourceRule.js - subclass of ResourceRule that can iterate over
 * an arrays of regular expressions to apply to a resource
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

import ResourceRule from './ResourceRule.js';

class DeclarativeResourceRule extends ResourceRule {
    /**
     * Construct a new regular expression-based declarative resource rule.
     *
     * In addition to the options required by the ResourceRule class, the
     * options must contain the following required properties:
     *
     * - regexps - an array of strings that encode regular expressions to
     *   look for
     *
     * @param {Object} options options as documented above
     * @constructor
     */
    constructor(options) {
        super(options);

        if (!options || !options.regexps) {
            throw "Missing required options for the DeclarativeResourceRule constructor";
        }

        // this may throw if you got to the regexp syntax wrong:
        this.re = options.regexps.map(regexp => new RegExp(regexp, "gu"));
    }

    /**
     * Check a specific source/target pair for a match with the given regular expression.
     *
     * The params object will contain the following properties:
     *
     * - {RegExp} re the regular expression to match
     * - {String|undefined} source the source string to match against
     * - {String|undefined} target the target string to match against
     * - {String} file path to the file where this resource was found
     * - {Resource} resource the resource where this pair of strings is from
     *
     * @abstract
     * @returns {Result|Array.<Result>|undefined} the Result objects detailing
     * any matches to the regular expression
     */
    checkString(params) {}

    /**
     * @override
     */
    matchString({source, target, file, resource}) {
        let results = [];
        this.re.forEach(re => {
            results = results.concat(this.checkString({re, source, target, file, resource}));
        });
        results = results.filter(result => result);
        return results && results.length ? results : undefined;
    }
}

export default DeclarativeResourceRule;