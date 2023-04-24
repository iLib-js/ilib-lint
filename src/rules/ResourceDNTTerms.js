/*
 * ResourceDNTTerms.js - rule to ensure that Do Not Translate terms have not been translated
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
import fs from "node:fs";

/** Rule to ensure that Do Not Translate terms have not been translated;
 * i.e., if a DNT term appears in source, it has to appear in target as well */
class ResourceDNTTerms extends Rule {
    /** @readonly */ name = "resource-dnt-terms";
    /** @readonly */ description = "Ensure that Do Not Translate terms have not been translated.";
    /** @readonly */ link = "https://github.com/ilib-js/i18nlint/blob/main/docs/resource-dnt-terms.md";
    /** @readonly */ ruleType = "resource";

    /**
     * @readonly
     * @type {string[]}
     */
    _dntTerms = [];

    get dntTerms() {
        return [...this._dntTerms];
    }

    /**
     * @typedef ExplicitTerms
     * @type {object}
     * @property {string[]} terms Explicit list of DNT terms to check
     */

    /**
     * @typedef FileTerms
     * @type {object}
     * @property {string} termsFilePath Path to DNT terms file (either absolute or relative to current working directory)
     * @property {("json"|"txt")} termsFileType Determines how DNT file should be parsed - either as JSON or as TXT with one term per line
     */

    constructor(/** @type {ExplicitTerms | FileTerms | {}} */ params) {
        super({});
        let /** @type {string[]} */ terms = [];

        if ("terms" in params) {
            // explicit terms from config
            terms = params.terms;
            // ensure valid type
            if (!Array.isArray(terms) || !terms.every((term) => "string" === typeof term)) {
                throw new Error(`DNT terms provided in an unexpected format; expected string[]`);
            }
        } else if ("termsFilePath" in params) {
            // if the terms are not provided explicitly, parse them from a file
            switch (params.termsFileType) {
                case "json":
                    terms = ResourceDNTTerms._parseTermsFromJsonFile(params.termsFilePath);
                    break;
                case "txt":
                    terms = ResourceDNTTerms._parseTermsFromTxtFile(params.termsFilePath);
                    break;
                default:
                    throw new Error(`"${params.termsFileType}" is not a valid DNT terms file type`);
            }
        } else {
            // no terms provided
            terms = [];
        }

        this._dntTerms = [...new Set(terms.filter((t) => t.length > 0))];
    }

    /** @override */
    getRuleType() {
        return this.ruleType;
    }

    /** Check that a given resource has both source and target tags set
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

        const resultMetaProps = {
            id: resource.getKey(),
            rule: this,
            pathName: file,
            source,
            locale,
        };

        const /** @type {Result[]} */ results = [];

        for (const term of this._dntTerms) {
            if (source.includes(term) && !target.includes(term)) {
                results.push(
                    new Result({
                        ...resultMetaProps,
                        severity: "error",
                        description: "A DNT term is missing in target string.",
                        highlight: `Missing term: <e0>${term}</e0>`,
                    })
                );
            }
        }

        return results;
    }

    /** Parse DNT terms from a JSON `string[]` file
     * @param path Path to a DNT dictionary stored as JSON `string[]` file
     */
    static _parseTermsFromJsonFile(/** @type {string} */ path) {
        const text = fs.readFileSync(path, "utf8");
        let content = undefined;
        try {
            content = JSON.parse(text);
        } catch {
            throw new Error(`Failed to parse DNT terms file as JSON`);
        }
        if (!Array.isArray(content) || !content.every((term) => "string" === typeof term)) {
            throw new Error(`DNT terms JSON file has unexpected content; expected string[]`);
        }
        return /** @type {string[]} */ (content);
    }

    /** Parse DNT terms from a text file by treating each line in file as a separate term */
    static _parseTermsFromTxtFile(/** @type {string} */ path) {
        const text = fs.readFileSync(path, "utf8");
        return text.split(/\r?\n/);
    }
}

export default ResourceDNTTerms;
