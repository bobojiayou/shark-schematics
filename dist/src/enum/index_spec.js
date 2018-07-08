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
describe('Enum Schematic', () => {
    const schematicRunner = new testing_1.SchematicTestRunner('@schematics/angular', path.join(__dirname, '../collection.json'));
    const defaultOptions = {
        name: 'foo',
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
    it('should create an enumeration', () => {
        const tree = schematicRunner.runSchematic('enum', defaultOptions, appTree);
        const files = tree.files;
        expect(files.indexOf('/projects/bar/src/app/foo.enum.ts')).toBeGreaterThanOrEqual(0);
    });
    it('should create an enumeration', () => {
        const tree = schematicRunner.runSchematic('enum', defaultOptions, appTree);
        const content = tree.readContent('/projects/bar/src/app/foo.enum.ts');
        expect(content).toMatch('export enum Foo {');
    });
    it('should respect the sourceRoot value', () => {
        const config = JSON.parse(appTree.readContent('/angular.json'));
        config.projects.bar.sourceRoot = 'projects/bar/custom';
        appTree.overwrite('/angular.json', JSON.stringify(config, null, 2));
        appTree = schematicRunner.runSchematic('enum', defaultOptions, appTree);
        expect(appTree.files.indexOf('/projects/bar/custom/app/foo.enum.ts')).toBeGreaterThanOrEqual(0);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXhfc3BlYy5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvYm9iby9Xb3JrL2dpdGh1Yi9zaGFyay1zY2hlbWF0aWNzL3NyYy8iLCJzb3VyY2VzIjpbInNyYy9lbnVtL2luZGV4X3NwZWMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7O0dBTUc7QUFDSCxnRUFBdUY7QUFDdkYsNkJBQTZCO0FBTTdCLFFBQVEsQ0FBQyxnQkFBZ0IsRUFBRSxHQUFHLEVBQUU7SUFDOUIsTUFBTSxlQUFlLEdBQUcsSUFBSSw2QkFBbUIsQ0FDN0MscUJBQXFCLEVBQ3JCLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLG9CQUFvQixDQUFDLENBQzNDLENBQUM7SUFDRixNQUFNLGNBQWMsR0FBZ0I7UUFDbEMsSUFBSSxFQUFFLEtBQUs7UUFDWCxPQUFPLEVBQUUsS0FBSztLQUNmLENBQUM7SUFFRixNQUFNLGdCQUFnQixHQUFxQjtRQUN6QyxJQUFJLEVBQUUsV0FBVztRQUNqQixjQUFjLEVBQUUsVUFBVTtRQUMxQixPQUFPLEVBQUUsT0FBTztLQUNqQixDQUFDO0lBRUYsTUFBTSxVQUFVLEdBQXVCO1FBQ3JDLElBQUksRUFBRSxLQUFLO1FBQ1gsV0FBVyxFQUFFLEtBQUs7UUFDbEIsY0FBYyxFQUFFLEtBQUs7UUFDckIsT0FBTyxFQUFFLEtBQUs7UUFDZCxLQUFLLEVBQUUsS0FBSztRQUNaLFNBQVMsRUFBRSxLQUFLO1FBQ2hCLGVBQWUsRUFBRSxLQUFLO0tBQ3ZCLENBQUM7SUFDRixJQUFJLE9BQXFCLENBQUM7SUFDMUIsVUFBVSxDQUFDLEdBQUcsRUFBRTtRQUNkLE9BQU8sR0FBRyxlQUFlLENBQUMsWUFBWSxDQUFDLFdBQVcsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ3RFLE9BQU8sR0FBRyxlQUFlLENBQUMsWUFBWSxDQUFDLGFBQWEsRUFBRSxVQUFVLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDN0UsQ0FBQyxDQUFDLENBQUM7SUFFSCxFQUFFLENBQUMsOEJBQThCLEVBQUUsR0FBRyxFQUFFO1FBQ3RDLE1BQU0sSUFBSSxHQUFHLGVBQWUsQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLGNBQWMsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUMzRSxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ3pCLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLG1DQUFtQyxDQUFDLENBQUMsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN2RixDQUFDLENBQUMsQ0FBQztJQUNILEVBQUUsQ0FBQyw4QkFBOEIsRUFBRSxHQUFHLEVBQUU7UUFDdEMsTUFBTSxJQUFJLEdBQUcsZUFBZSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsY0FBYyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQzNFLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsbUNBQW1DLENBQUMsQ0FBQztRQUN0RSxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUM7SUFDL0MsQ0FBQyxDQUFDLENBQUM7SUFFSCxFQUFFLENBQUMscUNBQXFDLEVBQUUsR0FBRyxFQUFFO1FBQzdDLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO1FBQ2hFLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFVBQVUsR0FBRyxxQkFBcUIsQ0FBQztRQUN2RCxPQUFPLENBQUMsU0FBUyxDQUFDLGVBQWUsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNwRSxPQUFPLEdBQUcsZUFBZSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsY0FBYyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3hFLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFDLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDbEcsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7IFNjaGVtYXRpY1Rlc3RSdW5uZXIsIFVuaXRUZXN0VHJlZSB9IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9zY2hlbWF0aWNzL3Rlc3RpbmcnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IFNjaGVtYSBhcyBBcHBsaWNhdGlvbk9wdGlvbnMgfSBmcm9tICcuLi9hcHBsaWNhdGlvbi9zY2hlbWEnO1xuaW1wb3J0IHsgU2NoZW1hIGFzIFdvcmtzcGFjZU9wdGlvbnMgfSBmcm9tICcuLi93b3Jrc3BhY2Uvc2NoZW1hJztcbmltcG9ydCB7IFNjaGVtYSBhcyBFbnVtT3B0aW9ucyB9IGZyb20gJy4vc2NoZW1hJztcblxuXG5kZXNjcmliZSgnRW51bSBTY2hlbWF0aWMnLCAoKSA9PiB7XG4gIGNvbnN0IHNjaGVtYXRpY1J1bm5lciA9IG5ldyBTY2hlbWF0aWNUZXN0UnVubmVyKFxuICAgICdAc2NoZW1hdGljcy9hbmd1bGFyJyxcbiAgICBwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4vY29sbGVjdGlvbi5qc29uJyksXG4gICk7XG4gIGNvbnN0IGRlZmF1bHRPcHRpb25zOiBFbnVtT3B0aW9ucyA9IHtcbiAgICBuYW1lOiAnZm9vJyxcbiAgICBwcm9qZWN0OiAnYmFyJyxcbiAgfTtcblxuICBjb25zdCB3b3Jrc3BhY2VPcHRpb25zOiBXb3Jrc3BhY2VPcHRpb25zID0ge1xuICAgIG5hbWU6ICd3b3Jrc3BhY2UnLFxuICAgIG5ld1Byb2plY3RSb290OiAncHJvamVjdHMnLFxuICAgIHZlcnNpb246ICc2LjAuMCcsXG4gIH07XG5cbiAgY29uc3QgYXBwT3B0aW9uczogQXBwbGljYXRpb25PcHRpb25zID0ge1xuICAgIG5hbWU6ICdiYXInLFxuICAgIGlubGluZVN0eWxlOiBmYWxzZSxcbiAgICBpbmxpbmVUZW1wbGF0ZTogZmFsc2UsXG4gICAgcm91dGluZzogZmFsc2UsXG4gICAgc3R5bGU6ICdjc3MnLFxuICAgIHNraXBUZXN0czogZmFsc2UsXG4gICAgc2tpcFBhY2thZ2VKc29uOiBmYWxzZSxcbiAgfTtcbiAgbGV0IGFwcFRyZWU6IFVuaXRUZXN0VHJlZTtcbiAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgYXBwVHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ3dvcmtzcGFjZScsIHdvcmtzcGFjZU9wdGlvbnMpO1xuICAgIGFwcFRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdhcHBsaWNhdGlvbicsIGFwcE9wdGlvbnMsIGFwcFRyZWUpO1xuICB9KTtcblxuICBpdCgnc2hvdWxkIGNyZWF0ZSBhbiBlbnVtZXJhdGlvbicsICgpID0+IHtcbiAgICBjb25zdCB0cmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnZW51bScsIGRlZmF1bHRPcHRpb25zLCBhcHBUcmVlKTtcbiAgICBjb25zdCBmaWxlcyA9IHRyZWUuZmlsZXM7XG4gICAgZXhwZWN0KGZpbGVzLmluZGV4T2YoJy9wcm9qZWN0cy9iYXIvc3JjL2FwcC9mb28uZW51bS50cycpKS50b0JlR3JlYXRlclRoYW5PckVxdWFsKDApO1xuICB9KTtcbiAgaXQoJ3Nob3VsZCBjcmVhdGUgYW4gZW51bWVyYXRpb24nLCAoKSA9PiB7XG4gICAgY29uc3QgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ2VudW0nLCBkZWZhdWx0T3B0aW9ucywgYXBwVHJlZSk7XG4gICAgY29uc3QgY29udGVudCA9IHRyZWUucmVhZENvbnRlbnQoJy9wcm9qZWN0cy9iYXIvc3JjL2FwcC9mb28uZW51bS50cycpO1xuICAgIGV4cGVjdChjb250ZW50KS50b01hdGNoKCdleHBvcnQgZW51bSBGb28geycpO1xuICB9KTtcblxuICBpdCgnc2hvdWxkIHJlc3BlY3QgdGhlIHNvdXJjZVJvb3QgdmFsdWUnLCAoKSA9PiB7XG4gICAgY29uc3QgY29uZmlnID0gSlNPTi5wYXJzZShhcHBUcmVlLnJlYWRDb250ZW50KCcvYW5ndWxhci5qc29uJykpO1xuICAgIGNvbmZpZy5wcm9qZWN0cy5iYXIuc291cmNlUm9vdCA9ICdwcm9qZWN0cy9iYXIvY3VzdG9tJztcbiAgICBhcHBUcmVlLm92ZXJ3cml0ZSgnL2FuZ3VsYXIuanNvbicsIEpTT04uc3RyaW5naWZ5KGNvbmZpZywgbnVsbCwgMikpO1xuICAgIGFwcFRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdlbnVtJywgZGVmYXVsdE9wdGlvbnMsIGFwcFRyZWUpO1xuICAgIGV4cGVjdChhcHBUcmVlLmZpbGVzLmluZGV4T2YoJy9wcm9qZWN0cy9iYXIvY3VzdG9tL2FwcC9mb28uZW51bS50cycpKS50b0JlR3JlYXRlclRoYW5PckVxdWFsKDApO1xuICB9KTtcbn0pO1xuIl19