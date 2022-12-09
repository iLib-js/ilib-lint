/*
 * ResourceURLMatch.js - rule to check if URLs in the source string also
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

import Rule from '../Rule.js';
import Result from '../Result.js';

const urlRe = /((https?|github|ftps?|mailto|file|data|irc):\/\/)?([\da-zA-Z\.-]+)\.([a-zA-Z\.]{2,6})([\/\w\.-]*)*\/?/g;

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
 * @class Represent an i18nlint rule.
 * @abstract
 */
class ResourceURLMatch extends Rule {
    constructor(options) {
        super(options);
        this.name = "resource-url-match";
        this.description = "Ensure that URLs that appear in the source string are also used in the translated string";
        this.sourceLocale = (options && options.sourceLocale) || "en-US";
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
        function checkString(src, tar) {
            urlRe.lastIndex = 0;
            let sourceUrls = [];
            let match = urlRe.exec(src);
            while (match) {
                sourceUrls.push(match[0]);
                match = urlRe.exec(src);
            }

            if (sourceUrls.length > 0) {
                // contains URLs, so check the target
                urlRe.lastIndex = 0;
                let targetUrls = [];
                match = urlRe.exec(tar);
                while (match) {
                    targetUrls.push(match[0]);
                    match = urlRe.exec(tar);
                }
                const missing = findMissing(sourceUrls, targetUrls);
                if (missing.length > 0) {
                    return missing.map(missing => {
                        let value = {
                            severity: "error",
                            id: resource.getKey(),
                            source: src,
                            rule: _this,
                            pathName: file,
                            highlight:`Target: ${tar}<e0></e0>`,
                            description: `URL from source string does not appear in target string`
                        };
                        if (typeof(options.lineNumber) !== 'undefined') {
                            value.lineNumber = options.lineNumber;
                        }
                        return new Result(value);
                    });
                }
            }
        }

        switch (resource.getType()) {
            case 'string':
                const tarString = resource.getTarget();
                if (tarString) {
                    return checkString(resource.getSource(), tarString);
                }
                break;

            case 'array':
                const srcArray = resource.getSource();
                const tarArray = resource.getTarget();
                if (tarArray) {
                    return srcArray.map((item, i) => {
                        if (i < tarArray.length && tarArray[i]) {
                            return checkString(srcArray[i], tarArray[i]);
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
                            return checkString(srcPlural.other, tarPlural[category]);
                        });
                    }
                }
                break;
        }
    }

    // no match
    return;
}

export default ResourceURLMatch;
