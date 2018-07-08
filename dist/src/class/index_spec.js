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
describe('Class Schematic', () => {
    const schematicRunner = new testing_1.SchematicTestRunner('@schematics/angular', path.join(__dirname, '../collection.json'));
    const defaultOptions = {
        name: 'foo',
        type: '',
        spec: false,
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
    it('should create just the class file', () => {
        const tree = schematicRunner.runSchematic('class', defaultOptions, appTree);
        expect(tree.files.indexOf('/projects/bar/src/app/foo.ts')).toBeGreaterThanOrEqual(0);
        expect(tree.files.indexOf('/projects/bar/src/app/foo.spec.ts')).toBeLessThan(0);
    });
    it('should create the class and spec file', () => {
        const options = Object.assign({}, defaultOptions, { spec: true });
        const tree = schematicRunner.runSchematic('class', options, appTree);
        expect(tree.files.indexOf('/projects/bar/src/app/foo.ts')).toBeGreaterThanOrEqual(0);
        expect(tree.files.indexOf('/projects/bar/src/app/foo.spec.ts')).toBeGreaterThanOrEqual(0);
    });
    it('should create an class named "Foo"', () => {
        const tree = schematicRunner.runSchematic('class', defaultOptions, appTree);
        const fileContent = tree.readContent('/projects/bar/src/app/foo.ts');
        expect(fileContent).toMatch(/export class Foo/);
    });
    it('should put type in the file name', () => {
        const options = Object.assign({}, defaultOptions, { type: 'model' });
        const tree = schematicRunner.runSchematic('class', options, appTree);
        expect(tree.files.indexOf('/projects/bar/src/app/foo.model.ts')).toBeGreaterThanOrEqual(0);
    });
    it('should split the name to name & type with split on "."', () => {
        const options = Object.assign({}, defaultOptions, { name: 'foo.model' });
        const tree = schematicRunner.runSchematic('class', options, appTree);
        const classPath = '/projects/bar/src/app/foo.model.ts';
        const content = tree.readContent(classPath);
        expect(content).toMatch(/export class Foo/);
    });
    it('should respect the path option', () => {
        const options = Object.assign({}, defaultOptions, { path: 'zzz' });
        const tree = schematicRunner.runSchematic('class', options, appTree);
        expect(tree.files.indexOf('/zzz/foo.ts')).toBeGreaterThanOrEqual(0);
    });
    it('should respect the sourceRoot value', () => {
        const config = JSON.parse(appTree.readContent('/angular.json'));
        config.projects.bar.sourceRoot = 'projects/bar/custom';
        appTree.overwrite('/angular.json', JSON.stringify(config, null, 2));
        appTree = schematicRunner.runSchematic('class', defaultOptions, appTree);
        expect(appTree.files.indexOf('/projects/bar/custom/app/foo.ts')).toBeGreaterThanOrEqual(0);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXhfc3BlYy5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvYm9iby9Xb3JrL2dpdGh1Yi9zaGFyay1zY2hlbWF0aWNzL3NyYy8iLCJzb3VyY2VzIjpbInNyYy9jbGFzcy9pbmRleF9zcGVjLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7OztHQU1HO0FBQ0gsZ0VBQXVGO0FBQ3ZGLDZCQUE2QjtBQU03QixRQUFRLENBQUMsaUJBQWlCLEVBQUUsR0FBRyxFQUFFO0lBQy9CLE1BQU0sZUFBZSxHQUFHLElBQUksNkJBQW1CLENBQzdDLHFCQUFxQixFQUNyQixJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxvQkFBb0IsQ0FBQyxDQUMzQyxDQUFDO0lBQ0YsTUFBTSxjQUFjLEdBQWlCO1FBQ25DLElBQUksRUFBRSxLQUFLO1FBQ1gsSUFBSSxFQUFFLEVBQUU7UUFDUixJQUFJLEVBQUUsS0FBSztRQUNYLE9BQU8sRUFBRSxLQUFLO0tBQ2YsQ0FBQztJQUdGLE1BQU0sZ0JBQWdCLEdBQXFCO1FBQ3pDLElBQUksRUFBRSxXQUFXO1FBQ2pCLGNBQWMsRUFBRSxVQUFVO1FBQzFCLE9BQU8sRUFBRSxPQUFPO0tBQ2pCLENBQUM7SUFFRixNQUFNLFVBQVUsR0FBdUI7UUFDckMsSUFBSSxFQUFFLEtBQUs7UUFDWCxXQUFXLEVBQUUsS0FBSztRQUNsQixjQUFjLEVBQUUsS0FBSztRQUNyQixPQUFPLEVBQUUsS0FBSztRQUNkLEtBQUssRUFBRSxLQUFLO1FBQ1osU0FBUyxFQUFFLEtBQUs7UUFDaEIsZUFBZSxFQUFFLEtBQUs7S0FDdkIsQ0FBQztJQUNGLElBQUksT0FBcUIsQ0FBQztJQUMxQixVQUFVLENBQUMsR0FBRyxFQUFFO1FBQ2QsT0FBTyxHQUFHLGVBQWUsQ0FBQyxZQUFZLENBQUMsV0FBVyxFQUFFLGdCQUFnQixDQUFDLENBQUM7UUFDdEUsT0FBTyxHQUFHLGVBQWUsQ0FBQyxZQUFZLENBQUMsYUFBYSxFQUFFLFVBQVUsRUFBRSxPQUFPLENB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QyxLQUFLLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDdEUsQ0FBQyxDQUFDLENBQUM7SUFFSCxFQUFFLENBQUMscUNBQXFDLEVBQUUsR0FBRyxFQUFFO1FBQzdDLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO1FBQ2hFLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFVBQVUsR0FBRyxxQkFBcUIsQ0FBQztRQUN2RCxPQUFPLENBQUMsU0FBUyxDQUFDLGVBQWUsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNwRSxPQUFPLEdBQUcsZUFBZSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsY0FBYyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3pFLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDN0YsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7IFNjaGVtYXRpY1Rlc3RSdW5uZXIsIFVuaXRUZXN0VHJlZSB9IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9zY2hlbWF0aWNzL3Rlc3RpbmcnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IFNjaGVtYSBhcyBBcHBsaWNhdGlvbk9wdGlvbnMgfSBmcm9tICcuLi9hcHBsaWNhdGlvbi9zY2hlbWEnO1xuaW1wb3J0IHsgU2NoZW1hIGFzIFdvcmtzcGFjZU9wdGlvbnMgfSBmcm9tICcuLi93b3Jrc3BhY2Uvc2NoZW1hJztcbmltcG9ydCB7IFNjaGVtYSBhcyBDbGFzc09wdGlvbnMgfSBmcm9tICcuL3NjaGVtYSc7XG5cblxuZGVzY3JpYmUoJ0NsYXNzIFNjaGVtYXRpYycsICgpID0+IHtcbiAgY29uc3Qgc2NoZW1hdGljUnVubmVyID0gbmV3IFNjaGVtYXRpY1Rlc3RSdW5uZXIoXG4gICAgJ0BzY2hlbWF0aWNzL2FuZ3VsYXInLFxuICAgIHBhdGguam9pbihfX2Rpcm5hbWUsICcuLi9jb2xsZWN0aW9uLmpzb24nKSxcbiAgKTtcbiAgY29uc3QgZGVmYXVsdE9wdGlvbnM6IENsYXNzT3B0aW9ucyA9IHtcbiAgICBuYW1lOiAnZm9vJyxcbiAgICB0eXBlOiAnJyxcbiAgICBzcGVjOiBmYWxzZSxcbiAgICBwcm9qZWN0OiAnYmFyJyxcbiAgfTtcblxuXG4gIGNvbnN0IHdvcmtzcGFjZU9wdGlvbnM6IFdvcmtzcGFjZU9wdGlvbnMgPSB7XG4gICAgbmFtZTogJ3dvcmtzcGFjZScsXG4gICAgbmV3UHJvamVjdFJvb3Q6ICdwcm9qZWN0cycsXG4gICAgdmVyc2lvbjogJzYuMC4wJyxcbiAgfTtcblxuICBjb25zdCBhcHBPcHRpb25zOiBBcHBsaWNhdGlvbk9wdGlvbnMgPSB7XG4gICAgbmFtZTogJ2JhcicsXG4gICAgaW5saW5lU3R5bGU6IGZhbHNlLFxuICAgIGlubGluZVRlbXBsYXRlOiBmYWxzZSxcbiAgICByb3V0aW5nOiBmYWxzZSxcbiAgICBzdHlsZTogJ2NzcycsXG4gICAgc2tpcFRlc3RzOiBmYWxzZSxcbiAgICBza2lwUGFja2FnZUpzb246IGZhbHNlLFxuICB9O1xuICBsZXQgYXBwVHJlZTogVW5pdFRlc3RUcmVlO1xuICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICBhcHBUcmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnd29ya3NwYWNlJywgd29ya3NwYWNlT3B0aW9ucyk7XG4gICAgYXBwVHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ2FwcGxpY2F0aW9uJywgYXBwT3B0aW9ucywgYXBwVHJlZSk7XG4gIH0pO1xuXG4gIGl0KCdzaG91bGQgY3JlYXRlIGp1c3QgdGhlIGNsYXNzIGZpbGUnLCAoKSA9PiB7XG4gICAgY29uc3QgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ2NsYXNzJywgZGVmYXVsdE9wdGlvbnMsIGFwcFRyZWUpO1xuICAgIGV4cGVjdCh0cmVlLmZpbGVzLmluZGV4T2YoJy9wcm9qZWN0cy9iYXIvc3JjL2FwcC9mb28udHMnKSkudG9CZUdyZWF0ZXJUaGFuT3JFcXVhbCgwKTtcbiAgICBleHBlY3QodHJlZS5maWxlcy5pbmRleE9mKCcvcHJvamVjdHMvYmFyL3NyYy9hcHAvZm9vLnNwZWMudHMnKSkudG9CZUxlc3NUaGFuKDApO1xuICB9KTtcblxuICBpdCgnc2hvdWxkIGNyZWF0ZSB0aGUgY2xhc3MgYW5kIHNwZWMgZmlsZScsICgpID0+IHtcbiAgICBjb25zdCBvcHRpb25zID0ge1xuICAgICAgLi4uZGVmYXVsdE9wdGlvbnMsXG4gICAgICBzcGVjOiB0cnVlLFxuICAgIH07XG4gICAgY29uc3QgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ2NsYXNzJywgb3B0aW9ucywgYXBwVHJlZSk7XG4gICAgZXhwZWN0KHRyZWUuZmlsZXMuaW5kZXhPZignL3Byb2plY3RzL2Jhci9zcmMvYXBwL2Zvby50cycpKS50b0JlR3JlYXRlclRoYW5PckVxdWFsKDApO1xuICAgIGV4cGVjdCh0cmVlLmZpbGVzLmluZGV4T2YoJy9wcm9qZWN0cy9iYXIvc3JjL2FwcC9mb28uc3BlYy50cycpKS50b0JlR3JlYXRlclRoYW5PckVxdWFsKDApO1xuICB9KTtcblxuICBpdCgnc2hvdWxkIGNyZWF0ZSBhbiBjbGFzcyBuYW1lZCBcIkZvb1wiJywgKCkgPT4ge1xuICAgIGNvbnN0IHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdjbGFzcycsIGRlZmF1bHRPcHRpb25zLCBhcHBUcmVlKTtcbiAgICBjb25zdCBmaWxlQ29udGVudCA9IHRyZWUucmVhZENvbnRlbnQoJy9wcm9qZWN0cy9iYXIvc3JjL2FwcC9mb28udHMnKTtcbiAgICBleHBlY3QoZmlsZUNvbnRlbnQpLnRvTWF0Y2goL2V4cG9ydCBjbGFzcyBGb28vKTtcbiAgfSk7XG5cbiAgaXQoJ3Nob3VsZCBwdXQgdHlwZSBpbiB0aGUgZmlsZSBuYW1lJywgKCkgPT4ge1xuICAgIGNvbnN0IG9wdGlvbnMgPSB7IC4uLmRlZmF1bHRPcHRpb25zLCB0eXBlOiAnbW9kZWwnIH07XG5cbiAgICBjb25zdCB0cmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnY2xhc3MnLCBvcHRpb25zLCBhcHBUcmVlKTtcbiAgICBleHBlY3QodHJlZS5maWxlcy5pbmRleE9mKCcvcHJvamVjdHMvYmFyL3NyYy9hcHAvZm9vLm1vZGVsLnRzJykpLnRvQmVHcmVhdGVyVGhhbk9yRXF1YWwoMCk7XG4gIH0pO1xuXG4gIGl0KCdzaG91bGQgc3BsaXQgdGhlIG5hbWUgdG8gbmFtZSAmIHR5cGUgd2l0aCBzcGxpdCBvbiBcIi5cIicsICgpID0+IHtcbiAgICBjb25zdCBvcHRpb25zID0gey4uLmRlZmF1bHRPcHRpb25zLCBuYW1lOiAnZm9vLm1vZGVsJyB9O1xuICAgIGNvbnN0IHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdjbGFzcycsIG9wdGlvbnMsIGFwcFRyZWUpO1xuICAgIGNvbnN0IGNsYXNzUGF0aCA9ICcvcHJvamVjdHMvYmFyL3NyYy9hcHAvZm9vLm1vZGVsLnRzJztcbiAgICBjb25zdCBjb250ZW50ID0gdHJlZS5yZWFkQ29udGVudChjbGFzc1BhdGgpO1xuICAgIGV4cGVjdChjb250ZW50KS50b01hdGNoKC9leHBvcnQgY2xhc3MgRm9vLyk7XG4gIH0pO1xuXG4gIGl0KCdzaG91bGQgcmVzcGVjdCB0aGUgcGF0aCBvcHRpb24nLCAoKSA9PiB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHsgLi4uZGVmYXVsdE9wdGlvbnMsIHBhdGg6ICd6enonIH07XG4gICAgY29uc3QgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ2NsYXNzJywgb3B0aW9ucywgYXBwVHJlZSk7XG4gICAgZXhwZWN0KHRyZWUuZmlsZXMuaW5kZXhPZignL3p6ei9mb28udHMnKSkudG9CZUdyZWF0ZXJUaGFuT3JFcXVhbCgwKTtcbiAgfSk7XG5cbiAgaXQoJ3Nob3VsZCByZXNwZWN0IHRoZSBzb3VyY2VSb290IHZhbHVlJywgKCkgPT4ge1xuICAgIGNvbnN0IGNvbmZpZyA9IEpTT04ucGFyc2UoYXBwVHJlZS5yZWFkQ29udGVudCgnL2FuZ3VsYXIuanNvbicpKTtcbiAgICBjb25maWcucHJvamVjdHMuYmFyLnNvdXJjZVJvb3QgPSAncHJvamVjdHMvYmFyL2N1c3RvbSc7XG4gICAgYXBwVHJlZS5vdmVyd3JpdGUoJy9hbmd1bGFyLmpzb24nLCBKU09OLnN0cmluZ2lmeShjb25maWcsIG51bGwsIDIpKTtcbiAgICBhcHBUcmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnY2xhc3MnLCBkZWZhdWx0T3B0aW9ucywgYXBwVHJlZSk7XG4gICAgZXhwZWN0KGFwcFRyZWUuZmlsZXMuaW5kZXhPZignL3Byb2plY3RzL2Jhci9jdXN0b20vYXBwL2Zvby50cycpKS50b0JlR3JlYXRlclRoYW5PckVxdWFsKDApO1xuICB9KTtcbn0pO1xuIl19