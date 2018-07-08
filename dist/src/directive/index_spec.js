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
// tslint:disable:max-line-length
describe('Directive Schematic', () => {
    const schematicRunner = new testing_1.SchematicTestRunner('@schematics/angular', path.join(__dirname, '../collection.json'));
    const defaultOptions = {
        name: 'foo',
        spec: true,
        module: undefined,
        export: false,
        prefix: 'app',
        flat: true,
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
    it('should create a directive', () => {
        const options = Object.assign({}, defaultOptions);
        const tree = schematicRunner.runSchematic('directive', options, appTree);
        const files = tree.files;
        expect(files.indexOf('/projects/bar/src/app/foo.directive.spec.ts')).toBeGreaterThanOrEqual(0);
        expect(files.indexOf('/projects/bar/src/app/foo.directive.ts')).toBeGreaterThanOrEqual(0);
        const moduleContent = tree.readContent('/projects/bar/src/app/app.module.ts');
        expect(moduleContent).toMatch(/import.*Foo.*from '.\/foo.directive'/);
        expect(moduleContent).toMatch(/declarations:\s*\[[^\]]+?,\r?\n\s+FooDirective\r?\n/m);
    });
    it('should create respect the flat flag', () => {
        const options = Object.assign({}, defaultOptions, { flat: false });
        const tree = schematicRunner.runSchematic('directive', options, appTree);
        const files = tree.files;
        expect(files.indexOf('/projects/bar/src/app/foo/foo.directive.spec.ts')).toBeGreaterThanOrEqual(0);
        expect(files.indexOf('/projects/bar/src/app/foo/foo.directive.ts')).toBeGreaterThanOrEqual(0);
    });
    it('should find the closest module', () => {
        const options = Object.assign({}, defaultOptions, { flat: false });
        const fooModule = '/projects/bar/src/app/foo/foo.module.ts';
        appTree.create(fooModule, `
      import { NgModule } from '@angular/core';

      @NgModule({
        imports: [],
        declarations: []
      })
      export class FooModule { }
    `);
        const tree = schematicRunner.runSchematic('directive', options, appTree);
        const fooModuleContent = tree.readContent(fooModule);
        expect(fooModuleContent).toMatch(/import { FooDirective } from '.\/foo.directive'/);
    });
    it('should export the directive', () => {
        const options = Object.assign({}, defaultOptions, { export: true });
        const tree = schematicRunner.runSchematic('directive', options, appTree);
        const appModuleContent = tree.readContent('/projects/bar/src/app/app.module.ts');
        expect(appModuleContent).toMatch(/exports: \[FooDirective\]/);
    });
    it('should import into a specified module', () => {
        const options = Object.assign({}, defaultOptions, { module: 'app.module.ts' });
        const tree = schematicRunner.runSchematic('directive', options, appTree);
        const appModule = tree.readContent('/projects/bar/src/app/app.module.ts');
        expect(appModule).toMatch(/import { FooDirective } from '.\/foo.directive'/);
    });
    it('should fail if specified module does not exist', () => {
        const options = Object.assign({}, defaultOptions, { module: '/projects/bar/src/app/app.moduleXXX.ts' });
        let thrownError = null;
        try {
            schematicRunner.runSchematic('directive', options, appTree);
        }
        catch (err) {
            thrownError = err;
        }
        expect(thrownError).toBeDefined();
    });
    it('should converts dash-cased-name to a camelCasedSelector', () => {
        const options = Object.assign({}, defaultOptions, { name: 'my-dir' });
        const tree = schematicRunner.runSchematic('directive', options, appTree);
        const content = tree.readContent('/projects/bar/src/app/my-dir.directive.ts');
        expect(content).toMatch(/selector: '\[appMyDir\]'/);
    });
    it('should create the right selector with a path in the name', () => {
        const options = Object.assign({}, defaultOptions, { name: 'sub/test' });
        appTree = schematicRunner.runSchematic('directive', options, appTree);
        const content = appTree.readContent('/projects/bar/src/app/sub/test.directive.ts');
        expect(content).toMatch(/selector: '\[appTest\]'/);
    });
    it('should use the prefix', () => {
        const options = Object.assign({}, defaultOptions, { prefix: 'pre' });
        const tree = schematicRunner.runSchematic('directive', options, appTree);
        const content = tree.readContent('/projects/bar/src/app/foo.directive.ts');
        expect(content).toMatch(/selector: '\[preFoo\]'/);
    });
    it('should use the default project prefix if none is passed', () => {
        const options = Object.assign({}, defaultOptions, { prefix: undefined });
        const tree = schematicRunner.runSchematic('directive', options, appTree);
        const content = tree.readContent('/projects/bar/src/app/foo.directive.ts');
        expect(content).toMatch(/selector: '\[appFoo\]'/);
    });
    it('should use the supplied prefix if it is ""', () => {
        const options = Object.assign({}, defaultOptions, { prefix: '' });
        const tree = schematicRunner.runSchematic('directive', options, appTree);
        const content = tree.readContent('/projects/bar/src/app/foo.directive.ts');
        expect(content).toMatch(/selector: '\[foo\]'/);
    });
    it('should respect the sourceRoot value', () => {
        const config = JSON.parse(appTree.readContent('/angular.json'));
        config.projects.bar.sourceRoot = 'projects/bar/custom';
        appTree.overwrite('/angular.json', JSON.stringify(config, null, 2));
        // should fail without a module in that dir
        expect(() => schematicRunner.runSchematic('directive', defaultOptions, appTree)).toThrow();
        // move the module
        appTree.rename('/projects/bar/src/app/app.module.ts', '/projects/bar/custom/app/app.module.ts');
        appTree = schematicRunner.runSchematic('directive', defaultOptions, appTree);
        expect(appTree.files.indexOf('/projects/bar/custom/app/foo.directive.ts'))
            .toBeGreaterThanOrEqual(0);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXhfc3BlYy5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvYm9iby9Xb3JrL2dpdGh1Yi9zaGFyay1zY2hlbWF0aWNzL3NyYy8iLCJzb3VyY2VzIjpbInNyYy9kaXJlY3RpdmUvaW5kZXhfc3BlYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7R0FNRztBQUNILGdFQUF1RjtBQUN2Riw2QkFBNkI7QUFLN0IsaUNBQWlDO0FBQ2pDLFFBQVEsQ0FBQyxxQkFBcUIsRUFBRSxHQUFHLEVBQUU7SUFDbkMsTUFBTSxlQUFlLEdBQUcsSUFBSSw2QkFBbUIsQ0FDN0MscUJBQXFCLEVBQ3JCLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLG9CQUFvQixDQUFDLENBQzNDLENBQUM7SUFDRixNQUFNLGNBQWMsR0FBcUI7UUFDdkMsSUFBSSxFQUFFLEtBQUs7UUFDWCxJQUFJLEVBQUUsSUFBSTtRQUNWLE1BQU0sRUFBRSxTQUFTO1FBQ2pCLE1BQU0sRUFBRSxLQUFLO1FBQ2IsTUFBTSxFQUFFLEtBQUs7UUFDYixJQUFJLEVBQUUsSUFBSTtRQUNWLE9BQU8sRUFBRSxLQUFLO0tBQ2YsQ0FBQztJQUVGLE1BQU0sZ0JBQWdCLEdBQXFCO1FBQ3pDLElBQUksRUFBRSxXQUFXO1FBQ2pCLGNBQWMsRUFBRSxVQUFVO1FBQzFCLE9BQU8sRUFBRSxPQUFPO0tBQ2pCLENBQUM7SUFFRixNQUFNLFVBQVUsR0FBdUI7UUFDckMsSUFBSSxFQUFFLEtBQUs7UUFDWCxXQUFXLEVBQUUsS0FBSztRQUNsQixjQUFjLEVBQUUsS0FBSztRQUNyQixPQUFPLEVBQUUsS0FBSztRQUNkLEtBQUssRUFBRSxLQUFLO1FBQ1osU0FBUyxFQUFFLEtBQUs7UUFDaEIsZUFBZSxFQUFFLEtBQUs7S0FDdkIsQ0FBQztJQUNGLElBQUksT0FBcUIsQ0FBQztJQUMxQixVQUFVLENBQUMsR0FBRyxFQUFFO1FBQ2QsT0FBTyxHQUFHLGVBQWUsQ0FBQyxZQUFZLENBQUMsV0FBVyxFQUFFLGdC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LE9BQU8sQ0FBQywyQ0FBMkMsQ0FBQyxDQUFDO2FBQ3ZFLHNCQUFzQixDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQy9CLENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQgeyBTY2hlbWF0aWNUZXN0UnVubmVyLCBVbml0VGVzdFRyZWUgfSBmcm9tICdAYW5ndWxhci1kZXZraXQvc2NoZW1hdGljcy90ZXN0aW5nJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBTY2hlbWEgYXMgQXBwbGljYXRpb25PcHRpb25zIH0gZnJvbSAnLi4vYXBwbGljYXRpb24vc2NoZW1hJztcbmltcG9ydCB7IFNjaGVtYSBhcyBXb3Jrc3BhY2VPcHRpb25zIH0gZnJvbSAnLi4vd29ya3NwYWNlL3NjaGVtYSc7XG5pbXBvcnQgeyBTY2hlbWEgYXMgRGlyZWN0aXZlT3B0aW9ucyB9IGZyb20gJy4vc2NoZW1hJztcblxuLy8gdHNsaW50OmRpc2FibGU6bWF4LWxpbmUtbGVuZ3RoXG5kZXNjcmliZSgnRGlyZWN0aXZlIFNjaGVtYXRpYycsICgpID0+IHtcbiAgY29uc3Qgc2NoZW1hdGljUnVubmVyID0gbmV3IFNjaGVtYXRpY1Rlc3RSdW5uZXIoXG4gICAgJ0BzY2hlbWF0aWNzL2FuZ3VsYXInLFxuICAgIHBhdGguam9pbihfX2Rpcm5hbWUsICcuLi9jb2xsZWN0aW9uLmpzb24nKSxcbiAgKTtcbiAgY29uc3QgZGVmYXVsdE9wdGlvbnM6IERpcmVjdGl2ZU9wdGlvbnMgPSB7XG4gICAgbmFtZTogJ2ZvbycsXG4gICAgc3BlYzogdHJ1ZSxcbiAgICBtb2R1bGU6IHVuZGVmaW5lZCxcbiAgICBleHBvcnQ6IGZhbHNlLFxuICAgIHByZWZpeDogJ2FwcCcsXG4gICAgZmxhdDogdHJ1ZSxcbiAgICBwcm9qZWN0OiAnYmFyJyxcbiAgfTtcblxuICBjb25zdCB3b3Jrc3BhY2VPcHRpb25zOiBXb3Jrc3BhY2VPcHRpb25zID0ge1xuICAgIG5hbWU6ICd3b3Jrc3BhY2UnLFxuICAgIG5ld1Byb2plY3RSb290OiAncHJvamVjdHMnLFxuICAgIHZlcnNpb246ICc2LjAuMCcsXG4gIH07XG5cbiAgY29uc3QgYXBwT3B0aW9uczogQXBwbGljYXRpb25PcHRpb25zID0ge1xuICAgIG5hbWU6ICdiYXInLFxuICAgIGlubGluZVN0eWxlOiBmYWxzZSxcbiAgICBpbmxpbmVUZW1wbGF0ZTogZmFsc2UsXG4gICAgcm91dGluZzogZmFsc2UsXG4gICAgc3R5bGU6ICdjc3MnLFxuICAgIHNraXBUZXN0czogZmFsc2UsXG4gICAgc2tpcFBhY2thZ2VKc29uOiBmYWxzZSxcbiAgfTtcbiAgbGV0IGFwcFRyZWU6IFVuaXRUZXN0VHJlZTtcbiAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgYXBwVHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ3dvcmtzcGFjZScsIHdvcmtzcGFjZU9wdGlvbnMpO1xuICAgIGFwcFRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdhcHBsaWNhdGlvbicsIGFwcE9wdGlvbnMsIGFwcFRyZWUpO1xuICB9KTtcblxuICBpdCgnc2hvdWxkIGNyZWF0ZSBhIGRpcmVjdGl2ZScsICgpID0+IHtcbiAgICBjb25zdCBvcHRpb25zID0geyAuLi5kZWZhdWx0T3B0aW9ucyB9O1xuXG4gICAgY29uc3QgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ2RpcmVjdGl2ZScsIG9wdGlvbnMsIGFwcFRyZWUpO1xuICAgIGNvbnN0IGZpbGVzID0gdHJlZS5maWxlcztcbiAgICBleHBlY3QoZmlsZXMuaW5kZXhPZignL3Byb2plY3RzL2Jhci9zcmMvYXBwL2Zvby5kaXJlY3RpdmUuc3BlYy50cycpKS50b0JlR3JlYXRlclRoYW5PckVxdWFsKDApO1xuICAgIGV4cGVjdChmaWxlcy5pbmRleE9mKCcvcHJvamVjdHMvYmFyL3NyYy9hcHAvZm9vLmRpcmVjdGl2ZS50cycpKS50b0JlR3JlYXRlclRoYW5PckVxdWFsKDApO1xuICAgIGNvbnN0IG1vZHVsZUNvbnRlbnQgPSB0cmVlLnJlYWRDb250ZW50KCcvcHJvamVjdHMvYmFyL3NyYy9hcHAvYXBwLm1vZHVsZS50cycpO1xuICAgIGV4cGVjdChtb2R1bGVDb250ZW50KS50b01hdGNoKC9pbXBvcnQuKkZvby4qZnJvbSAnLlxcL2Zvby5kaXJlY3RpdmUnLyk7XG4gICAgZXhwZWN0KG1vZHVsZUNvbnRlbnQpLnRvTWF0Y2goL2RlY2xhcmF0aW9uczpcXHMqXFxbW15cXF1dKz8sXFxyP1xcblxccytGb29EaXJlY3RpdmVcXHI/XFxuL20pO1xuICB9KTtcblxuICBpdCgnc2hvdWxkIGNyZWF0ZSByZXNwZWN0IHRoZSBmbGF0IGZsYWcnLCAoKSA9PiB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHsgLi4uZGVmYXVsdE9wdGlvbnMsIGZsYXQ6IGZhbHNlIH07XG5cbiAgICBjb25zdCB0cmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnZGlyZWN0aXZlJywgb3B0aW9ucywgYXBwVHJlZSk7XG4gICAgY29uc3QgZmlsZXMgPSB0cmVlLmZpbGVzO1xuICAgIGV4cGVjdChmaWxlcy5pbmRleE9mKCcvcHJvamVjdHMvYmFyL3NyYy9hcHAvZm9vL2Zvby5kaXJlY3RpdmUuc3BlYy50cycpKS50b0JlR3JlYXRlclRoYW5PckVxdWFsKDApO1xuICAgIGV4cGVjdChmaWxlcy5pbmRleE9mKCcvcHJvamVjdHMvYmFyL3NyYy9hcHAvZm9vL2Zvby5kaXJlY3RpdmUudHMnKSkudG9CZUdyZWF0ZXJUaGFuT3JFcXVhbCgwKTtcbiAgfSk7XG5cbiAgaXQoJ3Nob3VsZCBmaW5kIHRoZSBjbG9zZXN0IG1vZHVsZScsICgpID0+IHtcbiAgICBjb25zdCBvcHRpb25zID0geyAuLi5kZWZhdWx0T3B0aW9ucywgZmxhdDogZmFsc2UgfTtcbiAgICBjb25zdCBmb29Nb2R1bGUgPSAnL3Byb2plY3RzL2Jhci9zcmMvYXBwL2Zvby9mb28ubW9kdWxlLnRzJztcbiAgICBhcHBUcmVlLmNyZWF0ZShmb29Nb2R1bGUsIGBcbiAgICAgIGltcG9ydCB7IE5nTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbiAgICAgIEBOZ01vZHVsZSh7XG4gICAgICAgIGltcG9ydHM6IFtdLFxuICAgICAgICBkZWNsYXJhdGlvbnM6IFtdXG4gICAgICB9KVxuICAgICAgZXhwb3J0IGNsYXNzIEZvb01vZHVsZSB7IH1cbiAgICBgKTtcblxuICAgIGNvbnN0IHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdkaXJlY3RpdmUnLCBvcHRpb25zLCBhcHBUcmVlKTtcbiAgICBjb25zdCBmb29Nb2R1bGVDb250ZW50ID0gdHJlZS5yZWFkQ29udGVudChmb29Nb2R1bGUpO1xuICAgIGV4cGVjdChmb29Nb2R1bGVDb250ZW50KS50b01hdGNoKC9pbXBvcnQgeyBGb29EaXJlY3RpdmUgfSBmcm9tICcuXFwvZm9vLmRpcmVjdGl2ZScvKTtcbiAgfSk7XG5cbiAgaXQoJ3Nob3VsZCBleHBvcnQgdGhlIGRpcmVjdGl2ZScsICgpID0+IHtcbiAgICBjb25zdCBvcHRpb25zID0geyAuLi5kZWZhdWx0T3B0aW9ucywgZXhwb3J0OiB0cnVlIH07XG5cbiAgICBjb25zdCB0cmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnZGlyZWN0aXZlJywgb3B0aW9ucywgYXBwVHJlZSk7XG4gICAgY29uc3QgYXBwTW9kdWxlQ29udGVudCA9IHRyZWUucmVhZENvbnRlbnQoJy9wcm9qZWN0cy9iYXIvc3JjL2FwcC9hcHAubW9kdWxlLnRzJyk7XG4gICAgZXhwZWN0KGFwcE1vZHVsZUNvbnRlbnQpLnRvTWF0Y2goL2V4cG9ydHM6IFxcW0Zvb0RpcmVjdGl2ZVxcXS8pO1xuICB9KTtcblxuICBpdCgnc2hvdWxkIGltcG9ydCBpbnRvIGEgc3BlY2lmaWVkIG1vZHVsZScsICgpID0+IHtcbiAgICBjb25zdCBvcHRpb25zID0geyAuLi5kZWZhdWx0T3B0aW9ucywgbW9kdWxlOiAnYXBwLm1vZHVsZS50cycgfTtcblxuICAgIGNvbnN0IHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdkaXJlY3RpdmUnLCBvcHRpb25zLCBhcHBUcmVlKTtcbiAgICBjb25zdCBhcHBNb2R1bGUgPSB0cmVlLnJlYWRDb250ZW50KCcvcHJvamVjdHMvYmFyL3NyYy9hcHAvYXBwLm1vZHVsZS50cycpO1xuXG4gICAgZXhwZWN0KGFwcE1vZHVsZSkudG9NYXRjaCgvaW1wb3J0IHsgRm9vRGlyZWN0aXZlIH0gZnJvbSAnLlxcL2Zvby5kaXJlY3RpdmUnLyk7XG4gIH0pO1xuXG4gIGl0KCdzaG91bGQgZmFpbCBpZiBzcGVjaWZpZWQgbW9kdWxlIGRvZXMgbm90IGV4aXN0JywgKCkgPT4ge1xuICAgIGNvbnN0IG9wdGlvbnMgPSB7IC4uLmRlZmF1bHRPcHRpb25zLCBtb2R1bGU6ICcvcHJvamVjdHMvYmFyL3NyYy9hcHAvYXBwLm1vZHVsZVhYWC50cycgfTtcbiAgICBsZXQgdGhyb3duRXJyb3I6IEVycm9yIHwgbnVsbCA9IG51bGw7XG4gICAgdHJ5IHtcbiAgICAgIHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ2RpcmVjdGl2ZScsIG9wdGlvbnMsIGFwcFRyZWUpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgdGhyb3duRXJyb3IgPSBlcnI7XG4gICAgfVxuICAgIGV4cGVjdCh0aHJvd25FcnJvcikudG9CZURlZmluZWQoKTtcbiAgfSk7XG5cbiAgaXQoJ3Nob3VsZCBjb252ZXJ0cyBkYXNoLWNhc2VkLW5hbWUgdG8gYSBjYW1lbENhc2VkU2VsZWN0b3InLCAoKSA9PiB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHsgLi4uZGVmYXVsdE9wdGlvbnMsIG5hbWU6ICdteS1kaXInIH07XG5cbiAgICBjb25zdCB0cmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnZGlyZWN0aXZlJywgb3B0aW9ucywgYXBwVHJlZSk7XG4gICAgY29uc3QgY29udGVudCA9IHRyZWUucmVhZENvbnRlbnQoJy9wcm9qZWN0cy9iYXIvc3JjL2FwcC9teS1kaXIuZGlyZWN0aXZlLnRzJyk7XG4gICAgZXhwZWN0KGNvbnRlbnQpLnRvTWF0Y2goL3NlbGVjdG9yOiAnXFxbYXBwTXlEaXJcXF0nLyk7XG4gIH0pO1xuXG4gIGl0KCdzaG91bGQgY3JlYXRlIHRoZSByaWdodCBzZWxlY3RvciB3aXRoIGEgcGF0aCBpbiB0aGUgbmFtZScsICgpID0+IHtcbiAgICBjb25zdCBvcHRpb25zID0geyAuLi5kZWZhdWx0T3B0aW9ucywgbmFtZTogJ3N1Yi90ZXN0JyB9O1xuICAgIGFwcFRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdkaXJlY3RpdmUnLCBvcHRpb25zLCBhcHBUcmVlKTtcblxuICAgIGNvbnN0IGNvbnRlbnQgPSBhcHBUcmVlLnJlYWRDb250ZW50KCcvcHJvamVjdHMvYmFyL3NyYy9hcHAvc3ViL3Rlc3QuZGlyZWN0aXZlLnRzJyk7XG4gICAgZXhwZWN0KGNvbnRlbnQpLnRvTWF0Y2goL3NlbGVjdG9yOiAnXFxbYXBwVGVzdFxcXScvKTtcbiAgfSk7XG5cbiAgaXQoJ3Nob3VsZCB1c2UgdGhlIHByZWZpeCcsICgpID0+IHtcbiAgICBjb25zdCBvcHRpb25zID0geyAuLi5kZWZhdWx0T3B0aW9ucywgcHJlZml4OiAncHJlJyB9O1xuICAgIGNvbnN0IHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdkaXJlY3RpdmUnLCBvcHRpb25zLCBhcHBUcmVlKTtcblxuICAgIGNvbnN0IGNvbnRlbnQgPSB0cmVlLnJlYWRDb250ZW50KCcvcHJvamVjdHMvYmFyL3NyYy9hcHAvZm9vLmRpcmVjdGl2ZS50cycpO1xuICAgIGV4cGVjdChjb250ZW50KS50b01hdGNoKC9zZWxlY3RvcjogJ1xcW3ByZUZvb1xcXScvKTtcbiAgfSk7XG5cbiAgaXQoJ3Nob3VsZCB1c2UgdGhlIGRlZmF1bHQgcHJvamVjdCBwcmVmaXggaWYgbm9uZSBpcyBwYXNzZWQnLCAoKSA9PiB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHsgLi4uZGVmYXVsdE9wdGlvbnMsIHByZWZpeDogdW5kZWZpbmVkIH07XG4gICAgY29uc3QgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ2RpcmVjdGl2ZScsIG9wdGlvbnMsIGFwcFRyZWUpO1xuXG4gICAgY29uc3QgY29udGVudCA9IHRyZWUucmVhZENvbnRlbnQoJy9wcm9qZWN0cy9iYXIvc3JjL2FwcC9mb28uZGlyZWN0aXZlLnRzJyk7XG4gICAgZXhwZWN0KGNvbnRlbnQpLnRvTWF0Y2goL3NlbGVjdG9yOiAnXFxbYXBwRm9vXFxdJy8pO1xuICB9KTtcblxuICBpdCgnc2hvdWxkIHVzZSB0aGUgc3VwcGxpZWQgcHJlZml4IGlmIGl0IGlzIFwiXCInLCAoKSA9PiB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHsgLi4uZGVmYXVsdE9wdGlvbnMsIHByZWZpeDogJycgfTtcbiAgICBjb25zdCB0cmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnZGlyZWN0aXZlJywgb3B0aW9ucywgYXBwVHJlZSk7XG5cbiAgICBjb25zdCBjb250ZW50ID0gdHJlZS5yZWFkQ29udGVudCgnL3Byb2plY3RzL2Jhci9zcmMvYXBwL2Zvby5kaXJlY3RpdmUudHMnKTtcbiAgICBleHBlY3QoY29udGVudCkudG9NYXRjaCgvc2VsZWN0b3I6ICdcXFtmb29cXF0nLyk7XG4gIH0pO1xuXG4gIGl0KCdzaG91bGQgcmVzcGVjdCB0aGUgc291cmNlUm9vdCB2YWx1ZScsICgpID0+IHtcbiAgICBjb25zdCBjb25maWcgPSBKU09OLnBhcnNlKGFwcFRyZWUucmVhZENvbnRlbnQoJy9hbmd1bGFyLmpzb24nKSk7XG4gICAgY29uZmlnLnByb2plY3RzLmJhci5zb3VyY2VSb290ID0gJ3Byb2plY3RzL2Jhci9jdXN0b20nO1xuICAgIGFwcFRyZWUub3ZlcndyaXRlKCcvYW5ndWxhci5qc29uJywgSlNPTi5zdHJpbmdpZnkoY29uZmlnLCBudWxsLCAyKSk7XG5cbiAgICAvLyBzaG91bGQgZmFpbCB3aXRob3V0IGEgbW9kdWxlIGluIHRoYXQgZGlyXG4gICAgZXhwZWN0KCgpID0+IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ2RpcmVjdGl2ZScsIGRlZmF1bHRPcHRpb25zLCBhcHBUcmVlKSkudG9UaHJvdygpO1xuXG4gICAgLy8gbW92ZSB0aGUgbW9kdWxlXG4gICAgYXBwVHJlZS5yZW5hbWUoJy9wcm9qZWN0cy9iYXIvc3JjL2FwcC9hcHAubW9kdWxlLnRzJywgJy9wcm9qZWN0cy9iYXIvY3VzdG9tL2FwcC9hcHAubW9kdWxlLnRzJyk7XG4gICAgYXBwVHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ2RpcmVjdGl2ZScsIGRlZmF1bHRPcHRpb25zLCBhcHBUcmVlKTtcbiAgICBleHBlY3QoYXBwVHJlZS5maWxlcy5pbmRleE9mKCcvcHJvamVjdHMvYmFyL2N1c3RvbS9hcHAvZm9vLmRpcmVjdGl2ZS50cycpKVxuICAgICAgLnRvQmVHcmVhdGVyVGhhbk9yRXF1YWwoMCk7XG4gIH0pO1xufSk7XG4iXX0=