"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schematics_1 = require("@angular-devkit/schematics");
const testing_1 = require("@angular-devkit/schematics/testing");
const path = require("path");
const latest_versions_1 = require("../../utility/latest-versions");
describe('Migration to v6', () => {
    const schematicRunner = new testing_1.SchematicTestRunner('migrations', path.join(__dirname, '../migration-collection.json'));
    // tslint:disable-next-line:no-any
    let baseConfig;
    const defaultOptions = {};
    let tree;
    const oldConfigPath = `/.angular-cli.json`;
    const configPath = `/angular.json`;
    beforeEach(() => {
        baseConfig = {
            schema: './node_modules/@angular/cli/lib/config/schema.json',
            project: {
                name: 'foo',
            },
            apps: [
                {
                    root: 'src',
                    outDir: 'dist',
                    assets: [
                        'assets',
                        'favicon.ico',
                        { glob: '**/*', input: './assets/', output: './assets/' },
                        { glob: 'favicon.ico', input: './', output: './' },
                        {
                            'glob': '**/*.*',
                            'input': '../server/',
                            'output': '../',
                            'allowOutsideOutDir': true,
                        },
                    ],
                    index: 'index.html',
                    main: 'main.ts',
                    polyfills: 'polyfills.ts',
                    test: 'test.ts',
                    tsconfig: 'tsconfig.app.json',
                    testTsconfig: 'tsconfig.spec.json',
                    prefix: 'app',
                    styles: [
                        'styles.css',
                    ],
                    stylePreprocessorOptions: {
                        includePaths: [
                            'styleInc',
                        ],
                    },
                    scripts: [],
                    environmentSource: 'environments/environment.ts',
                    environments: {
                        dev: 'environments/environment.ts',
                        prod: 'environments/environment.prod.ts',
                    },
                },
            ],
            e2e: {
                protractor: {
                    config: './protractor.conf.js',
                },
            },
            lint: [
                {
                    project: 'src/tsconfig.app.json',
                    exclude: '**/node_modules/**',
                },
                {
                    project: 'src/tsconfig.spec.json',
                    exclude: '**/node_modules/**',
                },
                {
                    project: 'e2e/tsconfig.e2e.json',
                    exclude: '**/node_modules/**',
                },
            ],
            test: {
                karma: {
                    config: './karma.conf.js',
                },
            },
            defaults: {
                styleExt: 'css',
                build: {
                    namedChunks: true,
                },
                serve: {
                    port: 8080,
                },
            },
        };
        tree = new testing_1.UnitTestTree(new schematics_1.EmptyTree());
        const packageJson = {
            devDependencies: {},
        };
        tree.create('/package.json', JSON.stringify(packageJson, null, 2));
        // Create a prod environment.
        tree.create('/src/environments/environment.prod.ts', `
      export const environment = {
        production: true
      };
    `);
        tree.create('/src/favicon.ico', '');
    });
    // tslint:disable-next-line:no-any
    function getConfig(tree) {
        return JSON.parse(tree.readContent(configPath));
    }
    describe('file creation/deletion', () => {
        it('should delete the old config file', () => {
            tree.create(oldConfigPath, JSON.stringify(baseConfig, null, 2));
            tree = schematicRunner.runSchematic('migration-01', defaultOptions, tree);
            expect(tree.exists(oldConfigPath)).toEqual(false);
        });
        it('should create the new config file', () => {
            tree.create(oldConfigPath, JSON.stringify(baseConfig, null, 2));
            tree = schematicRunner.runSchematic('migration-01', defaultOptions, tree);
            expect(tree.exists(configPath)).toEqual(true);
        });
    });
    describe('config file contents', () => {
        it('should set root values', () => {
            tree.create(oldConfigPath, JSON.stringify(baseConfig, null, 2));
            tree = schematicRunner.runSchematic('migration-01', defaultOptions, tree);
            const config = getConfig(tree);
            expect(config.version).toEqual(1);
            expect(config.newProjectRoot).toEqual('projects');
            expect(config.defaultProject).toEqual('foo');
        });
        describe('schematics', () => {
            it('should define schematics collection root', () => {
                tree.create(oldConfigPath, JSON.stringify(baseConfig, null, 2));
                tree = schematicRunner.runSchematic('migration-01', defaultOptions, tree);
                const config = getConfig(tree);
                expect(config.schematics['@schematics/angular:component']).toBeDefined();
            });
            function getSchematicConfig(host, name) {
                return getConfig(host).schematics['@schematics/angular:' + name];
            }
            describe('component config', () => {
                it('should move prefix', () => {
                    tree.create(oldConfigPath, JSON.stringify(baseConfig, null, 2));
                    tree = schematicRunner.runSchematic('migration-01', defaultOptions, tree);
                    const config = getSchematicConfig(tree, 'component');
                    expect(config.prefix).toEqual('app');
                });
                it('should move styleExt to component', () => {
                    tree.create(oldConfigPath, JSON.stringify(baseConfig, null, 2));
                    tree = schematicRunner.runSchematic('migration-01', defaultOptions, tree);
                    const config = getSchematicConfig(tree, 'component');
                    expect(config.styleext).toEqual('css');
                });
                it('should move inlineStyle', () => {
                    baseConfig.defaults.component = { inlineStyle: true };
                    tree.create(oldConfigPath, JSON.stringify(baseConfig, null, 2));
                    tree = schematicRunner.runSchematic('migration-01', defaultOptions, tree);
                    const config = getSchematicConfig(tree, 'component');
                    expect(config.inlineStyle).toEqual(true);
                });
                it('should not move inlineStyle if not defined', () => {
                    tree.create(oldConfigPath, JSON.stringify(baseConfig, null, 2));
                    tree = schematicRunner.runSchematic('migration-01', defaultOptions, tree);
                    const config = getSchematicConfig(tree, 'component');
                    expect(config.inlineStyle).toBeUndefined();
                });
                it('should move inlineTemplate', () => {
                    baseConfig.defaults.component = { inlineTemplate: true };
                    tree.create(oldConfigPath, JSON.stringify(baseConfig, null, 2));
                    tree = schematicRunner.runSchematic('migration-01', defaultOptions, tree);
                    const config = getSchematicConfig(tree, 'component');
                    expect(config.inlineTemplate).toEqual(true);
                });
                it('should not move inlineTemplate if not defined', () => {
                    tree.create(oldConfigPath, JSON.stringify(baseConfig, null, 2));
                    tree = schematicRunner.runSchematic('migration-01', defaultOptions, tree);
                    const config = getSchematicConfig(tree, 'component');
                    expect(config.inlineTemplate).toBeUndefined();
                });
                it('should move flat', () => {
                    baseConfig.defaults.component = { flat: true };
                    tree.create(oldConfigPath, JSON.stringify(baseConfig, null, 2));
                    tree = schematicRunner.runSchematic('migration-01', defaultOptions, tree);
                    const config = getSchematicConfig(tree, 'component');
                    expect(config.flat).toEqual(true);
                });
                it('should not move flat if not defined', () => {
                    tree.create(oldConfigPath, JSON.stringify(baseConfig, null, 2));
                    tree = schematicRunner.runSchematic('migration-01', defaultOptions, tree);
                    const config = getSchematicConfig(tree, 'component');
                    expect(config.flat).toBeUndefined();
                });
                it('should move spec', () => {
                    baseConfig.defaults.component = { spec: true };
                    tree.create(oldConfigPath, JSON.stringify(baseConfig, null, 2));
                    tree = schematicRunner.runSchematic('migration-01', defaultOptions, tree);
                    const config = getSchematicConfig(tree, 'component');
                    expect(config.spec).toEqual(true);
                });
                it('should not move spec if not defined', () => {
                    tree.create(oldConfigPath, JSON.stringify(baseConfig, null, 2));
                    tree = schematicRunner.runSchematic('migration-01', defaultOptions, tree);
                    const config = getSchematicConfig(tree, 'component');
                    expect(config.spec).toBeUndefined();
                });
                it('should move viewEncapsulation', () => {
                    baseConfig.defaults.component = { viewEncapsulation: 'Native' };
                    tree.create(oldConfigPath, JSON.stringify(baseConfig, null, 2));
                    tree = schematicRunner.runSchematic('migration-01', defaultOptions, tree);
                    const config = getSchematicConfig(tree, 'component');
                    expect(config.viewEncapsulation).toEqual('Native');
                });
                it('should not move viewEncapsulation if not defined', () => {
                    tree.create(oldConfigPath, JSON.stringify(baseConfig, null, 2));
                    tree = schematicRunner.runSchematic('migration-01', defaultOptions, tree);
                    const config = getSchematicConfig(tree, 'component');
                    expect(config.viewEncapsulation).toBeUndefined();
                });
                it('should move changeDetection', () => {
                    baseConfig.defaults.component = { changeDetection: 'OnPush' };
                    tree.create(oldConfigPath, JSON.stringify(baseConfig, null, 2));
                    tree = schematicRunner.runSchematic('migration-01', defaultOptions, tree);
                    const config = getSchematicConfig(tree, 'component');
                    expect(config.changeDetection).toEqual('OnPush');
                });
                it('should not move changeDetection if not defined', () => {
                    tree.create(oldConfigPath, JSON.stringify(baseConfig, null, 2));
                    tree = schematicRunner.runSchematic('migration-01', defaultOptions, tree);
                    const config = getSchematicConfig(tree, 'component');
                    expect(config.changeDetection).toBeUndefined();
                });
            });
            describe('directive config', () => {
                it('should move prefix', () => {
                    tree.create(oldConfigPath, JSON.stringify(baseConfig, null, 2));
                    tree = schematicRunner.runSchematic('migration-01', defaultOptions, tree);
                    const config = getSchematicConfig(tree, 'directive');
                    expect(config.prefix).toEqual('app');
                });
                it('should move flat', () => {
                    baseConfig.defaults.directive = { flat: true };
                    tree.create(oldConfigPath, JSON.stringify(baseConfig, null, 2));
                    tree = schematicRunner.runSchematic('migration-01', defaultOptions, tree);
                    const config = getSchematicConfig(tree, 'directive');
                    expect(config.flat).toEqual(true);
                });
                it('should not move flat if not defined', () => {
                    tree.create(oldConfigPath, JSON.stringify(baseConfig, null, 2));
                    tree = schematicRunner.runSchematic('migration-01', defaultOptions, tree);
                    const config = getSchematicConfig(tree, 'directive');
                    expect(config.flat).toBeUndefined();
                });
                it('should move spec', () => {
                    baseConfig.defaults.directive = { spec: true };
                    tree.create(oldConfigPath, JSON.stringify(baseConfig, null, 2));
                    tree = schematicRunner.runSchematic('migration-01', defaultOptions, tree);
                    const config = getSchematicConfig(tree, 'directive');
                    expect(config.spec).toEqual(true);
                });
                it('should not move spec if not defined', () => {
                    tree.create(oldConfigPath, JSON.stringify(baseConfig, null, 2));
                    tree = schematicRunner.runSchematic('migration-01', defaultOptions, tree);
                    const config = getSchematicConfig(tree, 'directive');
                    expect(config.spec).toBeUndefined();
                });
            });
            describe('class config', () => {
                it('should move spec', () => {
                    baseConfig.defaults.class = { spec: true };
                    tree.create(oldConfigPath, JSON.stringify(baseConfig, null, 2));
                    tree = schematicRunner.runSchematic('migration-01', defaultOptions, tree);
                    const config = getSchematicConfig(tree, 'class');
                    expect(config.spec).toEqual(true);
                });
                it('should not move spec if not defined', () => {
                    tree.create(oldConfigPath, JSON.stringify(baseConfig, null, 2));
                    tree = schematicRunner.runSchematic('migration-01', defaultOptions, tree);
                    const config = getSchematicConfig(tree, 'class');
                    expect(config).toBeUndefined();
                });
            });
            describe('guard config', () => {
                it('should move flat', () => {
                    baseConfig.defaults.guard = { flat: true };
                    tree.create(oldConfigPath, JSON.stringify(baseConfig, null, 2));
                    tree = schematicRunner.runSchematic('migration-01', defaultOptions, tree);
                    const config = getSchematicConfig(tree, 'guard');
                    expect(config.flat).toEqual(true);
                });
                it('should not move flat if not defined', () => {
                    tree.create(oldConfigPath, JSON.stringify(baseConfig, null, 2));
                    tree = schematicRunner.runSchematic('migration-01', defaultOptions, tree);
                    const config = getSchematicConfig(tree, 'guard');
                    expect(config).toBeUndefined();
                });
                it('should move spec', () => {
                    baseConfig.defaults.guard = { spec: true };
                    tree.create(oldConfigPath, JSON.stringify(baseConfig, null, 2));
                    tree = schematicRunner.runSchematic('migration-01', defaultOptions, tree);
                    const config = getSchematicConfig(tree, 'guard');
                    expect(config.spec).toEqual(true);
                });
                it('should not move spec if not defined', () => {
                    tree.create(oldConfigPath, JSON.stringify(baseConfig, null, 2));
                    tree = schematicRunner.runSchematic('migration-01', defaultOptions, tree);
                    const config = getSchematicConfig(tree, 'guard');
                    expect(config).toBeUndefined();
                });
            });
            describe('interface config', () => {
                it('should move flat', () => {
                    baseConfig.defaults.interface = { prefix: 'I' };
                    tree.create(oldConfigPath, JSON.stringify(baseConfig, null, 2));
                    tree = schematicRunner.runSchematic('migration-01', defaultOptions, tree);
                    const config = getSchematicConfig(tree, 'interface');
                    expect(config.prefix).toEqual('I');
                });
                it('should not move flat if not defined', () => {
                    tree.create(oldConfigPath, JSON.stringify(baseConfig, null, 2));
                    tree = schematicRunner.runSchematic('migration-01', defaultOptions, tree);
                    const config = getSchematicConfig(tree, 'interface');
                    expect(config).toBeUndefined();
                });
            });
            describe('module config', () => {
                it('should move flat', () => {
                    baseConfig.defaults.module = { flat: true };
                    tree.create(oldConfigPath, JSON.stringify(baseConfig, null, 2));
                    tree = schematicRunner.runSchematic('migration-01', defaultOptions, tree);
                    const config = getSchematicConfig(tree, 'module');
                    expect(config.flat).toEqual(true);
                });
                it('should not move flat if not defined', () => {
                    tree.create(oldConfigPath, JSON.stringify(baseConfig, null, 2));
                    tree = schematicRunner.runSchematic('migration-01', defaultOptions, tree);
                    const config = getSchematicConfig(tree, 'module');
                    expect(config).toBeUndefined();
                });
                it('should move spec', () => {
                    baseConfig.defaults.module = { spec: true };
                    tree.create(oldConfigPath, JSON.stringify(baseConfig, null, 2));
                    tree = schematicRunner.runSchematic('migration-01', defaultOptions, tree);
                    const config = getSchematicConfig(tree, 'module');
                    expect(config.spec).toEqual(true);
                });
                it('should not move spec if not defined', () => {
                    tree.create(oldConfigPath, JSON.stringify(baseConfig, null, 2));
                    tree = schematicRunner.runSchematic('migration-01', defaultOptions, tree);
                    const config = getSchematicConfig(tree, 'module');
                    expect(config).toBeUndefined();
                });
            });
            describe('pipe config', () => {
                it('should move flat', () => {
                    baseConfig.defaults.pipe = { flat: true };
                    tree.create(oldConfigPath, JSON.stringify(baseConfig, null, 2));
                    tree = schematicRunner.runSchematic('migration-01', defaultOptions, tree);
                    const config = getSchematicConfig(tree, 'pipe');
                    expect(config.flat).toEqual(true);
                });
                it('should not move flat if not defined', () => {
                    tree.create(oldConfigPath, JSON.stringify(baseConfig, null, 2));
                    tree = schematicRunner.runSchematic('migration-01', defaultOptions, tree);
                    const config = getSchematicConfig(tree, 'pipe');
                    expect(config).toBeUndefined();
                });
                it('should move spec', () => {
                    baseConfig.defaults.pipe = { spec: true };
                    tree.create(oldConfigPath, JSON.stringify(baseConfig, null, 2));
                    tree = schematicRunner.runSchematic('migration-01', defaultOptions, tree);
                    const config = getSchematicConfig(tree, 'pipe');
                    expect(config.spec).toEqual(true);
                });
                it('should not move spec if not defined', () => {
                    tree.create(oldConfigPath, JSON.stringify(baseConfig, null, 2));
                    tree = schematicRunner.runSchematic('migration-01', defaultOptions, tree);
                    const config = getSchematicConfig(tree, 'pipe');
                    expect(config).toBeUndefined();
                });
            });
            describe('service config', () => {
                it('should move flat', () => {
                    baseConfig.defaults.service = { flat: true };
                    tree.create(oldConfigPath, JSON.stringify(baseConfig, null, 2));
                    tree = schematicRunner.runSchematic('migration-01', defaultOptions, tree);
                    const config = getSchematicConfig(tree, 'service');
                    expect(config.flat).toEqual(true);
                });
                it('should not move flat if not defined', () => {
                    tree.create(oldConfigPath, JSON.stringify(baseConfig, null, 2));
                    tree = schematicRunner.runSchematic('migration-01', defaultOptions, tree);
                    const config = getSchematicConfig(tree, 'service');
                    expect(config).toBeUndefined();
                });
                it('should move spec', () => {
                    baseConfig.defaults.service = { spec: true };
                    tree.create(oldConfigPath, JSON.stringify(baseConfig, null, 2));
                    tree = schematicRunner.runSchematic('migration-01', defaultOptions, tree);
                    const config = getSchematicConfig(tree, 'service');
                    expect(config.spec).toEqual(true);
                });
                it('should not move spec if not defined', () => {
                    tree.create(oldConfigPath, JSON.stringify(baseConfig, null, 2));
                    tree = schematicRunner.runSchematic('migration-01', defaultOptions, tree);
                    const config = getSchematicConfig(tree, 'service');
                    expect(config).toBeUndefined();
                });
            });
        });
        describe('architect', () => {
            it('should exist', () => {
                tree.create(oldConfigPath, JSON.stringify(baseConfig, null, 2));
                tree = schematicRunner.runSchematic('migration-01', defaultOptions, tree);
                const config = getConfig(tree);
                expect(config.architect).not.toBeDefined();
            });
        });
        describe('app projects', () => {
            it('should create two projects per app', () => {
                tree.create(oldConfigPath, JSON.stringify(baseConfig, null, 2));
                tree = schematicRunner.runSchematic('migration-01', defaultOptions, tree);
                const config = getConfig(tree);
                expect(Object.keys(config.projects).length).toEqual(2);
            });
            it('should create two projects per app', () => {
                baseConfig.apps.push(baseConfig.apps[0]);
                tree.create(oldConfigPath, JSON.stringify(baseConfig, null, 2));
                tree = schematicRunner.runSchematic('migration-01', defaultOptions, tree);
                const config = getConfig(tree);
                expect(Object.keys(config.projects).length).toEqual(4);
            });
            it('should use the app name if defined', () => {
                baseConfig.apps[0].name = 'foo';
                baseConfig.apps.push(baseConfig.apps[0]);
                tree.create(oldConfigPath, JSON.stringify(baseConfig, null, 2));
                tree = schematicRunner.runSchematic('migration-01', defaultOptions, tree);
                const config = getConfig(tree);
                expect(config.projects.foo).toBeDefined();
                expect(config.projects['foo-e2e']).toBeDefined();
            });
            it('should set the project root values', () => {
                tree.create(oldConfigPath, JSON.stringify(baseConfig, null, 2));
                tree = schematicRunner.runSchematic('migration-01', defaultOptions, tree);
                const project = getConfig(tree).projects.foo;
                expect(project.root).toEqual('');
                expect(project.sourceRoot).toEqual('src');
                expect(project.projectType).toEqual('application');
            });
            it('should set the project root values for a different root', () => {
                baseConfig.apps[0].root = 'apps/app1/src';
                tree.create(oldConfigPath, JSON.stringify(baseConfig, null, 2));
                tree = schematicRunner.runSchematic('migration-01', defaultOptions, tree);
                const project = getConfig(tree).projects.foo;
                expect(project.root).toEqual('apps/app1');
                expect(project.sourceRoot).toEqual('apps/app1/src');
                expect(project.projectType).toEqual('application');
            });
            it('should set build target', () => {
                tree.create(oldConfigPath, JSON.stringify(baseConfig, null, 2));
                tree = schematicRunner.runSchematic('migration-01', defaultOptions, tree);
                const build = getConfig(tree).projects.foo.architect.build;
                expect(build.builder).toEqual('@angular-devkit/build-angular:browser');
                expect(build.options.scripts).toEqual([]);
                expect(build.options.styles).toEqual(['src/styles.css']);
                expect(build.options.stylePreprocessorOptions).toEqual({ includePaths: ['src/styleInc'] });
                expect(build.options.assets).toEqual([
                    'src/assets',
                    'src/favicon.ico',
                    { glob: '**/*', input: 'src/assets', output: '/assets' },
                    { glob: 'favicon.ico', input: 'src', output: '/' },
                ]);
                expect(build.options.namedChunks).toEqual(true);
                expect(build.configurations).toEqual({
                    production: {
                        optimization: true,
                        outputHashing: 'all',
                        sourceMap: false,
                        extractCss: true,
                        namedChunks: false,
                        aot: true,
                        extractLicenses: true,
                        vendorChunk: false,
                        buildOptimizer: true,
                        fileReplacements: [{
                                replace: 'src/environments/environment.ts',
                                with: 'src/environments/environment.prod.ts',
                            }],
                    },
                });
            });
            it('should not set baseHref on build & serve targets if not defined', () => {
                tree.create(oldConfigPath, JSON.stringify(baseConfig, null, 2));
                tree = schematicRunner.runSchematic('migration-01', defaultOptions, tree);
                const build = getConfig(tree).projects.foo.architect.build;
                expect(build.options.baseHref).toBeUndefined();
            });
            it('should set baseHref on build & serve targets if defined', () => {
                const config = Object.assign({}, baseConfig);
                config.apps[0].baseHref = '/base/href/';
                tree.create(oldConfigPath, JSON.stringify(config, null, 2));
                tree = schematicRunner.runSchematic('migration-01', defaultOptions, tree);
                const build = getConfig(tree).projects.foo.architect.build;
                expect(build.options.baseHref).toEqual('/base/href/');
            });
            it('should add serviceWorker to production configuration', () => {
                baseConfig.apps[0].serviceWorker = true;
                tree.create(oldConfigPath, JSON.stringify(baseConfig, null, 2));
                tree = schematicRunner.runSchematic('migration-01', defaultOptions, tree);
                const config = getConfig(tree);
                expect(config.projects.foo.architect.build.options.serviceWorker).toBeUndefined();
                expect(config.projects.foo.architect.build.configurations.production.serviceWorker).toBe(true);
            });
            it('should set the serve target', () => {
                tree.create(oldConfigPath, JSON.stringify(baseConfig, null, 2));
                tree = schematicRunner.runSchematic('migration-01', defaultOptions, tree);
                const serve = getConfig(tree).projects.foo.architect.serve;
                expect(serve.builder).toEqual('@angular-devkit/build-angular:dev-server');
                expect(serve.options).toEqual({
                    browserTarget: 'foo:build',
                    port: 8080,
                });
                const prodConfig = serve.configurations.production;
                expect(prodConfig.browserTarget).toEqual('foo:build:production');
            });
            it('should set the test target', () => {
                tree.create(oldConfigPath, JSON.stringify(baseConfig, null, 2));
                tree = schematicRunner.runSchematic('migration-01', defaultOptions, tree);
                const test = getConfig(tree).projects.foo.architect['test'];
                expect(test.builder).toEqual('@angular-devkit/build-angular:karma');
                expect(test.options.main).toEqual('src/test.ts');
                expect(test.options.polyfills).toEqual('src/polyfills.ts');
                expect(test.options.tsConfig).toEqual('src/tsconfig.spec.json');
                expect(test.options.karmaConfig).toEqual('./karma.conf.js');
                expect(test.options.scripts).toEqual([]);
                expect(test.options.styles).toEqual(['src/styles.css']);
                expect(test.options.assets).toEqual([
                    'src/assets',
                    'src/favicon.ico',
                    { glob: '**/*', input: 'src/assets', output: '/assets' },
                    { glob: 'favicon.ico', input: 'src', output: '/' },
                ]);
            });
            it('should set the extract i18n target', () => {
                tree.create(oldConfigPath, JSON.stringify(baseConfig, null, 2));
                tree = schematicRunner.runSchematic('migration-01', defaultOptions, tree);
                const extract = getConfig(tree).projects.foo.architect['extract-i18n'];
                expect(extract.builder).toEqual('@angular-devkit/build-angular:extract-i18n');
                expect(extract.options).toBeDefined();
                expect(extract.options.browserTarget).toEqual(`foo:build`);
            });
            it('should set the lint target', () => {
                tree.create(oldConfigPath, JSON.stringify(baseConfig, null, 2));
                tree = schematicRunner.runSchematic('migration-01', defaultOptions, tree);
                const tslint = getConfig(tree).projects.foo.architect['lint'];
                expect(tslint.builder).toEqual('@angular-devkit/build-angular:tslint');
                expect(tslint.options).toBeDefined();
                expect(tslint.options.tsConfig)
                    .toEqual(['src/tsconfig.app.json', 'src/tsconfig.spec.json']);
                expect(tslint.options.exclude).toEqual(['**/node_modules/**']);
            });
            it('should set the budgets configuration', () => {
                baseConfig.apps[0].budgets = [{
                        type: 'bundle',
                        name: 'main',
                        error: '123kb',
                    }];
                tree.create(oldConfigPath, JSON.stringify(baseConfig, null, 2));
                tree = schematicRunner.runSchematic('migration-01', defaultOptions, tree);
                const config = getConfig(tree);
                const budgets = config.projects.foo.architect.build.configurations.production.budgets;
                expect(budgets.length).toEqual(1);
                expect(budgets[0].type).toEqual('bundle');
                expect(budgets[0].name).toEqual('main');
                expect(budgets[0].error).toEqual('123kb');
            });
        });
        describe('e2e projects', () => {
            it('should set the project root values', () => {
                tree.create(oldConfigPath, JSON.stringify(baseConfig, null, 2));
                tree = schematicRunner.runSchematic('migration-01', defaultOptions, tree);
                const e2eProject = getConfig(tree).projects['foo-e2e'];
                expect(e2eProject.root).toBe('');
                expect(e2eProject.sourceRoot).toBe('e2e');
                const e2eOptions = e2eProject.architect.e2e;
                expect(e2eOptions.builder).toEqual('@angular-devkit/build-angular:protractor');
                const options = e2eOptions.options;
                expect(options.protractorConfig).toEqual('./protractor.conf.js');
                expect(options.devServerTarget).toEqual('foo:serve');
            });
            it('should set the project root values for a different root', () => {
                baseConfig.apps[0].root = 'apps/app1/src';
                tree.create(oldConfigPath, JSON.stringify(baseConfig, null, 2));
                tree = schematicRunner.runSchematic('migration-01', defaultOptions, tree);
                const e2eProject = getConfig(tree).projects['foo-e2e'];
                expect(e2eProject.root).toBe('apps/app1');
                expect(e2eProject.sourceRoot).toBe('apps/app1/e2e');
                const e2eOptions = e2eProject.architect.e2e;
                expect(e2eOptions.builder).toEqual('@angular-devkit/build-angular:protractor');
                const options = e2eOptions.options;
                expect(options.protractorConfig).toEqual('./protractor.conf.js');
                expect(options.devServerTarget).toEqual('foo:serve');
            });
            it('should set the lint target', () => {
                tree.create(oldConfigPath, JSON.stringify(baseConfig, null, 2));
                tree = schematicRunner.runSchematic('migration-01', defaultOptions, tree);
                const tslint = getConfig(tree).projects['foo-e2e'].architect.lint;
                expect(tslint.builder).toEqual('@angular-devkit/build-angular:tslint');
                expect(tslint.options).toBeDefined();
                expect(tslint.options.tsConfig).toEqual(['e2e/tsconfig.e2e.json']);
                expect(tslint.options.exclude).toEqual(['**/node_modules/**']);
            });
        });
    });
    describe('karma config', () => {
        const karmaPath = '/karma.conf.js';
        beforeEach(() => {
            tree.create(karmaPath, `
        // @angular/cli
        // reports
      `);
        });
        it('should replace references to "@angular/cli"', () => {
            tree.create(oldConfigPath, JSON.stringify(baseConfig, null, 2));
            tree = schematicRunner.runSchematic('migration-01', defaultOptions, tree);
            const content = tree.readContent(karmaPath);
            expect(content).not.toContain('@angular/cli');
            expect(content).toContain('@angular-devkit/build-angular');
        });
        it('should replace references to "reports"', () => {
            tree.create(oldConfigPath, JSON.stringify(baseConfig, null, 2));
            tree = schematicRunner.runSchematic('migration-01', defaultOptions, tree);
            const content = tree.readContent(karmaPath);
            expect(content).toContain(`dir: require('path').join(__dirname, 'coverage'), reports`);
        });
        it('should remove unused properties in 1.0 configs', () => {
            tree.overwrite(karmaPath, `
        files: [
          { pattern: './src/test.ts', watched: false }
        ],
        preprocessors: {
          './src/test.ts': ['@angular/cli']
        },
        angularCli: {
          environment: 'dev'
        },
      `);
            tree.create(oldConfigPath, JSON.stringify(baseConfig, null, 2));
            tree = schematicRunner.runSchematic('migration-01', defaultOptions, tree);
            const content = tree.readContent(karmaPath);
            expect(content).not.toContain(`{ pattern: './src/test.ts', watched: false }`);
            expect(content).not.toContain(`'./src/test.ts': ['@angular/cli']`);
            expect(content).not.toMatch(/angularCli[^}]*},?/);
        });
    });
    describe('spec ts config', () => {
        const testTsconfigPath = '/src/tsconfig.spec.json';
        beforeEach(() => {
            tree.create(testTsconfigPath, `
        {
          "files": [ "test.ts" ]
        }
      `);
        });
        it('should add polyfills', () => {
            tree.create(oldConfigPath, JSON.stringify(baseConfig, null, 2));
            tree = schematicRunner.runSchematic('migration-01', defaultOptions, tree);
            const content = tree.readContent(testTsconfigPath);
            expect(content).toContain('polyfills.ts');
            const config = JSON.parse(content);
            expect(config.files.length).toEqual(2);
            expect(config.files[1]).toEqual('polyfills.ts');
        });
        it('should not add polyfills it if it already exists', () => {
            tree.overwrite(testTsconfigPath, `
        {
          "files": [ "test.ts", "polyfills.ts" ]
        }
      `);
            tree.create(oldConfigPath, JSON.stringify(baseConfig, null, 2));
            tree = schematicRunner.runSchematic('migration-01', defaultOptions, tree);
            const content = tree.readContent(testTsconfigPath);
            expect(content).toContain('polyfills.ts');
            const config = JSON.parse(content);
            expect(config.files.length).toEqual(2);
        });
    });
    describe('package.json', () => {
        it('should add a dev dependency to @angular-devkit/build-angular', () => {
            tree.create(oldConfigPath, JSON.stringify(baseConfig, null, 2));
            tree = schematicRunner.runSchematic('migration-01', defaultOptions, tree);
            const content = tree.readContent('/package.json');
            const pkg = JSON.parse(content);
            expect(pkg.devDependencies['@angular-devkit/build-angular'])
                .toBe(latest_versions_1.latestVersions.DevkitBuildAngular);
        });
        it('should add a dev dependency to @angular-devkit/build-angular (present)', () => {
            tree.create(oldConfigPath, JSON.stringify(baseConfig, null, 2));
            tree.overwrite('/package.json', JSON.stringify({
                devDependencies: {
                    '@angular-devkit/build-angular': '0.0.0',
                },
            }, null, 2));
            tree = schematicRunner.runSchematic('migration-01', defaultOptions, tree);
            const content = tree.readContent('/package.json');
            const pkg = JSON.parse(content);
            expect(pkg.devDependencies['@angular-devkit/build-angular'])
                .toBe(latest_versions_1.latestVersions.DevkitBuildAngular);
        });
        it('should add a dev dependency to @angular-devkit/build-angular (no dev)', () => {
            tree.create(oldConfigPath, JSON.stringify(baseConfig, null, 2));
            tree.overwrite('/package.json', JSON.stringify({}, null, 2));
            tree = schematicRunner.runSchematic('migration-01', defaultOptions, tree);
            const content = tree.readContent('/package.json');
            const pkg = JSON.parse(content);
            expect(pkg.devDependencies['@angular-devkit/build-angular'])
                .toBe(latest_versions_1.latestVersions.DevkitBuildAngular);
        });
    });
    describe('tslint.json', () => {
        const tslintPath = '/tslint.json';
        // tslint:disable-next-line:no-any
        let tslintConfig;
        beforeEach(() => {
            tslintConfig = {
                rules: {
                    'import-blacklist': ['some', 'rxjs', 'else'],
                },
            };
        });
        it('should remove "rxjs" from the "import-blacklist" rule', () => {
            tree.create(oldConfigPath, JSON.stringify(baseConfig, null, 2));
            tree.create(tslintPath, JSON.stringify(tslintConfig, null, 2));
            tree = schematicRunner.runSchematic('migration-01', defaultOptions, tree);
            const tslint = JSON.parse(tree.readContent(tslintPath));
            expect(tslint.rules['import-blacklist']).toEqual(['some', 'else']);
        });
        it('should remove "rxjs" from the "import-blacklist" rule (only)', () => {
            tree.create(oldConfigPath, JSON.stringify(baseConfig, null, 2));
            tslintConfig.rules['import-blacklist'] = ['rxjs'];
            tree.create(tslintPath, JSON.stringify(tslintConfig, null, 2));
            tree = schematicRunner.runSchematic('migration-01', defaultOptions, tree);
            const tslint = JSON.parse(tree.readContent(tslintPath));
            expect(tslint.rules['import-blacklist']).toEqual([]);
        });
        it('should remove "rxjs" from the "import-blacklist" rule (first)', () => {
            tree.create(oldConfigPath, JSON.stringify(baseConfig, null, 2));
            tslintConfig.rules['import-blacklist'] = ['rxjs', 'else'];
            tree.create(tslintPath, JSON.stringify(tslintConfig, null, 2));
            tree = schematicRunner.runSchematic('migration-01', defaultOptions, tree);
            const tslint = JSON.parse(tree.readContent(tslintPath));
            expect(tslint.rules['import-blacklist']).toEqual(['else']);
        });
        it('should remove "rxjs" from the "import-blacklist" rule (last)', () => {
            tree.create(oldConfigPath, JSON.stringify(baseConfig, null, 2));
            tslintConfig.rules['import-blacklist'] = ['some', 'rxjs'];
            tree.create(tslintPath, JSON.stringify(tslintConfig, null, 2));
            tree = schematicRunner.runSchematic('migration-01', defaultOptions, tree);
            const tslint = JSON.parse(tree.readContent(tslintPath));
            expect(tslint.rules['import-blacklist']).toEqual(['some']);
        });
        it('should work if "rxjs" is not in the "import-blacklist" rule', () => {
            tree.create(oldConfigPath, JSON.stringify(baseConfig, null, 2));
            tslintConfig.rules['import-blacklist'] = [];
            tree.create(tslintPath, JSON.stringify(tslintConfig, null, 2));
            tree = schematicRunner.runSchematic('migration-01', defaultOptions, tree);
            const tslint = JSON.parse(tree.readContent(tslintPath));
            const blacklist = tslint.rules['import-blacklist'];
            expect(blacklist).toEqual([]);
        });
    });
    describe('server/universal apps', () => {
        let serverApp;
        beforeEach(() => {
            serverApp = {
                platform: 'server',
                root: 'src',
                outDir: 'dist/server',
                assets: [
                    'assets',
                    'favicon.ico',
                ],
                index: 'index.html',
                main: 'main.server.ts',
                test: 'test.ts',
                tsconfig: 'tsconfig.server.json',
                testTsconfig: 'tsconfig.spec.json',
                prefix: 'app',
                styles: [
                    'styles.css',
                ],
                scripts: [],
                environmentSource: 'environments/environment.ts',
                environments: {
                    dev: 'environments/environment.ts',
                    prod: 'environments/environment.prod.ts',
                },
            };
            baseConfig.apps.push(serverApp);
        });
        it('should not create a separate app for server apps', () => {
            tree.create(oldConfigPath, JSON.stringify(baseConfig, null, 2));
            tree = schematicRunner.runSchematic('migration-01', defaultOptions, tree);
            const config = getConfig(tree);
            const appCount = Object.keys(config.projects).length;
            expect(appCount).toEqual(2);
        });
        it('should create a server target', () => {
            tree.create(oldConfigPath, JSON.stringify(baseConfig, null, 2));
            tree = schematicRunner.runSchematic('migration-01', defaultOptions, tree);
            const config = getConfig(tree);
            const target = config.projects.foo.architect.server;
            expect(target).toBeDefined();
            expect(target.builder).toEqual('@angular-devkit/build-angular:server');
            expect(target.options.outputPath).toEqual('dist/server');
            expect(target.options.main).toEqual('main.server.ts');
            expect(target.options.tsConfig).toEqual('tsconfig.server.json');
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXhfc3BlYy5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvYm9iby9Xb3JrL3NoYXJrLXNjaGVtYXRpY3Mvc3JjLyIsInNvdXJjZXMiOlsic3JjL21pZ3JhdGlvbnMvdXBkYXRlLTYvaW5kZXhfc3BlYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQVFBLDJEQUF1RDtBQUN2RCxnRUFBdUY7QUFDdkYsNkJBQTZCO0FBQzdCLG1FQUErRDtBQUcvRCxRQUFRLENBQUMsaUJBQWlCLEVBQUUsR0FBRyxFQUFFO0lBQy9CLE1BQU0sZUFBZSxHQUFHLElBQUksNkJBQW1CLENBQzdDLFlBQVksRUFDWixJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSw4QkFBOEIsQ0FBQyxDQUNyRCxDQUFDO0lBRUYsa0NBQWtDO0lBQ2xDLElBQUksVUFBZSxDQUFDO0lBQ3BCLE1BQU0sY0FBYyxHQUFHLEVBQUUsQ0FBQztJQUMxQixJQUFJLElBQWtCLENBQUM7SUFDdkIsTUFBTSxhQUFhLEdBQUcsb0JBQW9CLENBQUM7SUFDM0MsTUFBTSxVQUFVLEdBQUcsZUFBZSxDQUFDO0lBRW5DLFVBQVUsQ0FBQyxHQUFHLEVBQUU7UUFDZCxVQUFVLEdBQUc7WUFDWCxNQUFNLEVBQUUsb0RBQW9EO1lBQzVELE9BQU8sRUFBRTtnQkFDUCxJQUFJLEVBQUUsS0FBSzthQUNaO1lBQ0QsSUFBSSxFQUFFO2dCQUNKO29CQUNFLElBQUksRUFBRSxLQUFLO29CQUNYLE1BQU0sRUFBRSxNQUFNO29CQUNkLE1BQU0sRUFBRTt3QkFDTixRQUFRO3dCQUNSLGFBQWE7d0JBQ2IsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRTt3QkFDekQsRUFBRSxJQUFJLEVBQUUsYUFBYSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRTt3QkFDbEQ7NEJBQ0UsTUFBTSxFQUFFLFFBQVE7NEJBQ2hCLE9BQU8sRUFB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QUFDO1lBQ3ZFLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUN6RCxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUN0RCxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxPQUFPLENBQUMsc0JBQXNCLENBQUMsQ0FBQztRQUNsRSxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQgeyBKc29uT2JqZWN0IH0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L2NvcmUnO1xuaW1wb3J0IHsgRW1wdHlUcmVlIH0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L3NjaGVtYXRpY3MnO1xuaW1wb3J0IHsgU2NoZW1hdGljVGVzdFJ1bm5lciwgVW5pdFRlc3RUcmVlIH0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L3NjaGVtYXRpY3MvdGVzdGluZyc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgbGF0ZXN0VmVyc2lvbnMgfSBmcm9tICcuLi8uLi91dGlsaXR5L2xhdGVzdC12ZXJzaW9ucyc7XG5cblxuZGVzY3JpYmUoJ01pZ3JhdGlvbiB0byB2NicsICgpID0+IHtcbiAgY29uc3Qgc2NoZW1hdGljUnVubmVyID0gbmV3IFNjaGVtYXRpY1Rlc3RSdW5uZXIoXG4gICAgJ21pZ3JhdGlvbnMnLFxuICAgIHBhdGguam9pbihfX2Rpcm5hbWUsICcuLi9taWdyYXRpb24tY29sbGVjdGlvbi5qc29uJyksXG4gICk7XG5cbiAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWFueVxuICBsZXQgYmFzZUNvbmZpZzogYW55O1xuICBjb25zdCBkZWZhdWx0T3B0aW9ucyA9IHt9O1xuICBsZXQgdHJlZTogVW5pdFRlc3RUcmVlO1xuICBjb25zdCBvbGRDb25maWdQYXRoID0gYC8uYW5ndWxhci1jbGkuanNvbmA7XG4gIGNvbnN0IGNvbmZpZ1BhdGggPSBgL2FuZ3VsYXIuanNvbmA7XG5cbiAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgYmFzZUNvbmZpZyA9IHtcbiAgICAgIHNjaGVtYTogJy4vbm9kZV9tb2R1bGVzL0Bhbmd1bGFyL2NsaS9saWIvY29uZmlnL3NjaGVtYS5qc29uJyxcbiAgICAgIHByb2plY3Q6IHtcbiAgICAgICAgbmFtZTogJ2ZvbycsXG4gICAgICB9LFxuICAgICAgYXBwczogW1xuICAgICAgICB7XG4gICAgICAgICAgcm9vdDogJ3NyYycsXG4gICAgICAgICAgb3V0RGlyOiAnZGlzdCcsXG4gICAgICAgICAgYXNzZXRzOiBbXG4gICAgICAgICAgICAnYXNzZXRzJyxcbiAgICAgICAgICAgICdmYXZpY29uLmljbycsXG4gICAgICAgICAgICB7IGdsb2I6ICcqKi8qJywgaW5wdXQ6ICcuL2Fzc2V0cy8nLCBvdXRwdXQ6ICcuL2Fzc2V0cy8nIH0sXG4gICAgICAgICAgICB7IGdsb2I6ICdmYXZpY29uLmljbycsIGlucHV0OiAnLi8nLCBvdXRwdXQ6ICcuLycgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgJ2dsb2InOiAnKiovKi4qJyxcbiAgICAgICAgICAgICAgJ2lucHV0JzogJy4uL3NlcnZlci8nLFxuICAgICAgICAgICAgICAnb3V0cHV0JzogJy4uLycsXG4gICAgICAgICAgICAgICdhbGxvd091dHNpZGVPdXREaXInOiB0cnVlLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICBdLFxuICAgICAgICAgIGluZGV4OiAnaW5kZXguaHRtbCcsXG4gICAgICAgICAgbWFpbjogJ21haW4udHMnLFxuICAgICAgICAgIHBvbHlmaWxsczogJ3BvbHlmaWxscy50cycsXG4gICAgICAgICAgdGVzdDogJ3Rlc3QudHMnLFxuICAgICAgICAgIHRzY29uZmlnOiAndHNjb25maWcuYXBwLmpzb24nLFxuICAgICAgICAgIHRlc3RUc2NvbmZpZzogJ3RzY29uZmlnLnNwZWMuanNvbicsXG4gICAgICAgICAgcHJlZml4OiAnYXBwJyxcbiAgICAgICAgICBzdHlsZXM6IFtcbiAgICAgICAgICAgICdzdHlsZXMuY3NzJyxcbiAgICAgICAgICBdLFxuICAgICAgICAgIHN0eWxlUHJlcHJvY2Vzc29yT3B0aW9uczoge1xuICAgICAgICAgICAgaW5jbHVkZVBhdGhzOiBbXG4gICAgICAgICAgICAgICdzdHlsZUluYycsXG4gICAgICAgICAgICBdLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgc2NyaXB0czogW10sXG4gICAgICAgICAgZW52aXJvbm1lbnRTb3VyY2U6ICdlbnZpcm9ubWVudHMvZW52aXJvbm1lbnQudHMnLFxuICAgICAgICAgIGVudmlyb25tZW50czoge1xuICAgICAgICAgICAgZGV2OiAnZW52aXJvbm1lbnRzL2Vudmlyb25tZW50LnRzJyxcbiAgICAgICAgICAgIHByb2Q6ICdlbnZpcm9ubWVudHMvZW52aXJvbm1lbnQucHJvZC50cycsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgICBlMmU6IHtcbiAgICAgICAgcHJvdHJhY3Rvcjoge1xuICAgICAgICAgIGNvbmZpZzogJy4vcHJvdHJhY3Rvci5jb25mLmpzJyxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBsaW50OiBbXG4gICAgICAgIHtcbiAgICAgICAgICBwcm9qZWN0OiAnc3JjL3RzY29uZmlnLmFwcC5qc29uJyxcbiAgICAgICAgICBleGNsdWRlOiAnKiovbm9kZV9tb2R1bGVzLyoqJyxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHByb2plY3Q6ICdzcmMvdHNjb25maWcuc3BlYy5qc29uJyxcbiAgICAgICAgICBleGNsdWRlOiAnKiovbm9kZV9tb2R1bGVzLyoqJyxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHByb2plY3Q6ICdlMmUvdHNjb25maWcuZTJlLmpzb24nLFxuICAgICAgICAgIGV4Y2x1ZGU6ICcqKi9ub2RlX21vZHVsZXMvKionLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICAgIHRlc3Q6IHtcbiAgICAgICAga2FybWE6IHtcbiAgICAgICAgICBjb25maWc6ICcuL2thcm1hLmNvbmYuanMnLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIGRlZmF1bHRzOiB7XG4gICAgICAgIHN0eWxlRXh0OiAnY3NzJyxcbiAgICAgICAgYnVpbGQ6IHtcbiAgICAgICAgICBuYW1lZENodW5rczogdHJ1ZSxcbiAgICAgICAgfSxcbiAgICAgICAgc2VydmU6IHtcbiAgICAgICAgICBwb3J0OiA4MDgwLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9O1xuICAgIHRyZWUgPSBuZXcgVW5pdFRlc3RUcmVlKG5ldyBFbXB0eVRyZWUoKSk7XG4gICAgY29uc3QgcGFja2FnZUpzb24gPSB7XG4gICAgICBkZXZEZXBlbmRlbmNpZXM6IHt9LFxuICAgIH07XG4gICAgdHJlZS5jcmVhdGUoJy9wYWNrYWdlLmpzb24nLCBKU09OLnN0cmluZ2lmeShwYWNrYWdlSnNvbiwgbnVsbCwgMikpO1xuXG4gICAgLy8gQ3JlYXRlIGEgcHJvZCBlbnZpcm9ubWVudC5cbiAgICB0cmVlLmNyZWF0ZSgnL3NyYy9lbnZpcm9ubWVudHMvZW52aXJvbm1lbnQucHJvZC50cycsIGBcbiAgICAgIGV4cG9ydCBjb25zdCBlbnZpcm9ubWVudCA9IHtcbiAgICAgICAgcHJvZHVjdGlvbjogdHJ1ZVxuICAgICAgfTtcbiAgICBgKTtcbiAgICB0cmVlLmNyZWF0ZSgnL3NyYy9mYXZpY29uLmljbycsICcnKTtcbiAgfSk7XG5cbiAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWFueVxuICBmdW5jdGlvbiBnZXRDb25maWcodHJlZTogVW5pdFRlc3RUcmVlKTogYW55IHtcbiAgICByZXR1cm4gSlNPTi5wYXJzZSh0cmVlLnJlYWRDb250ZW50KGNvbmZpZ1BhdGgpKTtcbiAgfVxuXG4gIGRlc2NyaWJlKCdmaWxlIGNyZWF0aW9uL2RlbGV0aW9uJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgZGVsZXRlIHRoZSBvbGQgY29uZmlnIGZpbGUnLCAoKSA9PiB7XG4gICAgICB0cmVlLmNyZWF0ZShvbGRDb25maWdQYXRoLCBKU09OLnN0cmluZ2lmeShiYXNlQ29uZmlnLCBudWxsLCAyKSk7XG4gICAgICB0cmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnbWlncmF0aW9uLTAxJywgZGVmYXVsdE9wdGlvbnMsIHRyZWUpO1xuICAgICAgZXhwZWN0KHRyZWUuZXhpc3RzKG9sZENvbmZpZ1BhdGgpKS50b0VxdWFsKGZhbHNlKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgY3JlYXRlIHRoZSBuZXcgY29uZmlnIGZpbGUnLCAoKSA9PiB7XG4gICAgICB0cmVlLmNyZWF0ZShvbGRDb25maWdQYXRoLCBKU09OLnN0cmluZ2lmeShiYXNlQ29uZmlnLCBudWxsLCAyKSk7XG4gICAgICB0cmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnbWlncmF0aW9uLTAxJywgZGVmYXVsdE9wdGlvbnMsIHRyZWUpO1xuICAgICAgZXhwZWN0KHRyZWUuZXhpc3RzKGNvbmZpZ1BhdGgpKS50b0VxdWFsKHRydWUpO1xuICAgIH0pO1xuXG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdjb25maWcgZmlsZSBjb250ZW50cycsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHNldCByb290IHZhbHVlcycsICgpID0+IHtcbiAgICAgIHRyZWUuY3JlYXRlKG9sZENvbmZpZ1BhdGgsIEpTT04uc3RyaW5naWZ5KGJhc2VDb25maWcsIG51bGwsIDIpKTtcbiAgICAgIHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdtaWdyYXRpb24tMDEnLCBkZWZhdWx0T3B0aW9ucywgdHJlZSk7XG4gICAgICBjb25zdCBjb25maWcgPSBnZXRDb25maWcodHJlZSk7XG4gICAgICBleHBlY3QoY29uZmlnLnZlcnNpb24pLnRvRXF1YWwoMSk7XG4gICAgICBleHBlY3QoY29uZmlnLm5ld1Byb2plY3RSb290KS50b0VxdWFsKCdwcm9qZWN0cycpO1xuICAgICAgZXhwZWN0KGNvbmZpZy5kZWZhdWx0UHJvamVjdCkudG9FcXVhbCgnZm9vJyk7XG4gICAgfSk7XG5cbiAgICBkZXNjcmliZSgnc2NoZW1hdGljcycsICgpID0+IHtcbiAgICAgIGl0KCdzaG91bGQgZGVmaW5lIHNjaGVtYXRpY3MgY29sbGVjdGlvbiByb290JywgKCkgPT4ge1xuICAgICAgICB0cmVlLmNyZWF0ZShvbGRDb25maWdQYXRoLCBKU09OLnN0cmluZ2lmeShiYXNlQ29uZmlnLCBudWxsLCAyKSk7XG4gICAgICAgIHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdtaWdyYXRpb24tMDEnLCBkZWZhdWx0T3B0aW9ucywgdHJlZSk7XG4gICAgICAgIGNvbnN0IGNvbmZpZyA9IGdldENvbmZpZyh0cmVlKTtcbiAgICAgICAgZXhwZWN0KGNvbmZpZy5zY2hlbWF0aWNzWydAc2NoZW1hdGljcy9hbmd1bGFyOmNvbXBvbmVudCddKS50b0JlRGVmaW5lZCgpO1xuICAgICAgfSk7XG5cbiAgICAgIGZ1bmN0aW9uIGdldFNjaGVtYXRpY0NvbmZpZyhob3N0OiBVbml0VGVzdFRyZWUsIG5hbWU6IHN0cmluZyk6IEpzb25PYmplY3Qge1xuICAgICAgICByZXR1cm4gZ2V0Q29uZmlnKGhvc3QpLnNjaGVtYXRpY3NbJ0BzY2hlbWF0aWNzL2FuZ3VsYXI6JyArIG5hbWVdO1xuICAgICAgfVxuXG4gICAgICBkZXNjcmliZSgnY29tcG9uZW50IGNvbmZpZycsICgpID0+IHtcbiAgICAgICAgaXQoJ3Nob3VsZCBtb3ZlIHByZWZpeCcsICgpID0+IHtcbiAgICAgICAgICB0cmVlLmNyZWF0ZShvbGRDb25maWdQYXRoLCBKU09OLnN0cmluZ2lmeShiYXNlQ29uZmlnLCBudWxsLCAyKSk7XG4gICAgICAgICAgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ21pZ3JhdGlvbi0wMScsIGRlZmF1bHRPcHRpb25zLCB0cmVlKTtcbiAgICAgICAgICBjb25zdCBjb25maWcgPSBnZXRTY2hlbWF0aWNDb25maWcodHJlZSwgJ2NvbXBvbmVudCcpO1xuICAgICAgICAgIGV4cGVjdChjb25maWcucHJlZml4KS50b0VxdWFsKCdhcHAnKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ3Nob3VsZCBtb3ZlIHN0eWxlRXh0IHRvIGNvbXBvbmVudCcsICgpID0+IHtcbiAgICAgICAgICB0cmVlLmNyZWF0ZShvbGRDb25maWdQYXRoLCBKU09OLnN0cmluZ2lmeShiYXNlQ29uZmlnLCBudWxsLCAyKSk7XG4gICAgICAgICAgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ21pZ3JhdGlvbi0wMScsIGRlZmF1bHRPcHRpb25zLCB0cmVlKTtcbiAgICAgICAgICBjb25zdCBjb25maWcgPSBnZXRTY2hlbWF0aWNDb25maWcodHJlZSwgJ2NvbXBvbmVudCcpO1xuICAgICAgICAgIGV4cGVjdChjb25maWcuc3R5bGVleHQpLnRvRXF1YWwoJ2NzcycpO1xuICAgICAgICB9KTtcblxuICAgICAgICBpdCgnc2hvdWxkIG1vdmUgaW5saW5lU3R5bGUnLCAoKSA9PiB7XG4gICAgICAgICAgYmFzZUNvbmZpZy5kZWZhdWx0cy5jb21wb25lbnQgPSB7IGlubGluZVN0eWxlOiB0cnVlIH07XG4gICAgICAgICAgdHJlZS5jcmVhdGUob2xkQ29uZmlnUGF0aCwgSlNPTi5zdHJpbmdpZnkoYmFzZUNvbmZpZywgbnVsbCwgMikpO1xuICAgICAgICAgIHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdtaWdyYXRpb24tMDEnLCBkZWZhdWx0T3B0aW9ucywgdHJlZSk7XG4gICAgICAgICAgY29uc3QgY29uZmlnID0gZ2V0U2NoZW1hdGljQ29uZmlnKHRyZWUsICdjb21wb25lbnQnKTtcbiAgICAgICAgICBleHBlY3QoY29uZmlnLmlubGluZVN0eWxlKS50b0VxdWFsKHRydWUpO1xuICAgICAgICB9KTtcblxuICAgICAgICBpdCgnc2hvdWxkIG5vdCBtb3ZlIGlubGluZVN0eWxlIGlmIG5vdCBkZWZpbmVkJywgKCkgPT4ge1xuICAgICAgICAgIHRyZWUuY3JlYXRlKG9sZENvbmZpZ1BhdGgsIEpTT04uc3RyaW5naWZ5KGJhc2VDb25maWcsIG51bGwsIDIpKTtcbiAgICAgICAgICB0cmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnbWlncmF0aW9uLTAxJywgZGVmYXVsdE9wdGlvbnMsIHRyZWUpO1xuICAgICAgICAgIGNvbnN0IGNvbmZpZyA9IGdldFNjaGVtYXRpY0NvbmZpZyh0cmVlLCAnY29tcG9uZW50Jyk7XG4gICAgICAgICAgZXhwZWN0KGNvbmZpZy5pbmxpbmVTdHlsZSkudG9CZVVuZGVmaW5lZCgpO1xuICAgICAgICB9KTtcblxuICAgICAgICBpdCgnc2hvdWxkIG1vdmUgaW5saW5lVGVtcGxhdGUnLCAoKSA9PiB7XG4gICAgICAgICAgYmFzZUNvbmZpZy5kZWZhdWx0cy5jb21wb25lbnQgPSB7IGlubGluZVRlbXBsYXRlOiB0cnVlIH07XG4gICAgICAgICAgdHJlZS5jcmVhdGUob2xkQ29uZmlnUGF0aCwgSlNPTi5zdHJpbmdpZnkoYmFzZUNvbmZpZywgbnVsbCwgMikpO1xuICAgICAgICAgIHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdtaWdyYXRpb24tMDEnLCBkZWZhdWx0T3B0aW9ucywgdHJlZSk7XG4gICAgICAgICAgY29uc3QgY29uZmlnID0gZ2V0U2NoZW1hdGljQ29uZmlnKHRyZWUsICdjb21wb25lbnQnKTtcbiAgICAgICAgICBleHBlY3QoY29uZmlnLmlubGluZVRlbXBsYXRlKS50b0VxdWFsKHRydWUpO1xuICAgICAgICB9KTtcblxuICAgICAgICBpdCgnc2hvdWxkIG5vdCBtb3ZlIGlubGluZVRlbXBsYXRlIGlmIG5vdCBkZWZpbmVkJywgKCkgPT4ge1xuICAgICAgICAgIHRyZWUuY3JlYXRlKG9sZENvbmZpZ1BhdGgsIEpTT04uc3RyaW5naWZ5KGJhc2VDb25maWcsIG51bGwsIDIpKTtcbiAgICAgICAgICB0cmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnbWlncmF0aW9uLTAxJywgZGVmYXVsdE9wdGlvbnMsIHRyZWUpO1xuICAgICAgICAgIGNvbnN0IGNvbmZpZyA9IGdldFNjaGVtYXRpY0NvbmZpZyh0cmVlLCAnY29tcG9uZW50Jyk7XG4gICAgICAgICAgZXhwZWN0KGNvbmZpZy5pbmxpbmVUZW1wbGF0ZSkudG9CZVVuZGVmaW5lZCgpO1xuICAgICAgICB9KTtcblxuICAgICAgICBpdCgnc2hvdWxkIG1vdmUgZmxhdCcsICgpID0+IHtcbiAgICAgICAgICBiYXNlQ29uZmlnLmRlZmF1bHRzLmNvbXBvbmVudCA9IHsgZmxhdDogdHJ1ZSB9O1xuICAgICAgICAgIHRyZWUuY3JlYXRlKG9sZENvbmZpZ1BhdGgsIEpTT04uc3RyaW5naWZ5KGJhc2VDb25maWcsIG51bGwsIDIpKTtcbiAgICAgICAgICB0cmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnbWlncmF0aW9uLTAxJywgZGVmYXVsdE9wdGlvbnMsIHRyZWUpO1xuICAgICAgICAgIGNvbnN0IGNvbmZpZyA9IGdldFNjaGVtYXRpY0NvbmZpZyh0cmVlLCAnY29tcG9uZW50Jyk7XG4gICAgICAgICAgZXhwZWN0KGNvbmZpZy5mbGF0KS50b0VxdWFsKHRydWUpO1xuICAgICAgICB9KTtcblxuICAgICAgICBpdCgnc2hvdWxkIG5vdCBtb3ZlIGZsYXQgaWYgbm90IGRlZmluZWQnLCAoKSA9PiB7XG4gICAgICAgICAgdHJlZS5jcmVhdGUob2xkQ29uZmlnUGF0aCwgSlNPTi5zdHJpbmdpZnkoYmFzZUNvbmZpZywgbnVsbCwgMikpO1xuICAgICAgICAgIHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdtaWdyYXRpb24tMDEnLCBkZWZhdWx0T3B0aW9ucywgdHJlZSk7XG4gICAgICAgICAgY29uc3QgY29uZmlnID0gZ2V0U2NoZW1hdGljQ29uZmlnKHRyZWUsICdjb21wb25lbnQnKTtcbiAgICAgICAgICBleHBlY3QoY29uZmlnLmZsYXQpLnRvQmVVbmRlZmluZWQoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ3Nob3VsZCBtb3ZlIHNwZWMnLCAoKSA9PiB7XG4gICAgICAgICAgYmFzZUNvbmZpZy5kZWZhdWx0cy5jb21wb25lbnQgPSB7IHNwZWM6IHRydWUgfTtcbiAgICAgICAgICB0cmVlLmNyZWF0ZShvbGRDb25maWdQYXRoLCBKU09OLnN0cmluZ2lmeShiYXNlQ29uZmlnLCBudWxsLCAyKSk7XG4gICAgICAgICAgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ21pZ3JhdGlvbi0wMScsIGRlZmF1bHRPcHRpb25zLCB0cmVlKTtcbiAgICAgICAgICBjb25zdCBjb25maWcgPSBnZXRTY2hlbWF0aWNDb25maWcodHJlZSwgJ2NvbXBvbmVudCcpO1xuICAgICAgICAgIGV4cGVjdChjb25maWcuc3BlYykudG9FcXVhbCh0cnVlKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ3Nob3VsZCBub3QgbW92ZSBzcGVjIGlmIG5vdCBkZWZpbmVkJywgKCkgPT4ge1xuICAgICAgICAgIHRyZWUuY3JlYXRlKG9sZENvbmZpZ1BhdGgsIEpTT04uc3RyaW5naWZ5KGJhc2VDb25maWcsIG51bGwsIDIpKTtcbiAgICAgICAgICB0cmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnbWlncmF0aW9uLTAxJywgZGVmYXVsdE9wdGlvbnMsIHRyZWUpO1xuICAgICAgICAgIGNvbnN0IGNvbmZpZyA9IGdldFNjaGVtYXRpY0NvbmZpZyh0cmVlLCAnY29tcG9uZW50Jyk7XG4gICAgICAgICAgZXhwZWN0KGNvbmZpZy5zcGVjKS50b0JlVW5kZWZpbmVkKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KCdzaG91bGQgbW92ZSB2aWV3RW5jYXBzdWxhdGlvbicsICgpID0+IHtcbiAgICAgICAgICBiYXNlQ29uZmlnLmRlZmF1bHRzLmNvbXBvbmVudCA9IHsgdmlld0VuY2Fwc3VsYXRpb246ICdOYXRpdmUnIH07XG4gICAgICAgICAgdHJlZS5jcmVhdGUob2xkQ29uZmlnUGF0aCwgSlNPTi5zdHJpbmdpZnkoYmFzZUNvbmZpZywgbnVsbCwgMikpO1xuICAgICAgICAgIHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdtaWdyYXRpb24tMDEnLCBkZWZhdWx0T3B0aW9ucywgdHJlZSk7XG4gICAgICAgICAgY29uc3QgY29uZmlnID0gZ2V0U2NoZW1hdGljQ29uZmlnKHRyZWUsICdjb21wb25lbnQnKTtcbiAgICAgICAgICBleHBlY3QoY29uZmlnLnZpZXdFbmNhcHN1bGF0aW9uKS50b0VxdWFsKCdOYXRpdmUnKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ3Nob3VsZCBub3QgbW92ZSB2aWV3RW5jYXBzdWxhdGlvbiBpZiBub3QgZGVmaW5lZCcsICgpID0+IHtcbiAgICAgICAgICB0cmVlLmNyZWF0ZShvbGRDb25maWdQYXRoLCBKU09OLnN0cmluZ2lmeShiYXNlQ29uZmlnLCBudWxsLCAyKSk7XG4gICAgICAgICAgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ21pZ3JhdGlvbi0wMScsIGRlZmF1bHRPcHRpb25zLCB0cmVlKTtcbiAgICAgICAgICBjb25zdCBjb25maWcgPSBnZXRTY2hlbWF0aWNDb25maWcodHJlZSwgJ2NvbXBvbmVudCcpO1xuICAgICAgICAgIGV4cGVjdChjb25maWcudmlld0VuY2Fwc3VsYXRpb24pLnRvQmVVbmRlZmluZWQoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ3Nob3VsZCBtb3ZlIGNoYW5nZURldGVjdGlvbicsICgpID0+IHtcbiAgICAgICAgICBiYXNlQ29uZmlnLmRlZmF1bHRzLmNvbXBvbmVudCA9IHsgY2hhbmdlRGV0ZWN0aW9uOiAnT25QdXNoJyB9O1xuICAgICAgICAgIHRyZWUuY3JlYXRlKG9sZENvbmZpZ1BhdGgsIEpTT04uc3RyaW5naWZ5KGJhc2VDb25maWcsIG51bGwsIDIpKTtcbiAgICAgICAgICB0cmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnbWlncmF0aW9uLTAxJywgZGVmYXVsdE9wdGlvbnMsIHRyZWUpO1xuICAgICAgICAgIGNvbnN0IGNvbmZpZyA9IGdldFNjaGVtYXRpY0NvbmZpZyh0cmVlLCAnY29tcG9uZW50Jyk7XG4gICAgICAgICAgZXhwZWN0KGNvbmZpZy5jaGFuZ2VEZXRlY3Rpb24pLnRvRXF1YWwoJ09uUHVzaCcpO1xuICAgICAgICB9KTtcblxuICAgICAgICBpdCgnc2hvdWxkIG5vdCBtb3ZlIGNoYW5nZURldGVjdGlvbiBpZiBub3QgZGVmaW5lZCcsICgpID0+IHtcbiAgICAgICAgICB0cmVlLmNyZWF0ZShvbGRDb25maWdQYXRoLCBKU09OLnN0cmluZ2lmeShiYXNlQ29uZmlnLCBudWxsLCAyKSk7XG4gICAgICAgICAgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ21pZ3JhdGlvbi0wMScsIGRlZmF1bHRPcHRpb25zLCB0cmVlKTtcbiAgICAgICAgICBjb25zdCBjb25maWcgPSBnZXRTY2hlbWF0aWNDb25maWcodHJlZSwgJ2NvbXBvbmVudCcpO1xuICAgICAgICAgIGV4cGVjdChjb25maWcuY2hhbmdlRGV0ZWN0aW9uKS50b0JlVW5kZWZpbmVkKCk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG5cbiAgICAgIGRlc2NyaWJlKCdkaXJlY3RpdmUgY29uZmlnJywgKCkgPT4ge1xuICAgICAgICBpdCgnc2hvdWxkIG1vdmUgcHJlZml4JywgKCkgPT4ge1xuICAgICAgICAgIHRyZWUuY3JlYXRlKG9sZENvbmZpZ1BhdGgsIEpTT04uc3RyaW5naWZ5KGJhc2VDb25maWcsIG51bGwsIDIpKTtcbiAgICAgICAgICB0cmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnbWlncmF0aW9uLTAxJywgZGVmYXVsdE9wdGlvbnMsIHRyZWUpO1xuICAgICAgICAgIGNvbnN0IGNvbmZpZyA9IGdldFNjaGVtYXRpY0NvbmZpZyh0cmVlLCAnZGlyZWN0aXZlJyk7XG4gICAgICAgICAgZXhwZWN0KGNvbmZpZy5wcmVmaXgpLnRvRXF1YWwoJ2FwcCcpO1xuICAgICAgICB9KTtcblxuICAgICAgICBpdCgnc2hvdWxkIG1vdmUgZmxhdCcsICgpID0+IHtcbiAgICAgICAgICBiYXNlQ29uZmlnLmRlZmF1bHRzLmRpcmVjdGl2ZSA9IHsgZmxhdDogdHJ1ZSB9O1xuICAgICAgICAgIHRyZWUuY3JlYXRlKG9sZENvbmZpZ1BhdGgsIEpTT04uc3RyaW5naWZ5KGJhc2VDb25maWcsIG51bGwsIDIpKTtcbiAgICAgICAgICB0cmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnbWlncmF0aW9uLTAxJywgZGVmYXVsdE9wdGlvbnMsIHRyZWUpO1xuICAgICAgICAgIGNvbnN0IGNvbmZpZyA9IGdldFNjaGVtYXRpY0NvbmZpZyh0cmVlLCAnZGlyZWN0aXZlJyk7XG4gICAgICAgICAgZXhwZWN0KGNvbmZpZy5mbGF0KS50b0VxdWFsKHRydWUpO1xuICAgICAgICB9KTtcblxuICAgICAgICBpdCgnc2hvdWxkIG5vdCBtb3ZlIGZsYXQgaWYgbm90IGRlZmluZWQnLCAoKSA9PiB7XG4gICAgICAgICAgdHJlZS5jcmVhdGUob2xkQ29uZmlnUGF0aCwgSlNPTi5zdHJpbmdpZnkoYmFzZUNvbmZpZywgbnVsbCwgMikpO1xuICAgICAgICAgIHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdtaWdyYXRpb24tMDEnLCBkZWZhdWx0T3B0aW9ucywgdHJlZSk7XG4gICAgICAgICAgY29uc3QgY29uZmlnID0gZ2V0U2NoZW1hdGljQ29uZmlnKHRyZWUsICdkaXJlY3RpdmUnKTtcbiAgICAgICAgICBleHBlY3QoY29uZmlnLmZsYXQpLnRvQmVVbmRlZmluZWQoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ3Nob3VsZCBtb3ZlIHNwZWMnLCAoKSA9PiB7XG4gICAgICAgICAgYmFzZUNvbmZpZy5kZWZhdWx0cy5kaXJlY3RpdmUgPSB7IHNwZWM6IHRydWUgfTtcbiAgICAgICAgICB0cmVlLmNyZWF0ZShvbGRDb25maWdQYXRoLCBKU09OLnN0cmluZ2lmeShiYXNlQ29uZmlnLCBudWxsLCAyKSk7XG4gICAgICAgICAgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ21pZ3JhdGlvbi0wMScsIGRlZmF1bHRPcHRpb25zLCB0cmVlKTtcbiAgICAgICAgICBjb25zdCBjb25maWcgPSBnZXRTY2hlbWF0aWNDb25maWcodHJlZSwgJ2RpcmVjdGl2ZScpO1xuICAgICAgICAgIGV4cGVjdChjb25maWcuc3BlYykudG9FcXVhbCh0cnVlKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ3Nob3VsZCBub3QgbW92ZSBzcGVjIGlmIG5vdCBkZWZpbmVkJywgKCkgPT4ge1xuICAgICAgICAgIHRyZWUuY3JlYXRlKG9sZENvbmZpZ1BhdGgsIEpTT04uc3RyaW5naWZ5KGJhc2VDb25maWcsIG51bGwsIDIpKTtcbiAgICAgICAgICB0cmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnbWlncmF0aW9uLTAxJywgZGVmYXVsdE9wdGlvbnMsIHRyZWUpO1xuICAgICAgICAgIGNvbnN0IGNvbmZpZyA9IGdldFNjaGVtYXRpY0NvbmZpZyh0cmVlLCAnZGlyZWN0aXZlJyk7XG4gICAgICAgICAgZXhwZWN0KGNvbmZpZy5zcGVjKS50b0JlVW5kZWZpbmVkKCk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG5cbiAgICAgIGRlc2NyaWJlKCdjbGFzcyBjb25maWcnLCAoKSA9PiB7XG4gICAgICAgIGl0KCdzaG91bGQgbW92ZSBzcGVjJywgKCkgPT4ge1xuICAgICAgICAgIGJhc2VDb25maWcuZGVmYXVsdHMuY2xhc3MgPSB7IHNwZWM6IHRydWUgfTtcbiAgICAgICAgICB0cmVlLmNyZWF0ZShvbGRDb25maWdQYXRoLCBKU09OLnN0cmluZ2lmeShiYXNlQ29uZmlnLCBudWxsLCAyKSk7XG4gICAgICAgICAgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ21pZ3JhdGlvbi0wMScsIGRlZmF1bHRPcHRpb25zLCB0cmVlKTtcbiAgICAgICAgICBjb25zdCBjb25maWcgPSBnZXRTY2hlbWF0aWNDb25maWcodHJlZSwgJ2NsYXNzJyk7XG4gICAgICAgICAgZXhwZWN0KGNvbmZpZy5zcGVjKS50b0VxdWFsKHRydWUpO1xuICAgICAgICB9KTtcblxuICAgICAgICBpdCgnc2hvdWxkIG5vdCBtb3ZlIHNwZWMgaWYgbm90IGRlZmluZWQnLCAoKSA9PiB7XG4gICAgICAgICAgdHJlZS5jcmVhdGUob2xkQ29uZmlnUGF0aCwgSlNPTi5zdHJpbmdpZnkoYmFzZUNvbmZpZywgbnVsbCwgMikpO1xuICAgICAgICAgIHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdtaWdyYXRpb24tMDEnLCBkZWZhdWx0T3B0aW9ucywgdHJlZSk7XG4gICAgICAgICAgY29uc3QgY29uZmlnID0gZ2V0U2NoZW1hdGljQ29uZmlnKHRyZWUsICdjbGFzcycpO1xuICAgICAgICAgIGV4cGVjdChjb25maWcpLnRvQmVVbmRlZmluZWQoKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcblxuICAgICAgZGVzY3JpYmUoJ2d1YXJkIGNvbmZpZycsICgpID0+IHtcbiAgICAgICAgaXQoJ3Nob3VsZCBtb3ZlIGZsYXQnLCAoKSA9PiB7XG4gICAgICAgICAgYmFzZUNvbmZpZy5kZWZhdWx0cy5ndWFyZCA9IHsgZmxhdDogdHJ1ZSB9O1xuICAgICAgICAgIHRyZWUuY3JlYXRlKG9sZENvbmZpZ1BhdGgsIEpTT04uc3RyaW5naWZ5KGJhc2VDb25maWcsIG51bGwsIDIpKTtcbiAgICAgICAgICB0cmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnbWlncmF0aW9uLTAxJywgZGVmYXVsdE9wdGlvbnMsIHRyZWUpO1xuICAgICAgICAgIGNvbnN0IGNvbmZpZyA9IGdldFNjaGVtYXRpY0NvbmZpZyh0cmVlLCAnZ3VhcmQnKTtcbiAgICAgICAgICBleHBlY3QoY29uZmlnLmZsYXQpLnRvRXF1YWwodHJ1ZSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KCdzaG91bGQgbm90IG1vdmUgZmxhdCBpZiBub3QgZGVmaW5lZCcsICgpID0+IHtcbiAgICAgICAgICB0cmVlLmNyZWF0ZShvbGRDb25maWdQYXRoLCBKU09OLnN0cmluZ2lmeShiYXNlQ29uZmlnLCBudWxsLCAyKSk7XG4gICAgICAgICAgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ21pZ3JhdGlvbi0wMScsIGRlZmF1bHRPcHRpb25zLCB0cmVlKTtcbiAgICAgICAgICBjb25zdCBjb25maWcgPSBnZXRTY2hlbWF0aWNDb25maWcodHJlZSwgJ2d1YXJkJyk7XG4gICAgICAgICAgZXhwZWN0KGNvbmZpZykudG9CZVVuZGVmaW5lZCgpO1xuICAgICAgICB9KTtcblxuICAgICAgICBpdCgnc2hvdWxkIG1vdmUgc3BlYycsICgpID0+IHtcbiAgICAgICAgICBiYXNlQ29uZmlnLmRlZmF1bHRzLmd1YXJkID0geyBzcGVjOiB0cnVlIH07XG4gICAgICAgICAgdHJlZS5jcmVhdGUob2xkQ29uZmlnUGF0aCwgSlNPTi5zdHJpbmdpZnkoYmFzZUNvbmZpZywgbnVsbCwgMikpO1xuICAgICAgICAgIHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdtaWdyYXRpb24tMDEnLCBkZWZhdWx0T3B0aW9ucywgdHJlZSk7XG4gICAgICAgICAgY29uc3QgY29uZmlnID0gZ2V0U2NoZW1hdGljQ29uZmlnKHRyZWUsICdndWFyZCcpO1xuICAgICAgICAgIGV4cGVjdChjb25maWcuc3BlYykudG9FcXVhbCh0cnVlKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ3Nob3VsZCBub3QgbW92ZSBzcGVjIGlmIG5vdCBkZWZpbmVkJywgKCkgPT4ge1xuICAgICAgICAgIHRyZWUuY3JlYXRlKG9sZENvbmZpZ1BhdGgsIEpTT04uc3RyaW5naWZ5KGJhc2VDb25maWcsIG51bGwsIDIpKTtcbiAgICAgICAgICB0cmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnbWlncmF0aW9uLTAxJywgZGVmYXVsdE9wdGlvbnMsIHRyZWUpO1xuICAgICAgICAgIGNvbnN0IGNvbmZpZyA9IGdldFNjaGVtYXRpY0NvbmZpZyh0cmVlLCAnZ3VhcmQnKTtcbiAgICAgICAgICBleHBlY3QoY29uZmlnKS50b0JlVW5kZWZpbmVkKCk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG5cbiAgICAgIGRlc2NyaWJlKCdpbnRlcmZhY2UgY29uZmlnJywgKCkgPT4ge1xuICAgICAgICBpdCgnc2hvdWxkIG1vdmUgZmxhdCcsICgpID0+IHtcbiAgICAgICAgICBiYXNlQ29uZmlnLmRlZmF1bHRzLmludGVyZmFjZSA9IHsgcHJlZml4OiAnSScgfTtcbiAgICAgICAgICB0cmVlLmNyZWF0ZShvbGRDb25maWdQYXRoLCBKU09OLnN0cmluZ2lmeShiYXNlQ29uZmlnLCBudWxsLCAyKSk7XG4gICAgICAgICAgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ21pZ3JhdGlvbi0wMScsIGRlZmF1bHRPcHRpb25zLCB0cmVlKTtcbiAgICAgICAgICBjb25zdCBjb25maWcgPSBnZXRTY2hlbWF0aWNDb25maWcodHJlZSwgJ2ludGVyZmFjZScpO1xuICAgICAgICAgIGV4cGVjdChjb25maWcucHJlZml4KS50b0VxdWFsKCdJJyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KCdzaG91bGQgbm90IG1vdmUgZmxhdCBpZiBub3QgZGVmaW5lZCcsICgpID0+IHtcbiAgICAgICAgICB0cmVlLmNyZWF0ZShvbGRDb25maWdQYXRoLCBKU09OLnN0cmluZ2lmeShiYXNlQ29uZmlnLCBudWxsLCAyKSk7XG4gICAgICAgICAgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ21pZ3JhdGlvbi0wMScsIGRlZmF1bHRPcHRpb25zLCB0cmVlKTtcbiAgICAgICAgICBjb25zdCBjb25maWcgPSBnZXRTY2hlbWF0aWNDb25maWcodHJlZSwgJ2ludGVyZmFjZScpO1xuICAgICAgICAgIGV4cGVjdChjb25maWcpLnRvQmVVbmRlZmluZWQoKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcblxuICAgICAgZGVzY3JpYmUoJ21vZHVsZSBjb25maWcnLCAoKSA9PiB7XG4gICAgICAgIGl0KCdzaG91bGQgbW92ZSBmbGF0JywgKCkgPT4ge1xuICAgICAgICAgIGJhc2VDb25maWcuZGVmYXVsdHMubW9kdWxlID0geyBmbGF0OiB0cnVlIH07XG4gICAgICAgICAgdHJlZS5jcmVhdGUob2xkQ29uZmlnUGF0aCwgSlNPTi5zdHJpbmdpZnkoYmFzZUNvbmZpZywgbnVsbCwgMikpO1xuICAgICAgICAgIHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdtaWdyYXRpb24tMDEnLCBkZWZhdWx0T3B0aW9ucywgdHJlZSk7XG4gICAgICAgICAgY29uc3QgY29uZmlnID0gZ2V0U2NoZW1hdGljQ29uZmlnKHRyZWUsICdtb2R1bGUnKTtcbiAgICAgICAgICBleHBlY3QoY29uZmlnLmZsYXQpLnRvRXF1YWwodHJ1ZSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KCdzaG91bGQgbm90IG1vdmUgZmxhdCBpZiBub3QgZGVmaW5lZCcsICgpID0+IHtcbiAgICAgICAgICB0cmVlLmNyZWF0ZShvbGRDb25maWdQYXRoLCBKU09OLnN0cmluZ2lmeShiYXNlQ29uZmlnLCBudWxsLCAyKSk7XG4gICAgICAgICAgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ21pZ3JhdGlvbi0wMScsIGRlZmF1bHRPcHRpb25zLCB0cmVlKTtcbiAgICAgICAgICBjb25zdCBjb25maWcgPSBnZXRTY2hlbWF0aWNDb25maWcodHJlZSwgJ21vZHVsZScpO1xuICAgICAgICAgIGV4cGVjdChjb25maWcpLnRvQmVVbmRlZmluZWQoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ3Nob3VsZCBtb3ZlIHNwZWMnLCAoKSA9PiB7XG4gICAgICAgICAgYmFzZUNvbmZpZy5kZWZhdWx0cy5tb2R1bGUgPSB7IHNwZWM6IHRydWUgfTtcbiAgICAgICAgICB0cmVlLmNyZWF0ZShvbGRDb25maWdQYXRoLCBKU09OLnN0cmluZ2lmeShiYXNlQ29uZmlnLCBudWxsLCAyKSk7XG4gICAgICAgICAgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ21pZ3JhdGlvbi0wMScsIGRlZmF1bHRPcHRpb25zLCB0cmVlKTtcbiAgICAgICAgICBjb25zdCBjb25maWcgPSBnZXRTY2hlbWF0aWNDb25maWcodHJlZSwgJ21vZHVsZScpO1xuICAgICAgICAgIGV4cGVjdChjb25maWcuc3BlYykudG9FcXVhbCh0cnVlKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ3Nob3VsZCBub3QgbW92ZSBzcGVjIGlmIG5vdCBkZWZpbmVkJywgKCkgPT4ge1xuICAgICAgICAgIHRyZWUuY3JlYXRlKG9sZENvbmZpZ1BhdGgsIEpTT04uc3RyaW5naWZ5KGJhc2VDb25maWcsIG51bGwsIDIpKTtcbiAgICAgICAgICB0cmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnbWlncmF0aW9uLTAxJywgZGVmYXVsdE9wdGlvbnMsIHRyZWUpO1xuICAgICAgICAgIGNvbnN0IGNvbmZpZyA9IGdldFNjaGVtYXRpY0NvbmZpZyh0cmVlLCAnbW9kdWxlJyk7XG4gICAgICAgICAgZXhwZWN0KGNvbmZpZykudG9CZVVuZGVmaW5lZCgpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuXG4gICAgICBkZXNjcmliZSgncGlwZSBjb25maWcnLCAoKSA9PiB7XG4gICAgICAgIGl0KCdzaG91bGQgbW92ZSBmbGF0JywgKCkgPT4ge1xuICAgICAgICAgIGJhc2VDb25maWcuZGVmYXVsdHMucGlwZSA9IHsgZmxhdDogdHJ1ZSB9O1xuICAgICAgICAgIHRyZWUuY3JlYXRlKG9sZENvbmZpZ1BhdGgsIEpTT04uc3RyaW5naWZ5KGJhc2VDb25maWcsIG51bGwsIDIpKTtcbiAgICAgICAgICB0cmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnbWlncmF0aW9uLTAxJywgZGVmYXVsdE9wdGlvbnMsIHRyZWUpO1xuICAgICAgICAgIGNvbnN0IGNvbmZpZyA9IGdldFNjaGVtYXRpY0NvbmZpZyh0cmVlLCAncGlwZScpO1xuICAgICAgICAgIGV4cGVjdChjb25maWcuZmxhdCkudG9FcXVhbCh0cnVlKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ3Nob3VsZCBub3QgbW92ZSBmbGF0IGlmIG5vdCBkZWZpbmVkJywgKCkgPT4ge1xuICAgICAgICAgIHRyZWUuY3JlYXRlKG9sZENvbmZpZ1BhdGgsIEpTT04uc3RyaW5naWZ5KGJhc2VDb25maWcsIG51bGwsIDIpKTtcbiAgICAgICAgICB0cmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnbWlncmF0aW9uLTAxJywgZGVmYXVsdE9wdGlvbnMsIHRyZWUpO1xuICAgICAgICAgIGNvbnN0IGNvbmZpZyA9IGdldFNjaGVtYXRpY0NvbmZpZyh0cmVlLCAncGlwZScpO1xuICAgICAgICAgIGV4cGVjdChjb25maWcpLnRvQmVVbmRlZmluZWQoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ3Nob3VsZCBtb3ZlIHNwZWMnLCAoKSA9PiB7XG4gICAgICAgICAgYmFzZUNvbmZpZy5kZWZhdWx0cy5waXBlID0geyBzcGVjOiB0cnVlIH07XG4gICAgICAgICAgdHJlZS5jcmVhdGUob2xkQ29uZmlnUGF0aCwgSlNPTi5zdHJpbmdpZnkoYmFzZUNvbmZpZywgbnVsbCwgMikpO1xuICAgICAgICAgIHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdtaWdyYXRpb24tMDEnLCBkZWZhdWx0T3B0aW9ucywgdHJlZSk7XG4gICAgICAgICAgY29uc3QgY29uZmlnID0gZ2V0U2NoZW1hdGljQ29uZmlnKHRyZWUsICdwaXBlJyk7XG4gICAgICAgICAgZXhwZWN0KGNvbmZpZy5zcGVjKS50b0VxdWFsKHRydWUpO1xuICAgICAgICB9KTtcblxuICAgICAgICBpdCgnc2hvdWxkIG5vdCBtb3ZlIHNwZWMgaWYgbm90IGRlZmluZWQnLCAoKSA9PiB7XG4gICAgICAgICAgdHJlZS5jcmVhdGUob2xkQ29uZmlnUGF0aCwgSlNPTi5zdHJpbmdpZnkoYmFzZUNvbmZpZywgbnVsbCwgMikpO1xuICAgICAgICAgIHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdtaWdyYXRpb24tMDEnLCBkZWZhdWx0T3B0aW9ucywgdHJlZSk7XG4gICAgICAgICAgY29uc3QgY29uZmlnID0gZ2V0U2NoZW1hdGljQ29uZmlnKHRyZWUsICdwaXBlJyk7XG4gICAgICAgICAgZXhwZWN0KGNvbmZpZykudG9CZVVuZGVmaW5lZCgpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuXG4gICAgICBkZXNjcmliZSgnc2VydmljZSBjb25maWcnLCAoKSA9PiB7XG4gICAgICAgIGl0KCdzaG91bGQgbW92ZSBmbGF0JywgKCkgPT4ge1xuICAgICAgICAgIGJhc2VDb25maWcuZGVmYXVsdHMuc2VydmljZSA9IHsgZmxhdDogdHJ1ZSB9O1xuICAgICAgICAgIHRyZWUuY3JlYXRlKG9sZENvbmZpZ1BhdGgsIEpTT04uc3RyaW5naWZ5KGJhc2VDb25maWcsIG51bGwsIDIpKTtcbiAgICAgICAgICB0cmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnbWlncmF0aW9uLTAxJywgZGVmYXVsdE9wdGlvbnMsIHRyZWUpO1xuICAgICAgICAgIGNvbnN0IGNvbmZpZyA9IGdldFNjaGVtYXRpY0NvbmZpZyh0cmVlLCAnc2VydmljZScpO1xuICAgICAgICAgIGV4cGVjdChjb25maWcuZmxhdCkudG9FcXVhbCh0cnVlKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ3Nob3VsZCBub3QgbW92ZSBmbGF0IGlmIG5vdCBkZWZpbmVkJywgKCkgPT4ge1xuICAgICAgICAgIHRyZWUuY3JlYXRlKG9sZENvbmZpZ1BhdGgsIEpTT04uc3RyaW5naWZ5KGJhc2VDb25maWcsIG51bGwsIDIpKTtcbiAgICAgICAgICB0cmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnbWlncmF0aW9uLTAxJywgZGVmYXVsdE9wdGlvbnMsIHRyZWUpO1xuICAgICAgICAgIGNvbnN0IGNvbmZpZyA9IGdldFNjaGVtYXRpY0NvbmZpZyh0cmVlLCAnc2VydmljZScpO1xuICAgICAgICAgIGV4cGVjdChjb25maWcpLnRvQmVVbmRlZmluZWQoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ3Nob3VsZCBtb3ZlIHNwZWMnLCAoKSA9PiB7XG4gICAgICAgICAgYmFzZUNvbmZpZy5kZWZhdWx0cy5zZXJ2aWNlID0geyBzcGVjOiB0cnVlIH07XG4gICAgICAgICAgdHJlZS5jcmVhdGUob2xkQ29uZmlnUGF0aCwgSlNPTi5zdHJpbmdpZnkoYmFzZUNvbmZpZywgbnVsbCwgMikpO1xuICAgICAgICAgIHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdtaWdyYXRpb24tMDEnLCBkZWZhdWx0T3B0aW9ucywgdHJlZSk7XG4gICAgICAgICAgY29uc3QgY29uZmlnID0gZ2V0U2NoZW1hdGljQ29uZmlnKHRyZWUsICdzZXJ2aWNlJyk7XG4gICAgICAgICAgZXhwZWN0KGNvbmZpZy5zcGVjKS50b0VxdWFsKHRydWUpO1xuICAgICAgICB9KTtcblxuICAgICAgICBpdCgnc2hvdWxkIG5vdCBtb3ZlIHNwZWMgaWYgbm90IGRlZmluZWQnLCAoKSA9PiB7XG4gICAgICAgICAgdHJlZS5jcmVhdGUob2xkQ29uZmlnUGF0aCwgSlNPTi5zdHJpbmdpZnkoYmFzZUNvbmZpZywgbnVsbCwgMikpO1xuICAgICAgICAgIHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdtaWdyYXRpb24tMDEnLCBkZWZhdWx0T3B0aW9ucywgdHJlZSk7XG4gICAgICAgICAgY29uc3QgY29uZmlnID0gZ2V0U2NoZW1hdGljQ29uZmlnKHRyZWUsICdzZXJ2aWNlJyk7XG4gICAgICAgICAgZXhwZWN0KGNvbmZpZykudG9CZVVuZGVmaW5lZCgpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgZGVzY3JpYmUoJ2FyY2hpdGVjdCcsICgpID0+IHtcbiAgICAgIGl0KCdzaG91bGQgZXhpc3QnLCAoKSA9PiB7XG4gICAgICAgIHRyZWUuY3JlYXRlKG9sZENvbmZpZ1BhdGgsIEpTT04uc3RyaW5naWZ5KGJhc2VDb25maWcsIG51bGwsIDIpKTtcbiAgICAgICAgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ21pZ3JhdGlvbi0wMScsIGRlZmF1bHRPcHRpb25zLCB0cmVlKTtcbiAgICAgICAgY29uc3QgY29uZmlnID0gZ2V0Q29uZmlnKHRyZWUpO1xuICAgICAgICBleHBlY3QoY29uZmlnLmFyY2hpdGVjdCkubm90LnRvQmVEZWZpbmVkKCk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIGRlc2NyaWJlKCdhcHAgcHJvamVjdHMnLCAoKSA9PiB7XG4gICAgICBpdCgnc2hvdWxkIGNyZWF0ZSB0d28gcHJvamVjdHMgcGVyIGFwcCcsICgpID0+IHtcbiAgICAgICAgdHJlZS5jcmVhdGUob2xkQ29uZmlnUGF0aCwgSlNPTi5zdHJpbmdpZnkoYmFzZUNvbmZpZywgbnVsbCwgMikpO1xuICAgICAgICB0cmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnbWlncmF0aW9uLTAxJywgZGVmYXVsdE9wdGlvbnMsIHRyZWUpO1xuICAgICAgICBjb25zdCBjb25maWcgPSBnZXRDb25maWcodHJlZSk7XG4gICAgICAgIGV4cGVjdChPYmplY3Qua2V5cyhjb25maWcucHJvamVjdHMpLmxlbmd0aCkudG9FcXVhbCgyKTtcbiAgICAgIH0pO1xuXG4gICAgICBpdCgnc2hvdWxkIGNyZWF0ZSB0d28gcHJvamVjdHMgcGVyIGFwcCcsICgpID0+IHtcbiAgICAgICAgYmFzZUNvbmZpZy5hcHBzLnB1c2goYmFzZUNvbmZpZy5hcHBzWzBdKTtcbiAgICAgICAgdHJlZS5jcmVhdGUob2xkQ29uZmlnUGF0aCwgSlNPTi5zdHJpbmdpZnkoYmFzZUNvbmZpZywgbnVsbCwgMikpO1xuICAgICAgICB0cmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnbWlncmF0aW9uLTAxJywgZGVmYXVsdE9wdGlvbnMsIHRyZWUpO1xuICAgICAgICBjb25zdCBjb25maWcgPSBnZXRDb25maWcodHJlZSk7XG4gICAgICAgIGV4cGVjdChPYmplY3Qua2V5cyhjb25maWcucHJvamVjdHMpLmxlbmd0aCkudG9FcXVhbCg0KTtcbiAgICAgIH0pO1xuXG4gICAgICBpdCgnc2hvdWxkIHVzZSB0aGUgYXBwIG5hbWUgaWYgZGVmaW5lZCcsICgpID0+IHtcbiAgICAgICAgYmFzZUNvbmZpZy5hcHBzWzBdLm5hbWUgPSAnZm9vJztcbiAgICAgICAgYmFzZUNvbmZpZy5hcHBzLnB1c2goYmFzZUNvbmZpZy5hcHBzWzBdKTtcbiAgICAgICAgdHJlZS5jcmVhdGUob2xkQ29uZmlnUGF0aCwgSlNPTi5zdHJpbmdpZnkoYmFzZUNvbmZpZywgbnVsbCwgMikpO1xuICAgICAgICB0cmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnbWlncmF0aW9uLTAxJywgZGVmYXVsdE9wdGlvbnMsIHRyZWUpO1xuICAgICAgICBjb25zdCBjb25maWcgPSBnZXRDb25maWcodHJlZSk7XG4gICAgICAgIGV4cGVjdChjb25maWcucHJvamVjdHMuZm9vKS50b0JlRGVmaW5lZCgpO1xuICAgICAgICBleHBlY3QoY29uZmlnLnByb2plY3RzWydmb28tZTJlJ10pLnRvQmVEZWZpbmVkKCk7XG4gICAgICB9KTtcblxuICAgICAgaXQoJ3Nob3VsZCBzZXQgdGhlIHByb2plY3Qgcm9vdCB2YWx1ZXMnLCAoKSA9PiB7XG4gICAgICAgIHRyZWUuY3JlYXRlKG9sZENvbmZpZ1BhdGgsIEpTT04uc3RyaW5naWZ5KGJhc2VDb25maWcsIG51bGwsIDIpKTtcbiAgICAgICAgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ21pZ3JhdGlvbi0wMScsIGRlZmF1bHRPcHRpb25zLCB0cmVlKTtcbiAgICAgICAgY29uc3QgcHJvamVjdCA9IGdldENvbmZpZyh0cmVlKS5wcm9qZWN0cy5mb287XG4gICAgICAgIGV4cGVjdChwcm9qZWN0LnJvb3QpLnRvRXF1YWwoJycpO1xuICAgICAgICBleHBlY3QocHJvamVjdC5zb3VyY2VSb290KS50b0VxdWFsKCdzcmMnKTtcbiAgICAgICAgZXhwZWN0KHByb2plY3QucHJvamVjdFR5cGUpLnRvRXF1YWwoJ2FwcGxpY2F0aW9uJyk7XG4gICAgICB9KTtcblxuICAgICAgaXQoJ3Nob3VsZCBzZXQgdGhlIHByb2plY3Qgcm9vdCB2YWx1ZXMgZm9yIGEgZGlmZmVyZW50IHJvb3QnLCAoKSA9PiB7XG4gICAgICAgIGJhc2VDb25maWcuYXBwc1swXS5yb290ID0gJ2FwcHMvYXBwMS9zcmMnO1xuICAgICAgICB0cmVlLmNyZWF0ZShvbGRDb25maWdQYXRoLCBKU09OLnN0cmluZ2lmeShiYXNlQ29uZmlnLCBudWxsLCAyKSk7XG4gICAgICAgIHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdtaWdyYXRpb24tMDEnLCBkZWZhdWx0T3B0aW9ucywgdHJlZSk7XG4gICAgICAgIGNvbnN0IHByb2plY3QgPSBnZXRDb25maWcodHJlZSkucHJvamVjdHMuZm9vO1xuICAgICAgICBleHBlY3QocHJvamVjdC5yb290KS50b0VxdWFsKCdhcHBzL2FwcDEnKTtcbiAgICAgICAgZXhwZWN0KHByb2plY3Quc291cmNlUm9vdCkudG9FcXVhbCgnYXBwcy9hcHAxL3NyYycpO1xuICAgICAgICBleHBlY3QocHJvamVjdC5wcm9qZWN0VHlwZSkudG9FcXVhbCgnYXBwbGljYXRpb24nKTtcbiAgICAgIH0pO1xuXG4gICAgICBpdCgnc2hvdWxkIHNldCBidWlsZCB0YXJnZXQnLCAoKSA9PiB7XG4gICAgICAgIHRyZWUuY3JlYXRlKG9sZENvbmZpZ1BhdGgsIEpTT04uc3RyaW5naWZ5KGJhc2VDb25maWcsIG51bGwsIDIpKTtcbiAgICAgICAgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ21pZ3JhdGlvbi0wMScsIGRlZmF1bHRPcHRpb25zLCB0cmVlKTtcbiAgICAgICAgY29uc3QgYnVpbGQgPSBnZXRDb25maWcodHJlZSkucHJvamVjdHMuZm9vLmFyY2hpdGVjdC5idWlsZDtcbiAgICAgICAgZXhwZWN0KGJ1aWxkLmJ1aWxkZXIpLnRvRXF1YWwoJ0Bhbmd1bGFyLWRldmtpdC9idWlsZC1hbmd1bGFyOmJyb3dzZXInKTtcbiAgICAgICAgZXhwZWN0KGJ1aWxkLm9wdGlvbnMuc2NyaXB0cykudG9FcXVhbChbXSk7XG4gICAgICAgIGV4cGVjdChidWlsZC5vcHRpb25zLnN0eWxlcykudG9FcXVhbChbJ3NyYy9zdHlsZXMuY3NzJ10pO1xuICAgICAgICBleHBlY3QoYnVpbGQub3B0aW9ucy5zdHlsZVByZXByb2Nlc3Nvck9wdGlvbnMpLnRvRXF1YWwoe2luY2x1ZGVQYXRoczogWydzcmMvc3R5bGVJbmMnXX0pO1xuICAgICAgICBleHBlY3QoYnVpbGQub3B0aW9ucy5hc3NldHMpLnRvRXF1YWwoW1xuICAgICAgICAgICdzcmMvYXNzZXRzJyxcbiAgICAgICAgICAnc3JjL2Zhdmljb24uaWNvJyxcbiAgICAgICAgICB7IGdsb2I6ICcqKi8qJywgaW5wdXQ6ICdzcmMvYXNzZXRzJywgb3V0cHV0OiAnL2Fzc2V0cycgfSxcbiAgICAgICAgICB7IGdsb2I6ICdmYXZpY29uLmljbycsIGlucHV0OiAnc3JjJywgb3V0cHV0OiAnLycgfSxcbiAgICAgICAgXSk7XG4gICAgICAgIGV4cGVjdChidWlsZC5vcHRpb25zLm5hbWVkQ2h1bmtzKS50b0VxdWFsKHRydWUpO1xuICAgICAgICBleHBlY3QoYnVpbGQuY29uZmlndXJhdGlvbnMpLnRvRXF1YWwoe1xuICAgICAgICAgIHByb2R1Y3Rpb246IHtcbiAgICAgICAgICAgIG9wdGltaXphdGlvbjogdHJ1ZSxcbiAgICAgICAgICAgIG91dHB1dEhhc2hpbmc6ICdhbGwnLFxuICAgICAgICAgICAgc291cmNlTWFwOiBmYWxzZSxcbiAgICAgICAgICAgIGV4dHJhY3RDc3M6IHRydWUsXG4gICAgICAgICAgICBuYW1lZENodW5rczogZmFsc2UsXG4gICAgICAgICAgICBhb3Q6IHRydWUsXG4gICAgICAgICAgICBleHRyYWN0TGljZW5zZXM6IHRydWUsXG4gICAgICAgICAgICB2ZW5kb3JDaHVuazogZmFsc2UsXG4gICAgICAgICAgICBidWlsZE9wdGltaXplcjogdHJ1ZSxcbiAgICAgICAgICAgIGZpbGVSZXBsYWNlbWVudHM6IFt7XG4gICAgICAgICAgICAgIHJlcGxhY2U6ICdzcmMvZW52aXJvbm1lbnRzL2Vudmlyb25tZW50LnRzJyxcbiAgICAgICAgICAgICAgd2l0aDogJ3NyYy9lbnZpcm9ubWVudHMvZW52aXJvbm1lbnQucHJvZC50cycsXG4gICAgICAgICAgICB9XSxcbiAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuXG4gICAgICBpdCgnc2hvdWxkIG5vdCBzZXQgYmFzZUhyZWYgb24gYnVpbGQgJiBzZXJ2ZSB0YXJnZXRzIGlmIG5vdCBkZWZpbmVkJywgKCkgPT4ge1xuICAgICAgICB0cmVlLmNyZWF0ZShvbGRDb25maWdQYXRoLCBKU09OLnN0cmluZ2lmeShiYXNlQ29uZmlnLCBudWxsLCAyKSk7XG4gICAgICAgIHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdtaWdyYXRpb24tMDEnLCBkZWZhdWx0T3B0aW9ucywgdHJlZSk7XG4gICAgICAgIGNvbnN0IGJ1aWxkID0gZ2V0Q29uZmlnKHRyZWUpLnByb2plY3RzLmZvby5hcmNoaXRlY3QuYnVpbGQ7XG4gICAgICAgIGV4cGVjdChidWlsZC5vcHRpb25zLmJhc2VIcmVmKS50b0JlVW5kZWZpbmVkKCk7XG4gICAgICB9KTtcblxuICAgICAgaXQoJ3Nob3VsZCBzZXQgYmFzZUhyZWYgb24gYnVpbGQgJiBzZXJ2ZSB0YXJnZXRzIGlmIGRlZmluZWQnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGNvbmZpZyA9IHsuLi5iYXNlQ29uZmlnfTtcbiAgICAgICAgY29uZmlnLmFwcHNbMF0uYmFzZUhyZWYgPSAnL2Jhc2UvaHJlZi8nO1xuICAgICAgICB0cmVlLmNyZWF0ZShvbGRDb25maWdQYXRoLCBKU09OLnN0cmluZ2lmeShjb25maWcsIG51bGwsIDIpKTtcbiAgICAgICAgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ21pZ3JhdGlvbi0wMScsIGRlZmF1bHRPcHRpb25zLCB0cmVlKTtcbiAgICAgICAgY29uc3QgYnVpbGQgPSBnZXRDb25maWcodHJlZSkucHJvamVjdHMuZm9vLmFyY2hpdGVjdC5idWlsZDtcbiAgICAgICAgZXhwZWN0KGJ1aWxkLm9wdGlvbnMuYmFzZUhyZWYpLnRvRXF1YWwoJy9iYXNlL2hyZWYvJyk7XG4gICAgICB9KTtcblxuICAgICAgaXQoJ3Nob3VsZCBhZGQgc2VydmljZVdvcmtlciB0byBwcm9kdWN0aW9uIGNvbmZpZ3VyYXRpb24nLCAoKSA9PiB7XG4gICAgICAgIGJhc2VDb25maWcuYXBwc1swXS5zZXJ2aWNlV29ya2VyID0gdHJ1ZTtcbiAgICAgICAgdHJlZS5jcmVhdGUob2xkQ29uZmlnUGF0aCwgSlNPTi5zdHJpbmdpZnkoYmFzZUNvbmZpZywgbnVsbCwgMikpO1xuICAgICAgICB0cmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnbWlncmF0aW9uLTAxJywgZGVmYXVsdE9wdGlvbnMsIHRyZWUpO1xuICAgICAgICBjb25zdCBjb25maWcgPSBnZXRDb25maWcodHJlZSk7XG4gICAgICAgIGV4cGVjdChjb25maWcucHJvamVjdHMuZm9vLmFyY2hpdGVjdC5idWlsZC5vcHRpb25zLnNlcnZpY2VXb3JrZXIpLnRvQmVVbmRlZmluZWQoKTtcbiAgICAgICAgZXhwZWN0KFxuICAgICAgICAgIGNvbmZpZy5wcm9qZWN0cy5mb28uYXJjaGl0ZWN0LmJ1aWxkLmNvbmZpZ3VyYXRpb25zLnByb2R1Y3Rpb24uc2VydmljZVdvcmtlcixcbiAgICAgICAgKS50b0JlKHRydWUpO1xuICAgICAgfSk7XG5cbiAgICAgIGl0KCdzaG91bGQgc2V0IHRoZSBzZXJ2ZSB0YXJnZXQnLCAoKSA9PiB7XG4gICAgICAgIHRyZWUuY3JlYXRlKG9sZENvbmZpZ1BhdGgsIEpTT04uc3RyaW5naWZ5KGJhc2VDb25maWcsIG51bGwsIDIpKTtcbiAgICAgICAgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ21pZ3JhdGlvbi0wMScsIGRlZmF1bHRPcHRpb25zLCB0cmVlKTtcbiAgICAgICAgY29uc3Qgc2VydmUgPSBnZXRDb25maWcodHJlZSkucHJvamVjdHMuZm9vLmFyY2hpdGVjdC5zZXJ2ZTtcbiAgICAgICAgZXhwZWN0KHNlcnZlLmJ1aWxkZXIpLnRvRXF1YWwoJ0Bhbmd1bGFyLWRldmtpdC9idWlsZC1hbmd1bGFyOmRldi1zZXJ2ZXInKTtcbiAgICAgICAgZXhwZWN0KHNlcnZlLm9wdGlvbnMpLnRvRXF1YWwoe1xuICAgICAgICAgIGJyb3dzZXJUYXJnZXQ6ICdmb286YnVpbGQnLFxuICAgICAgICAgIHBvcnQ6IDgwODAsXG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCBwcm9kQ29uZmlnID0gc2VydmUuY29uZmlndXJhdGlvbnMucHJvZHVjdGlvbjtcbiAgICAgICAgZXhwZWN0KHByb2RDb25maWcuYnJvd3NlclRhcmdldCkudG9FcXVhbCgnZm9vOmJ1aWxkOnByb2R1Y3Rpb24nKTtcbiAgICAgIH0pO1xuXG4gICAgICBpdCgnc2hvdWxkIHNldCB0aGUgdGVzdCB0YXJnZXQnLCAoKSA9PiB7XG4gICAgICAgIHRyZWUuY3JlYXRlKG9sZENvbmZpZ1BhdGgsIEpTT04uc3RyaW5naWZ5KGJhc2VDb25maWcsIG51bGwsIDIpKTtcbiAgICAgICAgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ21pZ3JhdGlvbi0wMScsIGRlZmF1bHRPcHRpb25zLCB0cmVlKTtcbiAgICAgICAgY29uc3QgdGVzdCA9IGdldENvbmZpZyh0cmVlKS5wcm9qZWN0cy5mb28uYXJjaGl0ZWN0Wyd0ZXN0J107XG4gICAgICAgIGV4cGVjdCh0ZXN0LmJ1aWxkZXIpLnRvRXF1YWwoJ0Bhbmd1bGFyLWRldmtpdC9idWlsZC1hbmd1bGFyOmthcm1hJyk7XG4gICAgICAgIGV4cGVjdCh0ZXN0Lm9wdGlvbnMubWFpbikudG9FcXVhbCgnc3JjL3Rlc3QudHMnKTtcbiAgICAgICAgZXhwZWN0KHRlc3Qub3B0aW9ucy5wb2x5ZmlsbHMpLnRvRXF1YWwoJ3NyYy9wb2x5ZmlsbHMudHMnKTtcbiAgICAgICAgZXhwZWN0KHRlc3Qub3B0aW9ucy50c0NvbmZpZykudG9FcXVhbCgnc3JjL3RzY29uZmlnLnNwZWMuanNvbicpO1xuICAgICAgICBleHBlY3QodGVzdC5vcHRpb25zLmthcm1hQ29uZmlnKS50b0VxdWFsKCcuL2thcm1hLmNvbmYuanMnKTtcbiAgICAgICAgZXhwZWN0KHRlc3Qub3B0aW9ucy5zY3JpcHRzKS50b0VxdWFsKFtdKTtcbiAgICAgICAgZXhwZWN0KHRlc3Qub3B0aW9ucy5zdHlsZXMpLnRvRXF1YWwoWydzcmMvc3R5bGVzLmNzcyddKTtcbiAgICAgICAgZXhwZWN0KHRlc3Qub3B0aW9ucy5hc3NldHMpLnRvRXF1YWwoW1xuICAgICAgICAgICdzcmMvYXNzZXRzJyxcbiAgICAgICAgICAnc3JjL2Zhdmljb24uaWNvJyxcbiAgICAgICAgICB7IGdsb2I6ICcqKi8qJywgaW5wdXQ6ICdzcmMvYXNzZXRzJywgb3V0cHV0OiAnL2Fzc2V0cycgfSxcbiAgICAgICAgICB7IGdsb2I6ICdmYXZpY29uLmljbycsIGlucHV0OiAnc3JjJywgb3V0cHV0OiAnLycgfSxcbiAgICAgICAgXSk7XG4gICAgICB9KTtcblxuICAgICAgaXQoJ3Nob3VsZCBzZXQgdGhlIGV4dHJhY3QgaTE4biB0YXJnZXQnLCAoKSA9PiB7XG4gICAgICAgIHRyZWUuY3JlYXRlKG9sZENvbmZpZ1BhdGgsIEpTT04uc3RyaW5naWZ5KGJhc2VDb25maWcsIG51bGwsIDIpKTtcbiAgICAgICAgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ21pZ3JhdGlvbi0wMScsIGRlZmF1bHRPcHRpb25zLCB0cmVlKTtcbiAgICAgICAgY29uc3QgZXh0cmFjdCA9IGdldENvbmZpZyh0cmVlKS5wcm9qZWN0cy5mb28uYXJjaGl0ZWN0WydleHRyYWN0LWkxOG4nXTtcbiAgICAgICAgZXhwZWN0KGV4dHJhY3QuYnVpbGRlcikudG9FcXVhbCgnQGFuZ3VsYXItZGV2a2l0L2J1aWxkLWFuZ3VsYXI6ZXh0cmFjdC1pMThuJyk7XG4gICAgICAgIGV4cGVjdChleHRyYWN0Lm9wdGlvbnMpLnRvQmVEZWZpbmVkKCk7XG4gICAgICAgIGV4cGVjdChleHRyYWN0Lm9wdGlvbnMuYnJvd3NlclRhcmdldCkudG9FcXVhbChgZm9vOmJ1aWxkYCApO1xuICAgICAgfSk7XG5cbiAgICAgIGl0KCdzaG91bGQgc2V0IHRoZSBsaW50IHRhcmdldCcsICgpID0+IHtcbiAgICAgICAgdHJlZS5jcmVhdGUob2xkQ29uZmlnUGF0aCwgSlNPTi5zdHJpbmdpZnkoYmFzZUNvbmZpZywgbnVsbCwgMikpO1xuICAgICAgICB0cmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnbWlncmF0aW9uLTAxJywgZGVmYXVsdE9wdGlvbnMsIHRyZWUpO1xuICAgICAgICBjb25zdCB0c2xpbnQgPSBnZXRDb25maWcodHJlZSkucHJvamVjdHMuZm9vLmFyY2hpdGVjdFsnbGludCddO1xuICAgICAgICBleHBlY3QodHNsaW50LmJ1aWxkZXIpLnRvRXF1YWwoJ0Bhbmd1bGFyLWRldmtpdC9idWlsZC1hbmd1bGFyOnRzbGludCcpO1xuICAgICAgICBleHBlY3QodHNsaW50Lm9wdGlvbnMpLnRvQmVEZWZpbmVkKCk7XG4gICAgICAgIGV4cGVjdCh0c2xpbnQub3B0aW9ucy50c0NvbmZpZylcbiAgICAgICAgICAudG9FcXVhbChbJ3NyYy90c2NvbmZpZy5hcHAuanNvbicsICdzcmMvdHNjb25maWcuc3BlYy5qc29uJ10pO1xuICAgICAgICBleHBlY3QodHNsaW50Lm9wdGlvbnMuZXhjbHVkZSkudG9FcXVhbChbICcqKi9ub2RlX21vZHVsZXMvKionIF0pO1xuICAgICAgfSk7XG5cbiAgICAgIGl0KCdzaG91bGQgc2V0IHRoZSBidWRnZXRzIGNvbmZpZ3VyYXRpb24nLCAoKSA9PiB7XG4gICAgICAgIGJhc2VDb25maWcuYXBwc1swXS5idWRnZXRzID0gW3tcbiAgICAgICAgICB0eXBlOiAnYnVuZGxlJyxcbiAgICAgICAgICBuYW1lOiAnbWFpbicsXG4gICAgICAgICAgZXJyb3I6ICcxMjNrYicsXG4gICAgICAgIH1dO1xuXG4gICAgICAgIHRyZWUuY3JlYXRlKG9sZENvbmZpZ1BhdGgsIEpTT04uc3RyaW5naWZ5KGJhc2VDb25maWcsIG51bGwsIDIpKTtcbiAgICAgICAgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ21pZ3JhdGlvbi0wMScsIGRlZmF1bHRPcHRpb25zLCB0cmVlKTtcbiAgICAgICAgY29uc3QgY29uZmlnID0gZ2V0Q29uZmlnKHRyZWUpO1xuICAgICAgICBjb25zdCBidWRnZXRzID0gY29uZmlnLnByb2plY3RzLmZvby5hcmNoaXRlY3QuYnVpbGQuY29uZmlndXJhdGlvbnMucHJvZHVjdGlvbi5idWRnZXRzO1xuICAgICAgICBleHBlY3QoYnVkZ2V0cy5sZW5ndGgpLnRvRXF1YWwoMSk7XG4gICAgICAgIGV4cGVjdChidWRnZXRzWzBdLnR5cGUpLnRvRXF1YWwoJ2J1bmRsZScpO1xuICAgICAgICBleHBlY3QoYnVkZ2V0c1swXS5uYW1lKS50b0VxdWFsKCdtYWluJyk7XG4gICAgICAgIGV4cGVjdChidWRnZXRzWzBdLmVycm9yKS50b0VxdWFsKCcxMjNrYicpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBkZXNjcmliZSgnZTJlIHByb2plY3RzJywgKCkgPT4ge1xuICAgICAgaXQoJ3Nob3VsZCBzZXQgdGhlIHByb2plY3Qgcm9vdCB2YWx1ZXMnLCAoKSA9PiB7XG4gICAgICAgIHRyZWUuY3JlYXRlKG9sZENvbmZpZ1BhdGgsIEpTT04uc3RyaW5naWZ5KGJhc2VDb25maWcsIG51bGwsIDIpKTtcbiAgICAgICAgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ21pZ3JhdGlvbi0wMScsIGRlZmF1bHRPcHRpb25zLCB0cmVlKTtcbiAgICAgICAgY29uc3QgZTJlUHJvamVjdCA9IGdldENvbmZpZyh0cmVlKS5wcm9qZWN0c1snZm9vLWUyZSddO1xuICAgICAgICBleHBlY3QoZTJlUHJvamVjdC5yb290KS50b0JlKCcnKTtcbiAgICAgICAgZXhwZWN0KGUyZVByb2plY3Quc291cmNlUm9vdCkudG9CZSgnZTJlJyk7XG4gICAgICAgIGNvbnN0IGUyZU9wdGlvbnMgPSBlMmVQcm9qZWN0LmFyY2hpdGVjdC5lMmU7XG4gICAgICAgIGV4cGVjdChlMmVPcHRpb25zLmJ1aWxkZXIpLnRvRXF1YWwoJ0Bhbmd1bGFyLWRldmtpdC9idWlsZC1hbmd1bGFyOnByb3RyYWN0b3InKTtcbiAgICAgICAgY29uc3Qgb3B0aW9ucyA9IGUyZU9wdGlvbnMub3B0aW9ucztcbiAgICAgICAgZXhwZWN0KG9wdGlvbnMucHJvdHJhY3RvckNvbmZpZykudG9FcXVhbCgnLi9wcm90cmFjdG9yLmNvbmYuanMnKTtcbiAgICAgICAgZXhwZWN0KG9wdGlvbnMuZGV2U2VydmVyVGFyZ2V0KS50b0VxdWFsKCdmb286c2VydmUnKTtcbiAgICAgIH0pO1xuXG4gICAgICBpdCgnc2hvdWxkIHNldCB0aGUgcHJvamVjdCByb290IHZhbHVlcyBmb3IgYSBkaWZmZXJlbnQgcm9vdCcsICgpID0+IHtcbiAgICAgICAgYmFzZUNvbmZpZy5hcHBzWzBdLnJvb3QgPSAnYXBwcy9hcHAxL3NyYyc7XG4gICAgICAgIHRyZWUuY3JlYXRlKG9sZENvbmZpZ1BhdGgsIEpTT04uc3RyaW5naWZ5KGJhc2VDb25maWcsIG51bGwsIDIpKTtcbiAgICAgICAgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ21pZ3JhdGlvbi0wMScsIGRlZmF1bHRPcHRpb25zLCB0cmVlKTtcbiAgICAgICAgY29uc3QgZTJlUHJvamVjdCA9IGdldENvbmZpZyh0cmVlKS5wcm9qZWN0c1snZm9vLWUyZSddO1xuICAgICAgICBleHBlY3QoZTJlUHJvamVjdC5yb290KS50b0JlKCdhcHBzL2FwcDEnKTtcbiAgICAgICAgZXhwZWN0KGUyZVByb2plY3Quc291cmNlUm9vdCkudG9CZSgnYXBwcy9hcHAxL2UyZScpO1xuICAgICAgICBjb25zdCBlMmVPcHRpb25zID0gZTJlUHJvamVjdC5hcmNoaXRlY3QuZTJlO1xuICAgICAgICBleHBlY3QoZTJlT3B0aW9ucy5idWlsZGVyKS50b0VxdWFsKCdAYW5ndWxhci1kZXZraXQvYnVpbGQtYW5ndWxhcjpwcm90cmFjdG9yJyk7XG4gICAgICAgIGNvbnN0IG9wdGlvbnMgPSBlMmVPcHRpb25zLm9wdGlvbnM7XG4gICAgICAgIGV4cGVjdChvcHRpb25zLnByb3RyYWN0b3JDb25maWcpLnRvRXF1YWwoJy4vcHJvdHJhY3Rvci5jb25mLmpzJyk7XG4gICAgICAgIGV4cGVjdChvcHRpb25zLmRldlNlcnZlclRhcmdldCkudG9FcXVhbCgnZm9vOnNlcnZlJyk7XG4gICAgICB9KTtcblxuICAgICAgaXQoJ3Nob3VsZCBzZXQgdGhlIGxpbnQgdGFyZ2V0JywgKCkgPT4ge1xuICAgICAgICB0cmVlLmNyZWF0ZShvbGRDb25maWdQYXRoLCBKU09OLnN0cmluZ2lmeShiYXNlQ29uZmlnLCBudWxsLCAyKSk7XG4gICAgICAgIHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdtaWdyYXRpb24tMDEnLCBkZWZhdWx0T3B0aW9ucywgdHJlZSk7XG4gICAgICAgIGNvbnN0IHRzbGludCA9IGdldENvbmZpZyh0cmVlKS5wcm9qZWN0c1snZm9vLWUyZSddLmFyY2hpdGVjdC5saW50O1xuICAgICAgICBleHBlY3QodHNsaW50LmJ1aWxkZXIpLnRvRXF1YWwoJ0Bhbmd1bGFyLWRldmtpdC9idWlsZC1hbmd1bGFyOnRzbGludCcpO1xuICAgICAgICBleHBlY3QodHNsaW50Lm9wdGlvbnMpLnRvQmVEZWZpbmVkKCk7XG4gICAgICAgIGV4cGVjdCh0c2xpbnQub3B0aW9ucy50c0NvbmZpZykudG9FcXVhbChbJ2UyZS90c2NvbmZpZy5lMmUuanNvbiddKTtcbiAgICAgICAgZXhwZWN0KHRzbGludC5vcHRpb25zLmV4Y2x1ZGUpLnRvRXF1YWwoWyAnKiovbm9kZV9tb2R1bGVzLyoqJyBdKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgna2FybWEgY29uZmlnJywgKCkgPT4ge1xuICAgIGNvbnN0IGthcm1hUGF0aCA9ICcva2FybWEuY29uZi5qcyc7XG4gICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICB0cmVlLmNyZWF0ZShrYXJtYVBhdGgsIGBcbiAgICAgICAgLy8gQGFuZ3VsYXIvY2xpXG4gICAgICAgIC8vIHJlcG9ydHNcbiAgICAgIGApO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCByZXBsYWNlIHJlZmVyZW5jZXMgdG8gXCJAYW5ndWxhci9jbGlcIicsICgpID0+IHtcbiAgICAgIHRyZWUuY3JlYXRlKG9sZENvbmZpZ1BhdGgsIEpTT04uc3RyaW5naWZ5KGJhc2VDb25maWcsIG51bGwsIDIpKTtcbiAgICAgIHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdtaWdyYXRpb24tMDEnLCBkZWZhdWx0T3B0aW9ucywgdHJlZSk7XG4gICAgICBjb25zdCBjb250ZW50ID0gdHJlZS5yZWFkQ29udGVudChrYXJtYVBhdGgpO1xuICAgICAgZXhwZWN0KGNvbnRlbnQpLm5vdC50b0NvbnRhaW4oJ0Bhbmd1bGFyL2NsaScpO1xuICAgICAgZXhwZWN0KGNvbnRlbnQpLnRvQ29udGFpbignQGFuZ3VsYXItZGV2a2l0L2J1aWxkLWFuZ3VsYXInKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgcmVwbGFjZSByZWZlcmVuY2VzIHRvIFwicmVwb3J0c1wiJywgKCkgPT4ge1xuICAgICAgdHJlZS5jcmVhdGUob2xkQ29uZmlnUGF0aCwgSlNPTi5zdHJpbmdpZnkoYmFzZUNvbmZpZywgbnVsbCwgMikpO1xuICAgICAgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ21pZ3JhdGlvbi0wMScsIGRlZmF1bHRPcHRpb25zLCB0cmVlKTtcbiAgICAgIGNvbnN0IGNvbnRlbnQgPSB0cmVlLnJlYWRDb250ZW50KGthcm1hUGF0aCk7XG4gICAgICBleHBlY3QoY29udGVudCkudG9Db250YWluKGBkaXI6IHJlcXVpcmUoJ3BhdGgnKS5qb2luKF9fZGlybmFtZSwgJ2NvdmVyYWdlJyksIHJlcG9ydHNgKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgcmVtb3ZlIHVudXNlZCBwcm9wZXJ0aWVzIGluIDEuMCBjb25maWdzJywgKCkgPT4ge1xuICAgICAgdHJlZS5vdmVyd3JpdGUoa2FybWFQYXRoLCBgXG4gICAgICAgIGZpbGVzOiBbXG4gICAgICAgICAgeyBwYXR0ZXJuOiAnLi9zcmMvdGVzdC50cycsIHdhdGNoZWQ6IGZhbHNlIH1cbiAgICAgICAgXSxcbiAgICAgICAgcHJlcHJvY2Vzc29yczoge1xuICAgICAgICAgICcuL3NyYy90ZXN0LnRzJzogWydAYW5ndWxhci9jbGknXVxuICAgICAgICB9LFxuICAgICAgICBhbmd1bGFyQ2xpOiB7XG4gICAgICAgICAgZW52aXJvbm1lbnQ6ICdkZXYnXG4gICAgICAgIH0sXG4gICAgICBgKTtcblxuICAgICAgdHJlZS5jcmVhdGUob2xkQ29uZmlnUGF0aCwgSlNPTi5zdHJpbmdpZnkoYmFzZUNvbmZpZywgbnVsbCwgMikpO1xuICAgICAgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ21pZ3JhdGlvbi0wMScsIGRlZmF1bHRPcHRpb25zLCB0cmVlKTtcbiAgICAgIGNvbnN0IGNvbnRlbnQgPSB0cmVlLnJlYWRDb250ZW50KGthcm1hUGF0aCk7XG4gICAgICBleHBlY3QoY29udGVudCkubm90LnRvQ29udGFpbihgeyBwYXR0ZXJuOiAnLi9zcmMvdGVzdC50cycsIHdhdGNoZWQ6IGZhbHNlIH1gKTtcbiAgICAgIGV4cGVjdChjb250ZW50KS5ub3QudG9Db250YWluKGAnLi9zcmMvdGVzdC50cyc6IFsnQGFuZ3VsYXIvY2xpJ11gKTtcbiAgICAgIGV4cGVjdChjb250ZW50KS5ub3QudG9NYXRjaCgvYW5ndWxhckNsaVtefV0qfSw/Lyk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdzcGVjIHRzIGNvbmZpZycsICgpID0+IHtcbiAgICBjb25zdCB0ZXN0VHNjb25maWdQYXRoID0gJy9zcmMvdHNjb25maWcuc3BlYy5qc29uJztcbiAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgIHRyZWUuY3JlYXRlKHRlc3RUc2NvbmZpZ1BhdGgsIGBcbiAgICAgICAge1xuICAgICAgICAgIFwiZmlsZXNcIjogWyBcInRlc3QudHNcIiBdXG4gICAgICAgIH1cbiAgICAgIGApO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBhZGQgcG9seWZpbGxzJywgKCkgPT4ge1xuICAgICAgdHJlZS5jcmVhdGUob2xkQ29uZmlnUGF0aCwgSlNPTi5zdHJpbmdpZnkoYmFzZUNvbmZpZywgbnVsbCwgMikpO1xuICAgICAgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ21pZ3JhdGlvbi0wMScsIGRlZmF1bHRPcHRpb25zLCB0cmVlKTtcbiAgICAgIGNvbnN0IGNvbnRlbnQgPSB0cmVlLnJlYWRDb250ZW50KHRlc3RUc2NvbmZpZ1BhdGgpO1xuICAgICAgZXhwZWN0KGNvbnRlbnQpLnRvQ29udGFpbigncG9seWZpbGxzLnRzJyk7XG4gICAgICBjb25zdCBjb25maWcgPSBKU09OLnBhcnNlKGNvbnRlbnQpO1xuICAgICAgZXhwZWN0KGNvbmZpZy5maWxlcy5sZW5ndGgpLnRvRXF1YWwoMik7XG4gICAgICBleHBlY3QoY29uZmlnLmZpbGVzWzFdKS50b0VxdWFsKCdwb2x5ZmlsbHMudHMnKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgbm90IGFkZCBwb2x5ZmlsbHMgaXQgaWYgaXQgYWxyZWFkeSBleGlzdHMnLCAoKSA9PiB7XG4gICAgICB0cmVlLm92ZXJ3cml0ZSh0ZXN0VHNjb25maWdQYXRoLCBgXG4gICAgICAgIHtcbiAgICAgICAgICBcImZpbGVzXCI6IFsgXCJ0ZXN0LnRzXCIsIFwicG9seWZpbGxzLnRzXCIgXVxuICAgICAgICB9XG4gICAgICBgKTtcbiAgICAgIHRyZWUuY3JlYXRlKG9sZENvbmZpZ1BhdGgsIEpTT04uc3RyaW5naWZ5KGJhc2VDb25maWcsIG51bGwsIDIpKTtcbiAgICAgIHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdtaWdyYXRpb24tMDEnLCBkZWZhdWx0T3B0aW9ucywgdHJlZSk7XG4gICAgICBjb25zdCBjb250ZW50ID0gdHJlZS5yZWFkQ29udGVudCh0ZXN0VHNjb25maWdQYXRoKTtcbiAgICAgIGV4cGVjdChjb250ZW50KS50b0NvbnRhaW4oJ3BvbHlmaWxscy50cycpO1xuICAgICAgY29uc3QgY29uZmlnID0gSlNPTi5wYXJzZShjb250ZW50KTtcbiAgICAgIGV4cGVjdChjb25maWcuZmlsZXMubGVuZ3RoKS50b0VxdWFsKDIpO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgncGFja2FnZS5qc29uJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgYWRkIGEgZGV2IGRlcGVuZGVuY3kgdG8gQGFuZ3VsYXItZGV2a2l0L2J1aWxkLWFuZ3VsYXInLCAoKSA9PiB7XG4gICAgICB0cmVlLmNyZWF0ZShvbGRDb25maWdQYXRoLCBKU09OLnN0cmluZ2lmeShiYXNlQ29uZmlnLCBudWxsLCAyKSk7XG4gICAgICB0cmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnbWlncmF0aW9uLTAxJywgZGVmYXVsdE9wdGlvbnMsIHRyZWUpO1xuICAgICAgY29uc3QgY29udGVudCA9IHRyZWUucmVhZENvbnRlbnQoJy9wYWNrYWdlLmpzb24nKTtcbiAgICAgIGNvbnN0IHBrZyA9IEpTT04ucGFyc2UoY29udGVudCk7XG4gICAgICBleHBlY3QocGtnLmRldkRlcGVuZGVuY2llc1snQGFuZ3VsYXItZGV2a2l0L2J1aWxkLWFuZ3VsYXInXSlcbiAgICAgICAgLnRvQmUobGF0ZXN0VmVyc2lvbnMuRGV2a2l0QnVpbGRBbmd1bGFyKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgYWRkIGEgZGV2IGRlcGVuZGVuY3kgdG8gQGFuZ3VsYXItZGV2a2l0L2J1aWxkLWFuZ3VsYXIgKHByZXNlbnQpJywgKCkgPT4ge1xuICAgICAgdHJlZS5jcmVhdGUob2xkQ29uZmlnUGF0aCwgSlNPTi5zdHJpbmdpZnkoYmFzZUNvbmZpZywgbnVsbCwgMikpO1xuICAgICAgdHJlZS5vdmVyd3JpdGUoJy9wYWNrYWdlLmpzb24nLCBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgIGRldkRlcGVuZGVuY2llczoge1xuICAgICAgICAgICdAYW5ndWxhci1kZXZraXQvYnVpbGQtYW5ndWxhcic6ICcwLjAuMCcsXG4gICAgICAgIH0sXG4gICAgICB9LCBudWxsLCAyKSk7XG4gICAgICB0cmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnbWlncmF0aW9uLTAxJywgZGVmYXVsdE9wdGlvbnMsIHRyZWUpO1xuICAgICAgY29uc3QgY29udGVudCA9IHRyZWUucmVhZENvbnRlbnQoJy9wYWNrYWdlLmpzb24nKTtcbiAgICAgIGNvbnN0IHBrZyA9IEpTT04ucGFyc2UoY29udGVudCk7XG4gICAgICBleHBlY3QocGtnLmRldkRlcGVuZGVuY2llc1snQGFuZ3VsYXItZGV2a2l0L2J1aWxkLWFuZ3VsYXInXSlcbiAgICAgICAgLnRvQmUobGF0ZXN0VmVyc2lvbnMuRGV2a2l0QnVpbGRBbmd1bGFyKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgYWRkIGEgZGV2IGRlcGVuZGVuY3kgdG8gQGFuZ3VsYXItZGV2a2l0L2J1aWxkLWFuZ3VsYXIgKG5vIGRldiknLCAoKSA9PiB7XG4gICAgICB0cmVlLmNyZWF0ZShvbGRDb25maWdQYXRoLCBKU09OLnN0cmluZ2lmeShiYXNlQ29uZmlnLCBudWxsLCAyKSk7XG4gICAgICB0cmVlLm92ZXJ3cml0ZSgnL3BhY2thZ2UuanNvbicsIEpTT04uc3RyaW5naWZ5KHt9LCBudWxsLCAyKSk7XG4gICAgICB0cmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnbWlncmF0aW9uLTAxJywgZGVmYXVsdE9wdGlvbnMsIHRyZWUpO1xuICAgICAgY29uc3QgY29udGVudCA9IHRyZWUucmVhZENvbnRlbnQoJy9wYWNrYWdlLmpzb24nKTtcbiAgICAgIGNvbnN0IHBrZyA9IEpTT04ucGFyc2UoY29udGVudCk7XG4gICAgICBleHBlY3QocGtnLmRldkRlcGVuZGVuY2llc1snQGFuZ3VsYXItZGV2a2l0L2J1aWxkLWFuZ3VsYXInXSlcbiAgICAgICAgLnRvQmUobGF0ZXN0VmVyc2lvbnMuRGV2a2l0QnVpbGRBbmd1bGFyKTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ3RzbGludC5qc29uJywgKCkgPT4ge1xuICAgIGNvbnN0IHRzbGludFBhdGggPSAnL3RzbGludC5qc29uJztcbiAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tYW55XG4gICAgbGV0IHRzbGludENvbmZpZzogYW55O1xuICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgdHNsaW50Q29uZmlnID0ge1xuICAgICAgICBydWxlczoge1xuICAgICAgICAgICdpbXBvcnQtYmxhY2tsaXN0JzogWydzb21lJywgJ3J4anMnLCAnZWxzZSddLFxuICAgICAgICB9LFxuICAgICAgfTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgcmVtb3ZlIFwicnhqc1wiIGZyb20gdGhlIFwiaW1wb3J0LWJsYWNrbGlzdFwiIHJ1bGUnLCAoKSA9PiB7XG4gICAgICB0cmVlLmNyZWF0ZShvbGRDb25maWdQYXRoLCBKU09OLnN0cmluZ2lmeShiYXNlQ29uZmlnLCBudWxsLCAyKSk7XG4gICAgICB0cmVlLmNyZWF0ZSh0c2xpbnRQYXRoLCBKU09OLnN0cmluZ2lmeSh0c2xpbnRDb25maWcsIG51bGwsIDIpKTtcbiAgICAgIHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdtaWdyYXRpb24tMDEnLCBkZWZhdWx0T3B0aW9ucywgdHJlZSk7XG4gICAgICBjb25zdCB0c2xpbnQgPSBKU09OLnBhcnNlKHRyZWUucmVhZENvbnRlbnQodHNsaW50UGF0aCkpO1xuICAgICAgZXhwZWN0KHRzbGludC5ydWxlc1snaW1wb3J0LWJsYWNrbGlzdCddKS50b0VxdWFsKFsnc29tZScsICdlbHNlJ10pO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCByZW1vdmUgXCJyeGpzXCIgZnJvbSB0aGUgXCJpbXBvcnQtYmxhY2tsaXN0XCIgcnVsZSAob25seSknLCAoKSA9PiB7XG4gICAgICB0cmVlLmNyZWF0ZShvbGRDb25maWdQYXRoLCBKU09OLnN0cmluZ2lmeShiYXNlQ29uZmlnLCBudWxsLCAyKSk7XG4gICAgICB0c2xpbnRDb25maWcucnVsZXNbJ2ltcG9ydC1ibGFja2xpc3QnXSA9IFsncnhqcyddO1xuICAgICAgdHJlZS5jcmVhdGUodHNsaW50UGF0aCwgSlNPTi5zdHJpbmdpZnkodHNsaW50Q29uZmlnLCBudWxsLCAyKSk7XG4gICAgICB0cmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnbWlncmF0aW9uLTAxJywgZGVmYXVsdE9wdGlvbnMsIHRyZWUpO1xuICAgICAgY29uc3QgdHNsaW50ID0gSlNPTi5wYXJzZSh0cmVlLnJlYWRDb250ZW50KHRzbGludFBhdGgpKTtcbiAgICAgIGV4cGVjdCh0c2xpbnQucnVsZXNbJ2ltcG9ydC1ibGFja2xpc3QnXSkudG9FcXVhbChbXSk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIHJlbW92ZSBcInJ4anNcIiBmcm9tIHRoZSBcImltcG9ydC1ibGFja2xpc3RcIiBydWxlIChmaXJzdCknLCAoKSA9PiB7XG4gICAgICB0cmVlLmNyZWF0ZShvbGRDb25maWdQYXRoLCBKU09OLnN0cmluZ2lmeShiYXNlQ29uZmlnLCBudWxsLCAyKSk7XG4gICAgICB0c2xpbnRDb25maWcucnVsZXNbJ2ltcG9ydC1ibGFja2xpc3QnXSA9IFsncnhqcycsICdlbHNlJ107XG4gICAgICB0cmVlLmNyZWF0ZSh0c2xpbnRQYXRoLCBKU09OLnN0cmluZ2lmeSh0c2xpbnRDb25maWcsIG51bGwsIDIpKTtcbiAgICAgIHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdtaWdyYXRpb24tMDEnLCBkZWZhdWx0T3B0aW9ucywgdHJlZSk7XG4gICAgICBjb25zdCB0c2xpbnQgPSBKU09OLnBhcnNlKHRyZWUucmVhZENvbnRlbnQodHNsaW50UGF0aCkpO1xuICAgICAgZXhwZWN0KHRzbGludC5ydWxlc1snaW1wb3J0LWJsYWNrbGlzdCddKS50b0VxdWFsKFsnZWxzZSddKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgcmVtb3ZlIFwicnhqc1wiIGZyb20gdGhlIFwiaW1wb3J0LWJsYWNrbGlzdFwiIHJ1bGUgKGxhc3QpJywgKCkgPT4ge1xuICAgICAgdHJlZS5jcmVhdGUob2xkQ29uZmlnUGF0aCwgSlNPTi5zdHJpbmdpZnkoYmFzZUNvbmZpZywgbnVsbCwgMikpO1xuICAgICAgdHNsaW50Q29uZmlnLnJ1bGVzWydpbXBvcnQtYmxhY2tsaXN0J10gPSBbJ3NvbWUnLCAncnhqcyddO1xuICAgICAgdHJlZS5jcmVhdGUodHNsaW50UGF0aCwgSlNPTi5zdHJpbmdpZnkodHNsaW50Q29uZmlnLCBudWxsLCAyKSk7XG4gICAgICB0cmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnbWlncmF0aW9uLTAxJywgZGVmYXVsdE9wdGlvbnMsIHRyZWUpO1xuICAgICAgY29uc3QgdHNsaW50ID0gSlNPTi5wYXJzZSh0cmVlLnJlYWRDb250ZW50KHRzbGludFBhdGgpKTtcbiAgICAgIGV4cGVjdCh0c2xpbnQucnVsZXNbJ2ltcG9ydC1ibGFja2xpc3QnXSkudG9FcXVhbChbJ3NvbWUnXSk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIHdvcmsgaWYgXCJyeGpzXCIgaXMgbm90IGluIHRoZSBcImltcG9ydC1ibGFja2xpc3RcIiBydWxlJywgKCkgPT4ge1xuICAgICAgdHJlZS5jcmVhdGUob2xkQ29uZmlnUGF0aCwgSlNPTi5zdHJpbmdpZnkoYmFzZUNvbmZpZywgbnVsbCwgMikpO1xuICAgICAgdHNsaW50Q29uZmlnLnJ1bGVzWydpbXBvcnQtYmxhY2tsaXN0J10gPSBbXTtcbiAgICAgIHRyZWUuY3JlYXRlKHRzbGludFBhdGgsIEpTT04uc3RyaW5naWZ5KHRzbGludENvbmZpZywgbnVsbCwgMikpO1xuICAgICAgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ21pZ3JhdGlvbi0wMScsIGRlZmF1bHRPcHRpb25zLCB0cmVlKTtcbiAgICAgIGNvbnN0IHRzbGludCA9IEpTT04ucGFyc2UodHJlZS5yZWFkQ29udGVudCh0c2xpbnRQYXRoKSk7XG4gICAgICBjb25zdCBibGFja2xpc3QgPSB0c2xpbnQucnVsZXNbJ2ltcG9ydC1ibGFja2xpc3QnXTtcbiAgICAgIGV4cGVjdChibGFja2xpc3QpLnRvRXF1YWwoW10pO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnc2VydmVyL3VuaXZlcnNhbCBhcHBzJywgKCkgPT4ge1xuICAgIGxldCBzZXJ2ZXJBcHA7XG4gICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICBzZXJ2ZXJBcHAgPSB7XG4gICAgICAgIHBsYXRmb3JtOiAnc2VydmVyJyxcbiAgICAgICAgcm9vdDogJ3NyYycsXG4gICAgICAgIG91dERpcjogJ2Rpc3Qvc2VydmVyJyxcbiAgICAgICAgYXNzZXRzOiBbXG4gICAgICAgICAgJ2Fzc2V0cycsXG4gICAgICAgICAgJ2Zhdmljb24uaWNvJyxcbiAgICAgICAgXSxcbiAgICAgICAgaW5kZXg6ICdpbmRleC5odG1sJyxcbiAgICAgICAgbWFpbjogJ21haW4uc2VydmVyLnRzJyxcbiAgICAgICAgdGVzdDogJ3Rlc3QudHMnLFxuICAgICAgICB0c2NvbmZpZzogJ3RzY29uZmlnLnNlcnZlci5qc29uJyxcbiAgICAgICAgdGVzdFRzY29uZmlnOiAndHNjb25maWcuc3BlYy5qc29uJyxcbiAgICAgICAgcHJlZml4OiAnYXBwJyxcbiAgICAgICAgc3R5bGVzOiBbXG4gICAgICAgICAgJ3N0eWxlcy5jc3MnLFxuICAgICAgICBdLFxuICAgICAgICBzY3JpcHRzOiBbXSxcbiAgICAgICAgZW52aXJvbm1lbnRTb3VyY2U6ICdlbnZpcm9ubWVudHMvZW52aXJvbm1lbnQudHMnLFxuICAgICAgICBlbnZpcm9ubWVudHM6IHtcbiAgICAgICAgICBkZXY6ICdlbnZpcm9ubWVudHMvZW52aXJvbm1lbnQudHMnLFxuICAgICAgICAgIHByb2Q6ICdlbnZpcm9ubWVudHMvZW52aXJvbm1lbnQucHJvZC50cycsXG4gICAgICAgIH0sXG4gICAgICB9O1xuICAgICAgYmFzZUNvbmZpZy5hcHBzLnB1c2goc2VydmVyQXBwKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgbm90IGNyZWF0ZSBhIHNlcGFyYXRlIGFwcCBmb3Igc2VydmVyIGFwcHMnLCAoKSA9PiB7XG4gICAgICB0cmVlLmNyZWF0ZShvbGRDb25maWdQYXRoLCBKU09OLnN0cmluZ2lmeShiYXNlQ29uZmlnLCBudWxsLCAyKSk7XG4gICAgICB0cmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnbWlncmF0aW9uLTAxJywgZGVmYXVsdE9wdGlvbnMsIHRyZWUpO1xuICAgICAgY29uc3QgY29uZmlnID0gZ2V0Q29uZmlnKHRyZWUpO1xuICAgICAgY29uc3QgYXBwQ291bnQgPSBPYmplY3Qua2V5cyhjb25maWcucHJvamVjdHMpLmxlbmd0aDtcbiAgICAgIGV4cGVjdChhcHBDb3VudCkudG9FcXVhbCgyKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgY3JlYXRlIGEgc2VydmVyIHRhcmdldCcsICgpID0+IHtcbiAgICAgIHRyZWUuY3JlYXRlKG9sZENvbmZpZ1BhdGgsIEpTT04uc3RyaW5naWZ5KGJhc2VDb25maWcsIG51bGwsIDIpKTtcbiAgICAgIHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdtaWdyYXRpb24tMDEnLCBkZWZhdWx0T3B0aW9ucywgdHJlZSk7XG4gICAgICBjb25zdCBjb25maWcgPSBnZXRDb25maWcodHJlZSk7XG4gICAgICBjb25zdCB0YXJnZXQgPSBjb25maWcucHJvamVjdHMuZm9vLmFyY2hpdGVjdC5zZXJ2ZXI7XG4gICAgICBleHBlY3QodGFyZ2V0KS50b0JlRGVmaW5lZCgpO1xuICAgICAgZXhwZWN0KHRhcmdldC5idWlsZGVyKS50b0VxdWFsKCdAYW5ndWxhci1kZXZraXQvYnVpbGQtYW5ndWxhcjpzZXJ2ZXInKTtcbiAgICAgIGV4cGVjdCh0YXJnZXQub3B0aW9ucy5vdXRwdXRQYXRoKS50b0VxdWFsKCdkaXN0L3NlcnZlcicpO1xuICAgICAgZXhwZWN0KHRhcmdldC5vcHRpb25zLm1haW4pLnRvRXF1YWwoJ21haW4uc2VydmVyLnRzJyk7XG4gICAgICBleHBlY3QodGFyZ2V0Lm9wdGlvbnMudHNDb25maWcpLnRvRXF1YWwoJ3RzY29uZmlnLnNlcnZlci5qc29uJyk7XG4gICAgfSk7XG4gIH0pO1xufSk7XG4iXX0=