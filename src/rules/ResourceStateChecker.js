/*
 * ResourceStateChecker.js - rule to check that state field of a
 *   resource has a particular value
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

import { Rule, Result } from 'i18nlint-common';

/**
 * @class Represent an ilib-lint rule.
 */
class ResourceStateChecker extends Rule {
    /**
     * Make a new rule instance.
     * @param {Object} options options as documented above
     * @constructor
     */
    constructor(options) {
        super(options);
        this.name = "resource-state-checker";
        this.description = "Ensure that resources have a particular state.";
        this.sourceLocale = (options && options.sourceLocale) || "en-US";
        this.link = "https://github.com/ilib-js/i18nlint/blob/main/docs/resource-state-checker.md";

        if (options) {
            if (typeof(options.param) === "string") {
	            // enforce the given string as the only state allowed
	            this.states = [ options.param ];
            } else if (Array.isArray(options.param)) {
                this.states = options.param;
            }
        }
        if (!this.states) {
            this.states = [ "translated" ];
        }
    }

    getRuleType() {
        return "resource";
    }

    /**
     * @override
     */
    match(options) {
        const { locale, resource, file } = options || {};
        const state = resource.getState().toLowerCase();

        if (state && this.states.indexOf(state) > -1) {
            // recognized state, so return no results
            return;
        }

        // oh oh, bad state!
        let value = {
            severity: "error",
            id: resource.getKey(),
            rule: this,
            pathName: file,
            highlight: `Resource found with disallowed state: <e0>${state}</e0>`,
            description: (this.states.length > 1) ?
                `Resources must have one of the following states: ${this.states.join(", ")}` :
                `Resources must have the following state: ${this.states[0]}`,
            locale,
            source: resource.getSource()
        };
        if (typeof(options.lineNumber) !== 'undefined') {
            value.lineNumber = options.lineNumber;
        }
        return new Result(value);
    }
}

export default ResourceStateChecker;
