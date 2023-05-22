/*
 * FixerManager.js
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

import log4js from "log4js";

import { Fixer } from "i18nlint-common";

const logger = log4js.getLogger("i18nlint.FormatterManager");

/** @typedef {typeof Fixer} FixerClass */
/**
 * @typedef RegisteredFixerEntry
 * @type {object}
 * @property {string} name
 * @property {FixerClass} class Subclass of the Fixer (class, not an instance)
 *
 */
/**
 * @typedef FixerRegistry
 * @type {Record<string, RegisteredFixerEntry>}
 */

// @TODO the convention should be changed, and FixerManager should instead cache
// instances of the Fixer, which should've been created by the Plugin.getFixers(optionsFromConfig) static factory method

/**
 * @class Manages a collection of fixers that this instance of ilib-lint
 * knows about.
 */
class FixerManager {
    /** @type {FixerRegistry} */
    registry = {};

    /**
     * Create a new formatter manager.
     * @param {Object} [options] options controlling the construction of this object
     * @param {FixerClass[]} [options.fixers]
     */
    constructor(options) {
        if (options) {
            if (options.fixers) {
                this.add(...options.fixers);
            }
        }
    }

    /**
     * Instantiate a formatter for a requested type identifier,
     * to use it for applying Fixes.
     *
     * @param {String} type type identifier for which a Fixer instance should be returned
     * @param {Object|undefined} options options for this instance from the config file
     * @returns {Fixer | undefined} instance of the Fixer if any is registered for given type
     */
    get(type, options = undefined) {
        const entry = this.registry[type];
        if (!entry) return;

        return new entry.class({
            ...options,
            getLogger: log4js.getLogger.bind(log4js),
        });
    }

    /**
     * Add a fixer subclass to this registry so that other code
     * can request instances for a given type identifier.
     *
     * @param {FixerClass[]} fixerClasses the list of fixer classes to add
     */
    add(...fixerClasses) {
        for (const fixerClass of fixerClasses) {
            if (!("function" === typeof fixerClass && Object.getPrototypeOf(fixerClass).name === Fixer.name)) {
                throw new Error("not a valid fixer class");
            }

            const instance = new fixerClass();
            const typeId = instance.type;
            const name = /** @type {any} */ (instance).name ?? fixerClass.name;

            if (typeId in this.registry) {
                throw new Error(
                    `Failed to register fixer ${name} for type ${typeId}, because another fixer ${this.registry[typeId].name} had already been registered for this type`
                );
            }

            this.registry[typeId] = {
                class: fixerClass,
                name: fixerClass.name,
            };
            logger.trace(`Registered a new fixer: ${fixerClass.name}`);
        }
    }

    /**
     * Return how many rules this manager knows about.
     * @returns {Number} the number of rules this manager knows about.
     */
    size() {
        return Object.keys(this.registry).length;
    }

    // for use with the unit tests
    clear() {
        for (const id in Object.keys(this.registry)) {
            delete this.registry[id];
        }
    }
}

export default FixerManager;
