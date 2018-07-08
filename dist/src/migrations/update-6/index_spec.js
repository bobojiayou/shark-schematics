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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXhfc3BlYy5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvYm9iby9Xb3JrL2dpdGh1Yi9zaGFyay1zY2hlbWF0aWNzL3NyYy8iLCJzb3VyY2VzIjpbInNyYy9taWdyYXRpb25zL3VwZGF0ZS02L2luZGV4X3NwZWMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFRQSwyREFBdUQ7QUFDdkQsZ0VBQXVGO0FBQ3ZGLDZCQUE2QjtBQUM3QixtRUFBK0Q7QUFHL0QsUUFBUSxDQUFDLGlCQUFpQixFQUFFLEdBQUcsRUFBRTtJQUMvQixNQUFNLGVBQWUsR0FBRyxJQUFJLDZCQUFtQixDQUM3QyxZQUFZLEVBQ1osSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsOEJBQThCLENBQUMsQ0FDckQsQ0FBQztJQUVGLGtDQUFrQztJQUNsQyxJQUFJLFVBQWUsQ0FBQztJQUNwQixNQUFNLGNBQWMsR0FBRyxFQUFFLENBQUM7SUFDMUIsSUFBSSxJQUFrQixDQUFDO0lBQ3ZCLE1BQU0sYUFBYSxHQUFHLG9CQUFvQixDQUFDO0lBQzNDLE1BQU0sVUFBVSxHQUFHLGVBQWUsQ0FBQztJQUVuQyxVQUFVLENBQUMsR0FBRyxFQUFFO1FBQ2QsVUFBVSxHQUFHO1lBQ1gsTUFBTSxFQUFFLG9EQUFvRDtZQUM1RCxPQUFPLEVBQUU7Z0JBQ1AsSUFBSSxFQUFFLEtBQUs7YUFDWjtZQUNELElBQUksRUFBRTtnQkFDSjtvQkFDRSxJQUFJLEVBQUUsS0FBSztvQkFDWCxNQUFNLEVBQUUsTUFBTTtvQkFDZCxNQUFNLEVBQUU7d0JBQ04sUUFBUTt3QkFDUixhQUFhO3dCQUNiLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUU7d0JBQ3pELEVBQUUsSUFBSSxFQUFFLGFBQWEsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUU7d0JBQ2xEOzRCQUNFLE1BQU0sRUFBRSxRQUFROzRCQUNoQixP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LENBQUMsQ0FBQztZQUN2RSxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDekQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFDdEQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsT0FBTyxDQUFDLHNCQUFzQixDQUFDLENBQUM7UUFDbEUsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDLENBQUMsQ0FBQztBQUNMLENBQUMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHsgSnNvbk9iamVjdCB9IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9jb3JlJztcbmltcG9ydCB7IEVtcHR5VHJlZSB9IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9zY2hlbWF0aWNzJztcbmltcG9ydCB7IFNjaGVtYXRpY1Rlc3RSdW5uZXIsIFVuaXRUZXN0VHJlZSB9IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9zY2hlbWF0aWNzL3Rlc3RpbmcnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IGxhdGVzdFZlcnNpb25zIH0gZnJvbSAnLi4vLi4vdXRpbGl0eS9sYXRlc3QtdmVyc2lvbnMnO1xuXG5cbmRlc2NyaWJlKCdNaWdyYXRpb24gdG8gdjYnLCAoKSA9PiB7XG4gIGNvbnN0IHNjaGVtYXRpY1J1bm5lciA9IG5ldyBTY2hlbWF0aWNUZXN0UnVubmVyKFxuICAgICdtaWdyYXRpb25zJyxcbiAgICBwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4vbWlncmF0aW9uLWNvbGxlY3Rpb24uanNvbicpLFxuICApO1xuXG4gIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1hbnlcbiAgbGV0IGJhc2VDb25maWc6IGFueTtcbiAgY29uc3QgZGVmYXVsdE9wdGlvbnMgPSB7fTtcbiAgbGV0IHRyZWU6IFVuaXRUZXN0VHJlZTtcbiAgY29uc3Qgb2xkQ29uZmlnUGF0aCA9IGAvLmFuZ3VsYXItY2xpLmpzb25gO1xuICBjb25zdCBjb25maWdQYXRoID0gYC9hbmd1bGFyLmpzb25gO1xuXG4gIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgIGJhc2VDb25maWcgPSB7XG4gICAgICBzY2hlbWE6ICcuL25vZGVfbW9kdWxlcy9AYW5ndWxhci9jbGkvbGliL2NvbmZpZy9zY2hlbWEuanNvbicsXG4gICAgICBwcm9qZWN0OiB7XG4gICAgICAgIG5hbWU6ICdmb28nLFxuICAgICAgfSxcbiAgICAgIGFwcHM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHJvb3Q6ICdzcmMnLFxuICAgICAgICAgIG91dERpcjogJ2Rpc3QnLFxuICAgICAgICAgIGFzc2V0czogW1xuICAgICAgICAgICAgJ2Fzc2V0cycsXG4gICAgICAgICAgICAnZmF2aWNvbi5pY28nLFxuICAgICAgICAgICAgeyBnbG9iOiAnKiovKicsIGlucHV0OiAnLi9hc3NldHMvJywgb3V0cHV0OiAnLi9hc3NldHMvJyB9LFxuICAgICAgICAgICAgeyBnbG9iOiAnZmF2aWNvbi5pY28nLCBpbnB1dDogJy4vJywgb3V0cHV0OiAnLi8nIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICdnbG9iJzogJyoqLyouKicsXG4gICAgICAgICAgICAgICdpbnB1dCc6ICcuLi9zZXJ2ZXIvJyxcbiAgICAgICAgICAgICAgJ291dHB1dCc6ICcuLi8nLFxuICAgICAgICAgICAgICAnYWxsb3dPdXRzaWRlT3V0RGlyJzogdHJ1ZSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgXSxcbiAgICAgICAgICBpbmRleDogJ2luZGV4Lmh0bWwnLFxuICAgICAgICAgIG1haW46ICdtYWluLnRzJyxcbiAgICAgICAgICBwb2x5ZmlsbHM6ICdwb2x5ZmlsbHMudHMnLFxuICAgICAgICAgIHRlc3Q6ICd0ZXN0LnRzJyxcbiAgICAgICAgICB0c2NvbmZpZzogJ3RzY29uZmlnLmFwcC5qc29uJyxcbiAgICAgICAgICB0ZXN0VHNjb25maWc6ICd0c2NvbmZpZy5zcGVjLmpzb24nLFxuICAgICAgICAgIHByZWZpeDogJ2FwcCcsXG4gICAgICAgICAgc3R5bGVzOiBbXG4gICAgICAgICAgICAnc3R5bGVzLmNzcycsXG4gICAgICAgICAgXSxcbiAgICAgICAgICBzdHlsZVByZXByb2Nlc3Nvck9wdGlvbnM6IHtcbiAgICAgICAgICAgIGluY2x1ZGVQYXRoczogW1xuICAgICAgICAgICAgICAnc3R5bGVJbmMnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHNjcmlwdHM6IFtdLFxuICAgICAgICAgIGVudmlyb25tZW50U291cmNlOiAnZW52aXJvbm1lbnRzL2Vudmlyb25tZW50LnRzJyxcbiAgICAgICAgICBlbnZpcm9ubWVudHM6IHtcbiAgICAgICAgICAgIGRldjogJ2Vudmlyb25tZW50cy9lbnZpcm9ubWVudC50cycsXG4gICAgICAgICAgICBwcm9kOiAnZW52aXJvbm1lbnRzL2Vudmlyb25tZW50LnByb2QudHMnLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgICAgZTJlOiB7XG4gICAgICAgIHByb3RyYWN0b3I6IHtcbiAgICAgICAgICBjb25maWc6ICcuL3Byb3RyYWN0b3IuY29uZi5qcycsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgbGludDogW1xuICAgICAgICB7XG4gICAgICAgICAgcHJvamVjdDogJ3NyYy90c2NvbmZpZy5hcHAuanNvbicsXG4gICAgICAgICAgZXhjbHVkZTogJyoqL25vZGVfbW9kdWxlcy8qKicsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBwcm9qZWN0OiAnc3JjL3RzY29uZmlnLnNwZWMuanNvbicsXG4gICAgICAgICAgZXhjbHVkZTogJyoqL25vZGVfbW9kdWxlcy8qKicsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBwcm9qZWN0OiAnZTJlL3RzY29uZmlnLmUyZS5qc29uJyxcbiAgICAgICAgICBleGNsdWRlOiAnKiovbm9kZV9tb2R1bGVzLyoqJyxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgICB0ZXN0OiB7XG4gICAgICAgIGthcm1hOiB7XG4gICAgICAgICAgY29uZmlnOiAnLi9rYXJtYS5jb25mLmpzJyxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBkZWZhdWx0czoge1xuICAgICAgICBzdHlsZUV4dDogJ2NzcycsXG4gICAgICAgIGJ1aWxkOiB7XG4gICAgICAgICAgbmFtZWRDaHVua3M6IHRydWUsXG4gICAgICAgIH0sXG4gICAgICAgIHNlcnZlOiB7XG4gICAgICAgICAgcG9ydDogODA4MCxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfTtcbiAgICB0cmVlID0gbmV3IFVuaXRUZXN0VHJlZShuZXcgRW1wdHlUcmVlKCkpO1xuICAgIGNvbnN0IHBhY2thZ2VKc29uID0ge1xuICAgICAgZGV2RGVwZW5kZW5jaWVzOiB7fSxcbiAgICB9O1xuICAgIHRyZWUuY3JlYXRlKCcvcGFja2FnZS5qc29uJywgSlNPTi5zdHJpbmdpZnkocGFja2FnZUpzb24sIG51bGwsIDIpKTtcblxuICAgIC8vIENyZWF0ZSBhIHByb2QgZW52aXJvbm1lbnQuXG4gICAgdHJlZS5jcmVhdGUoJy9zcmMvZW52aXJvbm1lbnRzL2Vudmlyb25tZW50LnByb2QudHMnLCBgXG4gICAgICBleHBvcnQgY29uc3QgZW52aXJvbm1lbnQgPSB7XG4gICAgICAgIHByb2R1Y3Rpb246IHRydWVcbiAgICAgIH07XG4gICAgYCk7XG4gICAgdHJlZS5jcmVhdGUoJy9zcmMvZmF2aWNvbi5pY28nLCAnJyk7XG4gIH0pO1xuXG4gIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1hbnlcbiAgZnVuY3Rpb24gZ2V0Q29uZmlnKHRyZWU6IFVuaXRUZXN0VHJlZSk6IGFueSB7XG4gICAgcmV0dXJuIEpTT04ucGFyc2UodHJlZS5yZWFkQ29udGVudChjb25maWdQYXRoKSk7XG4gIH1cblxuICBkZXNjcmliZSgnZmlsZSBjcmVhdGlvbi9kZWxldGlvbicsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIGRlbGV0ZSB0aGUgb2xkIGNvbmZpZyBmaWxlJywgKCkgPT4ge1xuICAgICAgdHJlZS5jcmVhdGUob2xkQ29uZmlnUGF0aCwgSlNPTi5zdHJpbmdpZnkoYmFzZUNvbmZpZywgbnVsbCwgMikpO1xuICAgICAgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ21pZ3JhdGlvbi0wMScsIGRlZmF1bHRPcHRpb25zLCB0cmVlKTtcbiAgICAgIGV4cGVjdCh0cmVlLmV4aXN0cyhvbGRDb25maWdQYXRoKSkudG9FcXVhbChmYWxzZSk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIGNyZWF0ZSB0aGUgbmV3IGNvbmZpZyBmaWxlJywgKCkgPT4ge1xuICAgICAgdHJlZS5jcmVhdGUob2xkQ29uZmlnUGF0aCwgSlNPTi5zdHJpbmdpZnkoYmFzZUNvbmZpZywgbnVsbCwgMikpO1xuICAgICAgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ21pZ3JhdGlvbi0wMScsIGRlZmF1bHRPcHRpb25zLCB0cmVlKTtcbiAgICAgIGV4cGVjdCh0cmVlLmV4aXN0cyhjb25maWdQYXRoKSkudG9FcXVhbCh0cnVlKTtcbiAgICB9KTtcblxuICB9KTtcblxuICBkZXNjcmliZSgnY29uZmlnIGZpbGUgY29udGVudHMnLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCBzZXQgcm9vdCB2YWx1ZXMnLCAoKSA9PiB7XG4gICAgICB0cmVlLmNyZWF0ZShvbGRDb25maWdQYXRoLCBKU09OLnN0cmluZ2lmeShiYXNlQ29uZmlnLCBudWxsLCAyKSk7XG4gICAgICB0cmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnbWlncmF0aW9uLTAxJywgZGVmYXVsdE9wdGlvbnMsIHRyZWUpO1xuICAgICAgY29uc3QgY29uZmlnID0gZ2V0Q29uZmlnKHRyZWUpO1xuICAgICAgZXhwZWN0KGNvbmZpZy52ZXJzaW9uKS50b0VxdWFsKDEpO1xuICAgICAgZXhwZWN0KGNvbmZpZy5uZXdQcm9qZWN0Um9vdCkudG9FcXVhbCgncHJvamVjdHMnKTtcbiAgICAgIGV4cGVjdChjb25maWcuZGVmYXVsdFByb2plY3QpLnRvRXF1YWwoJ2ZvbycpO1xuICAgIH0pO1xuXG4gICAgZGVzY3JpYmUoJ3NjaGVtYXRpY3MnLCAoKSA9PiB7XG4gICAgICBpdCgnc2hvdWxkIGRlZmluZSBzY2hlbWF0aWNzIGNvbGxlY3Rpb24gcm9vdCcsICgpID0+IHtcbiAgICAgICAgdHJlZS5jcmVhdGUob2xkQ29uZmlnUGF0aCwgSlNPTi5zdHJpbmdpZnkoYmFzZUNvbmZpZywgbnVsbCwgMikpO1xuICAgICAgICB0cmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnbWlncmF0aW9uLTAxJywgZGVmYXVsdE9wdGlvbnMsIHRyZWUpO1xuICAgICAgICBjb25zdCBjb25maWcgPSBnZXRDb25maWcodHJlZSk7XG4gICAgICAgIGV4cGVjdChjb25maWcuc2NoZW1hdGljc1snQHNjaGVtYXRpY3MvYW5ndWxhcjpjb21wb25lbnQnXSkudG9CZURlZmluZWQoKTtcbiAgICAgIH0pO1xuXG4gICAgICBmdW5jdGlvbiBnZXRTY2hlbWF0aWNDb25maWcoaG9zdDogVW5pdFRlc3RUcmVlLCBuYW1lOiBzdHJpbmcpOiBKc29uT2JqZWN0IHtcbiAgICAgICAgcmV0dXJuIGdldENvbmZpZyhob3N0KS5zY2hlbWF0aWNzWydAc2NoZW1hdGljcy9hbmd1bGFyOicgKyBuYW1lXTtcbiAgICAgIH1cblxuICAgICAgZGVzY3JpYmUoJ2NvbXBvbmVudCBjb25maWcnLCAoKSA9PiB7XG4gICAgICAgIGl0KCdzaG91bGQgbW92ZSBwcmVmaXgnLCAoKSA9PiB7XG4gICAgICAgICAgdHJlZS5jcmVhdGUob2xkQ29uZmlnUGF0aCwgSlNPTi5zdHJpbmdpZnkoYmFzZUNvbmZpZywgbnVsbCwgMikpO1xuICAgICAgICAgIHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdtaWdyYXRpb24tMDEnLCBkZWZhdWx0T3B0aW9ucywgdHJlZSk7XG4gICAgICAgICAgY29uc3QgY29uZmlnID0gZ2V0U2NoZW1hdGljQ29uZmlnKHRyZWUsICdjb21wb25lbnQnKTtcbiAgICAgICAgICBleHBlY3QoY29uZmlnLnByZWZpeCkudG9FcXVhbCgnYXBwJyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KCdzaG91bGQgbW92ZSBzdHlsZUV4dCB0byBjb21wb25lbnQnLCAoKSA9PiB7XG4gICAgICAgICAgdHJlZS5jcmVhdGUob2xkQ29uZmlnUGF0aCwgSlNPTi5zdHJpbmdpZnkoYmFzZUNvbmZpZywgbnVsbCwgMikpO1xuICAgICAgICAgIHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdtaWdyYXRpb24tMDEnLCBkZWZhdWx0T3B0aW9ucywgdHJlZSk7XG4gICAgICAgICAgY29uc3QgY29uZmlnID0gZ2V0U2NoZW1hdGljQ29uZmlnKHRyZWUsICdjb21wb25lbnQnKTtcbiAgICAgICAgICBleHBlY3QoY29uZmlnLnN0eWxlZXh0KS50b0VxdWFsKCdjc3MnKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ3Nob3VsZCBtb3ZlIGlubGluZVN0eWxlJywgKCkgPT4ge1xuICAgICAgICAgIGJhc2VDb25maWcuZGVmYXVsdHMuY29tcG9uZW50ID0geyBpbmxpbmVTdHlsZTogdHJ1ZSB9O1xuICAgICAgICAgIHRyZWUuY3JlYXRlKG9sZENvbmZpZ1BhdGgsIEpTT04uc3RyaW5naWZ5KGJhc2VDb25maWcsIG51bGwsIDIpKTtcbiAgICAgICAgICB0cmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnbWlncmF0aW9uLTAxJywgZGVmYXVsdE9wdGlvbnMsIHRyZWUpO1xuICAgICAgICAgIGNvbnN0IGNvbmZpZyA9IGdldFNjaGVtYXRpY0NvbmZpZyh0cmVlLCAnY29tcG9uZW50Jyk7XG4gICAgICAgICAgZXhwZWN0KGNvbmZpZy5pbmxpbmVTdHlsZSkudG9FcXVhbCh0cnVlKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ3Nob3VsZCBub3QgbW92ZSBpbmxpbmVTdHlsZSBpZiBub3QgZGVmaW5lZCcsICgpID0+IHtcbiAgICAgICAgICB0cmVlLmNyZWF0ZShvbGRDb25maWdQYXRoLCBKU09OLnN0cmluZ2lmeShiYXNlQ29uZmlnLCBudWxsLCAyKSk7XG4gICAgICAgICAgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ21pZ3JhdGlvbi0wMScsIGRlZmF1bHRPcHRpb25zLCB0cmVlKTtcbiAgICAgICAgICBjb25zdCBjb25maWcgPSBnZXRTY2hlbWF0aWNDb25maWcodHJlZSwgJ2NvbXBvbmVudCcpO1xuICAgICAgICAgIGV4cGVjdChjb25maWcuaW5saW5lU3R5bGUpLnRvQmVVbmRlZmluZWQoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ3Nob3VsZCBtb3ZlIGlubGluZVRlbXBsYXRlJywgKCkgPT4ge1xuICAgICAgICAgIGJhc2VDb25maWcuZGVmYXVsdHMuY29tcG9uZW50ID0geyBpbmxpbmVUZW1wbGF0ZTogdHJ1ZSB9O1xuICAgICAgICAgIHRyZWUuY3JlYXRlKG9sZENvbmZpZ1BhdGgsIEpTT04uc3RyaW5naWZ5KGJhc2VDb25maWcsIG51bGwsIDIpKTtcbiAgICAgICAgICB0cmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnbWlncmF0aW9uLTAxJywgZGVmYXVsdE9wdGlvbnMsIHRyZWUpO1xuICAgICAgICAgIGNvbnN0IGNvbmZpZyA9IGdldFNjaGVtYXRpY0NvbmZpZyh0cmVlLCAnY29tcG9uZW50Jyk7XG4gICAgICAgICAgZXhwZWN0KGNvbmZpZy5pbmxpbmVUZW1wbGF0ZSkudG9FcXVhbCh0cnVlKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ3Nob3VsZCBub3QgbW92ZSBpbmxpbmVUZW1wbGF0ZSBpZiBub3QgZGVmaW5lZCcsICgpID0+IHtcbiAgICAgICAgICB0cmVlLmNyZWF0ZShvbGRDb25maWdQYXRoLCBKU09OLnN0cmluZ2lmeShiYXNlQ29uZmlnLCBudWxsLCAyKSk7XG4gICAgICAgICAgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ21pZ3JhdGlvbi0wMScsIGRlZmF1bHRPcHRpb25zLCB0cmVlKTtcbiAgICAgICAgICBjb25zdCBjb25maWcgPSBnZXRTY2hlbWF0aWNDb25maWcodHJlZSwgJ2NvbXBvbmVudCcpO1xuICAgICAgICAgIGV4cGVjdChjb25maWcuaW5saW5lVGVtcGxhdGUpLnRvQmVVbmRlZmluZWQoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ3Nob3VsZCBtb3ZlIGZsYXQnLCAoKSA9PiB7XG4gICAgICAgICAgYmFzZUNvbmZpZy5kZWZhdWx0cy5jb21wb25lbnQgPSB7IGZsYXQ6IHRydWUgfTtcbiAgICAgICAgICB0cmVlLmNyZWF0ZShvbGRDb25maWdQYXRoLCBKU09OLnN0cmluZ2lmeShiYXNlQ29uZmlnLCBudWxsLCAyKSk7XG4gICAgICAgICAgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ21pZ3JhdGlvbi0wMScsIGRlZmF1bHRPcHRpb25zLCB0cmVlKTtcbiAgICAgICAgICBjb25zdCBjb25maWcgPSBnZXRTY2hlbWF0aWNDb25maWcodHJlZSwgJ2NvbXBvbmVudCcpO1xuICAgICAgICAgIGV4cGVjdChjb25maWcuZmxhdCkudG9FcXVhbCh0cnVlKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ3Nob3VsZCBub3QgbW92ZSBmbGF0IGlmIG5vdCBkZWZpbmVkJywgKCkgPT4ge1xuICAgICAgICAgIHRyZWUuY3JlYXRlKG9sZENvbmZpZ1BhdGgsIEpTT04uc3RyaW5naWZ5KGJhc2VDb25maWcsIG51bGwsIDIpKTtcbiAgICAgICAgICB0cmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnbWlncmF0aW9uLTAxJywgZGVmYXVsdE9wdGlvbnMsIHRyZWUpO1xuICAgICAgICAgIGNvbnN0IGNvbmZpZyA9IGdldFNjaGVtYXRpY0NvbmZpZyh0cmVlLCAnY29tcG9uZW50Jyk7XG4gICAgICAgICAgZXhwZWN0KGNvbmZpZy5mbGF0KS50b0JlVW5kZWZpbmVkKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KCdzaG91bGQgbW92ZSBzcGVjJywgKCkgPT4ge1xuICAgICAgICAgIGJhc2VDb25maWcuZGVmYXVsdHMuY29tcG9uZW50ID0geyBzcGVjOiB0cnVlIH07XG4gICAgICAgICAgdHJlZS5jcmVhdGUob2xkQ29uZmlnUGF0aCwgSlNPTi5zdHJpbmdpZnkoYmFzZUNvbmZpZywgbnVsbCwgMikpO1xuICAgICAgICAgIHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdtaWdyYXRpb24tMDEnLCBkZWZhdWx0T3B0aW9ucywgdHJlZSk7XG4gICAgICAgICAgY29uc3QgY29uZmlnID0gZ2V0U2NoZW1hdGljQ29uZmlnKHRyZWUsICdjb21wb25lbnQnKTtcbiAgICAgICAgICBleHBlY3QoY29uZmlnLnNwZWMpLnRvRXF1YWwodHJ1ZSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KCdzaG91bGQgbm90IG1vdmUgc3BlYyBpZiBub3QgZGVmaW5lZCcsICgpID0+IHtcbiAgICAgICAgICB0cmVlLmNyZWF0ZShvbGRDb25maWdQYXRoLCBKU09OLnN0cmluZ2lmeShiYXNlQ29uZmlnLCBudWxsLCAyKSk7XG4gICAgICAgICAgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ21pZ3JhdGlvbi0wMScsIGRlZmF1bHRPcHRpb25zLCB0cmVlKTtcbiAgICAgICAgICBjb25zdCBjb25maWcgPSBnZXRTY2hlbWF0aWNDb25maWcodHJlZSwgJ2NvbXBvbmVudCcpO1xuICAgICAgICAgIGV4cGVjdChjb25maWcuc3BlYykudG9CZVVuZGVmaW5lZCgpO1xuICAgICAgICB9KTtcblxuICAgICAgICBpdCgnc2hvdWxkIG1vdmUgdmlld0VuY2Fwc3VsYXRpb24nLCAoKSA9PiB7XG4gICAgICAgICAgYmFzZUNvbmZpZy5kZWZhdWx0cy5jb21wb25lbnQgPSB7IHZpZXdFbmNhcHN1bGF0aW9uOiAnTmF0aXZlJyB9O1xuICAgICAgICAgIHRyZWUuY3JlYXRlKG9sZENvbmZpZ1BhdGgsIEpTT04uc3RyaW5naWZ5KGJhc2VDb25maWcsIG51bGwsIDIpKTtcbiAgICAgICAgICB0cmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnbWlncmF0aW9uLTAxJywgZGVmYXVsdE9wdGlvbnMsIHRyZWUpO1xuICAgICAgICAgIGNvbnN0IGNvbmZpZyA9IGdldFNjaGVtYXRpY0NvbmZpZyh0cmVlLCAnY29tcG9uZW50Jyk7XG4gICAgICAgICAgZXhwZWN0KGNvbmZpZy52aWV3RW5jYXBzdWxhdGlvbikudG9FcXVhbCgnTmF0aXZlJyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KCdzaG91bGQgbm90IG1vdmUgdmlld0VuY2Fwc3VsYXRpb24gaWYgbm90IGRlZmluZWQnLCAoKSA9PiB7XG4gICAgICAgICAgdHJlZS5jcmVhdGUob2xkQ29uZmlnUGF0aCwgSlNPTi5zdHJpbmdpZnkoYmFzZUNvbmZpZywgbnVsbCwgMikpO1xuICAgICAgICAgIHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdtaWdyYXRpb24tMDEnLCBkZWZhdWx0T3B0aW9ucywgdHJlZSk7XG4gICAgICAgICAgY29uc3QgY29uZmlnID0gZ2V0U2NoZW1hdGljQ29uZmlnKHRyZWUsICdjb21wb25lbnQnKTtcbiAgICAgICAgICBleHBlY3QoY29uZmlnLnZpZXdFbmNhcHN1bGF0aW9uKS50b0JlVW5kZWZpbmVkKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KCdzaG91bGQgbW92ZSBjaGFuZ2VEZXRlY3Rpb24nLCAoKSA9PiB7XG4gICAgICAgICAgYmFzZUNvbmZpZy5kZWZhdWx0cy5jb21wb25lbnQgPSB7IGNoYW5nZURldGVjdGlvbjogJ09uUHVzaCcgfTtcbiAgICAgICAgICB0cmVlLmNyZWF0ZShvbGRDb25maWdQYXRoLCBKU09OLnN0cmluZ2lmeShiYXNlQ29uZmlnLCBudWxsLCAyKSk7XG4gICAgICAgICAgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ21pZ3JhdGlvbi0wMScsIGRlZmF1bHRPcHRpb25zLCB0cmVlKTtcbiAgICAgICAgICBjb25zdCBjb25maWcgPSBnZXRTY2hlbWF0aWNDb25maWcodHJlZSwgJ2NvbXBvbmVudCcpO1xuICAgICAgICAgIGV4cGVjdChjb25maWcuY2hhbmdlRGV0ZWN0aW9uKS50b0VxdWFsKCdPblB1c2gnKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ3Nob3VsZCBub3QgbW92ZSBjaGFuZ2VEZXRlY3Rpb24gaWYgbm90IGRlZmluZWQnLCAoKSA9PiB7XG4gICAgICAgICAgdHJlZS5jcmVhdGUob2xkQ29uZmlnUGF0aCwgSlNPTi5zdHJpbmdpZnkoYmFzZUNvbmZpZywgbnVsbCwgMikpO1xuICAgICAgICAgIHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdtaWdyYXRpb24tMDEnLCBkZWZhdWx0T3B0aW9ucywgdHJlZSk7XG4gICAgICAgICAgY29uc3QgY29uZmlnID0gZ2V0U2NoZW1hdGljQ29uZmlnKHRyZWUsICdjb21wb25lbnQnKTtcbiAgICAgICAgICBleHBlY3QoY29uZmlnLmNoYW5nZURldGVjdGlvbikudG9CZVVuZGVmaW5lZCgpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuXG4gICAgICBkZXNjcmliZSgnZGlyZWN0aXZlIGNvbmZpZycsICgpID0+IHtcbiAgICAgICAgaXQoJ3Nob3VsZCBtb3ZlIHByZWZpeCcsICgpID0+IHtcbiAgICAgICAgICB0cmVlLmNyZWF0ZShvbGRDb25maWdQYXRoLCBKU09OLnN0cmluZ2lmeShiYXNlQ29uZmlnLCBudWxsLCAyKSk7XG4gICAgICAgICAgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ21pZ3JhdGlvbi0wMScsIGRlZmF1bHRPcHRpb25zLCB0cmVlKTtcbiAgICAgICAgICBjb25zdCBjb25maWcgPSBnZXRTY2hlbWF0aWNDb25maWcodHJlZSwgJ2RpcmVjdGl2ZScpO1xuICAgICAgICAgIGV4cGVjdChjb25maWcucHJlZml4KS50b0VxdWFsKCdhcHAnKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ3Nob3VsZCBtb3ZlIGZsYXQnLCAoKSA9PiB7XG4gICAgICAgICAgYmFzZUNvbmZpZy5kZWZhdWx0cy5kaXJlY3RpdmUgPSB7IGZsYXQ6IHRydWUgfTtcbiAgICAgICAgICB0cmVlLmNyZWF0ZShvbGRDb25maWdQYXRoLCBKU09OLnN0cmluZ2lmeShiYXNlQ29uZmlnLCBudWxsLCAyKSk7XG4gICAgICAgICAgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ21pZ3JhdGlvbi0wMScsIGRlZmF1bHRPcHRpb25zLCB0cmVlKTtcbiAgICAgICAgICBjb25zdCBjb25maWcgPSBnZXRTY2hlbWF0aWNDb25maWcodHJlZSwgJ2RpcmVjdGl2ZScpO1xuICAgICAgICAgIGV4cGVjdChjb25maWcuZmxhdCkudG9FcXVhbCh0cnVlKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ3Nob3VsZCBub3QgbW92ZSBmbGF0IGlmIG5vdCBkZWZpbmVkJywgKCkgPT4ge1xuICAgICAgICAgIHRyZWUuY3JlYXRlKG9sZENvbmZpZ1BhdGgsIEpTT04uc3RyaW5naWZ5KGJhc2VDb25maWcsIG51bGwsIDIpKTtcbiAgICAgICAgICB0cmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnbWlncmF0aW9uLTAxJywgZGVmYXVsdE9wdGlvbnMsIHRyZWUpO1xuICAgICAgICAgIGNvbnN0IGNvbmZpZyA9IGdldFNjaGVtYXRpY0NvbmZpZyh0cmVlLCAnZGlyZWN0aXZlJyk7XG4gICAgICAgICAgZXhwZWN0KGNvbmZpZy5mbGF0KS50b0JlVW5kZWZpbmVkKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KCdzaG91bGQgbW92ZSBzcGVjJywgKCkgPT4ge1xuICAgICAgICAgIGJhc2VDb25maWcuZGVmYXVsdHMuZGlyZWN0aXZlID0geyBzcGVjOiB0cnVlIH07XG4gICAgICAgICAgdHJlZS5jcmVhdGUob2xkQ29uZmlnUGF0aCwgSlNPTi5zdHJpbmdpZnkoYmFzZUNvbmZpZywgbnVsbCwgMikpO1xuICAgICAgICAgIHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdtaWdyYXRpb24tMDEnLCBkZWZhdWx0T3B0aW9ucywgdHJlZSk7XG4gICAgICAgICAgY29uc3QgY29uZmlnID0gZ2V0U2NoZW1hdGljQ29uZmlnKHRyZWUsICdkaXJlY3RpdmUnKTtcbiAgICAgICAgICBleHBlY3QoY29uZmlnLnNwZWMpLnRvRXF1YWwodHJ1ZSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KCdzaG91bGQgbm90IG1vdmUgc3BlYyBpZiBub3QgZGVmaW5lZCcsICgpID0+IHtcbiAgICAgICAgICB0cmVlLmNyZWF0ZShvbGRDb25maWdQYXRoLCBKU09OLnN0cmluZ2lmeShiYXNlQ29uZmlnLCBudWxsLCAyKSk7XG4gICAgICAgICAgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ21pZ3JhdGlvbi0wMScsIGRlZmF1bHRPcHRpb25zLCB0cmVlKTtcbiAgICAgICAgICBjb25zdCBjb25maWcgPSBnZXRTY2hlbWF0aWNDb25maWcodHJlZSwgJ2RpcmVjdGl2ZScpO1xuICAgICAgICAgIGV4cGVjdChjb25maWcuc3BlYykudG9CZVVuZGVmaW5lZCgpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuXG4gICAgICBkZXNjcmliZSgnY2xhc3MgY29uZmlnJywgKCkgPT4ge1xuICAgICAgICBpdCgnc2hvdWxkIG1vdmUgc3BlYycsICgpID0+IHtcbiAgICAgICAgICBiYXNlQ29uZmlnLmRlZmF1bHRzLmNsYXNzID0geyBzcGVjOiB0cnVlIH07XG4gICAgICAgICAgdHJlZS5jcmVhdGUob2xkQ29uZmlnUGF0aCwgSlNPTi5zdHJpbmdpZnkoYmFzZUNvbmZpZywgbnVsbCwgMikpO1xuICAgICAgICAgIHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdtaWdyYXRpb24tMDEnLCBkZWZhdWx0T3B0aW9ucywgdHJlZSk7XG4gICAgICAgICAgY29uc3QgY29uZmlnID0gZ2V0U2NoZW1hdGljQ29uZmlnKHRyZWUsICdjbGFzcycpO1xuICAgICAgICAgIGV4cGVjdChjb25maWcuc3BlYykudG9FcXVhbCh0cnVlKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ3Nob3VsZCBub3QgbW92ZSBzcGVjIGlmIG5vdCBkZWZpbmVkJywgKCkgPT4ge1xuICAgICAgICAgIHRyZWUuY3JlYXRlKG9sZENvbmZpZ1BhdGgsIEpTT04uc3RyaW5naWZ5KGJhc2VDb25maWcsIG51bGwsIDIpKTtcbiAgICAgICAgICB0cmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnbWlncmF0aW9uLTAxJywgZGVmYXVsdE9wdGlvbnMsIHRyZWUpO1xuICAgICAgICAgIGNvbnN0IGNvbmZpZyA9IGdldFNjaGVtYXRpY0NvbmZpZyh0cmVlLCAnY2xhc3MnKTtcbiAgICAgICAgICBleHBlY3QoY29uZmlnKS50b0JlVW5kZWZpbmVkKCk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG5cbiAgICAgIGRlc2NyaWJlKCdndWFyZCBjb25maWcnLCAoKSA9PiB7XG4gICAgICAgIGl0KCdzaG91bGQgbW92ZSBmbGF0JywgKCkgPT4ge1xuICAgICAgICAgIGJhc2VDb25maWcuZGVmYXVsdHMuZ3VhcmQgPSB7IGZsYXQ6IHRydWUgfTtcbiAgICAgICAgICB0cmVlLmNyZWF0ZShvbGRDb25maWdQYXRoLCBKU09OLnN0cmluZ2lmeShiYXNlQ29uZmlnLCBudWxsLCAyKSk7XG4gICAgICAgICAgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ21pZ3JhdGlvbi0wMScsIGRlZmF1bHRPcHRpb25zLCB0cmVlKTtcbiAgICAgICAgICBjb25zdCBjb25maWcgPSBnZXRTY2hlbWF0aWNDb25maWcodHJlZSwgJ2d1YXJkJyk7XG4gICAgICAgICAgZXhwZWN0KGNvbmZpZy5mbGF0KS50b0VxdWFsKHRydWUpO1xuICAgICAgICB9KTtcblxuICAgICAgICBpdCgnc2hvdWxkIG5vdCBtb3ZlIGZsYXQgaWYgbm90IGRlZmluZWQnLCAoKSA9PiB7XG4gICAgICAgICAgdHJlZS5jcmVhdGUob2xkQ29uZmlnUGF0aCwgSlNPTi5zdHJpbmdpZnkoYmFzZUNvbmZpZywgbnVsbCwgMikpO1xuICAgICAgICAgIHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdtaWdyYXRpb24tMDEnLCBkZWZhdWx0T3B0aW9ucywgdHJlZSk7XG4gICAgICAgICAgY29uc3QgY29uZmlnID0gZ2V0U2NoZW1hdGljQ29uZmlnKHRyZWUsICdndWFyZCcpO1xuICAgICAgICAgIGV4cGVjdChjb25maWcpLnRvQmVVbmRlZmluZWQoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ3Nob3VsZCBtb3ZlIHNwZWMnLCAoKSA9PiB7XG4gICAgICAgICAgYmFzZUNvbmZpZy5kZWZhdWx0cy5ndWFyZCA9IHsgc3BlYzogdHJ1ZSB9O1xuICAgICAgICAgIHRyZWUuY3JlYXRlKG9sZENvbmZpZ1BhdGgsIEpTT04uc3RyaW5naWZ5KGJhc2VDb25maWcsIG51bGwsIDIpKTtcbiAgICAgICAgICB0cmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnbWlncmF0aW9uLTAxJywgZGVmYXVsdE9wdGlvbnMsIHRyZWUpO1xuICAgICAgICAgIGNvbnN0IGNvbmZpZyA9IGdldFNjaGVtYXRpY0NvbmZpZyh0cmVlLCAnZ3VhcmQnKTtcbiAgICAgICAgICBleHBlY3QoY29uZmlnLnNwZWMpLnRvRXF1YWwodHJ1ZSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KCdzaG91bGQgbm90IG1vdmUgc3BlYyBpZiBub3QgZGVmaW5lZCcsICgpID0+IHtcbiAgICAgICAgICB0cmVlLmNyZWF0ZShvbGRDb25maWdQYXRoLCBKU09OLnN0cmluZ2lmeShiYXNlQ29uZmlnLCBudWxsLCAyKSk7XG4gICAgICAgICAgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ21pZ3JhdGlvbi0wMScsIGRlZmF1bHRPcHRpb25zLCB0cmVlKTtcbiAgICAgICAgICBjb25zdCBjb25maWcgPSBnZXRTY2hlbWF0aWNDb25maWcodHJlZSwgJ2d1YXJkJyk7XG4gICAgICAgICAgZXhwZWN0KGNvbmZpZykudG9CZVVuZGVmaW5lZCgpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuXG4gICAgICBkZXNjcmliZSgnaW50ZXJmYWNlIGNvbmZpZycsICgpID0+IHtcbiAgICAgICAgaXQoJ3Nob3VsZCBtb3ZlIGZsYXQnLCAoKSA9PiB7XG4gICAgICAgICAgYmFzZUNvbmZpZy5kZWZhdWx0cy5pbnRlcmZhY2UgPSB7IHByZWZpeDogJ0knIH07XG4gICAgICAgICAgdHJlZS5jcmVhdGUob2xkQ29uZmlnUGF0aCwgSlNPTi5zdHJpbmdpZnkoYmFzZUNvbmZpZywgbnVsbCwgMikpO1xuICAgICAgICAgIHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdtaWdyYXRpb24tMDEnLCBkZWZhdWx0T3B0aW9ucywgdHJlZSk7XG4gICAgICAgICAgY29uc3QgY29uZmlnID0gZ2V0U2NoZW1hdGljQ29uZmlnKHRyZWUsICdpbnRlcmZhY2UnKTtcbiAgICAgICAgICBleHBlY3QoY29uZmlnLnByZWZpeCkudG9FcXVhbCgnSScpO1xuICAgICAgICB9KTtcblxuICAgICAgICBpdCgnc2hvdWxkIG5vdCBtb3ZlIGZsYXQgaWYgbm90IGRlZmluZWQnLCAoKSA9PiB7XG4gICAgICAgICAgdHJlZS5jcmVhdGUob2xkQ29uZmlnUGF0aCwgSlNPTi5zdHJpbmdpZnkoYmFzZUNvbmZpZywgbnVsbCwgMikpO1xuICAgICAgICAgIHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdtaWdyYXRpb24tMDEnLCBkZWZhdWx0T3B0aW9ucywgdHJlZSk7XG4gICAgICAgICAgY29uc3QgY29uZmlnID0gZ2V0U2NoZW1hdGljQ29uZmlnKHRyZWUsICdpbnRlcmZhY2UnKTtcbiAgICAgICAgICBleHBlY3QoY29uZmlnKS50b0JlVW5kZWZpbmVkKCk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG5cbiAgICAgIGRlc2NyaWJlKCdtb2R1bGUgY29uZmlnJywgKCkgPT4ge1xuICAgICAgICBpdCgnc2hvdWxkIG1vdmUgZmxhdCcsICgpID0+IHtcbiAgICAgICAgICBiYXNlQ29uZmlnLmRlZmF1bHRzLm1vZHVsZSA9IHsgZmxhdDogdHJ1ZSB9O1xuICAgICAgICAgIHRyZWUuY3JlYXRlKG9sZENvbmZpZ1BhdGgsIEpTT04uc3RyaW5naWZ5KGJhc2VDb25maWcsIG51bGwsIDIpKTtcbiAgICAgICAgICB0cmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnbWlncmF0aW9uLTAxJywgZGVmYXVsdE9wdGlvbnMsIHRyZWUpO1xuICAgICAgICAgIGNvbnN0IGNvbmZpZyA9IGdldFNjaGVtYXRpY0NvbmZpZyh0cmVlLCAnbW9kdWxlJyk7XG4gICAgICAgICAgZXhwZWN0KGNvbmZpZy5mbGF0KS50b0VxdWFsKHRydWUpO1xuICAgICAgICB9KTtcblxuICAgICAgICBpdCgnc2hvdWxkIG5vdCBtb3ZlIGZsYXQgaWYgbm90IGRlZmluZWQnLCAoKSA9PiB7XG4gICAgICAgICAgdHJlZS5jcmVhdGUob2xkQ29uZmlnUGF0aCwgSlNPTi5zdHJpbmdpZnkoYmFzZUNvbmZpZywgbnVsbCwgMikpO1xuICAgICAgICAgIHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdtaWdyYXRpb24tMDEnLCBkZWZhdWx0T3B0aW9ucywgdHJlZSk7XG4gICAgICAgICAgY29uc3QgY29uZmlnID0gZ2V0U2NoZW1hdGljQ29uZmlnKHRyZWUsICdtb2R1bGUnKTtcbiAgICAgICAgICBleHBlY3QoY29uZmlnKS50b0JlVW5kZWZpbmVkKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KCdzaG91bGQgbW92ZSBzcGVjJywgKCkgPT4ge1xuICAgICAgICAgIGJhc2VDb25maWcuZGVmYXVsdHMubW9kdWxlID0geyBzcGVjOiB0cnVlIH07XG4gICAgICAgICAgdHJlZS5jcmVhdGUob2xkQ29uZmlnUGF0aCwgSlNPTi5zdHJpbmdpZnkoYmFzZUNvbmZpZywgbnVsbCwgMikpO1xuICAgICAgICAgIHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdtaWdyYXRpb24tMDEnLCBkZWZhdWx0T3B0aW9ucywgdHJlZSk7XG4gICAgICAgICAgY29uc3QgY29uZmlnID0gZ2V0U2NoZW1hdGljQ29uZmlnKHRyZWUsICdtb2R1bGUnKTtcbiAgICAgICAgICBleHBlY3QoY29uZmlnLnNwZWMpLnRvRXF1YWwodHJ1ZSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KCdzaG91bGQgbm90IG1vdmUgc3BlYyBpZiBub3QgZGVmaW5lZCcsICgpID0+IHtcbiAgICAgICAgICB0cmVlLmNyZWF0ZShvbGRDb25maWdQYXRoLCBKU09OLnN0cmluZ2lmeShiYXNlQ29uZmlnLCBudWxsLCAyKSk7XG4gICAgICAgICAgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ21pZ3JhdGlvbi0wMScsIGRlZmF1bHRPcHRpb25zLCB0cmVlKTtcbiAgICAgICAgICBjb25zdCBjb25maWcgPSBnZXRTY2hlbWF0aWNDb25maWcodHJlZSwgJ21vZHVsZScpO1xuICAgICAgICAgIGV4cGVjdChjb25maWcpLnRvQmVVbmRlZmluZWQoKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcblxuICAgICAgZGVzY3JpYmUoJ3BpcGUgY29uZmlnJywgKCkgPT4ge1xuICAgICAgICBpdCgnc2hvdWxkIG1vdmUgZmxhdCcsICgpID0+IHtcbiAgICAgICAgICBiYXNlQ29uZmlnLmRlZmF1bHRzLnBpcGUgPSB7IGZsYXQ6IHRydWUgfTtcbiAgICAgICAgICB0cmVlLmNyZWF0ZShvbGRDb25maWdQYXRoLCBKU09OLnN0cmluZ2lmeShiYXNlQ29uZmlnLCBudWxsLCAyKSk7XG4gICAgICAgICAgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ21pZ3JhdGlvbi0wMScsIGRlZmF1bHRPcHRpb25zLCB0cmVlKTtcbiAgICAgICAgICBjb25zdCBjb25maWcgPSBnZXRTY2hlbWF0aWNDb25maWcodHJlZSwgJ3BpcGUnKTtcbiAgICAgICAgICBleHBlY3QoY29uZmlnLmZsYXQpLnRvRXF1YWwodHJ1ZSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KCdzaG91bGQgbm90IG1vdmUgZmxhdCBpZiBub3QgZGVmaW5lZCcsICgpID0+IHtcbiAgICAgICAgICB0cmVlLmNyZWF0ZShvbGRDb25maWdQYXRoLCBKU09OLnN0cmluZ2lmeShiYXNlQ29uZmlnLCBudWxsLCAyKSk7XG4gICAgICAgICAgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ21pZ3JhdGlvbi0wMScsIGRlZmF1bHRPcHRpb25zLCB0cmVlKTtcbiAgICAgICAgICBjb25zdCBjb25maWcgPSBnZXRTY2hlbWF0aWNDb25maWcodHJlZSwgJ3BpcGUnKTtcbiAgICAgICAgICBleHBlY3QoY29uZmlnKS50b0JlVW5kZWZpbmVkKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KCdzaG91bGQgbW92ZSBzcGVjJywgKCkgPT4ge1xuICAgICAgICAgIGJhc2VDb25maWcuZGVmYXVsdHMucGlwZSA9IHsgc3BlYzogdHJ1ZSB9O1xuICAgICAgICAgIHRyZWUuY3JlYXRlKG9sZENvbmZpZ1BhdGgsIEpTT04uc3RyaW5naWZ5KGJhc2VDb25maWcsIG51bGwsIDIpKTtcbiAgICAgICAgICB0cmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnbWlncmF0aW9uLTAxJywgZGVmYXVsdE9wdGlvbnMsIHRyZWUpO1xuICAgICAgICAgIGNvbnN0IGNvbmZpZyA9IGdldFNjaGVtYXRpY0NvbmZpZyh0cmVlLCAncGlwZScpO1xuICAgICAgICAgIGV4cGVjdChjb25maWcuc3BlYykudG9FcXVhbCh0cnVlKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ3Nob3VsZCBub3QgbW92ZSBzcGVjIGlmIG5vdCBkZWZpbmVkJywgKCkgPT4ge1xuICAgICAgICAgIHRyZWUuY3JlYXRlKG9sZENvbmZpZ1BhdGgsIEpTT04uc3RyaW5naWZ5KGJhc2VDb25maWcsIG51bGwsIDIpKTtcbiAgICAgICAgICB0cmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnbWlncmF0aW9uLTAxJywgZGVmYXVsdE9wdGlvbnMsIHRyZWUpO1xuICAgICAgICAgIGNvbnN0IGNvbmZpZyA9IGdldFNjaGVtYXRpY0NvbmZpZyh0cmVlLCAncGlwZScpO1xuICAgICAgICAgIGV4cGVjdChjb25maWcpLnRvQmVVbmRlZmluZWQoKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcblxuICAgICAgZGVzY3JpYmUoJ3NlcnZpY2UgY29uZmlnJywgKCkgPT4ge1xuICAgICAgICBpdCgnc2hvdWxkIG1vdmUgZmxhdCcsICgpID0+IHtcbiAgICAgICAgICBiYXNlQ29uZmlnLmRlZmF1bHRzLnNlcnZpY2UgPSB7IGZsYXQ6IHRydWUgfTtcbiAgICAgICAgICB0cmVlLmNyZWF0ZShvbGRDb25maWdQYXRoLCBKU09OLnN0cmluZ2lmeShiYXNlQ29uZmlnLCBudWxsLCAyKSk7XG4gICAgICAgICAgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ21pZ3JhdGlvbi0wMScsIGRlZmF1bHRPcHRpb25zLCB0cmVlKTtcbiAgICAgICAgICBjb25zdCBjb25maWcgPSBnZXRTY2hlbWF0aWNDb25maWcodHJlZSwgJ3NlcnZpY2UnKTtcbiAgICAgICAgICBleHBlY3QoY29uZmlnLmZsYXQpLnRvRXF1YWwodHJ1ZSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KCdzaG91bGQgbm90IG1vdmUgZmxhdCBpZiBub3QgZGVmaW5lZCcsICgpID0+IHtcbiAgICAgICAgICB0cmVlLmNyZWF0ZShvbGRDb25maWdQYXRoLCBKU09OLnN0cmluZ2lmeShiYXNlQ29uZmlnLCBudWxsLCAyKSk7XG4gICAgICAgICAgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ21pZ3JhdGlvbi0wMScsIGRlZmF1bHRPcHRpb25zLCB0cmVlKTtcbiAgICAgICAgICBjb25zdCBjb25maWcgPSBnZXRTY2hlbWF0aWNDb25maWcodHJlZSwgJ3NlcnZpY2UnKTtcbiAgICAgICAgICBleHBlY3QoY29uZmlnKS50b0JlVW5kZWZpbmVkKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KCdzaG91bGQgbW92ZSBzcGVjJywgKCkgPT4ge1xuICAgICAgICAgIGJhc2VDb25maWcuZGVmYXVsdHMuc2VydmljZSA9IHsgc3BlYzogdHJ1ZSB9O1xuICAgICAgICAgIHRyZWUuY3JlYXRlKG9sZENvbmZpZ1BhdGgsIEpTT04uc3RyaW5naWZ5KGJhc2VDb25maWcsIG51bGwsIDIpKTtcbiAgICAgICAgICB0cmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnbWlncmF0aW9uLTAxJywgZGVmYXVsdE9wdGlvbnMsIHRyZWUpO1xuICAgICAgICAgIGNvbnN0IGNvbmZpZyA9IGdldFNjaGVtYXRpY0NvbmZpZyh0cmVlLCAnc2VydmljZScpO1xuICAgICAgICAgIGV4cGVjdChjb25maWcuc3BlYykudG9FcXVhbCh0cnVlKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ3Nob3VsZCBub3QgbW92ZSBzcGVjIGlmIG5vdCBkZWZpbmVkJywgKCkgPT4ge1xuICAgICAgICAgIHRyZWUuY3JlYXRlKG9sZENvbmZpZ1BhdGgsIEpTT04uc3RyaW5naWZ5KGJhc2VDb25maWcsIG51bGwsIDIpKTtcbiAgICAgICAgICB0cmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnbWlncmF0aW9uLTAxJywgZGVmYXVsdE9wdGlvbnMsIHRyZWUpO1xuICAgICAgICAgIGNvbnN0IGNvbmZpZyA9IGdldFNjaGVtYXRpY0NvbmZpZyh0cmVlLCAnc2VydmljZScpO1xuICAgICAgICAgIGV4cGVjdChjb25maWcpLnRvQmVVbmRlZmluZWQoKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIGRlc2NyaWJlKCdhcmNoaXRlY3QnLCAoKSA9PiB7XG4gICAgICBpdCgnc2hvdWxkIGV4aXN0JywgKCkgPT4ge1xuICAgICAgICB0cmVlLmNyZWF0ZShvbGRDb25maWdQYXRoLCBKU09OLnN0cmluZ2lmeShiYXNlQ29uZmlnLCBudWxsLCAyKSk7XG4gICAgICAgIHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdtaWdyYXRpb24tMDEnLCBkZWZhdWx0T3B0aW9ucywgdHJlZSk7XG4gICAgICAgIGNvbnN0IGNvbmZpZyA9IGdldENvbmZpZyh0cmVlKTtcbiAgICAgICAgZXhwZWN0KGNvbmZpZy5hcmNoaXRlY3QpLm5vdC50b0JlRGVmaW5lZCgpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBkZXNjcmliZSgnYXBwIHByb2plY3RzJywgKCkgPT4ge1xuICAgICAgaXQoJ3Nob3VsZCBjcmVhdGUgdHdvIHByb2plY3RzIHBlciBhcHAnLCAoKSA9PiB7XG4gICAgICAgIHRyZWUuY3JlYXRlKG9sZENvbmZpZ1BhdGgsIEpTT04uc3RyaW5naWZ5KGJhc2VDb25maWcsIG51bGwsIDIpKTtcbiAgICAgICAgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ21pZ3JhdGlvbi0wMScsIGRlZmF1bHRPcHRpb25zLCB0cmVlKTtcbiAgICAgICAgY29uc3QgY29uZmlnID0gZ2V0Q29uZmlnKHRyZWUpO1xuICAgICAgICBleHBlY3QoT2JqZWN0LmtleXMoY29uZmlnLnByb2plY3RzKS5sZW5ndGgpLnRvRXF1YWwoMik7XG4gICAgICB9KTtcblxuICAgICAgaXQoJ3Nob3VsZCBjcmVhdGUgdHdvIHByb2plY3RzIHBlciBhcHAnLCAoKSA9PiB7XG4gICAgICAgIGJhc2VDb25maWcuYXBwcy5wdXNoKGJhc2VDb25maWcuYXBwc1swXSk7XG4gICAgICAgIHRyZWUuY3JlYXRlKG9sZENvbmZpZ1BhdGgsIEpTT04uc3RyaW5naWZ5KGJhc2VDb25maWcsIG51bGwsIDIpKTtcbiAgICAgICAgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ21pZ3JhdGlvbi0wMScsIGRlZmF1bHRPcHRpb25zLCB0cmVlKTtcbiAgICAgICAgY29uc3QgY29uZmlnID0gZ2V0Q29uZmlnKHRyZWUpO1xuICAgICAgICBleHBlY3QoT2JqZWN0LmtleXMoY29uZmlnLnByb2plY3RzKS5sZW5ndGgpLnRvRXF1YWwoNCk7XG4gICAgICB9KTtcblxuICAgICAgaXQoJ3Nob3VsZCB1c2UgdGhlIGFwcCBuYW1lIGlmIGRlZmluZWQnLCAoKSA9PiB7XG4gICAgICAgIGJhc2VDb25maWcuYXBwc1swXS5uYW1lID0gJ2Zvbyc7XG4gICAgICAgIGJhc2VDb25maWcuYXBwcy5wdXNoKGJhc2VDb25maWcuYXBwc1swXSk7XG4gICAgICAgIHRyZWUuY3JlYXRlKG9sZENvbmZpZ1BhdGgsIEpTT04uc3RyaW5naWZ5KGJhc2VDb25maWcsIG51bGwsIDIpKTtcbiAgICAgICAgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ21pZ3JhdGlvbi0wMScsIGRlZmF1bHRPcHRpb25zLCB0cmVlKTtcbiAgICAgICAgY29uc3QgY29uZmlnID0gZ2V0Q29uZmlnKHRyZWUpO1xuICAgICAgICBleHBlY3QoY29uZmlnLnByb2plY3RzLmZvbykudG9CZURlZmluZWQoKTtcbiAgICAgICAgZXhwZWN0KGNvbmZpZy5wcm9qZWN0c1snZm9vLWUyZSddKS50b0JlRGVmaW5lZCgpO1xuICAgICAgfSk7XG5cbiAgICAgIGl0KCdzaG91bGQgc2V0IHRoZSBwcm9qZWN0IHJvb3QgdmFsdWVzJywgKCkgPT4ge1xuICAgICAgICB0cmVlLmNyZWF0ZShvbGRDb25maWdQYXRoLCBKU09OLnN0cmluZ2lmeShiYXNlQ29uZmlnLCBudWxsLCAyKSk7XG4gICAgICAgIHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdtaWdyYXRpb24tMDEnLCBkZWZhdWx0T3B0aW9ucywgdHJlZSk7XG4gICAgICAgIGNvbnN0IHByb2plY3QgPSBnZXRDb25maWcodHJlZSkucHJvamVjdHMuZm9vO1xuICAgICAgICBleHBlY3QocHJvamVjdC5yb290KS50b0VxdWFsKCcnKTtcbiAgICAgICAgZXhwZWN0KHByb2plY3Quc291cmNlUm9vdCkudG9FcXVhbCgnc3JjJyk7XG4gICAgICAgIGV4cGVjdChwcm9qZWN0LnByb2plY3RUeXBlKS50b0VxdWFsKCdhcHBsaWNhdGlvbicpO1xuICAgICAgfSk7XG5cbiAgICAgIGl0KCdzaG91bGQgc2V0IHRoZSBwcm9qZWN0IHJvb3QgdmFsdWVzIGZvciBhIGRpZmZlcmVudCByb290JywgKCkgPT4ge1xuICAgICAgICBiYXNlQ29uZmlnLmFwcHNbMF0ucm9vdCA9ICdhcHBzL2FwcDEvc3JjJztcbiAgICAgICAgdHJlZS5jcmVhdGUob2xkQ29uZmlnUGF0aCwgSlNPTi5zdHJpbmdpZnkoYmFzZUNvbmZpZywgbnVsbCwgMikpO1xuICAgICAgICB0cmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnbWlncmF0aW9uLTAxJywgZGVmYXVsdE9wdGlvbnMsIHRyZWUpO1xuICAgICAgICBjb25zdCBwcm9qZWN0ID0gZ2V0Q29uZmlnKHRyZWUpLnByb2plY3RzLmZvbztcbiAgICAgICAgZXhwZWN0KHByb2plY3Qucm9vdCkudG9FcXVhbCgnYXBwcy9hcHAxJyk7XG4gICAgICAgIGV4cGVjdChwcm9qZWN0LnNvdXJjZVJvb3QpLnRvRXF1YWwoJ2FwcHMvYXBwMS9zcmMnKTtcbiAgICAgICAgZXhwZWN0KHByb2plY3QucHJvamVjdFR5cGUpLnRvRXF1YWwoJ2FwcGxpY2F0aW9uJyk7XG4gICAgICB9KTtcblxuICAgICAgaXQoJ3Nob3VsZCBzZXQgYnVpbGQgdGFyZ2V0JywgKCkgPT4ge1xuICAgICAgICB0cmVlLmNyZWF0ZShvbGRDb25maWdQYXRoLCBKU09OLnN0cmluZ2lmeShiYXNlQ29uZmlnLCBudWxsLCAyKSk7XG4gICAgICAgIHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdtaWdyYXRpb24tMDEnLCBkZWZhdWx0T3B0aW9ucywgdHJlZSk7XG4gICAgICAgIGNvbnN0IGJ1aWxkID0gZ2V0Q29uZmlnKHRyZWUpLnByb2plY3RzLmZvby5hcmNoaXRlY3QuYnVpbGQ7XG4gICAgICAgIGV4cGVjdChidWlsZC5idWlsZGVyKS50b0VxdWFsKCdAYW5ndWxhci1kZXZraXQvYnVpbGQtYW5ndWxhcjpicm93c2VyJyk7XG4gICAgICAgIGV4cGVjdChidWlsZC5vcHRpb25zLnNjcmlwdHMpLnRvRXF1YWwoW10pO1xuICAgICAgICBleHBlY3QoYnVpbGQub3B0aW9ucy5zdHlsZXMpLnRvRXF1YWwoWydzcmMvc3R5bGVzLmNzcyddKTtcbiAgICAgICAgZXhwZWN0KGJ1aWxkLm9wdGlvbnMuc3R5bGVQcmVwcm9jZXNzb3JPcHRpb25zKS50b0VxdWFsKHtpbmNsdWRlUGF0aHM6IFsnc3JjL3N0eWxlSW5jJ119KTtcbiAgICAgICAgZXhwZWN0KGJ1aWxkLm9wdGlvbnMuYXNzZXRzKS50b0VxdWFsKFtcbiAgICAgICAgICAnc3JjL2Fzc2V0cycsXG4gICAgICAgICAgJ3NyYy9mYXZpY29uLmljbycsXG4gICAgICAgICAgeyBnbG9iOiAnKiovKicsIGlucHV0OiAnc3JjL2Fzc2V0cycsIG91dHB1dDogJy9hc3NldHMnIH0sXG4gICAgICAgICAgeyBnbG9iOiAnZmF2aWNvbi5pY28nLCBpbnB1dDogJ3NyYycsIG91dHB1dDogJy8nIH0sXG4gICAgICAgIF0pO1xuICAgICAgICBleHBlY3QoYnVpbGQub3B0aW9ucy5uYW1lZENodW5rcykudG9FcXVhbCh0cnVlKTtcbiAgICAgICAgZXhwZWN0KGJ1aWxkLmNvbmZpZ3VyYXRpb25zKS50b0VxdWFsKHtcbiAgICAgICAgICBwcm9kdWN0aW9uOiB7XG4gICAgICAgICAgICBvcHRpbWl6YXRpb246IHRydWUsXG4gICAgICAgICAgICBvdXRwdXRIYXNoaW5nOiAnYWxsJyxcbiAgICAgICAgICAgIHNvdXJjZU1hcDogZmFsc2UsXG4gICAgICAgICAgICBleHRyYWN0Q3NzOiB0cnVlLFxuICAgICAgICAgICAgbmFtZWRDaHVua3M6IGZhbHNlLFxuICAgICAgICAgICAgYW90OiB0cnVlLFxuICAgICAgICAgICAgZXh0cmFjdExpY2Vuc2VzOiB0cnVlLFxuICAgICAgICAgICAgdmVuZG9yQ2h1bms6IGZhbHNlLFxuICAgICAgICAgICAgYnVpbGRPcHRpbWl6ZXI6IHRydWUsXG4gICAgICAgICAgICBmaWxlUmVwbGFjZW1lbnRzOiBbe1xuICAgICAgICAgICAgICByZXBsYWNlOiAnc3JjL2Vudmlyb25tZW50cy9lbnZpcm9ubWVudC50cycsXG4gICAgICAgICAgICAgIHdpdGg6ICdzcmMvZW52aXJvbm1lbnRzL2Vudmlyb25tZW50LnByb2QudHMnLFxuICAgICAgICAgICAgfV0sXG4gICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgICB9KTtcblxuICAgICAgaXQoJ3Nob3VsZCBub3Qgc2V0IGJhc2VIcmVmIG9uIGJ1aWxkICYgc2VydmUgdGFyZ2V0cyBpZiBub3QgZGVmaW5lZCcsICgpID0+IHtcbiAgICAgICAgdHJlZS5jcmVhdGUob2xkQ29uZmlnUGF0aCwgSlNPTi5zdHJpbmdpZnkoYmFzZUNvbmZpZywgbnVsbCwgMikpO1xuICAgICAgICB0cmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnbWlncmF0aW9uLTAxJywgZGVmYXVsdE9wdGlvbnMsIHRyZWUpO1xuICAgICAgICBjb25zdCBidWlsZCA9IGdldENvbmZpZyh0cmVlKS5wcm9qZWN0cy5mb28uYXJjaGl0ZWN0LmJ1aWxkO1xuICAgICAgICBleHBlY3QoYnVpbGQub3B0aW9ucy5iYXNlSHJlZikudG9CZVVuZGVmaW5lZCgpO1xuICAgICAgfSk7XG5cbiAgICAgIGl0KCdzaG91bGQgc2V0IGJhc2VIcmVmIG9uIGJ1aWxkICYgc2VydmUgdGFyZ2V0cyBpZiBkZWZpbmVkJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBjb25maWcgPSB7Li4uYmFzZUNvbmZpZ307XG4gICAgICAgIGNvbmZpZy5hcHBzWzBdLmJhc2VIcmVmID0gJy9iYXNlL2hyZWYvJztcbiAgICAgICAgdHJlZS5jcmVhdGUob2xkQ29uZmlnUGF0aCwgSlNPTi5zdHJpbmdpZnkoY29uZmlnLCBudWxsLCAyKSk7XG4gICAgICAgIHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdtaWdyYXRpb24tMDEnLCBkZWZhdWx0T3B0aW9ucywgdHJlZSk7XG4gICAgICAgIGNvbnN0IGJ1aWxkID0gZ2V0Q29uZmlnKHRyZWUpLnByb2plY3RzLmZvby5hcmNoaXRlY3QuYnVpbGQ7XG4gICAgICAgIGV4cGVjdChidWlsZC5vcHRpb25zLmJhc2VIcmVmKS50b0VxdWFsKCcvYmFzZS9ocmVmLycpO1xuICAgICAgfSk7XG5cbiAgICAgIGl0KCdzaG91bGQgYWRkIHNlcnZpY2VXb3JrZXIgdG8gcHJvZHVjdGlvbiBjb25maWd1cmF0aW9uJywgKCkgPT4ge1xuICAgICAgICBiYXNlQ29uZmlnLmFwcHNbMF0uc2VydmljZVdvcmtlciA9IHRydWU7XG4gICAgICAgIHRyZWUuY3JlYXRlKG9sZENvbmZpZ1BhdGgsIEpTT04uc3RyaW5naWZ5KGJhc2VDb25maWcsIG51bGwsIDIpKTtcbiAgICAgICAgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ21pZ3JhdGlvbi0wMScsIGRlZmF1bHRPcHRpb25zLCB0cmVlKTtcbiAgICAgICAgY29uc3QgY29uZmlnID0gZ2V0Q29uZmlnKHRyZWUpO1xuICAgICAgICBleHBlY3QoY29uZmlnLnByb2plY3RzLmZvby5hcmNoaXRlY3QuYnVpbGQub3B0aW9ucy5zZXJ2aWNlV29ya2VyKS50b0JlVW5kZWZpbmVkKCk7XG4gICAgICAgIGV4cGVjdChcbiAgICAgICAgICBjb25maWcucHJvamVjdHMuZm9vLmFyY2hpdGVjdC5idWlsZC5jb25maWd1cmF0aW9ucy5wcm9kdWN0aW9uLnNlcnZpY2VXb3JrZXIsXG4gICAgICAgICkudG9CZSh0cnVlKTtcbiAgICAgIH0pO1xuXG4gICAgICBpdCgnc2hvdWxkIHNldCB0aGUgc2VydmUgdGFyZ2V0JywgKCkgPT4ge1xuICAgICAgICB0cmVlLmNyZWF0ZShvbGRDb25maWdQYXRoLCBKU09OLnN0cmluZ2lmeShiYXNlQ29uZmlnLCBudWxsLCAyKSk7XG4gICAgICAgIHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdtaWdyYXRpb24tMDEnLCBkZWZhdWx0T3B0aW9ucywgdHJlZSk7XG4gICAgICAgIGNvbnN0IHNlcnZlID0gZ2V0Q29uZmlnKHRyZWUpLnByb2plY3RzLmZvby5hcmNoaXRlY3Quc2VydmU7XG4gICAgICAgIGV4cGVjdChzZXJ2ZS5idWlsZGVyKS50b0VxdWFsKCdAYW5ndWxhci1kZXZraXQvYnVpbGQtYW5ndWxhcjpkZXYtc2VydmVyJyk7XG4gICAgICAgIGV4cGVjdChzZXJ2ZS5vcHRpb25zKS50b0VxdWFsKHtcbiAgICAgICAgICBicm93c2VyVGFyZ2V0OiAnZm9vOmJ1aWxkJyxcbiAgICAgICAgICBwb3J0OiA4MDgwLFxuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgcHJvZENvbmZpZyA9IHNlcnZlLmNvbmZpZ3VyYXRpb25zLnByb2R1Y3Rpb247XG4gICAgICAgIGV4cGVjdChwcm9kQ29uZmlnLmJyb3dzZXJUYXJnZXQpLnRvRXF1YWwoJ2ZvbzpidWlsZDpwcm9kdWN0aW9uJyk7XG4gICAgICB9KTtcblxuICAgICAgaXQoJ3Nob3VsZCBzZXQgdGhlIHRlc3QgdGFyZ2V0JywgKCkgPT4ge1xuICAgICAgICB0cmVlLmNyZWF0ZShvbGRDb25maWdQYXRoLCBKU09OLnN0cmluZ2lmeShiYXNlQ29uZmlnLCBudWxsLCAyKSk7XG4gICAgICAgIHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdtaWdyYXRpb24tMDEnLCBkZWZhdWx0T3B0aW9ucywgdHJlZSk7XG4gICAgICAgIGNvbnN0IHRlc3QgPSBnZXRDb25maWcodHJlZSkucHJvamVjdHMuZm9vLmFyY2hpdGVjdFsndGVzdCddO1xuICAgICAgICBleHBlY3QodGVzdC5idWlsZGVyKS50b0VxdWFsKCdAYW5ndWxhci1kZXZraXQvYnVpbGQtYW5ndWxhcjprYXJtYScpO1xuICAgICAgICBleHBlY3QodGVzdC5vcHRpb25zLm1haW4pLnRvRXF1YWwoJ3NyYy90ZXN0LnRzJyk7XG4gICAgICAgIGV4cGVjdCh0ZXN0Lm9wdGlvbnMucG9seWZpbGxzKS50b0VxdWFsKCdzcmMvcG9seWZpbGxzLnRzJyk7XG4gICAgICAgIGV4cGVjdCh0ZXN0Lm9wdGlvbnMudHNDb25maWcpLnRvRXF1YWwoJ3NyYy90c2NvbmZpZy5zcGVjLmpzb24nKTtcbiAgICAgICAgZXhwZWN0KHRlc3Qub3B0aW9ucy5rYXJtYUNvbmZpZykudG9FcXVhbCgnLi9rYXJtYS5jb25mLmpzJyk7XG4gICAgICAgIGV4cGVjdCh0ZXN0Lm9wdGlvbnMuc2NyaXB0cykudG9FcXVhbChbXSk7XG4gICAgICAgIGV4cGVjdCh0ZXN0Lm9wdGlvbnMuc3R5bGVzKS50b0VxdWFsKFsnc3JjL3N0eWxlcy5jc3MnXSk7XG4gICAgICAgIGV4cGVjdCh0ZXN0Lm9wdGlvbnMuYXNzZXRzKS50b0VxdWFsKFtcbiAgICAgICAgICAnc3JjL2Fzc2V0cycsXG4gICAgICAgICAgJ3NyYy9mYXZpY29uLmljbycsXG4gICAgICAgICAgeyBnbG9iOiAnKiovKicsIGlucHV0OiAnc3JjL2Fzc2V0cycsIG91dHB1dDogJy9hc3NldHMnIH0sXG4gICAgICAgICAgeyBnbG9iOiAnZmF2aWNvbi5pY28nLCBpbnB1dDogJ3NyYycsIG91dHB1dDogJy8nIH0sXG4gICAgICAgIF0pO1xuICAgICAgfSk7XG5cbiAgICAgIGl0KCdzaG91bGQgc2V0IHRoZSBleHRyYWN0IGkxOG4gdGFyZ2V0JywgKCkgPT4ge1xuICAgICAgICB0cmVlLmNyZWF0ZShvbGRDb25maWdQYXRoLCBKU09OLnN0cmluZ2lmeShiYXNlQ29uZmlnLCBudWxsLCAyKSk7XG4gICAgICAgIHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdtaWdyYXRpb24tMDEnLCBkZWZhdWx0T3B0aW9ucywgdHJlZSk7XG4gICAgICAgIGNvbnN0IGV4dHJhY3QgPSBnZXRDb25maWcodHJlZSkucHJvamVjdHMuZm9vLmFyY2hpdGVjdFsnZXh0cmFjdC1pMThuJ107XG4gICAgICAgIGV4cGVjdChleHRyYWN0LmJ1aWxkZXIpLnRvRXF1YWwoJ0Bhbmd1bGFyLWRldmtpdC9idWlsZC1hbmd1bGFyOmV4dHJhY3QtaTE4bicpO1xuICAgICAgICBleHBlY3QoZXh0cmFjdC5vcHRpb25zKS50b0JlRGVmaW5lZCgpO1xuICAgICAgICBleHBlY3QoZXh0cmFjdC5vcHRpb25zLmJyb3dzZXJUYXJnZXQpLnRvRXF1YWwoYGZvbzpidWlsZGAgKTtcbiAgICAgIH0pO1xuXG4gICAgICBpdCgnc2hvdWxkIHNldCB0aGUgbGludCB0YXJnZXQnLCAoKSA9PiB7XG4gICAgICAgIHRyZWUuY3JlYXRlKG9sZENvbmZpZ1BhdGgsIEpTT04uc3RyaW5naWZ5KGJhc2VDb25maWcsIG51bGwsIDIpKTtcbiAgICAgICAgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ21pZ3JhdGlvbi0wMScsIGRlZmF1bHRPcHRpb25zLCB0cmVlKTtcbiAgICAgICAgY29uc3QgdHNsaW50ID0gZ2V0Q29uZmlnKHRyZWUpLnByb2plY3RzLmZvby5hcmNoaXRlY3RbJ2xpbnQnXTtcbiAgICAgICAgZXhwZWN0KHRzbGludC5idWlsZGVyKS50b0VxdWFsKCdAYW5ndWxhci1kZXZraXQvYnVpbGQtYW5ndWxhcjp0c2xpbnQnKTtcbiAgICAgICAgZXhwZWN0KHRzbGludC5vcHRpb25zKS50b0JlRGVmaW5lZCgpO1xuICAgICAgICBleHBlY3QodHNsaW50Lm9wdGlvbnMudHNDb25maWcpXG4gICAgICAgICAgLnRvRXF1YWwoWydzcmMvdHNjb25maWcuYXBwLmpzb24nLCAnc3JjL3RzY29uZmlnLnNwZWMuanNvbiddKTtcbiAgICAgICAgZXhwZWN0KHRzbGludC5vcHRpb25zLmV4Y2x1ZGUpLnRvRXF1YWwoWyAnKiovbm9kZV9tb2R1bGVzLyoqJyBdKTtcbiAgICAgIH0pO1xuXG4gICAgICBpdCgnc2hvdWxkIHNldCB0aGUgYnVkZ2V0cyBjb25maWd1cmF0aW9uJywgKCkgPT4ge1xuICAgICAgICBiYXNlQ29uZmlnLmFwcHNbMF0uYnVkZ2V0cyA9IFt7XG4gICAgICAgICAgdHlwZTogJ2J1bmRsZScsXG4gICAgICAgICAgbmFtZTogJ21haW4nLFxuICAgICAgICAgIGVycm9yOiAnMTIza2InLFxuICAgICAgICB9XTtcblxuICAgICAgICB0cmVlLmNyZWF0ZShvbGRDb25maWdQYXRoLCBKU09OLnN0cmluZ2lmeShiYXNlQ29uZmlnLCBudWxsLCAyKSk7XG4gICAgICAgIHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdtaWdyYXRpb24tMDEnLCBkZWZhdWx0T3B0aW9ucywgdHJlZSk7XG4gICAgICAgIGNvbnN0IGNvbmZpZyA9IGdldENvbmZpZyh0cmVlKTtcbiAgICAgICAgY29uc3QgYnVkZ2V0cyA9IGNvbmZpZy5wcm9qZWN0cy5mb28uYXJjaGl0ZWN0LmJ1aWxkLmNvbmZpZ3VyYXRpb25zLnByb2R1Y3Rpb24uYnVkZ2V0cztcbiAgICAgICAgZXhwZWN0KGJ1ZGdldHMubGVuZ3RoKS50b0VxdWFsKDEpO1xuICAgICAgICBleHBlY3QoYnVkZ2V0c1swXS50eXBlKS50b0VxdWFsKCdidW5kbGUnKTtcbiAgICAgICAgZXhwZWN0KGJ1ZGdldHNbMF0ubmFtZSkudG9FcXVhbCgnbWFpbicpO1xuICAgICAgICBleHBlY3QoYnVkZ2V0c1swXS5lcnJvcikudG9FcXVhbCgnMTIza2InKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgZGVzY3JpYmUoJ2UyZSBwcm9qZWN0cycsICgpID0+IHtcbiAgICAgIGl0KCdzaG91bGQgc2V0IHRoZSBwcm9qZWN0IHJvb3QgdmFsdWVzJywgKCkgPT4ge1xuICAgICAgICB0cmVlLmNyZWF0ZShvbGRDb25maWdQYXRoLCBKU09OLnN0cmluZ2lmeShiYXNlQ29uZmlnLCBudWxsLCAyKSk7XG4gICAgICAgIHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdtaWdyYXRpb24tMDEnLCBkZWZhdWx0T3B0aW9ucywgdHJlZSk7XG4gICAgICAgIGNvbnN0IGUyZVByb2plY3QgPSBnZXRDb25maWcodHJlZSkucHJvamVjdHNbJ2Zvby1lMmUnXTtcbiAgICAgICAgZXhwZWN0KGUyZVByb2plY3Qucm9vdCkudG9CZSgnJyk7XG4gICAgICAgIGV4cGVjdChlMmVQcm9qZWN0LnNvdXJjZVJvb3QpLnRvQmUoJ2UyZScpO1xuICAgICAgICBjb25zdCBlMmVPcHRpb25zID0gZTJlUHJvamVjdC5hcmNoaXRlY3QuZTJlO1xuICAgICAgICBleHBlY3QoZTJlT3B0aW9ucy5idWlsZGVyKS50b0VxdWFsKCdAYW5ndWxhci1kZXZraXQvYnVpbGQtYW5ndWxhcjpwcm90cmFjdG9yJyk7XG4gICAgICAgIGNvbnN0IG9wdGlvbnMgPSBlMmVPcHRpb25zLm9wdGlvbnM7XG4gICAgICAgIGV4cGVjdChvcHRpb25zLnByb3RyYWN0b3JDb25maWcpLnRvRXF1YWwoJy4vcHJvdHJhY3Rvci5jb25mLmpzJyk7XG4gICAgICAgIGV4cGVjdChvcHRpb25zLmRldlNlcnZlclRhcmdldCkudG9FcXVhbCgnZm9vOnNlcnZlJyk7XG4gICAgICB9KTtcblxuICAgICAgaXQoJ3Nob3VsZCBzZXQgdGhlIHByb2plY3Qgcm9vdCB2YWx1ZXMgZm9yIGEgZGlmZmVyZW50IHJvb3QnLCAoKSA9PiB7XG4gICAgICAgIGJhc2VDb25maWcuYXBwc1swXS5yb290ID0gJ2FwcHMvYXBwMS9zcmMnO1xuICAgICAgICB0cmVlLmNyZWF0ZShvbGRDb25maWdQYXRoLCBKU09OLnN0cmluZ2lmeShiYXNlQ29uZmlnLCBudWxsLCAyKSk7XG4gICAgICAgIHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdtaWdyYXRpb24tMDEnLCBkZWZhdWx0T3B0aW9ucywgdHJlZSk7XG4gICAgICAgIGNvbnN0IGUyZVByb2plY3QgPSBnZXRDb25maWcodHJlZSkucHJvamVjdHNbJ2Zvby1lMmUnXTtcbiAgICAgICAgZXhwZWN0KGUyZVByb2plY3Qucm9vdCkudG9CZSgnYXBwcy9hcHAxJyk7XG4gICAgICAgIGV4cGVjdChlMmVQcm9qZWN0LnNvdXJjZVJvb3QpLnRvQmUoJ2FwcHMvYXBwMS9lMmUnKTtcbiAgICAgICAgY29uc3QgZTJlT3B0aW9ucyA9IGUyZVByb2plY3QuYXJjaGl0ZWN0LmUyZTtcbiAgICAgICAgZXhwZWN0KGUyZU9wdGlvbnMuYnVpbGRlcikudG9FcXVhbCgnQGFuZ3VsYXItZGV2a2l0L2J1aWxkLWFuZ3VsYXI6cHJvdHJhY3RvcicpO1xuICAgICAgICBjb25zdCBvcHRpb25zID0gZTJlT3B0aW9ucy5vcHRpb25zO1xuICAgICAgICBleHBlY3Qob3B0aW9ucy5wcm90cmFjdG9yQ29uZmlnKS50b0VxdWFsKCcuL3Byb3RyYWN0b3IuY29uZi5qcycpO1xuICAgICAgICBleHBlY3Qob3B0aW9ucy5kZXZTZXJ2ZXJUYXJnZXQpLnRvRXF1YWwoJ2ZvbzpzZXJ2ZScpO1xuICAgICAgfSk7XG5cbiAgICAgIGl0KCdzaG91bGQgc2V0IHRoZSBsaW50IHRhcmdldCcsICgpID0+IHtcbiAgICAgICAgdHJlZS5jcmVhdGUob2xkQ29uZmlnUGF0aCwgSlNPTi5zdHJpbmdpZnkoYmFzZUNvbmZpZywgbnVsbCwgMikpO1xuICAgICAgICB0cmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnbWlncmF0aW9uLTAxJywgZGVmYXVsdE9wdGlvbnMsIHRyZWUpO1xuICAgICAgICBjb25zdCB0c2xpbnQgPSBnZXRDb25maWcodHJlZSkucHJvamVjdHNbJ2Zvby1lMmUnXS5hcmNoaXRlY3QubGludDtcbiAgICAgICAgZXhwZWN0KHRzbGludC5idWlsZGVyKS50b0VxdWFsKCdAYW5ndWxhci1kZXZraXQvYnVpbGQtYW5ndWxhcjp0c2xpbnQnKTtcbiAgICAgICAgZXhwZWN0KHRzbGludC5vcHRpb25zKS50b0JlRGVmaW5lZCgpO1xuICAgICAgICBleHBlY3QodHNsaW50Lm9wdGlvbnMudHNDb25maWcpLnRvRXF1YWwoWydlMmUvdHNjb25maWcuZTJlLmpzb24nXSk7XG4gICAgICAgIGV4cGVjdCh0c2xpbnQub3B0aW9ucy5leGNsdWRlKS50b0VxdWFsKFsgJyoqL25vZGVfbW9kdWxlcy8qKicgXSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ2thcm1hIGNvbmZpZycsICgpID0+IHtcbiAgICBjb25zdCBrYXJtYVBhdGggPSAnL2thcm1hLmNvbmYuanMnO1xuICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgdHJlZS5jcmVhdGUoa2FybWFQYXRoLCBgXG4gICAgICAgIC8vIEBhbmd1bGFyL2NsaVxuICAgICAgICAvLyByZXBvcnRzXG4gICAgICBgKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgcmVwbGFjZSByZWZlcmVuY2VzIHRvIFwiQGFuZ3VsYXIvY2xpXCInLCAoKSA9PiB7XG4gICAgICB0cmVlLmNyZWF0ZShvbGRDb25maWdQYXRoLCBKU09OLnN0cmluZ2lmeShiYXNlQ29uZmlnLCBudWxsLCAyKSk7XG4gICAgICB0cmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnbWlncmF0aW9uLTAxJywgZGVmYXVsdE9wdGlvbnMsIHRyZWUpO1xuICAgICAgY29uc3QgY29udGVudCA9IHRyZWUucmVhZENvbnRlbnQoa2FybWFQYXRoKTtcbiAgICAgIGV4cGVjdChjb250ZW50KS5ub3QudG9Db250YWluKCdAYW5ndWxhci9jbGknKTtcbiAgICAgIGV4cGVjdChjb250ZW50KS50b0NvbnRhaW4oJ0Bhbmd1bGFyLWRldmtpdC9idWlsZC1hbmd1bGFyJyk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIHJlcGxhY2UgcmVmZXJlbmNlcyB0byBcInJlcG9ydHNcIicsICgpID0+IHtcbiAgICAgIHRyZWUuY3JlYXRlKG9sZENvbmZpZ1BhdGgsIEpTT04uc3RyaW5naWZ5KGJhc2VDb25maWcsIG51bGwsIDIpKTtcbiAgICAgIHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdtaWdyYXRpb24tMDEnLCBkZWZhdWx0T3B0aW9ucywgdHJlZSk7XG4gICAgICBjb25zdCBjb250ZW50ID0gdHJlZS5yZWFkQ29udGVudChrYXJtYVBhdGgpO1xuICAgICAgZXhwZWN0KGNvbnRlbnQpLnRvQ29udGFpbihgZGlyOiByZXF1aXJlKCdwYXRoJykuam9pbihfX2Rpcm5hbWUsICdjb3ZlcmFnZScpLCByZXBvcnRzYCk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIHJlbW92ZSB1bnVzZWQgcHJvcGVydGllcyBpbiAxLjAgY29uZmlncycsICgpID0+IHtcbiAgICAgIHRyZWUub3ZlcndyaXRlKGthcm1hUGF0aCwgYFxuICAgICAgICBmaWxlczogW1xuICAgICAgICAgIHsgcGF0dGVybjogJy4vc3JjL3Rlc3QudHMnLCB3YXRjaGVkOiBmYWxzZSB9XG4gICAgICAgIF0sXG4gICAgICAgIHByZXByb2Nlc3NvcnM6IHtcbiAgICAgICAgICAnLi9zcmMvdGVzdC50cyc6IFsnQGFuZ3VsYXIvY2xpJ11cbiAgICAgICAgfSxcbiAgICAgICAgYW5ndWxhckNsaToge1xuICAgICAgICAgIGVudmlyb25tZW50OiAnZGV2J1xuICAgICAgICB9LFxuICAgICAgYCk7XG5cbiAgICAgIHRyZWUuY3JlYXRlKG9sZENvbmZpZ1BhdGgsIEpTT04uc3RyaW5naWZ5KGJhc2VDb25maWcsIG51bGwsIDIpKTtcbiAgICAgIHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdtaWdyYXRpb24tMDEnLCBkZWZhdWx0T3B0aW9ucywgdHJlZSk7XG4gICAgICBjb25zdCBjb250ZW50ID0gdHJlZS5yZWFkQ29udGVudChrYXJtYVBhdGgpO1xuICAgICAgZXhwZWN0KGNvbnRlbnQpLm5vdC50b0NvbnRhaW4oYHsgcGF0dGVybjogJy4vc3JjL3Rlc3QudHMnLCB3YXRjaGVkOiBmYWxzZSB9YCk7XG4gICAgICBleHBlY3QoY29udGVudCkubm90LnRvQ29udGFpbihgJy4vc3JjL3Rlc3QudHMnOiBbJ0Bhbmd1bGFyL2NsaSddYCk7XG4gICAgICBleHBlY3QoY29udGVudCkubm90LnRvTWF0Y2goL2FuZ3VsYXJDbGlbXn1dKn0sPy8pO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnc3BlYyB0cyBjb25maWcnLCAoKSA9PiB7XG4gICAgY29uc3QgdGVzdFRzY29uZmlnUGF0aCA9ICcvc3JjL3RzY29uZmlnLnNwZWMuanNvbic7XG4gICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICB0cmVlLmNyZWF0ZSh0ZXN0VHNjb25maWdQYXRoLCBgXG4gICAgICAgIHtcbiAgICAgICAgICBcImZpbGVzXCI6IFsgXCJ0ZXN0LnRzXCIgXVxuICAgICAgICB9XG4gICAgICBgKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgYWRkIHBvbHlmaWxscycsICgpID0+IHtcbiAgICAgIHRyZWUuY3JlYXRlKG9sZENvbmZpZ1BhdGgsIEpTT04uc3RyaW5naWZ5KGJhc2VDb25maWcsIG51bGwsIDIpKTtcbiAgICAgIHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdtaWdyYXRpb24tMDEnLCBkZWZhdWx0T3B0aW9ucywgdHJlZSk7XG4gICAgICBjb25zdCBjb250ZW50ID0gdHJlZS5yZWFkQ29udGVudCh0ZXN0VHNjb25maWdQYXRoKTtcbiAgICAgIGV4cGVjdChjb250ZW50KS50b0NvbnRhaW4oJ3BvbHlmaWxscy50cycpO1xuICAgICAgY29uc3QgY29uZmlnID0gSlNPTi5wYXJzZShjb250ZW50KTtcbiAgICAgIGV4cGVjdChjb25maWcuZmlsZXMubGVuZ3RoKS50b0VxdWFsKDIpO1xuICAgICAgZXhwZWN0KGNvbmZpZy5maWxlc1sxXSkudG9FcXVhbCgncG9seWZpbGxzLnRzJyk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIG5vdCBhZGQgcG9seWZpbGxzIGl0IGlmIGl0IGFscmVhZHkgZXhpc3RzJywgKCkgPT4ge1xuICAgICAgdHJlZS5vdmVyd3JpdGUodGVzdFRzY29uZmlnUGF0aCwgYFxuICAgICAgICB7XG4gICAgICAgICAgXCJmaWxlc1wiOiBbIFwidGVzdC50c1wiLCBcInBvbHlmaWxscy50c1wiIF1cbiAgICAgICAgfVxuICAgICAgYCk7XG4gICAgICB0cmVlLmNyZWF0ZShvbGRDb25maWdQYXRoLCBKU09OLnN0cmluZ2lmeShiYXNlQ29uZmlnLCBudWxsLCAyKSk7XG4gICAgICB0cmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnbWlncmF0aW9uLTAxJywgZGVmYXVsdE9wdGlvbnMsIHRyZWUpO1xuICAgICAgY29uc3QgY29udGVudCA9IHRyZWUucmVhZENvbnRlbnQodGVzdFRzY29uZmlnUGF0aCk7XG4gICAgICBleHBlY3QoY29udGVudCkudG9Db250YWluKCdwb2x5ZmlsbHMudHMnKTtcbiAgICAgIGNvbnN0IGNvbmZpZyA9IEpTT04ucGFyc2UoY29udGVudCk7XG4gICAgICBleHBlY3QoY29uZmlnLmZpbGVzLmxlbmd0aCkudG9FcXVhbCgyKTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ3BhY2thZ2UuanNvbicsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIGFkZCBhIGRldiBkZXBlbmRlbmN5IHRvIEBhbmd1bGFyLWRldmtpdC9idWlsZC1hbmd1bGFyJywgKCkgPT4ge1xuICAgICAgdHJlZS5jcmVhdGUob2xkQ29uZmlnUGF0aCwgSlNPTi5zdHJpbmdpZnkoYmFzZUNvbmZpZywgbnVsbCwgMikpO1xuICAgICAgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ21pZ3JhdGlvbi0wMScsIGRlZmF1bHRPcHRpb25zLCB0cmVlKTtcbiAgICAgIGNvbnN0IGNvbnRlbnQgPSB0cmVlLnJlYWRDb250ZW50KCcvcGFja2FnZS5qc29uJyk7XG4gICAgICBjb25zdCBwa2cgPSBKU09OLnBhcnNlKGNvbnRlbnQpO1xuICAgICAgZXhwZWN0KHBrZy5kZXZEZXBlbmRlbmNpZXNbJ0Bhbmd1bGFyLWRldmtpdC9idWlsZC1hbmd1bGFyJ10pXG4gICAgICAgIC50b0JlKGxhdGVzdFZlcnNpb25zLkRldmtpdEJ1aWxkQW5ndWxhcik7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIGFkZCBhIGRldiBkZXBlbmRlbmN5IHRvIEBhbmd1bGFyLWRldmtpdC9idWlsZC1hbmd1bGFyIChwcmVzZW50KScsICgpID0+IHtcbiAgICAgIHRyZWUuY3JlYXRlKG9sZENvbmZpZ1BhdGgsIEpTT04uc3RyaW5naWZ5KGJhc2VDb25maWcsIG51bGwsIDIpKTtcbiAgICAgIHRyZWUub3ZlcndyaXRlKCcvcGFja2FnZS5qc29uJywgSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICBkZXZEZXBlbmRlbmNpZXM6IHtcbiAgICAgICAgICAnQGFuZ3VsYXItZGV2a2l0L2J1aWxkLWFuZ3VsYXInOiAnMC4wLjAnLFxuICAgICAgICB9LFxuICAgICAgfSwgbnVsbCwgMikpO1xuICAgICAgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ21pZ3JhdGlvbi0wMScsIGRlZmF1bHRPcHRpb25zLCB0cmVlKTtcbiAgICAgIGNvbnN0IGNvbnRlbnQgPSB0cmVlLnJlYWRDb250ZW50KCcvcGFja2FnZS5qc29uJyk7XG4gICAgICBjb25zdCBwa2cgPSBKU09OLnBhcnNlKGNvbnRlbnQpO1xuICAgICAgZXhwZWN0KHBrZy5kZXZEZXBlbmRlbmNpZXNbJ0Bhbmd1bGFyLWRldmtpdC9idWlsZC1hbmd1bGFyJ10pXG4gICAgICAgIC50b0JlKGxhdGVzdFZlcnNpb25zLkRldmtpdEJ1aWxkQW5ndWxhcik7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIGFkZCBhIGRldiBkZXBlbmRlbmN5IHRvIEBhbmd1bGFyLWRldmtpdC9idWlsZC1hbmd1bGFyIChubyBkZXYpJywgKCkgPT4ge1xuICAgICAgdHJlZS5jcmVhdGUob2xkQ29uZmlnUGF0aCwgSlNPTi5zdHJpbmdpZnkoYmFzZUNvbmZpZywgbnVsbCwgMikpO1xuICAgICAgdHJlZS5vdmVyd3JpdGUoJy9wYWNrYWdlLmpzb24nLCBKU09OLnN0cmluZ2lmeSh7fSwgbnVsbCwgMikpO1xuICAgICAgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ21pZ3JhdGlvbi0wMScsIGRlZmF1bHRPcHRpb25zLCB0cmVlKTtcbiAgICAgIGNvbnN0IGNvbnRlbnQgPSB0cmVlLnJlYWRDb250ZW50KCcvcGFja2FnZS5qc29uJyk7XG4gICAgICBjb25zdCBwa2cgPSBKU09OLnBhcnNlKGNvbnRlbnQpO1xuICAgICAgZXhwZWN0KHBrZy5kZXZEZXBlbmRlbmNpZXNbJ0Bhbmd1bGFyLWRldmtpdC9idWlsZC1hbmd1bGFyJ10pXG4gICAgICAgIC50b0JlKGxhdGVzdFZlcnNpb25zLkRldmtpdEJ1aWxkQW5ndWxhcik7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCd0c2xpbnQuanNvbicsICgpID0+IHtcbiAgICBjb25zdCB0c2xpbnRQYXRoID0gJy90c2xpbnQuanNvbic7XG4gICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWFueVxuICAgIGxldCB0c2xpbnRDb25maWc6IGFueTtcbiAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgIHRzbGludENvbmZpZyA9IHtcbiAgICAgICAgcnVsZXM6IHtcbiAgICAgICAgICAnaW1wb3J0LWJsYWNrbGlzdCc6IFsnc29tZScsICdyeGpzJywgJ2Vsc2UnXSxcbiAgICAgICAgfSxcbiAgICAgIH07XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIHJlbW92ZSBcInJ4anNcIiBmcm9tIHRoZSBcImltcG9ydC1ibGFja2xpc3RcIiBydWxlJywgKCkgPT4ge1xuICAgICAgdHJlZS5jcmVhdGUob2xkQ29uZmlnUGF0aCwgSlNPTi5zdHJpbmdpZnkoYmFzZUNvbmZpZywgbnVsbCwgMikpO1xuICAgICAgdHJlZS5jcmVhdGUodHNsaW50UGF0aCwgSlNPTi5zdHJpbmdpZnkodHNsaW50Q29uZmlnLCBudWxsLCAyKSk7XG4gICAgICB0cmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnbWlncmF0aW9uLTAxJywgZGVmYXVsdE9wdGlvbnMsIHRyZWUpO1xuICAgICAgY29uc3QgdHNsaW50ID0gSlNPTi5wYXJzZSh0cmVlLnJlYWRDb250ZW50KHRzbGludFBhdGgpKTtcbiAgICAgIGV4cGVjdCh0c2xpbnQucnVsZXNbJ2ltcG9ydC1ibGFja2xpc3QnXSkudG9FcXVhbChbJ3NvbWUnLCAnZWxzZSddKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgcmVtb3ZlIFwicnhqc1wiIGZyb20gdGhlIFwiaW1wb3J0LWJsYWNrbGlzdFwiIHJ1bGUgKG9ubHkpJywgKCkgPT4ge1xuICAgICAgdHJlZS5jcmVhdGUob2xkQ29uZmlnUGF0aCwgSlNPTi5zdHJpbmdpZnkoYmFzZUNvbmZpZywgbnVsbCwgMikpO1xuICAgICAgdHNsaW50Q29uZmlnLnJ1bGVzWydpbXBvcnQtYmxhY2tsaXN0J10gPSBbJ3J4anMnXTtcbiAgICAgIHRyZWUuY3JlYXRlKHRzbGludFBhdGgsIEpTT04uc3RyaW5naWZ5KHRzbGludENvbmZpZywgbnVsbCwgMikpO1xuICAgICAgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ21pZ3JhdGlvbi0wMScsIGRlZmF1bHRPcHRpb25zLCB0cmVlKTtcbiAgICAgIGNvbnN0IHRzbGludCA9IEpTT04ucGFyc2UodHJlZS5yZWFkQ29udGVudCh0c2xpbnRQYXRoKSk7XG4gICAgICBleHBlY3QodHNsaW50LnJ1bGVzWydpbXBvcnQtYmxhY2tsaXN0J10pLnRvRXF1YWwoW10pO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCByZW1vdmUgXCJyeGpzXCIgZnJvbSB0aGUgXCJpbXBvcnQtYmxhY2tsaXN0XCIgcnVsZSAoZmlyc3QpJywgKCkgPT4ge1xuICAgICAgdHJlZS5jcmVhdGUob2xkQ29uZmlnUGF0aCwgSlNPTi5zdHJpbmdpZnkoYmFzZUNvbmZpZywgbnVsbCwgMikpO1xuICAgICAgdHNsaW50Q29uZmlnLnJ1bGVzWydpbXBvcnQtYmxhY2tsaXN0J10gPSBbJ3J4anMnLCAnZWxzZSddO1xuICAgICAgdHJlZS5jcmVhdGUodHNsaW50UGF0aCwgSlNPTi5zdHJpbmdpZnkodHNsaW50Q29uZmlnLCBudWxsLCAyKSk7XG4gICAgICB0cmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnbWlncmF0aW9uLTAxJywgZGVmYXVsdE9wdGlvbnMsIHRyZWUpO1xuICAgICAgY29uc3QgdHNsaW50ID0gSlNPTi5wYXJzZSh0cmVlLnJlYWRDb250ZW50KHRzbGludFBhdGgpKTtcbiAgICAgIGV4cGVjdCh0c2xpbnQucnVsZXNbJ2ltcG9ydC1ibGFja2xpc3QnXSkudG9FcXVhbChbJ2Vsc2UnXSk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIHJlbW92ZSBcInJ4anNcIiBmcm9tIHRoZSBcImltcG9ydC1ibGFja2xpc3RcIiBydWxlIChsYXN0KScsICgpID0+IHtcbiAgICAgIHRyZWUuY3JlYXRlKG9sZENvbmZpZ1BhdGgsIEpTT04uc3RyaW5naWZ5KGJhc2VDb25maWcsIG51bGwsIDIpKTtcbiAgICAgIHRzbGludENvbmZpZy5ydWxlc1snaW1wb3J0LWJsYWNrbGlzdCddID0gWydzb21lJywgJ3J4anMnXTtcbiAgICAgIHRyZWUuY3JlYXRlKHRzbGludFBhdGgsIEpTT04uc3RyaW5naWZ5KHRzbGludENvbmZpZywgbnVsbCwgMikpO1xuICAgICAgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ21pZ3JhdGlvbi0wMScsIGRlZmF1bHRPcHRpb25zLCB0cmVlKTtcbiAgICAgIGNvbnN0IHRzbGludCA9IEpTT04ucGFyc2UodHJlZS5yZWFkQ29udGVudCh0c2xpbnRQYXRoKSk7XG4gICAgICBleHBlY3QodHNsaW50LnJ1bGVzWydpbXBvcnQtYmxhY2tsaXN0J10pLnRvRXF1YWwoWydzb21lJ10pO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCB3b3JrIGlmIFwicnhqc1wiIGlzIG5vdCBpbiB0aGUgXCJpbXBvcnQtYmxhY2tsaXN0XCIgcnVsZScsICgpID0+IHtcbiAgICAgIHRyZWUuY3JlYXRlKG9sZENvbmZpZ1BhdGgsIEpTT04uc3RyaW5naWZ5KGJhc2VDb25maWcsIG51bGwsIDIpKTtcbiAgICAgIHRzbGludENvbmZpZy5ydWxlc1snaW1wb3J0LWJsYWNrbGlzdCddID0gW107XG4gICAgICB0cmVlLmNyZWF0ZSh0c2xpbnRQYXRoLCBKU09OLnN0cmluZ2lmeSh0c2xpbnRDb25maWcsIG51bGwsIDIpKTtcbiAgICAgIHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdtaWdyYXRpb24tMDEnLCBkZWZhdWx0T3B0aW9ucywgdHJlZSk7XG4gICAgICBjb25zdCB0c2xpbnQgPSBKU09OLnBhcnNlKHRyZWUucmVhZENvbnRlbnQodHNsaW50UGF0aCkpO1xuICAgICAgY29uc3QgYmxhY2tsaXN0ID0gdHNsaW50LnJ1bGVzWydpbXBvcnQtYmxhY2tsaXN0J107XG4gICAgICBleHBlY3QoYmxhY2tsaXN0KS50b0VxdWFsKFtdKTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ3NlcnZlci91bml2ZXJzYWwgYXBwcycsICgpID0+IHtcbiAgICBsZXQgc2VydmVyQXBwO1xuICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgc2VydmVyQXBwID0ge1xuICAgICAgICBwbGF0Zm9ybTogJ3NlcnZlcicsXG4gICAgICAgIHJvb3Q6ICdzcmMnLFxuICAgICAgICBvdXREaXI6ICdkaXN0L3NlcnZlcicsXG4gICAgICAgIGFzc2V0czogW1xuICAgICAgICAgICdhc3NldHMnLFxuICAgICAgICAgICdmYXZpY29uLmljbycsXG4gICAgICAgIF0sXG4gICAgICAgIGluZGV4OiAnaW5kZXguaHRtbCcsXG4gICAgICAgIG1haW46ICdtYWluLnNlcnZlci50cycsXG4gICAgICAgIHRlc3Q6ICd0ZXN0LnRzJyxcbiAgICAgICAgdHNjb25maWc6ICd0c2NvbmZpZy5zZXJ2ZXIuanNvbicsXG4gICAgICAgIHRlc3RUc2NvbmZpZzogJ3RzY29uZmlnLnNwZWMuanNvbicsXG4gICAgICAgIHByZWZpeDogJ2FwcCcsXG4gICAgICAgIHN0eWxlczogW1xuICAgICAgICAgICdzdHlsZXMuY3NzJyxcbiAgICAgICAgXSxcbiAgICAgICAgc2NyaXB0czogW10sXG4gICAgICAgIGVudmlyb25tZW50U291cmNlOiAnZW52aXJvbm1lbnRzL2Vudmlyb25tZW50LnRzJyxcbiAgICAgICAgZW52aXJvbm1lbnRzOiB7XG4gICAgICAgICAgZGV2OiAnZW52aXJvbm1lbnRzL2Vudmlyb25tZW50LnRzJyxcbiAgICAgICAgICBwcm9kOiAnZW52aXJvbm1lbnRzL2Vudmlyb25tZW50LnByb2QudHMnLFxuICAgICAgICB9LFxuICAgICAgfTtcbiAgICAgIGJhc2VDb25maWcuYXBwcy5wdXNoKHNlcnZlckFwcCk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIG5vdCBjcmVhdGUgYSBzZXBhcmF0ZSBhcHAgZm9yIHNlcnZlciBhcHBzJywgKCkgPT4ge1xuICAgICAgdHJlZS5jcmVhdGUob2xkQ29uZmlnUGF0aCwgSlNPTi5zdHJpbmdpZnkoYmFzZUNvbmZpZywgbnVsbCwgMikpO1xuICAgICAgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ21pZ3JhdGlvbi0wMScsIGRlZmF1bHRPcHRpb25zLCB0cmVlKTtcbiAgICAgIGNvbnN0IGNvbmZpZyA9IGdldENvbmZpZyh0cmVlKTtcbiAgICAgIGNvbnN0IGFwcENvdW50ID0gT2JqZWN0LmtleXMoY29uZmlnLnByb2plY3RzKS5sZW5ndGg7XG4gICAgICBleHBlY3QoYXBwQ291bnQpLnRvRXF1YWwoMik7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIGNyZWF0ZSBhIHNlcnZlciB0YXJnZXQnLCAoKSA9PiB7XG4gICAgICB0cmVlLmNyZWF0ZShvbGRDb25maWdQYXRoLCBKU09OLnN0cmluZ2lmeShiYXNlQ29uZmlnLCBudWxsLCAyKSk7XG4gICAgICB0cmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnbWlncmF0aW9uLTAxJywgZGVmYXVsdE9wdGlvbnMsIHRyZWUpO1xuICAgICAgY29uc3QgY29uZmlnID0gZ2V0Q29uZmlnKHRyZWUpO1xuICAgICAgY29uc3QgdGFyZ2V0ID0gY29uZmlnLnByb2plY3RzLmZvby5hcmNoaXRlY3Quc2VydmVyO1xuICAgICAgZXhwZWN0KHRhcmdldCkudG9CZURlZmluZWQoKTtcbiAgICAgIGV4cGVjdCh0YXJnZXQuYnVpbGRlcikudG9FcXVhbCgnQGFuZ3VsYXItZGV2a2l0L2J1aWxkLWFuZ3VsYXI6c2VydmVyJyk7XG4gICAgICBleHBlY3QodGFyZ2V0Lm9wdGlvbnMub3V0cHV0UGF0aCkudG9FcXVhbCgnZGlzdC9zZXJ2ZXInKTtcbiAgICAgIGV4cGVjdCh0YXJnZXQub3B0aW9ucy5tYWluKS50b0VxdWFsKCdtYWluLnNlcnZlci50cycpO1xuICAgICAgZXhwZWN0KHRhcmdldC5vcHRpb25zLnRzQ29uZmlnKS50b0VxdWFsKCd0c2NvbmZpZy5zZXJ2ZXIuanNvbicpO1xuICAgIH0pO1xuICB9KTtcbn0pO1xuIl19