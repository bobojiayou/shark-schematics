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
describe('Service Worker Schematic', () => {
    const schematicRunner = new testing_1.SchematicTestRunner('@schematics/angular', path.join(__dirname, '../collection.json'));
    const defaultOptions = {
        project: 'bar',
        target: 'build',
        configuration: 'production',
    };
    let appTree;
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
    beforeEach(() => {
        appTree = schematicRunner.runSchematic('workspace', workspaceOptions);
        appTree = schematicRunner.runSchematic('application', appOptions, appTree);
    });
    it('should update the proudction configuration', () => {
        const tree = schematicRunner.runSchematic('service-worker', defaultOptions, appTree);
        const configText = tree.readContent('/angular.json');
        const config = JSON.parse(configText);
        const swFlag = config.projects.bar.architect.build.configurations.production.serviceWorker;
        expect(swFlag).toEqual(true);
    });
    it('should update the target options if no configuration is set', () => {
        const options = Object.assign({}, defaultOptions, { configuration: '' });
        const tree = schematicRunner.runSchematic('service-worker', options, appTree);
        const configText = tree.readContent('/angular.json');
        const config = JSON.parse(configText);
        const swFlag = config.projects.bar.architect.build.options.serviceWorker;
        expect(swFlag).toEqual(true);
    });
    it('should add the necessary dependency', () => {
        const tree = schematicRunner.runSchematic('service-worker', defaultOptions, appTree);
        const pkgText = tree.readContent('/package.json');
        const pkg = JSON.parse(pkgText);
        const version = pkg.dependencies['@angular/core'];
        expect(pkg.dependencies['@angular/service-worker']).toEqual(version);
    });
    it('should import ServiceWorkerModule', () => {
        const tree = schematicRunner.runSchematic('service-worker', defaultOptions, appTree);
        const pkgText = tree.readContent('/projects/bar/src/app/app.module.ts');
        expect(pkgText).toMatch(/import \{ ServiceWorkerModule \} from '@angular\/service-worker'/);
    });
    it('should import environment', () => {
        const tree = schematicRunner.runSchematic('service-worker', defaultOptions, appTree);
        const pkgText = tree.readContent('/projects/bar/src/app/app.module.ts');
        expect(pkgText).toMatch(/import \{ environment \} from '\.\.\/environments\/environment'/);
    });
    it('should add the SW import to the NgModule imports', () => {
        const tree = schematicRunner.runSchematic('service-worker', defaultOptions, appTree);
        const pkgText = tree.readContent('/projects/bar/src/app/app.module.ts');
        // tslint:disable-next-line:max-line-length
        const regex = /ServiceWorkerModule\.register\('\/ngsw-worker.js\', { enabled: environment.production }\)/;
        expect(pkgText).toMatch(regex);
    });
    it('should put the ngsw-config.json file in the project root', () => {
        const tree = schematicRunner.runSchematic('service-worker', defaultOptions, appTree);
        const path = '/projects/bar/ngsw-config.json';
        expect(tree.exists(path)).toEqual(true);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXhfc3BlYy5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvYm9iby9Xb3JrL2dpdGh1Yi9zaGFyay1zY2hlbWF0aWNzL3NyYy8iLCJzb3VyY2VzIjpbInNyYy9zZXJ2aWNlLXdvcmtlci9pbmRleF9zcGVjLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7OztHQU1HO0FBQ0gsZ0VBQXVGO0FBQ3ZGLDZCQUE2QjtBQU03QixRQUFRLENBQUMsMEJBQTBCLEVBQUUsR0FBRyxFQUFFO0lBQ3hDLE1BQU0sZUFBZSxHQUFHLElBQUksNkJBQW1CLENBQzdDLHFCQUFxQixFQUNyQixJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxvQkFBb0IsQ0FBQyxDQUMzQyxDQUFDO0lBQ0YsTUFBTSxjQUFjLEdBQXlCO1FBQzNDLE9BQU8sRUFBRSxLQUFLO1FBQ2QsTUFBTSxFQUFFLE9BQU87UUFDZixhQUFhLEVBQUUsWUFBWTtLQUM1QixDQUFDO0lBRUYsSUFBSSxPQUFxQixDQUFDO0lBRTFCLE1BQU0sZ0JBQWdCLEdBQXFCO1FBQ3pDLElBQUksRUFBRSxXQUFXO1FBQ2pCLGNBQWMsRUFBRSxVQUFVO1FBQzFCLE9BQU8sRUFBRSxPQUFPO0tBQ2pCLENBQUM7SUFFRixNQUFNLFVBQVUsR0FBdUI7UUFDckMsSUFBSSxFQUFFLEtBQUs7UUFDWCxXQUFXLEVBQUUsS0FBSztRQUNsQixjQUFjLEVBQUUsS0FBSztRQUNyQixPQUFPLEVBQUUsS0FBSztRQUNkLEtBQUssRUFBRSxLQUFLO1FBQ1osU0FBUyxFQUFFLEtBQUs7UUFDaEIsZUFBZSxFQUFFLEtBQUs7S0FDdkIsQ0FBQztJQUVGLFVBQVUsQ0FBQyxHQUFHLEVBQUU7UUFDZCxPQUFPLEdBQUcsZUFBZSxDQUFDLFlBQVksQ0FBQyxXQUFXLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztRQUN0RSxPQUFPLEdBQUcsZUFBZSxDQUFDLFlBQVksQ0FBQyxhQUFhLEVBQUUsVUFBVSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQzdFLENBQUMsQ0FBQyxDQUFDO0lBRUgsRUFBRSxDQUFDLDRDQUE0QyxFQUFFLEdBQUcsRUFBRTtRQUNwRCxNQUFNLElBQUksR0FBRyxlQUFlLENBQUMsWUFBWSxDQUFDLGdCQUFnQixFQUFFLGNBQWMsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNyRixNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQ3JELE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDdEMsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQztRQUMzRixNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQy9CLENBQUMsQ0FBQyxDQUFDO0lBRUgsRUFBRSxDQUFDLDZEQUE2RCxFQUFFLEdBQUcsRUFBRTtRQUNyRSxNQUFNLE9BQU8scUJBQU8sY0FBYyxJQUFFLGFBQWEsRUFBRSxFQUFFLEdBQUMsQ0FBQztRQUN2RCxNQUFNLElBQUksR0FBRyxlQUFlLENBQUMsWUFBWSxDQUFDLGdCQUFnQixFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztRQUM5RSxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQ3JELE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDdEMsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDO1FBQ3pFLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDL0IsQ0FBQyxDQUFDLENBQUM7SUFFSCxFQUFFLENBQUMscUNBQXFDLEVBQUUsR0FBRyxFQUFFO1FBQzdDLE1BQU0sSUFBSSxHQUFHLGVBQWUsQ0FBQyxZQUFZLENBQUMsZ0JBQWdCLEVBQUUsY0FBYyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3JGLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDbEQsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNoQyxNQUFNLE9BQU8sR0FBRyxHQUFHLENBQUMsWUFBWSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQ2xELE1BQU0sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLHlCQUF5QixDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDdkUsQ0FBQyxDQUFDLENBQUM7SUFFSCxFQUFFLENBQUMsbUNBQW1DLEVBQUUsR0FBRyxFQUFFO1FBQzNDLE1BQU0sSUFBSSxHQUFHLGVBQWUsQ0FBQyxZQUFZLENBQUMsZ0JBQWdCLEVBQUUsY0FBYyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3JGLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMscUNBQXFDLENBQUMsQ0FBQztRQUN4RSxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTyxDQUFDLGtFQUFrRSxDQUFDLENBQUM7SUFDOUYsQ0FBQyxDQUFDLENBQUM7SUFFSCxFQUFFLENBQUMsMkJBQTJCLEVBQUUsR0FBRyxFQUFFO1FBQ25DLE1BQU0sSUFBSSxHQUFHLGVBQWUsQ0FBQyxZQUFZLENBQUMsZ0JBQWdCLEVBQUUsY0FBYyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3JGLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMscUNBQXFDLENBQUMsQ0FBQztRQUN4RSxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTyxDQUFDLGlFQUFpRSxDQUFDLENBQUM7SUFDN0YsQ0FBQyxDQUFDLENBQUM7SUFFSCxFQUFFLENBQUMsa0RBQWtELEVBQUUsR0FBRyxFQUFFO1FBQzFELE1BQU0sSUFBSSxHQUFHLGVBQWUsQ0FBQyxZQUFZLENBQUMsZ0JBQWdCLEVBQUUsY0FBYyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3JGLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMscUNBQXFDLENBQUMsQ0FBQztRQUN4RSwyQ0FBMkM7UUFDM0MsTUFBTSxLQUFLLEdBQUcsMkZBQTJGLENBQUM7UUFDMUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNqQyxDQUFDLENBQUMsQ0FBQztJQUVILEVBQUUsQ0FBQywwREFBMEQsRUFBRSxHQUFHLEVBQUU7UUFDbEUsTUFBTSxJQUFJLEdBQUcsZUFBZSxDQUFDLFlBQVksQ0FBQyxnQkFBZ0IsRUFBRSxjQUFjLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDckYsTUFBTSxJQUFJLEdBQUcsZ0NBQWdDLENBQUM7UUFDOUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDMUMsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7IFNjaGVtYXRpY1Rlc3RSdW5uZXIsIFVuaXRUZXN0VHJlZSB9IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9zY2hlbWF0aWNzL3Rlc3RpbmcnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IFNjaGVtYSBhcyBBcHBsaWNhdGlvbk9wdGlvbnMgfSBmcm9tICcuLi9hcHBsaWNhdGlvbi9zY2hlbWEnO1xuaW1wb3J0IHsgU2NoZW1hIGFzIFdvcmtzcGFjZU9wdGlvbnMgfSBmcm9tICcuLi93b3Jrc3BhY2Uvc2NoZW1hJztcbmltcG9ydCB7IFNjaGVtYSBhcyBTZXJ2aWNlV29ya2VyT3B0aW9ucyB9IGZyb20gJy4vc2NoZW1hJztcblxuXG5kZXNjcmliZSgnU2VydmljZSBXb3JrZXIgU2NoZW1hdGljJywgKCkgPT4ge1xuICBjb25zdCBzY2hlbWF0aWNSdW5uZXIgPSBuZXcgU2NoZW1hdGljVGVzdFJ1bm5lcihcbiAgICAnQHNjaGVtYXRpY3MvYW5ndWxhcicsXG4gICAgcGF0aC5qb2luKF9fZGlybmFtZSwgJy4uL2NvbGxlY3Rpb24uanNvbicpLFxuICApO1xuICBjb25zdCBkZWZhdWx0T3B0aW9uczogU2VydmljZVdvcmtlck9wdGlvbnMgPSB7XG4gICAgcHJvamVjdDogJ2JhcicsXG4gICAgdGFyZ2V0OiAnYnVpbGQnLFxuICAgIGNvbmZpZ3VyYXRpb246ICdwcm9kdWN0aW9uJyxcbiAgfTtcblxuICBsZXQgYXBwVHJlZTogVW5pdFRlc3RUcmVlO1xuXG4gIGNvbnN0IHdvcmtzcGFjZU9wdGlvbnM6IFdvcmtzcGFjZU9wdGlvbnMgPSB7XG4gICAgbmFtZTogJ3dvcmtzcGFjZScsXG4gICAgbmV3UHJvamVjdFJvb3Q6ICdwcm9qZWN0cycsXG4gICAgdmVyc2lvbjogJzYuMC4wJyxcbiAgfTtcblxuICBjb25zdCBhcHBPcHRpb25zOiBBcHBsaWNhdGlvbk9wdGlvbnMgPSB7XG4gICAgbmFtZTogJ2JhcicsXG4gICAgaW5saW5lU3R5bGU6IGZhbHNlLFxuICAgIGlubGluZVRlbXBsYXRlOiBmYWxzZSxcbiAgICByb3V0aW5nOiBmYWxzZSxcbiAgICBzdHlsZTogJ2NzcycsXG4gICAgc2tpcFRlc3RzOiBmYWxzZSxcbiAgICBza2lwUGFja2FnZUpzb246IGZhbHNlLFxuICB9O1xuXG4gIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgIGFwcFRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCd3b3Jrc3BhY2UnLCB3b3Jrc3BhY2VPcHRpb25zKTtcbiAgICBhcHBUcmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnYXBwbGljYXRpb24nLCBhcHBPcHRpb25zLCBhcHBUcmVlKTtcbiAgfSk7XG5cbiAgaXQoJ3Nob3VsZCB1cGRhdGUgdGhlIHByb3VkY3Rpb24gY29uZmlndXJhdGlvbicsICgpID0+IHtcbiAgICBjb25zdCB0cmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnc2VydmljZS13b3JrZXInLCBkZWZhdWx0T3B0aW9ucywgYXBwVHJlZSk7XG4gICAgY29uc3QgY29uZmlnVGV4dCA9IHRyZWUucmVhZENvbnRlbnQoJy9hbmd1bGFyLmpzb24nKTtcbiAgICBjb25zdCBjb25maWcgPSBKU09OLnBhcnNlKGNvbmZpZ1RleHQpO1xuICAgIGNvbnN0IHN3RmxhZyA9IGNvbmZpZy5wcm9qZWN0cy5iYXIuYXJjaGl0ZWN0LmJ1aWxkLmNvbmZpZ3VyYXRpb25zLnByb2R1Y3Rpb24uc2VydmljZVdvcmtlcjtcbiAgICBleHBlY3Qoc3dGbGFnKS50b0VxdWFsKHRydWUpO1xuICB9KTtcblxuICBpdCgnc2hvdWxkIHVwZGF0ZSB0aGUgdGFyZ2V0IG9wdGlvbnMgaWYgbm8gY29uZmlndXJhdGlvbiBpcyBzZXQnLCAoKSA9PiB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHsuLi5kZWZhdWx0T3B0aW9ucywgY29uZmlndXJhdGlvbjogJyd9O1xuICAgIGNvbnN0IHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdzZXJ2aWNlLXdvcmtlcicsIG9wdGlvbnMsIGFwcFRyZWUpO1xuICAgIGNvbnN0IGNvbmZpZ1RleHQgPSB0cmVlLnJlYWRDb250ZW50KCcvYW5ndWxhci5qc29uJyk7XG4gICAgY29uc3QgY29uZmlnID0gSlNPTi5wYXJzZShjb25maWdUZXh0KTtcbiAgICBjb25zdCBzd0ZsYWcgPSBjb25maWcucHJvamVjdHMuYmFyLmFyY2hpdGVjdC5idWlsZC5vcHRpb25zLnNlcnZpY2VXb3JrZXI7XG4gICAgZXhwZWN0KHN3RmxhZykudG9FcXVhbCh0cnVlKTtcbiAgfSk7XG5cbiAgaXQoJ3Nob3VsZCBhZGQgdGhlIG5lY2Vzc2FyeSBkZXBlbmRlbmN5JywgKCkgPT4ge1xuICAgIGNvbnN0IHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdzZXJ2aWNlLXdvcmtlcicsIGRlZmF1bHRPcHRpb25zLCBhcHBUcmVlKTtcbiAgICBjb25zdCBwa2dUZXh0ID0gdHJlZS5yZWFkQ29udGVudCgnL3BhY2thZ2UuanNvbicpO1xuICAgIGNvbnN0IHBrZyA9IEpTT04ucGFyc2UocGtnVGV4dCk7XG4gICAgY29uc3QgdmVyc2lvbiA9IHBrZy5kZXBlbmRlbmNpZXNbJ0Bhbmd1bGFyL2NvcmUnXTtcbiAgICBleHBlY3QocGtnLmRlcGVuZGVuY2llc1snQGFuZ3VsYXIvc2VydmljZS13b3JrZXInXSkudG9FcXVhbCh2ZXJzaW9uKTtcbiAgfSk7XG5cbiAgaXQoJ3Nob3VsZCBpbXBvcnQgU2VydmljZVdvcmtlck1vZHVsZScsICgpID0+IHtcbiAgICBjb25zdCB0cmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnc2VydmljZS13b3JrZXInLCBkZWZhdWx0T3B0aW9ucywgYXBwVHJlZSk7XG4gICAgY29uc3QgcGtnVGV4dCA9IHRyZWUucmVhZENvbnRlbnQoJy9wcm9qZWN0cy9iYXIvc3JjL2FwcC9hcHAubW9kdWxlLnRzJyk7XG4gICAgZXhwZWN0KHBrZ1RleHQpLnRvTWF0Y2goL2ltcG9ydCBcXHsgU2VydmljZVdvcmtlck1vZHVsZSBcXH0gZnJvbSAnQGFuZ3VsYXJcXC9zZXJ2aWNlLXdvcmtlcicvKTtcbiAgfSk7XG5cbiAgaXQoJ3Nob3VsZCBpbXBvcnQgZW52aXJvbm1lbnQnLCAoKSA9PiB7XG4gICAgY29uc3QgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ3NlcnZpY2Utd29ya2VyJywgZGVmYXVsdE9wdGlvbnMsIGFwcFRyZWUpO1xuICAgIGNvbnN0IHBrZ1RleHQgPSB0cmVlLnJlYWRDb250ZW50KCcvcHJvamVjdHMvYmFyL3NyYy9hcHAvYXBwLm1vZHVsZS50cycpO1xuICAgIGV4cGVjdChwa2dUZXh0KS50b01hdGNoKC9pbXBvcnQgXFx7IGVudmlyb25tZW50IFxcfSBmcm9tICdcXC5cXC5cXC9lbnZpcm9ubWVudHNcXC9lbnZpcm9ubWVudCcvKTtcbiAgfSk7XG5cbiAgaXQoJ3Nob3VsZCBhZGQgdGhlIFNXIGltcG9ydCB0byB0aGUgTmdNb2R1bGUgaW1wb3J0cycsICgpID0+IHtcbiAgICBjb25zdCB0cmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnc2VydmljZS13b3JrZXInLCBkZWZhdWx0T3B0aW9ucywgYXBwVHJlZSk7XG4gICAgY29uc3QgcGtnVGV4dCA9IHRyZWUucmVhZENvbnRlbnQoJy9wcm9qZWN0cy9iYXIvc3JjL2FwcC9hcHAubW9kdWxlLnRzJyk7XG4gICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm1heC1saW5lLWxlbmd0aFxuICAgIGNvbnN0IHJlZ2V4ID0gL1NlcnZpY2VXb3JrZXJNb2R1bGVcXC5yZWdpc3RlclxcKCdcXC9uZ3N3LXdvcmtlci5qc1xcJywgeyBlbmFibGVkOiBlbnZpcm9ubWVudC5wcm9kdWN0aW9uIH1cXCkvO1xuICAgIGV4cGVjdChwa2dUZXh0KS50b01hdGNoKHJlZ2V4KTtcbiAgfSk7XG5cbiAgaXQoJ3Nob3VsZCBwdXQgdGhlIG5nc3ctY29uZmlnLmpzb24gZmlsZSBpbiB0aGUgcHJvamVjdCByb290JywgKCkgPT4ge1xuICAgIGNvbnN0IHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdzZXJ2aWNlLXdvcmtlcicsIGRlZmF1bHRPcHRpb25zLCBhcHBUcmVlKTtcbiAgICBjb25zdCBwYXRoID0gJy9wcm9qZWN0cy9iYXIvbmdzdy1jb25maWcuanNvbic7XG4gICAgZXhwZWN0KHRyZWUuZXhpc3RzKHBhdGgpKS50b0VxdWFsKHRydWUpO1xuICB9KTtcbn0pO1xuIl19