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
describe('Interface Schematic', () => {
    const schematicRunner = new testing_1.SchematicTestRunner('@schematics/angular', path.join(__dirname, '../collection.json'));
    const defaultOptions = {
        name: 'foo',
        prefix: '',
        type: '',
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
    it('should create one file', () => {
        const tree = schematicRunner.runSchematic('interface', defaultOptions, appTree);
        expect(tree.files.indexOf('/projects/bar/src/app/foo.ts')).toBeGreaterThanOrEqual(0);
    });
    it('should create an interface named "Foo"', () => {
        const tree = schematicRunner.runSchematic('interface', defaultOptions, appTree);
        const fileContent = tree.readContent('/projects/bar/src/app/foo.ts');
        expect(fileContent).toMatch(/export interface Foo/);
    });
    it('should put type in the file name', () => {
        const options = Object.assign({}, defaultOptions, { type: 'model' });
        const tree = schematicRunner.runSchematic('interface', options, appTree);
        expect(tree.files.indexOf('/projects/bar/src/app/foo.model.ts')).toBeGreaterThanOrEqual(0);
    });
    it('should respect the sourceRoot value', () => {
        const config = JSON.parse(appTree.readContent('/angular.json'));
        config.projects.bar.sourceRoot = 'projects/bar/custom';
        appTree.overwrite('/angular.json', JSON.stringify(config, null, 2));
        appTree = schematicRunner.runSchematic('interface', defaultOptions, appTree);
        expect(appTree.files.indexOf('/projects/bar/custom/app/foo.ts'))
            .toBeGreaterThanOrEqual(0);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXhfc3BlYy5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvYm9iby9Xb3JrL2dpdGh1Yi9zaGFyay1zY2hlbWF0aWNzL3NyYy8iLCJzb3VyY2VzIjpbInNyYy9pbnRlcmZhY2UvaW5kZXhfc3BlYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7R0FNRztBQUNILGdFQUF1RjtBQUN2Riw2QkFBNkI7QUFNN0IsUUFBUSxDQUFDLHFCQUFxQixFQUFFLEdBQUcsRUFBRTtJQUNuQyxNQUFNLGVBQWUsR0FBRyxJQUFJLDZCQUFtQixDQUM3QyxxQkFBcUIsRUFDckIsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsb0JBQW9CLENBQUMsQ0FDM0MsQ0FBQztJQUNGLE1BQU0sY0FBYyxHQUFxQjtRQUN2QyxJQUFJLEVBQUUsS0FBSztRQUNYLE1BQU0sRUFBRSxFQUFFO1FBQ1YsSUFBSSxFQUFFLEVBQUU7UUFDUixPQUFPLEVBQUUsS0FBSztLQUNmLENBQUM7SUFFRixNQUFNLGdCQUFnQixHQUFxQjtRQUN6QyxJQUFJLEVBQUUsV0FBVztRQUNqQixjQUFjLEVBQUUsVUFBVTtRQUMxQixPQUFPLEVBQUUsT0FBTztLQUNqQixDQUFDO0lBRUYsTUFBTSxVQUFVLEdBQXVCO1FBQ3JDLElBQUksRUFBRSxLQUFLO1FBQ1gsV0FBVyxFQUFFLEtBQUs7UUFDbEIsY0FBYyxFQUFFLEtBQUs7UUFDckIsT0FBTyxFQUFFLEtBQUs7UUFDZCxLQUFLLEVBQUUsS0FBSztRQUNaLFNBQVMsRUFBRSxLQUFLO1FBQ2hCLGVBQWUsRUFBRSxLQUFLO0tBQ3ZCLENBQUM7SUFDRixJQUFJLE9BQXFCLENBQUM7SUFDMUIsVUFBVSxDQUFDLEdBQUcsRUFBRTtRQUNkLE9BQU8sR0FBRyxlQUFlLENBQUMsWUFBWSxDQUFDLFdBQVcsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ3RFLE9BQU8sR0FBRyxlQUFlLENBQUMsWUFBWSxDQUFDLGFBQWEsRUFBRSxVQUFVLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDN0UsQ0FBQyxDQUFDLENBQUM7SUFFSCxFQUFFLENBQUMsd0JBQXdCLEVBQUUsR0FBRyxFQUFFO1FBQ2hDLE1BQU0sSUFBSSxHQUFHLGVBQWUsQ0FBQyxZQUFZLENBQUMsV0FBVyxFQUFFLGNBQWMsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNoRixNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsOEJBQThCLENBQUMsQ0FBQyxDQUFDLHNCQUFzQixDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3ZGLENBQUMsQ0FBQyxDQUFDO0lBRUgsRUFBRSxDQUFDLHdDQUF3QyxFQUFFLEdBQUcsRUFBRTtRQUNoRCxNQUFNLElBQUksR0FBRyxlQUFlLENBQUMsWUFBWSxDQUFDLFdBQVcsRUFBRSxjQUFjLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDaEYsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDO1FBQ3JFLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQyxPQUFPLENBQUMsc0JBQXNCLENBQUMsQ0FBQztJQUN0RCxDQUFDLENBQUMsQ0FBQztJQUVILEVBQUUsQ0FBQyxrQ0FBa0MsRUFBRSxHQUFHLEVBQUU7UUFDMUMsTUFBTSxPQUFPLHFCQUFRLGNBQWMsSUFBRSxJQUFJLEVBQUUsT0FBTyxHQUFFLENBQUM7UUFFckQsTUFBTSxJQUFJLEdBQUcsZUFBZSxDQUFDLFlBQVksQ0FBQyxXQUFXLEVBQUUsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3pFLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxvQ0FBb0MsQ0FBQyxDQUFDLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDN0YsQ0FBQyxDQUFDLENBQUM7SUFFSCxFQUFFLENBQUMscUNBQXFDLEVBQUUsR0FBRyxFQUFFO1FBQzdDLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO1FBQ2hFLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFVBQVUsR0FBRyxxQkFBcUIsQ0FBQztRQUN2RCxPQUFPLENBQUMsU0FBUyxDQUFDLGVBQWUsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNwRSxPQUFPLEdBQUcsZUFBZSxDQUFDLFlBQVksQ0FBQyxXQUFXLEVBQUUsY0FBYyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQzdFLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDO2FBQzdELHNCQUFzQixDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQy9CLENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQgeyBTY2hlbWF0aWNUZXN0UnVubmVyLCBVbml0VGVzdFRyZWUgfSBmcm9tICdAYW5ndWxhci1kZXZraXQvc2NoZW1hdGljcy90ZXN0aW5nJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBTY2hlbWEgYXMgQXBwbGljYXRpb25PcHRpb25zIH0gZnJvbSAnLi4vYXBwbGljYXRpb24vc2NoZW1hJztcbmltcG9ydCB7IFNjaGVtYSBhcyBXb3Jrc3BhY2VPcHRpb25zIH0gZnJvbSAnLi4vd29ya3NwYWNlL3NjaGVtYSc7XG5pbXBvcnQgeyBTY2hlbWEgYXMgSW50ZXJmYWNlT3B0aW9ucyB9IGZyb20gJy4vc2NoZW1hJztcblxuXG5kZXNjcmliZSgnSW50ZXJmYWNlIFNjaGVtYXRpYycsICgpID0+IHtcbiAgY29uc3Qgc2NoZW1hdGljUnVubmVyID0gbmV3IFNjaGVtYXRpY1Rlc3RSdW5uZXIoXG4gICAgJ0BzY2hlbWF0aWNzL2FuZ3VsYXInLFxuICAgIHBhdGguam9pbihfX2Rpcm5hbWUsICcuLi9jb2xsZWN0aW9uLmpzb24nKSxcbiAgKTtcbiAgY29uc3QgZGVmYXVsdE9wdGlvbnM6IEludGVyZmFjZU9wdGlvbnMgPSB7XG4gICAgbmFtZTogJ2ZvbycsXG4gICAgcHJlZml4OiAnJyxcbiAgICB0eXBlOiAnJyxcbiAgICBwcm9qZWN0OiAnYmFyJyxcbiAgfTtcblxuICBjb25zdCB3b3Jrc3BhY2VPcHRpb25zOiBXb3Jrc3BhY2VPcHRpb25zID0ge1xuICAgIG5hbWU6ICd3b3Jrc3BhY2UnLFxuICAgIG5ld1Byb2plY3RSb290OiAncHJvamVjdHMnLFxuICAgIHZlcnNpb246ICc2LjAuMCcsXG4gIH07XG5cbiAgY29uc3QgYXBwT3B0aW9uczogQXBwbGljYXRpb25PcHRpb25zID0ge1xuICAgIG5hbWU6ICdiYXInLFxuICAgIGlubGluZVN0eWxlOiBmYWxzZSxcbiAgICBpbmxpbmVUZW1wbGF0ZTogZmFsc2UsXG4gICAgcm91dGluZzogZmFsc2UsXG4gICAgc3R5bGU6ICdjc3MnLFxuICAgIHNraXBUZXN0czogZmFsc2UsXG4gICAgc2tpcFBhY2thZ2VKc29uOiBmYWxzZSxcbiAgfTtcbiAgbGV0IGFwcFRyZWU6IFVuaXRUZXN0VHJlZTtcbiAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgYXBwVHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ3dvcmtzcGFjZScsIHdvcmtzcGFjZU9wdGlvbnMpO1xuICAgIGFwcFRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdhcHBsaWNhdGlvbicsIGFwcE9wdGlvbnMsIGFwcFRyZWUpO1xuICB9KTtcblxuICBpdCgnc2hvdWxkIGNyZWF0ZSBvbmUgZmlsZScsICgpID0+IHtcbiAgICBjb25zdCB0cmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnaW50ZXJmYWNlJywgZGVmYXVsdE9wdGlvbnMsIGFwcFRyZWUpO1xuICAgIGV4cGVjdCh0cmVlLmZpbGVzLmluZGV4T2YoJy9wcm9qZWN0cy9iYXIvc3JjL2FwcC9mb28udHMnKSkudG9CZUdyZWF0ZXJUaGFuT3JFcXVhbCgwKTtcbiAgfSk7XG5cbiAgaXQoJ3Nob3VsZCBjcmVhdGUgYW4gaW50ZXJmYWNlIG5hbWVkIFwiRm9vXCInLCAoKSA9PiB7XG4gICAgY29uc3QgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ2ludGVyZmFjZScsIGRlZmF1bHRPcHRpb25zLCBhcHBUcmVlKTtcbiAgICBjb25zdCBmaWxlQ29udGVudCA9IHRyZWUucmVhZENvbnRlbnQoJy9wcm9qZWN0cy9iYXIvc3JjL2FwcC9mb28udHMnKTtcbiAgICBleHBlY3QoZmlsZUNvbnRlbnQpLnRvTWF0Y2goL2V4cG9ydCBpbnRlcmZhY2UgRm9vLyk7XG4gIH0pO1xuXG4gIGl0KCdzaG91bGQgcHV0IHR5cGUgaW4gdGhlIGZpbGUgbmFtZScsICgpID0+IHtcbiAgICBjb25zdCBvcHRpb25zID0geyAuLi5kZWZhdWx0T3B0aW9ucywgdHlwZTogJ21vZGVsJyB9O1xuXG4gICAgY29uc3QgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ2ludGVyZmFjZScsIG9wdGlvbnMsIGFwcFRyZWUpO1xuICAgIGV4cGVjdCh0cmVlLmZpbGVzLmluZGV4T2YoJy9wcm9qZWN0cy9iYXIvc3JjL2FwcC9mb28ubW9kZWwudHMnKSkudG9CZUdyZWF0ZXJUaGFuT3JFcXVhbCgwKTtcbiAgfSk7XG5cbiAgaXQoJ3Nob3VsZCByZXNwZWN0IHRoZSBzb3VyY2VSb290IHZhbHVlJywgKCkgPT4ge1xuICAgIGNvbnN0IGNvbmZpZyA9IEpTT04ucGFyc2UoYXBwVHJlZS5yZWFkQ29udGVudCgnL2FuZ3VsYXIuanNvbicpKTtcbiAgICBjb25maWcucHJvamVjdHMuYmFyLnNvdXJjZVJvb3QgPSAncHJvamVjdHMvYmFyL2N1c3RvbSc7XG4gICAgYXBwVHJlZS5vdmVyd3JpdGUoJy9hbmd1bGFyLmpzb24nLCBKU09OLnN0cmluZ2lmeShjb25maWcsIG51bGwsIDIpKTtcbiAgICBhcHBUcmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnaW50ZXJmYWNlJywgZGVmYXVsdE9wdGlvbnMsIGFwcFRyZWUpO1xuICAgIGV4cGVjdChhcHBUcmVlLmZpbGVzLmluZGV4T2YoJy9wcm9qZWN0cy9iYXIvY3VzdG9tL2FwcC9mb28udHMnKSlcbiAgICAgIC50b0JlR3JlYXRlclRoYW5PckVxdWFsKDApO1xuICB9KTtcbn0pO1xuIl19