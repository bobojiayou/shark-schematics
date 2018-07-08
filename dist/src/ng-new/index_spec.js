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
describe('Ng New Schematic', () => {
    const schematicRunner = new testing_1.SchematicTestRunner('@schematics/angular', path.join(__dirname, '../collection.json'));
    const defaultOptions = {
        name: 'foo',
        directory: 'bar',
        version: '6.0.0',
    };
    it('should create files of a workspace', () => {
        const options = Object.assign({}, defaultOptions);
        const tree = schematicRunner.runSchematic('ng-new', options);
        const files = tree.files;
        expect(files.indexOf('/bar/angular.json')).toBeGreaterThanOrEqual(0);
    });
    it('should create files of an application', () => {
        const options = Object.assign({}, defaultOptions);
        const tree = schematicRunner.runSchematic('ng-new', options);
        const files = tree.files;
        expect(files.indexOf('/bar/src/tsconfig.app.json')).toBeGreaterThanOrEqual(0);
        expect(files.indexOf('/bar/src/main.ts')).toBeGreaterThanOrEqual(0);
        expect(files.indexOf('/bar/src/app/app.module.ts')).toBeGreaterThanOrEqual(0);
    });
    it('should should set the prefix in angular.json and in app.component.ts', () => {
        const options = Object.assign({}, defaultOptions, { prefix: 'pre' });
        const tree = schematicRunner.runSchematic('ng-new', options);
        const content = tree.readContent('/bar/angular.json');
        expect(content).toMatch(/"prefix": "pre"/);
    });
    it('should set up the app module', () => {
        const options = {
            name: 'foo',
            version: '6.0.0',
        };
        const tree = schematicRunner.runSchematic('ng-new', options);
        const moduleContent = tree.readContent('/foo/src/app/app.module.ts');
        expect(moduleContent).toMatch(/declarations:\s*\[\s*AppComponent\s*\]/m);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXhfc3BlYy5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvYm9iby9Xb3JrL2dpdGh1Yi9zaGFyay1zY2hlbWF0aWNzL3NyYy8iLCJzb3VyY2VzIjpbInNyYy9uZy1uZXcvaW5kZXhfc3BlYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7R0FNRztBQUNILGdFQUF5RTtBQUN6RSw2QkFBNkI7QUFJN0IsUUFBUSxDQUFDLGtCQUFrQixFQUFFLEdBQUcsRUFBRTtJQUNoQyxNQUFNLGVBQWUsR0FBRyxJQUFJLDZCQUFtQixDQUM3QyxxQkFBcUIsRUFDckIsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsb0JBQW9CLENBQUMsQ0FDM0MsQ0FBQztJQUNGLE1BQU0sY0FBYyxHQUFpQjtRQUNuQyxJQUFJLEVBQUUsS0FBSztRQUNYLFNBQVMsRUFBRSxLQUFLO1FBQ2hCLE9BQU8sRUFBRSxPQUFPO0tBQ2pCLENBQUM7SUFFRixFQUFFLENBQUMsb0NBQW9DLEVBQUUsR0FBRyxFQUFFO1FBQzVDLE1BQU0sT0FBTyxxQkFBUSxjQUFjLENBQUUsQ0FBQztRQUV0QyxNQUFNLElBQUksR0FBRyxlQUFlLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUM3RCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ3pCLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN2RSxDQUFDLENBQUMsQ0FBQztJQUVILEVBQUUsQ0FBQyx1Q0FBdUMsRUFBRSxHQUFHLEVBQUU7UUFDL0MsTUFBTSxPQUFPLHFCQUFRLGNBQWMsQ0FBRSxDQUFDO1FBRXRDLE1BQU0sSUFBSSxHQUFHLGVBQWUsQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQzdELE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7UUFDekIsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsNEJBQTRCLENBQUMsQ0FBQyxDQUFDLHNCQUFzQixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzlFLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNwRSxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDaEYsQ0FBQyxDQUFDLENBQUM7SUFFSCxFQUFFLENBQUMsc0VBQXNFLEVBQUUsR0FBRyxFQUFFO1FBQzlFLE1BQU0sT0FBTyxxQkFBUSxjQUFjLElBQUUsTUFBTSxFQUFFLEtBQUssR0FBRSxDQUFDO1FBRXJELE1BQU0sSUFBSSxHQUFHLGVBQWUsQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQzdELE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsbUJBQW1CLENBQUMsQ0FBQztRQUN0RCxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUM7SUFDN0MsQ0FBQyxDQUFDLENBQUM7SUFFSCxFQUFFLENBQUMsOEJBQThCLEVBQUUsR0FBRyxFQUFFO1FBQ3RDLE1BQU0sT0FBTyxHQUFpQjtZQUM1QixJQUFJLEVBQUUsS0FBSztZQUNYLE9BQU8sRUFBRSxPQUFPO1NBQ2pCLENBQUM7UUFFRixNQUFNLElBQUksR0FBRyxlQUFlLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUM3RCxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLDRCQUE0QixDQUFDLENBQUM7UUFDckUsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDLE9BQU8sQ0FBQyx5Q0FBeUMsQ0FBQyxDQUFDO0lBQzNFLENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQgeyBTY2hlbWF0aWNUZXN0UnVubmVyIH0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L3NjaGVtYXRpY3MvdGVzdGluZyc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgU2NoZW1hIGFzIE5nTmV3T3B0aW9ucyB9IGZyb20gJy4vc2NoZW1hJztcblxuXG5kZXNjcmliZSgnTmcgTmV3IFNjaGVtYXRpYycsICgpID0+IHtcbiAgY29uc3Qgc2NoZW1hdGljUnVubmVyID0gbmV3IFNjaGVtYXRpY1Rlc3RSdW5uZXIoXG4gICAgJ0BzY2hlbWF0aWNzL2FuZ3VsYXInLFxuICAgIHBhdGguam9pbihfX2Rpcm5hbWUsICcuLi9jb2xsZWN0aW9uLmpzb24nKSxcbiAgKTtcbiAgY29uc3QgZGVmYXVsdE9wdGlvbnM6IE5nTmV3T3B0aW9ucyA9IHtcbiAgICBuYW1lOiAnZm9vJyxcbiAgICBkaXJlY3Rvcnk6ICdiYXInLFxuICAgIHZlcnNpb246ICc2LjAuMCcsXG4gIH07XG5cbiAgaXQoJ3Nob3VsZCBjcmVhdGUgZmlsZXMgb2YgYSB3b3Jrc3BhY2UnLCAoKSA9PiB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHsgLi4uZGVmYXVsdE9wdGlvbnMgfTtcblxuICAgIGNvbnN0IHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCduZy1uZXcnLCBvcHRpb25zKTtcbiAgICBjb25zdCBmaWxlcyA9IHRyZWUuZmlsZXM7XG4gICAgZXhwZWN0KGZpbGVzLmluZGV4T2YoJy9iYXIvYW5ndWxhci5qc29uJykpLnRvQmVHcmVhdGVyVGhhbk9yRXF1YWwoMCk7XG4gIH0pO1xuXG4gIGl0KCdzaG91bGQgY3JlYXRlIGZpbGVzIG9mIGFuIGFwcGxpY2F0aW9uJywgKCkgPT4ge1xuICAgIGNvbnN0IG9wdGlvbnMgPSB7IC4uLmRlZmF1bHRPcHRpb25zIH07XG5cbiAgICBjb25zdCB0cmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnbmctbmV3Jywgb3B0aW9ucyk7XG4gICAgY29uc3QgZmlsZXMgPSB0cmVlLmZpbGVzO1xuICAgIGV4cGVjdChmaWxlcy5pbmRleE9mKCcvYmFyL3NyYy90c2NvbmZpZy5hcHAuanNvbicpKS50b0JlR3JlYXRlclRoYW5PckVxdWFsKDApO1xuICAgIGV4cGVjdChmaWxlcy5pbmRleE9mKCcvYmFyL3NyYy9tYWluLnRzJykpLnRvQmVHcmVhdGVyVGhhbk9yRXF1YWwoMCk7XG4gICAgZXhwZWN0KGZpbGVzLmluZGV4T2YoJy9iYXIvc3JjL2FwcC9hcHAubW9kdWxlLnRzJykpLnRvQmVHcmVhdGVyVGhhbk9yRXF1YWwoMCk7XG4gIH0pO1xuXG4gIGl0KCdzaG91bGQgc2hvdWxkIHNldCB0aGUgcHJlZml4IGluIGFuZ3VsYXIuanNvbiBhbmQgaW4gYXBwLmNvbXBvbmVudC50cycsICgpID0+IHtcbiAgICBjb25zdCBvcHRpb25zID0geyAuLi5kZWZhdWx0T3B0aW9ucywgcHJlZml4OiAncHJlJyB9O1xuXG4gICAgY29uc3QgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ25nLW5ldycsIG9wdGlvbnMpO1xuICAgIGNvbnN0IGNvbnRlbnQgPSB0cmVlLnJlYWRDb250ZW50KCcvYmFyL2FuZ3VsYXIuanNvbicpO1xuICAgIGV4cGVjdChjb250ZW50KS50b01hdGNoKC9cInByZWZpeFwiOiBcInByZVwiLyk7XG4gIH0pO1xuXG4gIGl0KCdzaG91bGQgc2V0IHVwIHRoZSBhcHAgbW9kdWxlJywgKCkgPT4ge1xuICAgIGNvbnN0IG9wdGlvbnM6IE5nTmV3T3B0aW9ucyA9IHtcbiAgICAgIG5hbWU6ICdmb28nLFxuICAgICAgdmVyc2lvbjogJzYuMC4wJyxcbiAgICB9O1xuXG4gICAgY29uc3QgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ25nLW5ldycsIG9wdGlvbnMpO1xuICAgIGNvbnN0IG1vZHVsZUNvbnRlbnQgPSB0cmVlLnJlYWRDb250ZW50KCcvZm9vL3NyYy9hcHAvYXBwLm1vZHVsZS50cycpO1xuICAgIGV4cGVjdChtb2R1bGVDb250ZW50KS50b01hdGNoKC9kZWNsYXJhdGlvbnM6XFxzKlxcW1xccypBcHBDb21wb25lbnRcXHMqXFxdL20pO1xuICB9KTtcbn0pO1xuIl19