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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL2JvYm8vV29yay9naXRodWIvc2hhcmstc2NoZW1hdGljcy9zcmMvIiwic291cmNlcyI6WyJzcmMvbWlncmF0aW9ucy91cGRhdGUtNi9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7R0FNRztBQUNILCtDQVc4QjtBQUM5QiwyREFNb0M7QUFDcEMsNERBQTBFO0FBRTFFLG1FQUErRDtBQUMvRCw2Q0FJc0I7QUFFdEIsTUFBTSxRQUFRLEdBQUc7SUFDZixPQUFPLEVBQUUsS0FBSztJQUNkLEtBQUssRUFBRSxZQUFZO0lBQ25CLElBQUksRUFBRSxTQUFTO0lBQ2YsU0FBUyxFQUFFLGNBQWM7SUFDekIsUUFBUSxFQUFFLG1CQUFtQjtJQUM3QixJQUFJLEVBQUUsU0FBUztJQUNmLE1BQU0sRUFBRSxPQUFPO0lBQ2YsS0FBSyxFQUFFLGVBQWU7SUFDdEIsVUFBVSxFQUFFLG9CQUFvQjtJQUNoQyxZQUFZLEVBQUUsb0JBQW9CO0lBQ2xDLFlBQVksRUFBRSxhQUFhO0lBQzNCLFVBQVUsRUFBRSxnQkFBZ0I7SUFDNUIsY0FBYyxFQUFFLHNCQUFzQjtDQUN2QyxDQUFDO0FBRUYsdUJBQXVCLElBQVU7SUFDL0IsSUFBSSxZQUFZLEdBQUcsZ0JBQVMsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0lBQ2xELElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsRUFBRTtRQUM3QixPQUFPLFlBQVksQ0FBQztLQUNyQjtJQUNELFlBQVksR0FBRyxnQkFBUyxDQUFDLGtCQUFrQixDQUFDLENBQUM7SUFDN0MsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxFQUFFO1FBQzdCLE9BQU8sWUFBWSxDQUFDO0tBQ3JCO0lBRUQsTUFBTSxJQUFJLGdDQUFtQixDQUFDLG1DQUFtQyxDQUFDLENBQUM7QUFDckUsQ0FBQztBQUVELG1DQUFtQyxNQUFpQjtJQUNsRCxPQUFPLENBQUMsSUFB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UUFBUSxFQUFFLEVBQUUsb0JBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUV2RSxJQUFJLE9BQU8sTUFBTSxJQUFJLFFBQVEsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLE1BQU0sS0FBSyxJQUFJLEVBQUU7WUFDekUsTUFBTSxJQUFJLGdDQUFtQixDQUFDLDZEQUE2RCxDQUFDLENBQUM7U0FDOUY7UUFFRCxPQUFPLGtCQUFLLENBQUM7WUFDWCx5QkFBeUIsQ0FBQyxNQUFNLENBQUM7WUFDakMsb0JBQW9CLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxNQUFNLENBQUM7WUFDNUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDO1lBQzFCLGlCQUFpQixDQUFDLE1BQU0sQ0FBQztZQUN6QixrQkFBa0IsRUFBRTtZQUNwQixDQUFDLElBQVUsRUFBRSxPQUF5QixFQUFFLEVBQUU7Z0JBQ3hDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQUksQ0FBQyxPQUFPLENBQUE7a0ZBQzBDLENBQUMsQ0FBQztnQkFFNUUsT0FBTyxJQUFJLENBQUM7WUFDZCxDQUFDO1NBQ0YsQ0FBQyxDQUFDO0lBQ0wsQ0FBQyxDQUFDO0FBQ0osQ0FBQztBQWpDRCw0QkFpQ0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge1xuICBKc29uQXJyYXksXG4gIEpzb25PYmplY3QsXG4gIEpzb25QYXJzZU1vZGUsXG4gIFBhdGgsXG4gIGpvaW4sXG4gIGxvZ2dpbmcsXG4gIG5vcm1hbGl6ZSxcbiAgcGFyc2VKc29uLFxuICBwYXJzZUpzb25Bc3QsXG4gIHRhZ3MsXG59IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9jb3JlJztcbmltcG9ydCB7XG4gIFJ1bGUsXG4gIFNjaGVtYXRpY0NvbnRleHQsXG4gIFNjaGVtYXRpY3NFeGNlcHRpb24sXG4gIFRyZWUsXG4gIGNoYWluLFxufSBmcm9tICdAYW5ndWxhci1kZXZraXQvc2NoZW1hdGljcyc7XG5pbXBvcnQgeyBOb2RlUGFja2FnZUluc3RhbGxUYXNrIH0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L3NjaGVtYXRpY3MvdGFza3MnO1xuaW1wb3J0IHsgQXBwQ29uZmlnLCBDbGlDb25maWcgfSBmcm9tICcuLi8uLi91dGlsaXR5L2NvbmZpZyc7XG5pbXBvcnQgeyBsYXRlc3RWZXJzaW9ucyB9IGZyb20gJy4uLy4uL3V0aWxpdHkvbGF0ZXN0LXZlcnNpb25zJztcbmltcG9ydCB7XG4gIGFwcGVuZFByb3BlcnR5SW5Bc3RPYmplY3QsXG4gIGFwcGVuZFZhbHVlSW5Bc3RBcnJheSxcbiAgZmluZFByb3BlcnR5SW5Bc3RPYmplY3QsXG59IGZyb20gJy4vanNvbi11dGlscyc7XG5cbmNvbnN0IGRlZmF1bHRzID0ge1xuICBhcHBSb290OiAnc3JjJyxcbiAgaW5kZXg6ICdpbmRleC5odG1sJyxcbiAgbWFpbjogJ21haW4udHMnLFxuICBwb2x5ZmlsbHM6ICdwb2x5ZmlsbHMudHMnLFxuICB0c0NvbmZpZzogJ3RzY29uZmlnLmFwcC5qc29uJyxcbiAgdGVzdDogJ3Rlc3QudHMnLFxuICBvdXREaXI6ICdkaXN0LycsXG4gIGthcm1hOiAna2FybWEuY29uZi5qcycsXG4gIHByb3RyYWN0b3I6ICdwcm90cmFjdG9yLmNvbmYuanMnLFxuICB0ZXN0VHNDb25maWc6ICd0c2NvbmZpZy5zcGVjLmpzb24nLFxuICBzZXJ2ZXJPdXREaXI6ICdkaXN0LXNlcnZlcicsXG4gIHNlcnZlck1haW46ICdtYWluLnNlcnZlci50cycsXG4gIHNlcnZlclRzQ29uZmlnOiAndHNjb25maWcuc2VydmVyLmpzb24nLFxufTtcblxuZnVuY3Rpb24gZ2V0Q29uZmlnUGF0aCh0cmVlOiBUcmVlKTogUGF0aCB7XG4gIGxldCBwb3NzaWJsZVBhdGggPSBub3JtYWxpemUoJy5hbmd1bGFyLWNsaS5qc29uJyk7XG4gIGlmICh0cmVlLmV4aXN0cyhwb3NzaWJsZVBhdGgpKSB7XG4gICAgcmV0dXJuIHBvc3NpYmxlUGF0aDtcbiAgfVxuICBwb3NzaWJsZVBhdGggPSBub3JtYWxpemUoJ2FuZ3VsYXItY2xpLmpzb24nKTtcbiAgaWYgKHRyZWUuZXhpc3RzKHBvc3NpYmxlUGF0aCkpIHtcbiAgICByZXR1cm4gcG9zc2libGVQYXRoO1xuICB9XG5cbiAgdGhyb3cgbmV3IFNjaGVtYXRpY3NFeGNlcHRpb24oJ0NvdWxkIG5vdCBmaW5kIGNvbmZpZ3VyYXRpb24gZmlsZScpO1xufVxuXG5mdW5jdGlvbiBtaWdyYXRlS2FybWFDb25maWd1cmF0aW9uKGNvbmZpZzogQ2xpQ29uZmlnKTogUnVsZSB7XG4gIHJldHVybiAoaG9zdDogVHJlZSwgY29udGV4dDogU2NoZW1hdGljQ29udGV4dCkgPT4ge1xuICAgIGNvbnRleHQubG9nZ2VyLmluZm8oYFVwZGF0aW5nIGthcm1hIGNvbmZpZ3VyYXRpb25gKTtcbiAgICB0cnkge1xuICAgICAgY29uc3Qga2FybWFQYXRoID0gY29uZmlnICYmIGNvbmZpZy50ZXN0ICYmIGNvbmZpZy50ZXN0Lmthcm1hICYmIGNvbmZpZy50ZXN0Lmthcm1hLmNvbmZpZ1xuICAgICAgICA/IGNvbmZpZy50ZXN0Lmthcm1hLmNvbmZpZ1xuICAgICAgICA6IGRlZmF1bHRzLmthcm1hO1xuICAgICAgY29uc3QgYnVmZmVyID0gaG9zdC5yZWFkKGthcm1hUGF0aCk7XG4gICAgICBpZiAoYnVmZmVyICE9PSBudWxsKSB7XG4gICAgICAgIGxldCBjb250ZW50ID0gYnVmZmVyLnRvU3RyaW5nKCk7XG4gICAgICAgIC8vIFJlcGxhY2UgdGhlIDEuMCBmaWxlcyBhbmQgcHJlcHJvY2Vzc29yIGVudHJpZXMsIHdpdGggYW5kIHdpdGhvdXQgY29tbWEgYXQgdGhlIGVuZC5cbiAgICAgICAgLy8gSWYgdGhlc2UgcmVtYWluLCB0aGV5IHdpbGwgY2F1c2UgdGhlIGBuZyB0ZXN0YCB0byBmYWlsLlxuICAgICAgICBjb250ZW50ID0gY29udGVudC5yZXBsYWNlKGB7IHBhdHRlcm46ICcuL3NyYy90ZXN0LnRzJywgd2F0Y2hlZDogZmFsc2UgfSxgLCAnJyk7XG4gICAgICAgIGNvbnRlbnQgPSBjb250ZW50LnJlcGxhY2UoYHsgcGF0dGVybjogJy4vc3JjL3Rlc3QudHMnLCB3YXRjaGVkOiBmYWxzZSB9YCwgJycpO1xuICAgICAgICBjb250ZW50ID0gY29udGVudC5yZXBsYWNlKGAnLi9zcmMvdGVzdC50cyc6IFsnQGFuZ3VsYXIvY2xpJ10sYCwgJycpO1xuICAgICAgICBjb250ZW50ID0gY29udGVudC5yZXBsYWNlKGAnLi9zcmMvdGVzdC50cyc6IFsnQGFuZ3VsYXIvY2xpJ11gLCAnJyk7XG4gICAgICAgIGNvbnRlbnQgPSBjb250ZW50LnJlcGxhY2UoL2FuZ3VsYXJDbGlbXn1dKn0sPy8sICcnKTtcbiAgICAgICAgLy8gUmVwbGFjZSAxLnggcGx1Z2luIG5hbWVzLlxuICAgICAgICBjb250ZW50ID0gY29udGVudC5yZXBsYWNlKC9AYW5ndWxhclxcL2NsaS9nLCAnQGFuZ3VsYXItZGV2a2l0L2J1aWxkLWFuZ3VsYXInKTtcbiAgICAgICAgLy8gUmVwbGFjZSBjb2RlIGNvdmVyYWdlIG91dHB1dCBwYXRoLlxuICAgICAgICBjb250ZW50ID0gY29udGVudC5yZXBsYWNlKCdyZXBvcnRzJyxcbiAgICAgICAgICBgZGlyOiByZXF1aXJlKCdwYXRoJykuam9pbihfX2Rpcm5hbWUsICdjb3ZlcmFnZScpLCByZXBvcnRzYCk7XG4gICAgICAgIGhvc3Qub3ZlcndyaXRlKGthcm1hUGF0aCwgY29udGVudCk7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZSkgeyB9XG5cbiAgICByZXR1cm4gaG9zdDtcbiAgfTtcbn1cblxuZnVuY3Rpb24gbWlncmF0ZUNvbmZpZ3VyYXRpb24ob2xkQ29uZmlnOiBDbGlDb25maWcsIGxvZ2dlcjogbG9nZ2luZy5Mb2dnZXJBcGkpOiBSdWxlIHtcbiAgcmV0dXJuIChob3N0OiBUcmVlLCBjb250ZXh0OiBTY2hlbWF0aWNDb250ZXh0KSA9PiB7XG4gICAgY29uc3Qgb2xkQ29uZmlnUGF0aCA9IGdldENvbmZpZ1BhdGgoaG9zdCk7XG4gICAgY29uc3QgY29uZmlnUGF0aCA9IG5vcm1hbGl6ZSgnYW5ndWxhci5qc29uJyk7XG4gICAgY29udGV4dC5sb2dnZXIuaW5mbyhgVXBkYXRpbmcgY29uZmlndXJhdGlvbmApO1xuICAgIGNvbnN0IGNvbmZpZzogSnNvbk9iamVjdCA9IHtcbiAgICAgICckc2NoZW1hJzogJy4vbm9kZV9tb2R1bGVzL0Bhbmd1bGFyL2NsaS9saWIvY29uZmlnL3NjaGVtYS5qc29uJyxcbiAgICAgIHZlcnNpb246IDEsXG4gICAgICBuZXdQcm9qZWN0Um9vdDogJ3Byb2plY3RzJyxcbiAgICAgIHByb2plY3RzOiBleHRyYWN0UHJvamVjdHNDb25maWcob2xkQ29uZmlnLCBob3N0LCBsb2dnZXIpLFxuICAgIH07XG4gICAgY29uc3QgZGVmYXVsdFByb2plY3QgPSBleHRyYWN0RGVmYXVsdFByb2plY3Qob2xkQ29uZmlnKTtcbiAgICBpZiAoZGVmYXVsdFByb2plY3QgIT09IG51bGwpIHtcbiAgICAgIGNvbmZpZy5kZWZhdWx0UHJvamVjdCA9IGRlZmF1bHRQcm9qZWN0O1xuICAgIH1cbiAgICBjb25zdCBjbGlDb25maWcgPSBleHRyYWN0Q2xpQ29uZmlnKG9sZENvbmZpZyk7XG4gICAgaWYgKGNsaUNvbmZpZyAhPT0gbnVsbCkge1xuICAgICAgY29uZmlnLmNsaSA9IGNsaUNvbmZpZztcbiAgICB9XG4gICAgY29uc3Qgc2NoZW1hdGljc0NvbmZpZyA9IGV4dHJhY3RTY2hlbWF0aWNzQ29uZmlnKG9sZENvbmZpZyk7XG4gICAgaWYgKHNjaGVtYXRpY3NDb25maWcgIT09IG51bGwpIHtcbiAgICAgIGNvbmZpZy5zY2hlbWF0aWNzID0gc2NoZW1hdGljc0NvbmZpZztcbiAgICB9XG4gICAgY29uc3QgYXJjaGl0ZWN0Q29uZmlnID0gZXh0cmFjdEFyY2hpdGVjdENvbmZpZyhvbGRDb25maWcpO1xuICAgIGlmIChhcmNoaXRlY3RDb25maWcgIT09IG51bGwpIHtcbiAgICAgIGNvbmZpZy5hcmNoaXRlY3QgPSBhcmNoaXRlY3RDb25maWc7XG4gICAgfVxuXG4gICAgY29udGV4dC5sb2dnZXIuaW5mbyhgUmVtb3Zpbmcgb2xkIGNvbmZpZyBmaWxlICgke29sZENvbmZpZ1BhdGh9KWApO1xuICAgIGhvc3QuZGVsZXRlKG9sZENvbmZpZ1BhdGgpO1xuICAgIGNvbnRleHQubG9nZ2VyLmluZm8oYFdyaXRpbmcgY29uZmlnIGZpbGUgKCR7Y29uZmlnUGF0aH0pYCk7XG4gICAgaG9zdC5jcmVhdGUoY29uZmlnUGF0aCwgSlNPTi5zdHJpbmdpZnkoY29uZmlnLCBudWxsLCAyKSk7XG5cbiAgICByZXR1cm4gaG9zdDtcbiAgfTtcbn1cblxuZnVuY3Rpb24gZXh0cmFjdENsaUNvbmZpZyhjb25maWc6IENsaUNvbmZpZyk6IEpzb25PYmplY3QgfCBudWxsIHtcbiAgY29uc3QgbmV3Q29uZmlnOiBKc29uT2JqZWN0ID0ge307XG4gIGlmIChjb25maWcucGFja2FnZU1hbmFnZXIgJiYgY29uZmlnLnBhY2thZ2VNYW5hZ2VyICE9PSAnZGVmYXVsdCcpIHtcbiAgICBuZXdDb25maWdbJ3BhY2thZ2VNYW5hZ2VyJ10gPSBjb25maWcucGFja2FnZU1hbmFnZXI7XG4gIH1cbiAgaWYgKGNvbmZpZy53YXJuaW5ncykge1xuICAgIGlmIChjb25maWcud2FybmluZ3MudmVyc2lvbk1pc21hdGNoICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIG5ld0NvbmZpZy53YXJuaW5ncyA9IHtcbiAgICAgICAgLi4uKChuZXdDb25maWcud2FybmluZ3MgYXMgSnNvbk9iamVjdCB8IG51bGwpIHx8IHt9KSxcbiAgICAgICAgLi4ueyB2ZXJzaW9uTWlzbWF0Y2g6IGNvbmZpZy53YXJuaW5ncy52ZXJzaW9uTWlzbWF0Y2ggfSxcbiAgICAgIH07XG4gICAgfVxuICAgIGlmIChjb25maWcud2FybmluZ3MudHlwZXNjcmlwdE1pc21hdGNoICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIG5ld0NvbmZpZy53YXJuaW5ncyA9IHtcbiAgICAgICAgLi4uKChuZXdDb25maWcud2FybmluZ3MgYXMgSnNvbk9iamVjdCB8IG51bGwpIHx8IHt9KSxcbiAgICAgICAgLi4ueyB0eXBlc2NyaXB0TWlzbWF0Y2g6IGNvbmZpZy53YXJuaW5ncy50eXBlc2NyaXB0TWlzbWF0Y2ggfSxcbiAgICAgIH07XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKG5ld0NvbmZpZykubGVuZ3RoID09IDAgPyBudWxsIDogbmV3Q29uZmlnO1xufVxuXG5mdW5jdGlvbiBleHRyYWN0U2NoZW1hdGljc0NvbmZpZyhjb25maWc6IENsaUNvbmZpZyk6IEpzb25PYmplY3QgfCBudWxsIHtcbiAgbGV0IGNvbGxlY3Rpb25OYW1lID0gJ0BzY2hlbWF0aWNzL2FuZ3VsYXInO1xuICBpZiAoIWNvbmZpZyB8fCAhY29uZmlnLmRlZmF1bHRzKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgLy8gY29uc3QgY29uZmlnRGVmYXVsdHMgPSBjb25maWcuZGVmYXVsdHM7XG4gIGlmIChjb25maWcuZGVmYXVsdHMgJiYgY29uZmlnLmRlZmF1bHRzLnNjaGVtYXRpY3MgJiYgY29uZmlnLmRlZmF1bHRzLnNjaGVtYXRpY3MuY29sbGVjdGlvbikge1xuICAgIGNvbGxlY3Rpb25OYW1lID0gY29uZmlnLmRlZmF1bHRzLnNjaGVtYXRpY3MuY29sbGVjdGlvbjtcbiAgfVxuXG4gIC8qKlxuICAgKiBGb3IgZWFjaCBzY2hlbWF0aWNcbiAgICogIC0gZ2V0IHRoZSBjb25maWdcbiAgICogIC0gZmlsdGVyIG9uZSdzIHdpdGhvdXQgY29uZmlnXG4gICAqICAtIGNvbWJpbmUgdGhlbSBpbnRvIGFuIG9iamVjdFxuICAgKi9cbiAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWFueVxuICBjb25zdCBzY2hlbWF0aWNDb25maWdzOiBhbnkgPSBbJ2NsYXNzJywgJ2NvbXBvbmVudCcsICdkaXJlY3RpdmUnLCAnZ3VhcmQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2ludGVyZmFjZScsICdtb2R1bGUnLCAncGlwZScsICdzZXJ2aWNlJ11cbiAgICAubWFwKHNjaGVtYXRpY05hbWUgPT4ge1xuICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWFueVxuICAgICAgY29uc3Qgc2NoZW1hdGljRGVmYXVsdHM6IEpzb25PYmplY3QgPSAoY29uZmlnLmRlZmF1bHRzIGFzIGFueSlbc2NoZW1hdGljTmFtZV0gfHwgbnVsbDtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc2NoZW1hdGljTmFtZSxcbiAgICAgICAgY29uZmlnOiBzY2hlbWF0aWNEZWZhdWx0cyxcbiAgICAgIH07XG4gICAgfSlcbiAgICAuZmlsdGVyKHNjaGVtYXRpYyA9PiBzY2hlbWF0aWMuY29uZmlnICE9PSBudWxsKVxuICAgIC5yZWR1Y2UoKGFsbDogSnNvbk9iamVjdCwgc2NoZW1hdGljKSA9PiB7XG4gICAgICBhbGxbY29sbGVjdGlvbk5hbWUgKyAnOicgKyBzY2hlbWF0aWMuc2NoZW1hdGljTmFtZV0gPSBzY2hlbWF0aWMuY29uZmlnO1xuXG4gICAgICByZXR1cm4gYWxsO1xuICAgIH0sIHt9KTtcblxuICBjb25zdCBjb21wb25lbnRVcGRhdGU6IEpzb25PYmplY3QgPSB7fTtcbiAgY29tcG9uZW50VXBkYXRlLnByZWZpeCA9ICcnO1xuXG4gIGNvbnN0IGNvbXBvbmVudEtleSA9IGNvbGxlY3Rpb25OYW1lICsgJzpjb21wb25lbnQnO1xuICBjb25zdCBkaXJlY3RpdmVLZXkgPSBjb2xsZWN0aW9uTmFtZSArICc6ZGlyZWN0aXZlJztcbiAgaWYgKCFzY2hlbWF0aWNDb25maWdzW2NvbXBvbmVudEtleV0pIHtcbiAgICBzY2hlbWF0aWNDb25maWdzW2NvbXBvbmVudEtleV0gPSB7fTtcbiAgfVxuICBpZiAoIXNjaGVtYXRpY0NvbmZpZ3NbZGlyZWN0aXZlS2V5XSkge1xuICAgIHNjaGVtYXRpY0NvbmZpZ3NbZGlyZWN0aXZlS2V5XSA9IHt9O1xuICB9XG4gIGlmIChjb25maWcuYXBwcyAmJiBjb25maWcuYXBwc1swXSkge1xuICAgIHNjaGVtYXRpY0NvbmZpZ3NbY29tcG9uZW50S2V5XS5wcmVmaXggPSBjb25maWcuYXBwc1swXS5wcmVmaXg7XG4gICAgc2NoZW1hdGljQ29uZmlnc1tkaXJlY3RpdmVLZXldLnByZWZpeCA9IGNvbmZpZy5hcHBzWzBdLnByZWZpeDtcbiAgfVxuICBpZiAoY29uZmlnLmRlZmF1bHRzKSB7XG4gICAgc2NoZW1hdGljQ29uZmlnc1tjb21wb25lbnRLZXldLnN0eWxlZXh0ID0gY29uZmlnLmRlZmF1bHRzLnN0eWxlRXh0O1xuICB9XG5cbiAgcmV0dXJuIHNjaGVtYXRpY0NvbmZpZ3M7XG59XG5cbmZ1bmN0aW9uIGV4dHJhY3RBcmNoaXRlY3RDb25maWcoX2NvbmZpZzogQ2xpQ29uZmlnKTogSnNvbk9iamVjdCB8IG51bGwge1xuICByZXR1cm4gbnVsbDtcbn1cblxuZnVuY3Rpb24gZXh0cmFjdFByb2plY3RzQ29uZmlnKFxuICBjb25maWc6IENsaUNvbmZpZywgdHJlZTogVHJlZSwgbG9nZ2VyOiBsb2dnaW5nLkxvZ2dlckFwaSxcbik6IEpzb25PYmplY3Qge1xuICBjb25zdCBidWlsZGVyUGFja2FnZSA9ICdAYW5ndWxhci1kZXZraXQvYnVpbGQtYW5ndWxhcic7XG4gIGNvbnN0IGRlZmF1bHRBcHBOYW1lUHJlZml4ID0gZ2V0RGVmYXVsdEFwcE5hbWVQcmVmaXgoY29uZmlnKTtcblxuICBjb25zdCBidWlsZERlZmF1bHRzOiBKc29uT2JqZWN0ID0gY29uZmlnLmRlZmF1bHRzICYmIGNvbmZpZy5kZWZhdWx0cy5idWlsZFxuICAgID8ge1xuICAgICAgc291cmNlTWFwOiBjb25maWcuZGVmYXVsdHMuYnVpbGQuc291cmNlbWFwcyxcbiAgICAgIHByb2dyZXNzOiBjb25maWcuZGVmYXVsdHMuYnVpbGQucHJvZ3Jlc3MsXG4gICAgICBwb2xsOiBjb25maWcuZGVmYXVsdHMuYnVpbGQucG9sbCxcbiAgICAgIGRlbGV0ZU91dHB1dFBhdGg6IGNvbmZpZy5kZWZhdWx0cy5idWlsZC5kZWxldGVPdXRwdXRQYXRoLFxuICAgICAgcHJlc2VydmVTeW1saW5rczogY29uZmlnLmRlZmF1bHRzLmJ1aWxkLnByZXNlcnZlU3ltbGlua3MsXG4gICAgICBzaG93Q2lyY3VsYXJEZXBlbmRlbmNpZXM6IGNvbmZpZy5kZWZhdWx0cy5idWlsZC5zaG93Q2lyY3VsYXJEZXBlbmRlbmNpZXMsXG4gICAgICBjb21tb25DaHVuazogY29uZmlnLmRlZmF1bHRzLmJ1aWxkLmNvbW1vbkNodW5rLFxuICAgICAgbmFtZWRDaHVua3M6IGNvbmZpZy5kZWZhdWx0cy5idWlsZC5uYW1lZENodW5rcyxcbiAgICB9IGFzIEpzb25PYmplY3RcbiAgICA6IHt9O1xuXG4gIGNvbnN0IHNlcnZlRGVmYXVsdHM6IEpzb25PYmplY3QgPSBjb25maWcuZGVmYXVsdHMgJiYgY29uZmlnLmRlZmF1bHRzLnNlcnZlXG4gICAgPyB7XG4gICAgICBwb3J0OiBjb25maWcuZGVmYXVsdHMuc2VydmUucG9ydCxcbiAgICAgIGhvc3Q6IGNvbmZpZy5kZWZhdWx0cy5zZXJ2ZS5ob3N0LFxuICAgICAgc3NsOiBjb25maWcuZGVmYXVsdHMuc2VydmUuc3NsLFxuICAgICAgc3NsS2V5OiBjb25maWcuZGVmYXVsdHMuc2VydmUuc3NsS2V5LFxuICAgICAgc3NsQ2VydDogY29uZmlnLmRlZmF1bHRzLnNlcnZlLnNzbENlcnQsXG4gICAgICBwcm94eUNvbmZpZzogY29uZmlnLmRlZmF1bHRzLnNlcnZlLnByb3h5Q29uZmlnLFxuICAgIH0gYXMgSnNvbk9iamVjdFxuICAgIDoge307XG5cblxuICBjb25zdCBhcHBzID0gY29uZmlnLmFwcHMgfHwgW107XG4gIC8vIGNvbnZlcnQgdGhlIGFwcHMgdG8gcHJvamVjdHNcbiAgY29uc3QgYnJvd3NlckFwcHMgPSBhcHBzLmZpbHRlcihhcHAgPT4gYXBwLnBsYXRmb3JtICE9PSAnc2VydmVyJyk7XG4gIGNvbnN0IHNlcnZlckFwcHMgPSBhcHBzLmZpbHRlcihhcHAgPT4gYXBwLnBsYXRmb3JtID09PSAnc2VydmVyJyk7XG5cbiAgY29uc3QgcHJvamVjdE1hcCA9IGJyb3dzZXJBcHBzXG4gICAgLm1hcCgoYXBwLCBpZHgpID0+IHtcbiAgICAgIGNvbnN0IGRlZmF1bHRBcHBOYW1lID0gaWR4ID09PSAwID8gZGVmYXVsdEFwcE5hbWVQcmVmaXggOiBgJHtkZWZhdWx0QXBwTmFtZVByZWZpeH0ke2lkeH1gO1xuICAgICAgY29uc3QgbmFtZSA9IGFwcC5uYW1lIHx8IGRlZmF1bHRBcHBOYW1lO1xuICAgICAgY29uc3Qgb3V0RGlyID0gYXBwLm91dERpciB8fCBkZWZhdWx0cy5vdXREaXI7XG4gICAgICBjb25zdCBhcHBSb290ID0gYXBwLnJvb3QgfHwgZGVmYXVsdHMuYXBwUm9vdDtcblxuICAgICAgZnVuY3Rpb24gX21hcEFzc2V0cyhhc3NldDogc3RyaW5nIHwgSnNvbk9iamVjdCkge1xuICAgICAgICBpZiAodHlwZW9mIGFzc2V0ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIHJldHVybiBub3JtYWxpemUoYXBwUm9vdCArICcvJyArIGFzc2V0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoYXNzZXQuYWxsb3dPdXRzaWRlT3V0RGlyKSB7XG4gICAgICAgICAgICBsb2dnZXIud2Fybih0YWdzLm9uZUxpbmVgXG4gICAgICAgICAgICAgIEFzc2V0IHdpdGggaW5wdXQgJyR7YXNzZXQuaW5wdXR9JyB3YXMgbm90IG1pZ3JhdGVkIGJlY2F1c2UgaXRcbiAgICAgICAgICAgICAgdXNlcyB0aGUgJ2FsbG93T3V0c2lkZU91dERpcicgb3B0aW9uIHdoaWNoIGlzIG5vdCBzdXBwb3J0ZWQgaW4gQW5ndWxhciBDTEkgNi5cbiAgICAgICAgICAgIGApO1xuXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICB9IGVsc2UgaWYgKGFzc2V0Lm91dHB1dCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgZ2xvYjogYXNzZXQuZ2xvYixcbiAgICAgICAgICAgICAgaW5wdXQ6IG5vcm1hbGl6ZShhcHBSb290ICsgJy8nICsgYXNzZXQuaW5wdXQpLFxuICAgICAgICAgICAgICBvdXRwdXQ6IG5vcm1hbGl6ZSgnLycgKyBhc3NldC5vdXRwdXQgYXMgc3RyaW5nKSxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIGdsb2I6IGFzc2V0Lmdsb2IsXG4gICAgICAgICAgICAgIGlucHV0OiBub3JtYWxpemUoYXBwUm9vdCArICcvJyArIGFzc2V0LmlucHV0KSxcbiAgICAgICAgICAgICAgb3V0cHV0OiAnLycsXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBfYnVpbGRDb25maWd1cmF0aW9ucygpOiBKc29uT2JqZWN0IHtcbiAgICAgICAgY29uc3Qgc291cmNlID0gYXBwLmVudmlyb25tZW50U291cmNlO1xuICAgICAgICBjb25zdCBlbnZpcm9ubWVudHMgPSBhcHAuZW52aXJvbm1lbnRzO1xuICAgICAgICBjb25zdCBzZXJ2aWNlV29ya2VyID0gYXBwLnNlcnZpY2VXb3JrZXI7XG5cbiAgICAgICAgaWYgKCFlbnZpcm9ubWVudHMpIHtcbiAgICAgICAgICByZXR1cm4ge307XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gT2JqZWN0LmtleXMoZW52aXJvbm1lbnRzKS5yZWR1Y2UoKGFjYywgZW52aXJvbm1lbnQpID0+IHtcbiAgICAgICAgICBpZiAoc291cmNlID09PSBlbnZpcm9ubWVudHNbZW52aXJvbm1lbnRdKSB7XG4gICAgICAgICAgICByZXR1cm4gYWNjO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGxldCBpc1Byb2R1Y3Rpb24gPSBmYWxzZTtcblxuICAgICAgICAgIGNvbnN0IGVudmlyb25tZW50Q29udGVudCA9IHRyZWUucmVhZChhcHAucm9vdCArICcvJyArIGVudmlyb25tZW50c1tlbnZpcm9ubWVudF0pO1xuICAgICAgICAgIGlmIChlbnZpcm9ubWVudENvbnRlbnQpIHtcbiAgICAgICAgICAgIGlzUHJvZHVjdGlvbiA9ICEhZW52aXJvbm1lbnRDb250ZW50LnRvU3RyaW5nKCd1dGYtOCcpXG4gICAgICAgICAgICAgIC8vIEFsbG93IGZvciBgcHJvZHVjdGlvbjogdHJ1ZWAgb3IgYHByb2R1Y3Rpb24gPSB0cnVlYC4gQmVzdCB3ZSBjYW4gZG8gdG8gZ3Vlc3MuXG4gICAgICAgICAgICAgIC5tYXRjaCgvcHJvZHVjdGlvblsnXCJdP1xccypbOj1dXFxzKnRydWUvKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBsZXQgY29uZmlndXJhdGlvbk5hbWU7XG4gICAgICAgICAgLy8gV2UgdXNlZCB0byB1c2UgYHByb2RgIGJ5IGRlZmF1bHQgYXMgdGhlIGtleSwgaW5zdGVhZCB3ZSBub3cgdXNlIHRoZSBmdWxsIHdvcmQuXG4gICAgICAgICAgLy8gVHJ5IG5vdCB0byBvdmVycmlkZSB0aGUgcHJvZHVjdGlvbiBrZXkgaWYgaXQncyB0aGVyZS5cbiAgICAgICAgICBpZiAoZW52aXJvbm1lbnQgPT0gJ3Byb2QnICYmICFlbnZpcm9ubWVudHNbJ3Byb2R1Y3Rpb24nXSAmJiBpc1Byb2R1Y3Rpb24pIHtcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb25OYW1lID0gJ3Byb2R1Y3Rpb24nO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25maWd1cmF0aW9uTmFtZSA9IGVudmlyb25tZW50O1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGxldCBzd0NvbmZpZzogSnNvbk9iamVjdCB8IG51bGwgPSBudWxsO1xuICAgICAgICAgIGlmIChzZXJ2aWNlV29ya2VyKSB7XG4gICAgICAgICAgICBzd0NvbmZpZyA9IHtcbiAgICAgICAgICAgICAgc2VydmljZVdvcmtlcjogdHJ1ZSxcbiAgICAgICAgICAgICAgbmdzd0NvbmZpZ1BhdGg6ICcvc3JjL25nc3ctY29uZmlnLmpzb24nLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBhY2NbY29uZmlndXJhdGlvbk5hbWVdID0ge1xuICAgICAgICAgICAgLi4uKGlzUHJvZHVjdGlvblxuICAgICAgICAgICAgICA/IHtcbiAgICAgICAgICAgICAgICBvcHRpbWl6YXRpb246IHRydWUsXG4gICAgICAgICAgICAgICAgb3V0cHV0SGFzaGluZzogJ2FsbCcsXG4gICAgICAgICAgICAgICAgc291cmNlTWFwOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBleHRyYWN0Q3NzOiB0cnVlLFxuICAgICAgICAgICAgICAgIG5hbWVkQ2h1bmtzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBhb3Q6IHRydWUsXG4gICAgICAgICAgICAgICAgZXh0cmFjdExpY2Vuc2VzOiB0cnVlLFxuICAgICAgICAgICAgICAgIHZlbmRvckNodW5rOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBidWlsZE9wdGltaXplcjogdHJ1ZSxcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICA6IHt9XG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgLi4uKGlzUHJvZHVjdGlvbiAmJiBzd0NvbmZpZyA/IHN3Q29uZmlnIDoge30pLFxuICAgICAgICAgICAgLi4uKGlzUHJvZHVjdGlvbiAmJiBhcHAuYnVkZ2V0cyA/IHsgYnVkZ2V0czogYXBwLmJ1ZGdldHMgYXMgSnNvbkFycmF5IH0gOiB7fSksXG4gICAgICAgICAgICBmaWxlUmVwbGFjZW1lbnRzOiBbXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByZXBsYWNlOiBgJHthcHAucm9vdH0vJHtzb3VyY2V9YCxcbiAgICAgICAgICAgICAgICB3aXRoOiBgJHthcHAucm9vdH0vJHtlbnZpcm9ubWVudHNbZW52aXJvbm1lbnRdfWAsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBdLFxuICAgICAgICAgIH07XG5cbiAgICAgICAgICByZXR1cm4gYWNjO1xuICAgICAgICB9LCB7fSBhcyBKc29uT2JqZWN0KTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gX3NlcnZlQ29uZmlndXJhdGlvbnMoKTogSnNvbk9iamVjdCB7XG4gICAgICAgIGNvbnN0IGVudmlyb25tZW50cyA9IGFwcC5lbnZpcm9ubWVudHM7XG5cbiAgICAgICAgaWYgKCFlbnZpcm9ubWVudHMpIHtcbiAgICAgICAgICByZXR1cm4ge307XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFhcmNoaXRlY3QpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGNvbmZpZ3VyYXRpb25zID0gKGFyY2hpdGVjdC5idWlsZCBhcyBKc29uT2JqZWN0KS5jb25maWd1cmF0aW9ucyBhcyBKc29uT2JqZWN0O1xuXG4gICAgICAgIHJldHVybiBPYmplY3Qua2V5cyhjb25maWd1cmF0aW9ucykucmVkdWNlKChhY2MsIGVudmlyb25tZW50KSA9PiB7XG4gICAgICAgICAgYWNjW2Vudmlyb25tZW50XSA9IHsgYnJvd3NlclRhcmdldDogYCR7bmFtZX06YnVpbGQ6JHtlbnZpcm9ubWVudH1gIH07XG5cbiAgICAgICAgICByZXR1cm4gYWNjO1xuICAgICAgICB9LCB7fSBhcyBKc29uT2JqZWN0KTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gX2V4dHJhRW50cnlNYXBwZXIoZXh0cmFFbnRyeTogc3RyaW5nIHwgSnNvbk9iamVjdCkge1xuICAgICAgICBsZXQgZW50cnk6IHN0cmluZyB8IEpzb25PYmplY3Q7XG4gICAgICAgIGlmICh0eXBlb2YgZXh0cmFFbnRyeSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICBlbnRyeSA9IGpvaW4oYXBwLnJvb3QgYXMgUGF0aCwgZXh0cmFFbnRyeSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3QgaW5wdXQgPSBqb2luKGFwcC5yb290IGFzIFBhdGgsIGV4dHJhRW50cnkuaW5wdXQgYXMgc3RyaW5nIHx8ICcnKTtcbiAgICAgICAgICBlbnRyeSA9IHsgaW5wdXQsIGxhenk6IGV4dHJhRW50cnkubGF6eSB9O1xuXG4gICAgICAgICAgaWYgKGV4dHJhRW50cnkub3V0cHV0KSB7XG4gICAgICAgICAgICBlbnRyeS5idW5kbGVOYW1lID0gZXh0cmFFbnRyeS5vdXRwdXQ7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGVudHJ5O1xuICAgICAgfVxuXG4gICAgICBjb25zdCBwcm9qZWN0OiBKc29uT2JqZWN0ID0ge1xuICAgICAgICByb290OiBqb2luKG5vcm1hbGl6ZShhcHBSb290KSwgJy4uJyksXG4gICAgICAgIHNvdXJjZVJvb3Q6IGFwcFJvb3QsXG4gICAgICAgIHByb2plY3RUeXBlOiAnYXBwbGljYXRpb24nLFxuICAgICAgfTtcblxuICAgICAgY29uc3QgYXJjaGl0ZWN0OiBKc29uT2JqZWN0ID0ge307XG4gICAgICBwcm9qZWN0LmFyY2hpdGVjdCA9IGFyY2hpdGVjdDtcblxuICAgICAgICAvLyBCcm93c2VyIHRhcmdldFxuICAgICAgY29uc3QgYnVpbGRPcHRpb25zOiBKc29uT2JqZWN0ID0ge1xuICAgICAgICAvLyBNYWtlIG91dHB1dFBhdGggcmVsYXRpdmUgdG8gcm9vdC5cbiAgICAgICAgb3V0cHV0UGF0aDogb3V0RGlyLFxuICAgICAgICBpbmRleDogYCR7YXBwUm9vdH0vJHthcHAuaW5kZXggfHwgZGVmYXVsdHMuaW5kZXh9YCxcbiAgICAgICAgbWFpbjogYCR7YXBwUm9vdH0vJHthcHAubWFpbiB8fCBkZWZhdWx0cy5tYWlufWAsXG4gICAgICAgIHRzQ29uZmlnOiBgJHthcHBSb290fS8ke2FwcC50c2NvbmZpZyB8fCBkZWZhdWx0cy50c0NvbmZpZ31gLFxuICAgICAgICAuLi4oYXBwLmJhc2VIcmVmID8geyBiYXNlSHJlZjogYXBwLmJhc2VIcmVmIH0gOiB7fSksXG4gICAgICAgIC4uLmJ1aWxkRGVmYXVsdHMsXG4gICAgICB9O1xuXG4gICAgICBpZiAoYXBwLnBvbHlmaWxscykge1xuICAgICAgICBidWlsZE9wdGlvbnMucG9seWZpbGxzID0gYXBwUm9vdCArICcvJyArIGFwcC5wb2x5ZmlsbHM7XG4gICAgICB9XG5cbiAgICAgIGlmIChhcHAuc3R5bGVQcmVwcm9jZXNzb3JPcHRpb25zXG4gICAgICAgICAgJiYgYXBwLnN0eWxlUHJlcHJvY2Vzc29yT3B0aW9ucy5pbmNsdWRlUGF0aHNcbiAgICAgICAgICAmJiBBcnJheS5pc0FycmF5KGFwcC5zdHlsZVByZXByb2Nlc3Nvck9wdGlvbnMuaW5jbHVkZVBhdGhzKVxuICAgICAgICAgICYmIGFwcC5zdHlsZVByZXByb2Nlc3Nvck9wdGlvbnMuaW5jbHVkZVBhdGhzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgYnVpbGRPcHRpb25zLnN0eWxlUHJlcHJvY2Vzc29yT3B0aW9ucyA9IHtcbiAgICAgICAgICBpbmNsdWRlUGF0aHM6IGFwcC5zdHlsZVByZXByb2Nlc3Nvck9wdGlvbnMuaW5jbHVkZVBhdGhzXG4gICAgICAgICAgICAubWFwKGluY2x1ZGVQYXRoID0+IGpvaW4oYXBwLnJvb3QgYXMgUGF0aCwgaW5jbHVkZVBhdGgpKSxcbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgYnVpbGRPcHRpb25zLmFzc2V0cyA9IChhcHAuYXNzZXRzIHx8IFtdKS5tYXAoX21hcEFzc2V0cykuZmlsdGVyKHggPT4gISF4KTtcbiAgICAgIGJ1aWxkT3B0aW9ucy5zdHlsZXMgPSAoYXBwLnN0eWxlcyB8fCBbXSkubWFwKF9leHRyYUVudHJ5TWFwcGVyKTtcbiAgICAgIGJ1aWxkT3B0aW9ucy5zY3JpcHRzID0gKGFwcC5zY3JpcHRzIHx8IFtdKS5tYXAoX2V4dHJhRW50cnlNYXBwZXIpO1xuICAgICAgYXJjaGl0ZWN0LmJ1aWxkID0ge1xuICAgICAgICBidWlsZGVyOiBgJHtidWlsZGVyUGFja2FnZX06YnJvd3NlcmAsXG4gICAgICAgIG9wdGlvbnM6IGJ1aWxkT3B0aW9ucyxcbiAgICAgICAgY29uZmlndXJhdGlvbnM6IF9idWlsZENvbmZpZ3VyYXRpb25zKCksXG4gICAgICB9O1xuXG4gICAgICAvLyBTZXJ2ZSB0YXJnZXRcbiAgICAgIGNvbnN0IHNlcnZlT3B0aW9uczogSnNvbk9iamVjdCA9IHtcbiAgICAgICAgYnJvd3NlclRhcmdldDogYCR7bmFtZX06YnVpbGRgLFxuICAgICAgICAuLi5zZXJ2ZURlZmF1bHRzLFxuICAgICAgfTtcbiAgICAgIGFyY2hpdGVjdC5zZXJ2ZSA9IHtcbiAgICAgICAgYnVpbGRlcjogYCR7YnVpbGRlclBhY2thZ2V9OmRldi1zZXJ2ZXJgLFxuICAgICAgICBvcHRpb25zOiBzZXJ2ZU9wdGlvbnMsXG4gICAgICAgIGNvbmZpZ3VyYXRpb25zOiBfc2VydmVDb25maWd1cmF0aW9ucygpLFxuICAgICAgfTtcblxuICAgICAgLy8gRXh0cmFjdCB0YXJnZXRcbiAgICAgIGNvbnN0IGV4dHJhY3RJMThuT3B0aW9uczogSnNvbk9iamVjdCA9IHsgYnJvd3NlclRhcmdldDogYCR7bmFtZX06YnVpbGRgIH07XG4gICAgICBhcmNoaXRlY3RbJ2V4dHJhY3QtaTE4biddID0ge1xuICAgICAgICBidWlsZGVyOiBgJHtidWlsZGVyUGFja2FnZX06ZXh0cmFjdC1pMThuYCxcbiAgICAgICAgb3B0aW9uczogZXh0cmFjdEkxOG5PcHRpb25zLFxuICAgICAgfTtcblxuICAgICAgY29uc3Qga2FybWFDb25maWcgPSBjb25maWcudGVzdCAmJiBjb25maWcudGVzdC5rYXJtYVxuICAgICAgICAgID8gY29uZmlnLnRlc3Qua2FybWEuY29uZmlnIHx8ICcnXG4gICAgICAgICAgOiAnJztcbiAgICAgICAgLy8gVGVzdCB0YXJnZXRcbiAgICAgIGNvbnN0IHRlc3RPcHRpb25zOiBKc29uT2JqZWN0ID0ge1xuICAgICAgICAgIG1haW46IGFwcFJvb3QgKyAnLycgKyBhcHAudGVzdCB8fCBkZWZhdWx0cy50ZXN0LFxuICAgICAgICAgIC8vIE1ha2Uga2FybWFDb25maWcgcmVsYXRpdmUgdG8gcm9vdC5cbiAgICAgICAgICBrYXJtYUNvbmZpZyxcbiAgICAgICAgfTtcblxuICAgICAgaWYgKGFwcC5wb2x5ZmlsbHMpIHtcbiAgICAgICAgdGVzdE9wdGlvbnMucG9seWZpbGxzID0gYXBwUm9vdCArICcvJyArIGFwcC5wb2x5ZmlsbHM7XG4gICAgICB9XG5cbiAgICAgIGlmIChhcHAudGVzdFRzY29uZmlnKSB7XG4gICAgICAgICAgdGVzdE9wdGlvbnMudHNDb25maWcgPSBhcHBSb290ICsgJy8nICsgYXBwLnRlc3RUc2NvbmZpZztcbiAgICAgICAgfVxuICAgICAgdGVzdE9wdGlvbnMuc2NyaXB0cyA9IChhcHAuc2NyaXB0cyB8fCBbXSkubWFwKF9leHRyYUVudHJ5TWFwcGVyKTtcbiAgICAgIHRlc3RPcHRpb25zLnN0eWxlcyA9IChhcHAuc3R5bGVzIHx8IFtdKS5tYXAoX2V4dHJhRW50cnlNYXBwZXIpO1xuICAgICAgdGVzdE9wdGlvbnMuYXNzZXRzID0gKGFwcC5hc3NldHMgfHwgW10pLm1hcChfbWFwQXNzZXRzKS5maWx0ZXIoeCA9PiAhIXgpO1xuXG4gICAgICBpZiAoa2FybWFDb25maWcpIHtcbiAgICAgICAgYXJjaGl0ZWN0LnRlc3QgPSB7XG4gICAgICAgICAgYnVpbGRlcjogYCR7YnVpbGRlclBhY2thZ2V9Omthcm1hYCxcbiAgICAgICAgICBvcHRpb25zOiB0ZXN0T3B0aW9ucyxcbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgdHNDb25maWdzOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgY29uc3QgZXhjbHVkZXM6IHN0cmluZ1tdID0gW107XG4gICAgICBsZXQgd2FybkZvckxpbnQgPSBmYWxzZTtcbiAgICAgIGlmIChjb25maWcgJiYgY29uZmlnLmxpbnQgJiYgQXJyYXkuaXNBcnJheShjb25maWcubGludCkpIHtcbiAgICAgICAgY29uZmlnLmxpbnQuZm9yRWFjaChsaW50ID0+IHtcbiAgICAgICAgICBpZiAobGludC5wcm9qZWN0KSB7XG4gICAgICAgICAgICB0c0NvbmZpZ3MucHVzaChsaW50LnByb2plY3QpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB3YXJuRm9yTGludCA9IHRydWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKGxpbnQuZXhjbHVkZSkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBsaW50LmV4Y2x1ZGUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgIGV4Y2x1ZGVzLnB1c2gobGludC5leGNsdWRlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGxpbnQuZXhjbHVkZS5mb3JFYWNoKGV4ID0+IGV4Y2x1ZGVzLnB1c2goZXgpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBpZiAod2FybkZvckxpbnQpIHtcbiAgICAgICAgbG9nZ2VyLndhcm4oYFxuICAgICAgICAgIExpbnQgd2l0aG91dCAncHJvamVjdCcgd2FzIG5vdCBtaWdyYXRlZCB3aGljaCBpcyBub3Qgc3VwcG9ydGVkIGluIEFuZ3VsYXIgQ0xJIDYuXG4gICAgICAgIGApO1xuICAgICAgfVxuXG4gICAgICBjb25zdCByZW1vdmVEdXBlcyA9IChpdGVtczogc3RyaW5nW10pID0+IGl0ZW1zLnJlZHVjZSgobmV3SXRlbXMsIGl0ZW0pID0+IHtcbiAgICAgICAgaWYgKG5ld0l0ZW1zLmluZGV4T2YoaXRlbSkgPT09IC0xKSB7XG4gICAgICAgICAgbmV3SXRlbXMucHVzaChpdGVtKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBuZXdJdGVtcztcbiAgICAgIH0sIDxzdHJpbmdbXT4gW10pO1xuXG4gICAgICAgIC8vIFRzbGludCB0YXJnZXRcbiAgICAgIGNvbnN0IGxpbnRPcHRpb25zOiBKc29uT2JqZWN0ID0ge1xuICAgICAgICB0c0NvbmZpZzogcmVtb3ZlRHVwZXModHNDb25maWdzKS5maWx0ZXIodCA9PiB0LmluZGV4T2YoJ2UyZScpID09PSAtMSksXG4gICAgICAgIGV4Y2x1ZGU6IHJlbW92ZUR1cGVzKGV4Y2x1ZGVzKSxcbiAgICAgIH07XG4gICAgICBhcmNoaXRlY3QubGludCA9IHtcbiAgICAgICAgICBidWlsZGVyOiBgJHtidWlsZGVyUGFja2FnZX06dHNsaW50YCxcbiAgICAgICAgICBvcHRpb25zOiBsaW50T3B0aW9ucyxcbiAgICAgICAgfTtcblxuICAgICAgLy8gc2VydmVyIHRhcmdldFxuICAgICAgY29uc3Qgc2VydmVyQXBwID0gc2VydmVyQXBwc1xuICAgICAgICAuZmlsdGVyKHNlcnZlckFwcCA9PiBhcHAucm9vdCA9PT0gc2VydmVyQXBwLnJvb3QgJiYgYXBwLmluZGV4ID09PSBzZXJ2ZXJBcHAuaW5kZXgpWzBdO1xuXG4gICAgICBpZiAoc2VydmVyQXBwKSB7XG4gICAgICAgIGNvbnN0IHNlcnZlck9wdGlvbnM6IEpzb25PYmplY3QgPSB7XG4gICAgICAgICAgb3V0cHV0UGF0aDogc2VydmVyQXBwLm91dERpciB8fCBkZWZhdWx0cy5zZXJ2ZXJPdXREaXIsXG4gICAgICAgICAgbWFpbjogc2VydmVyQXBwLm1haW4gfHwgZGVmYXVsdHMuc2VydmVyTWFpbixcbiAgICAgICAgICB0c0NvbmZpZzogc2VydmVyQXBwLnRzY29uZmlnIHx8IGRlZmF1bHRzLnNlcnZlclRzQ29uZmlnLFxuICAgICAgICB9O1xuICAgICAgICBjb25zdCBzZXJ2ZXJUYXJnZXQ6IEpzb25PYmplY3QgPSB7XG4gICAgICAgICAgYnVpbGRlcjogJ0Bhbmd1bGFyLWRldmtpdC9idWlsZC1hbmd1bGFyOnNlcnZlcicsXG4gICAgICAgICAgb3B0aW9uczogc2VydmVyT3B0aW9ucyxcbiAgICAgICAgfTtcbiAgICAgICAgYXJjaGl0ZWN0LnNlcnZlciA9IHNlcnZlclRhcmdldDtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGUyZVByb2plY3Q6IEpzb25PYmplY3QgPSB7XG4gICAgICAgIHJvb3Q6IHByb2plY3Qucm9vdCxcbiAgICAgICAgc291cmNlUm9vdDogam9pbihwcm9qZWN0LnJvb3QgYXMgUGF0aCwgJ2UyZScpLFxuICAgICAgICBwcm9qZWN0VHlwZTogJ2FwcGxpY2F0aW9uJyxcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IGUyZUFyY2hpdGVjdDogSnNvbk9iamVjdCA9IHt9O1xuXG4gICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bWF4LWxpbmUtbGVuZ3RoXG4gICAgICBjb25zdCBwcm90cmFjdG9yQ29uZmlnID0gY29uZmlnICYmIGNvbmZpZy5lMmUgJiYgY29uZmlnLmUyZS5wcm90cmFjdG9yICYmIGNvbmZpZy5lMmUucHJvdHJhY3Rvci5jb25maWdcbiAgICAgICAgPyBjb25maWcuZTJlLnByb3RyYWN0b3IuY29uZmlnXG4gICAgICAgIDogJyc7XG4gICAgICBjb25zdCBlMmVPcHRpb25zOiBKc29uT2JqZWN0ID0ge1xuICAgICAgICBwcm90cmFjdG9yQ29uZmlnOiBwcm90cmFjdG9yQ29uZmlnLFxuICAgICAgICBkZXZTZXJ2ZXJUYXJnZXQ6IGAke25hbWV9OnNlcnZlYCxcbiAgICAgIH07XG4gICAgICBjb25zdCBlMmVUYXJnZXQ6IEpzb25PYmplY3QgPSB7XG4gICAgICAgIGJ1aWxkZXI6IGAke2J1aWxkZXJQYWNrYWdlfTpwcm90cmFjdG9yYCxcbiAgICAgICAgb3B0aW9uczogZTJlT3B0aW9ucyxcbiAgICAgIH07XG5cbiAgICAgIGUyZUFyY2hpdGVjdC5lMmUgPSBlMmVUYXJnZXQ7XG4gICAgICBjb25zdCBlMmVMaW50T3B0aW9uczogSnNvbk9iamVjdCA9IHtcbiAgICAgICAgdHNDb25maWc6IHJlbW92ZUR1cGVzKHRzQ29uZmlncykuZmlsdGVyKHQgPT4gdC5pbmRleE9mKCdlMmUnKSAhPT0gLTEpLFxuICAgICAgICBleGNsdWRlOiByZW1vdmVEdXBlcyhleGNsdWRlcyksXG4gICAgICB9O1xuICAgICAgY29uc3QgZTJlTGludFRhcmdldDogSnNvbk9iamVjdCA9IHtcbiAgICAgICAgYnVpbGRlcjogYCR7YnVpbGRlclBhY2thZ2V9OnRzbGludGAsXG4gICAgICAgIG9wdGlvbnM6IGUyZUxpbnRPcHRpb25zLFxuICAgICAgfTtcbiAgICAgIGUyZUFyY2hpdGVjdC5saW50ID0gZTJlTGludFRhcmdldDtcbiAgICAgIGlmIChwcm90cmFjdG9yQ29uZmlnKSB7XG4gICAgICAgIGUyZVByb2plY3QuYXJjaGl0ZWN0ID0gZTJlQXJjaGl0ZWN0O1xuICAgICAgfVxuXG4gICAgICByZXR1cm4geyBuYW1lLCBwcm9qZWN0LCBlMmVQcm9qZWN0IH07XG4gICAgfSlcbiAgICAucmVkdWNlKChwcm9qZWN0cywgbWFwcGVkQXBwKSA9PiB7XG4gICAgICBjb25zdCB7bmFtZSwgcHJvamVjdCwgZTJlUHJvamVjdH0gPSBtYXBwZWRBcHA7XG4gICAgICBwcm9qZWN0c1tuYW1lXSA9IHByb2plY3Q7XG4gICAgICBwcm9qZWN0c1tuYW1lICsgJy1lMmUnXSA9IGUyZVByb2plY3Q7XG5cbiAgICAgIHJldHVybiBwcm9qZWN0cztcbiAgICB9LCB7fSBhcyBKc29uT2JqZWN0KTtcblxuICByZXR1cm4gcHJvamVjdE1hcDtcbn1cblxuZnVuY3Rpb24gZ2V0RGVmYXVsdEFwcE5hbWVQcmVmaXgoY29uZmlnOiBDbGlDb25maWcpIHtcbiAgbGV0IGRlZmF1bHRBcHBOYW1lUHJlZml4ID0gJ2FwcCc7XG4gIGlmIChjb25maWcucHJvamVjdCAmJiBjb25maWcucHJvamVjdC5uYW1lKSB7XG4gICAgZGVmYXVsdEFwcE5hbWVQcmVmaXggPSBjb25maWcucHJvamVjdC5uYW1lO1xuICB9XG5cbiAgcmV0dXJuIGRlZmF1bHRBcHBOYW1lUHJlZml4O1xufVxuXG5mdW5jdGlvbiBleHRyYWN0RGVmYXVsdFByb2plY3QoY29uZmlnOiBDbGlDb25maWcpOiBzdHJpbmcgfCBudWxsIHtcbiAgaWYgKGNvbmZpZy5hcHBzICYmIGNvbmZpZy5hcHBzWzBdKSB7XG4gICAgY29uc3QgYXBwID0gY29uZmlnLmFwcHNbMF07XG4gICAgY29uc3QgZGVmYXVsdEFwcE5hbWUgPSBnZXREZWZhdWx0QXBwTmFtZVByZWZpeChjb25maWcpO1xuICAgIGNvbnN0IG5hbWUgPSBhcHAubmFtZSB8fCBkZWZhdWx0QXBwTmFtZTtcblxuICAgIHJldHVybiBuYW1lO1xuICB9XG5cbiAgcmV0dXJuIG51bGw7XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZVNwZWNUc0NvbmZpZyhjb25maWc6IENsaUNvbmZpZyk6IFJ1bGUge1xuICByZXR1cm4gKGhvc3Q6IFRyZWUsIGNvbnRleHQ6IFNjaGVtYXRpY0NvbnRleHQpID0+IHtcbiAgICBjb25zdCBhcHBzID0gY29uZmlnLmFwcHMgfHwgW107XG4gICAgYXBwcy5mb3JFYWNoKChhcHA6IEFwcENvbmZpZywgaWR4OiBudW1iZXIpID0+IHtcbiAgICAgIGNvbnN0IHRlc3RUc0NvbmZpZyA9IGFwcC50ZXN0VHNjb25maWcgfHwgZGVmYXVsdHMudGVzdFRzQ29uZmlnO1xuICAgICAgY29uc3QgdHNTcGVjQ29uZmlnUGF0aCA9IGpvaW4obm9ybWFsaXplKGFwcC5yb290IHx8ICcnKSwgdGVzdFRzQ29uZmlnKTtcbiAgICAgIGNvbnN0IGJ1ZmZlciA9IGhvc3QucmVhZCh0c1NwZWNDb25maWdQYXRoKTtcblxuICAgICAgaWYgKCFidWZmZXIpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG5cbiAgICAgIGNvbnN0IHRzQ2ZnQXN0ID0gcGFyc2VKc29uQXN0KGJ1ZmZlci50b1N0cmluZygpLCBKc29uUGFyc2VNb2RlLkxvb3NlKTtcbiAgICAgIGlmICh0c0NmZ0FzdC5raW5kICE9ICdvYmplY3QnKSB7XG4gICAgICAgIHRocm93IG5ldyBTY2hlbWF0aWNzRXhjZXB0aW9uKCdJbnZhbGlkIHRzY29uZmlnLiBXYXMgZXhwZWN0aW5nIGFuIG9iamVjdCcpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBmaWxlc0FzdE5vZGUgPSBmaW5kUHJvcGVydHlJbkFzdE9iamVjdCh0c0NmZ0FzdCwgJ2ZpbGVzJyk7XG4gICAgICBpZiAoZmlsZXNBc3ROb2RlICYmIGZpbGVzQXN0Tm9kZS5raW5kICE9ICdhcnJheScpIHtcbiAgICAgICAgdGhyb3cgbmV3IFNjaGVtYXRpY3NFeGNlcHRpb24oJ0ludmFsaWQgdHNjb25maWcgXCJmaWxlc1wiIHByb3BlcnR5OyBleHBlY3RlZCBhbiBhcnJheS4nKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgcmVjb3JkZXIgPSBob3N0LmJlZ2luVXBkYXRlKHRzU3BlY0NvbmZpZ1BhdGgpO1xuXG4gICAgICBjb25zdCBwb2x5ZmlsbHMgPSBhcHAucG9seWZpbGxzIHx8IGRlZmF1bHRzLnBvbHlmaWxscztcbiAgICAgIGlmICghZmlsZXNBc3ROb2RlKSB7XG4gICAgICAgIC8vIERvIG5vdGhpbmcgaWYgdGhlIGZpbGVzIGFycmF5IGRvZXMgbm90IGV4aXN0LiBUaGlzIG1lYW5zIGV4Y2x1ZGUgb3IgaW5jbHVkZSBhcmVcbiAgICAgICAgLy8gc2V0IGFuZCB3ZSBzaG91bGRuJ3QgbWVzcyB3aXRoIHRoYXQuXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoZmlsZXNBc3ROb2RlLnZhbHVlLmluZGV4T2YocG9seWZpbGxzKSA9PSAtMSkge1xuICAgICAgICAgIGFwcGVuZFZhbHVlSW5Bc3RBcnJheShyZWNvcmRlciwgZmlsZXNBc3ROb2RlLCBwb2x5ZmlsbHMpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGhvc3QuY29tbWl0VXBkYXRlKHJlY29yZGVyKTtcbiAgICB9KTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gdXBkYXRlUGFja2FnZUpzb24oY29uZmlnOiBDbGlDb25maWcpIHtcbiAgcmV0dXJuIChob3N0OiBUcmVlLCBjb250ZXh0OiBTY2hlbWF0aWNDb250ZXh0KSA9PiB7XG4gICAgY29uc3QgcGtnUGF0aCA9ICcvcGFja2FnZS5qc29uJztcbiAgICBjb25zdCBidWZmZXIgPSBob3N0LnJlYWQocGtnUGF0aCk7XG4gICAgaWYgKGJ1ZmZlciA9PSBudWxsKSB7XG4gICAgICB0aHJvdyBuZXcgU2NoZW1hdGljc0V4Y2VwdGlvbignQ291bGQgbm90IHJlYWQgcGFja2FnZS5qc29uJyk7XG4gICAgfVxuICAgIGNvbnN0IHBrZ0FzdCA9IHBhcnNlSnNvbkFzdChidWZmZXIudG9TdHJpbmcoKSwgSnNvblBhcnNlTW9kZS5TdHJpY3QpO1xuXG4gICAgaWYgKHBrZ0FzdC5raW5kICE9ICdvYmplY3QnKSB7XG4gICAgICB0aHJvdyBuZXcgU2NoZW1hdGljc0V4Y2VwdGlvbignRXJyb3IgcmVhZGluZyBwYWNrYWdlLmpzb24nKTtcbiAgICB9XG5cbiAgICBjb25zdCBkZXZEZXBlbmRlbmNpZXNOb2RlID0gZmluZFByb3BlcnR5SW5Bc3RPYmplY3QocGtnQXN0LCAnZGV2RGVwZW5kZW5jaWVzJyk7XG4gICAgaWYgKGRldkRlcGVuZGVuY2llc05vZGUgJiYgZGV2RGVwZW5kZW5jaWVzTm9kZS5raW5kICE9ICdvYmplY3QnKSB7XG4gICAgICB0aHJvdyBuZXcgU2NoZW1hdGljc0V4Y2VwdGlvbignRXJyb3IgcmVhZGluZyBwYWNrYWdlLmpzb247IGRldkRlcGVuZGVuY3kgaXMgbm90IGFuIG9iamVjdC4nKTtcbiAgICB9XG5cbiAgICBjb25zdCByZWNvcmRlciA9IGhvc3QuYmVnaW5VcGRhdGUocGtnUGF0aCk7XG4gICAgY29uc3QgZGVwTmFtZSA9ICdAYW5ndWxhci1kZXZraXQvYnVpbGQtYW5ndWxhcic7XG4gICAgaWYgKCFkZXZEZXBlbmRlbmNpZXNOb2RlKSB7XG4gICAgICAvLyBIYXZlbid0IGZvdW5kIHRoZSBkZXZEZXBlbmRlbmNpZXMga2V5LCBhZGQgaXQgdG8gdGhlIHJvb3Qgb2YgdGhlIHBhY2thZ2UuanNvbi5cbiAgICAgIGFwcGVuZFByb3BlcnR5SW5Bc3RPYmplY3QocmVjb3JkZXIsIHBrZ0FzdCwgJ2RldkRlcGVuZGVuY2llcycsIHtcbiAgICAgICAgW2RlcE5hbWVdOiBsYXRlc3RWZXJzaW9ucy5EZXZraXRCdWlsZEFuZ3VsYXIsXG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gQ2hlY2sgaWYgdGhlcmUncyBhIGJ1aWxkLWFuZ3VsYXIga2V5LlxuICAgICAgY29uc3QgYnVpbGRBbmd1bGFyTm9kZSA9IGZpbmRQcm9wZXJ0eUluQXN0T2JqZWN0KGRldkRlcGVuZGVuY2llc05vZGUsIGRlcE5hbWUpO1xuXG4gICAgICBpZiAoIWJ1aWxkQW5ndWxhck5vZGUpIHtcbiAgICAgICAgLy8gTm8gYnVpbGQtYW5ndWxhciBwYWNrYWdlLCBhZGQgaXQuXG4gICAgICAgIGFwcGVuZFByb3BlcnR5SW5Bc3RPYmplY3QoXG4gICAgICAgICAgcmVjb3JkZXIsXG4gICAgICAgICAgZGV2RGVwZW5kZW5jaWVzTm9kZSxcbiAgICAgICAgICBkZXBOYW1lLFxuICAgICAgICAgIGxhdGVzdFZlcnNpb25zLkRldmtpdEJ1aWxkQW5ndWxhcixcbiAgICAgICAgKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IHsgZW5kLCBzdGFydCB9ID0gYnVpbGRBbmd1bGFyTm9kZTtcbiAgICAgICAgcmVjb3JkZXIucmVtb3ZlKHN0YXJ0Lm9mZnNldCwgZW5kLm9mZnNldCAtIHN0YXJ0Lm9mZnNldCk7XG4gICAgICAgIHJlY29yZGVyLmluc2VydFJpZ2h0KHN0YXJ0Lm9mZnNldCwgSlNPTi5zdHJpbmdpZnkobGF0ZXN0VmVyc2lvbnMuRGV2a2l0QnVpbGRBbmd1bGFyKSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaG9zdC5jb21taXRVcGRhdGUocmVjb3JkZXIpO1xuXG4gICAgY29udGV4dC5hZGRUYXNrKG5ldyBOb2RlUGFja2FnZUluc3RhbGxUYXNrKHtcbiAgICAgIHBhY2thZ2VNYW5hZ2VyOiBjb25maWcucGFja2FnZU1hbmFnZXIgPT09ICdkZWZhdWx0JyA/IHVuZGVmaW5lZCA6IGNvbmZpZy5wYWNrYWdlTWFuYWdlcixcbiAgICB9KSk7XG5cbiAgICByZXR1cm4gaG9zdDtcbiAgfTtcbn1cblxuZnVuY3Rpb24gdXBkYXRlVHNMaW50Q29uZmlnKCk6IFJ1bGUge1xuICByZXR1cm4gKGhvc3Q6IFRyZWUsIGNvbnRleHQ6IFNjaGVtYXRpY0NvbnRleHQpID0+IHtcbiAgICBjb25zdCB0c0xpbnRQYXRoID0gJy90c2xpbnQuanNvbic7XG4gICAgY29uc3QgYnVmZmVyID0gaG9zdC5yZWFkKHRzTGludFBhdGgpO1xuICAgIGlmICghYnVmZmVyKSB7XG4gICAgICByZXR1cm4gaG9zdDtcbiAgICB9XG4gICAgY29uc3QgdHNDZmdBc3QgPSBwYXJzZUpzb25Bc3QoYnVmZmVyLnRvU3RyaW5nKCksIEpzb25QYXJzZU1vZGUuTG9vc2UpO1xuXG4gICAgaWYgKHRzQ2ZnQXN0LmtpbmQgIT0gJ29iamVjdCcpIHtcbiAgICAgIHJldHVybiBob3N0O1xuICAgIH1cblxuICAgIGNvbnN0IHJ1bGVzTm9kZSA9IGZpbmRQcm9wZXJ0eUluQXN0T2JqZWN0KHRzQ2ZnQXN0LCAncnVsZXMnKTtcbiAgICBpZiAoIXJ1bGVzTm9kZSB8fCBydWxlc05vZGUua2luZCAhPSAnb2JqZWN0Jykge1xuICAgICAgcmV0dXJuIGhvc3Q7XG4gICAgfVxuXG4gICAgY29uc3QgaW1wb3J0QmxhY2tsaXN0Tm9kZSA9IGZpbmRQcm9wZXJ0eUluQXN0T2JqZWN0KHJ1bGVzTm9kZSwgJ2ltcG9ydC1ibGFja2xpc3QnKTtcbiAgICBpZiAoIWltcG9ydEJsYWNrbGlzdE5vZGUgfHwgaW1wb3J0QmxhY2tsaXN0Tm9kZS5raW5kICE9ICdhcnJheScpIHtcbiAgICAgIHJldHVybiBob3N0O1xuICAgIH1cblxuICAgIGNvbnN0IHJlY29yZGVyID0gaG9zdC5iZWdpblVwZGF0ZSh0c0xpbnRQYXRoKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGltcG9ydEJsYWNrbGlzdE5vZGUuZWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGVsZW1lbnQgPSBpbXBvcnRCbGFja2xpc3ROb2RlLmVsZW1lbnRzW2ldO1xuICAgICAgaWYgKGVsZW1lbnQua2luZCA9PSAnc3RyaW5nJyAmJiBlbGVtZW50LnZhbHVlID09ICdyeGpzJykge1xuICAgICAgICBjb25zdCB7IHN0YXJ0LCBlbmQgfSA9IGVsZW1lbnQ7XG4gICAgICAgIC8vIFJlbW92ZSB0aGlzIGVsZW1lbnQuXG4gICAgICAgIGlmIChpID09IGltcG9ydEJsYWNrbGlzdE5vZGUuZWxlbWVudHMubGVuZ3RoIC0gMSkge1xuICAgICAgICAgIC8vIExhc3QgZWxlbWVudC5cbiAgICAgICAgICBpZiAoaSA+IDApIHtcbiAgICAgICAgICAgIC8vIE5vdCBmaXJzdCwgdGhlcmUncyBhIGNvbW1hIHRvIHJlbW92ZSBiZWZvcmUuXG4gICAgICAgICAgICBjb25zdCBwcmV2aW91cyA9IGltcG9ydEJsYWNrbGlzdE5vZGUuZWxlbWVudHNbaSAtIDFdO1xuICAgICAgICAgICAgcmVjb3JkZXIucmVtb3ZlKHByZXZpb3VzLmVuZC5vZmZzZXQsIGVuZC5vZmZzZXQgLSBwcmV2aW91cy5lbmQub2Zmc2V0KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gT25seSBlbGVtZW50LCBqdXN0IHJlbW92ZSB0aGUgd2hvbGUgcnVsZS5cbiAgICAgICAgICAgIGNvbnN0IHsgc3RhcnQsIGVuZCB9ID0gaW1wb3J0QmxhY2tsaXN0Tm9kZTtcbiAgICAgICAgICAgIHJlY29yZGVyLnJlbW92ZShzdGFydC5vZmZzZXQsIGVuZC5vZmZzZXQgLSBzdGFydC5vZmZzZXQpO1xuICAgICAgICAgICAgcmVjb3JkZXIuaW5zZXJ0TGVmdChzdGFydC5vZmZzZXQsICdbXScpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBNaWRkbGUsIGp1c3QgcmVtb3ZlIHRoZSB3aG9sZSBub2RlICh1cCB0byBuZXh0IG5vZGUgc3RhcnQpLlxuICAgICAgICAgIGNvbnN0IG5leHQgPSBpbXBvcnRCbGFja2xpc3ROb2RlLmVsZW1lbnRzW2kgKyAxXTtcbiAgICAgICAgICByZWNvcmRlci5yZW1vdmUoc3RhcnQub2Zmc2V0LCBuZXh0LnN0YXJ0Lm9mZnNldCAtIHN0YXJ0Lm9mZnNldCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBob3N0LmNvbW1pdFVwZGF0ZShyZWNvcmRlcik7XG5cbiAgICByZXR1cm4gaG9zdDtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gKCk6IFJ1bGUge1xuICByZXR1cm4gKGhvc3Q6IFRyZWUsIGNvbnRleHQ6IFNjaGVtYXRpY0NvbnRleHQpID0+IHtcbiAgICBpZiAoaG9zdC5leGlzdHMoJy8uYW5ndWxhci5qc29uJykgfHwgaG9zdC5leGlzdHMoJy9hbmd1bGFyLmpzb24nKSkge1xuICAgICAgY29udGV4dC5sb2dnZXIuaW5mbygnRm91bmQgYSBtb2Rlcm4gY29uZmlndXJhdGlvbiBmaWxlLiBOb3RoaW5nIHRvIGJlIGRvbmUuJyk7XG5cbiAgICAgIHJldHVybiBob3N0O1xuICAgIH1cblxuICAgIGNvbnN0IGNvbmZpZ1BhdGggPSBnZXRDb25maWdQYXRoKGhvc3QpO1xuICAgIGNvbnN0IGNvbmZpZ0J1ZmZlciA9IGhvc3QucmVhZChub3JtYWxpemUoY29uZmlnUGF0aCkpO1xuICAgIGlmIChjb25maWdCdWZmZXIgPT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IFNjaGVtYXRpY3NFeGNlcHRpb24oYENvdWxkIG5vdCBmaW5kIGNvbmZpZ3VyYXRpb24gZmlsZSAoJHtjb25maWdQYXRofSlgKTtcbiAgICB9XG4gICAgY29uc3QgY29uZmlnID0gcGFyc2VKc29uKGNvbmZpZ0J1ZmZlci50b1N0cmluZygpLCBKc29uUGFyc2VNb2RlLkxvb3NlKTtcblxuICAgIGlmICh0eXBlb2YgY29uZmlnICE9ICdvYmplY3QnIHx8IEFycmF5LmlzQXJyYXkoY29uZmlnKSB8fCBjb25maWcgPT09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBTY2hlbWF0aWNzRXhjZXB0aW9uKCdJbnZhbGlkIGFuZ3VsYXItY2xpLmpzb24gY29uZmlndXJhdGlvbjsgZXhwZWN0ZWQgYW4gb2JqZWN0LicpO1xuICAgIH1cblxuICAgIHJldHVybiBjaGFpbihbXG4gICAgICBtaWdyYXRlS2FybWFDb25maWd1cmF0aW9uKGNvbmZpZyksXG4gICAgICBtaWdyYXRlQ29uZmlndXJhdGlvbihjb25maWcsIGNvbnRleHQubG9nZ2VyKSxcbiAgICAgIHVwZGF0ZVNwZWNUc0NvbmZpZyhjb25maWcpLFxuICAgICAgdXBkYXRlUGFja2FnZUpzb24oY29uZmlnKSxcbiAgICAgIHVwZGF0ZVRzTGludENvbmZpZygpLFxuICAgICAgKGhvc3Q6IFRyZWUsIGNvbnRleHQ6IFNjaGVtYXRpY0NvbnRleHQpID0+IHtcbiAgICAgICAgY29udGV4dC5sb2dnZXIud2Fybih0YWdzLm9uZUxpbmVgU29tZSBjb25maWd1cmF0aW9uIG9wdGlvbnMgaGF2ZSBiZWVuIGNoYW5nZWQsXG4gICAgICAgICAgcGxlYXNlIG1ha2Ugc3VyZSB0byB1cGRhdGUgYW55IG5wbSBzY3JpcHRzIHdoaWNoIHlvdSBtYXkgaGF2ZSBtb2RpZmllZC5gKTtcblxuICAgICAgICByZXR1cm4gaG9zdDtcbiAgICAgIH0sXG4gICAgXSk7XG4gIH07XG59XG4iXX0=