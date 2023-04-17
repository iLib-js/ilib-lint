/*
 * ResourceEdgeWhitespace.js - rule to check that whitespaces on edges of target match those on edges of source
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

import { Rule, Result } from "i18nlint-common";

/** Rule to check that whitespaces on edges of target match those on edges of source */
class ResourceEdgeWhitespace extends Rule {
    /** @readonly */ name = "resource-edge-whitespace";
    /** @readonly */ description =
        "Ensure that if there are whitespaces on edges of source string, matching ones are there in target as well";
    /** @readonly */ link = "https://github.com/ilib-js/i18nlint/blob/main/docs/resource-edge-whitespace.md";
    /** @readonly */ ruleType = "resource";

    constructor() {
        super({});
    }

    /** @override */
    getRuleType() {
        return this.ruleType;
    }

    /** @TODO
     * @override
     * @param {object} options
     * @param {import("ilib-tools-common").Resource} options.resource
     * @param {string} options.file
     * @param {string} options.locale
     *
     */
    match({ resource, file, locale }) {
        const source = resource.getSource();
        const target = resource.getTarget();

        if ("string" !== typeof source || "string" !== typeof target) {
            return /* don't check when either source or target string is not defined */;
        }

        const whitespaces = {
            source: this._getEdgeWhitespaces(source),
            target: this._getEdgeWhitespaces(target),
        };

        const /** @type {Result[]} */ results = [];
        const resultMetaProps = {
            severity: "error",
            id: resource.getKey(),
            rule: this,
            pathName: file,
            source,
            locale,
        };

        if (whitespaces.target.leading !== whitespaces.source.leading) {
            results.push(
                new Result({
                    ...resultMetaProps,
                    description: "Leading whitespace in target does not match leading whitespace in source",
                    highlight:
                        `Source: ` +
                        `<e0>${source.slice(0, whitespaces.source.leading.length)}</e0>` +
                        source.slice(whitespaces.source.leading.length) +
                        `\n` +
                        `Target: ` +
                        `<e0>${target.slice(0, whitespaces.target.leading.length)}</e0>` +
                        target.slice(whitespaces.target.leading.length),
                })
            );
        }

        if (whitespaces.target.trailing !== whitespaces.source.trailing) {
            results.push(
                new Result({
                    ...resultMetaProps,
                    description: "Trailing whitespace in target does not match trailing whitespace in source",
                    highlight:
                        `Source: ` +
                        source.slice(0, source.length-whitespaces.source.trailing.length) +
                        `<e0>${source.slice(source.length-whitespaces.source.trailing.length)}</e0>` +
                        `\n` +
                        `Target: ` +
                        target.slice(0, target.length-whitespaces.target.trailing.length) +
                        `<e0>${target.slice(target.length-whitespaces.target.trailing.length)}</e0>`,
                })
            );
        }

        return results.length > 1 ? results : results[0];
    }

    _getEdgeWhitespaces(/** @type {string} */ str) {
        const leading = (str.match(/^\s+/) ?? [""])[0];
        const trailing =
            leading.length < str.length
                ? (str.match(/\s+$/) ?? [""])[0]
                : ""; /* avoid matching twice if the string is whitespace-only */
        return {
            leading,
            trailing,
        };
    }
}

export default ResourceEdgeWhitespace;
