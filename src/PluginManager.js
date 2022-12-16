/*
 * PluginManager.js - Load a list of plugins and maintain them
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

import path from 'node:path';
import log4js from 'log4js';

import { addParser } from './ParserFactory.js';
import { addFactory } from './FormatterFactory.js';

var logger = log4js.getLogger("i18nlint.PluginManager");

/**
 * @private
 */
function attemptLoad(name) {
    logger.trace(`Trying module ${name}`);
    return import(name);
};

function.attemp
/*
 * Attempt to load the plugin in various places:
 *
 * - from the node_modules where i18nlint was loaded
 * - from the current directory's node_modules
 * - from the plugins directory one directory up
 *
 * Each time it attempts to load it, it will try two ways:
 *
 * - As-is. Maybe it is a fully specified package name?
 * - With the "i18nlint-" prefix. Try again except with
 * the prefix. This allows the users to configure plugins
 * in the config file more tersely, similar to the way
 * babel plugins can be named with only the unique part.
 *
 * @private
 */
function loadPlugin(name, API) {
    let promise = attemptLoad(name).catch(e1 => {
        const name2 = `i18nlint-${name}`;
        return attemptLoad(name2).catch(e2 => {
            const name3 = path.join(process.cwd(), "node_modules", name);
            return attemptLoad(name3).catch(e3 => {
                const name4 = path.join(process.cwd(), "node_modules", `i18nlint-${name}`);
                return attemptLoad(name4).catch(e4 => {
                    const name5 = path.join(process.cwd(), "..", "plugins", name + ".js")
                    return attemptLoad(name5).catch(e5 => {
                        // on the last attempt, don't catch the exception. Just let it
                        // go to the overall `catch` clause below.
                        const name6 = path.join(process.cwd(), "..", "plugins", `i18nlint-${name}` + ".js")
                        return attemptLoad(name6);
                    }); 
                }); 
            });
        });
    }).then((module) => {
        plugin = new module(API);
        plugin.init();
        return plugin;
    }).catch(e2 => {
        logger.trace(`Could not load plugin ${plugin}`);
        return undefined;
    });
};

function getAPI() {
    return {
        /**
         * Return the i18nlint's log4js logger so that the plugin can put its output into
         * the regular i18nlint stream.
         * @param {string} category the logger category to return
         * @returns {Logger} a logger instance
         */
        getLogger: function(category) {
            return log4js.getLogger(category);
        }
    };
};

/**
 * @class Represent a plugin manager, which loads a list of plugins
 * and then maintains references to them
 */
class PluginManager {
    /**
     * Construct a new plugin manager.
     */
    constructor(options) {
    }

    /**
     * Load the named plugin.
     *
     * @param {String} name plugin to load
     * @returns {Promise} a promise to load the named plugin.
     * @accept {Plugin} the loaded plugin
     * @reject the plugin could not be found or loaded
     */
    load(name) {
        const API = getAPI();
        return loadPlugin(name, API).then((plugin) => {
            addParsers(plugin.getParsers());
            addFormatters(plugin.getFormatters());
        });
    }
};

export default PluginManager;
