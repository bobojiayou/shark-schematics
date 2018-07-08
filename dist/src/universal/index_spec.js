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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXhfc3BlYy5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvYm9iby9Xb3JrL2dpdGh1Yi9zaGFyay1zY2hlbWF0aWNzL3NyYy8iLCJzb3VyY2VzIjpbInNyYy91bml2ZXJzYWwvaW5kZXhfc3BlYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7R0FNRztBQUNILGdFQUF1RjtBQUN2Riw2QkFBNkI7QUFLN0IsUUFBUSxDQUFDLHFCQUFxQixFQUFFLEdBQUcsRUFBRTtJQUNuQyxNQUFNLGVBQWUsR0FBRyxJQUFJLDZCQUFtQixDQUM3QyxxQkFBcUIsRUFDckIsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsb0JBQW9CLENBQUMsQ0FDM0MsQ0FBQztJQUNGLE1BQU0sY0FBYyxHQUFxQjtRQUN2QyxhQUFhLEVBQUUsS0FBSztLQUNyQixDQUFDO0lBQ0YsTUFBTSx5QkFBeUIsR0FBcUI7UUFDbEQsYUFBYSxFQUFFLFdBQVc7S0FDM0IsQ0FBQztJQUVGLE1BQU0sZ0JBQWdCLEdBQXFCO1FBQ3pDLElBQUksRUFBRSxXQUFXO1FBQ2pCLGNBQWMsRUFBRSxVQUFVO1FBQzFCLE9BQU8sRUFBRSxPQUFPO0tBQ2pCLENBQUM7SUFFRixNQUFNLFVBQVUsR0FBdUI7UUFDckMsSUFBSSxFQUFFLEtBQUs7UUFDWCxXQUFXLEVBQUUsS0FBSztRQUNsQixjQUFjLEVBQUUsS0FBSztRQUNyQixPQUFPLEVBQUUsS0FBSztRQUNkLEtBQUssRUFBRSxLQUFLO1FBQ1osU0FBUyxFQUFFLEtBQUs7UUFDaEIsZUFBZSxFQUFFLEtBQUs7S0FDdkIsQ0FBQztJQUVGLE1BQU0sMEJBQTBCLEdBQXVCO1FBQ3JELElBQUksRUFBRSxXQUFXO1FBQ2pCLFdBQVcsRUFBRSxFQUFFO1FBQ2YsV0FBVyxFQUFFLEtBQUs7UUFDbEIsY0FBYyxFQUFFLEtBQUs7UUFDckIsT0FBTyxFQUFFLEtBQUs7UUFDZCxLQUFLLEVBQUUsS0FBSztRQUNaLFNBQVMsRUFBRSxLQUFLO1FBQ2hC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QUMsQ0FBQztRQUM1QyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsT0FBTyxDQUFDLCtEQUErRCxDQUFDLENBQUM7SUFDNUYsQ0FBQyxDQUFDLENBQUM7SUFFSCxFQUFFLENBQUMsb0VBQW9FLEVBQUUsR0FBRyxFQUFFO1FBQzVFLE1BQU0sSUFBSSxHQUFHLGVBQWUsQ0FBQyxZQUFZLENBQUMsV0FBVyxFQUFFLGNBQWMsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNoRixNQUFNLFFBQVEsR0FBRywyQkFBMkIsQ0FBQztRQUM3QyxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzVDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxPQUFPLENBQUMsMERBQTBELENBQUMsQ0FBQztJQUN2RixDQUFDLENBQUMsQ0FBQztJQUVILEVBQUUsQ0FBQyxpQ0FBaUMsRUFBRSxHQUFHLEVBQUU7UUFDekMsZUFBZSxDQUFDLFlBQVksQ0FBQyxXQUFXLEVBQUUsY0FBYyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ25FLE1BQU0sQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM3QyxNQUFNLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDM0QsTUFBTSxDQUFFLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBNkIsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDMUYsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7IFNjaGVtYXRpY1Rlc3RSdW5uZXIsIFVuaXRUZXN0VHJlZSB9IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9zY2hlbWF0aWNzL3Rlc3RpbmcnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IFNjaGVtYSBhcyBBcHBsaWNhdGlvbk9wdGlvbnMgfSBmcm9tICcuLi9hcHBsaWNhdGlvbi9zY2hlbWEnO1xuaW1wb3J0IHsgU2NoZW1hIGFzIFdvcmtzcGFjZU9wdGlvbnMgfSBmcm9tICcuLi93b3Jrc3BhY2Uvc2NoZW1hJztcbmltcG9ydCB7IFNjaGVtYSBhcyBVbml2ZXJzYWxPcHRpb25zIH0gZnJvbSAnLi9zY2hlbWEnO1xuXG5kZXNjcmliZSgnVW5pdmVyc2FsIFNjaGVtYXRpYycsICgpID0+IHtcbiAgY29uc3Qgc2NoZW1hdGljUnVubmVyID0gbmV3IFNjaGVtYXRpY1Rlc3RSdW5uZXIoXG4gICAgJ0BzY2hlbWF0aWNzL2FuZ3VsYXInLFxuICAgIHBhdGguam9pbihfX2Rpcm5hbWUsICcuLi9jb2xsZWN0aW9uLmpzb24nKSxcbiAgKTtcbiAgY29uc3QgZGVmYXVsdE9wdGlvbnM6IFVuaXZlcnNhbE9wdGlvbnMgPSB7XG4gICAgY2xpZW50UHJvamVjdDogJ2JhcicsXG4gIH07XG4gIGNvbnN0IHdvcmtzcGFjZVVuaXZlcnNhbE9wdGlvbnM6IFVuaXZlcnNhbE9wdGlvbnMgPSB7XG4gICAgY2xpZW50UHJvamVjdDogJ3dvcmtzcGFjZScsXG4gIH07XG5cbiAgY29uc3Qgd29ya3NwYWNlT3B0aW9uczogV29ya3NwYWNlT3B0aW9ucyA9IHtcbiAgICBuYW1lOiAnd29ya3NwYWNlJyxcbiAgICBuZXdQcm9qZWN0Um9vdDogJ3Byb2plY3RzJyxcbiAgICB2ZXJzaW9uOiAnNi4wLjAnLFxuICB9O1xuXG4gIGNvbnN0IGFwcE9wdGlvbnM6IEFwcGxpY2F0aW9uT3B0aW9ucyA9IHtcbiAgICBuYW1lOiAnYmFyJyxcbiAgICBpbmxpbmVTdHlsZTogZmFsc2UsXG4gICAgaW5saW5lVGVtcGxhdGU6IGZhbHNlLFxuICAgIHJvdXRpbmc6IGZhbHNlLFxuICAgIHN0eWxlOiAnY3NzJyxcbiAgICBza2lwVGVzdHM6IGZhbHNlLFxuICAgIHNraXBQYWNrYWdlSnNvbjogZmFsc2UsXG4gIH07XG5cbiAgY29uc3QgaW5pdGlhbFdvcmtzcGFjZUFwcE9wdGlvbnM6IEFwcGxpY2F0aW9uT3B0aW9ucyA9IHtcbiAgICBuYW1lOiAnd29ya3NwYWNlJyxcbiAgICBwcm9qZWN0Um9vdDogJycsXG4gICAgaW5saW5lU3R5bGU6IGZhbHNlLFxuICAgIGlubGluZVRlbXBsYXRlOiBmYWxzZSxcbiAgICByb3V0aW5nOiBmYWxzZSxcbiAgICBzdHlsZTogJ2NzcycsXG4gICAgc2tpcFRlc3RzOiBmYWxzZSxcbiAgICBza2lwUGFja2FnZUpzb246IGZhbHNlLFxuICB9O1xuXG4gIGxldCBhcHBUcmVlOiBVbml0VGVzdFRyZWU7XG5cbiAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgYXBwVHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ3dvcmtzcGFjZScsIHdvcmtzcGFjZU9wdGlvbnMpO1xuICAgIGFwcFRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdhcHBsaWNhdGlvbicsIGluaXRpYWxXb3Jrc3BhY2VBcHBPcHRpb25zLCBhcHBUcmVlKTtcbiAgICBhcHBUcmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnYXBwbGljYXRpb24nLCBhcHBPcHRpb25zLCBhcHBUcmVlKTtcbiAgfSk7XG5cbiAgaXQoJ3Nob3VsZCBjcmVhdGUgYSByb290IG1vZHVsZSBmaWxlJywgKCkgPT4ge1xuICAgIGNvbnN0IHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCd1bml2ZXJzYWwnLCBkZWZhdWx0T3B0aW9ucywgYXBwVHJlZSk7XG4gICAgY29uc3QgZmlsZVBhdGggPSAnL3Byb2plY3RzL2Jhci9zcmMvYXBwL2FwcC5zZXJ2ZXIubW9kdWxlLnRzJztcbiAgICBleHBlY3QodHJlZS5leGlzdHMoZmlsZVBhdGgpKS50b0VxdWFsKHRydWUpO1xuICB9KTtcblxuICBpdCgnc2hvdWxkIGNyZWF0ZSBhIG1haW4gZmlsZScsICgpID0+IHtcbiAgICBjb25zdCB0cmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygndW5pdmVyc2FsJywgZGVmYXVsdE9wdGlvbnMsIGFwcFRyZWUpO1xuICAgIGNvbnN0IGZpbGVQYXRoID0gJy9wcm9qZWN0cy9iYXIvc3JjL21haW4uc2VydmVyLnRzJztcbiAgICBleHBlY3QodHJlZS5leGlzdHMoZmlsZVBhdGgpKS50b0VxdWFsKHRydWUpO1xuICAgIGNvbnN0IGNvbnRlbnRzID0gdHJlZS5yZWFkQ29udGVudChmaWxlUGF0aCk7XG4gICAgZXhwZWN0KGNvbnRlbnRzKS50b01hdGNoKC9leHBvcnQgeyBBcHBTZXJ2ZXJNb2R1bGUgfSBmcm9tICdcXC5cXC9hcHBcXC9hcHBcXC5zZXJ2ZXJcXC5tb2R1bGUnLyk7XG4gIH0pO1xuXG4gIGl0KCdzaG91bGQgY3JlYXRlIGEgdHNjb25maWcgZmlsZSBmb3IgdGhlIHdvcmtzcGFjZSBwcm9qZWN0JywgKCkgPT4ge1xuICAgIGNvbnN0IHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCd1bml2ZXJzYWwnLCB3b3Jrc3BhY2VVbml2ZXJzYWxPcHRpb25zLCBhcHBUcmVlKTtcbiAgICBjb25zdCBmaWxlUGF0aCA9ICcvc3JjL3RzY29uZmlnLnNlcnZlci5qc29uJztcbiAgICBleHBlY3QodHJlZS5leGlzdHMoZmlsZVBhdGgpKS50b0VxdWFsKHRydWUpO1xuICAgIGNvbnN0IGNvbnRlbnRzID0gdHJlZS5yZWFkQ29udGVudChmaWxlUGF0aCk7XG4gICAgZXhwZWN0KEpTT04ucGFyc2UoY29udGVudHMpKS50b0VxdWFsKHtcbiAgICAgIGV4dGVuZHM6ICcuL3RzY29uZmlnLmFwcC5qc29uJyxcbiAgICAgIGNvbXBpbGVyT3B0aW9uczoge1xuICAgICAgICBvdXREaXI6ICcuLi9vdXQtdHNjL2FwcC1zZXJ2ZXInLFxuICAgICAgICBiYXNlVXJsOiAnLicsXG4gICAgICAgIG1vZHVsZTogJ2NvbW1vbmpzJyxcbiAgICAgIH0sXG4gICAgICBhbmd1bGFyQ29tcGlsZXJPcHRpb25zOiB7XG4gICAgICAgIGVudHJ5TW9kdWxlOiAnYXBwL2FwcC5zZXJ2ZXIubW9kdWxlI0FwcFNlcnZlck1vZHVsZScsXG4gICAgICB9LFxuICAgIH0pO1xuICAgIGNvbnN0IGFuZ3VsYXJDb25maWcgPSBKU09OLnBhcnNlKHRyZWUucmVhZENvbnRlbnQoJ2FuZ3VsYXIuanNvbicpKTtcbiAgICBleHBlY3QoYW5ndWxhckNvbmZpZy5wcm9qZWN0cy53b3Jrc3BhY2UuYXJjaGl0ZWN0LnNlcnZlci5vcHRpb25zLnRzQ29uZmlnKVxuICAgICAgLnRvRXF1YWwoJ3NyYy90c2NvbmZpZy5zZXJ2ZXIuanNvbicpO1xuICB9KTtcblxuICBpdCgnc2hvdWxkIGNyZWF0ZSBhIHRzY29uZmlnIGZpbGUgZm9yIGEgZ2VuZXJhdGVkIGFwcGxpY2F0aW9uJywgKCkgPT4ge1xuICAgIGNvbnN0IHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCd1bml2ZXJzYWwnLCBkZWZhdWx0T3B0aW9ucywgYXBwVHJlZSk7XG4gICAgY29uc3QgZmlsZVBhdGggPSAnL3Byb2plY3RzL2Jhci90c2NvbmZpZy5zZXJ2ZXIuanNvbic7XG4gICAgZXhwZWN0KHRyZWUuZXhpc3RzKGZpbGVQYXRoKSkudG9FcXVhbCh0cnVlKTtcbiAgICBjb25zdCBjb250ZW50cyA9IHRyZWUucmVhZENvbnRlbnQoZmlsZVBhdGgpO1xuICAgIGV4cGVjdChKU09OLnBhcnNlKGNvbnRlbnRzKSkudG9FcXVhbCh7XG4gICAgICBleHRlbmRzOiAnLi90c2NvbmZpZy5hcHAuanNvbicsXG4gICAgICBjb21waWxlck9wdGlvbnM6IHtcbiAgICAgICAgb3V0RGlyOiAnLi4vLi4vb3V0LXRzYy9hcHAtc2VydmVyJyxcbiAgICAgICAgYmFzZVVybDogJy4nLFxuICAgICAgICBtb2R1bGU6ICdjb21tb25qcycsXG4gICAgICB9LFxuICAgICAgYW5ndWxhckNvbXBpbGVyT3B0aW9uczoge1xuICAgICAgICBlbnRyeU1vZHVsZTogJ3NyYy9hcHAvYXBwLnNlcnZlci5tb2R1bGUjQXBwU2VydmVyTW9kdWxlJyxcbiAgICAgIH0sXG4gICAgfSk7XG4gICAgY29uc3QgYW5ndWxhckNvbmZpZyA9IEpTT04ucGFyc2UodHJlZS5yZWFkQ29udGVudCgnYW5ndWxhci5qc29uJykpO1xuICAgIGV4cGVjdChhbmd1bGFyQ29uZmlnLnByb2plY3RzLmJhci5hcmNoaXRlY3Quc2VydmVyLm9wdGlvbnMudHNDb25maWcpXG4gICAgICAudG9FcXVhbCgncHJvamVjdHMvYmFyL3RzY29uZmlnLnNlcnZlci5qc29uJyk7XG4gIH0pO1xuXG4gIGl0KCdzaG91bGQgYWRkIGRlcGVuZGVuY3k6IEBhbmd1bGFyL3BsYXRmb3JtLXNlcnZlcicsICgpID0+IHtcbiAgICBjb25zdCB0cmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygndW5pdmVyc2FsJywgZGVmYXVsdE9wdGlvbnMsIGFwcFRyZWUpO1xuICAgIGNvbnN0IGZpbGVQYXRoID0gJy9wYWNrYWdlLmpzb24nO1xuICAgIGNvbnN0IGNvbnRlbnRzID0gdHJlZS5yZWFkQ29udGVudChmaWxlUGF0aCk7XG4gICAgZXhwZWN0KGNvbnRlbnRzKS50b01hdGNoKC9cXFwiQGFuZ3VsYXJcXC9wbGF0Zm9ybS1zZXJ2ZXJcXFwiOiBcXFwiLyk7XG4gIH0pO1xuXG4gIGl0KCdzaG91bGQgdXBkYXRlIHdvcmtzcGFjZSB3aXRoIGEgc2VydmVyIHRhcmdldCcsICgpID0+IHtcbiAgICBjb25zdCB0cmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygndW5pdmVyc2FsJywgZGVmYXVsdE9wdGlvbnMsIGFwcFRyZWUpO1xuICAgIGNvbnN0IGZpbGVQYXRoID0gJy9hbmd1bGFyLmpzb24nO1xuICAgIGNvbnN0IGNvbnRlbnRzID0gdHJlZS5yZWFkQ29udGVudChmaWxlUGF0aCk7XG4gICAgY29uc3QgY29uZmlnID0gSlNPTi5wYXJzZShjb250ZW50cy50b1N0cmluZygpKTtcbiAgICBjb25zdCBhcmNoID0gY29uZmlnLnByb2plY3RzLmJhci5hcmNoaXRlY3Q7XG4gICAgZXhwZWN0KGFyY2guc2VydmVyKS50b0JlRGVmaW5lZCgpO1xuICAgIGV4cGVjdChhcmNoLnNlcnZlci5idWlsZGVyKS50b0JlRGVmaW5lZCgpO1xuICAgIGNvbnN0IG9wdHMgPSBhcmNoLnNlcnZlci5vcHRpb25zO1xuICAgIGV4cGVjdChvcHRzLm91dHB1dFBhdGgpLnRvRXF1YWwoJ2Rpc3QvYmFyLXNlcnZlcicpO1xuICAgIGV4cGVjdChvcHRzLm1haW4pLnRvRXF1YWwoJ3Byb2plY3RzL2Jhci9zcmMvbWFpbi5zZXJ2ZXIudHMnKTtcbiAgICBleHBlY3Qob3B0cy50c0NvbmZpZykudG9FcXVhbCgncHJvamVjdHMvYmFyL3RzY29uZmlnLnNlcnZlci5qc29uJyk7XG4gIH0pO1xuXG4gIGl0KCdzaG91bGQgYWRkIGEgc2VydmVyIHRyYW5zaXRpb24gdG8gQnJvd2VyTW9kdWxlIGltcG9ydCcsICgpID0+IHtcbiAgICBjb25zdCB0cmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygndW5pdmVyc2FsJywgZGVmYXVsdE9wdGlvbnMsIGFwcFRyZWUpO1xuICAgIGNvbnN0IGZpbGVQYXRoID0gJy9wcm9qZWN0cy9iYXIvc3JjL2FwcC9hcHAubW9kdWxlLnRzJztcbiAgICBjb25zdCBjb250ZW50cyA9IHRyZWUucmVhZENvbnRlbnQoZmlsZVBhdGgpO1xuICAgIGV4cGVjdChjb250ZW50cykudG9NYXRjaCgvQnJvd3Nlck1vZHVsZVxcLndpdGhTZXJ2ZXJUcmFuc2l0aW9uXFwoeyBhcHBJZDogJ3NlcnZlckFwcCcgfVxcKS8pO1xuICB9KTtcblxuICBpdCgnc2hvdWxkIHdyYXAgdGhlIGJvb3RzdHJhcCBjYWxsIGluIGEgRE9NQ29udGVudExvYWRlZCBldmVudCBoYW5kbGVyJywgKCkgPT4ge1xuICAgIGNvbnN0IHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCd1bml2ZXJzYWwnLCBkZWZhdWx0T3B0aW9ucywgYXBwVHJlZSk7XG4gICAgY29uc3QgZmlsZVBhdGggPSAnL3Byb2plY3RzL2Jhci9zcmMvbWFpbi50cyc7XG4gICAgY29uc3QgY29udGVudHMgPSB0cmVlLnJlYWRDb250ZW50KGZpbGVQYXRoKTtcbiAgICBleHBlY3QoY29udGVudHMpLnRvTWF0Y2goL2RvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXJcXCgnRE9NQ29udGVudExvYWRlZCcsIFxcKFxcKSA9PiB7Lyk7XG4gIH0pO1xuXG4gIGl0KCdzaG91bGQgaW5zdGFsbCBucG0gZGVwZW5kZW5jaWVzJywgKCkgPT4ge1xuICAgIHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ3VuaXZlcnNhbCcsIGRlZmF1bHRPcHRpb25zLCBhcHBUcmVlKTtcbiAgICBleHBlY3Qoc2NoZW1hdGljUnVubmVyLnRhc2tzLmxlbmd0aCkudG9CZSgxKTtcbiAgICBleHBlY3Qoc2NoZW1hdGljUnVubmVyLnRhc2tzWzBdLm5hbWUpLnRvQmUoJ25vZGUtcGFja2FnZScpO1xuICAgIGV4cGVjdCgoc2NoZW1hdGljUnVubmVyLnRhc2tzWzBdLm9wdGlvbnMgYXMge2NvbW1hbmQ6IHN0cmluZ30pLmNvbW1hbmQpLnRvQmUoJ2luc3RhbGwnKTtcbiAgfSk7XG59KTtcbiJdfQ==