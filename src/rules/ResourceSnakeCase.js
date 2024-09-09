/*
 * ResourceSnakeCase.js - rule to check that when source strings contain only
 *   * snake_case or SCREAMING_SNAKE_CASE or camel_Snake_Case
 *   * and no whitespace, then the targets are the same
 *
 * Copyright © 2024 JEDLSoft
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
import {Result} from 'ilib-lint-common';


/**
 * @class Represent an ilib-lint rule.
 */
class ResourceSnakeCase extends ResourceRule {
    constructor(options) {
        super(options);

        this.name = "resource-snake-case";
        this.description = "Ensures that when source strings contain only snake case and no whitespace, then the targets are the same";
        this.link = "https://gihub.com/ilib-js/ilib-lint/blob/main/docs/resource-snake-case.md";

        this.snakeCaseRegex = /^[a-z0-9]+(_[a-z0-9]+)+$/;
        this.screamingSnakeCaseRegex = /^[A-Z0-9]+(_[A-Z0-9]+)+$/;
        this.camelSnakeCaseRegex = /^[a-z0-9]+(_[A-Z0-9][a-z0-9]*)+$/
    }


    matchString({source, target, file, resource}) {
        // First, check if the source string and target string are defined.
        // If either is undefined, return undefined.
        if (!source || !target) {
            return;
        }

        // Second, check if the source string with leading and trailing whitespace removed is in snake case.
        const trimmedSource = source.trim();
        const isSourceSnakeCase = this._isSnakeCase(trimmedSource);

        // Finally, compare the source and target strings
        // If the source is in snake case and it's the same as target, it's all good
        if (isSourceSnakeCase && source === target) {
            return;
        }

        // If the source and target strings are different, return an error
        const error = new Result({
            severity: "error",
            id: resource.getKey(),
            source,
            description: "The source string is in snake_case/SCREAMING_SNAKE_CASE/camel_Snake_Case, so it should not be translated. Update the target string to match the source string.",
            rule: this,
            locale: resource.sourceLocale,
            pathName: file
        })

        return error;
    }

    /**
     * @private
     * @param {string} string A non-empty string to check.
     * Returns true for snake case or screaming snake case strings.
     * Otherwise, returns false.
     */
    _isSnakeCase(string) {
        return this.snakeCaseRegex.test(string) || this.screamingSnakeCaseRegex.test(string) || this.camelSnakeCaseRegex.test(string);
    }
}

export default ResourceSnakeCase;