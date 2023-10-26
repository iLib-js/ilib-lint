#!/usr/bin/env node
/*
 * index.js - main program of ilib-lint
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

import fs from 'node:fs';
import path from 'node:path';

import OptionsParser from 'options-parser';
import Locale from 'ilib-locale';
import { JSUtils, Utils, Path } from 'ilib-common';
import json5 from 'json5';
import log4js from 'log4js';

import PluginManager from './PluginManager.js';
import Project from './Project.js';
import { wrap, indent } from './rules/utils.js';
import Lint from './lint.js';
import defaultConfig from './config/default.js';
import { FileConfigurationProvider, FolderConfigurationProvider } from './config/ConfigurationProvider.js';

const __dirname = Path.dirname(Path.fileUriToPath(import.meta.url));
log4js.configure(path.join(__dirname, '..', 'log4js.json'));

const logger = log4js.getLogger("ilib-lint.root");

// make sure the mins and maxes are numeric
function validateInt(paramName, arg, replace) {
    const num = parseInt(arg);
    if (!isNaN(num)) {
        replace(num);
        return true;
    }
    return `Argument to parameter ${paramName} must be an integer.`;
}

const optionConfig = {
    help: {
        short: "h",
        help: "This help message",
        showHelp: {
            banner: 'Usage: ilib-lint [-h] [options] path [path ...]',
            output: logger.info.bind(logger)
        }
    },
    config: {
        short: "c",
        varName: "PATH",
        help: "Give an explicit path to a configuration file instead of trying to find it in the current directory."
    },
    errorsOnly: {
        short: "e",
        flag: true,
        "default": false,
        help: "Only return errors and supress warnings"
    },
    formatter: {
        short: "f",
        varName: "NAME",
        "default": "ansi-console-formatter",
        help: "Name the formatter that should be used to format the output."
    },
    list: {
        flag: true,
        help: "Load all plugins, and then list out all available parsers, rules, rulesets, and formatters, then exit."
    },
    locales: {
        short: "l",
        varName: "LOCALES",
        "default": "en-AU,en-CA,en-GB,en-IN,en-NG,en-PH,en-PK,en-US,en-ZA,de-DE,fr-CA,fr-FR,es-AR,es-ES,es-MX,id-ID,it-IT,ja-JP,ko-KR,pt-BR,ru-RU,tr-TR,vi-VN,zxx-XX,zh-Hans-CN,zh-Hant-HK,zh-Hant-TW,zh-Hans-SG",
        help: "Locales you want your app to support. Value is a comma-separated list of BCP-47 style locale tags. Default: the top 20 locales on the internet by traffic."
    },
    sourceLocale: {
        short: "s",
        "default": "en-US",
        help: "Default locale used to interpret the strings in the source code or the source strings in resource files."
    },
    quiet: {
        short: "q",
        flag: true,
        help: "Produce no progress output during the run, except for error messages. Instead exit with a return value. Zero indicates no errors, and a positive exit value indicates errors."
    },
    verbose: {
        short: "v",
        flag: true,
        help: "Produce lots of progress output during the run."
    },
    fix: {
        flag: true,
        "default": false,
        help: "If auto-fixes are available for some of the errors, apply them (overwriting the original file)."
    },
    "max-errors": {
        short: "me",
        varName: "NUMBER",
        help: "Give the maximum acceptable number of errors allowed in this run. Default: 0",
        type: validateInt.bind(null, "max-errors")
    },
    "max-warnings": {
        short: "mw",
        varName: "NUMBER",
        help: "Give the maximum acceptable number of warnings allowed in this run. Default: 0",
        type: validateInt.bind(null, "max-warnings")
    },
    "max-suggestions": {
        short: "ms",
        varName: "NUMBER",
        help: "Give the maximum acceptable number of suggestions allowed in this run. Default: no maximum",
        type: validateInt.bind(null, "max-suggestions")
    },
    "min-score": {
        varName: "NUMBER",
        help: "Give the minimum acceptable I18N score allowed in this run. Valid values are 0-100. Default: no minimum",
        type: validateInt.bind(null, "min-score")
    },
    "root": {
        short: "r",
        varName: "ILIB_LINT_ROOT",
        help: "Specify the root directory where the search for files should start. Default: current dir",
    }
};

const options = OptionsParser.parse(optionConfig);

if (options.opt.quiet) {
    const rootlogger = log4js.getLogger();
    logger.level = "error";
} else if (options.opt.verbose) {
    const rootlogger = log4js.getLogger();
    logger.level = "debug";
}

logger.info("ilib-lint - Copyright (c) 2022-2023 JEDLsoft, All rights reserved.");

let paths = options.args;
if (paths.length === 0) {
    paths.push(".");
}

if (options.opt.locales) {
    options.opt.locales = options.opt.locales.split(/,/g);
}
// normalize the locale specs
options.opt.locales = options.opt.locales.map(spec => {
    let loc = new Locale(spec);
    if (!loc.getLanguage()) {
        loc = new Locale("und", loc.getRegion(), loc.getVariant(), loc.getScript());
    }
    return loc.getSpec();
});

// Load configuration
let config;
const cwdConfigProvider = new FolderConfigurationProvider(".");
if ("config" in options.opt && "string" == typeof options.opt.config) {
    // load configuration from a path specified in CLI
    config = await new FileConfigurationProvider(options.opt.config).loadConfiguration();
} else if (await cwdConfigProvider.hasConfigurationFile()) {
    // otherwise look for configuration in CWD
    config = await cwdConfigProvider.loadConfiguration();
} else {
    // else use default bundled config
    config = defaultConfig;
}


const lint = new Lint(options.opt, config);

lint.run().then(exitValue => {
    process.exit(exitValue);
}).catch(e => {
    logger.error(e);
});
