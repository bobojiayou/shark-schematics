"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const core_1 = require("@angular-devkit/core");
const schematics_1 = require("@angular-devkit/schematics");
const tasks_1 = require("@angular-devkit/schematics/tasks");
const latest_versions_1 = require("../../utility/latest-versions");
const json_utils_1 = require("./json-utils");
const defaults = {
    appRoot: 'src',
    index: 'index.html',
    main: 'main.ts',
    polyfills: 'polyfills.ts',
    tsConfig: 'tsconfig.app.json',
    test: 'test.ts',
    outDir: 'dist/',
    karma: 'karma.conf.js',
    protractor: 'protractor.conf.js',
    testTsConfig: 'tsconfig.spec.json',
    serverOutDir: 'dist-server',
    serverMain: 'main.server.ts',
    serverTsConfig: 'tsconfig.server.json',
};
function getConfigPath(tree) {
    let possiblePath = core_1.normalize('.angular-cli.json');
    if (tree.exists(possiblePath)) {
        return possiblePath;
    }
    possiblePath = core_1.normalize('angular-cli.json');
    if (tree.exists(possiblePath)) {
        return possiblePath;
    }
    throw new schematics_1.SchematicsException('Could not find configuration file');
}
function migrateKarmaConfiguration(config) {
    return (host, context) => {
        context.logger.info(`Updating karma configuration`);
        try {
            const karmaPath = config && config.test && config.test.karma && config.test.karma.config
                ? config.test.karma.config
                : defaults.karma;
            const buffer = host.read(karmaPath);
            if (buffer !== null) {
                let content = buffer.toString();
                // Replace the 1.0 files and preprocessor entries, with and without comma at the end.
                // If these remain, they will cause the `ng test` to fail.
                content = content.replace(`{ pattern: './src/test.ts', watched: false },`, '');
                content = content.replace(`{ pattern: './src/test.ts', watched: false }`, '');
                content = content.replace(`'./src/test.ts': ['@angular/cli'],`, '');
                content = content.replace(`'./src/test.ts': ['@angular/cli']`, '');
                content = content.replace(/angularCli[^}]*},?/, '');
                // Replace 1.x plugin names.
                content = content.replace(/@angular\/cli/g, '@angular-devkit/build-angular');
                // Replace code coverage output path.
                content = content.replace('reports', `dir: require('path').join(__dirname, 'coverage'), reports`);
                host.overwrite(karmaPath, content);
            }
        }
        catch (e) { }
        return host;
    };
}
function migrateConfiguration(oldConfig, logger) {
    return (host, context) => {
        const oldConfigPath = getConfigPath(host);
        const configPath = core_1.normalize('angular.json');
        context.logger.info(`Updating configuration`);
        const config = {
            '$schema': './node_modules/@angular/cli/lib/config/schema.json',
            version: 1,
            newProjectRoot: 'projects',
            projects: extractProjectsConfig(oldConfig, host, logger),
        };
        const defaultProject = extractDefaultProject(oldConfig);
        if (defaultProject !== null) {
            config.defaultProject = defaultProject;
        }
        const cliConfig = extractCliConfig(oldConfig);
        if (cliConfig !== null) {
            config.cli = cliConfig;
        }
        const schematicsConfig = extractSchematicsConfig(oldConfig);
        if (schematicsConfig !== null) {
            config.schematics = schematicsConfig;
        }
        const architectConfig = extractArchitectConfig(oldConfig);
        if (architectConfig !== null) {
            config.architect = architectConfig;
        }
        context.logger.info(`Removing old config file (${oldConfigPath})`);
        host.delete(oldConfigPath);
        context.logger.info(`Writing config file (${configPath})`);
        host.create(configPath, JSON.stringify(config, null, 2));
        return host;
    };
}
function extractCliConfig(config) {
    const newConfig = {};
    if (config.packageManager && config.packageManager !== 'default') {
        newConfig['packageManager'] = config.packageManager;
    }
    if (config.warnings) {
        if (config.warnings.versionMismatch !== undefined) {
            newConfig.warnings = Object.assign({}, (newConfig.warnings || {}), { versionMismatch: config.warnings.versionMismatch });
        }
        if (config.warnings.typescriptMismatch !== undefined) {
            newConfig.warnings = Object.assign({}, (newConfig.warnings || {}), { typescriptMismatch: config.warnings.typescriptMismatch });
        }
    }
    return Object.getOwnPropertyNames(newConfig).length == 0 ? null : newConfig;
}
function extractSchematicsConfig(config) {
    let collectionName = '@schematics/angular';
    if (!config || !config.defaults) {
        return null;
    }
    // const configDefaults = config.defaults;
    if (config.defaults && config.defaults.schematics && config.defaults.schematics.collection) {
        collectionName = config.defaults.schematics.collection;
    }
    /**
     * For each schematic
     *  - get the config
     *  - filter one's without config
     *  - combine them into an object
     */
    // tslint:disable-next-line:no-any
    const schematicConfigs = ['class', 'component', 'directive', 'guard',
        'interface', 'module', 'pipe', 'service']
        .map(schematicName => {
        // tslint:disable-next-line:no-any
        const schematicDefaults = config.defaults[schematicName] || null;
        return {
            schematicName,
            config: schematicDefaults,
        };
    })
        .filter(schematic => schematic.config !== null)
        .reduce((all, schematic) => {
        all[collectionName + ':' + schematic.schematicName] = schematic.config;
        return all;
    }, {});
    const componentUpdate = {};
    componentUpdate.prefix = '';
    const componentKey = collectionName + ':component';
    const directiveKey = collectionName + ':directive';
    if (!schematicConfigs[componentKey]) {
        schematicConfigs[componentKey] = {};
    }
    if (!schematicConfigs[directiveKey]) {
        schematicConfigs[directiveKey] = {};
    }
    if (config.apps && config.apps[0]) {
        schematicConfigs[componentKey].prefix = config.apps[0].prefix;
        schematicConfigs[directiveKey].prefix = config.apps[0].prefix;
    }
    if (config.defaults) {
        schematicConfigs[componentKey].styleext = config.defaults.styleExt;
    }
    return schematicConfigs;
}
function extractArchitectConfig(_config) {
    return null;
}
function extractProjectsConfig(config, tree, logger) {
    const builderPackage = '@angular-devkit/build-angular';
    const defaultAppNamePrefix = getDefaultAppNamePrefix(config);
    const buildDefaults = config.defaults && config.defaults.build
        ? {
            sourceMap: config.defaults.build.sourcemaps,
            progress: config.defaults.build.progress,
            poll: config.defaults.build.poll,
            deleteOutputPath: config.defaults.build.deleteOutputPath,
            preserveSymlinks: config.defaults.build.preserveSymlinks,
            showCircularDependencies: config.defaults.build.showCircularDependencies,
            commonChunk: config.defaults.build.commonChunk,
            namedChunks: config.defaults.build.namedChunks,
        }
        : {};
    const serveDefaults = config.defaults && config.defaults.serve
        ? {
            port: config.defaults.serve.port,
            host: config.defaults.serve.host,
            ssl: config.defaults.serve.ssl,
            sslKey: config.defaults.serve.sslKey,
            sslCert: config.defaults.serve.sslCert,
            proxyConfig: config.defaults.serve.proxyConfig,
        }
        : {};
    const apps = config.apps || [];
    // convert the apps to projects
    const browserApps = apps.filter(app => app.platform !== 'server');
    const serverApps = apps.filter(app => app.platform === 'server');
    const projectMap = browserApps
        .map((app, idx) => {
        const defaultAppName = idx === 0 ? defaultAppNamePrefix : `${defaultAppNamePrefix}${idx}`;
        const name = app.name || defaultAppName;
        const outDir = app.outDir || defaults.outDir;
        const appRoot = app.root || defaults.appRoot;
        function _mapAssets(asset) {
            if (typeof asset === 'string') {
                return core_1.normalize(appRoot + '/' + asset);
            }
            else {
                if (asset.allowOutsideOutDir) {
                    logger.warn(core_1.tags.oneLine `
              Asset with input '${asset.input}' was not migrated because it
              uses the 'allowOutsideOutDir' option which is not supported in Angular CLI 6.
            `);
                    return null;
                }
                else if (asset.output) {
                    return {
                        glob: asset.glob,
                        input: core_1.normalize(appRoot + '/' + asset.input),
                        output: core_1.normalize('/' + asset.output),
                    };
                }
                else {
                    return {
                        glob: asset.glob,
                        input: core_1.normalize(appRoot + '/' + asset.input),
                        output: '/',
                    };
                }
            }
        }
        function _buildConfigurations() {
            const source = app.environmentSource;
            const environments = app.environments;
            const serviceWorker = app.serviceWorker;
            if (!environments) {
                return {};
            }
            return Object.keys(environments).reduce((acc, environment) => {
                if (source === environments[environment]) {
                    return acc;
                }
                let isProduction = false;
                const environmentContent = tree.read(app.root + '/' + environments[environment]);
                if (environmentContent) {
                    isProduction = !!environmentContent.toString('utf-8')
                        // Allow for `production: true` or `production = true`. Best we can do to guess.
                        .match(/production['"]?\s*[:=]\s*true/);
                }
                let configurationName;
                // We used to use `prod` by default as the key, instead we now use the full word.
                // Try not to override the production key if it's there.
                if (environment == 'prod' && !environments['production'] && isProduction) {
                    configurationName = 'production';
                }
                else {
                    configurationName = environment;
                }
                let swConfig = null;
                if (serviceWorker) {
                    swConfig = {
                        serviceWorker: true,
                        ngswConfigPath: '/src/ngsw-config.json',
                    };
                }
                acc[configurationName] = Object.assign({}, (isProduction
                    ? {
                        optimization: true,
                        outputHashing: 'all',
                        sourceMap: false,
                        extractCss: true,
                        namedChunks: false,
                        aot: true,
                        extractLicenses: true,
                        vendorChunk: false,
                        buildOptimizer: true,
                    }
                    : {}), (isProduction && swConfig ? swConfig : {}), (isProduction && app.budgets ? { budgets: app.budgets } : {}), { fileReplacements: [
                        {
                            replace: `${app.root}/${source}`,
                            with: `${app.root}/${environments[environment]}`,
                        },
                    ] });
                return acc;
            }, {});
        }
        function _serveConfigurations() {
            const environments = app.environments;
            if (!environments) {
                return {};
            }
            if (!architect) {
                throw new Error();
            }
            const configurations = architect.build.configurations;
            return Object.keys(configurations).reduce((acc, environment) => {
                acc[environment] = { browserTarget: `${name}:build:${environment}` };
                return acc;
            }, {});
        }
        function _extraEntryMapper(extraEntry) {
            let entry;
            if (typeof extraEntry === 'string') {
                entry = core_1.join(app.root, extraEntry);
            }
            else {
                const input = core_1.join(app.root, extraEntry.input || '');
                entry = { input, lazy: extraEntry.lazy };
                if (extraEntry.output) {
                    entry.bundleName = extraEntry.output;
                }
            }
            return entry;
        }
        const project = {
            root: core_1.join(core_1.normalize(appRoot), '..'),
            sourceRoot: appRoot,
            projectType: 'application',
        };
        const architect = {};
        project.architect = architect;
        // Browser target
        const buildOptions = Object.assign({ 
            // Make outputPath relative to root.
            outputPath: outDir, index: `${appRoot}/${app.index || defaults.index}`, main: `${appRoot}/${app.main || defaults.main}`, tsConfig: `${appRoot}/${app.tsconfig || defaults.tsConfig}` }, (app.baseHref ? { baseHref: app.baseHref } : {}), buildDefaults);
        if (app.polyfills) {
            buildOptions.polyfills = appRoot + '/' + app.polyfills;
        }
        if (app.stylePreprocessorOptions
            && app.stylePreprocessorOptions.includePaths
            && Array.isArray(app.stylePreprocessorOptions.includePaths)
            && app.stylePreprocessorOptions.includePaths.length > 0) {
            buildOptions.stylePreprocessorOptions = {
                includePaths: app.stylePreprocessorOptions.includePaths
                    .map(includePath => core_1.join(app.root, includePath)),
            };
        }
        buildOptions.assets = (app.assets || []).map(_mapAssets).filter(x => !!x);
        buildOptions.styles = (app.styles || []).map(_extraEntryMapper);
        buildOptions.scripts = (app.scripts || []).map(_extraEntryMapper);
        architect.build = {
            builder: `${builderPackage}:browser`,
            options: buildOptions,
            configurations: _buildConfigurations(),
        };
        // Serve target
        const serveOptions = Object.assign({ browserTarget: `${name}:build` }, serveDefaults);
        architect.serve = {
            builder: `${builderPackage}:dev-server`,
            options: serveOptions,
            configurations: _serveConfigurations(),
        };
        // Extract target
        const extractI18nOptions = { browserTarget: `${name}:build` };
        architect['extract-i18n'] = {
            builder: `${builderPackage}:extract-i18n`,
            options: extractI18nOptions,
        };
        const karmaConfig = config.test && config.test.karma
            ? config.test.karma.config || ''
            : '';
        // Test target
        const testOptions = {
            main: appRoot + '/' + app.test || defaults.test,
            // Make karmaConfig relative to root.
            karmaConfig,
        };
        if (app.polyfills) {
            testOptions.polyfills = appRoot + '/' + app.polyfills;
        }
        if (app.testTsconfig) {
            testOptions.tsConfig = appRoot + '/' + app.testTsconfig;
        }
        testOptions.scripts = (app.scripts || []).map(_extraEntryMapper);
        testOptions.styles = (app.styles || []).map(_extraEntryMapper);
        testOptions.assets = (app.assets || []).map(_mapAssets).filter(x => !!x);
        if (karmaConfig) {
            architect.test = {
                builder: `${builderPackage}:karma`,
                options: testOptions,
            };
        }
        const tsConfigs = [];
        const excludes = [];
        let warnForLint = false;
        if (config && config.lint && Array.isArray(config.lint)) {
            config.lint.forEach(lint => {
                if (lint.project) {
                    tsConfigs.push(lint.project);
                }
                else {
                    warnForLint = true;
                }
                if (lint.exclude) {
                    if (typeof lint.exclude === 'string') {
                        excludes.push(lint.exclude);
                    }
                    else {
                        lint.exclude.forEach(ex => excludes.push(ex));
                    }
                }
            });
        }
        if (warnForLint) {
            logger.warn(`
          Lint without 'project' was not migrated which is not supported in Angular CLI 6.
        `);
        }
        const removeDupes = (items) => items.reduce((newItems, item) => {
            if (newItems.indexOf(item) === -1) {
                newItems.push(item);
            }
            return newItems;
        }, []);
        // Tslint target
        const lintOptions = {
            tsConfig: removeDupes(tsConfigs).filter(t => t.indexOf('e2e') === -1),
            exclude: removeDupes(excludes),
        };
        architect.lint = {
            builder: `${builderPackage}:tslint`,
            options: lintOptions,
        };
        // server target
        const serverApp = serverApps
            .filter(serverApp => app.root === serverApp.root && app.index === serverApp.index)[0];
        if (serverApp) {
            const serverOptions = {
                outputPath: serverApp.outDir || defaults.serverOutDir,
                main: serverApp.main || defaults.serverMain,
                tsConfig: serverApp.tsconfig || defaults.serverTsConfig,
            };
            const serverTarget = {
                builder: '@angular-devkit/build-angular:server',
                options: serverOptions,
            };
            architect.server = serverTarget;
        }
        const e2eProject = {
            root: project.root,
            sourceRoot: core_1.join(project.root, 'e2e'),
            projectType: 'application',
        };
        const e2eArchitect = {};
        // tslint:disable-next-line:max-line-length
        const protractorConfig = config && config.e2e && config.e2e.protractor && config.e2e.protractor.config
            ? config.e2e.protractor.config
            : '';
        const e2eOptions = {
            protractorConfig: protractorConfig,
            devServerTarget: `${name}:serve`,
        };
        const e2eTarget = {
            builder: `${builderPackage}:protractor`,
            options: e2eOptions,
        };
        e2eArchitect.e2e = e2eTarget;
        const e2eLintOptions = {
            tsConfig: removeDupes(tsConfigs).filter(t => t.indexOf('e2e') !== -1),
            exclude: removeDupes(excludes),
        };
        const e2eLintTarget = {
            builder: `${builderPackage}:tslint`,
            options: e2eLintOptions,
        };
        e2eArchitect.lint = e2eLintTarget;
        if (protractorConfig) {
            e2eProject.architect = e2eArchitect;
        }
        return { name, project, e2eProject };
    })
        .reduce((projects, mappedApp) => {
        const { name, project, e2eProject } = mappedApp;
        projects[name] = project;
        projects[name + '-e2e'] = e2eProject;
        return projects;
    }, {});
    return projectMap;
}
function getDefaultAppNamePrefix(config) {
    let defaultAppNamePrefix = 'app';
    if (config.project && config.project.name) {
        defaultAppNamePrefix = config.project.name;
    }
    return defaultAppNamePrefix;
}
function extractDefaultProject(config) {
    if (config.apps && config.apps[0]) {
        const app = config.apps[0];
        const defaultAppName = getDefaultAppNamePrefix(config);
        const name = app.name || defaultAppName;
        return name;
    }
    return null;
}
function updateSpecTsConfig(config) {
    return (host, context) => {
        const apps = config.apps || [];
        apps.forEach((app, idx) => {
            const testTsConfig = app.testTsconfig || defaults.testTsConfig;
            const tsSpecConfigPath = core_1.join(core_1.normalize(app.root || ''), testTsConfig);
            const buffer = host.read(tsSpecConfigPath);
            if (!buffer) {
                return;
            }
            const tsCfgAst = core_1.parseJsonAst(buffer.toString(), core_1.JsonParseMode.Loose);
            if (tsCfgAst.kind != 'object') {
                throw new schematics_1.SchematicsException('Invalid tsconfig. Was expecting an object');
            }
            const filesAstNode = json_utils_1.findPropertyInAstObject(tsCfgAst, 'files');
            if (filesAstNode && filesAstNode.kind != 'array') {
                throw new schematics_1.SchematicsException('Invalid tsconfig "files" property; expected an array.');
            }
            const recorder = host.beginUpdate(tsSpecConfigPath);
            const polyfills = app.polyfills || defaults.polyfills;
            if (!filesAstNode) {
                // Do nothing if the files array does not exist. This means exclude or include are
                // set and we shouldn't mess with that.
            }
            else {
                if (filesAstNode.value.indexOf(polyfills) == -1) {
                    json_utils_1.appendValueInAstArray(recorder, filesAstNode, polyfills);
                }
            }
            host.commitUpdate(recorder);
        });
    };
}
function updatePackageJson(config) {
    return (host, context) => {
        const pkgPath = '/package.json';
        const buffer = host.read(pkgPath);
        if (buffer == null) {
            throw new schematics_1.SchematicsException('Could not read package.json');
        }
        const pkgAst = core_1.parseJsonAst(buffer.toString(), core_1.JsonParseMode.Strict);
        if (pkgAst.kind != 'object') {
            throw new schematics_1.SchematicsException('Error reading package.json');
        }
        const devDependenciesNode = json_utils_1.findPropertyInAstObject(pkgAst, 'devDependencies');
        if (devDependenciesNode && devDependenciesNode.kind != 'object') {
            throw new schematics_1.SchematicsException('Error reading package.json; devDependency is not an object.');
        }
        const recorder = host.beginUpdate(pkgPath);
        const depName = '@angular-devkit/build-angular';
        if (!devDependenciesNode) {
            // Haven't found the devDependencies key, add it to the root of the package.json.
            json_utils_1.appendPropertyInAstObject(recorder, pkgAst, 'devDependencies', {
                [depName]: latest_versions_1.latestVersions.DevkitBuildAngular,
            });
        }
        else {
            // Check if there's a build-angular key.
            const buildAngularNode = json_utils_1.findPropertyInAstObject(devDependenciesNode, depName);
            if (!buildAngularNode) {
                // No build-angular package, add it.
                json_utils_1.appendPropertyInAstObject(recorder, devDependenciesNode, depName, latest_versions_1.latestVersions.DevkitBuildAngular);
            }
            else {
                const { end, start } = buildAngularNode;
                recorder.remove(start.offset, end.offset - start.offset);
                recorder.insertRight(start.offset, JSON.stringify(latest_versions_1.latestVersions.DevkitBuildAngular));
            }
        }
        host.commitUpdate(recorder);
        context.addTask(new tasks_1.NodePackageInstallTask({
            packageManager: config.packageManager === 'default' ? undefined : config.packageManager,
        }));
        return host;
    };
}
function updateTsLintConfig() {
    return (host, context) => {
        const tsLintPath = '/tslint.json';
        const buffer = host.read(tsLintPath);
        if (!buffer) {
            return host;
        }
        const tsCfgAst = core_1.parseJsonAst(buffer.toString(), core_1.JsonParseMode.Loose);
        if (tsCfgAst.kind != 'object') {
            return host;
        }
        const rulesNode = json_utils_1.findPropertyInAstObject(tsCfgAst, 'rules');
        if (!rulesNode || rulesNode.kind != 'object') {
            return host;
        }
        const importBlacklistNode = json_utils_1.findPropertyInAstObject(rulesNode, 'import-blacklist');
        if (!importBlacklistNode || importBlacklistNode.kind != 'array') {
            return host;
        }
        const recorder = host.beginUpdate(tsLintPath);
        for (let i = 0; i < importBlacklistNode.elements.length; i++) {
            const element = importBlacklistNode.elements[i];
            if (element.kind == 'string' && element.value == 'rxjs') {
                const { start, end } = element;
                // Remove this element.
                if (i == importBlacklistNode.elements.length - 1) {
                    // Last element.
                    if (i > 0) {
                        // Not first, there's a comma to remove before.
                        const previous = importBlacklistNode.elements[i - 1];
                        recorder.remove(previous.end.offset, end.offset - previous.end.offset);
                    }
                    else {
                        // Only element, just remove the whole rule.
                        const { start, end } = importBlacklistNode;
                        recorder.remove(start.offset, end.offset - start.offset);
                        recorder.insertLeft(start.offset, '[]');
                    }
                }
                else {
                    // Middle, just remove the whole node (up to next node start).
                    const next = importBlacklistNode.elements[i + 1];
                    recorder.remove(start.offset, next.start.offset - start.offset);
                }
            }
        }
        host.commitUpdate(recorder);
        return host;
    };
}
function default_1() {
    return (host, context) => {
        if (host.exists('/.angular.json') || host.exists('/angular.json')) {
            context.logger.info('Found a modern configuration file. Nothing to be done.');
            return host;
        }
        const configPath = getConfigPath(host);
        const configBuffer = host.read(core_1.normalize(configPath));
        if (configBuffer == null) {
            throw new schematics_1.SchematicsException(`Could not find configuration file (${configPath})`);
        }
        const config = core_1.parseJson(configBuffer.toString(), core_1.JsonParseMode.Loose);
        if (typeof config != 'object' || Array.isArray(config) || config === null) {
            throw new schematics_1.SchematicsException('Invalid angular-cli.json configuration; expected an object.');
        }
        return schematics_1.chain([
            migrateKarmaConfiguration(config),
            migrateConfiguration(config, context.logger),
            updateSpecTsConfig(config),
            updatePackageJson(config),
            updateTsLintConfig(),
            (host, context) => {
                context.logger.warn(core_1.tags.oneLine `Some configuration options have been changed,
          please make sure to update any npm scripts which you may have modified.`);
                return host;
            },
        ]);
    };
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL2JvYm8vV29yay9zaGFyay1zY2hlbWF0aWNzL3NyYy8iLCJzb3VyY2VzIjpbInNyYy9taWdyYXRpb25zL3VwZGF0ZS02L2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7OztHQU1HO0FBQ0gsK0NBVzhCO0FBQzlCLDJEQU1vQztBQUNwQyw0REFBMEU7QUFFMUUsbUVBQStEO0FBQy9ELDZDQUlzQjtBQUV0QixNQUFNLFFBQVEsR0FBRztJQUNmLE9BQU8sRUFBRSxLQUFLO0lBQ2QsS0FBSyxFQUFFLFlBQVk7SUFDbkIsSUFBSSxFQUFFLFNBQVM7SUFDZixTQUFTLEVBQUUsY0FBYztJQUN6QixRQUFRLEVBQUUsbUJBQW1CO0lBQzdCLElBQUksRUFBRSxTQUFTO0lBQ2YsTUFBTSxFQUFFLE9BQU87SUFDZixLQUFLLEVBQUUsZUFBZTtJQUN0QixVQUFVLEVBQUUsb0JBQW9CO0lBQ2hDLFlBQVksRUFBRSxvQkFBb0I7SUFDbEMsWUFBWSxFQUFFLGFBQWE7SUFDM0IsVUFBVSxFQUFFLGdCQUFnQjtJQUM1QixjQUFjLEVBQUUsc0JBQXNCO0NBQ3ZDLENBQUM7QUFFRix1QkFBdUIsSUFBVTtJQUMvQixJQUFJLFlBQVksR0FBRyxnQkFBUyxDQUFDLG1CQUFtQixDQUFDLENBQUM7SUFDbEQsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxFQUFFO1FBQzdCLE9BQU8sWUFBWSxDQUFDO0tBQ3JCO0lBQ0QsWUFBWSxHQUFHLGdCQUFTLENBQUMsa0JBQWtCLENBQUMsQ0FBQztJQUM3QyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLEVBQUU7UUFDN0IsT0FBTyxZQUFZLENBQUM7S0FDckI7SUFFRCxNQUFNLElBQUksZ0NBQW1CLENBQUMsbUNBQW1DLENBQUMsQ0FBQztBQUNyRSxDQUFDO0FBRUQsbUNBQW1DLE1BQWlCO0lBQ2xELE9BQU8sQ0FBQyxJQUFVLEVBQUUs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QUUsRUFBRSxvQkFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRXZFLElBQUksT0FBTyxNQUFNLElBQUksUUFBUSxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksTUFBTSxLQUFLLElBQUksRUFBRTtZQUN6RSxNQUFNLElBQUksZ0NBQW1CLENBQUMsNkRBQTZELENBQUMsQ0FBQztTQUM5RjtRQUVELE9BQU8sa0JBQUssQ0FBQztZQUNYLHlCQUF5QixDQUFDLE1BQU0sQ0FBQztZQUNqQyxvQkFBb0IsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQztZQUM1QyxrQkFBa0IsQ0FBQyxNQUFNLENBQUM7WUFDMUIsaUJBQWlCLENBQUMsTUFBTSxDQUFDO1lBQ3pCLGtCQUFrQixFQUFFO1lBQ3BCLENBQUMsSUFBVSxFQUFFLE9BQXlCLEVBQUUsRUFBRTtnQkFDeEMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBSSxDQUFDLE9BQU8sQ0FBQTtrRkFDMEMsQ0FBQyxDQUFDO2dCQUU1RSxPQUFPLElBQUksQ0FBQztZQUNkLENBQUM7U0FDRixDQUFDLENBQUM7SUFDTCxDQUFDLENBQUM7QUFDSixDQUFDO0FBakNELDRCQWlDQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7XG4gIEpzb25BcnJheSxcbiAgSnNvbk9iamVjdCxcbiAgSnNvblBhcnNlTW9kZSxcbiAgUGF0aCxcbiAgam9pbixcbiAgbG9nZ2luZyxcbiAgbm9ybWFsaXplLFxuICBwYXJzZUpzb24sXG4gIHBhcnNlSnNvbkFzdCxcbiAgdGFncyxcbn0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L2NvcmUnO1xuaW1wb3J0IHtcbiAgUnVsZSxcbiAgU2NoZW1hdGljQ29udGV4dCxcbiAgU2NoZW1hdGljc0V4Y2VwdGlvbixcbiAgVHJlZSxcbiAgY2hhaW4sXG59IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9zY2hlbWF0aWNzJztcbmltcG9ydCB7IE5vZGVQYWNrYWdlSW5zdGFsbFRhc2sgfSBmcm9tICdAYW5ndWxhci1kZXZraXQvc2NoZW1hdGljcy90YXNrcyc7XG5pbXBvcnQgeyBBcHBDb25maWcsIENsaUNvbmZpZyB9IGZyb20gJy4uLy4uL3V0aWxpdHkvY29uZmlnJztcbmltcG9ydCB7IGxhdGVzdFZlcnNpb25zIH0gZnJvbSAnLi4vLi4vdXRpbGl0eS9sYXRlc3QtdmVyc2lvbnMnO1xuaW1wb3J0IHtcbiAgYXBwZW5kUHJvcGVydHlJbkFzdE9iamVjdCxcbiAgYXBwZW5kVmFsdWVJbkFzdEFycmF5LFxuICBmaW5kUHJvcGVydHlJbkFzdE9iamVjdCxcbn0gZnJvbSAnLi9qc29uLXV0aWxzJztcblxuY29uc3QgZGVmYXVsdHMgPSB7XG4gIGFwcFJvb3Q6ICdzcmMnLFxuICBpbmRleDogJ2luZGV4Lmh0bWwnLFxuICBtYWluOiAnbWFpbi50cycsXG4gIHBvbHlmaWxsczogJ3BvbHlmaWxscy50cycsXG4gIHRzQ29uZmlnOiAndHNjb25maWcuYXBwLmpzb24nLFxuICB0ZXN0OiAndGVzdC50cycsXG4gIG91dERpcjogJ2Rpc3QvJyxcbiAga2FybWE6ICdrYXJtYS5jb25mLmpzJyxcbiAgcHJvdHJhY3RvcjogJ3Byb3RyYWN0b3IuY29uZi5qcycsXG4gIHRlc3RUc0NvbmZpZzogJ3RzY29uZmlnLnNwZWMuanNvbicsXG4gIHNlcnZlck91dERpcjogJ2Rpc3Qtc2VydmVyJyxcbiAgc2VydmVyTWFpbjogJ21haW4uc2VydmVyLnRzJyxcbiAgc2VydmVyVHNDb25maWc6ICd0c2NvbmZpZy5zZXJ2ZXIuanNvbicsXG59O1xuXG5mdW5jdGlvbiBnZXRDb25maWdQYXRoKHRyZWU6IFRyZWUpOiBQYXRoIHtcbiAgbGV0IHBvc3NpYmxlUGF0aCA9IG5vcm1hbGl6ZSgnLmFuZ3VsYXItY2xpLmpzb24nKTtcbiAgaWYgKHRyZWUuZXhpc3RzKHBvc3NpYmxlUGF0aCkpIHtcbiAgICByZXR1cm4gcG9zc2libGVQYXRoO1xuICB9XG4gIHBvc3NpYmxlUGF0aCA9IG5vcm1hbGl6ZSgnYW5ndWxhci1jbGkuanNvbicpO1xuICBpZiAodHJlZS5leGlzdHMocG9zc2libGVQYXRoKSkge1xuICAgIHJldHVybiBwb3NzaWJsZVBhdGg7XG4gIH1cblxuICB0aHJvdyBuZXcgU2NoZW1hdGljc0V4Y2VwdGlvbignQ291bGQgbm90IGZpbmQgY29uZmlndXJhdGlvbiBmaWxlJyk7XG59XG5cbmZ1bmN0aW9uIG1pZ3JhdGVLYXJtYUNvbmZpZ3VyYXRpb24oY29uZmlnOiBDbGlDb25maWcpOiBSdWxlIHtcbiAgcmV0dXJuIChob3N0OiBUcmVlLCBjb250ZXh0OiBTY2hlbWF0aWNDb250ZXh0KSA9PiB7XG4gICAgY29udGV4dC5sb2dnZXIuaW5mbyhgVXBkYXRpbmcga2FybWEgY29uZmlndXJhdGlvbmApO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBrYXJtYVBhdGggPSBjb25maWcgJiYgY29uZmlnLnRlc3QgJiYgY29uZmlnLnRlc3Qua2FybWEgJiYgY29uZmlnLnRlc3Qua2FybWEuY29uZmlnXG4gICAgICAgID8gY29uZmlnLnRlc3Qua2FybWEuY29uZmlnXG4gICAgICAgIDogZGVmYXVsdHMua2FybWE7XG4gICAgICBjb25zdCBidWZmZXIgPSBob3N0LnJlYWQoa2FybWFQYXRoKTtcbiAgICAgIGlmIChidWZmZXIgIT09IG51bGwpIHtcbiAgICAgICAgbGV0IGNvbnRlbnQgPSBidWZmZXIudG9TdHJpbmcoKTtcbiAgICAgICAgLy8gUmVwbGFjZSB0aGUgMS4wIGZpbGVzIGFuZCBwcmVwcm9jZXNzb3IgZW50cmllcywgd2l0aCBhbmQgd2l0aG91dCBjb21tYSBhdCB0aGUgZW5kLlxuICAgICAgICAvLyBJZiB0aGVzZSByZW1haW4sIHRoZXkgd2lsbCBjYXVzZSB0aGUgYG5nIHRlc3RgIHRvIGZhaWwuXG4gICAgICAgIGNvbnRlbnQgPSBjb250ZW50LnJlcGxhY2UoYHsgcGF0dGVybjogJy4vc3JjL3Rlc3QudHMnLCB3YXRjaGVkOiBmYWxzZSB9LGAsICcnKTtcbiAgICAgICAgY29udGVudCA9IGNvbnRlbnQucmVwbGFjZShgeyBwYXR0ZXJuOiAnLi9zcmMvdGVzdC50cycsIHdhdGNoZWQ6IGZhbHNlIH1gLCAnJyk7XG4gICAgICAgIGNvbnRlbnQgPSBjb250ZW50LnJlcGxhY2UoYCcuL3NyYy90ZXN0LnRzJzogWydAYW5ndWxhci9jbGknXSxgLCAnJyk7XG4gICAgICAgIGNvbnRlbnQgPSBjb250ZW50LnJlcGxhY2UoYCcuL3NyYy90ZXN0LnRzJzogWydAYW5ndWxhci9jbGknXWAsICcnKTtcbiAgICAgICAgY29udGVudCA9IGNvbnRlbnQucmVwbGFjZSgvYW5ndWxhckNsaVtefV0qfSw/LywgJycpO1xuICAgICAgICAvLyBSZXBsYWNlIDEueCBwbHVnaW4gbmFtZXMuXG4gICAgICAgIGNvbnRlbnQgPSBjb250ZW50LnJlcGxhY2UoL0Bhbmd1bGFyXFwvY2xpL2csICdAYW5ndWxhci1kZXZraXQvYnVpbGQtYW5ndWxhcicpO1xuICAgICAgICAvLyBSZXBsYWNlIGNvZGUgY292ZXJhZ2Ugb3V0cHV0IHBhdGguXG4gICAgICAgIGNvbnRlbnQgPSBjb250ZW50LnJlcGxhY2UoJ3JlcG9ydHMnLFxuICAgICAgICAgIGBkaXI6IHJlcXVpcmUoJ3BhdGgnKS5qb2luKF9fZGlybmFtZSwgJ2NvdmVyYWdlJyksIHJlcG9ydHNgKTtcbiAgICAgICAgaG9zdC5vdmVyd3JpdGUoa2FybWFQYXRoLCBjb250ZW50KTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7IH1cblxuICAgIHJldHVybiBob3N0O1xuICB9O1xufVxuXG5mdW5jdGlvbiBtaWdyYXRlQ29uZmlndXJhdGlvbihvbGRDb25maWc6IENsaUNvbmZpZywgbG9nZ2VyOiBsb2dnaW5nLkxvZ2dlckFwaSk6IFJ1bGUge1xuICByZXR1cm4gKGhvc3Q6IFRyZWUsIGNvbnRleHQ6IFNjaGVtYXRpY0NvbnRleHQpID0+IHtcbiAgICBjb25zdCBvbGRDb25maWdQYXRoID0gZ2V0Q29uZmlnUGF0aChob3N0KTtcbiAgICBjb25zdCBjb25maWdQYXRoID0gbm9ybWFsaXplKCdhbmd1bGFyLmpzb24nKTtcbiAgICBjb250ZXh0LmxvZ2dlci5pbmZvKGBVcGRhdGluZyBjb25maWd1cmF0aW9uYCk7XG4gICAgY29uc3QgY29uZmlnOiBKc29uT2JqZWN0ID0ge1xuICAgICAgJyRzY2hlbWEnOiAnLi9ub2RlX21vZHVsZXMvQGFuZ3VsYXIvY2xpL2xpYi9jb25maWcvc2NoZW1hLmpzb24nLFxuICAgICAgdmVyc2lvbjogMSxcbiAgICAgIG5ld1Byb2plY3RSb290OiAncHJvamVjdHMnLFxuICAgICAgcHJvamVjdHM6IGV4dHJhY3RQcm9qZWN0c0NvbmZpZyhvbGRDb25maWcsIGhvc3QsIGxvZ2dlciksXG4gICAgfTtcbiAgICBjb25zdCBkZWZhdWx0UHJvamVjdCA9IGV4dHJhY3REZWZhdWx0UHJvamVjdChvbGRDb25maWcpO1xuICAgIGlmIChkZWZhdWx0UHJvamVjdCAhPT0gbnVsbCkge1xuICAgICAgY29uZmlnLmRlZmF1bHRQcm9qZWN0ID0gZGVmYXVsdFByb2plY3Q7XG4gICAgfVxuICAgIGNvbnN0IGNsaUNvbmZpZyA9IGV4dHJhY3RDbGlDb25maWcob2xkQ29uZmlnKTtcbiAgICBpZiAoY2xpQ29uZmlnICE9PSBudWxsKSB7XG4gICAgICBjb25maWcuY2xpID0gY2xpQ29uZmlnO1xuICAgIH1cbiAgICBjb25zdCBzY2hlbWF0aWNzQ29uZmlnID0gZXh0cmFjdFNjaGVtYXRpY3NDb25maWcob2xkQ29uZmlnKTtcbiAgICBpZiAoc2NoZW1hdGljc0NvbmZpZyAhPT0gbnVsbCkge1xuICAgICAgY29uZmlnLnNjaGVtYXRpY3MgPSBzY2hlbWF0aWNzQ29uZmlnO1xuICAgIH1cbiAgICBjb25zdCBhcmNoaXRlY3RDb25maWcgPSBleHRyYWN0QXJjaGl0ZWN0Q29uZmlnKG9sZENvbmZpZyk7XG4gICAgaWYgKGFyY2hpdGVjdENvbmZpZyAhPT0gbnVsbCkge1xuICAgICAgY29uZmlnLmFyY2hpdGVjdCA9IGFyY2hpdGVjdENvbmZpZztcbiAgICB9XG5cbiAgICBjb250ZXh0LmxvZ2dlci5pbmZvKGBSZW1vdmluZyBvbGQgY29uZmlnIGZpbGUgKCR7b2xkQ29uZmlnUGF0aH0pYCk7XG4gICAgaG9zdC5kZWxldGUob2xkQ29uZmlnUGF0aCk7XG4gICAgY29udGV4dC5sb2dnZXIuaW5mbyhgV3JpdGluZyBjb25maWcgZmlsZSAoJHtjb25maWdQYXRofSlgKTtcbiAgICBob3N0LmNyZWF0ZShjb25maWdQYXRoLCBKU09OLnN0cmluZ2lmeShjb25maWcsIG51bGwsIDIpKTtcblxuICAgIHJldHVybiBob3N0O1xuICB9O1xufVxuXG5mdW5jdGlvbiBleHRyYWN0Q2xpQ29uZmlnKGNvbmZpZzogQ2xpQ29uZmlnKTogSnNvbk9iamVjdCB8IG51bGwge1xuICBjb25zdCBuZXdDb25maWc6IEpzb25PYmplY3QgPSB7fTtcbiAgaWYgKGNvbmZpZy5wYWNrYWdlTWFuYWdlciAmJiBjb25maWcucGFja2FnZU1hbmFnZXIgIT09ICdkZWZhdWx0Jykge1xuICAgIG5ld0NvbmZpZ1sncGFja2FnZU1hbmFnZXInXSA9IGNvbmZpZy5wYWNrYWdlTWFuYWdlcjtcbiAgfVxuICBpZiAoY29uZmlnLndhcm5pbmdzKSB7XG4gICAgaWYgKGNvbmZpZy53YXJuaW5ncy52ZXJzaW9uTWlzbWF0Y2ggIT09IHVuZGVmaW5lZCkge1xuICAgICAgbmV3Q29uZmlnLndhcm5pbmdzID0ge1xuICAgICAgICAuLi4oKG5ld0NvbmZpZy53YXJuaW5ncyBhcyBKc29uT2JqZWN0IHwgbnVsbCkgfHwge30pLFxuICAgICAgICAuLi57IHZlcnNpb25NaXNtYXRjaDogY29uZmlnLndhcm5pbmdzLnZlcnNpb25NaXNtYXRjaCB9LFxuICAgICAgfTtcbiAgICB9XG4gICAgaWYgKGNvbmZpZy53YXJuaW5ncy50eXBlc2NyaXB0TWlzbWF0Y2ggIT09IHVuZGVmaW5lZCkge1xuICAgICAgbmV3Q29uZmlnLndhcm5pbmdzID0ge1xuICAgICAgICAuLi4oKG5ld0NvbmZpZy53YXJuaW5ncyBhcyBKc29uT2JqZWN0IHwgbnVsbCkgfHwge30pLFxuICAgICAgICAuLi57IHR5cGVzY3JpcHRNaXNtYXRjaDogY29uZmlnLndhcm5pbmdzLnR5cGVzY3JpcHRNaXNtYXRjaCB9LFxuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMobmV3Q29uZmlnKS5sZW5ndGggPT0gMCA/IG51bGwgOiBuZXdDb25maWc7XG59XG5cbmZ1bmN0aW9uIGV4dHJhY3RTY2hlbWF0aWNzQ29uZmlnKGNvbmZpZzogQ2xpQ29uZmlnKTogSnNvbk9iamVjdCB8IG51bGwge1xuICBsZXQgY29sbGVjdGlvbk5hbWUgPSAnQHNjaGVtYXRpY3MvYW5ndWxhcic7XG4gIGlmICghY29uZmlnIHx8ICFjb25maWcuZGVmYXVsdHMpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICAvLyBjb25zdCBjb25maWdEZWZhdWx0cyA9IGNvbmZpZy5kZWZhdWx0cztcbiAgaWYgKGNvbmZpZy5kZWZhdWx0cyAmJiBjb25maWcuZGVmYXVsdHMuc2NoZW1hdGljcyAmJiBjb25maWcuZGVmYXVsdHMuc2NoZW1hdGljcy5jb2xsZWN0aW9uKSB7XG4gICAgY29sbGVjdGlvbk5hbWUgPSBjb25maWcuZGVmYXVsdHMuc2NoZW1hdGljcy5jb2xsZWN0aW9uO1xuICB9XG5cbiAgLyoqXG4gICAqIEZvciBlYWNoIHNjaGVtYXRpY1xuICAgKiAgLSBnZXQgdGhlIGNvbmZpZ1xuICAgKiAgLSBmaWx0ZXIgb25lJ3Mgd2l0aG91dCBjb25maWdcbiAgICogIC0gY29tYmluZSB0aGVtIGludG8gYW4gb2JqZWN0XG4gICAqL1xuICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tYW55XG4gIGNvbnN0IHNjaGVtYXRpY0NvbmZpZ3M6IGFueSA9IFsnY2xhc3MnLCAnY29tcG9uZW50JywgJ2RpcmVjdGl2ZScsICdndWFyZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnaW50ZXJmYWNlJywgJ21vZHVsZScsICdwaXBlJywgJ3NlcnZpY2UnXVxuICAgIC5tYXAoc2NoZW1hdGljTmFtZSA9PiB7XG4gICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tYW55XG4gICAgICBjb25zdCBzY2hlbWF0aWNEZWZhdWx0czogSnNvbk9iamVjdCA9IChjb25maWcuZGVmYXVsdHMgYXMgYW55KVtzY2hlbWF0aWNOYW1lXSB8fCBudWxsO1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBzY2hlbWF0aWNOYW1lLFxuICAgICAgICBjb25maWc6IHNjaGVtYXRpY0RlZmF1bHRzLFxuICAgICAgfTtcbiAgICB9KVxuICAgIC5maWx0ZXIoc2NoZW1hdGljID0+IHNjaGVtYXRpYy5jb25maWcgIT09IG51bGwpXG4gICAgLnJlZHVjZSgoYWxsOiBKc29uT2JqZWN0LCBzY2hlbWF0aWMpID0+IHtcbiAgICAgIGFsbFtjb2xsZWN0aW9uTmFtZSArICc6JyArIHNjaGVtYXRpYy5zY2hlbWF0aWNOYW1lXSA9IHNjaGVtYXRpYy5jb25maWc7XG5cbiAgICAgIHJldHVybiBhbGw7XG4gICAgfSwge30pO1xuXG4gIGNvbnN0IGNvbXBvbmVudFVwZGF0ZTogSnNvbk9iamVjdCA9IHt9O1xuICBjb21wb25lbnRVcGRhdGUucHJlZml4ID0gJyc7XG5cbiAgY29uc3QgY29tcG9uZW50S2V5ID0gY29sbGVjdGlvbk5hbWUgKyAnOmNvbXBvbmVudCc7XG4gIGNvbnN0IGRpcmVjdGl2ZUtleSA9IGNvbGxlY3Rpb25OYW1lICsgJzpkaXJlY3RpdmUnO1xuICBpZiAoIXNjaGVtYXRpY0NvbmZpZ3NbY29tcG9uZW50S2V5XSkge1xuICAgIHNjaGVtYXRpY0NvbmZpZ3NbY29tcG9uZW50S2V5XSA9IHt9O1xuICB9XG4gIGlmICghc2NoZW1hdGljQ29uZmlnc1tkaXJlY3RpdmVLZXldKSB7XG4gICAgc2NoZW1hdGljQ29uZmlnc1tkaXJlY3RpdmVLZXldID0ge307XG4gIH1cbiAgaWYgKGNvbmZpZy5hcHBzICYmIGNvbmZpZy5hcHBzWzBdKSB7XG4gICAgc2NoZW1hdGljQ29uZmlnc1tjb21wb25lbnRLZXldLnByZWZpeCA9IGNvbmZpZy5hcHBzWzBdLnByZWZpeDtcbiAgICBzY2hlbWF0aWNDb25maWdzW2RpcmVjdGl2ZUtleV0ucHJlZml4ID0gY29uZmlnLmFwcHNbMF0ucHJlZml4O1xuICB9XG4gIGlmIChjb25maWcuZGVmYXVsdHMpIHtcbiAgICBzY2hlbWF0aWNDb25maWdzW2NvbXBvbmVudEtleV0uc3R5bGVleHQgPSBjb25maWcuZGVmYXVsdHMuc3R5bGVFeHQ7XG4gIH1cblxuICByZXR1cm4gc2NoZW1hdGljQ29uZmlncztcbn1cblxuZnVuY3Rpb24gZXh0cmFjdEFyY2hpdGVjdENvbmZpZyhfY29uZmlnOiBDbGlDb25maWcpOiBKc29uT2JqZWN0IHwgbnVsbCB7XG4gIHJldHVybiBudWxsO1xufVxuXG5mdW5jdGlvbiBleHRyYWN0UHJvamVjdHNDb25maWcoXG4gIGNvbmZpZzogQ2xpQ29uZmlnLCB0cmVlOiBUcmVlLCBsb2dnZXI6IGxvZ2dpbmcuTG9nZ2VyQXBpLFxuKTogSnNvbk9iamVjdCB7XG4gIGNvbnN0IGJ1aWxkZXJQYWNrYWdlID0gJ0Bhbmd1bGFyLWRldmtpdC9idWlsZC1hbmd1bGFyJztcbiAgY29uc3QgZGVmYXVsdEFwcE5hbWVQcmVmaXggPSBnZXREZWZhdWx0QXBwTmFtZVByZWZpeChjb25maWcpO1xuXG4gIGNvbnN0IGJ1aWxkRGVmYXVsdHM6IEpzb25PYmplY3QgPSBjb25maWcuZGVmYXVsdHMgJiYgY29uZmlnLmRlZmF1bHRzLmJ1aWxkXG4gICAgPyB7XG4gICAgICBzb3VyY2VNYXA6IGNvbmZpZy5kZWZhdWx0cy5idWlsZC5zb3VyY2VtYXBzLFxuICAgICAgcHJvZ3Jlc3M6IGNvbmZpZy5kZWZhdWx0cy5idWlsZC5wcm9ncmVzcyxcbiAgICAgIHBvbGw6IGNvbmZpZy5kZWZhdWx0cy5idWlsZC5wb2xsLFxuICAgICAgZGVsZXRlT3V0cHV0UGF0aDogY29uZmlnLmRlZmF1bHRzLmJ1aWxkLmRlbGV0ZU91dHB1dFBhdGgsXG4gICAgICBwcmVzZXJ2ZVN5bWxpbmtzOiBjb25maWcuZGVmYXVsdHMuYnVpbGQucHJlc2VydmVTeW1saW5rcyxcbiAgICAgIHNob3dDaXJjdWxhckRlcGVuZGVuY2llczogY29uZmlnLmRlZmF1bHRzLmJ1aWxkLnNob3dDaXJjdWxhckRlcGVuZGVuY2llcyxcbiAgICAgIGNvbW1vbkNodW5rOiBjb25maWcuZGVmYXVsdHMuYnVpbGQuY29tbW9uQ2h1bmssXG4gICAgICBuYW1lZENodW5rczogY29uZmlnLmRlZmF1bHRzLmJ1aWxkLm5hbWVkQ2h1bmtzLFxuICAgIH0gYXMgSnNvbk9iamVjdFxuICAgIDoge307XG5cbiAgY29uc3Qgc2VydmVEZWZhdWx0czogSnNvbk9iamVjdCA9IGNvbmZpZy5kZWZhdWx0cyAmJiBjb25maWcuZGVmYXVsdHMuc2VydmVcbiAgICA/IHtcbiAgICAgIHBvcnQ6IGNvbmZpZy5kZWZhdWx0cy5zZXJ2ZS5wb3J0LFxuICAgICAgaG9zdDogY29uZmlnLmRlZmF1bHRzLnNlcnZlLmhvc3QsXG4gICAgICBzc2w6IGNvbmZpZy5kZWZhdWx0cy5zZXJ2ZS5zc2wsXG4gICAgICBzc2xLZXk6IGNvbmZpZy5kZWZhdWx0cy5zZXJ2ZS5zc2xLZXksXG4gICAgICBzc2xDZXJ0OiBjb25maWcuZGVmYXVsdHMuc2VydmUuc3NsQ2VydCxcbiAgICAgIHByb3h5Q29uZmlnOiBjb25maWcuZGVmYXVsdHMuc2VydmUucHJveHlDb25maWcsXG4gICAgfSBhcyBKc29uT2JqZWN0XG4gICAgOiB7fTtcblxuXG4gIGNvbnN0IGFwcHMgPSBjb25maWcuYXBwcyB8fCBbXTtcbiAgLy8gY29udmVydCB0aGUgYXBwcyB0byBwcm9qZWN0c1xuICBjb25zdCBicm93c2VyQXBwcyA9IGFwcHMuZmlsdGVyKGFwcCA9PiBhcHAucGxhdGZvcm0gIT09ICdzZXJ2ZXInKTtcbiAgY29uc3Qgc2VydmVyQXBwcyA9IGFwcHMuZmlsdGVyKGFwcCA9PiBhcHAucGxhdGZvcm0gPT09ICdzZXJ2ZXInKTtcblxuICBjb25zdCBwcm9qZWN0TWFwID0gYnJvd3NlckFwcHNcbiAgICAubWFwKChhcHAsIGlkeCkgPT4ge1xuICAgICAgY29uc3QgZGVmYXVsdEFwcE5hbWUgPSBpZHggPT09IDAgPyBkZWZhdWx0QXBwTmFtZVByZWZpeCA6IGAke2RlZmF1bHRBcHBOYW1lUHJlZml4fSR7aWR4fWA7XG4gICAgICBjb25zdCBuYW1lID0gYXBwLm5hbWUgfHwgZGVmYXVsdEFwcE5hbWU7XG4gICAgICBjb25zdCBvdXREaXIgPSBhcHAub3V0RGlyIHx8IGRlZmF1bHRzLm91dERpcjtcbiAgICAgIGNvbnN0IGFwcFJvb3QgPSBhcHAucm9vdCB8fCBkZWZhdWx0cy5hcHBSb290O1xuXG4gICAgICBmdW5jdGlvbiBfbWFwQXNzZXRzKGFzc2V0OiBzdHJpbmcgfCBKc29uT2JqZWN0KSB7XG4gICAgICAgIGlmICh0eXBlb2YgYXNzZXQgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgcmV0dXJuIG5vcm1hbGl6ZShhcHBSb290ICsgJy8nICsgYXNzZXQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChhc3NldC5hbGxvd091dHNpZGVPdXREaXIpIHtcbiAgICAgICAgICAgIGxvZ2dlci53YXJuKHRhZ3Mub25lTGluZWBcbiAgICAgICAgICAgICAgQXNzZXQgd2l0aCBpbnB1dCAnJHthc3NldC5pbnB1dH0nIHdhcyBub3QgbWlncmF0ZWQgYmVjYXVzZSBpdFxuICAgICAgICAgICAgICB1c2VzIHRoZSAnYWxsb3dPdXRzaWRlT3V0RGlyJyBvcHRpb24gd2hpY2ggaXMgbm90IHN1cHBvcnRlZCBpbiBBbmd1bGFyIENMSSA2LlxuICAgICAgICAgICAgYCk7XG5cbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgIH0gZWxzZSBpZiAoYXNzZXQub3V0cHV0KSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICBnbG9iOiBhc3NldC5nbG9iLFxuICAgICAgICAgICAgICBpbnB1dDogbm9ybWFsaXplKGFwcFJvb3QgKyAnLycgKyBhc3NldC5pbnB1dCksXG4gICAgICAgICAgICAgIG91dHB1dDogbm9ybWFsaXplKCcvJyArIGFzc2V0Lm91dHB1dCBhcyBzdHJpbmcpLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgZ2xvYjogYXNzZXQuZ2xvYixcbiAgICAgICAgICAgICAgaW5wdXQ6IG5vcm1hbGl6ZShhcHBSb290ICsgJy8nICsgYXNzZXQuaW5wdXQpLFxuICAgICAgICAgICAgICBvdXRwdXQ6ICcvJyxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIF9idWlsZENvbmZpZ3VyYXRpb25zKCk6IEpzb25PYmplY3Qge1xuICAgICAgICBjb25zdCBzb3VyY2UgPSBhcHAuZW52aXJvbm1lbnRTb3VyY2U7XG4gICAgICAgIGNvbnN0IGVudmlyb25tZW50cyA9IGFwcC5lbnZpcm9ubWVudHM7XG4gICAgICAgIGNvbnN0IHNlcnZpY2VXb3JrZXIgPSBhcHAuc2VydmljZVdvcmtlcjtcblxuICAgICAgICBpZiAoIWVudmlyb25tZW50cykge1xuICAgICAgICAgIHJldHVybiB7fTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBPYmplY3Qua2V5cyhlbnZpcm9ubWVudHMpLnJlZHVjZSgoYWNjLCBlbnZpcm9ubWVudCkgPT4ge1xuICAgICAgICAgIGlmIChzb3VyY2UgPT09IGVudmlyb25tZW50c1tlbnZpcm9ubWVudF0pIHtcbiAgICAgICAgICAgIHJldHVybiBhY2M7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbGV0IGlzUHJvZHVjdGlvbiA9IGZhbHNlO1xuXG4gICAgICAgICAgY29uc3QgZW52aXJvbm1lbnRDb250ZW50ID0gdHJlZS5yZWFkKGFwcC5yb290ICsgJy8nICsgZW52aXJvbm1lbnRzW2Vudmlyb25tZW50XSk7XG4gICAgICAgICAgaWYgKGVudmlyb25tZW50Q29udGVudCkge1xuICAgICAgICAgICAgaXNQcm9kdWN0aW9uID0gISFlbnZpcm9ubWVudENvbnRlbnQudG9TdHJpbmcoJ3V0Zi04JylcbiAgICAgICAgICAgICAgLy8gQWxsb3cgZm9yIGBwcm9kdWN0aW9uOiB0cnVlYCBvciBgcHJvZHVjdGlvbiA9IHRydWVgLiBCZXN0IHdlIGNhbiBkbyB0byBndWVzcy5cbiAgICAgICAgICAgICAgLm1hdGNoKC9wcm9kdWN0aW9uWydcIl0/XFxzKls6PV1cXHMqdHJ1ZS8pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGxldCBjb25maWd1cmF0aW9uTmFtZTtcbiAgICAgICAgICAvLyBXZSB1c2VkIHRvIHVzZSBgcHJvZGAgYnkgZGVmYXVsdCBhcyB0aGUga2V5LCBpbnN0ZWFkIHdlIG5vdyB1c2UgdGhlIGZ1bGwgd29yZC5cbiAgICAgICAgICAvLyBUcnkgbm90IHRvIG92ZXJyaWRlIHRoZSBwcm9kdWN0aW9uIGtleSBpZiBpdCdzIHRoZXJlLlxuICAgICAgICAgIGlmIChlbnZpcm9ubWVudCA9PSAncHJvZCcgJiYgIWVudmlyb25tZW50c1sncHJvZHVjdGlvbiddICYmIGlzUHJvZHVjdGlvbikge1xuICAgICAgICAgICAgY29uZmlndXJhdGlvbk5hbWUgPSAncHJvZHVjdGlvbic7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb25OYW1lID0gZW52aXJvbm1lbnQ7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbGV0IHN3Q29uZmlnOiBKc29uT2JqZWN0IHwgbnVsbCA9IG51bGw7XG4gICAgICAgICAgaWYgKHNlcnZpY2VXb3JrZXIpIHtcbiAgICAgICAgICAgIHN3Q29uZmlnID0ge1xuICAgICAgICAgICAgICBzZXJ2aWNlV29ya2VyOiB0cnVlLFxuICAgICAgICAgICAgICBuZ3N3Q29uZmlnUGF0aDogJy9zcmMvbmdzdy1jb25maWcuanNvbicsXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGFjY1tjb25maWd1cmF0aW9uTmFtZV0gPSB7XG4gICAgICAgICAgICAuLi4oaXNQcm9kdWN0aW9uXG4gICAgICAgICAgICAgID8ge1xuICAgICAgICAgICAgICAgIG9wdGltaXphdGlvbjogdHJ1ZSxcbiAgICAgICAgICAgICAgICBvdXRwdXRIYXNoaW5nOiAnYWxsJyxcbiAgICAgICAgICAgICAgICBzb3VyY2VNYXA6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGV4dHJhY3RDc3M6IHRydWUsXG4gICAgICAgICAgICAgICAgbmFtZWRDaHVua3M6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGFvdDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBleHRyYWN0TGljZW5zZXM6IHRydWUsXG4gICAgICAgICAgICAgICAgdmVuZG9yQ2h1bms6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGJ1aWxkT3B0aW1pemVyOiB0cnVlLFxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIDoge31cbiAgICAgICAgICAgICksXG4gICAgICAgICAgICAuLi4oaXNQcm9kdWN0aW9uICYmIHN3Q29uZmlnID8gc3dDb25maWcgOiB7fSksXG4gICAgICAgICAgICAuLi4oaXNQcm9kdWN0aW9uICYmIGFwcC5idWRnZXRzID8geyBidWRnZXRzOiBhcHAuYnVkZ2V0cyBhcyBKc29uQXJyYXkgfSA6IHt9KSxcbiAgICAgICAgICAgIGZpbGVSZXBsYWNlbWVudHM6IFtcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJlcGxhY2U6IGAke2FwcC5yb290fS8ke3NvdXJjZX1gLFxuICAgICAgICAgICAgICAgIHdpdGg6IGAke2FwcC5yb290fS8ke2Vudmlyb25tZW50c1tlbnZpcm9ubWVudF19YCxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgfTtcblxuICAgICAgICAgIHJldHVybiBhY2M7XG4gICAgICAgIH0sIHt9IGFzIEpzb25PYmplY3QpO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBfc2VydmVDb25maWd1cmF0aW9ucygpOiBKc29uT2JqZWN0IHtcbiAgICAgICAgY29uc3QgZW52aXJvbm1lbnRzID0gYXBwLmVudmlyb25tZW50cztcblxuICAgICAgICBpZiAoIWVudmlyb25tZW50cykge1xuICAgICAgICAgIHJldHVybiB7fTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWFyY2hpdGVjdCkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcigpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgY29uZmlndXJhdGlvbnMgPSAoYXJjaGl0ZWN0LmJ1aWxkIGFzIEpzb25PYmplY3QpLmNvbmZpZ3VyYXRpb25zIGFzIEpzb25PYmplY3Q7XG5cbiAgICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKGNvbmZpZ3VyYXRpb25zKS5yZWR1Y2UoKGFjYywgZW52aXJvbm1lbnQpID0+IHtcbiAgICAgICAgICBhY2NbZW52aXJvbm1lbnRdID0geyBicm93c2VyVGFyZ2V0OiBgJHtuYW1lfTpidWlsZDoke2Vudmlyb25tZW50fWAgfTtcblxuICAgICAgICAgIHJldHVybiBhY2M7XG4gICAgICAgIH0sIHt9IGFzIEpzb25PYmplY3QpO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBfZXh0cmFFbnRyeU1hcHBlcihleHRyYUVudHJ5OiBzdHJpbmcgfCBKc29uT2JqZWN0KSB7XG4gICAgICAgIGxldCBlbnRyeTogc3RyaW5nIHwgSnNvbk9iamVjdDtcbiAgICAgICAgaWYgKHR5cGVvZiBleHRyYUVudHJ5ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIGVudHJ5ID0gam9pbihhcHAucm9vdCBhcyBQYXRoLCBleHRyYUVudHJ5KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zdCBpbnB1dCA9IGpvaW4oYXBwLnJvb3QgYXMgUGF0aCwgZXh0cmFFbnRyeS5pbnB1dCBhcyBzdHJpbmcgfHwgJycpO1xuICAgICAgICAgIGVudHJ5ID0geyBpbnB1dCwgbGF6eTogZXh0cmFFbnRyeS5sYXp5IH07XG5cbiAgICAgICAgICBpZiAoZXh0cmFFbnRyeS5vdXRwdXQpIHtcbiAgICAgICAgICAgIGVudHJ5LmJ1bmRsZU5hbWUgPSBleHRyYUVudHJ5Lm91dHB1dDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZW50cnk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHByb2plY3Q6IEpzb25PYmplY3QgPSB7XG4gICAgICAgIHJvb3Q6IGpvaW4obm9ybWFsaXplKGFwcFJvb3QpLCAnLi4nKSxcbiAgICAgICAgc291cmNlUm9vdDogYXBwUm9vdCxcbiAgICAgICAgcHJvamVjdFR5cGU6ICdhcHBsaWNhdGlvbicsXG4gICAgICB9O1xuXG4gICAgICBjb25zdCBhcmNoaXRlY3Q6IEpzb25PYmplY3QgPSB7fTtcbiAgICAgIHByb2plY3QuYXJjaGl0ZWN0ID0gYXJjaGl0ZWN0O1xuXG4gICAgICAgIC8vIEJyb3dzZXIgdGFyZ2V0XG4gICAgICBjb25zdCBidWlsZE9wdGlvbnM6IEpzb25PYmplY3QgPSB7XG4gICAgICAgIC8vIE1ha2Ugb3V0cHV0UGF0aCByZWxhdGl2ZSB0byByb290LlxuICAgICAgICBvdXRwdXRQYXRoOiBvdXREaXIsXG4gICAgICAgIGluZGV4OiBgJHthcHBSb290fS8ke2FwcC5pbmRleCB8fCBkZWZhdWx0cy5pbmRleH1gLFxuICAgICAgICBtYWluOiBgJHthcHBSb290fS8ke2FwcC5tYWluIHx8IGRlZmF1bHRzLm1haW59YCxcbiAgICAgICAgdHNDb25maWc6IGAke2FwcFJvb3R9LyR7YXBwLnRzY29uZmlnIHx8IGRlZmF1bHRzLnRzQ29uZmlnfWAsXG4gICAgICAgIC4uLihhcHAuYmFzZUhyZWYgPyB7IGJhc2VIcmVmOiBhcHAuYmFzZUhyZWYgfSA6IHt9KSxcbiAgICAgICAgLi4uYnVpbGREZWZhdWx0cyxcbiAgICAgIH07XG5cbiAgICAgIGlmIChhcHAucG9seWZpbGxzKSB7XG4gICAgICAgIGJ1aWxkT3B0aW9ucy5wb2x5ZmlsbHMgPSBhcHBSb290ICsgJy8nICsgYXBwLnBvbHlmaWxscztcbiAgICAgIH1cblxuICAgICAgaWYgKGFwcC5zdHlsZVByZXByb2Nlc3Nvck9wdGlvbnNcbiAgICAgICAgICAmJiBhcHAuc3R5bGVQcmVwcm9jZXNzb3JPcHRpb25zLmluY2x1ZGVQYXRoc1xuICAgICAgICAgICYmIEFycmF5LmlzQXJyYXkoYXBwLnN0eWxlUHJlcHJvY2Vzc29yT3B0aW9ucy5pbmNsdWRlUGF0aHMpXG4gICAgICAgICAgJiYgYXBwLnN0eWxlUHJlcHJvY2Vzc29yT3B0aW9ucy5pbmNsdWRlUGF0aHMubGVuZ3RoID4gMCkge1xuICAgICAgICBidWlsZE9wdGlvbnMuc3R5bGVQcmVwcm9jZXNzb3JPcHRpb25zID0ge1xuICAgICAgICAgIGluY2x1ZGVQYXRoczogYXBwLnN0eWxlUHJlcHJvY2Vzc29yT3B0aW9ucy5pbmNsdWRlUGF0aHNcbiAgICAgICAgICAgIC5tYXAoaW5jbHVkZVBhdGggPT4gam9pbihhcHAucm9vdCBhcyBQYXRoLCBpbmNsdWRlUGF0aCkpLFxuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICBidWlsZE9wdGlvbnMuYXNzZXRzID0gKGFwcC5hc3NldHMgfHwgW10pLm1hcChfbWFwQXNzZXRzKS5maWx0ZXIoeCA9PiAhIXgpO1xuICAgICAgYnVpbGRPcHRpb25zLnN0eWxlcyA9IChhcHAuc3R5bGVzIHx8IFtdKS5tYXAoX2V4dHJhRW50cnlNYXBwZXIpO1xuICAgICAgYnVpbGRPcHRpb25zLnNjcmlwdHMgPSAoYXBwLnNjcmlwdHMgfHwgW10pLm1hcChfZXh0cmFFbnRyeU1hcHBlcik7XG4gICAgICBhcmNoaXRlY3QuYnVpbGQgPSB7XG4gICAgICAgIGJ1aWxkZXI6IGAke2J1aWxkZXJQYWNrYWdlfTpicm93c2VyYCxcbiAgICAgICAgb3B0aW9uczogYnVpbGRPcHRpb25zLFxuICAgICAgICBjb25maWd1cmF0aW9uczogX2J1aWxkQ29uZmlndXJhdGlvbnMoKSxcbiAgICAgIH07XG5cbiAgICAgIC8vIFNlcnZlIHRhcmdldFxuICAgICAgY29uc3Qgc2VydmVPcHRpb25zOiBKc29uT2JqZWN0ID0ge1xuICAgICAgICBicm93c2VyVGFyZ2V0OiBgJHtuYW1lfTpidWlsZGAsXG4gICAgICAgIC4uLnNlcnZlRGVmYXVsdHMsXG4gICAgICB9O1xuICAgICAgYXJjaGl0ZWN0LnNlcnZlID0ge1xuICAgICAgICBidWlsZGVyOiBgJHtidWlsZGVyUGFja2FnZX06ZGV2LXNlcnZlcmAsXG4gICAgICAgIG9wdGlvbnM6IHNlcnZlT3B0aW9ucyxcbiAgICAgICAgY29uZmlndXJhdGlvbnM6IF9zZXJ2ZUNvbmZpZ3VyYXRpb25zKCksXG4gICAgICB9O1xuXG4gICAgICAvLyBFeHRyYWN0IHRhcmdldFxuICAgICAgY29uc3QgZXh0cmFjdEkxOG5PcHRpb25zOiBKc29uT2JqZWN0ID0geyBicm93c2VyVGFyZ2V0OiBgJHtuYW1lfTpidWlsZGAgfTtcbiAgICAgIGFyY2hpdGVjdFsnZXh0cmFjdC1pMThuJ10gPSB7XG4gICAgICAgIGJ1aWxkZXI6IGAke2J1aWxkZXJQYWNrYWdlfTpleHRyYWN0LWkxOG5gLFxuICAgICAgICBvcHRpb25zOiBleHRyYWN0STE4bk9wdGlvbnMsXG4gICAgICB9O1xuXG4gICAgICBjb25zdCBrYXJtYUNvbmZpZyA9IGNvbmZpZy50ZXN0ICYmIGNvbmZpZy50ZXN0Lmthcm1hXG4gICAgICAgICAgPyBjb25maWcudGVzdC5rYXJtYS5jb25maWcgfHwgJydcbiAgICAgICAgICA6ICcnO1xuICAgICAgICAvLyBUZXN0IHRhcmdldFxuICAgICAgY29uc3QgdGVzdE9wdGlvbnM6IEpzb25PYmplY3QgPSB7XG4gICAgICAgICAgbWFpbjogYXBwUm9vdCArICcvJyArIGFwcC50ZXN0IHx8IGRlZmF1bHRzLnRlc3QsXG4gICAgICAgICAgLy8gTWFrZSBrYXJtYUNvbmZpZyByZWxhdGl2ZSB0byByb290LlxuICAgICAgICAgIGthcm1hQ29uZmlnLFxuICAgICAgICB9O1xuXG4gICAgICBpZiAoYXBwLnBvbHlmaWxscykge1xuICAgICAgICB0ZXN0T3B0aW9ucy5wb2x5ZmlsbHMgPSBhcHBSb290ICsgJy8nICsgYXBwLnBvbHlmaWxscztcbiAgICAgIH1cblxuICAgICAgaWYgKGFwcC50ZXN0VHNjb25maWcpIHtcbiAgICAgICAgICB0ZXN0T3B0aW9ucy50c0NvbmZpZyA9IGFwcFJvb3QgKyAnLycgKyBhcHAudGVzdFRzY29uZmlnO1xuICAgICAgICB9XG4gICAgICB0ZXN0T3B0aW9ucy5zY3JpcHRzID0gKGFwcC5zY3JpcHRzIHx8IFtdKS5tYXAoX2V4dHJhRW50cnlNYXBwZXIpO1xuICAgICAgdGVzdE9wdGlvbnMuc3R5bGVzID0gKGFwcC5zdHlsZXMgfHwgW10pLm1hcChfZXh0cmFFbnRyeU1hcHBlcik7XG4gICAgICB0ZXN0T3B0aW9ucy5hc3NldHMgPSAoYXBwLmFzc2V0cyB8fCBbXSkubWFwKF9tYXBBc3NldHMpLmZpbHRlcih4ID0+ICEheCk7XG5cbiAgICAgIGlmIChrYXJtYUNvbmZpZykge1xuICAgICAgICBhcmNoaXRlY3QudGVzdCA9IHtcbiAgICAgICAgICBidWlsZGVyOiBgJHtidWlsZGVyUGFja2FnZX06a2FybWFgLFxuICAgICAgICAgIG9wdGlvbnM6IHRlc3RPcHRpb25zLFxuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICBjb25zdCB0c0NvbmZpZ3M6IHN0cmluZ1tdID0gW107XG4gICAgICBjb25zdCBleGNsdWRlczogc3RyaW5nW10gPSBbXTtcbiAgICAgIGxldCB3YXJuRm9yTGludCA9IGZhbHNlO1xuICAgICAgaWYgKGNvbmZpZyAmJiBjb25maWcubGludCAmJiBBcnJheS5pc0FycmF5KGNvbmZpZy5saW50KSkge1xuICAgICAgICBjb25maWcubGludC5mb3JFYWNoKGxpbnQgPT4ge1xuICAgICAgICAgIGlmIChsaW50LnByb2plY3QpIHtcbiAgICAgICAgICAgIHRzQ29uZmlncy5wdXNoKGxpbnQucHJvamVjdCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHdhcm5Gb3JMaW50ID0gdHJ1ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAobGludC5leGNsdWRlKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGxpbnQuZXhjbHVkZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgZXhjbHVkZXMucHVzaChsaW50LmV4Y2x1ZGUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgbGludC5leGNsdWRlLmZvckVhY2goZXggPT4gZXhjbHVkZXMucHVzaChleCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGlmICh3YXJuRm9yTGludCkge1xuICAgICAgICBsb2dnZXIud2FybihgXG4gICAgICAgICAgTGludCB3aXRob3V0ICdwcm9qZWN0JyB3YXMgbm90IG1pZ3JhdGVkIHdoaWNoIGlzIG5vdCBzdXBwb3J0ZWQgaW4gQW5ndWxhciBDTEkgNi5cbiAgICAgICAgYCk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHJlbW92ZUR1cGVzID0gKGl0ZW1zOiBzdHJpbmdbXSkgPT4gaXRlbXMucmVkdWNlKChuZXdJdGVtcywgaXRlbSkgPT4ge1xuICAgICAgICBpZiAobmV3SXRlbXMuaW5kZXhPZihpdGVtKSA9PT0gLTEpIHtcbiAgICAgICAgICBuZXdJdGVtcy5wdXNoKGl0ZW0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG5ld0l0ZW1zO1xuICAgICAgfSwgPHN0cmluZ1tdPiBbXSk7XG5cbiAgICAgICAgLy8gVHNsaW50IHRhcmdldFxuICAgICAgY29uc3QgbGludE9wdGlvbnM6IEpzb25PYmplY3QgPSB7XG4gICAgICAgIHRzQ29uZmlnOiByZW1vdmVEdXBlcyh0c0NvbmZpZ3MpLmZpbHRlcih0ID0+IHQuaW5kZXhPZignZTJlJykgPT09IC0xKSxcbiAgICAgICAgZXhjbHVkZTogcmVtb3ZlRHVwZXMoZXhjbHVkZXMpLFxuICAgICAgfTtcbiAgICAgIGFyY2hpdGVjdC5saW50ID0ge1xuICAgICAgICAgIGJ1aWxkZXI6IGAke2J1aWxkZXJQYWNrYWdlfTp0c2xpbnRgLFxuICAgICAgICAgIG9wdGlvbnM6IGxpbnRPcHRpb25zLFxuICAgICAgICB9O1xuXG4gICAgICAvLyBzZXJ2ZXIgdGFyZ2V0XG4gICAgICBjb25zdCBzZXJ2ZXJBcHAgPSBzZXJ2ZXJBcHBzXG4gICAgICAgIC5maWx0ZXIoc2VydmVyQXBwID0+IGFwcC5yb290ID09PSBzZXJ2ZXJBcHAucm9vdCAmJiBhcHAuaW5kZXggPT09IHNlcnZlckFwcC5pbmRleClbMF07XG5cbiAgICAgIGlmIChzZXJ2ZXJBcHApIHtcbiAgICAgICAgY29uc3Qgc2VydmVyT3B0aW9uczogSnNvbk9iamVjdCA9IHtcbiAgICAgICAgICBvdXRwdXRQYXRoOiBzZXJ2ZXJBcHAub3V0RGlyIHx8IGRlZmF1bHRzLnNlcnZlck91dERpcixcbiAgICAgICAgICBtYWluOiBzZXJ2ZXJBcHAubWFpbiB8fCBkZWZhdWx0cy5zZXJ2ZXJNYWluLFxuICAgICAgICAgIHRzQ29uZmlnOiBzZXJ2ZXJBcHAudHNjb25maWcgfHwgZGVmYXVsdHMuc2VydmVyVHNDb25maWcsXG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IHNlcnZlclRhcmdldDogSnNvbk9iamVjdCA9IHtcbiAgICAgICAgICBidWlsZGVyOiAnQGFuZ3VsYXItZGV2a2l0L2J1aWxkLWFuZ3VsYXI6c2VydmVyJyxcbiAgICAgICAgICBvcHRpb25zOiBzZXJ2ZXJPcHRpb25zLFxuICAgICAgICB9O1xuICAgICAgICBhcmNoaXRlY3Quc2VydmVyID0gc2VydmVyVGFyZ2V0O1xuICAgICAgfVxuICAgICAgY29uc3QgZTJlUHJvamVjdDogSnNvbk9iamVjdCA9IHtcbiAgICAgICAgcm9vdDogcHJvamVjdC5yb290LFxuICAgICAgICBzb3VyY2VSb290OiBqb2luKHByb2plY3Qucm9vdCBhcyBQYXRoLCAnZTJlJyksXG4gICAgICAgIHByb2plY3RUeXBlOiAnYXBwbGljYXRpb24nLFxuICAgICAgfTtcblxuICAgICAgY29uc3QgZTJlQXJjaGl0ZWN0OiBKc29uT2JqZWN0ID0ge307XG5cbiAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTptYXgtbGluZS1sZW5ndGhcbiAgICAgIGNvbnN0IHByb3RyYWN0b3JDb25maWcgPSBjb25maWcgJiYgY29uZmlnLmUyZSAmJiBjb25maWcuZTJlLnByb3RyYWN0b3IgJiYgY29uZmlnLmUyZS5wcm90cmFjdG9yLmNvbmZpZ1xuICAgICAgICA/IGNvbmZpZy5lMmUucHJvdHJhY3Rvci5jb25maWdcbiAgICAgICAgOiAnJztcbiAgICAgIGNvbnN0IGUyZU9wdGlvbnM6IEpzb25PYmplY3QgPSB7XG4gICAgICAgIHByb3RyYWN0b3JDb25maWc6IHByb3RyYWN0b3JDb25maWcsXG4gICAgICAgIGRldlNlcnZlclRhcmdldDogYCR7bmFtZX06c2VydmVgLFxuICAgICAgfTtcbiAgICAgIGNvbnN0IGUyZVRhcmdldDogSnNvbk9iamVjdCA9IHtcbiAgICAgICAgYnVpbGRlcjogYCR7YnVpbGRlclBhY2thZ2V9OnByb3RyYWN0b3JgLFxuICAgICAgICBvcHRpb25zOiBlMmVPcHRpb25zLFxuICAgICAgfTtcblxuICAgICAgZTJlQXJjaGl0ZWN0LmUyZSA9IGUyZVRhcmdldDtcbiAgICAgIGNvbnN0IGUyZUxpbnRPcHRpb25zOiBKc29uT2JqZWN0ID0ge1xuICAgICAgICB0c0NvbmZpZzogcmVtb3ZlRHVwZXModHNDb25maWdzKS5maWx0ZXIodCA9PiB0LmluZGV4T2YoJ2UyZScpICE9PSAtMSksXG4gICAgICAgIGV4Y2x1ZGU6IHJlbW92ZUR1cGVzKGV4Y2x1ZGVzKSxcbiAgICAgIH07XG4gICAgICBjb25zdCBlMmVMaW50VGFyZ2V0OiBKc29uT2JqZWN0ID0ge1xuICAgICAgICBidWlsZGVyOiBgJHtidWlsZGVyUGFja2FnZX06dHNsaW50YCxcbiAgICAgICAgb3B0aW9uczogZTJlTGludE9wdGlvbnMsXG4gICAgICB9O1xuICAgICAgZTJlQXJjaGl0ZWN0LmxpbnQgPSBlMmVMaW50VGFyZ2V0O1xuICAgICAgaWYgKHByb3RyYWN0b3JDb25maWcpIHtcbiAgICAgICAgZTJlUHJvamVjdC5hcmNoaXRlY3QgPSBlMmVBcmNoaXRlY3Q7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB7IG5hbWUsIHByb2plY3QsIGUyZVByb2plY3QgfTtcbiAgICB9KVxuICAgIC5yZWR1Y2UoKHByb2plY3RzLCBtYXBwZWRBcHApID0+IHtcbiAgICAgIGNvbnN0IHtuYW1lLCBwcm9qZWN0LCBlMmVQcm9qZWN0fSA9IG1hcHBlZEFwcDtcbiAgICAgIHByb2plY3RzW25hbWVdID0gcHJvamVjdDtcbiAgICAgIHByb2plY3RzW25hbWUgKyAnLWUyZSddID0gZTJlUHJvamVjdDtcblxuICAgICAgcmV0dXJuIHByb2plY3RzO1xuICAgIH0sIHt9IGFzIEpzb25PYmplY3QpO1xuXG4gIHJldHVybiBwcm9qZWN0TWFwO1xufVxuXG5mdW5jdGlvbiBnZXREZWZhdWx0QXBwTmFtZVByZWZpeChjb25maWc6IENsaUNvbmZpZykge1xuICBsZXQgZGVmYXVsdEFwcE5hbWVQcmVmaXggPSAnYXBwJztcbiAgaWYgKGNvbmZpZy5wcm9qZWN0ICYmIGNvbmZpZy5wcm9qZWN0Lm5hbWUpIHtcbiAgICBkZWZhdWx0QXBwTmFtZVByZWZpeCA9IGNvbmZpZy5wcm9qZWN0Lm5hbWU7XG4gIH1cblxuICByZXR1cm4gZGVmYXVsdEFwcE5hbWVQcmVmaXg7XG59XG5cbmZ1bmN0aW9uIGV4dHJhY3REZWZhdWx0UHJvamVjdChjb25maWc6IENsaUNvbmZpZyk6IHN0cmluZyB8IG51bGwge1xuICBpZiAoY29uZmlnLmFwcHMgJiYgY29uZmlnLmFwcHNbMF0pIHtcbiAgICBjb25zdCBhcHAgPSBjb25maWcuYXBwc1swXTtcbiAgICBjb25zdCBkZWZhdWx0QXBwTmFtZSA9IGdldERlZmF1bHRBcHBOYW1lUHJlZml4KGNvbmZpZyk7XG4gICAgY29uc3QgbmFtZSA9IGFwcC5uYW1lIHx8IGRlZmF1bHRBcHBOYW1lO1xuXG4gICAgcmV0dXJuIG5hbWU7XG4gIH1cblxuICByZXR1cm4gbnVsbDtcbn1cblxuZnVuY3Rpb24gdXBkYXRlU3BlY1RzQ29uZmlnKGNvbmZpZzogQ2xpQ29uZmlnKTogUnVsZSB7XG4gIHJldHVybiAoaG9zdDogVHJlZSwgY29udGV4dDogU2NoZW1hdGljQ29udGV4dCkgPT4ge1xuICAgIGNvbnN0IGFwcHMgPSBjb25maWcuYXBwcyB8fCBbXTtcbiAgICBhcHBzLmZvckVhY2goKGFwcDogQXBwQ29uZmlnLCBpZHg6IG51bWJlcikgPT4ge1xuICAgICAgY29uc3QgdGVzdFRzQ29uZmlnID0gYXBwLnRlc3RUc2NvbmZpZyB8fCBkZWZhdWx0cy50ZXN0VHNDb25maWc7XG4gICAgICBjb25zdCB0c1NwZWNDb25maWdQYXRoID0gam9pbihub3JtYWxpemUoYXBwLnJvb3QgfHwgJycpLCB0ZXN0VHNDb25maWcpO1xuICAgICAgY29uc3QgYnVmZmVyID0gaG9zdC5yZWFkKHRzU3BlY0NvbmZpZ1BhdGgpO1xuXG4gICAgICBpZiAoIWJ1ZmZlcikge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cblxuICAgICAgY29uc3QgdHNDZmdBc3QgPSBwYXJzZUpzb25Bc3QoYnVmZmVyLnRvU3RyaW5nKCksIEpzb25QYXJzZU1vZGUuTG9vc2UpO1xuICAgICAgaWYgKHRzQ2ZnQXN0LmtpbmQgIT0gJ29iamVjdCcpIHtcbiAgICAgICAgdGhyb3cgbmV3IFNjaGVtYXRpY3NFeGNlcHRpb24oJ0ludmFsaWQgdHNjb25maWcuIFdhcyBleHBlY3RpbmcgYW4gb2JqZWN0Jyk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGZpbGVzQXN0Tm9kZSA9IGZpbmRQcm9wZXJ0eUluQXN0T2JqZWN0KHRzQ2ZnQXN0LCAnZmlsZXMnKTtcbiAgICAgIGlmIChmaWxlc0FzdE5vZGUgJiYgZmlsZXNBc3ROb2RlLmtpbmQgIT0gJ2FycmF5Jykge1xuICAgICAgICB0aHJvdyBuZXcgU2NoZW1hdGljc0V4Y2VwdGlvbignSW52YWxpZCB0c2NvbmZpZyBcImZpbGVzXCIgcHJvcGVydHk7IGV4cGVjdGVkIGFuIGFycmF5LicpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCByZWNvcmRlciA9IGhvc3QuYmVnaW5VcGRhdGUodHNTcGVjQ29uZmlnUGF0aCk7XG5cbiAgICAgIGNvbnN0IHBvbHlmaWxscyA9IGFwcC5wb2x5ZmlsbHMgfHwgZGVmYXVsdHMucG9seWZpbGxzO1xuICAgICAgaWYgKCFmaWxlc0FzdE5vZGUpIHtcbiAgICAgICAgLy8gRG8gbm90aGluZyBpZiB0aGUgZmlsZXMgYXJyYXkgZG9lcyBub3QgZXhpc3QuIFRoaXMgbWVhbnMgZXhjbHVkZSBvciBpbmNsdWRlIGFyZVxuICAgICAgICAvLyBzZXQgYW5kIHdlIHNob3VsZG4ndCBtZXNzIHdpdGggdGhhdC5cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChmaWxlc0FzdE5vZGUudmFsdWUuaW5kZXhPZihwb2x5ZmlsbHMpID09IC0xKSB7XG4gICAgICAgICAgYXBwZW5kVmFsdWVJbkFzdEFycmF5KHJlY29yZGVyLCBmaWxlc0FzdE5vZGUsIHBvbHlmaWxscyk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaG9zdC5jb21taXRVcGRhdGUocmVjb3JkZXIpO1xuICAgIH0pO1xuICB9O1xufVxuXG5mdW5jdGlvbiB1cGRhdGVQYWNrYWdlSnNvbihjb25maWc6IENsaUNvbmZpZykge1xuICByZXR1cm4gKGhvc3Q6IFRyZWUsIGNvbnRleHQ6IFNjaGVtYXRpY0NvbnRleHQpID0+IHtcbiAgICBjb25zdCBwa2dQYXRoID0gJy9wYWNrYWdlLmpzb24nO1xuICAgIGNvbnN0IGJ1ZmZlciA9IGhvc3QucmVhZChwa2dQYXRoKTtcbiAgICBpZiAoYnVmZmVyID09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBTY2hlbWF0aWNzRXhjZXB0aW9uKCdDb3VsZCBub3QgcmVhZCBwYWNrYWdlLmpzb24nKTtcbiAgICB9XG4gICAgY29uc3QgcGtnQXN0ID0gcGFyc2VKc29uQXN0KGJ1ZmZlci50b1N0cmluZygpLCBKc29uUGFyc2VNb2RlLlN0cmljdCk7XG5cbiAgICBpZiAocGtnQXN0LmtpbmQgIT0gJ29iamVjdCcpIHtcbiAgICAgIHRocm93IG5ldyBTY2hlbWF0aWNzRXhjZXB0aW9uKCdFcnJvciByZWFkaW5nIHBhY2thZ2UuanNvbicpO1xuICAgIH1cblxuICAgIGNvbnN0IGRldkRlcGVuZGVuY2llc05vZGUgPSBmaW5kUHJvcGVydHlJbkFzdE9iamVjdChwa2dBc3QsICdkZXZEZXBlbmRlbmNpZXMnKTtcbiAgICBpZiAoZGV2RGVwZW5kZW5jaWVzTm9kZSAmJiBkZXZEZXBlbmRlbmNpZXNOb2RlLmtpbmQgIT0gJ29iamVjdCcpIHtcbiAgICAgIHRocm93IG5ldyBTY2hlbWF0aWNzRXhjZXB0aW9uKCdFcnJvciByZWFkaW5nIHBhY2thZ2UuanNvbjsgZGV2RGVwZW5kZW5jeSBpcyBub3QgYW4gb2JqZWN0LicpO1xuICAgIH1cblxuICAgIGNvbnN0IHJlY29yZGVyID0gaG9zdC5iZWdpblVwZGF0ZShwa2dQYXRoKTtcbiAgICBjb25zdCBkZXBOYW1lID0gJ0Bhbmd1bGFyLWRldmtpdC9idWlsZC1hbmd1bGFyJztcbiAgICBpZiAoIWRldkRlcGVuZGVuY2llc05vZGUpIHtcbiAgICAgIC8vIEhhdmVuJ3QgZm91bmQgdGhlIGRldkRlcGVuZGVuY2llcyBrZXksIGFkZCBpdCB0byB0aGUgcm9vdCBvZiB0aGUgcGFja2FnZS5qc29uLlxuICAgICAgYXBwZW5kUHJvcGVydHlJbkFzdE9iamVjdChyZWNvcmRlciwgcGtnQXN0LCAnZGV2RGVwZW5kZW5jaWVzJywge1xuICAgICAgICBbZGVwTmFtZV06IGxhdGVzdFZlcnNpb25zLkRldmtpdEJ1aWxkQW5ndWxhcixcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBDaGVjayBpZiB0aGVyZSdzIGEgYnVpbGQtYW5ndWxhciBrZXkuXG4gICAgICBjb25zdCBidWlsZEFuZ3VsYXJOb2RlID0gZmluZFByb3BlcnR5SW5Bc3RPYmplY3QoZGV2RGVwZW5kZW5jaWVzTm9kZSwgZGVwTmFtZSk7XG5cbiAgICAgIGlmICghYnVpbGRBbmd1bGFyTm9kZSkge1xuICAgICAgICAvLyBObyBidWlsZC1hbmd1bGFyIHBhY2thZ2UsIGFkZCBpdC5cbiAgICAgICAgYXBwZW5kUHJvcGVydHlJbkFzdE9iamVjdChcbiAgICAgICAgICByZWNvcmRlcixcbiAgICAgICAgICBkZXZEZXBlbmRlbmNpZXNOb2RlLFxuICAgICAgICAgIGRlcE5hbWUsXG4gICAgICAgICAgbGF0ZXN0VmVyc2lvbnMuRGV2a2l0QnVpbGRBbmd1bGFyLFxuICAgICAgICApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgeyBlbmQsIHN0YXJ0IH0gPSBidWlsZEFuZ3VsYXJOb2RlO1xuICAgICAgICByZWNvcmRlci5yZW1vdmUoc3RhcnQub2Zmc2V0LCBlbmQub2Zmc2V0IC0gc3RhcnQub2Zmc2V0KTtcbiAgICAgICAgcmVjb3JkZXIuaW5zZXJ0UmlnaHQoc3RhcnQub2Zmc2V0LCBKU09OLnN0cmluZ2lmeShsYXRlc3RWZXJzaW9ucy5EZXZraXRCdWlsZEFuZ3VsYXIpKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBob3N0LmNvbW1pdFVwZGF0ZShyZWNvcmRlcik7XG5cbiAgICBjb250ZXh0LmFkZFRhc2sobmV3IE5vZGVQYWNrYWdlSW5zdGFsbFRhc2soe1xuICAgICAgcGFja2FnZU1hbmFnZXI6IGNvbmZpZy5wYWNrYWdlTWFuYWdlciA9PT0gJ2RlZmF1bHQnID8gdW5kZWZpbmVkIDogY29uZmlnLnBhY2thZ2VNYW5hZ2VyLFxuICAgIH0pKTtcblxuICAgIHJldHVybiBob3N0O1xuICB9O1xufVxuXG5mdW5jdGlvbiB1cGRhdGVUc0xpbnRDb25maWcoKTogUnVsZSB7XG4gIHJldHVybiAoaG9zdDogVHJlZSwgY29udGV4dDogU2NoZW1hdGljQ29udGV4dCkgPT4ge1xuICAgIGNvbnN0IHRzTGludFBhdGggPSAnL3RzbGludC5qc29uJztcbiAgICBjb25zdCBidWZmZXIgPSBob3N0LnJlYWQodHNMaW50UGF0aCk7XG4gICAgaWYgKCFidWZmZXIpIHtcbiAgICAgIHJldHVybiBob3N0O1xuICAgIH1cbiAgICBjb25zdCB0c0NmZ0FzdCA9IHBhcnNlSnNvbkFzdChidWZmZXIudG9TdHJpbmcoKSwgSnNvblBhcnNlTW9kZS5Mb29zZSk7XG5cbiAgICBpZiAodHNDZmdBc3Qua2luZCAhPSAnb2JqZWN0Jykge1xuICAgICAgcmV0dXJuIGhvc3Q7XG4gICAgfVxuXG4gICAgY29uc3QgcnVsZXNOb2RlID0gZmluZFByb3BlcnR5SW5Bc3RPYmplY3QodHNDZmdBc3QsICdydWxlcycpO1xuICAgIGlmICghcnVsZXNOb2RlIHx8IHJ1bGVzTm9kZS5raW5kICE9ICdvYmplY3QnKSB7XG4gICAgICByZXR1cm4gaG9zdDtcbiAgICB9XG5cbiAgICBjb25zdCBpbXBvcnRCbGFja2xpc3ROb2RlID0gZmluZFByb3BlcnR5SW5Bc3RPYmplY3QocnVsZXNOb2RlLCAnaW1wb3J0LWJsYWNrbGlzdCcpO1xuICAgIGlmICghaW1wb3J0QmxhY2tsaXN0Tm9kZSB8fCBpbXBvcnRCbGFja2xpc3ROb2RlLmtpbmQgIT0gJ2FycmF5Jykge1xuICAgICAgcmV0dXJuIGhvc3Q7XG4gICAgfVxuXG4gICAgY29uc3QgcmVjb3JkZXIgPSBob3N0LmJlZ2luVXBkYXRlKHRzTGludFBhdGgpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaW1wb3J0QmxhY2tsaXN0Tm9kZS5lbGVtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgZWxlbWVudCA9IGltcG9ydEJsYWNrbGlzdE5vZGUuZWxlbWVudHNbaV07XG4gICAgICBpZiAoZWxlbWVudC5raW5kID09ICdzdHJpbmcnICYmIGVsZW1lbnQudmFsdWUgPT0gJ3J4anMnKSB7XG4gICAgICAgIGNvbnN0IHsgc3RhcnQsIGVuZCB9ID0gZWxlbWVudDtcbiAgICAgICAgLy8gUmVtb3ZlIHRoaXMgZWxlbWVudC5cbiAgICAgICAgaWYgKGkgPT0gaW1wb3J0QmxhY2tsaXN0Tm9kZS5lbGVtZW50cy5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgLy8gTGFzdCBlbGVtZW50LlxuICAgICAgICAgIGlmIChpID4gMCkge1xuICAgICAgICAgICAgLy8gTm90IGZpcnN0LCB0aGVyZSdzIGEgY29tbWEgdG8gcmVtb3ZlIGJlZm9yZS5cbiAgICAgICAgICAgIGNvbnN0IHByZXZpb3VzID0gaW1wb3J0QmxhY2tsaXN0Tm9kZS5lbGVtZW50c1tpIC0gMV07XG4gICAgICAgICAgICByZWNvcmRlci5yZW1vdmUocHJldmlvdXMuZW5kLm9mZnNldCwgZW5kLm9mZnNldCAtIHByZXZpb3VzLmVuZC5vZmZzZXQpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBPbmx5IGVsZW1lbnQsIGp1c3QgcmVtb3ZlIHRoZSB3aG9sZSBydWxlLlxuICAgICAgICAgICAgY29uc3QgeyBzdGFydCwgZW5kIH0gPSBpbXBvcnRCbGFja2xpc3ROb2RlO1xuICAgICAgICAgICAgcmVjb3JkZXIucmVtb3ZlKHN0YXJ0Lm9mZnNldCwgZW5kLm9mZnNldCAtIHN0YXJ0Lm9mZnNldCk7XG4gICAgICAgICAgICByZWNvcmRlci5pbnNlcnRMZWZ0KHN0YXJ0Lm9mZnNldCwgJ1tdJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIE1pZGRsZSwganVzdCByZW1vdmUgdGhlIHdob2xlIG5vZGUgKHVwIHRvIG5leHQgbm9kZSBzdGFydCkuXG4gICAgICAgICAgY29uc3QgbmV4dCA9IGltcG9ydEJsYWNrbGlzdE5vZGUuZWxlbWVudHNbaSArIDFdO1xuICAgICAgICAgIHJlY29yZGVyLnJlbW92ZShzdGFydC5vZmZzZXQsIG5leHQuc3RhcnQub2Zmc2V0IC0gc3RhcnQub2Zmc2V0KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGhvc3QuY29tbWl0VXBkYXRlKHJlY29yZGVyKTtcblxuICAgIHJldHVybiBob3N0O1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiAoKTogUnVsZSB7XG4gIHJldHVybiAoaG9zdDogVHJlZSwgY29udGV4dDogU2NoZW1hdGljQ29udGV4dCkgPT4ge1xuICAgIGlmIChob3N0LmV4aXN0cygnLy5hbmd1bGFyLmpzb24nKSB8fCBob3N0LmV4aXN0cygnL2FuZ3VsYXIuanNvbicpKSB7XG4gICAgICBjb250ZXh0LmxvZ2dlci5pbmZvKCdGb3VuZCBhIG1vZGVybiBjb25maWd1cmF0aW9uIGZpbGUuIE5vdGhpbmcgdG8gYmUgZG9uZS4nKTtcblxuICAgICAgcmV0dXJuIGhvc3Q7XG4gICAgfVxuXG4gICAgY29uc3QgY29uZmlnUGF0aCA9IGdldENvbmZpZ1BhdGgoaG9zdCk7XG4gICAgY29uc3QgY29uZmlnQnVmZmVyID0gaG9zdC5yZWFkKG5vcm1hbGl6ZShjb25maWdQYXRoKSk7XG4gICAgaWYgKGNvbmZpZ0J1ZmZlciA9PSBudWxsKSB7XG4gICAgICB0aHJvdyBuZXcgU2NoZW1hdGljc0V4Y2VwdGlvbihgQ291bGQgbm90IGZpbmQgY29uZmlndXJhdGlvbiBmaWxlICgke2NvbmZpZ1BhdGh9KWApO1xuICAgIH1cbiAgICBjb25zdCBjb25maWcgPSBwYXJzZUpzb24oY29uZmlnQnVmZmVyLnRvU3RyaW5nKCksIEpzb25QYXJzZU1vZGUuTG9vc2UpO1xuXG4gICAgaWYgKHR5cGVvZiBjb25maWcgIT0gJ29iamVjdCcgfHwgQXJyYXkuaXNBcnJheShjb25maWcpIHx8IGNvbmZpZyA9PT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IFNjaGVtYXRpY3NFeGNlcHRpb24oJ0ludmFsaWQgYW5ndWxhci1jbGkuanNvbiBjb25maWd1cmF0aW9uOyBleHBlY3RlZCBhbiBvYmplY3QuJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNoYWluKFtcbiAgICAgIG1pZ3JhdGVLYXJtYUNvbmZpZ3VyYXRpb24oY29uZmlnKSxcbiAgICAgIG1pZ3JhdGVDb25maWd1cmF0aW9uKGNvbmZpZywgY29udGV4dC5sb2dnZXIpLFxuICAgICAgdXBkYXRlU3BlY1RzQ29uZmlnKGNvbmZpZyksXG4gICAgICB1cGRhdGVQYWNrYWdlSnNvbihjb25maWcpLFxuICAgICAgdXBkYXRlVHNMaW50Q29uZmlnKCksXG4gICAgICAoaG9zdDogVHJlZSwgY29udGV4dDogU2NoZW1hdGljQ29udGV4dCkgPT4ge1xuICAgICAgICBjb250ZXh0LmxvZ2dlci53YXJuKHRhZ3Mub25lTGluZWBTb21lIGNvbmZpZ3VyYXRpb24gb3B0aW9ucyBoYXZlIGJlZW4gY2hhbmdlZCxcbiAgICAgICAgICBwbGVhc2UgbWFrZSBzdXJlIHRvIHVwZGF0ZSBhbnkgbnBtIHNjcmlwdHMgd2hpY2ggeW91IG1heSBoYXZlIG1vZGlmaWVkLmApO1xuXG4gICAgICAgIHJldHVybiBob3N0O1xuICAgICAgfSxcbiAgICBdKTtcbiAgfTtcbn1cbiJdfQ==