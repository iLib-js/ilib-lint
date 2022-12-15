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

const API = {
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
        
    }

    /**
     * Return an array of handlers that handle the given path name based
     * on things like the file name extension.
     *
     * @param {String} pathName path to a file to match
     * @param {String} type the type of plugin being sought, "parser" or "rule"
     * @returns {Array.<Plugin>} an array of plugins that claim to handle
     * the given path name
     */
    getHandlers(pathName, type) {
    }
};

export default PluginManager;
