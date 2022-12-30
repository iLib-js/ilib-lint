/*
 * ResourceMatcher.js - rule to check if URLs in the source string also
 * appear in the target string
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

import { Rule, Result } from 'i18nlint-common';
import { stripPlurals } from './utils.js';

function findMissing(source, target) {
    let missing = [];
    for (var i = 0; i < source.length; i++) {
        if (target.indexOf(source[i]) < 0) {
            missing.push(source[i]);
        }
    }
    return missing;
}

/**
 * @class Resource checker class that checks that any regular expressions
 * that matches in the source also appears in the translation.
 */
class ResourceMatcher extends Rule {
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
     */
    constructor(options) {
        super(options);

        if (!options || !options.name || !options.description || !options.note || !options.regexps) {
            throw "Missing required options for the ResourceMatcher constructor";
        }
        ["name", "description", "regexps", "note", "sourceLocale"].forEach(prop => {
            this[prop] = options[prop];
        });
        this.sourceLocale = this.sourceLocale || "en-US";

        // this may throw if you got to the regexp syntax wrong:
        this.re = this.regexps.map(regexp => new RegExp(regexp, "g"));
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
        function checkString(re, src, tar) {
            re.lastIndex = 0;
            let sourceMatches = [];
            const strippedSrc = stripPlurals(src);
            const strippedTar = stripPlurals(tar);

            let match = re.exec(strippedSrc);
            while (match) {
                sourceMatches.push(match[0]);
                match = re.exec(strippedSrc);
            }

            if (sourceMatches.length > 0) {
                // contains URLs, so check the target
                re.lastIndex = 0;
                let targetMatches = [];
                match = re.exec(strippedTar);
                while (match) {
                    targetMatches.push(match[0]);
                    match = re.exec(strippedTar);
                }
                const missing = findMissing(sourceMatches, targetMatches);
                if (missing.length > 0) {
                    return missing.map(missing => {
                        let value = {
                            severity: "error",
                            id: resource.getKey(),
                            source: src,
                            rule: _this,
                            pathName: file,
                            highlight:`Target: ${tar}<e0></e0>`,
                            description: _this.note.replace(/\{matchString\}/g, missing)
                        };
                        if (typeof(options.lineNumber) !== 'undefined') {
                            value.lineNumber = options.lineNumber;
                        }
                        return new Result(value);
                    });
                }
            }
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
                const tarString = resource.getTarget();
                if (tarString) {
                    return checkRegExps(resource.getSource(), tarString);
                }
                break;

            case 'array':
                const srcArray = resource.getSource();
                const tarArray = resource.getTarget();
                if (tarArray) {
                    return srcArray.map((item, i) => {
                        if (i < tarArray.length && tarArray[i]) {
                            return checkRegExps(srcArray[i], tarArray[i]);
                        }
                    }).filter(element => {
                        return element;
                    });
                }
                break;

            case 'plural':
                const srcPlural = resource.getSource();
                const tarPlural = resource.getTarget();
                if (tarPlural) {
                    const hasQuotes = categories.find(category => {
                        return (srcPlural[category] && srcPlural[category].contains(srcQuote));
                    });

                    if (hasQuotes) {
                        return categories.map(category => {
                            return checkRegExps(srcPlural.other, tarPlural[category]);
                        });
                    }
                }
                break;
        }
    }

    // no match
    return;
}

export default ResourceMatcher;
