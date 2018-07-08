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
describe('Application Schematic', () => {
    const schematicRunner = new testing_1.SchematicTestRunner('@schematics/angular', path.join(__dirname, '../collection.json'));
    const workspaceOptions = {
        name: 'workspace',
        newProjectRoot: 'projects',
        version: '6.0.0',
    };
    const defaultOptions = {
        name: 'foo',
        relatedAppName: 'app',
    };
    let workspaceTree;
    beforeEach(() => {
        workspaceTree = schematicRunner.runSchematic('workspace', workspaceOptions);
    });
    it('should create all files of an e2e application', () => {
        const tree = schematicRunner.runSchematic('e2e', defaultOptions, workspaceTree);
        const files = tree.files;
        expect(files.indexOf('/projects/foo/protractor.conf.js')).toBeGreaterThanOrEqual(0);
        expect(files.indexOf('/projects/foo/tsconfig.e2e.json')).toBeGreaterThanOrEqual(0);
        expect(files.indexOf('/projects/foo/src/app.e2e-spec.ts')).toBeGreaterThanOrEqual(0);
        expect(files.indexOf('/projects/foo/src/app.po.ts')).toBeGreaterThanOrEqual(0);
    });
    it('should create all files of an e2e application', () => {
        const options = Object.assign({}, defaultOptions, { projectRoot: 'e2e' });
        const tree = schematicRunner.runSchematic('e2e', options, workspaceTree);
        const files = tree.files;
        expect(files.indexOf('/projects/foo/protractor.conf.js')).toEqual(-1);
        expect(files.indexOf('/e2e/protractor.conf.js')).toBeGreaterThanOrEqual(0);
    });
    it('should set the rootSelector in the app.po.ts', () => {
        const tree = schematicRunner.runSchematic('e2e', defaultOptions, workspaceTree);
        const content = tree.readContent('/projects/foo/src/app.po.ts');
        expect(content).toMatch(/app\-root/);
    });
    it('should set the rootSelector in the app.po.ts from the option', () => {
        const options = Object.assign({}, defaultOptions, { rootSelector: 't-a-c-o' });
        const tree = schematicRunner.runSchematic('e2e', options, workspaceTree);
        const content = tree.readContent('/projects/foo/src/app.po.ts');
        expect(content).toMatch(/t\-a\-c\-o/);
    });
    it('should set the rootSelector in the app.po.ts from the option with emoji', () => {
        const options = Object.assign({}, defaultOptions, { rootSelector: '🌮-🌯' });
        const tree = schematicRunner.runSchematic('e2e', options, workspaceTree);
        const content = tree.readContent('/projects/foo/src/app.po.ts');
        expect(content).toMatch(/🌮-🌯/);
    });
    describe('workspace config', () => {
        it('should create the e2e app', () => {
            const tree = schematicRunner.runSchematic('e2e', defaultOptions, workspaceTree);
            const workspace = JSON.parse(tree.readContent('/angular.json'));
            expect(workspace.projects.foo).toBeDefined();
        });
        it('should set 2 targets for the app', () => {
            const tree = schematicRunner.runSchematic('e2e', defaultOptions, workspaceTree);
            const workspace = JSON.parse(tree.readContent('/angular.json'));
            const architect = workspace.projects.foo.architect;
            expect(Object.keys(architect)).toEqual(['e2e', 'lint']);
        });
        it('should set the e2e options', () => {
            const tree = schematicRunner.runSchematic('e2e', defaultOptions, workspaceTree);
            const workspace = JSON.parse(tree.readContent('/angular.json'));
            const e2eOptions = workspace.projects.foo.architect.e2e.options;
            expect(e2eOptions.protractorConfig).toEqual('projects/foo/protractor.conf.js');
            expect(e2eOptions.devServerTarget).toEqual('app:serve');
        });
        it('should set the lint options', () => {
            const tree = schematicRunner.runSchematic('e2e', defaultOptions, workspaceTree);
            const workspace = JSON.parse(tree.readContent('/angular.json'));
            const lintOptions = workspace.projects.foo.architect.lint.options;
            expect(lintOptions.tsConfig).toEqual('projects/foo/tsconfig.e2e.json');
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXhfc3BlYy5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvYm9iby9Xb3JrL2dpdGh1Yi9zaGFyay1zY2hlbWF0aWNzL3NyYy8iLCJzb3VyY2VzIjpbInNyYy9lMmUvaW5kZXhfc3BlYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7R0FNRztBQUNILGdFQUF1RjtBQUN2Riw2QkFBNkI7QUFJN0IsaUNBQWlDO0FBQ2pDLFFBQVEsQ0FBQyx1QkFBdUIsRUFBRSxHQUFHLEVBQUU7SUFDckMsTUFBTSxlQUFlLEdBQUcsSUFBSSw2QkFBbUIsQ0FDN0MscUJBQXFCLEVBQ3JCLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLG9CQUFvQixDQUFDLENBQzNDLENBQUM7SUFFRixNQUFNLGdCQUFnQixHQUFxQjtRQUN6QyxJQUFJLEVBQUUsV0FBVztRQUNqQixjQUFjLEVBQUUsVUFBVTtRQUMxQixPQUFPLEVBQUUsT0FBTztLQUNqQixDQUFDO0lBRUYsTUFBTSxjQUFjLEdBQWU7UUFDakMsSUFBSSxFQUFFLEtBQUs7UUFDWCxjQUFjLEVBQUUsS0FBSztLQUN0QixDQUFDO0lBRUYsSUFBSSxhQUEyQixDQUFDO0lBQ2hDLFVBQVUsQ0FBQyxHQUFHLEVBQUU7UUFDZCxhQUFhLEdBQUcsZUFBZSxDQUFDLFlBQVksQ0FBQyxXQUFXLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztJQUM5RSxDQUFDLENBQUMsQ0FBQztJQUVILEVBQUUsQ0FBQywrQ0FBK0MsRUFBRSxHQUFHLEVBQUU7UUFDdkQsTUFBTSxJQUFJLEdBQUcsZUFBZSxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsY0FBYyxFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBQ2hGLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7UUFDekIsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsa0NBQWtDLENBQUMsQ0FBQyxDQUFDLHNCQUFzQixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3BGLE1B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QyxNQUFNLElBQUksR0FBRyxlQUFlLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRSxjQUFjLEVBQUUsYUFBYSxDQUFDLENBQUM7WUFDaEYsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7WUFDaEUsTUFBTSxXQUFXLEdBQUcsU0FBUyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7WUFDbEUsTUFBTSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxPQUFPLENBQUMsZ0NBQWdDLENBQUMsQ0FBQztRQUN6RSxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQgeyBTY2hlbWF0aWNUZXN0UnVubmVyLCBVbml0VGVzdFRyZWUgfSBmcm9tICdAYW5ndWxhci1kZXZraXQvc2NoZW1hdGljcy90ZXN0aW5nJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBTY2hlbWEgYXMgV29ya3NwYWNlT3B0aW9ucyB9IGZyb20gJy4uL3dvcmtzcGFjZS9zY2hlbWEnO1xuaW1wb3J0IHsgU2NoZW1hIGFzIEUyZU9wdGlvbnMgfSBmcm9tICcuL3NjaGVtYSc7XG5cbi8vIHRzbGludDpkaXNhYmxlOm1heC1saW5lLWxlbmd0aFxuZGVzY3JpYmUoJ0FwcGxpY2F0aW9uIFNjaGVtYXRpYycsICgpID0+IHtcbiAgY29uc3Qgc2NoZW1hdGljUnVubmVyID0gbmV3IFNjaGVtYXRpY1Rlc3RSdW5uZXIoXG4gICAgJ0BzY2hlbWF0aWNzL2FuZ3VsYXInLFxuICAgIHBhdGguam9pbihfX2Rpcm5hbWUsICcuLi9jb2xsZWN0aW9uLmpzb24nKSxcbiAgKTtcblxuICBjb25zdCB3b3Jrc3BhY2VPcHRpb25zOiBXb3Jrc3BhY2VPcHRpb25zID0ge1xuICAgIG5hbWU6ICd3b3Jrc3BhY2UnLFxuICAgIG5ld1Byb2plY3RSb290OiAncHJvamVjdHMnLFxuICAgIHZlcnNpb246ICc2LjAuMCcsXG4gIH07XG5cbiAgY29uc3QgZGVmYXVsdE9wdGlvbnM6IEUyZU9wdGlvbnMgPSB7XG4gICAgbmFtZTogJ2ZvbycsXG4gICAgcmVsYXRlZEFwcE5hbWU6ICdhcHAnLFxuICB9O1xuXG4gIGxldCB3b3Jrc3BhY2VUcmVlOiBVbml0VGVzdFRyZWU7XG4gIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgIHdvcmtzcGFjZVRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCd3b3Jrc3BhY2UnLCB3b3Jrc3BhY2VPcHRpb25zKTtcbiAgfSk7XG5cbiAgaXQoJ3Nob3VsZCBjcmVhdGUgYWxsIGZpbGVzIG9mIGFuIGUyZSBhcHBsaWNhdGlvbicsICgpID0+IHtcbiAgICBjb25zdCB0cmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnZTJlJywgZGVmYXVsdE9wdGlvbnMsIHdvcmtzcGFjZVRyZWUpO1xuICAgIGNvbnN0IGZpbGVzID0gdHJlZS5maWxlcztcbiAgICBleHBlY3QoZmlsZXMuaW5kZXhPZignL3Byb2plY3RzL2Zvby9wcm90cmFjdG9yLmNvbmYuanMnKSkudG9CZUdyZWF0ZXJUaGFuT3JFcXVhbCgwKTtcbiAgICBleHBlY3QoZmlsZXMuaW5kZXhPZignL3Byb2plY3RzL2Zvby90c2NvbmZpZy5lMmUuanNvbicpKS50b0JlR3JlYXRlclRoYW5PckVxdWFsKDApO1xuICAgIGV4cGVjdChmaWxlcy5pbmRleE9mKCcvcHJvamVjdHMvZm9vL3NyYy9hcHAuZTJlLXNwZWMudHMnKSkudG9CZUdyZWF0ZXJUaGFuT3JFcXVhbCgwKTtcbiAgICBleHBlY3QoZmlsZXMuaW5kZXhPZignL3Byb2plY3RzL2Zvby9zcmMvYXBwLnBvLnRzJykpLnRvQmVHcmVhdGVyVGhhbk9yRXF1YWwoMCk7XG4gIH0pO1xuXG4gIGl0KCdzaG91bGQgY3JlYXRlIGFsbCBmaWxlcyBvZiBhbiBlMmUgYXBwbGljYXRpb24nLCAoKSA9PiB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHsuLi5kZWZhdWx0T3B0aW9ucywgcHJvamVjdFJvb3Q6ICdlMmUnfTtcbiAgICBjb25zdCB0cmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnZTJlJywgb3B0aW9ucywgd29ya3NwYWNlVHJlZSk7XG4gICAgY29uc3QgZmlsZXMgPSB0cmVlLmZpbGVzO1xuICAgIGV4cGVjdChmaWxlcy5pbmRleE9mKCcvcHJvamVjdHMvZm9vL3Byb3RyYWN0b3IuY29uZi5qcycpKS50b0VxdWFsKC0xKTtcbiAgICBleHBlY3QoZmlsZXMuaW5kZXhPZignL2UyZS9wcm90cmFjdG9yLmNvbmYuanMnKSkudG9CZUdyZWF0ZXJUaGFuT3JFcXVhbCgwKTtcbiAgfSk7XG5cbiAgaXQoJ3Nob3VsZCBzZXQgdGhlIHJvb3RTZWxlY3RvciBpbiB0aGUgYXBwLnBvLnRzJywgKCkgPT4ge1xuICAgIGNvbnN0IHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdlMmUnLCBkZWZhdWx0T3B0aW9ucywgd29ya3NwYWNlVHJlZSk7XG4gICAgY29uc3QgY29udGVudCA9IHRyZWUucmVhZENvbnRlbnQoJy9wcm9qZWN0cy9mb28vc3JjL2FwcC5wby50cycpO1xuICAgIGV4cGVjdChjb250ZW50KS50b01hdGNoKC9hcHBcXC1yb290Lyk7XG4gIH0pO1xuXG4gIGl0KCdzaG91bGQgc2V0IHRoZSByb290U2VsZWN0b3IgaW4gdGhlIGFwcC5wby50cyBmcm9tIHRoZSBvcHRpb24nLCAoKSA9PiB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHsuLi5kZWZhdWx0T3B0aW9ucywgcm9vdFNlbGVjdG9yOiAndC1hLWMtbyd9O1xuICAgIGNvbnN0IHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdlMmUnLCBvcHRpb25zLCB3b3Jrc3BhY2VUcmVlKTtcbiAgICBjb25zdCBjb250ZW50ID0gdHJlZS5yZWFkQ29udGVudCgnL3Byb2plY3RzL2Zvby9zcmMvYXBwLnBvLnRzJyk7XG4gICAgZXhwZWN0KGNvbnRlbnQpLnRvTWF0Y2goL3RcXC1hXFwtY1xcLW8vKTtcbiAgfSk7XG5cbiAgaXQoJ3Nob3VsZCBzZXQgdGhlIHJvb3RTZWxlY3RvciBpbiB0aGUgYXBwLnBvLnRzIGZyb20gdGhlIG9wdGlvbiB3aXRoIGVtb2ppJywgKCkgPT4ge1xuICAgIGNvbnN0IG9wdGlvbnMgPSB7Li4uZGVmYXVsdE9wdGlvbnMsIHJvb3RTZWxlY3RvcjogJ/CfjK4t8J+Mryd9O1xuICAgIGNvbnN0IHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdlMmUnLCBvcHRpb25zLCB3b3Jrc3BhY2VUcmVlKTtcbiAgICBjb25zdCBjb250ZW50ID0gdHJlZS5yZWFkQ29udGVudCgnL3Byb2plY3RzL2Zvby9zcmMvYXBwLnBvLnRzJyk7XG4gICAgZXhwZWN0KGNvbnRlbnQpLnRvTWF0Y2goL/CfjK4t8J+Mry8pO1xuICB9KTtcblxuICBkZXNjcmliZSgnd29ya3NwYWNlIGNvbmZpZycsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIGNyZWF0ZSB0aGUgZTJlIGFwcCcsICgpID0+IHtcbiAgICAgIGNvbnN0IHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdlMmUnLCBkZWZhdWx0T3B0aW9ucywgd29ya3NwYWNlVHJlZSk7XG4gICAgICBjb25zdCB3b3Jrc3BhY2UgPSBKU09OLnBhcnNlKHRyZWUucmVhZENvbnRlbnQoJy9hbmd1bGFyLmpzb24nKSk7XG4gICAgICBleHBlY3Qod29ya3NwYWNlLnByb2plY3RzLmZvbykudG9CZURlZmluZWQoKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgc2V0IDIgdGFyZ2V0cyBmb3IgdGhlIGFwcCcsICgpID0+IHtcbiAgICAgIGNvbnN0IHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdlMmUnLCBkZWZhdWx0T3B0aW9ucywgd29ya3NwYWNlVHJlZSk7XG4gICAgICBjb25zdCB3b3Jrc3BhY2UgPSBKU09OLnBhcnNlKHRyZWUucmVhZENvbnRlbnQoJy9hbmd1bGFyLmpzb24nKSk7XG4gICAgICBjb25zdCBhcmNoaXRlY3QgPSB3b3Jrc3BhY2UucHJvamVjdHMuZm9vLmFyY2hpdGVjdDtcbiAgICAgIGV4cGVjdChPYmplY3Qua2V5cyhhcmNoaXRlY3QpKS50b0VxdWFsKFsnZTJlJywgJ2xpbnQnXSk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIHNldCB0aGUgZTJlIG9wdGlvbnMnLCAoKSA9PiB7XG4gICAgICBjb25zdCB0cmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnZTJlJywgZGVmYXVsdE9wdGlvbnMsIHdvcmtzcGFjZVRyZWUpO1xuICAgICAgY29uc3Qgd29ya3NwYWNlID0gSlNPTi5wYXJzZSh0cmVlLnJlYWRDb250ZW50KCcvYW5ndWxhci5qc29uJykpO1xuICAgICAgY29uc3QgZTJlT3B0aW9ucyA9IHdvcmtzcGFjZS5wcm9qZWN0cy5mb28uYXJjaGl0ZWN0LmUyZS5vcHRpb25zO1xuICAgICAgZXhwZWN0KGUyZU9wdGlvbnMucHJvdHJhY3RvckNvbmZpZykudG9FcXVhbCgncHJvamVjdHMvZm9vL3Byb3RyYWN0b3IuY29uZi5qcycpO1xuICAgICAgZXhwZWN0KGUyZU9wdGlvbnMuZGV2U2VydmVyVGFyZ2V0KS50b0VxdWFsKCdhcHA6c2VydmUnKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgc2V0IHRoZSBsaW50IG9wdGlvbnMnLCAoKSA9PiB7XG4gICAgICBjb25zdCB0cmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnZTJlJywgZGVmYXVsdE9wdGlvbnMsIHdvcmtzcGFjZVRyZWUpO1xuICAgICAgY29uc3Qgd29ya3NwYWNlID0gSlNPTi5wYXJzZSh0cmVlLnJlYWRDb250ZW50KCcvYW5ndWxhci5qc29uJykpO1xuICAgICAgY29uc3QgbGludE9wdGlvbnMgPSB3b3Jrc3BhY2UucHJvamVjdHMuZm9vLmFyY2hpdGVjdC5saW50Lm9wdGlvbnM7XG4gICAgICBleHBlY3QobGludE9wdGlvbnMudHNDb25maWcpLnRvRXF1YWwoJ3Byb2plY3RzL2Zvby90c2NvbmZpZy5lMmUuanNvbicpO1xuICAgIH0pO1xuICB9KTtcbn0pO1xuIl19