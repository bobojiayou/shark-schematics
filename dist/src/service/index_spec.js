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
describe('Service Schematic', () => {
    const schematicRunner = new testing_1.SchematicTestRunner('@schematics/angular', path.join(__dirname, '../collection.json'));
    const defaultOptions = {
        name: 'foo',
        spec: true,
        flat: false,
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
    it('should create a service', () => {
        const options = Object.assign({}, defaultOptions);
        const tree = schematicRunner.runSchematic('service', options, appTree);
        const files = tree.files;
        expect(files.indexOf('/projects/bar/src/app/foo/foo.service.spec.ts')).toBeGreaterThanOrEqual(0);
        expect(files.indexOf('/projects/bar/src/app/foo/foo.service.ts')).toBeGreaterThanOrEqual(0);
    });
    it('service should be tree-shakeable', () => {
        const options = Object.assign({}, defaultOptions);
        const tree = schematicRunner.runSchematic('service', options, appTree);
        const content = tree.readContent('/projects/bar/src/app/foo/foo.service.ts');
        expect(content).toMatch(/providedIn: 'root'/);
    });
    it('should respect the spec flag', () => {
        const options = Object.assign({}, defaultOptions, { spec: false });
        const tree = schematicRunner.runSchematic('service', options, appTree);
        const files = tree.files;
        expect(files.indexOf('/projects/bar/src/app/foo/foo.service.ts')).toBeGreaterThanOrEqual(0);
        expect(files.indexOf('/projects/bar/src/app/foo/foo.service.spec.ts')).toEqual(-1);
    });
    it('should respect the sourceRoot value', () => {
        const config = JSON.parse(appTree.readContent('/angular.json'));
        config.projects.bar.sourceRoot = 'projects/bar/custom';
        appTree.overwrite('/angular.json', JSON.stringify(config, null, 2));
        appTree = schematicRunner.runSchematic('service', defaultOptions, appTree);
        expect(appTree.files.indexOf('/projects/bar/custom/app/foo/foo.service.ts'))
            .toBeGreaterThanOrEqual(0);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXhfc3BlYy5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvYm9iby9Xb3JrL2dpdGh1Yi9zaGFyay1zY2hlbWF0aWNzL3NyYy8iLCJzb3VyY2VzIjpbInNyYy9zZXJ2aWNlL2luZGV4X3NwZWMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7O0dBTUc7QUFDSCxnRUFBdUY7QUFDdkYsNkJBQTZCO0FBSzdCLGlDQUFpQztBQUNqQyxRQUFRLENBQUMsbUJBQW1CLEVBQUUsR0FBRyxFQUFFO0lBQ2pDLE1BQU0sZUFBZSxHQUFHLElBQUksNkJBQW1CLENBQzdDLHFCQUFxQixFQUNyQixJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxvQkFBb0IsQ0FBQyxDQUMzQyxDQUFDO0lBQ0YsTUFBTSxjQUFjLEdBQW1CO1FBQ3JDLElBQUksRUFBRSxLQUFLO1FBQ1gsSUFBSSxFQUFFLElBQUk7UUFDVixJQUFJLEVBQUUsS0FBSztRQUNYLE9BQU8sRUFBRSxLQUFLO0tBQ2YsQ0FBQztJQUVGLE1BQU0sZ0JBQWdCLEdBQXFCO1FBQ3pDLElBQUksRUFBRSxXQUFXO1FBQ2pCLGNBQWMsRUFBRSxVQUFVO1FBQzFCLE9BQU8sRUFBRSxPQUFPO0tBQ2pCLENBQUM7SUFFRixNQUFNLFVBQVUsR0FBdUI7UUFDckMsSUFBSSxFQUFFLEtBQUs7UUFDWCxXQUFXLEVBQUUsS0FBSztRQUNsQixjQUFjLEVBQUUsS0FBSztRQUNyQixPQUFPLEVBQUUsS0FBSztRQUNkLEtBQUssRUFBRSxLQUFLO1FBQ1osU0FBUyxFQUFFLEtBQUs7UUFDaEIsZUFBZSxFQUFFLEtBQUs7S0FDdkIsQ0FBQztJQUNGLElBQUksT0FBcUIsQ0FBQztJQUMxQixVQUFVLENBQUMsR0FBRyxFQUFFO1FBQ2QsT0FBTyxHQUFHLGVBQWUsQ0FBQyxZQUFZLENBQUMsV0FBVyxFQUFFLGdCQUFnQixDQUFDLENBQUM7UUFDdEUsT0FBTyxHQUFHLGVBQWUsQ0FBQyxZQUFZLENBQUMsYUFBYSxFQUFFLFVBQVUsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUM3RSxDQUFDLENBQUMsQ0FBQztJQUVILEVBQUUsQ0FBQyx5QkFBeUIsRUFBRSxHQUFHLEVBQUU7UUFDakMsTUFBTSxPQUFPLHFCQUFRLGNBQWMsQ0FBRSxDQUFDO1FBRXRDLE1BQU0sSUFBSSxHQUFHLGVBQWUsQ0FBQyxZQUFZLENBQUMsU0FBUyxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztRQUN2RSxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ3pCLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLCtDQUErQyxDQUFDLENBQUMsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNqRyxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDOUYsQ0FBQyxDQUFDLENBQUM7SUFFSCxFQUFFLENBQUMsa0NBQWtDLEVBQUUsR0FBRyxFQUFFO1FBQzFDLE1BQU0sT0FBTyxxQkFBUSxjQUFjLENBQUMsQ0FBQztRQUVyQyxNQUFNLElBQUksR0FBRyxlQUFlLENBQUMsWUFBWSxDQUFDLFNBQVMsRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDdkUsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO1FBQzdFLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFPLENBQUMsb0JBQW9CLENBQUMsQ0FBQztJQUNoRCxDQUFDLENBQUMsQ0FBQztJQUVILEVBQUUsQ0FBQyw4QkFBOEIsRUFBRSxHQUFHLEVBQUU7UUFDdEMsTUFBTSxPQUFPLHFCQUFRLGNBQWMsSUFBRSxJQUFJLEVBQUUsS0FBSyxHQUFFLENBQUM7UUFFbkQsTUFBTSxJQUFJLEdBQUcsZUFBZSxDQUFDLFlBQVksQ0FBQyxTQUFTLEVBQUUsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3ZFLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7UUFDekIsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsMENBQTBDLENBQUMsQ0FBQyxDQUFDLHNCQUFzQixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzVGLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLCtDQUErQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNyRixDQUFDLENBQUMsQ0FBQztJQUVILEVBQUUsQ0FBQyxxQ0FBcUMsRUFBRSxHQUFHLEVBQUU7UUFDN0MsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7UUFDaEUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsVUFBVSxHQUFHLHFCQUFxQixDQUFDO1FBQ3ZELE9BQU8sQ0FBQyxTQUFTLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3BFLE9BQU8sR0FBRyxlQUFlLENBQUMsWUFBWSxDQUFDLFNBQVMsRUFBRSxjQUFjLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDM0UsTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLDZDQUE2QyxDQUFDLENBQUM7YUFDekUsc0JBQXNCLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDL0IsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7IFNjaGVtYXRpY1Rlc3RSdW5uZXIsIFVuaXRUZXN0VHJlZSB9IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9zY2hlbWF0aWNzL3Rlc3RpbmcnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IFNjaGVtYSBhcyBBcHBsaWNhdGlvbk9wdGlvbnMgfSBmcm9tICcuLi9hcHBsaWNhdGlvbi9zY2hlbWEnO1xuaW1wb3J0IHsgU2NoZW1hIGFzIFdvcmtzcGFjZU9wdGlvbnMgfSBmcm9tICcuLi93b3Jrc3BhY2Uvc2NoZW1hJztcbmltcG9ydCB7IFNjaGVtYSBhcyBTZXJ2aWNlT3B0aW9ucyB9IGZyb20gJy4vc2NoZW1hJztcblxuLy8gdHNsaW50OmRpc2FibGU6bWF4LWxpbmUtbGVuZ3RoXG5kZXNjcmliZSgnU2VydmljZSBTY2hlbWF0aWMnLCAoKSA9PiB7XG4gIGNvbnN0IHNjaGVtYXRpY1J1bm5lciA9IG5ldyBTY2hlbWF0aWNUZXN0UnVubmVyKFxuICAgICdAc2NoZW1hdGljcy9hbmd1bGFyJyxcbiAgICBwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4vY29sbGVjdGlvbi5qc29uJyksXG4gICk7XG4gIGNvbnN0IGRlZmF1bHRPcHRpb25zOiBTZXJ2aWNlT3B0aW9ucyA9IHtcbiAgICBuYW1lOiAnZm9vJyxcbiAgICBzcGVjOiB0cnVlLFxuICAgIGZsYXQ6IGZhbHNlLFxuICAgIHByb2plY3Q6ICdiYXInLFxuICB9O1xuXG4gIGNvbnN0IHdvcmtzcGFjZU9wdGlvbnM6IFdvcmtzcGFjZU9wdGlvbnMgPSB7XG4gICAgbmFtZTogJ3dvcmtzcGFjZScsXG4gICAgbmV3UHJvamVjdFJvb3Q6ICdwcm9qZWN0cycsXG4gICAgdmVyc2lvbjogJzYuMC4wJyxcbiAgfTtcblxuICBjb25zdCBhcHBPcHRpb25zOiBBcHBsaWNhdGlvbk9wdGlvbnMgPSB7XG4gICAgbmFtZTogJ2JhcicsXG4gICAgaW5saW5lU3R5bGU6IGZhbHNlLFxuICAgIGlubGluZVRlbXBsYXRlOiBmYWxzZSxcbiAgICByb3V0aW5nOiBmYWxzZSxcbiAgICBzdHlsZTogJ2NzcycsXG4gICAgc2tpcFRlc3RzOiBmYWxzZSxcbiAgICBza2lwUGFja2FnZUpzb246IGZhbHNlLFxuICB9O1xuICBsZXQgYXBwVHJlZTogVW5pdFRlc3RUcmVlO1xuICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICBhcHBUcmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnd29ya3NwYWNlJywgd29ya3NwYWNlT3B0aW9ucyk7XG4gICAgYXBwVHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ2FwcGxpY2F0aW9uJywgYXBwT3B0aW9ucywgYXBwVHJlZSk7XG4gIH0pO1xuXG4gIGl0KCdzaG91bGQgY3JlYXRlIGEgc2VydmljZScsICgpID0+IHtcbiAgICBjb25zdCBvcHRpb25zID0geyAuLi5kZWZhdWx0T3B0aW9ucyB9O1xuXG4gICAgY29uc3QgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ3NlcnZpY2UnLCBvcHRpb25zLCBhcHBUcmVlKTtcbiAgICBjb25zdCBmaWxlcyA9IHRyZWUuZmlsZXM7XG4gICAgZXhwZWN0KGZpbGVzLmluZGV4T2YoJy9wcm9qZWN0cy9iYXIvc3JjL2FwcC9mb28vZm9vLnNlcnZpY2Uuc3BlYy50cycpKS50b0JlR3JlYXRlclRoYW5PckVxdWFsKDApO1xuICAgIGV4cGVjdChmaWxlcy5pbmRleE9mKCcvcHJvamVjdHMvYmFyL3NyYy9hcHAvZm9vL2Zvby5zZXJ2aWNlLnRzJykpLnRvQmVHcmVhdGVyVGhhbk9yRXF1YWwoMCk7XG4gIH0pO1xuXG4gIGl0KCdzZXJ2aWNlIHNob3VsZCBiZSB0cmVlLXNoYWtlYWJsZScsICgpID0+IHtcbiAgICBjb25zdCBvcHRpb25zID0geyAuLi5kZWZhdWx0T3B0aW9uc307XG5cbiAgICBjb25zdCB0cmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnc2VydmljZScsIG9wdGlvbnMsIGFwcFRyZWUpO1xuICAgIGNvbnN0IGNvbnRlbnQgPSB0cmVlLnJlYWRDb250ZW50KCcvcHJvamVjdHMvYmFyL3NyYy9hcHAvZm9vL2Zvby5zZXJ2aWNlLnRzJyk7XG4gICAgZXhwZWN0KGNvbnRlbnQpLnRvTWF0Y2goL3Byb3ZpZGVkSW46ICdyb290Jy8pO1xuICB9KTtcblxuICBpdCgnc2hvdWxkIHJlc3BlY3QgdGhlIHNwZWMgZmxhZycsICgpID0+IHtcbiAgICBjb25zdCBvcHRpb25zID0geyAuLi5kZWZhdWx0T3B0aW9ucywgc3BlYzogZmFsc2UgfTtcblxuICAgIGNvbnN0IHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdzZXJ2aWNlJywgb3B0aW9ucywgYXBwVHJlZSk7XG4gICAgY29uc3QgZmlsZXMgPSB0cmVlLmZpbGVzO1xuICAgIGV4cGVjdChmaWxlcy5pbmRleE9mKCcvcHJvamVjdHMvYmFyL3NyYy9hcHAvZm9vL2Zvby5zZXJ2aWNlLnRzJykpLnRvQmVHcmVhdGVyVGhhbk9yRXF1YWwoMCk7XG4gICAgZXhwZWN0KGZpbGVzLmluZGV4T2YoJy9wcm9qZWN0cy9iYXIvc3JjL2FwcC9mb28vZm9vLnNlcnZpY2Uuc3BlYy50cycpKS50b0VxdWFsKC0xKTtcbiAgfSk7XG5cbiAgaXQoJ3Nob3VsZCByZXNwZWN0IHRoZSBzb3VyY2VSb290IHZhbHVlJywgKCkgPT4ge1xuICAgIGNvbnN0IGNvbmZpZyA9IEpTT04ucGFyc2UoYXBwVHJlZS5yZWFkQ29udGVudCgnL2FuZ3VsYXIuanNvbicpKTtcbiAgICBjb25maWcucHJvamVjdHMuYmFyLnNvdXJjZVJvb3QgPSAncHJvamVjdHMvYmFyL2N1c3RvbSc7XG4gICAgYXBwVHJlZS5vdmVyd3JpdGUoJy9hbmd1bGFyLmpzb24nLCBKU09OLnN0cmluZ2lmeShjb25maWcsIG51bGwsIDIpKTtcbiAgICBhcHBUcmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnc2VydmljZScsIGRlZmF1bHRPcHRpb25zLCBhcHBUcmVlKTtcbiAgICBleHBlY3QoYXBwVHJlZS5maWxlcy5pbmRleE9mKCcvcHJvamVjdHMvYmFyL2N1c3RvbS9hcHAvZm9vL2Zvby5zZXJ2aWNlLnRzJykpXG4gICAgICAudG9CZUdyZWF0ZXJUaGFuT3JFcXVhbCgwKTtcbiAgfSk7XG59KTtcbiJdfQ==