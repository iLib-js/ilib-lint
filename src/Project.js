/*
 * Project.js - Represents a particular i18nlint project
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

import fs from "node:fs";
import path from "node:path";
import log4js from "log4js";
import mm from "micromatch";
import JSON5 from "json5";

import { FileStats, Plugin, Result } from "i18nlint-common";

import SourceFile from "./SourceFile.js";
import DirItem from "./DirItem.js";
import FileType from "./FileType.js";
import ParserManager from "./ParserManager.js";
import RuleManager from "./RuleManager.js";
import PluginManager from "./PluginManager.js";
import NotImplementedError from "./NotImplementedError.js";
import FixerManager from "./FixerManager.js";

const logger = log4js.getLogger("i18nlint.Project");

const rulesetDefinitions = {
    "resource-check-all": {
        "resource-icu-plurals": true,
        "resource-quote-style": "localeOnly",
        "resource-unique-keys": true,
        "resource-url-match": true,
        "resource-named-params": true
    }
};

const xliffFileTypeDefinition = {
    name: "xliff",
    glob: "**/*.xliff",
    ruleset: [ "resource-check-all" ]
};

const unknownFileTypeDefinition = {
    name: "unknown",
    glob: "**/*"
};

/**
 * @class Represent an i18nlint project.
 *
 * A project is defined as a root directory and a configuration that
 * goes with it that tells the linter how to process files it finds
 * in that root directory. Subprojects can be nested inside of the
 * the top project as indicated by the presence of a new configuration
 * file in the subdirectory.
 */
class Project extends DirItem {
    /**
     * Construct a new project.
     *
     * @param {String} root root directory for this project
     * @param {Object} options properties controlling how this run of the linter
     * works, mostly from the command-line options
     * @param {Object} config contents of a configuration file for this project
     */
    constructor(root, options, config) {
        super(root, options, config);

        /** @type {SourceFile[]} */
        this.files = [];

        /** @type {Project[]} */
        this.projects = [];

        if (!options || !root || !config || !options.pluginManager) {
            throw "Insufficient params given to Project constructor";
        }

        this.root = root;
        this.options = options;
        this.config = config;
        if (this.config) {
            this.includes = this.config.paths ? Object.keys(this.config.paths) : ["**"];
            this.excludes = config.excludes;
            this.name = config.name;
        }
        this.sourceLocale = options?.opt?.sourceLocale;

        /** @type {PluginManager} */
        this.pluginMgr = this.options.pluginManager;
        const ruleMgr = this.pluginMgr.getRuleManager();
        const fmtMgr = this.pluginMgr.getFormatterManager();
        const fixerMgr = this.pluginMgr.getFixerManager();
        if (this.config.rules) {
            ruleMgr.add(this.config.rules);
        }
        ruleMgr.addRuleSetDefinitions(rulesetDefinitions);
        if (this.config.rulesets) {
            ruleMgr.addRuleSetDefinitions(this.config.rulesets);
        }
        if (this.config.formatters) {
            fmtMgr.add(this.config.formatters);
        }
        if (this.config.fixers) {
            fixerMgr.add(this.config.fixers);
        }

        this.filetypes = {
            "xliff": new FileType({project: this, ...xliffFileTypeDefinition}),
            "unknown": new FileType({project: this, ...unknownFileTypeDefinition})
        };
        if (this.config.filetypes) {
            for (let ft in this.config.filetypes) {
                this.filetypes[ft] = new FileType({
                    name: ft,
                    project: this,
                    ...this.config.filetypes[ft]
                });
            }
        }
        if (this.config.paths) {
            this.mappings = this.config.paths;
            for (let glob in this.mappings) {
                let mapping = this.mappings[glob];
                if (typeof(mapping) === 'object') {
                    // this is an "on-the-fly" file type
                    this.filetypes[glob] = new FileType({
                        name: glob,
                        project: this,
                        ...mapping
                    });
                } else if (typeof(mapping) === 'string') {
                    if (!this.filetypes[mapping]) {
                        throw `Mapping ${glob} is configured to use unknown filetype ${mapping}`;
                    }
                }
            }
        }
        this.formatter = fmtMgr.get(options.formatter || "ansi-console-formatter");
        if (!this.formatter) {
            logger.error(`Could not find formatter ${options.formatter}. Aborting...`);
            process.exit(3);
        }

        this.fileStats = new FileStats();
        this.resultStats = {
            errors: 0,
            warnings: 0,
            suggestions: 0
        };
    }

    /**
     *
     * Recursively walk a directory and return a list of files and directories
     * within that directory. The walk is controlled via a list of exclude and
     * include patterns. Each pattern should be a micromatch pattern like this:
     *
     * <code>
     * "*.json"
     * </code>
     *
     * The full path to every file and directory in the top-level directory will
     * be included, unless it matches an exclude pattern, it which case, it will be
     * excluded from the output. However, if the path
     * also matches an include pattern, it will still be included nonetheless. The
     * idea is that you can exclude a whole category of files (like all json files),
     * but include specific ones. For example, you may exclude all json files, but
     * still want to include the "config.json" file.<p>

     * The options parameter may include any of the following optional properties:
     *
     * <ul>
     * <li><i>excludes</i> (Array of strings) - A list of micromatch patterns to
     * exclude from the output. If a pattern matches a directory, that directory
     * will not be recursively searched.
     * <li><i>includes</i> (Array of strings) - A list of micromatch patterns to
     * include in the walk. If a pattern matches both an exclude and an include, the
     * include will override the exclude.
     * </ul>
     *
     * @param {String} root Directory to walk
     * @returns {Array.<DirItem>} an array of file names in the directory, filtered
     * by the the excludes and includes list
     * @private
     */
    walk(root) {
        let list;

        if (typeof(root) !== "string") {
            return [];
        }

        let includes = this.getIncludes();
        let excludes = this.getExcludes();
        let pathName, included, stat, glob;

        try {
            stat = fs.statSync(root, {throwIfNoEntry: false});
            if (stat) {
                if (stat.isDirectory()) {
                    const configFileName = path.join(root, "ilib-lint-config.json");
                    if (root !== this.root && fs.existsSync(configFileName)) {
                        // a project
                        const data = fs.readFileSync(configFileName, "utf-8");
                        const config = JSON5.parse(data);
                        const newProject = new Project(root, this.getOptions(), config);
                        includes = newProject.getIncludes();
                        excludes = newProject.getExcludes();
                        logger.trace(`New project ${newProject.getName()}`);
                        this.addProject(newProject);
                        newProject.scan([root]);
                    } else {
                        // dir but not a project
                        list = fs.readdirSync(root);
                        logger.trace(`Searching dir ${root}`);

                        if (list && list.length !== 0) {
                            list.sort().forEach((file) => {
                                if (file === "." || file === "..") {
                                    return;
                                }

                                pathName = path.join(root, file);
                                included = true;

                                if (excludes) {
                                    logger.trace(`There are excludes. Relpath is ${pathName}`);
                                    included = !mm.isMatch(pathName, excludes);
                                }

                                if (included) {
                                    this.walk(pathName);
                                }
                            });
                        }
                    }
                } else if (stat.isFile()) {
                    included = false;

                    if (includes) {
                        logger.trace(`There are includes.`);
                        mm.match(root, includes, {
                            onMatch: (params) => {
                                if (!glob && params.isMatch) {
                                    glob = params.glob;
                                    const settings = this.getSettings(glob);
                                    excludes = settings.excludes || excludes;
                                    included = excludes ? !mm.isMatch(root, excludes) : true;
                                }
                            }
                        });
                    }

                    if (included) {
                        logger.trace(`${root} ... included`);
                        glob = glob || "**";
                        const filetype = this.getFileTypeForPath(root);
                        this.addFile(new SourceFile(root, {
                            settings: this.getSettings(glob),
                            filetype
                        }, this));
                    } else {
                        logger.trace(`${root} ... excluded`);
                    }
                } // else just ignore it
            } else {
                logger.warn(`File ${root} does not exist.`);
            }
        } catch (e) {
            // if the readdirSync did not work, it's maybe a file?
            // if (fs.existsSync(root)) {
            //     this.add(new SourceFile(root, {}, this)); // @TODO why no file type supplied? it seems that SourceFile expects it to be always set
            // }

        }

        return [...this.getFiles(), ...this.getProjects()];
    }

    /**
     * Scan the given paths for files and subprojects to process later.
     * If this method finds a subproject, it will be added to the list
     * as well, and its scan method will be called.
     *
     * @param {Array.<String>} paths an array of paths to scan
     */
    scan(paths) {
        paths.forEach(pathName => {
            this.walk(pathName);
        });
    }

    /**
     * Initialize this project. This returns a promise to load the
     * plugins and initializes them.
     *
     * @returns {Promise} a promise to initialize the project
     */
    init() {
        let promise = Promise.resolve();

        if (this.config.plugins) {
            promise = promise.then(() => {
                return this.pluginMgr.load(this.config.plugins);
            });
        }

        // initialize any projects or files that have an init method.
        this.files.forEach(file => {
            promise = promise.then(() => { 
                return file.init();
            });
        });

        return promise;
    }

    /**
     * Get the unique name of this project.
     * @returns {String} the unique name of this project.
     */
    getName() {
        return this.name;
    }

    /**
     * Return the root directory for this project.
     * @returns {String} the path to the root directory of this project
     */
    getRoot() {
        return this.root;
    }

    /**
     * Return the includes list for this project.
     * @returns {Array.<String> | undefined} the includes for this project
     */
    getIncludes() {
        return this.includes;
    }

    /**
     * Return the excludes list for this project.
     * @returns {Array.<String>} the excludes for this project
     */
    getExcludes() {
        return this.excludes;
    }

    /**
     * Return the options for this project.
     * @returns {Array.<String>} the options for this project
     */
    getOptions() {
        return this.options;
    }

    /**
     * Get the source locale for this project. This is the locale in
     * which the strings and source code are written.
     *
     * @returns {String} the source locale for this project.
     */
    getSourceLocale() {
        return this.sourceLocale;
    }

    /**
     * Return the list of global locales for this project.
     * @returns {Array.<String>} the list of global locales for this project
     */
    getLocales() {
        return this.options.locales || this.config.locales;
    }

    /**
     * Return the plugin manager for this project.
     * @returns {PluginManager} the plugin manager for this project
     */
    getPluginManager() {
        return this.options.pluginManager;
    }

    /**
     * Return the parser manager for this project.
     * @returns {ParserManager} the parser manager for this project
     */
    getParserManager() {
        const pluginMgr = this.options.pluginManager;
        return pluginMgr.getParserManager();
    }

    /**
     * Return the rule manager for this project.
     * @returns {RuleManager} the rule manager for this project
     */
    getRuleManager() {
        const pluginMgr = this.options.pluginManager;
        return pluginMgr.getRuleManager();
    }

    /**
     * Return the fixer manager for this project.
     * @returns {FixerManager} the fixer manager for this project
     */
    getFixerManager() {
        const pluginMgr = this.options.pluginManager;
        return pluginMgr.getFixerManager();
    }

    /**
     * Return the named file type definition. Projects have two
     * default file types that are always defined for every project:
     * "xliff", and "unknown".
     *
     * - xliff - handles all *.xliff files using the XliffParser.
     * It uses the default resources rule set to perform all regular
     * resource checks.
     * - unknown - handles all file types that are not otherwise
     * matched. It does not perform any rule checks on any file.
     *
     * @param {String} name the name or the glob expression used to
     * identify the requested file type
     * @returns {FileType} the requested file type, or undefined if
     * there is no such file type
     */
    getFileType(name) {
        throw new NotImplementedError();
    }

    /**
     * Using the path mappings, find the file type that applies for
     * the given path. If no mappings apply, the "unkown" file type
     * will be returned.
     *
     * @param {String} pathName the path to the file to test
     * @returns {FileType} the file type instance that applies to
     * the given file.
     */
    getFileTypeForPath(pathName) {
        pathName = path.normalize(pathName);
        for (let glob in this.mappings) {
            if (mm.isMatch(pathName, glob)) {
                // if it is a string, it names the file type. If it is
                // something else, then it is an on-the-fly file type
                // definition
                const name = typeof(this.mappings[glob]) === 'string' ?
                    this.mappings[glob] :
                    glob;
                return this.filetypes[name] || this.filetypes.unknown;
            }
        }
        // default: we don't know what this type of file is!
        return this.filetypes.unknown;
    }

    getRuleSet(glob) {
        if (this.config.paths && this.config.paths[glob]) {
            const rules = this.config.paths[glob].rules;
        }
    }

    getConfig() {
        return this.config;
    }

    getSettings(glob) {
        return (this.config.paths && this.config.paths[glob]) || {};
    }

    /**
     * Add a file item to this project.
     *
     * @param {SourceFile} item file item to add
     */
    addFile(item) {
        this.files.push(item);
    }

    /**
     * Add a nested project item to this project.
     *
     * @param {Project} item project item to add
     */
    addProject(item) {
        this.projects.push(item);
    }

    /**
     * Return all file items in this project.
     * @returns {Array.<SourceFile>} the file items in this project.
     */
    getFiles() {
        return this.files;
    }

    /**
     * Return all nested project items in this project.
     * @returns {Array.<Project>} the nested project items in this project.
     */
    getProjects() {
        return this.projects;
    }

    /**
     * Find all issues with the files located within this project and
     * all subprojects, and return them together in an array.
     *
     * @returns {Array.<Result>} a list of results
     */
    findIssues(locales) {
        return [...this.files.flatMap(file => {
            logger.trace(`Examining file ${file.filePath}`);

            // collect stats
            file.parse().forEach(ir => {
                if (ir.stats) {
                    this.fileStats.addStats(ir.stats);
                } else {
                    // no stats? At least we know there was a file, so count that
                    this.fileStats.addFiles(1);
                }
            });

            return file.findIssues(locales);
        }),
        ...this.projects.flatMap(project => {
            logger.trace(`Examining project ${project.filePath}`);
            return project.findIssues(locales);
        })];
    }

    /**
     * Return the I18N Score of this project. The score is a number from
     * zero to 100 which gives the approximate localization readiness of
     * the whole project. The absolute number of the score is not as
     * important as the relative movement of the score, as the increase
     * in score shows an improvement in localizability.
     *
     * In this particular score, errors are weighted most heavily,
     * followed by warnings at a medium level, and suggestions at a
     * very light level.
     *
     * @returns {Number} the score (0-100) for this project.
     */
    getScore() {
        if (!this.fileStats) {
            throw new Error("Attempt to calculate the I18N score without having retrieved the issues first.");
        }

        const base = (this.fileStats.modules || this.fileStats.lines || this.fileStats.files || this.fileStats.bytes || 1);
        const demeritPoints = this.resultStats.errors * 5 + this.resultStats.warnings * 3 + this.resultStats.suggestions;

        // divide demerit points by the base so that larger projects are not penalized for
        // having more issues just because they have more files, lines, or modules
        // y intercept = 100
        // lim(x->infinity) of f(x) = 0
        return 100 / (1.0 + demeritPoints/base);
    }

    /**
     * Find all issues in this project and all subprojects and print
     * them with the chosen formatter. This is the main loop.
     * @returns {Number} the exit value
     */
    run() {
        let exitValue = 0;
        const results = this.findIssues(this.options.locales);

        if (results) {
            results.forEach(result => {
                const str = this.formatter.format(result);
                if (str) {
                    if (result.severity === "error") {
                        logger.error(str);
                        this.resultStats.errors++;
                    } else if (result.severity === "warning") {
                        this.resultStats.warnings++;
                        if (!this.options.errorsOnly) {
                            logger.warn(str);
                        }
                    } else {
                        this.resultStats.suggestions++;
                        if (!this.options.errorsOnly) {
                            logger.info(str);
                        }
                    }
                }
            });
        }

        const fmt = new Intl.NumberFormat("en-US", {
            maximumFractionDigits: 2
        });
        logger.info(`                             ${`Average over`.padEnd(15, ' ')}${`Average over`.padEnd(15, ' ')}${`Average over`.padEnd(15, ' ')}`);
        logger.info(`                   Total     ${`${String(this.fileStats.files)} Files`.padEnd(15, ' ')}${`${String(this.fileStats.modules)} Modules`.padEnd(15, ' ')}${`${String(this.fileStats.lines)} Lines`.padEnd(15, ' ')}`);
        if (results.length) {
            logger.info(
                    `Errors:            ${String(this.resultStats.errors).padEnd(10, ' ')}${fmt.format(this.resultStats.errors/this.fileStats.files).padEnd(15, ' ')}${fmt.format(this.resultStats.errors/this.fileStats.modules).padEnd(15, ' ')}${fmt.format(this.resultStats.errors/this.fileStats.lines).padEnd(15, ' ')}`);
            if (!this.options.errorsOnly) {
                logger.info(
                    `Warnings:          ${String(this.resultStats.warnings).padEnd(10, ' ')}${fmt.format(this.resultStats.warnings/this.fileStats.files).padEnd(15, ' ')}${fmt.format(this.resultStats.warnings/this.fileStats.modules).padEnd(15, ' ')}${fmt.format(this.resultStats.warnings/this.fileStats.lines).padEnd(15, ' ')}`);
                logger.info(
                    `Suggestions:       ${String(this.resultStats.suggestions).padEnd(10, ' ')}${fmt.format(this.resultStats.suggestions/this.fileStats.files).padEnd(15, ' ')}${fmt.format(this.resultStats.suggestions/this.fileStats.modules).padEnd(15, ' ')}${fmt.format(this.resultStats.suggestions/this.fileStats.lines).padEnd(15, ' ')}`);
            }
        }
        const score = this.getScore();
        logger.info(`I18N Score (0-100) ${fmt.format(score)}`);

        if (this.options.opt["max-errors"]) {
            exitValue = this.resultStats.errors > this.options.opt["max-errors"] ? 2 : 0;
        } else if (this.options.opt["max-warnings"]) {
            exitValue = this.resultStats.warnings > this.options.opt["max-warnings"] ? 1 : 0;
        } else if (this.options.opt["max-suggestions"]) {
            exitValue = this.resultStats.suggestions > this.options.opt["max-suggestions"] ? 1 : 0;
        } else if (this.options.opt["min-score"]) {
            exitValue = score < this.options.opt["min-score"] ? 2 : 0;
        } else {
            exitValue = this.resultStats.errors > 0 ? 2 : ((this.resultStats.warnings > 0) ? 1 : 0);
        }
        return exitValue;
    }

    clear() {
        this.files = [];
    }
};

export default Project;
