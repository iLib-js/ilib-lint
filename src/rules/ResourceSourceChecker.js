/*
 * ResourceSourceChecker.js - rule to check if URLs in the source string also
 * appear in the target string
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

import { Rule, Result } from 'i18nlint-common';
import { stripPlurals } from './utils.js';

/**
 * @class Resource checker class that checks that any regular expressions
 * that matches in the source also appears in the translation.
 */
class ResourceSourceChecker extends Rule {
    /**
     * Construct a new regular expression-based resource checker.
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
     * - regexps - an array of strings that encode regular expressions to
     *   look for
     * @param {Object} options options as documented above
     * @constructor
     */
    constructor(options) {
        super(options);

        if (!options || !options.name || !options.description || !options.note || !options.regexps) {
            throw "Missing required options for the ResourceMatcher constructor";
        }
        ["name", "description", "regexps", "note", "sourceLocale", "link"].forEach(prop => {
            this[prop] = options[prop];
        });
        this.severity = options.severity || "error";
        this.sourceLocale = this.sourceLocale || "en-US";

        // this may throw if you got to the regexp syntax wrong:
        this.re = this.regexps.map(regexp => new RegExp(regexp, "gu"));
    }

    getRuleType() {
        return "resource";
    }

    /**
     * @override
     */
    match(options) {
        const { locale, resource, file } = options || {};
        const _this = this;

        /**
         * @private
         */
        function checkString(re, src) {
            re.lastIndex = 0;
            let matches = [];
            const strippedSrc = stripPlurals(src);

            // check the target only
            re.lastIndex = 0;
            let match = re.exec(strippedSrc);
            while (match) {
                let value = {
                    severity: _this.severity,
                    id: resource.getKey(),
                    rule: _this,
                    pathName: file,
                    highlight: `Source: ${src.substring(0, match.index)}<e0>${match[0]}</e0>${src.substring(match.index+match[0].length)}`,
                    description: _this.note.replace(/\{matchString\}/g, match[0])
                };
                if (typeof(options.lineNumber) !== 'undefined') {
                    value.lineNumber = options.lineNumber;
                }
                matches.push(new Result(value));

                match = re.exec(strippedSrc);
            }

            return matches;
        }

        function checkRegExps(src, tar) {
            let results = [];
            _this.re.forEach(re => {
                results = results.concat(checkString(re, src, tar));
            });
            results = results.filter(result => result);
            return results && results.length ? results : undefined;
        }

        switch (resource.getType()) {
            case 'string':
                return checkRegExps(resource.getSource());
                break;

            case 'array':
                const srcArray = resource.getSource();
                if (srcArray) {
                    const results = srcArray.map((item, i) => {
                        return checkRegExps(srcArray[i]);
                    }).flat().filter(element => element);
                    return (results && results.length ? results : undefined);
                }
                break;

            case 'plural':
                const srcPlural = resource.getSource();
                const results = Object.keys(srcPlural).map(category => {
                    if (srcPlural[category]) return checkRegExps(srcPlural[category]);
                }).flat().filter(element => element);
                return (results && results.length ? results : undefined);
                break;
        }
    }

    // no match
    return;
}

export default ResourceSourceChecker;
