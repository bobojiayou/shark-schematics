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
const test_1 = require("../utility/test");
// tslint:disable:max-line-length
describe('Component Schematic', () => {
    const schematicRunner = new testing_1.SchematicTestRunner('@schematics/angular', path.join(__dirname, '../collection.json'));
    const defaultOptions = {
        name: 'foo',
        // path: 'src/app',
        inlineStyle: false,
        inlineTemplate: false,
        changeDetection: 'Default',
        styleext: 'css',
        spec: true,
        module: undefined,
        export: false,
        project: 'bar',
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
    let appTree;
    beforeEach(() => {
        appTree = schematicRunner.runSchematic('workspace', workspaceOptions);
        appTree = schematicRunner.runSchematic('application', appOptions, appTree);
    });
    it('should create a component', () => {
        const options = Object.assign({}, defaultOptions);
        const tree = schematicRunner.runSchematic('component', options, appTree);
        const files = tree.files;
        expect(files.indexOf('/projects/bar/src/app/foo/foo.component.css')).toBeGreaterThanOrEqual(0);
        expect(files.indexOf('/projects/bar/src/app/foo/foo.component.html')).toBeGreaterThanOrEqual(0);
        expect(files.indexOf('/projects/bar/src/app/foo/foo.component.spec.ts')).toBeGreaterThanOrEqual(0);
        expect(files.indexOf('/projects/bar/src/app/foo/foo.component.ts')).toBeGreaterThanOrEqual(0);
        const moduleContent = tree.readContent('/projects/bar/src/app/app.module.ts');
        expect(moduleContent).toMatch(/import.*Foo.*from '.\/foo\/foo.component'/);
        expect(moduleContent).toMatch(/declarations:\s*\[[^\]]+?,\r?\n\s+FooComponent\r?\n/m);
    });
    it('should set change detection to OnPush', () => {
        const options = Object.assign({}, defaultOptions, { changeDetection: 'OnPush' });
        const tree = schematicRunner.runSchematic('component', options, appTree);
        const tsContent = tree.readContent('/projects/bar/src/app/foo/foo.component.ts');
        expect(tsContent).toMatch(/changeDetection: ChangeDetectionStrategy.OnPush/);
    });
    it('should not set view encapsulation', () => {
        const options = Object.assign({}, defaultOptions);
        const tree = schematicRunner.runSchematic('component', options, appTree);
        const tsContent = tree.readContent('/projects/bar/src/app/foo/foo.component.ts');
        expect(tsContent).not.toMatch(/encapsulation: ViewEncapsulation/);
    });
    it('should set view encapsulation to Emulated', () => {
        const options = Object.assign({}, defaultOptions, { viewEncapsulation: 'Emulated' });
        const tree = schematicRunner.runSchematic('component', options, appTree);
        const tsContent = tree.readContent('/projects/bar/src/app/foo/foo.component.ts');
        expect(tsContent).toMatch(/encapsulation: ViewEncapsulation.Emulated/);
    });
    it('should set view encapsulation to None', () => {
        const options = Object.assign({}, defaultOptions, { viewEncapsulation: 'None' });
        const tree = schematicRunner.runSchematic('component', options, appTree);
        const tsContent = tree.readContent('/projects/bar/src/app/foo/foo.component.ts');
        expect(tsContent).toMatch(/encapsulation: ViewEncapsulation.None/);
    });
    it('should create a flat component', () => {
        const options = Object.assign({}, defaultOptions, { flat: true });
        const tree = schematicRunner.runSchematic('component', options, appTree);
        const files = tree.files;
        expect(files.indexOf('/projects/bar/src/app/foo.component.css')).toBeGreaterThanOrEqual(0);
        expect(files.indexOf('/projects/bar/src/app/foo.component.html')).toBeGreaterThanOrEqual(0);
        expect(files.indexOf('/projects/bar/src/app/foo.component.spec.ts')).toBeGreaterThanOrEqual(0);
        expect(files.indexOf('/projects/bar/src/app/foo.component.ts')).toBeGreaterThanOrEqual(0);
    });
    it('should find the closest module', () => {
        const options = Object.assign({}, defaultOptions);
        const fooModule = '/projects/bar/src/app/foo/foo.module.ts';
        appTree.create(fooModule, `
      import { NgModule } from '@angular/core';

      @NgModule({
        imports: [],
        declarations: []
      })
      export class FooModule { }
    `);
        const tree = schematicRunner.runSchematic('component', options, appTree);
        const fooModuleContent = tree.readContent(fooModule);
        expect(fooModuleContent).toMatch(/import { FooComponent } from '.\/foo.component'/);
    });
    it('should export the component', () => {
        const options = Object.assign({}, defaultOptions, { export: true });
        const tree = schematicRunner.runSchematic('component', options, appTree);
        const appModuleContent = tree.readContent('/projects/bar/src/app/app.module.ts');
        expect(appModuleContent).toMatch(/exports: \[FooComponent\]/);
    });
    it('should set the entry component', () => {
        const options = Object.assign({}, defaultOptions, { entryComponent: true });
        const tree = schematicRunner.runSchematic('component', options, appTree);
        const appModuleContent = tree.readContent('/projects/bar/src/app/app.module.ts');
        expect(appModuleContent).toMatch(/entryComponents: \[FooComponent\]/);
    });
    it('should import into a specified module', () => {
        const options = Object.assign({}, defaultOptions, { module: 'app.module.ts' });
        const tree = schematicRunner.runSchematic('component', options, appTree);
        const appModule = tree.readContent('/projects/bar/src/app/app.module.ts');
        expect(appModule).toMatch(/import { FooComponent } from '.\/foo\/foo.component'/);
    });
    it('should fail if specified module does not exist', () => {
        const options = Object.assign({}, defaultOptions, { module: '/projects/bar/src/app.moduleXXX.ts' });
        let thrownError = null;
        try {
            schematicRunner.runSchematic('component', options, appTree);
        }
        catch (err) {
            thrownError = err;
        }
        expect(thrownError).toBeDefined();
    });
    it('should handle upper case paths', () => {
        const pathOption = 'projects/bar/src/app/SOME/UPPER/DIR';
        const options = Object.assign({}, defaultOptions, { path: pathOption });
        const tree = schematicRunner.runSchematic('component', options, appTree);
        let files = tree.files;
        let root = `/${pathOption}/foo/foo.component`;
        expect(files.indexOf(`${root}.css`)).toBeGreaterThanOrEqual(0);
        expect(files.indexOf(`${root}.html`)).toBeGreaterThanOrEqual(0);
        expect(files.indexOf(`${root}.spec.ts`)).toBeGreaterThanOrEqual(0);
        expect(files.indexOf(`${root}.ts`)).toBeGreaterThanOrEqual(0);
        const options2 = Object.assign({}, options, { name: 'BAR' });
        const tree2 = schematicRunner.runSchematic('component', options2, tree);
        files = tree2.files;
        root = `/${pathOption}/bar/bar.component`;
        expect(files.indexOf(`${root}.css`)).toBeGreaterThanOrEqual(0);
        expect(files.indexOf(`${root}.html`)).toBeGreaterThanOrEqual(0);
        expect(files.indexOf(`${root}.spec.ts`)).toBeGreaterThanOrEqual(0);
        expect(files.indexOf(`${root}.ts`)).toBeGreaterThanOrEqual(0);
    });
    it('should create a component in a sub-directory', () => {
        const options = Object.assign({}, defaultOptions, { path: 'projects/bar/src/app/a/b/c' });
        const tree = schematicRunner.runSchematic('component', options, appTree);
        const files = tree.files;
        const root = `/${options.path}/foo/foo.component`;
        expect(files.indexOf(`${root}.css`)).toBeGreaterThanOrEqual(0);
        expect(files.indexOf(`${root}.html`)).toBeGreaterThanOrEqual(0);
        expect(files.indexOf(`${root}.spec.ts`)).toBeGreaterThanOrEqual(0);
        expect(files.indexOf(`${root}.ts`)).toBeGreaterThanOrEqual(0);
    });
    it('should use the prefix', () => {
        const options = Object.assign({}, defaultOptions, { prefix: 'pre' });
        const tree = schematicRunner.runSchematic('component', options, appTree);
        const content = tree.readContent('/projects/bar/src/app/foo/foo.component.ts');
        expect(content).toMatch(/selector: 'pre-foo'/);
    });
    it('should use the default project prefix if none is passed', () => {
        const options = Object.assign({}, defaultOptions, { prefix: undefined });
        const tree = schematicRunner.runSchematic('component', options, appTree);
        const content = tree.readContent('/projects/bar/src/app/foo/foo.component.ts');
        expect(content).toMatch(/selector: 'app-foo'/);
    });
    it('should use the supplied prefix if it is ""', () => {
        const options = Object.assign({}, defaultOptions, { prefix: '' });
        const tree = schematicRunner.runSchematic('component', options, appTree);
        const content = tree.readContent('/projects/bar/src/app/foo/foo.component.ts');
        expect(content).toMatch(/selector: 'foo'/);
    });
    it('should respect the inlineTemplate option', () => {
        const options = Object.assign({}, defaultOptions, { inlineTemplate: true });
        const tree = schematicRunner.runSchematic('component', options, appTree);
        const content = tree.readContent('/projects/bar/src/app/foo/foo.component.ts');
        expect(content).toMatch(/template: /);
        expect(content).not.toMatch(/templateUrl: /);
        expect(tree.files.indexOf('/projects/bar/src/app/foo/foo.component.html')).toEqual(-1);
    });
    it('should respect the inlineStyle option', () => {
        const options = Object.assign({}, defaultOptions, { inlineStyle: true });
        const tree = schematicRunner.runSchematic('component', options, appTree);
        const content = tree.readContent('/projects/bar/src/app/foo/foo.component.ts');
        expect(content).toMatch(/styles: \[/);
        expect(content).not.toMatch(/styleUrls: /);
        expect(tree.files.indexOf('/projects/bar/src/app/foo/foo.component.css')).toEqual(-1);
    });
    it('should respect the styleext option', () => {
        const options = Object.assign({}, defaultOptions, { styleext: 'scss' });
        const tree = schematicRunner.runSchematic('component', options, appTree);
        const content = tree.readContent('/projects/bar/src/app/foo/foo.component.ts');
        expect(content).toMatch(/styleUrls: \['.\/foo.component.scss/);
        expect(tree.files.indexOf('/projects/bar/src/app/foo/foo.component.scss'))
            .toBeGreaterThanOrEqual(0);
        expect(tree.files.indexOf('/projects/bar/src/app/foo/foo.component.css')).toEqual(-1);
    });
    it('should use the module flag even if the module is a routing module', () => {
        const routingFileName = 'app-routing.module.ts';
        const routingModulePath = `/projects/bar/src/app/${routingFileName}`;
        const newTree = test_1.createAppModule(appTree, routingModulePath);
        const options = Object.assign({}, defaultOptions, { module: routingFileName });
        const tree = schematicRunner.runSchematic('component', options, newTree);
        const content = tree.readContent(routingModulePath);
        expect(content).toMatch(/import { FooComponent } from '.\/foo\/foo.component/);
    });
    it('should handle a path in the name option', () => {
        const options = Object.assign({}, defaultOptions, { name: 'dir/test-component' });
        const tree = schematicRunner.runSchematic('component', options, appTree);
        const content = tree.readContent('/projects/bar/src/app/app.module.ts');
        expect(content).toMatch(
        // tslint:disable-next-line:max-line-length
        /import { TestComponentComponent } from '\.\/dir\/test-component\/test-component.component'/);
    });
    it('should handle a path in the name and module options', () => {
        appTree = schematicRunner.runSchematic('module', { name: 'admin/module', project: 'bar' }, appTree);
        const options = Object.assign({}, defaultOptions, { name: 'other/test-component', module: 'admin/module' });
        appTree = schematicRunner.runSchematic('component', options, appTree);
        const content = appTree.readContent('/projects/bar/src/app/admin/module/module.module.ts');
        expect(content).toMatch(
        // tslint:disable-next-line:max-line-length
        /import { TestComponentComponent } from '..\/..\/other\/test-component\/test-component.component'/);
    });
    it('should create the right selector with a path in the name', () => {
        const options = Object.assign({}, defaultOptions, { name: 'sub/test' });
        appTree = schematicRunner.runSchematic('component', options, appTree);
        const content = appTree.readContent('/projects/bar/src/app/sub/test/test.component.ts');
        expect(content).toMatch(/selector: 'app-test'/);
    });
    it('should respect the sourceRoot value', () => {
        const config = JSON.parse(appTree.readContent('/angular.json'));
        config.projects.bar.sourceRoot = 'projects/bar/custom';
        appTree.overwrite('/angular.json', JSON.stringify(config, null, 2));
        // should fail without a module in that dir
        expect(() => schematicRunner.runSchematic('component', defaultOptions, appTree)).toThrow();
        // move the module
        appTree.rename('/projects/bar/src/app/app.module.ts', '/projects/bar/custom/app/app.module.ts');
        appTree = schematicRunner.runSchematic('component', defaultOptions, appTree);
        expect(appTree.files.indexOf('/projects/bar/custom/app/foo/foo.component.ts'))
            .toBeGreaterThanOrEqual(0);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXhfc3BlYy5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvYm9iby9Xb3JrL2dpdGh1Yi9zaGFyay1zY2hlbWF0aWNzL3NyYy8iLCJzb3VyY2VzIjpbInNyYy9jb21wb25lbnQvaW5kZXhfc3BlYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7R0FNRztBQUNILGdFQUF1RjtBQUN2Riw2QkFBNkI7QUFFN0IsMENBQWtEO0FBSWxELGlDQUFpQztBQUNqQyxRQUFRLENBQUMscUJBQXFCLEVBQUUsR0FBRyxFQUFFO0lBQ25DLE1BQU0sZUFBZSxHQUFHLElBQUksNkJBQW1CLENBQzdDLHFCQUFxQixFQUNyQixJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxvQkFBb0IsQ0FBQyxDQUMzQyxDQUFDO0lBQ0YsTUFBTSxjQUFjLEdBQXFCO1FBQ3ZDLElBQUksRUFBRSxLQUFLO1FBQ1gsbUJBQW1CO1FBQ25CLFdBQVcsRUFBRSxLQUFLO1FBQ2xCLGNBQWMsRUFBRSxLQUFLO1FBQ3JCLGVBQWUsRUFBRSxTQUFTO1FBQzFCLFFBQVEsRUFBRSxLQUFLO1FBQ2YsSUFBSSxFQUFFLElBQUk7UUFDVixNQUFNLEVBQUUsU0FBUztRQUNqQixNQUFNLEVBQUUsS0FBSztRQUNiLE9BQU8sRUFBRSxLQUFLO0tBQ2YsQ0FBQztJQUdGLE1BQU0sZ0JBQWdCLEdBQXFCO1FBQ3pDLElBQUksRUFBRSxXQUFXO1FBQ2pCLGNBQWMsRUFBRSxVQUFVO1FBQzFCLE9BQU8sRUFBRSxPQUFPO0tBQ2pCLENBQUM7SUFFRixNQUFNLFVBQVUsR0FBdUI7UUFDckMsSUFBSSxFQUFFLEtBQUs7UUFDWCxXQUFXLEVBQUUsS0FBSztRQUNsQixjQUFjLEVBQUUsS0FBSztRQUNyQixPQUFPLEVBQUUsS0FBSztRQUNkLEtBQUssRUFBRSxLQUFLO1FBQ1osU0FBUyxFQUFFLEtBQUs7UUFDaEIsZUFBZSxFQUFFLEtBQUs7S0FDdkIsQ0FBQztJQUNGLElBQUksT0FBcUIsQ0FBQztJQUMx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b250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7IFNjaGVtYXRpY1Rlc3RSdW5uZXIsIFVuaXRUZXN0VHJlZSB9IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9zY2hlbWF0aWNzL3Rlc3RpbmcnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IFNjaGVtYSBhcyBBcHBsaWNhdGlvbk9wdGlvbnMgfSBmcm9tICcuLi9hcHBsaWNhdGlvbi9zY2hlbWEnO1xuaW1wb3J0IHsgY3JlYXRlQXBwTW9kdWxlIH0gZnJvbSAnLi4vdXRpbGl0eS90ZXN0JztcbmltcG9ydCB7IFNjaGVtYSBhcyBXb3Jrc3BhY2VPcHRpb25zIH0gZnJvbSAnLi4vd29ya3NwYWNlL3NjaGVtYSc7XG5pbXBvcnQgeyBTY2hlbWEgYXMgQ29tcG9uZW50T3B0aW9ucyB9IGZyb20gJy4vc2NoZW1hJztcblxuLy8gdHNsaW50OmRpc2FibGU6bWF4LWxpbmUtbGVuZ3RoXG5kZXNjcmliZSgnQ29tcG9uZW50IFNjaGVtYXRpYycsICgpID0+IHtcbiAgY29uc3Qgc2NoZW1hdGljUnVubmVyID0gbmV3IFNjaGVtYXRpY1Rlc3RSdW5uZXIoXG4gICAgJ0BzY2hlbWF0aWNzL2FuZ3VsYXInLFxuICAgIHBhdGguam9pbihfX2Rpcm5hbWUsICcuLi9jb2xsZWN0aW9uLmpzb24nKSxcbiAgKTtcbiAgY29uc3QgZGVmYXVsdE9wdGlvbnM6IENvbXBvbmVudE9wdGlvbnMgPSB7XG4gICAgbmFtZTogJ2ZvbycsXG4gICAgLy8gcGF0aDogJ3NyYy9hcHAnLFxuICAgIGlubGluZVN0eWxlOiBmYWxzZSxcbiAgICBpbmxpbmVUZW1wbGF0ZTogZmFsc2UsXG4gICAgY2hhbmdlRGV0ZWN0aW9uOiAnRGVmYXVsdCcsXG4gICAgc3R5bGVleHQ6ICdjc3MnLFxuICAgIHNwZWM6IHRydWUsXG4gICAgbW9kdWxlOiB1bmRlZmluZWQsXG4gICAgZXhwb3J0OiBmYWxzZSxcbiAgICBwcm9qZWN0OiAnYmFyJyxcbiAgfTtcblxuXG4gIGNvbnN0IHdvcmtzcGFjZU9wdGlvbnM6IFdvcmtzcGFjZU9wdGlvbnMgPSB7XG4gICAgbmFtZTogJ3dvcmtzcGFjZScsXG4gICAgbmV3UHJvamVjdFJvb3Q6ICdwcm9qZWN0cycsXG4gICAgdmVyc2lvbjogJzYuMC4wJyxcbiAgfTtcblxuICBjb25zdCBhcHBPcHRpb25zOiBBcHBsaWNhdGlvbk9wdGlvbnMgPSB7XG4gICAgbmFtZTogJ2JhcicsXG4gICAgaW5saW5lU3R5bGU6IGZhbHNlLFxuICAgIGlubGluZVRlbXBsYXRlOiBmYWxzZSxcbiAgICByb3V0aW5nOiBmYWxzZSxcbiAgICBzdHlsZTogJ2NzcycsXG4gICAgc2tpcFRlc3RzOiBmYWxzZSxcbiAgICBza2lwUGFja2FnZUpzb246IGZhbHNlLFxuICB9O1xuICBsZXQgYXBwVHJlZTogVW5pdFRlc3RUcmVlO1xuICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICBhcHBUcmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnd29ya3NwYWNlJywgd29ya3NwYWNlT3B0aW9ucyk7XG4gICAgYXBwVHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ2FwcGxpY2F0aW9uJywgYXBwT3B0aW9ucywgYXBwVHJlZSk7XG4gIH0pO1xuXG4gIGl0KCdzaG91bGQgY3JlYXRlIGEgY29tcG9uZW50JywgKCkgPT4ge1xuICAgIGNvbnN0IG9wdGlvbnMgPSB7IC4uLmRlZmF1bHRPcHRpb25zIH07XG4gICAgY29uc3QgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ2NvbXBvbmVudCcsIG9wdGlvbnMsIGFwcFRyZWUpO1xuICAgIGNvbnN0IGZpbGVzID0gdHJlZS5maWxlcztcbiAgICBleHBlY3QoZmlsZXMuaW5kZXhPZignL3Byb2plY3RzL2Jhci9zcmMvYXBwL2Zvby9mb28uY29tcG9uZW50LmNzcycpKS50b0JlR3JlYXRlclRoYW5PckVxdWFsKDApO1xuICAgIGV4cGVjdChmaWxlcy5pbmRleE9mKCcvcHJvamVjdHMvYmFyL3NyYy9hcHAvZm9vL2Zvby5jb21wb25lbnQuaHRtbCcpKS50b0JlR3JlYXRlclRoYW5PckVxdWFsKDApO1xuICAgIGV4cGVjdChmaWxlcy5pbmRleE9mKCcvcHJvamVjdHMvYmFyL3NyYy9hcHAvZm9vL2Zvby5jb21wb25lbnQuc3BlYy50cycpKS50b0JlR3JlYXRlclRoYW5PckVxdWFsKDApO1xuICAgIGV4cGVjdChmaWxlcy5pbmRleE9mKCcvcHJvamVjdHMvYmFyL3NyYy9hcHAvZm9vL2Zvby5jb21wb25lbnQudHMnKSkudG9CZUdyZWF0ZXJUaGFuT3JFcXVhbCgwKTtcbiAgICBjb25zdCBtb2R1bGVDb250ZW50ID0gdHJlZS5yZWFkQ29udGVudCgnL3Byb2plY3RzL2Jhci9zcmMvYXBwL2FwcC5tb2R1bGUudHMnKTtcbiAgICBleHBlY3QobW9kdWxlQ29udGVudCkudG9NYXRjaCgvaW1wb3J0LipGb28uKmZyb20gJy5cXC9mb29cXC9mb28uY29tcG9uZW50Jy8pO1xuICAgIGV4cGVjdChtb2R1bGVDb250ZW50KS50b01hdGNoKC9kZWNsYXJhdGlvbnM6XFxzKlxcW1teXFxdXSs/LFxccj9cXG5cXHMrRm9vQ29tcG9uZW50XFxyP1xcbi9tKTtcbiAgfSk7XG5cbiAgaXQoJ3Nob3VsZCBzZXQgY2hhbmdlIGRldGVjdGlvbiB0byBPblB1c2gnLCAoKSA9PiB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHsgLi4uZGVmYXVsdE9wdGlvbnMsIGNoYW5nZURldGVjdGlvbjogJ09uUHVzaCcgfTtcblxuICAgIGNvbnN0IHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdjb21wb25lbnQnLCBvcHRpb25zLCBhcHBUcmVlKTtcbiAgICBjb25zdCB0c0NvbnRlbnQgPSB0cmVlLnJlYWRDb250ZW50KCcvcHJvamVjdHMvYmFyL3NyYy9hcHAvZm9vL2Zvby5jb21wb25lbnQudHMnKTtcbiAgICBleHBlY3QodHNDb250ZW50KS50b01hdGNoKC9jaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5Lk9uUHVzaC8pO1xuICB9KTtcblxuICBpdCgnc2hvdWxkIG5vdCBzZXQgdmlldyBlbmNhcHN1bGF0aW9uJywgKCkgPT4ge1xuICAgIGNvbnN0IG9wdGlvbnMgPSB7IC4uLmRlZmF1bHRPcHRpb25zIH07XG5cbiAgICBjb25zdCB0cmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnY29tcG9uZW50Jywgb3B0aW9ucywgYXBwVHJlZSk7XG4gICAgY29uc3QgdHNDb250ZW50ID0gdHJlZS5yZWFkQ29udGVudCgnL3Byb2plY3RzL2Jhci9zcmMvYXBwL2Zvby9mb28uY29tcG9uZW50LnRzJyk7XG4gICAgZXhwZWN0KHRzQ29udGVudCkubm90LnRvTWF0Y2goL2VuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLyk7XG4gIH0pO1xuXG4gIGl0KCdzaG91bGQgc2V0IHZpZXcgZW5jYXBzdWxhdGlvbiB0byBFbXVsYXRlZCcsICgpID0+IHtcbiAgICBjb25zdCBvcHRpb25zID0geyAuLi5kZWZhdWx0T3B0aW9ucywgdmlld0VuY2Fwc3VsYXRpb246ICdFbXVsYXRlZCcgfTtcblxuICAgIGNvbnN0IHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdjb21wb25lbnQnLCBvcHRpb25zLCBhcHBUcmVlKTtcbiAgICBjb25zdCB0c0NvbnRlbnQgPSB0cmVlLnJlYWRDb250ZW50KCcvcHJvamVjdHMvYmFyL3NyYy9hcHAvZm9vL2Zvby5jb21wb25lbnQudHMnKTtcbiAgICBleHBlY3QodHNDb250ZW50KS50b01hdGNoKC9lbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5FbXVsYXRlZC8pO1xuICB9KTtcblxuICBpdCgnc2hvdWxkIHNldCB2aWV3IGVuY2Fwc3VsYXRpb24gdG8gTm9uZScsICgpID0+IHtcbiAgICBjb25zdCBvcHRpb25zID0geyAuLi5kZWZhdWx0T3B0aW9ucywgdmlld0VuY2Fwc3VsYXRpb246ICdOb25lJyB9O1xuXG4gICAgY29uc3QgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ2NvbXBvbmVudCcsIG9wdGlvbnMsIGFwcFRyZWUpO1xuICAgIGNvbnN0IHRzQ29udGVudCA9IHRyZWUucmVhZENvbnRlbnQoJy9wcm9qZWN0cy9iYXIvc3JjL2FwcC9mb28vZm9vLmNvbXBvbmVudC50cycpO1xuICAgIGV4cGVjdCh0c0NvbnRlbnQpLnRvTWF0Y2goL2VuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmUvKTtcbiAgfSk7XG5cbiAgaXQoJ3Nob3VsZCBjcmVhdGUgYSBmbGF0IGNvbXBvbmVudCcsICgpID0+IHtcbiAgICBjb25zdCBvcHRpb25zID0geyAuLi5kZWZhdWx0T3B0aW9ucywgZmxhdDogdHJ1ZSB9O1xuXG4gICAgY29uc3QgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ2NvbXBvbmVudCcsIG9wdGlvbnMsIGFwcFRyZWUpO1xuICAgIGNvbnN0IGZpbGVzID0gdHJlZS5maWxlcztcbiAgICBleHBlY3QoZmlsZXMuaW5kZXhPZignL3Byb2plY3RzL2Jhci9zcmMvYXBwL2Zvby5jb21wb25lbnQuY3NzJykpLnRvQmVHcmVhdGVyVGhhbk9yRXF1YWwoMCk7XG4gICAgZXhwZWN0KGZpbGVzLmluZGV4T2YoJy9wcm9qZWN0cy9iYXIvc3JjL2FwcC9mb28uY29tcG9uZW50Lmh0bWwnKSkudG9CZUdyZWF0ZXJUaGFuT3JFcXVhbCgwKTtcbiAgICBleHBlY3QoZmlsZXMuaW5kZXhPZignL3Byb2plY3RzL2Jhci9zcmMvYXBwL2Zvby5jb21wb25lbnQuc3BlYy50cycpKS50b0JlR3JlYXRlclRoYW5PckVxdWFsKDApO1xuICAgIGV4cGVjdChmaWxlcy5pbmRleE9mKCcvcHJvamVjdHMvYmFyL3NyYy9hcHAvZm9vLmNvbXBvbmVudC50cycpKS50b0JlR3JlYXRlclRoYW5PckVxdWFsKDApO1xuICB9KTtcblxuICBpdCgnc2hvdWxkIGZpbmQgdGhlIGNsb3Nlc3QgbW9kdWxlJywgKCkgPT4ge1xuICAgIGNvbnN0IG9wdGlvbnMgPSB7IC4uLmRlZmF1bHRPcHRpb25zIH07XG4gICAgY29uc3QgZm9vTW9kdWxlID0gJy9wcm9qZWN0cy9iYXIvc3JjL2FwcC9mb28vZm9vLm1vZHVsZS50cyc7XG4gICAgYXBwVHJlZS5jcmVhdGUoZm9vTW9kdWxlLCBgXG4gICAgICBpbXBvcnQgeyBOZ01vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG4gICAgICBATmdNb2R1bGUoe1xuICAgICAgICBpbXBvcnRzOiBbXSxcbiAgICAgICAgZGVjbGFyYXRpb25zOiBbXVxuICAgICAgfSlcbiAgICAgIGV4cG9ydCBjbGFzcyBGb29Nb2R1bGUgeyB9XG4gICAgYCk7XG5cbiAgICBjb25zdCB0cmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnY29tcG9uZW50Jywgb3B0aW9ucywgYXBwVHJlZSk7XG4gICAgY29uc3QgZm9vTW9kdWxlQ29udGVudCA9IHRyZWUucmVhZENvbnRlbnQoZm9vTW9kdWxlKTtcbiAgICBleHBlY3QoZm9vTW9kdWxlQ29udGVudCkudG9NYXRjaCgvaW1wb3J0IHsgRm9vQ29tcG9uZW50IH0gZnJvbSAnLlxcL2Zvby5jb21wb25lbnQnLyk7XG4gIH0pO1xuXG4gIGl0KCdzaG91bGQgZXhwb3J0IHRoZSBjb21wb25lbnQnLCAoKSA9PiB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHsgLi4uZGVmYXVsdE9wdGlvbnMsIGV4cG9ydDogdHJ1ZSB9O1xuXG4gICAgY29uc3QgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ2NvbXBvbmVudCcsIG9wdGlvbnMsIGFwcFRyZWUpO1xuICAgIGNvbnN0IGFwcE1vZHVsZUNvbnRlbnQgPSB0cmVlLnJlYWRDb250ZW50KCcvcHJvamVjdHMvYmFyL3NyYy9hcHAvYXBwLm1vZHVsZS50cycpO1xuICAgIGV4cGVjdChhcHBNb2R1bGVDb250ZW50KS50b01hdGNoKC9leHBvcnRzOiBcXFtGb29Db21wb25lbnRcXF0vKTtcbiAgfSk7XG5cbiAgaXQoJ3Nob3VsZCBzZXQgdGhlIGVudHJ5IGNvbXBvbmVudCcsICgpID0+IHtcbiAgICBjb25zdCBvcHRpb25zID0geyAuLi5kZWZhdWx0T3B0aW9ucywgZW50cnlDb21wb25lbnQ6IHRydWUgfTtcblxuICAgIGNvbnN0IHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdjb21wb25lbnQnLCBvcHRpb25zLCBhcHBUcmVlKTtcbiAgICBjb25zdCBhcHBNb2R1bGVDb250ZW50ID0gdHJlZS5yZWFkQ29udGVudCgnL3Byb2plY3RzL2Jhci9zcmMvYXBwL2FwcC5tb2R1bGUudHMnKTtcbiAgICBleHBlY3QoYXBwTW9kdWxlQ29udGVudCkudG9NYXRjaCgvZW50cnlDb21wb25lbnRzOiBcXFtGb29Db21wb25lbnRcXF0vKTtcbiAgfSk7XG5cbiAgaXQoJ3Nob3VsZCBpbXBvcnQgaW50byBhIHNwZWNpZmllZCBtb2R1bGUnLCAoKSA9PiB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHsgLi4uZGVmYXVsdE9wdGlvbnMsIG1vZHVsZTogJ2FwcC5tb2R1bGUudHMnIH07XG5cbiAgICBjb25zdCB0cmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnY29tcG9uZW50Jywgb3B0aW9ucywgYXBwVHJlZSk7XG4gICAgY29uc3QgYXBwTW9kdWxlID0gdHJlZS5yZWFkQ29udGVudCgnL3Byb2plY3RzL2Jhci9zcmMvYXBwL2FwcC5tb2R1bGUudHMnKTtcblxuICAgIGV4cGVjdChhcHBNb2R1bGUpLnRvTWF0Y2goL2ltcG9ydCB7IEZvb0NvbXBvbmVudCB9IGZyb20gJy5cXC9mb29cXC9mb28uY29tcG9uZW50Jy8pO1xuICB9KTtcblxuICBpdCgnc2hvdWxkIGZhaWwgaWYgc3BlY2lmaWVkIG1vZHVsZSBkb2VzIG5vdCBleGlzdCcsICgpID0+IHtcbiAgICBjb25zdCBvcHRpb25zID0geyAuLi5kZWZhdWx0T3B0aW9ucywgbW9kdWxlOiAnL3Byb2plY3RzL2Jhci9zcmMvYXBwLm1vZHVsZVhYWC50cycgfTtcbiAgICBsZXQgdGhyb3duRXJyb3I6IEVycm9yIHwgbnVsbCA9IG51bGw7XG4gICAgdHJ5IHtcbiAgICAgIHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ2NvbXBvbmVudCcsIG9wdGlvbnMsIGFwcFRyZWUpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgdGhyb3duRXJyb3IgPSBlcnI7XG4gICAgfVxuICAgIGV4cGVjdCh0aHJvd25FcnJvcikudG9CZURlZmluZWQoKTtcbiAgfSk7XG5cbiAgaXQoJ3Nob3VsZCBoYW5kbGUgdXBwZXIgY2FzZSBwYXRocycsICgpID0+IHtcbiAgICBjb25zdCBwYXRoT3B0aW9uID0gJ3Byb2plY3RzL2Jhci9zcmMvYXBwL1NPTUUvVVBQRVIvRElSJztcbiAgICBjb25zdCBvcHRpb25zID0geyAuLi5kZWZhdWx0T3B0aW9ucywgcGF0aDogcGF0aE9wdGlvbiB9O1xuXG4gICAgY29uc3QgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ2NvbXBvbmVudCcsIG9wdGlvbnMsIGFwcFRyZWUpO1xuICAgIGxldCBmaWxlcyA9IHRyZWUuZmlsZXM7XG4gICAgbGV0IHJvb3QgPSBgLyR7cGF0aE9wdGlvbn0vZm9vL2Zvby5jb21wb25lbnRgO1xuICAgIGV4cGVjdChmaWxlcy5pbmRleE9mKGAke3Jvb3R9LmNzc2ApKS50b0JlR3JlYXRlclRoYW5PckVxdWFsKDApO1xuICAgIGV4cGVjdChmaWxlcy5pbmRleE9mKGAke3Jvb3R9Lmh0bWxgKSkudG9CZUdyZWF0ZXJUaGFuT3JFcXVhbCgwKTtcbiAgICBleHBlY3QoZmlsZXMuaW5kZXhPZihgJHtyb290fS5zcGVjLnRzYCkpLnRvQmVHcmVhdGVyVGhhbk9yRXF1YWwoMCk7XG4gICAgZXhwZWN0KGZpbGVzLmluZGV4T2YoYCR7cm9vdH0udHNgKSkudG9CZUdyZWF0ZXJUaGFuT3JFcXVhbCgwKTtcblxuICAgIGNvbnN0IG9wdGlvbnMyID0geyAuLi5vcHRpb25zLCBuYW1lOiAnQkFSJyB9O1xuICAgIGNvbnN0IHRyZWUyID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnY29tcG9uZW50Jywgb3B0aW9uczIsIHRyZWUpO1xuICAgIGZpbGVzID0gdHJlZTIuZmlsZXM7XG4gICAgcm9vdCA9IGAvJHtwYXRoT3B0aW9ufS9iYXIvYmFyLmNvbXBvbmVudGA7XG4gICAgZXhwZWN0KGZpbGVzLmluZGV4T2YoYCR7cm9vdH0uY3NzYCkpLnRvQmVHcmVhdGVyVGhhbk9yRXF1YWwoMCk7XG4gICAgZXhwZWN0KGZpbGVzLmluZGV4T2YoYCR7cm9vdH0uaHRtbGApKS50b0JlR3JlYXRlclRoYW5PckVxdWFsKDApO1xuICAgIGV4cGVjdChmaWxlcy5pbmRleE9mKGAke3Jvb3R9LnNwZWMudHNgKSkudG9CZUdyZWF0ZXJUaGFuT3JFcXVhbCgwKTtcbiAgICBleHBlY3QoZmlsZXMuaW5kZXhPZihgJHtyb290fS50c2ApKS50b0JlR3JlYXRlclRoYW5PckVxdWFsKDApO1xuICB9KTtcblxuICBpdCgnc2hvdWxkIGNyZWF0ZSBhIGNvbXBvbmVudCBpbiBhIHN1Yi1kaXJlY3RvcnknLCAoKSA9PiB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHsgLi4uZGVmYXVsdE9wdGlvbnMsIHBhdGg6ICdwcm9qZWN0cy9iYXIvc3JjL2FwcC9hL2IvYycgfTtcblxuICAgIGNvbnN0IHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdjb21wb25lbnQnLCBvcHRpb25zLCBhcHBUcmVlKTtcbiAgICBjb25zdCBmaWxlcyA9IHRyZWUuZmlsZXM7XG4gICAgY29uc3Qgcm9vdCA9IGAvJHtvcHRpb25zLnBhdGh9L2Zvby9mb28uY29tcG9uZW50YDtcbiAgICBleHBlY3QoZmlsZXMuaW5kZXhPZihgJHtyb290fS5jc3NgKSkudG9CZUdyZWF0ZXJUaGFuT3JFcXVhbCgwKTtcbiAgICBleHBlY3QoZmlsZXMuaW5kZXhPZihgJHtyb290fS5odG1sYCkpLnRvQmVHcmVhdGVyVGhhbk9yRXF1YWwoMCk7XG4gICAgZXhwZWN0KGZpbGVzLmluZGV4T2YoYCR7cm9vdH0uc3BlYy50c2ApKS50b0JlR3JlYXRlclRoYW5PckVxdWFsKDApO1xuICAgIGV4cGVjdChmaWxlcy5pbmRleE9mKGAke3Jvb3R9LnRzYCkpLnRvQmVHcmVhdGVyVGhhbk9yRXF1YWwoMCk7XG4gIH0pO1xuXG4gIGl0KCdzaG91bGQgdXNlIHRoZSBwcmVmaXgnLCAoKSA9PiB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHsgLi4uZGVmYXVsdE9wdGlvbnMsIHByZWZpeDogJ3ByZScgfTtcblxuICAgIGNvbnN0IHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdjb21wb25lbnQnLCBvcHRpb25zLCBhcHBUcmVlKTtcbiAgICBjb25zdCBjb250ZW50ID0gdHJlZS5yZWFkQ29udGVudCgnL3Byb2plY3RzL2Jhci9zcmMvYXBwL2Zvby9mb28uY29tcG9uZW50LnRzJyk7XG4gICAgZXhwZWN0KGNvbnRlbnQpLnRvTWF0Y2goL3NlbGVjdG9yOiAncHJlLWZvbycvKTtcbiAgfSk7XG5cbiAgaXQoJ3Nob3VsZCB1c2UgdGhlIGRlZmF1bHQgcHJvamVjdCBwcmVmaXggaWYgbm9uZSBpcyBwYXNzZWQnLCAoKSA9PiB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHsgLi4uZGVmYXVsdE9wdGlvbnMsIHByZWZpeDogdW5kZWZpbmVkIH07XG5cbiAgICBjb25zdCB0cmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnY29tcG9uZW50Jywgb3B0aW9ucywgYXBwVHJlZSk7XG4gICAgY29uc3QgY29udGVudCA9IHRyZWUucmVhZENvbnRlbnQoJy9wcm9qZWN0cy9iYXIvc3JjL2FwcC9mb28vZm9vLmNvbXBvbmVudC50cycpO1xuICAgIGV4cGVjdChjb250ZW50KS50b01hdGNoKC9zZWxlY3RvcjogJ2FwcC1mb28nLyk7XG4gIH0pO1xuXG4gIGl0KCdzaG91bGQgdXNlIHRoZSBzdXBwbGllZCBwcmVmaXggaWYgaXQgaXMgXCJcIicsICgpID0+IHtcbiAgICBjb25zdCBvcHRpb25zID0geyAuLi5kZWZhdWx0T3B0aW9ucywgcHJlZml4OiAnJyB9O1xuXG4gICAgY29uc3QgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ2NvbXBvbmVudCcsIG9wdGlvbnMsIGFwcFRyZWUpO1xuICAgIGNvbnN0IGNvbnRlbnQgPSB0cmVlLnJlYWRDb250ZW50KCcvcHJvamVjdHMvYmFyL3NyYy9hcHAvZm9vL2Zvby5jb21wb25lbnQudHMnKTtcbiAgICBleHBlY3QoY29udGVudCkudG9NYXRjaCgvc2VsZWN0b3I6ICdmb28nLyk7XG4gIH0pO1xuXG4gIGl0KCdzaG91bGQgcmVzcGVjdCB0aGUgaW5saW5lVGVtcGxhdGUgb3B0aW9uJywgKCkgPT4ge1xuICAgIGNvbnN0IG9wdGlvbnMgPSB7IC4uLmRlZmF1bHRPcHRpb25zLCBpbmxpbmVUZW1wbGF0ZTogdHJ1ZSB9O1xuICAgIGNvbnN0IHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdjb21wb25lbnQnLCBvcHRpb25zLCBhcHBUcmVlKTtcbiAgICBjb25zdCBjb250ZW50ID0gdHJlZS5yZWFkQ29udGVudCgnL3Byb2plY3RzL2Jhci9zcmMvYXBwL2Zvby9mb28uY29tcG9uZW50LnRzJyk7XG4gICAgZXhwZWN0KGNvbnRlbnQpLnRvTWF0Y2goL3RlbXBsYXRlOiAvKTtcbiAgICBleHBlY3QoY29udGVudCkubm90LnRvTWF0Y2goL3RlbXBsYXRlVXJsOiAvKTtcbiAgICBleHBlY3QodHJlZS5maWxlcy5pbmRleE9mKCcvcHJvamVjdHMvYmFyL3NyYy9hcHAvZm9vL2Zvby5jb21wb25lbnQuaHRtbCcpKS50b0VxdWFsKC0xKTtcbiAgfSk7XG5cbiAgaXQoJ3Nob3VsZCByZXNwZWN0IHRoZSBpbmxpbmVTdHlsZSBvcHRpb24nLCAoKSA9PiB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHsgLi4uZGVmYXVsdE9wdGlvbnMsIGlubGluZVN0eWxlOiB0cnVlIH07XG4gICAgY29uc3QgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ2NvbXBvbmVudCcsIG9wdGlvbnMsIGFwcFRyZWUpO1xuICAgIGNvbnN0IGNvbnRlbnQgPSB0cmVlLnJlYWRDb250ZW50KCcvcHJvamVjdHMvYmFyL3NyYy9hcHAvZm9vL2Zvby5jb21wb25lbnQudHMnKTtcbiAgICBleHBlY3QoY29udGVudCkudG9NYXRjaCgvc3R5bGVzOiBcXFsvKTtcbiAgICBleHBlY3QoY29udGVudCkubm90LnRvTWF0Y2goL3N0eWxlVXJsczogLyk7XG4gICAgZXhwZWN0KHRyZWUuZmlsZXMuaW5kZXhPZignL3Byb2plY3RzL2Jhci9zcmMvYXBwL2Zvby9mb28uY29tcG9uZW50LmNzcycpKS50b0VxdWFsKC0xKTtcbiAgfSk7XG5cbiAgaXQoJ3Nob3VsZCByZXNwZWN0IHRoZSBzdHlsZWV4dCBvcHRpb24nLCAoKSA9PiB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHsgLi4uZGVmYXVsdE9wdGlvbnMsIHN0eWxlZXh0OiAnc2NzcycgfTtcbiAgICBjb25zdCB0cmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnY29tcG9uZW50Jywgb3B0aW9ucywgYXBwVHJlZSk7XG4gICAgY29uc3QgY29udGVudCA9IHRyZWUucmVhZENvbnRlbnQoJy9wcm9qZWN0cy9iYXIvc3JjL2FwcC9mb28vZm9vLmNvbXBvbmVudC50cycpO1xuICAgIGV4cGVjdChjb250ZW50KS50b01hdGNoKC9zdHlsZVVybHM6IFxcWycuXFwvZm9vLmNvbXBvbmVudC5zY3NzLyk7XG4gICAgZXhwZWN0KHRyZWUuZmlsZXMuaW5kZXhPZignL3Byb2plY3RzL2Jhci9zcmMvYXBwL2Zvby9mb28uY29tcG9uZW50LnNjc3MnKSlcbiAgICAgIC50b0JlR3JlYXRlclRoYW5PckVxdWFsKDApO1xuICAgIGV4cGVjdCh0cmVlLmZpbGVzLmluZGV4T2YoJy9wcm9qZWN0cy9iYXIvc3JjL2FwcC9mb28vZm9vLmNvbXBvbmVudC5jc3MnKSkudG9FcXVhbCgtMSk7XG4gIH0pO1xuXG4gIGl0KCdzaG91bGQgdXNlIHRoZSBtb2R1bGUgZmxhZyBldmVuIGlmIHRoZSBtb2R1bGUgaXMgYSByb3V0aW5nIG1vZHVsZScsICgpID0+IHtcbiAgICBjb25zdCByb3V0aW5nRmlsZU5hbWUgPSAnYXBwLXJvdXRpbmcubW9kdWxlLnRzJztcbiAgICBjb25zdCByb3V0aW5nTW9kdWxlUGF0aCA9IGAvcHJvamVjdHMvYmFyL3NyYy9hcHAvJHtyb3V0aW5nRmlsZU5hbWV9YDtcbiAgICBjb25zdCBuZXdUcmVlID0gY3JlYXRlQXBwTW9kdWxlKGFwcFRyZWUsIHJvdXRpbmdNb2R1bGVQYXRoKTtcbiAgICBjb25zdCBvcHRpb25zID0geyAuLi5kZWZhdWx0T3B0aW9ucywgbW9kdWxlOiByb3V0aW5nRmlsZU5hbWUgfTtcbiAgICBjb25zdCB0cmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnY29tcG9uZW50Jywgb3B0aW9ucywgbmV3VHJlZSk7XG4gICAgY29uc3QgY29udGVudCA9IHRyZWUucmVhZENvbnRlbnQocm91dGluZ01vZHVsZVBhdGgpO1xuICAgIGV4cGVjdChjb250ZW50KS50b01hdGNoKC9pbXBvcnQgeyBGb29Db21wb25lbnQgfSBmcm9tICcuXFwvZm9vXFwvZm9vLmNvbXBvbmVudC8pO1xuICB9KTtcblxuICBpdCgnc2hvdWxkIGhhbmRsZSBhIHBhdGggaW4gdGhlIG5hbWUgb3B0aW9uJywgKCkgPT4ge1xuICAgIGNvbnN0IG9wdGlvbnMgPSB7IC4uLmRlZmF1bHRPcHRpb25zLCBuYW1lOiAnZGlyL3Rlc3QtY29tcG9uZW50JyB9O1xuXG4gICAgY29uc3QgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ2NvbXBvbmVudCcsIG9wdGlvbnMsIGFwcFRyZWUpO1xuICAgIGNvbnN0IGNvbnRlbnQgPSB0cmVlLnJlYWRDb250ZW50KCcvcHJvamVjdHMvYmFyL3NyYy9hcHAvYXBwLm1vZHVsZS50cycpO1xuICAgIGV4cGVjdChjb250ZW50KS50b01hdGNoKFxuICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm1heC1saW5lLWxlbmd0aFxuICAgICAgL2ltcG9ydCB7IFRlc3RDb21wb25lbnRDb21wb25lbnQgfSBmcm9tICdcXC5cXC9kaXJcXC90ZXN0LWNvbXBvbmVudFxcL3Rlc3QtY29tcG9uZW50LmNvbXBvbmVudCcvKTtcbiAgfSk7XG5cbiAgaXQoJ3Nob3VsZCBoYW5kbGUgYSBwYXRoIGluIHRoZSBuYW1lIGFuZCBtb2R1bGUgb3B0aW9ucycsICgpID0+IHtcbiAgICBhcHBUcmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnbW9kdWxlJywgeyBuYW1lOiAnYWRtaW4vbW9kdWxlJywgcHJvamVjdDogJ2JhcicgfSwgYXBwVHJlZSk7XG5cbiAgICBjb25zdCBvcHRpb25zID0geyAuLi5kZWZhdWx0T3B0aW9ucywgbmFtZTogJ290aGVyL3Rlc3QtY29tcG9uZW50JywgbW9kdWxlOiAnYWRtaW4vbW9kdWxlJyB9O1xuICAgIGFwcFRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdjb21wb25lbnQnLCBvcHRpb25zLCBhcHBUcmVlKTtcblxuICAgIGNvbnN0IGNvbnRlbnQgPSBhcHBUcmVlLnJlYWRDb250ZW50KCcvcHJvamVjdHMvYmFyL3NyYy9hcHAvYWRtaW4vbW9kdWxlL21vZHVsZS5tb2R1bGUudHMnKTtcbiAgICBleHBlY3QoY29udGVudCkudG9NYXRjaChcbiAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTptYXgtbGluZS1sZW5ndGhcbiAgICAgIC9pbXBvcnQgeyBUZXN0Q29tcG9uZW50Q29tcG9uZW50IH0gZnJvbSAnLi5cXC8uLlxcL290aGVyXFwvdGVzdC1jb21wb25lbnRcXC90ZXN0LWNvbXBvbmVudC5jb21wb25lbnQnLyk7XG4gIH0pO1xuXG4gIGl0KCdzaG91bGQgY3JlYXRlIHRoZSByaWdodCBzZWxlY3RvciB3aXRoIGEgcGF0aCBpbiB0aGUgbmFtZScsICgpID0+IHtcbiAgICBjb25zdCBvcHRpb25zID0geyAuLi5kZWZhdWx0T3B0aW9ucywgbmFtZTogJ3N1Yi90ZXN0JyB9O1xuICAgIGFwcFRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdjb21wb25lbnQnLCBvcHRpb25zLCBhcHBUcmVlKTtcbiAgICBjb25zdCBjb250ZW50ID0gYXBwVHJlZS5yZWFkQ29udGVudCgnL3Byb2plY3RzL2Jhci9zcmMvYXBwL3N1Yi90ZXN0L3Rlc3QuY29tcG9uZW50LnRzJyk7XG4gICAgZXhwZWN0KGNvbnRlbnQpLnRvTWF0Y2goL3NlbGVjdG9yOiAnYXBwLXRlc3QnLyk7XG4gIH0pO1xuXG4gIGl0KCdzaG91bGQgcmVzcGVjdCB0aGUgc291cmNlUm9vdCB2YWx1ZScsICgpID0+IHtcbiAgICBjb25zdCBjb25maWcgPSBKU09OLnBhcnNlKGFwcFRyZWUucmVhZENvbnRlbnQoJy9hbmd1bGFyLmpzb24nKSk7XG4gICAgY29uZmlnLnByb2plY3RzLmJhci5zb3VyY2VSb290ID0gJ3Byb2plY3RzL2Jhci9jdXN0b20nO1xuICAgIGFwcFRyZWUub3ZlcndyaXRlKCcvYW5ndWxhci5qc29uJywgSlNPTi5zdHJpbmdpZnkoY29uZmlnLCBudWxsLCAyKSk7XG5cbiAgICAvLyBzaG91bGQgZmFpbCB3aXRob3V0IGEgbW9kdWxlIGluIHRoYXQgZGlyXG4gICAgZXhwZWN0KCgpID0+IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ2NvbXBvbmVudCcsIGRlZmF1bHRPcHRpb25zLCBhcHBUcmVlKSkudG9UaHJvdygpO1xuXG4gICAgLy8gbW92ZSB0aGUgbW9kdWxlXG4gICAgYXBwVHJlZS5yZW5hbWUoJy9wcm9qZWN0cy9iYXIvc3JjL2FwcC9hcHAubW9kdWxlLnRzJywgJy9wcm9qZWN0cy9iYXIvY3VzdG9tL2FwcC9hcHAubW9kdWxlLnRzJyk7XG4gICAgYXBwVHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ2NvbXBvbmVudCcsIGRlZmF1bHRPcHRpb25zLCBhcHBUcmVlKTtcbiAgICBleHBlY3QoYXBwVHJlZS5maWxlcy5pbmRleE9mKCcvcHJvamVjdHMvYmFyL2N1c3RvbS9hcHAvZm9vL2Zvby5jb21wb25lbnQudHMnKSlcbiAgICAgIC50b0JlR3JlYXRlclRoYW5PckVxdWFsKDApO1xuICB9KTtcbn0pO1xuIl19