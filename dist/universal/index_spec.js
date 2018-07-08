"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const testing_1 = require("@angular-devkit/schematics/testing");
const path = require("path");
describe('Universal Schematic', () => {
    const schematicRunner = new testing_1.SchematicTestRunner('@schematics/angular', path.join(__dirname, '../collection.json'));
    const defaultOptions = {
        clientProject: 'bar',
    };
    const workspaceUniversalOptions = {
        clientProject: 'workspace',
    };
    const workspaceOptions = {
        name: 'workspace',
        newProjectRoot: 'projects',
        version: '6.0.0',
    };
    const appOptions = {
        name: 'bar',
        inlineStyle: false,
        inlineTemplate: false,
        routing: false,
        style: 'css',
        skipTests: false,
        skipPackageJson: false,
    };
    const initialWorkspaceAppOptions = {
        name: 'workspace',
        projectRoot: '',
        inlineStyle: false,
        inlineTemplate: false,
        routing: false,
        style: 'css',
        skipTests: false,
        skipPackageJson: false,
    };
    let appTree;
    beforeEach(() => {
        appTree = schematicRunner.runSchematic('workspace', workspaceOptions);
        appTree = schematicRunner.runSchematic('application', initialWorkspaceAppOptions, appTree);
        appTree = schematicRunner.runSchematic('application', appOptions, appTree);
    });
    it('should create a root module file', () => {
        const tree = schematicRunner.runSchematic('universal', defaultOptions, appTree);
        const filePath = '/projects/bar/src/app/app.server.module.ts';
        expect(tree.exists(filePath)).toEqual(true);
    });
    it('should create a main file', () => {
        const tree = schematicRunner.runSchematic('universal', defaultOptions, appTree);
        const filePath = '/projects/bar/src/main.server.ts';
        expect(tree.exists(filePath)).toEqual(true);
        const contents = tree.readContent(filePath);
        expect(contents).toMatch(/export { AppServerModule } from '\.\/app\/app\.server\.module'/);
    });
    it('should create a tsconfig file for the workspace project', () => {
        const tree = schematicRunner.runSchematic('universal', workspaceUniversalOptions, appTree);
        const filePath = '/src/tsconfig.server.json';
        expect(tree.exists(filePath)).toEqual(true);
        const contents = tree.readContent(filePath);
        expect(JSON.parse(contents)).toEqual({
            extends: './tsconfig.app.json',
            compilerOptions: {
                outDir: '../out-tsc/app-server',
                baseUrl: '.',
                module: 'commonjs',
            },
            angularCompilerOptions: {
                entryModule: 'app/app.server.module#AppServerModule',
            },
        });
        const angularConfig = JSON.parse(tree.readContent('angular.json'));
        expect(angularConfig.projects.workspace.architect.server.options.tsConfig)
            .toEqual('src/tsconfig.server.json');
    });
    it('should create a tsconfig file for a generated application', () => {
        const tree = schematicRunner.runSchematic('universal', defaultOptions, appTree);
        const filePath = '/projects/bar/tsconfig.server.json';
        expect(tree.exists(filePath)).toEqual(true);
        const contents = tree.readContent(filePath);
        expect(JSON.parse(contents)).toEqual({
            extends: './tsconfig.app.json',
            compilerOptions: {
                outDir: '../../out-tsc/app-server',
                baseUrl: '.',
                module: 'commonjs',
            },
            angularCompilerOptions: {
                entryModule: 'src/app/app.server.module#AppServerModule',
            },
        });
        const angularConfig = JSON.parse(tree.readContent('angular.json'));
        expect(angularConfig.projects.bar.architect.server.options.tsConfig)
            .toEqual('projects/bar/tsconfig.server.json');
    });
    it('should add dependency: @angular/platform-server', () => {
        const tree = schematicRunner.runSchematic('universal', defaultOptions, appTree);
        const filePath = '/package.json';
        const contents = tree.readContent(filePath);
        expect(contents).toMatch(/\"@angular\/platform-server\": \"/);
    });
    it('should update workspace with a server target', () => {
        const tree = schematicRunner.runSchematic('universal', defaultOptions, appTree);
        const filePath = '/angular.json';
        const contents = tree.readContent(filePath);
        const config = JSON.parse(contents.toString());
        const arch = config.projects.bar.architect;
        expect(arch.server).toBeDefined();
        expect(arch.server.builder).toBeDefined();
        const opts = arch.server.options;
        expect(opts.outputPath).toEqual('dist/bar-server');
        expect(opts.main).toEqual('projects/bar/src/main.server.ts');
        expect(opts.tsConfig).toEqual('projects/bar/tsconfig.server.json');
    });
    it('should add a server transition to BrowerModule import', () => {
        const tree = schematicRunner.runSchematic('universal', defaultOptions, appTree);
        const filePath = '/projects/bar/src/app/app.module.ts';
        const contents = tree.readContent(filePath);
        expect(contents).toMatch(/BrowserModule\.withServerTransition\({ appId: 'serverApp' }\)/);
    });
    it('should wrap the bootstrap call in a DOMContentLoaded event handler', () => {
        const tree = schematicRunner.runSchematic('universal', defaultOptions, appTree);
        const filePath = '/projects/bar/src/main.ts';
        const contents = tree.readContent(filePath);
        expect(contents).toMatch(/document.addEventListener\('DOMContentLoaded', \(\) => {/);
    });
    it('should install npm dependencies', () => {
        schematicRunner.runSchematic('universal', defaultOptions, appTree);
        expect(schematicRunner.tasks.length).toBe(1);
        expect(schematicRunner.tasks[0].name).toBe('node-package');
        expect(schematicRunner.tasks[0].options.command).toBe('install');
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXhfc3BlYy5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvYm9iby9Xb3JrL3NoYXJrLXNjaGVtYXRpY3Mvc3JjLyIsInNvdXJjZXMiOlsic3JjL3VuaXZlcnNhbC9pbmRleF9zcGVjLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7OztHQU1HO0FBQ0gsZ0VBQXVGO0FBQ3ZGLDZCQUE2QjtBQUs3QixRQUFRLENBQUMscUJBQXFCLEVBQUUsR0FBRyxFQUFFO0lBQ25DLE1BQU0sZUFBZSxHQUFHLElBQUksNkJBQW1CLENBQzdDLHFCQUFxQixFQUNyQixJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxvQkFBb0IsQ0FBQyxDQUMzQyxDQUFDO0lBQ0YsTUFBTSxjQUFjLEdBQXFCO1FBQ3ZDLGFBQWEsRUFBRSxLQUFLO0tBQ3JCLENBQUM7SUFDRixNQUFNLHlCQUF5QixHQUFxQjtRQUNsRCxhQUFhLEVBQUUsV0FBVztLQUMzQixDQUFDO0lBRUYsTUFBTSxnQkFBZ0IsR0FBcUI7UUFDekMsSUFBSSxFQUFFLFdBQVc7UUFDakIsY0FBYyxFQUFFLFVBQVU7UUFDMUIsT0FBTyxFQUFFLE9BQU87S0FDakIsQ0FBQztJQUVGLE1BQU0sVUFBVSxHQUF1QjtRQUNyQyxJQUFJLEVBQUUsS0FBSztRQUNYLFdBQVcsRUFBRSxLQUFLO1FBQ2xCLGNBQWMsRUFBRSxLQUFLO1FBQ3JCLE9BQU8sRUFBRSxLQUFLO1FBQ2QsS0FBSyxFQUFFLEtBQUs7UUFDWixTQUFTLEVBQUUsS0FBSztRQUNoQixlQUFlLEVBQUUsS0FBSztLQUN2QixDQUFDO0lBRUYsTUFBTSwwQkFBMEIsR0FBdUI7UUFDckQsSUFBSSxFQUFFLFdBQVc7UUFDakIsV0FBVyxFQUFFLEVBQUU7UUFDZixXQUFXLEVBQUUsS0FBSztRQUNsQixjQUFjLEVBQUUsS0FBSztRQUNyQixPQUFPLEVBQUUsS0FBSztRQUNkLEtBQUssRUFBRSxLQUFLO1FBQ1osU0FBUyxFQUFFLEtBQUs7UUFDaEIsZUFBZSxF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O1FBQzVDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxPQUFPLENBQUMsK0RBQStELENBQUMsQ0FBQztJQUM1RixDQUFDLENBQUMsQ0FBQztJQUVILEVBQUUsQ0FBQyxvRUFBb0UsRUFBRSxHQUFHLEVBQUU7UUFDNUUsTUFBTSxJQUFJLEdBQUcsZUFBZSxDQUFDLFlBQVksQ0FBQyxXQUFXLEVBQUUsY0FBYyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ2hGLE1BQU0sUUFBUSxHQUFHLDJCQUEyQixDQUFDO1FBQzdDLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDNUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLE9BQU8sQ0FBQywwREFBMEQsQ0FBQyxDQUFDO0lBQ3ZGLENBQUMsQ0FBQyxDQUFDO0lBRUgsRUFBRSxDQUFDLGlDQUFpQyxFQUFFLEdBQUcsRUFBRTtRQUN6QyxlQUFlLENBQUMsWUFBWSxDQUFDLFdBQVcsRUFBRSxjQUFjLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDbkUsTUFBTSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzdDLE1BQU0sQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUMzRCxNQUFNLENBQUUsZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUE2QixDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUMxRixDQUFDLENBQUMsQ0FBQztBQUNMLENBQUMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHsgU2NoZW1hdGljVGVzdFJ1bm5lciwgVW5pdFRlc3RUcmVlIH0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L3NjaGVtYXRpY3MvdGVzdGluZyc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgU2NoZW1hIGFzIEFwcGxpY2F0aW9uT3B0aW9ucyB9IGZyb20gJy4uL2FwcGxpY2F0aW9uL3NjaGVtYSc7XG5pbXBvcnQgeyBTY2hlbWEgYXMgV29ya3NwYWNlT3B0aW9ucyB9IGZyb20gJy4uL3dvcmtzcGFjZS9zY2hlbWEnO1xuaW1wb3J0IHsgU2NoZW1hIGFzIFVuaXZlcnNhbE9wdGlvbnMgfSBmcm9tICcuL3NjaGVtYSc7XG5cbmRlc2NyaWJlKCdVbml2ZXJzYWwgU2NoZW1hdGljJywgKCkgPT4ge1xuICBjb25zdCBzY2hlbWF0aWNSdW5uZXIgPSBuZXcgU2NoZW1hdGljVGVzdFJ1bm5lcihcbiAgICAnQHNjaGVtYXRpY3MvYW5ndWxhcicsXG4gICAgcGF0aC5qb2luKF9fZGlybmFtZSwgJy4uL2NvbGxlY3Rpb24uanNvbicpLFxuICApO1xuICBjb25zdCBkZWZhdWx0T3B0aW9uczogVW5pdmVyc2FsT3B0aW9ucyA9IHtcbiAgICBjbGllbnRQcm9qZWN0OiAnYmFyJyxcbiAgfTtcbiAgY29uc3Qgd29ya3NwYWNlVW5pdmVyc2FsT3B0aW9uczogVW5pdmVyc2FsT3B0aW9ucyA9IHtcbiAgICBjbGllbnRQcm9qZWN0OiAnd29ya3NwYWNlJyxcbiAgfTtcblxuICBjb25zdCB3b3Jrc3BhY2VPcHRpb25zOiBXb3Jrc3BhY2VPcHRpb25zID0ge1xuICAgIG5hbWU6ICd3b3Jrc3BhY2UnLFxuICAgIG5ld1Byb2plY3RSb290OiAncHJvamVjdHMnLFxuICAgIHZlcnNpb246ICc2LjAuMCcsXG4gIH07XG5cbiAgY29uc3QgYXBwT3B0aW9uczogQXBwbGljYXRpb25PcHRpb25zID0ge1xuICAgIG5hbWU6ICdiYXInLFxuICAgIGlubGluZVN0eWxlOiBmYWxzZSxcbiAgICBpbmxpbmVUZW1wbGF0ZTogZmFsc2UsXG4gICAgcm91dGluZzogZmFsc2UsXG4gICAgc3R5bGU6ICdjc3MnLFxuICAgIHNraXBUZXN0czogZmFsc2UsXG4gICAgc2tpcFBhY2thZ2VKc29uOiBmYWxzZSxcbiAgfTtcblxuICBjb25zdCBpbml0aWFsV29ya3NwYWNlQXBwT3B0aW9uczogQXBwbGljYXRpb25PcHRpb25zID0ge1xuICAgIG5hbWU6ICd3b3Jrc3BhY2UnLFxuICAgIHByb2plY3RSb290OiAnJyxcbiAgICBpbmxpbmVTdHlsZTogZmFsc2UsXG4gICAgaW5saW5lVGVtcGxhdGU6IGZhbHNlLFxuICAgIHJvdXRpbmc6IGZhbHNlLFxuICAgIHN0eWxlOiAnY3NzJyxcbiAgICBza2lwVGVzdHM6IGZhbHNlLFxuICAgIHNraXBQYWNrYWdlSnNvbjogZmFsc2UsXG4gIH07XG5cbiAgbGV0IGFwcFRyZWU6IFVuaXRUZXN0VHJlZTtcblxuICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICBhcHBUcmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnd29ya3NwYWNlJywgd29ya3NwYWNlT3B0aW9ucyk7XG4gICAgYXBwVHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ2FwcGxpY2F0aW9uJywgaW5pdGlhbFdvcmtzcGFjZUFwcE9wdGlvbnMsIGFwcFRyZWUpO1xuICAgIGFwcFRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdhcHBsaWNhdGlvbicsIGFwcE9wdGlvbnMsIGFwcFRyZWUpO1xuICB9KTtcblxuICBpdCgnc2hvdWxkIGNyZWF0ZSBhIHJvb3QgbW9kdWxlIGZpbGUnLCAoKSA9PiB7XG4gICAgY29uc3QgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ3VuaXZlcnNhbCcsIGRlZmF1bHRPcHRpb25zLCBhcHBUcmVlKTtcbiAgICBjb25zdCBmaWxlUGF0aCA9ICcvcHJvamVjdHMvYmFyL3NyYy9hcHAvYXBwLnNlcnZlci5tb2R1bGUudHMnO1xuICAgIGV4cGVjdCh0cmVlLmV4aXN0cyhmaWxlUGF0aCkpLnRvRXF1YWwodHJ1ZSk7XG4gIH0pO1xuXG4gIGl0KCdzaG91bGQgY3JlYXRlIGEgbWFpbiBmaWxlJywgKCkgPT4ge1xuICAgIGNvbnN0IHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCd1bml2ZXJzYWwnLCBkZWZhdWx0T3B0aW9ucywgYXBwVHJlZSk7XG4gICAgY29uc3QgZmlsZVBhdGggPSAnL3Byb2plY3RzL2Jhci9zcmMvbWFpbi5zZXJ2ZXIudHMnO1xuICAgIGV4cGVjdCh0cmVlLmV4aXN0cyhmaWxlUGF0aCkpLnRvRXF1YWwodHJ1ZSk7XG4gICAgY29uc3QgY29udGVudHMgPSB0cmVlLnJlYWRDb250ZW50KGZpbGVQYXRoKTtcbiAgICBleHBlY3QoY29udGVudHMpLnRvTWF0Y2goL2V4cG9ydCB7IEFwcFNlcnZlck1vZHVsZSB9IGZyb20gJ1xcLlxcL2FwcFxcL2FwcFxcLnNlcnZlclxcLm1vZHVsZScvKTtcbiAgfSk7XG5cbiAgaXQoJ3Nob3VsZCBjcmVhdGUgYSB0c2NvbmZpZyBmaWxlIGZvciB0aGUgd29ya3NwYWNlIHByb2plY3QnLCAoKSA9PiB7XG4gICAgY29uc3QgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ3VuaXZlcnNhbCcsIHdvcmtzcGFjZVVuaXZlcnNhbE9wdGlvbnMsIGFwcFRyZWUpO1xuICAgIGNvbnN0IGZpbGVQYXRoID0gJy9zcmMvdHNjb25maWcuc2VydmVyLmpzb24nO1xuICAgIGV4cGVjdCh0cmVlLmV4aXN0cyhmaWxlUGF0aCkpLnRvRXF1YWwodHJ1ZSk7XG4gICAgY29uc3QgY29udGVudHMgPSB0cmVlLnJlYWRDb250ZW50KGZpbGVQYXRoKTtcbiAgICBleHBlY3QoSlNPTi5wYXJzZShjb250ZW50cykpLnRvRXF1YWwoe1xuICAgICAgZXh0ZW5kczogJy4vdHNjb25maWcuYXBwLmpzb24nLFxuICAgICAgY29tcGlsZXJPcHRpb25zOiB7XG4gICAgICAgIG91dERpcjogJy4uL291dC10c2MvYXBwLXNlcnZlcicsXG4gICAgICAgIGJhc2VVcmw6ICcuJyxcbiAgICAgICAgbW9kdWxlOiAnY29tbW9uanMnLFxuICAgICAgfSxcbiAgICAgIGFuZ3VsYXJDb21waWxlck9wdGlvbnM6IHtcbiAgICAgICAgZW50cnlNb2R1bGU6ICdhcHAvYXBwLnNlcnZlci5tb2R1bGUjQXBwU2VydmVyTW9kdWxlJyxcbiAgICAgIH0sXG4gICAgfSk7XG4gICAgY29uc3QgYW5ndWxhckNvbmZpZyA9IEpTT04ucGFyc2UodHJlZS5yZWFkQ29udGVudCgnYW5ndWxhci5qc29uJykpO1xuICAgIGV4cGVjdChhbmd1bGFyQ29uZmlnLnByb2plY3RzLndvcmtzcGFjZS5hcmNoaXRlY3Quc2VydmVyLm9wdGlvbnMudHNDb25maWcpXG4gICAgICAudG9FcXVhbCgnc3JjL3RzY29uZmlnLnNlcnZlci5qc29uJyk7XG4gIH0pO1xuXG4gIGl0KCdzaG91bGQgY3JlYXRlIGEgdHNjb25maWcgZmlsZSBmb3IgYSBnZW5lcmF0ZWQgYXBwbGljYXRpb24nLCAoKSA9PiB7XG4gICAgY29uc3QgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ3VuaXZlcnNhbCcsIGRlZmF1bHRPcHRpb25zLCBhcHBUcmVlKTtcbiAgICBjb25zdCBmaWxlUGF0aCA9ICcvcHJvamVjdHMvYmFyL3RzY29uZmlnLnNlcnZlci5qc29uJztcbiAgICBleHBlY3QodHJlZS5leGlzdHMoZmlsZVBhdGgpKS50b0VxdWFsKHRydWUpO1xuICAgIGNvbnN0IGNvbnRlbnRzID0gdHJlZS5yZWFkQ29udGVudChmaWxlUGF0aCk7XG4gICAgZXhwZWN0KEpTT04ucGFyc2UoY29udGVudHMpKS50b0VxdWFsKHtcbiAgICAgIGV4dGVuZHM6ICcuL3RzY29uZmlnLmFwcC5qc29uJyxcbiAgICAgIGNvbXBpbGVyT3B0aW9uczoge1xuICAgICAgICBvdXREaXI6ICcuLi8uLi9vdXQtdHNjL2FwcC1zZXJ2ZXInLFxuICAgICAgICBiYXNlVXJsOiAnLicsXG4gICAgICAgIG1vZHVsZTogJ2NvbW1vbmpzJyxcbiAgICAgIH0sXG4gICAgICBhbmd1bGFyQ29tcGlsZXJPcHRpb25zOiB7XG4gICAgICAgIGVudHJ5TW9kdWxlOiAnc3JjL2FwcC9hcHAuc2VydmVyLm1vZHVsZSNBcHBTZXJ2ZXJNb2R1bGUnLFxuICAgICAgfSxcbiAgICB9KTtcbiAgICBjb25zdCBhbmd1bGFyQ29uZmlnID0gSlNPTi5wYXJzZSh0cmVlLnJlYWRDb250ZW50KCdhbmd1bGFyLmpzb24nKSk7XG4gICAgZXhwZWN0KGFuZ3VsYXJDb25maWcucHJvamVjdHMuYmFyLmFyY2hpdGVjdC5zZXJ2ZXIub3B0aW9ucy50c0NvbmZpZylcbiAgICAgIC50b0VxdWFsKCdwcm9qZWN0cy9iYXIvdHNjb25maWcuc2VydmVyLmpzb24nKTtcbiAgfSk7XG5cbiAgaXQoJ3Nob3VsZCBhZGQgZGVwZW5kZW5jeTogQGFuZ3VsYXIvcGxhdGZvcm0tc2VydmVyJywgKCkgPT4ge1xuICAgIGNvbnN0IHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCd1bml2ZXJzYWwnLCBkZWZhdWx0T3B0aW9ucywgYXBwVHJlZSk7XG4gICAgY29uc3QgZmlsZVBhdGggPSAnL3BhY2thZ2UuanNvbic7XG4gICAgY29uc3QgY29udGVudHMgPSB0cmVlLnJlYWRDb250ZW50KGZpbGVQYXRoKTtcbiAgICBleHBlY3QoY29udGVudHMpLnRvTWF0Y2goL1xcXCJAYW5ndWxhclxcL3BsYXRmb3JtLXNlcnZlclxcXCI6IFxcXCIvKTtcbiAgfSk7XG5cbiAgaXQoJ3Nob3VsZCB1cGRhdGUgd29ya3NwYWNlIHdpdGggYSBzZXJ2ZXIgdGFyZ2V0JywgKCkgPT4ge1xuICAgIGNvbnN0IHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCd1bml2ZXJzYWwnLCBkZWZhdWx0T3B0aW9ucywgYXBwVHJlZSk7XG4gICAgY29uc3QgZmlsZVBhdGggPSAnL2FuZ3VsYXIuanNvbic7XG4gICAgY29uc3QgY29udGVudHMgPSB0cmVlLnJlYWRDb250ZW50KGZpbGVQYXRoKTtcbiAgICBjb25zdCBjb25maWcgPSBKU09OLnBhcnNlKGNvbnRlbnRzLnRvU3RyaW5nKCkpO1xuICAgIGNvbnN0IGFyY2ggPSBjb25maWcucHJvamVjdHMuYmFyLmFyY2hpdGVjdDtcbiAgICBleHBlY3QoYXJjaC5zZXJ2ZXIpLnRvQmVEZWZpbmVkKCk7XG4gICAgZXhwZWN0KGFyY2guc2VydmVyLmJ1aWxkZXIpLnRvQmVEZWZpbmVkKCk7XG4gICAgY29uc3Qgb3B0cyA9IGFyY2guc2VydmVyLm9wdGlvbnM7XG4gICAgZXhwZWN0KG9wdHMub3V0cHV0UGF0aCkudG9FcXVhbCgnZGlzdC9iYXItc2VydmVyJyk7XG4gICAgZXhwZWN0KG9wdHMubWFpbikudG9FcXVhbCgncHJvamVjdHMvYmFyL3NyYy9tYWluLnNlcnZlci50cycpO1xuICAgIGV4cGVjdChvcHRzLnRzQ29uZmlnKS50b0VxdWFsKCdwcm9qZWN0cy9iYXIvdHNjb25maWcuc2VydmVyLmpzb24nKTtcbiAgfSk7XG5cbiAgaXQoJ3Nob3VsZCBhZGQgYSBzZXJ2ZXIgdHJhbnNpdGlvbiB0byBCcm93ZXJNb2R1bGUgaW1wb3J0JywgKCkgPT4ge1xuICAgIGNvbnN0IHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCd1bml2ZXJzYWwnLCBkZWZhdWx0T3B0aW9ucywgYXBwVHJlZSk7XG4gICAgY29uc3QgZmlsZVBhdGggPSAnL3Byb2plY3RzL2Jhci9zcmMvYXBwL2FwcC5tb2R1bGUudHMnO1xuICAgIGNvbnN0IGNvbnRlbnRzID0gdHJlZS5yZWFkQ29udGVudChmaWxlUGF0aCk7XG4gICAgZXhwZWN0KGNvbnRlbnRzKS50b01hdGNoKC9Ccm93c2VyTW9kdWxlXFwud2l0aFNlcnZlclRyYW5zaXRpb25cXCh7IGFwcElkOiAnc2VydmVyQXBwJyB9XFwpLyk7XG4gIH0pO1xuXG4gIGl0KCdzaG91bGQgd3JhcCB0aGUgYm9vdHN0cmFwIGNhbGwgaW4gYSBET01Db250ZW50TG9hZGVkIGV2ZW50IGhhbmRsZXInLCAoKSA9PiB7XG4gICAgY29uc3QgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ3VuaXZlcnNhbCcsIGRlZmF1bHRPcHRpb25zLCBhcHBUcmVlKTtcbiAgICBjb25zdCBmaWxlUGF0aCA9ICcvcHJvamVjdHMvYmFyL3NyYy9tYWluLnRzJztcbiAgICBjb25zdCBjb250ZW50cyA9IHRyZWUucmVhZENvbnRlbnQoZmlsZVBhdGgpO1xuICAgIGV4cGVjdChjb250ZW50cykudG9NYXRjaCgvZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lclxcKCdET01Db250ZW50TG9hZGVkJywgXFwoXFwpID0+IHsvKTtcbiAgfSk7XG5cbiAgaXQoJ3Nob3VsZCBpbnN0YWxsIG5wbSBkZXBlbmRlbmNpZXMnLCAoKSA9PiB7XG4gICAgc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygndW5pdmVyc2FsJywgZGVmYXVsdE9wdGlvbnMsIGFwcFRyZWUpO1xuICAgIGV4cGVjdChzY2hlbWF0aWNSdW5uZXIudGFza3MubGVuZ3RoKS50b0JlKDEpO1xuICAgIGV4cGVjdChzY2hlbWF0aWNSdW5uZXIudGFza3NbMF0ubmFtZSkudG9CZSgnbm9kZS1wYWNrYWdlJyk7XG4gICAgZXhwZWN0KChzY2hlbWF0aWNSdW5uZXIudGFza3NbMF0ub3B0aW9ucyBhcyB7Y29tbWFuZDogc3RyaW5nfSkuY29tbWFuZCkudG9CZSgnaW5zdGFsbCcpO1xuICB9KTtcbn0pO1xuIl19