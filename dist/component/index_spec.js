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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXhfc3BlYy5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvYm9iby9Xb3JrL3NoYXJrLXNjaGVtYXRpY3Mvc3JjLyIsInNvdXJjZXMiOlsic3JjL2NvbXBvbmVudC9pbmRleF9zcGVjLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7OztHQU1HO0FBQ0gsZ0VBQXVGO0FBQ3ZGLDZCQUE2QjtBQUU3QiwwQ0FBa0Q7QUFJbEQsaUNBQWlDO0FBQ2pDLFFBQVEsQ0FBQyxxQkFBcUIsRUFBRSxHQUFHLEVBQUU7SUFDbkMsTUFBTSxlQUFlLEdBQUcsSUFBSSw2QkFBbUIsQ0FDN0MscUJBQXFCLEVBQ3JCLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLG9CQUFvQixDQUFDLENBQzNDLENBQUM7SUFDRixNQUFNLGNBQWMsR0FBcUI7UUFDdkMsSUFBSSxFQUFFLEtBQUs7UUFDWCxtQkFBbUI7UUFDbkIsV0FBVyxFQUFFLEtBQUs7UUFDbEIsY0FBYyxFQUFFLEtBQUs7UUFDckIsZUFBZSxFQUFFLFNBQVM7UUFDMUIsUUFBUSxFQUFFLEtBQUs7UUFDZixJQUFJLEVBQUUsSUFBSTtRQUNWLE1BQU0sRUFBRSxTQUFTO1FBQ2pCLE1BQU0sRUFBRSxLQUFLO1FBQ2IsT0FBTyxFQUFFLEtBQUs7S0FDZixDQUFDO0lBR0YsTUFBTSxnQkFBZ0IsR0FBcUI7UUFDekMsSUFBSSxFQUFFLFdBQVc7UUFDakIsY0FBYyxFQUFFLFVBQVU7UUFDMUIsT0FBTyxFQUFFLE9BQU87S0FDakIsQ0FBQztJQUVGLE1BQU0sVUFBVSxHQUF1QjtRQUNyQyxJQUFJLEVBQUUsS0FBSztRQUNYLFdBQVcsRUFBRSxLQUFLO1FBQ2xCLGNBQWMsRUFBRSxLQUFLO1FBQ3JCLE9BQU8sRUFBRSxLQUFLO1FBQ2QsS0FBSyxFQUFFLEtBQUs7UUFDWixTQUFTLEVBQUUsS0FBSztRQUNoQixlQUFlLEVBQUUsS0FBSztLQUN2QixDQUFDO0lBQ0YsSUFBSSxPQUFxQixDQUFDO0lBQzFCLFVBQVUs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OlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHsgU2NoZW1hdGljVGVzdFJ1bm5lciwgVW5pdFRlc3RUcmVlIH0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L3NjaGVtYXRpY3MvdGVzdGluZyc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgU2NoZW1hIGFzIEFwcGxpY2F0aW9uT3B0aW9ucyB9IGZyb20gJy4uL2FwcGxpY2F0aW9uL3NjaGVtYSc7XG5pbXBvcnQgeyBjcmVhdGVBcHBNb2R1bGUgfSBmcm9tICcuLi91dGlsaXR5L3Rlc3QnO1xuaW1wb3J0IHsgU2NoZW1hIGFzIFdvcmtzcGFjZU9wdGlvbnMgfSBmcm9tICcuLi93b3Jrc3BhY2Uvc2NoZW1hJztcbmltcG9ydCB7IFNjaGVtYSBhcyBDb21wb25lbnRPcHRpb25zIH0gZnJvbSAnLi9zY2hlbWEnO1xuXG4vLyB0c2xpbnQ6ZGlzYWJsZTptYXgtbGluZS1sZW5ndGhcbmRlc2NyaWJlKCdDb21wb25lbnQgU2NoZW1hdGljJywgKCkgPT4ge1xuICBjb25zdCBzY2hlbWF0aWNSdW5uZXIgPSBuZXcgU2NoZW1hdGljVGVzdFJ1bm5lcihcbiAgICAnQHNjaGVtYXRpY3MvYW5ndWxhcicsXG4gICAgcGF0aC5qb2luKF9fZGlybmFtZSwgJy4uL2NvbGxlY3Rpb24uanNvbicpLFxuICApO1xuICBjb25zdCBkZWZhdWx0T3B0aW9uczogQ29tcG9uZW50T3B0aW9ucyA9IHtcbiAgICBuYW1lOiAnZm9vJyxcbiAgICAvLyBwYXRoOiAnc3JjL2FwcCcsXG4gICAgaW5saW5lU3R5bGU6IGZhbHNlLFxuICAgIGlubGluZVRlbXBsYXRlOiBmYWxzZSxcbiAgICBjaGFuZ2VEZXRlY3Rpb246ICdEZWZhdWx0JyxcbiAgICBzdHlsZWV4dDogJ2NzcycsXG4gICAgc3BlYzogdHJ1ZSxcbiAgICBtb2R1bGU6IHVuZGVmaW5lZCxcbiAgICBleHBvcnQ6IGZhbHNlLFxuICAgIHByb2plY3Q6ICdiYXInLFxuICB9O1xuXG5cbiAgY29uc3Qgd29ya3NwYWNlT3B0aW9uczogV29ya3NwYWNlT3B0aW9ucyA9IHtcbiAgICBuYW1lOiAnd29ya3NwYWNlJyxcbiAgICBuZXdQcm9qZWN0Um9vdDogJ3Byb2plY3RzJyxcbiAgICB2ZXJzaW9uOiAnNi4wLjAnLFxuICB9O1xuXG4gIGNvbnN0IGFwcE9wdGlvbnM6IEFwcGxpY2F0aW9uT3B0aW9ucyA9IHtcbiAgICBuYW1lOiAnYmFyJyxcbiAgICBpbmxpbmVTdHlsZTogZmFsc2UsXG4gICAgaW5saW5lVGVtcGxhdGU6IGZhbHNlLFxuICAgIHJvdXRpbmc6IGZhbHNlLFxuICAgIHN0eWxlOiAnY3NzJyxcbiAgICBza2lwVGVzdHM6IGZhbHNlLFxuICAgIHNraXBQYWNrYWdlSnNvbjogZmFsc2UsXG4gIH07XG4gIGxldCBhcHBUcmVlOiBVbml0VGVzdFRyZWU7XG4gIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgIGFwcFRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCd3b3Jrc3BhY2UnLCB3b3Jrc3BhY2VPcHRpb25zKTtcbiAgICBhcHBUcmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnYXBwbGljYXRpb24nLCBhcHBPcHRpb25zLCBhcHBUcmVlKTtcbiAgfSk7XG5cbiAgaXQoJ3Nob3VsZCBjcmVhdGUgYSBjb21wb25lbnQnLCAoKSA9PiB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHsgLi4uZGVmYXVsdE9wdGlvbnMgfTtcbiAgICBjb25zdCB0cmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnY29tcG9uZW50Jywgb3B0aW9ucywgYXBwVHJlZSk7XG4gICAgY29uc3QgZmlsZXMgPSB0cmVlLmZpbGVzO1xuICAgIGV4cGVjdChmaWxlcy5pbmRleE9mKCcvcHJvamVjdHMvYmFyL3NyYy9hcHAvZm9vL2Zvby5jb21wb25lbnQuY3NzJykpLnRvQmVHcmVhdGVyVGhhbk9yRXF1YWwoMCk7XG4gICAgZXhwZWN0KGZpbGVzLmluZGV4T2YoJy9wcm9qZWN0cy9iYXIvc3JjL2FwcC9mb28vZm9vLmNvbXBvbmVudC5odG1sJykpLnRvQmVHcmVhdGVyVGhhbk9yRXF1YWwoMCk7XG4gICAgZXhwZWN0KGZpbGVzLmluZGV4T2YoJy9wcm9qZWN0cy9iYXIvc3JjL2FwcC9mb28vZm9vLmNvbXBvbmVudC5zcGVjLnRzJykpLnRvQmVHcmVhdGVyVGhhbk9yRXF1YWwoMCk7XG4gICAgZXhwZWN0KGZpbGVzLmluZGV4T2YoJy9wcm9qZWN0cy9iYXIvc3JjL2FwcC9mb28vZm9vLmNvbXBvbmVudC50cycpKS50b0JlR3JlYXRlclRoYW5PckVxdWFsKDApO1xuICAgIGNvbnN0IG1vZHVsZUNvbnRlbnQgPSB0cmVlLnJlYWRDb250ZW50KCcvcHJvamVjdHMvYmFyL3NyYy9hcHAvYXBwLm1vZHVsZS50cycpO1xuICAgIGV4cGVjdChtb2R1bGVDb250ZW50KS50b01hdGNoKC9pbXBvcnQuKkZvby4qZnJvbSAnLlxcL2Zvb1xcL2Zvby5jb21wb25lbnQnLyk7XG4gICAgZXhwZWN0KG1vZHVsZUNvbnRlbnQpLnRvTWF0Y2goL2RlY2xhcmF0aW9uczpcXHMqXFxbW15cXF1dKz8sXFxyP1xcblxccytGb29Db21wb25lbnRcXHI/XFxuL20pO1xuICB9KTtcblxuICBpdCgnc2hvdWxkIHNldCBjaGFuZ2UgZGV0ZWN0aW9uIHRvIE9uUHVzaCcsICgpID0+IHtcbiAgICBjb25zdCBvcHRpb25zID0geyAuLi5kZWZhdWx0T3B0aW9ucywgY2hhbmdlRGV0ZWN0aW9uOiAnT25QdXNoJyB9O1xuXG4gICAgY29uc3QgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ2NvbXBvbmVudCcsIG9wdGlvbnMsIGFwcFRyZWUpO1xuICAgIGNvbnN0IHRzQ29udGVudCA9IHRyZWUucmVhZENvbnRlbnQoJy9wcm9qZWN0cy9iYXIvc3JjL2FwcC9mb28vZm9vLmNvbXBvbmVudC50cycpO1xuICAgIGV4cGVjdCh0c0NvbnRlbnQpLnRvTWF0Y2goL2NoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoLyk7XG4gIH0pO1xuXG4gIGl0KCdzaG91bGQgbm90IHNldCB2aWV3IGVuY2Fwc3VsYXRpb24nLCAoKSA9PiB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHsgLi4uZGVmYXVsdE9wdGlvbnMgfTtcblxuICAgIGNvbnN0IHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdjb21wb25lbnQnLCBvcHRpb25zLCBhcHBUcmVlKTtcbiAgICBjb25zdCB0c0NvbnRlbnQgPSB0cmVlLnJlYWRDb250ZW50KCcvcHJvamVjdHMvYmFyL3NyYy9hcHAvZm9vL2Zvby5jb21wb25lbnQudHMnKTtcbiAgICBleHBlY3QodHNDb250ZW50KS5ub3QudG9NYXRjaCgvZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24vKTtcbiAgfSk7XG5cbiAgaXQoJ3Nob3VsZCBzZXQgdmlldyBlbmNhcHN1bGF0aW9uIHRvIEVtdWxhdGVkJywgKCkgPT4ge1xuICAgIGNvbnN0IG9wdGlvbnMgPSB7IC4uLmRlZmF1bHRPcHRpb25zLCB2aWV3RW5jYXBzdWxhdGlvbjogJ0VtdWxhdGVkJyB9O1xuXG4gICAgY29uc3QgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ2NvbXBvbmVudCcsIG9wdGlvbnMsIGFwcFRyZWUpO1xuICAgIGNvbnN0IHRzQ29udGVudCA9IHRyZWUucmVhZENvbnRlbnQoJy9wcm9qZWN0cy9iYXIvc3JjL2FwcC9mb28vZm9vLmNvbXBvbmVudC50cycpO1xuICAgIGV4cGVjdCh0c0NvbnRlbnQpLnRvTWF0Y2goL2VuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLkVtdWxhdGVkLyk7XG4gIH0pO1xuXG4gIGl0KCdzaG91bGQgc2V0IHZpZXcgZW5jYXBzdWxhdGlvbiB0byBOb25lJywgKCkgPT4ge1xuICAgIGNvbnN0IG9wdGlvbnMgPSB7IC4uLmRlZmF1bHRPcHRpb25zLCB2aWV3RW5jYXBzdWxhdGlvbjogJ05vbmUnIH07XG5cbiAgICBjb25zdCB0cmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnY29tcG9uZW50Jywgb3B0aW9ucywgYXBwVHJlZSk7XG4gICAgY29uc3QgdHNDb250ZW50ID0gdHJlZS5yZWFkQ29udGVudCgnL3Byb2plY3RzL2Jhci9zcmMvYXBwL2Zvby9mb28uY29tcG9uZW50LnRzJyk7XG4gICAgZXhwZWN0KHRzQ29udGVudCkudG9NYXRjaCgvZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZS8pO1xuICB9KTtcblxuICBpdCgnc2hvdWxkIGNyZWF0ZSBhIGZsYXQgY29tcG9uZW50JywgKCkgPT4ge1xuICAgIGNvbnN0IG9wdGlvbnMgPSB7IC4uLmRlZmF1bHRPcHRpb25zLCBmbGF0OiB0cnVlIH07XG5cbiAgICBjb25zdCB0cmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnY29tcG9uZW50Jywgb3B0aW9ucywgYXBwVHJlZSk7XG4gICAgY29uc3QgZmlsZXMgPSB0cmVlLmZpbGVzO1xuICAgIGV4cGVjdChmaWxlcy5pbmRleE9mKCcvcHJvamVjdHMvYmFyL3NyYy9hcHAvZm9vLmNvbXBvbmVudC5jc3MnKSkudG9CZUdyZWF0ZXJUaGFuT3JFcXVhbCgwKTtcbiAgICBleHBlY3QoZmlsZXMuaW5kZXhPZignL3Byb2plY3RzL2Jhci9zcmMvYXBwL2Zvby5jb21wb25lbnQuaHRtbCcpKS50b0JlR3JlYXRlclRoYW5PckVxdWFsKDApO1xuICAgIGV4cGVjdChmaWxlcy5pbmRleE9mKCcvcHJvamVjdHMvYmFyL3NyYy9hcHAvZm9vLmNvbXBvbmVudC5zcGVjLnRzJykpLnRvQmVHcmVhdGVyVGhhbk9yRXF1YWwoMCk7XG4gICAgZXhwZWN0KGZpbGVzLmluZGV4T2YoJy9wcm9qZWN0cy9iYXIvc3JjL2FwcC9mb28uY29tcG9uZW50LnRzJykpLnRvQmVHcmVhdGVyVGhhbk9yRXF1YWwoMCk7XG4gIH0pO1xuXG4gIGl0KCdzaG91bGQgZmluZCB0aGUgY2xvc2VzdCBtb2R1bGUnLCAoKSA9PiB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHsgLi4uZGVmYXVsdE9wdGlvbnMgfTtcbiAgICBjb25zdCBmb29Nb2R1bGUgPSAnL3Byb2plY3RzL2Jhci9zcmMvYXBwL2Zvby9mb28ubW9kdWxlLnRzJztcbiAgICBhcHBUcmVlLmNyZWF0ZShmb29Nb2R1bGUsIGBcbiAgICAgIGltcG9ydCB7IE5nTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbiAgICAgIEBOZ01vZHVsZSh7XG4gICAgICAgIGltcG9ydHM6IFtdLFxuICAgICAgICBkZWNsYXJhdGlvbnM6IFtdXG4gICAgICB9KVxuICAgICAgZXhwb3J0IGNsYXNzIEZvb01vZHVsZSB7IH1cbiAgICBgKTtcblxuICAgIGNvbnN0IHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdjb21wb25lbnQnLCBvcHRpb25zLCBhcHBUcmVlKTtcbiAgICBjb25zdCBmb29Nb2R1bGVDb250ZW50ID0gdHJlZS5yZWFkQ29udGVudChmb29Nb2R1bGUpO1xuICAgIGV4cGVjdChmb29Nb2R1bGVDb250ZW50KS50b01hdGNoKC9pbXBvcnQgeyBGb29Db21wb25lbnQgfSBmcm9tICcuXFwvZm9vLmNvbXBvbmVudCcvKTtcbiAgfSk7XG5cbiAgaXQoJ3Nob3VsZCBleHBvcnQgdGhlIGNvbXBvbmVudCcsICgpID0+IHtcbiAgICBjb25zdCBvcHRpb25zID0geyAuLi5kZWZhdWx0T3B0aW9ucywgZXhwb3J0OiB0cnVlIH07XG5cbiAgICBjb25zdCB0cmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnY29tcG9uZW50Jywgb3B0aW9ucywgYXBwVHJlZSk7XG4gICAgY29uc3QgYXBwTW9kdWxlQ29udGVudCA9IHRyZWUucmVhZENvbnRlbnQoJy9wcm9qZWN0cy9iYXIvc3JjL2FwcC9hcHAubW9kdWxlLnRzJyk7XG4gICAgZXhwZWN0KGFwcE1vZHVsZUNvbnRlbnQpLnRvTWF0Y2goL2V4cG9ydHM6IFxcW0Zvb0NvbXBvbmVudFxcXS8pO1xuICB9KTtcblxuICBpdCgnc2hvdWxkIHNldCB0aGUgZW50cnkgY29tcG9uZW50JywgKCkgPT4ge1xuICAgIGNvbnN0IG9wdGlvbnMgPSB7IC4uLmRlZmF1bHRPcHRpb25zLCBlbnRyeUNvbXBvbmVudDogdHJ1ZSB9O1xuXG4gICAgY29uc3QgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ2NvbXBvbmVudCcsIG9wdGlvbnMsIGFwcFRyZWUpO1xuICAgIGNvbnN0IGFwcE1vZHVsZUNvbnRlbnQgPSB0cmVlLnJlYWRDb250ZW50KCcvcHJvamVjdHMvYmFyL3NyYy9hcHAvYXBwLm1vZHVsZS50cycpO1xuICAgIGV4cGVjdChhcHBNb2R1bGVDb250ZW50KS50b01hdGNoKC9lbnRyeUNvbXBvbmVudHM6IFxcW0Zvb0NvbXBvbmVudFxcXS8pO1xuICB9KTtcblxuICBpdCgnc2hvdWxkIGltcG9ydCBpbnRvIGEgc3BlY2lmaWVkIG1vZHVsZScsICgpID0+IHtcbiAgICBjb25zdCBvcHRpb25zID0geyAuLi5kZWZhdWx0T3B0aW9ucywgbW9kdWxlOiAnYXBwLm1vZHVsZS50cycgfTtcblxuICAgIGNvbnN0IHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdjb21wb25lbnQnLCBvcHRpb25zLCBhcHBUcmVlKTtcbiAgICBjb25zdCBhcHBNb2R1bGUgPSB0cmVlLnJlYWRDb250ZW50KCcvcHJvamVjdHMvYmFyL3NyYy9hcHAvYXBwLm1vZHVsZS50cycpO1xuXG4gICAgZXhwZWN0KGFwcE1vZHVsZSkudG9NYXRjaCgvaW1wb3J0IHsgRm9vQ29tcG9uZW50IH0gZnJvbSAnLlxcL2Zvb1xcL2Zvby5jb21wb25lbnQnLyk7XG4gIH0pO1xuXG4gIGl0KCdzaG91bGQgZmFpbCBpZiBzcGVjaWZpZWQgbW9kdWxlIGRvZXMgbm90IGV4aXN0JywgKCkgPT4ge1xuICAgIGNvbnN0IG9wdGlvbnMgPSB7IC4uLmRlZmF1bHRPcHRpb25zLCBtb2R1bGU6ICcvcHJvamVjdHMvYmFyL3NyYy9hcHAubW9kdWxlWFhYLnRzJyB9O1xuICAgIGxldCB0aHJvd25FcnJvcjogRXJyb3IgfCBudWxsID0gbnVsbDtcbiAgICB0cnkge1xuICAgICAgc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnY29tcG9uZW50Jywgb3B0aW9ucywgYXBwVHJlZSk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICB0aHJvd25FcnJvciA9IGVycjtcbiAgICB9XG4gICAgZXhwZWN0KHRocm93bkVycm9yKS50b0JlRGVmaW5lZCgpO1xuICB9KTtcblxuICBpdCgnc2hvdWxkIGhhbmRsZSB1cHBlciBjYXNlIHBhdGhzJywgKCkgPT4ge1xuICAgIGNvbnN0IHBhdGhPcHRpb24gPSAncHJvamVjdHMvYmFyL3NyYy9hcHAvU09NRS9VUFBFUi9ESVInO1xuICAgIGNvbnN0IG9wdGlvbnMgPSB7IC4uLmRlZmF1bHRPcHRpb25zLCBwYXRoOiBwYXRoT3B0aW9uIH07XG5cbiAgICBjb25zdCB0cmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnY29tcG9uZW50Jywgb3B0aW9ucywgYXBwVHJlZSk7XG4gICAgbGV0IGZpbGVzID0gdHJlZS5maWxlcztcbiAgICBsZXQgcm9vdCA9IGAvJHtwYXRoT3B0aW9ufS9mb28vZm9vLmNvbXBvbmVudGA7XG4gICAgZXhwZWN0KGZpbGVzLmluZGV4T2YoYCR7cm9vdH0uY3NzYCkpLnRvQmVHcmVhdGVyVGhhbk9yRXF1YWwoMCk7XG4gICAgZXhwZWN0KGZpbGVzLmluZGV4T2YoYCR7cm9vdH0uaHRtbGApKS50b0JlR3JlYXRlclRoYW5PckVxdWFsKDApO1xuICAgIGV4cGVjdChmaWxlcy5pbmRleE9mKGAke3Jvb3R9LnNwZWMudHNgKSkudG9CZUdyZWF0ZXJUaGFuT3JFcXVhbCgwKTtcbiAgICBleHBlY3QoZmlsZXMuaW5kZXhPZihgJHtyb290fS50c2ApKS50b0JlR3JlYXRlclRoYW5PckVxdWFsKDApO1xuXG4gICAgY29uc3Qgb3B0aW9uczIgPSB7IC4uLm9wdGlvbnMsIG5hbWU6ICdCQVInIH07XG4gICAgY29uc3QgdHJlZTIgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdjb21wb25lbnQnLCBvcHRpb25zMiwgdHJlZSk7XG4gICAgZmlsZXMgPSB0cmVlMi5maWxlcztcbiAgICByb290ID0gYC8ke3BhdGhPcHRpb259L2Jhci9iYXIuY29tcG9uZW50YDtcbiAgICBleHBlY3QoZmlsZXMuaW5kZXhPZihgJHtyb290fS5jc3NgKSkudG9CZUdyZWF0ZXJUaGFuT3JFcXVhbCgwKTtcbiAgICBleHBlY3QoZmlsZXMuaW5kZXhPZihgJHtyb290fS5odG1sYCkpLnRvQmVHcmVhdGVyVGhhbk9yRXF1YWwoMCk7XG4gICAgZXhwZWN0KGZpbGVzLmluZGV4T2YoYCR7cm9vdH0uc3BlYy50c2ApKS50b0JlR3JlYXRlclRoYW5PckVxdWFsKDApO1xuICAgIGV4cGVjdChmaWxlcy5pbmRleE9mKGAke3Jvb3R9LnRzYCkpLnRvQmVHcmVhdGVyVGhhbk9yRXF1YWwoMCk7XG4gIH0pO1xuXG4gIGl0KCdzaG91bGQgY3JlYXRlIGEgY29tcG9uZW50IGluIGEgc3ViLWRpcmVjdG9yeScsICgpID0+IHtcbiAgICBjb25zdCBvcHRpb25zID0geyAuLi5kZWZhdWx0T3B0aW9ucywgcGF0aDogJ3Byb2plY3RzL2Jhci9zcmMvYXBwL2EvYi9jJyB9O1xuXG4gICAgY29uc3QgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ2NvbXBvbmVudCcsIG9wdGlvbnMsIGFwcFRyZWUpO1xuICAgIGNvbnN0IGZpbGVzID0gdHJlZS5maWxlcztcbiAgICBjb25zdCByb290ID0gYC8ke29wdGlvbnMucGF0aH0vZm9vL2Zvby5jb21wb25lbnRgO1xuICAgIGV4cGVjdChmaWxlcy5pbmRleE9mKGAke3Jvb3R9LmNzc2ApKS50b0JlR3JlYXRlclRoYW5PckVxdWFsKDApO1xuICAgIGV4cGVjdChmaWxlcy5pbmRleE9mKGAke3Jvb3R9Lmh0bWxgKSkudG9CZUdyZWF0ZXJUaGFuT3JFcXVhbCgwKTtcbiAgICBleHBlY3QoZmlsZXMuaW5kZXhPZihgJHtyb290fS5zcGVjLnRzYCkpLnRvQmVHcmVhdGVyVGhhbk9yRXF1YWwoMCk7XG4gICAgZXhwZWN0KGZpbGVzLmluZGV4T2YoYCR7cm9vdH0udHNgKSkudG9CZUdyZWF0ZXJUaGFuT3JFcXVhbCgwKTtcbiAgfSk7XG5cbiAgaXQoJ3Nob3VsZCB1c2UgdGhlIHByZWZpeCcsICgpID0+IHtcbiAgICBjb25zdCBvcHRpb25zID0geyAuLi5kZWZhdWx0T3B0aW9ucywgcHJlZml4OiAncHJlJyB9O1xuXG4gICAgY29uc3QgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ2NvbXBvbmVudCcsIG9wdGlvbnMsIGFwcFRyZWUpO1xuICAgIGNvbnN0IGNvbnRlbnQgPSB0cmVlLnJlYWRDb250ZW50KCcvcHJvamVjdHMvYmFyL3NyYy9hcHAvZm9vL2Zvby5jb21wb25lbnQudHMnKTtcbiAgICBleHBlY3QoY29udGVudCkudG9NYXRjaCgvc2VsZWN0b3I6ICdwcmUtZm9vJy8pO1xuICB9KTtcblxuICBpdCgnc2hvdWxkIHVzZSB0aGUgZGVmYXVsdCBwcm9qZWN0IHByZWZpeCBpZiBub25lIGlzIHBhc3NlZCcsICgpID0+IHtcbiAgICBjb25zdCBvcHRpb25zID0geyAuLi5kZWZhdWx0T3B0aW9ucywgcHJlZml4OiB1bmRlZmluZWQgfTtcblxuICAgIGNvbnN0IHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdjb21wb25lbnQnLCBvcHRpb25zLCBhcHBUcmVlKTtcbiAgICBjb25zdCBjb250ZW50ID0gdHJlZS5yZWFkQ29udGVudCgnL3Byb2plY3RzL2Jhci9zcmMvYXBwL2Zvby9mb28uY29tcG9uZW50LnRzJyk7XG4gICAgZXhwZWN0KGNvbnRlbnQpLnRvTWF0Y2goL3NlbGVjdG9yOiAnYXBwLWZvbycvKTtcbiAgfSk7XG5cbiAgaXQoJ3Nob3VsZCB1c2UgdGhlIHN1cHBsaWVkIHByZWZpeCBpZiBpdCBpcyBcIlwiJywgKCkgPT4ge1xuICAgIGNvbnN0IG9wdGlvbnMgPSB7IC4uLmRlZmF1bHRPcHRpb25zLCBwcmVmaXg6ICcnIH07XG5cbiAgICBjb25zdCB0cmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnY29tcG9uZW50Jywgb3B0aW9ucywgYXBwVHJlZSk7XG4gICAgY29uc3QgY29udGVudCA9IHRyZWUucmVhZENvbnRlbnQoJy9wcm9qZWN0cy9iYXIvc3JjL2FwcC9mb28vZm9vLmNvbXBvbmVudC50cycpO1xuICAgIGV4cGVjdChjb250ZW50KS50b01hdGNoKC9zZWxlY3RvcjogJ2ZvbycvKTtcbiAgfSk7XG5cbiAgaXQoJ3Nob3VsZCByZXNwZWN0IHRoZSBpbmxpbmVUZW1wbGF0ZSBvcHRpb24nLCAoKSA9PiB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHsgLi4uZGVmYXVsdE9wdGlvbnMsIGlubGluZVRlbXBsYXRlOiB0cnVlIH07XG4gICAgY29uc3QgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ2NvbXBvbmVudCcsIG9wdGlvbnMsIGFwcFRyZWUpO1xuICAgIGNvbnN0IGNvbnRlbnQgPSB0cmVlLnJlYWRDb250ZW50KCcvcHJvamVjdHMvYmFyL3NyYy9hcHAvZm9vL2Zvby5jb21wb25lbnQudHMnKTtcbiAgICBleHBlY3QoY29udGVudCkudG9NYXRjaCgvdGVtcGxhdGU6IC8pO1xuICAgIGV4cGVjdChjb250ZW50KS5ub3QudG9NYXRjaCgvdGVtcGxhdGVVcmw6IC8pO1xuICAgIGV4cGVjdCh0cmVlLmZpbGVzLmluZGV4T2YoJy9wcm9qZWN0cy9iYXIvc3JjL2FwcC9mb28vZm9vLmNvbXBvbmVudC5odG1sJykpLnRvRXF1YWwoLTEpO1xuICB9KTtcblxuICBpdCgnc2hvdWxkIHJlc3BlY3QgdGhlIGlubGluZVN0eWxlIG9wdGlvbicsICgpID0+IHtcbiAgICBjb25zdCBvcHRpb25zID0geyAuLi5kZWZhdWx0T3B0aW9ucywgaW5saW5lU3R5bGU6IHRydWUgfTtcbiAgICBjb25zdCB0cmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnY29tcG9uZW50Jywgb3B0aW9ucywgYXBwVHJlZSk7XG4gICAgY29uc3QgY29udGVudCA9IHRyZWUucmVhZENvbnRlbnQoJy9wcm9qZWN0cy9iYXIvc3JjL2FwcC9mb28vZm9vLmNvbXBvbmVudC50cycpO1xuICAgIGV4cGVjdChjb250ZW50KS50b01hdGNoKC9zdHlsZXM6IFxcWy8pO1xuICAgIGV4cGVjdChjb250ZW50KS5ub3QudG9NYXRjaCgvc3R5bGVVcmxzOiAvKTtcbiAgICBleHBlY3QodHJlZS5maWxlcy5pbmRleE9mKCcvcHJvamVjdHMvYmFyL3NyYy9hcHAvZm9vL2Zvby5jb21wb25lbnQuY3NzJykpLnRvRXF1YWwoLTEpO1xuICB9KTtcblxuICBpdCgnc2hvdWxkIHJlc3BlY3QgdGhlIHN0eWxlZXh0IG9wdGlvbicsICgpID0+IHtcbiAgICBjb25zdCBvcHRpb25zID0geyAuLi5kZWZhdWx0T3B0aW9ucywgc3R5bGVleHQ6ICdzY3NzJyB9O1xuICAgIGNvbnN0IHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdjb21wb25lbnQnLCBvcHRpb25zLCBhcHBUcmVlKTtcbiAgICBjb25zdCBjb250ZW50ID0gdHJlZS5yZWFkQ29udGVudCgnL3Byb2plY3RzL2Jhci9zcmMvYXBwL2Zvby9mb28uY29tcG9uZW50LnRzJyk7XG4gICAgZXhwZWN0KGNvbnRlbnQpLnRvTWF0Y2goL3N0eWxlVXJsczogXFxbJy5cXC9mb28uY29tcG9uZW50LnNjc3MvKTtcbiAgICBleHBlY3QodHJlZS5maWxlcy5pbmRleE9mKCcvcHJvamVjdHMvYmFyL3NyYy9hcHAvZm9vL2Zvby5jb21wb25lbnQuc2NzcycpKVxuICAgICAgLnRvQmVHcmVhdGVyVGhhbk9yRXF1YWwoMCk7XG4gICAgZXhwZWN0KHRyZWUuZmlsZXMuaW5kZXhPZignL3Byb2plY3RzL2Jhci9zcmMvYXBwL2Zvby9mb28uY29tcG9uZW50LmNzcycpKS50b0VxdWFsKC0xKTtcbiAgfSk7XG5cbiAgaXQoJ3Nob3VsZCB1c2UgdGhlIG1vZHVsZSBmbGFnIGV2ZW4gaWYgdGhlIG1vZHVsZSBpcyBhIHJvdXRpbmcgbW9kdWxlJywgKCkgPT4ge1xuICAgIGNvbnN0IHJvdXRpbmdGaWxlTmFtZSA9ICdhcHAtcm91dGluZy5tb2R1bGUudHMnO1xuICAgIGNvbnN0IHJvdXRpbmdNb2R1bGVQYXRoID0gYC9wcm9qZWN0cy9iYXIvc3JjL2FwcC8ke3JvdXRpbmdGaWxlTmFtZX1gO1xuICAgIGNvbnN0IG5ld1RyZWUgPSBjcmVhdGVBcHBNb2R1bGUoYXBwVHJlZSwgcm91dGluZ01vZHVsZVBhdGgpO1xuICAgIGNvbnN0IG9wdGlvbnMgPSB7IC4uLmRlZmF1bHRPcHRpb25zLCBtb2R1bGU6IHJvdXRpbmdGaWxlTmFtZSB9O1xuICAgIGNvbnN0IHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdjb21wb25lbnQnLCBvcHRpb25zLCBuZXdUcmVlKTtcbiAgICBjb25zdCBjb250ZW50ID0gdHJlZS5yZWFkQ29udGVudChyb3V0aW5nTW9kdWxlUGF0aCk7XG4gICAgZXhwZWN0KGNvbnRlbnQpLnRvTWF0Y2goL2ltcG9ydCB7IEZvb0NvbXBvbmVudCB9IGZyb20gJy5cXC9mb29cXC9mb28uY29tcG9uZW50Lyk7XG4gIH0pO1xuXG4gIGl0KCdzaG91bGQgaGFuZGxlIGEgcGF0aCBpbiB0aGUgbmFtZSBvcHRpb24nLCAoKSA9PiB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHsgLi4uZGVmYXVsdE9wdGlvbnMsIG5hbWU6ICdkaXIvdGVzdC1jb21wb25lbnQnIH07XG5cbiAgICBjb25zdCB0cmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnY29tcG9uZW50Jywgb3B0aW9ucywgYXBwVHJlZSk7XG4gICAgY29uc3QgY29udGVudCA9IHRyZWUucmVhZENvbnRlbnQoJy9wcm9qZWN0cy9iYXIvc3JjL2FwcC9hcHAubW9kdWxlLnRzJyk7XG4gICAgZXhwZWN0KGNvbnRlbnQpLnRvTWF0Y2goXG4gICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bWF4LWxpbmUtbGVuZ3RoXG4gICAgICAvaW1wb3J0IHsgVGVzdENvbXBvbmVudENvbXBvbmVudCB9IGZyb20gJ1xcLlxcL2RpclxcL3Rlc3QtY29tcG9uZW50XFwvdGVzdC1jb21wb25lbnQuY29tcG9uZW50Jy8pO1xuICB9KTtcblxuICBpdCgnc2hvdWxkIGhhbmRsZSBhIHBhdGggaW4gdGhlIG5hbWUgYW5kIG1vZHVsZSBvcHRpb25zJywgKCkgPT4ge1xuICAgIGFwcFRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdtb2R1bGUnLCB7IG5hbWU6ICdhZG1pbi9tb2R1bGUnLCBwcm9qZWN0OiAnYmFyJyB9LCBhcHBUcmVlKTtcblxuICAgIGNvbnN0IG9wdGlvbnMgPSB7IC4uLmRlZmF1bHRPcHRpb25zLCBuYW1lOiAnb3RoZXIvdGVzdC1jb21wb25lbnQnLCBtb2R1bGU6ICdhZG1pbi9tb2R1bGUnIH07XG4gICAgYXBwVHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ2NvbXBvbmVudCcsIG9wdGlvbnMsIGFwcFRyZWUpO1xuXG4gICAgY29uc3QgY29udGVudCA9IGFwcFRyZWUucmVhZENvbnRlbnQoJy9wcm9qZWN0cy9iYXIvc3JjL2FwcC9hZG1pbi9tb2R1bGUvbW9kdWxlLm1vZHVsZS50cycpO1xuICAgIGV4cGVjdChjb250ZW50KS50b01hdGNoKFxuICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm1heC1saW5lLWxlbmd0aFxuICAgICAgL2ltcG9ydCB7IFRlc3RDb21wb25lbnRDb21wb25lbnQgfSBmcm9tICcuLlxcLy4uXFwvb3RoZXJcXC90ZXN0LWNvbXBvbmVudFxcL3Rlc3QtY29tcG9uZW50LmNvbXBvbmVudCcvKTtcbiAgfSk7XG5cbiAgaXQoJ3Nob3VsZCBjcmVhdGUgdGhlIHJpZ2h0IHNlbGVjdG9yIHdpdGggYSBwYXRoIGluIHRoZSBuYW1lJywgKCkgPT4ge1xuICAgIGNvbnN0IG9wdGlvbnMgPSB7IC4uLmRlZmF1bHRPcHRpb25zLCBuYW1lOiAnc3ViL3Rlc3QnIH07XG4gICAgYXBwVHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ2NvbXBvbmVudCcsIG9wdGlvbnMsIGFwcFRyZWUpO1xuICAgIGNvbnN0IGNvbnRlbnQgPSBhcHBUcmVlLnJlYWRDb250ZW50KCcvcHJvamVjdHMvYmFyL3NyYy9hcHAvc3ViL3Rlc3QvdGVzdC5jb21wb25lbnQudHMnKTtcbiAgICBleHBlY3QoY29udGVudCkudG9NYXRjaCgvc2VsZWN0b3I6ICdhcHAtdGVzdCcvKTtcbiAgfSk7XG5cbiAgaXQoJ3Nob3VsZCByZXNwZWN0IHRoZSBzb3VyY2VSb290IHZhbHVlJywgKCkgPT4ge1xuICAgIGNvbnN0IGNvbmZpZyA9IEpTT04ucGFyc2UoYXBwVHJlZS5yZWFkQ29udGVudCgnL2FuZ3VsYXIuanNvbicpKTtcbiAgICBjb25maWcucHJvamVjdHMuYmFyLnNvdXJjZVJvb3QgPSAncHJvamVjdHMvYmFyL2N1c3RvbSc7XG4gICAgYXBwVHJlZS5vdmVyd3JpdGUoJy9hbmd1bGFyLmpzb24nLCBKU09OLnN0cmluZ2lmeShjb25maWcsIG51bGwsIDIpKTtcblxuICAgIC8vIHNob3VsZCBmYWlsIHdpdGhvdXQgYSBtb2R1bGUgaW4gdGhhdCBkaXJcbiAgICBleHBlY3QoKCkgPT4gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnY29tcG9uZW50JywgZGVmYXVsdE9wdGlvbnMsIGFwcFRyZWUpKS50b1Rocm93KCk7XG5cbiAgICAvLyBtb3ZlIHRoZSBtb2R1bGVcbiAgICBhcHBUcmVlLnJlbmFtZSgnL3Byb2plY3RzL2Jhci9zcmMvYXBwL2FwcC5tb2R1bGUudHMnLCAnL3Byb2plY3RzL2Jhci9jdXN0b20vYXBwL2FwcC5tb2R1bGUudHMnKTtcbiAgICBhcHBUcmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnY29tcG9uZW50JywgZGVmYXVsdE9wdGlvbnMsIGFwcFRyZWUpO1xuICAgIGV4cGVjdChhcHBUcmVlLmZpbGVzLmluZGV4T2YoJy9wcm9qZWN0cy9iYXIvY3VzdG9tL2FwcC9mb28vZm9vLmNvbXBvbmVudC50cycpKVxuICAgICAgLnRvQmVHcmVhdGVyVGhhbk9yRXF1YWwoMCk7XG4gIH0pO1xufSk7XG4iXX0=