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
describe('Pipe Schematic', () => {
    const schematicRunner = new testing_1.SchematicTestRunner('@schematics/angular', path.join(__dirname, '../collection.json'));
    const defaultOptions = {
        name: 'foo',
        spec: true,
        module: undefined,
        export: false,
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
    it('should create a pipe', () => {
        const options = Object.assign({}, defaultOptions);
        const tree = schematicRunner.runSchematic('pipe', options, appTree);
        const files = tree.files;
        expect(files.indexOf('/projects/bar/src/app/foo.pipe.spec.ts')).toBeGreaterThanOrEqual(0);
        expect(files.indexOf('/projects/bar/src/app/foo.pipe.ts')).toBeGreaterThanOrEqual(0);
        const moduleContent = test_1.getFileContent(tree, '/projects/bar/src/app/app.module.ts');
        expect(moduleContent).toMatch(/import.*Foo.*from '.\/foo.pipe'/);
        expect(moduleContent).toMatch(/declarations:\s*\[[^\]]+?,\r?\n\s+FooPipe\r?\n/m);
    });
    it('should import into a specified module', () => {
        const options = Object.assign({}, defaultOptions, { module: 'app.module.ts' });
        const tree = schematicRunner.runSchematic('pipe', options, appTree);
        const appModule = test_1.getFileContent(tree, '/projects/bar/src/app/app.module.ts');
        expect(appModule).toMatch(/import { FooPipe } from '.\/foo.pipe'/);
    });
    it('should fail if specified module does not exist', () => {
        const options = Object.assign({}, defaultOptions, { module: '/projects/bar/src/app/app.moduleXXX.ts' });
        let thrownError = null;
        try {
            schematicRunner.runSchematic('pipe', options, appTree);
        }
        catch (err) {
            thrownError = err;
        }
        expect(thrownError).toBeDefined();
    });
    it('should export the pipe', () => {
        const options = Object.assign({}, defaultOptions, { export: true });
        const tree = schematicRunner.runSchematic('pipe', options, appTree);
        const appModuleContent = test_1.getFileContent(tree, '/projects/bar/src/app/app.module.ts');
        expect(appModuleContent).toMatch(/exports: \[FooPipe\]/);
    });
    it('should respect the flat flag', () => {
        const options = Object.assign({}, defaultOptions, { flat: false });
        const tree = schematicRunner.runSchematic('pipe', options, appTree);
        const files = tree.files;
        expect(files.indexOf('/projects/bar/src/app/foo/foo.pipe.spec.ts')).toBeGreaterThanOrEqual(0);
        expect(files.indexOf('/projects/bar/src/app/foo/foo.pipe.ts')).toBeGreaterThanOrEqual(0);
        const moduleContent = test_1.getFileContent(tree, '/projects/bar/src/app/app.module.ts');
        expect(moduleContent).toMatch(/import.*Foo.*from '.\/foo\/foo.pipe'/);
        expect(moduleContent).toMatch(/declarations:\s*\[[^\]]+?,\r?\n\s+FooPipe\r?\n/m);
    });
    it('should use the module flag even if the module is a routing module', () => {
        const routingFileName = 'app-routing.module.ts';
        const routingModulePath = `/projects/bar/src/app/${routingFileName}`;
        const newTree = test_1.createAppModule(appTree, routingModulePath);
        const options = Object.assign({}, defaultOptions, { module: routingFileName });
        const tree = schematicRunner.runSchematic('pipe', options, newTree);
        const content = test_1.getFileContent(tree, routingModulePath);
        expect(content).toMatch(/import { FooPipe } from '.\/foo.pipe/);
    });
    it('should respect the sourceRoot value', () => {
        const config = JSON.parse(appTree.readContent('/angular.json'));
        config.projects.bar.sourceRoot = 'projects/bar/custom';
        appTree.overwrite('/angular.json', JSON.stringify(config, null, 2));
        // should fail without a module in that dir
        expect(() => schematicRunner.runSchematic('pipe', defaultOptions, appTree)).toThrow();
        // move the module
        appTree.rename('/projects/bar/src/app/app.module.ts', '/projects/bar/custom/app/app.module.ts');
        appTree = schematicRunner.runSchematic('pipe', defaultOptions, appTree);
        expect(appTree.files.indexOf('/projects/bar/custom/app/foo.pipe.ts'))
            .toBeGreaterThanOrEqual(0);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXhfc3BlYy5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvYm9iby9Xb3JrL2dpdGh1Yi9zaGFyay1zY2hlbWF0aWNzL3NyYy8iLCJzb3VyY2VzIjpbInNyYy9waXBlL2luZGV4X3NwZWMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7O0dBTUc7QUFDSCxnRUFBdUY7QUFDdkYsNkJBQTZCO0FBRTdCLDBDQUFrRTtBQUtsRSxRQUFRLENBQUMsZ0JBQWdCLEVBQUUsR0FBRyxFQUFFO0lBQzlCLE1BQU0sZUFBZSxHQUFHLElBQUksNkJBQW1CLENBQzdDLHFCQUFxQixFQUNyQixJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxvQkFBb0IsQ0FBQyxDQUMzQyxDQUFDO0lBQ0YsTUFBTSxjQUFjLEdBQWdCO1FBQ2xDLElBQUksRUFBRSxLQUFLO1FBQ1gsSUFBSSxFQUFFLElBQUk7UUFDVixNQUFNLEVBQUUsU0FBUztRQUNqQixNQUFNLEVBQUUsS0FBSztRQUNiLElBQUksRUFBRSxJQUFJO1FBQ1YsT0FBTyxFQUFFLEtBQUs7S0FDZixDQUFDO0lBRUYsTUFBTSxnQkFBZ0IsR0FBcUI7UUFDekMsSUFBSSxFQUFFLFdBQVc7UUFDakIsY0FBYyxFQUFFLFVBQVU7UUFDMUIsT0FBTyxFQUFFLE9BQU87S0FDakIsQ0FBQztJQUVGLE1BQU0sVUFBVSxHQUF1QjtRQUNyQyxJQUFJLEVBQUUsS0FBSztRQUNYLFdBQVcsRUFBRSxLQUFLO1FBQ2xCLGNBQWMsRUFBRSxLQUFLO1FBQ3JCLE9BQU8sRUFBRSxLQUFLO1FBQ2QsS0FBSyxFQUFFLEtBQUs7UUFDWixTQUFTLEVBQUUsS0FBSztRQUNoQixlQUFlLEVBQUUsS0FBSztLQUN2QixDQUFDO0lBQ0YsSUFBSSxPQUFxQixDQUFDO0lBQzFCLFVBQVUsQ0FBQyxHQUFHLEVBQUU7UUFDZCxPQUFPLEdBQUcsZUFBZSxDQUFDLFlBQVksQ0FBQyxXQUFXLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztRQUN0RSxPQUFPLEdBQUcsZUFBZSxDQUFDLFlBQVksQ0FBQyxhQUFhLEVBQUUsVUFBVSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQzdFLENBQUMsQ0FBQyxDQUFDO0lBRUgsRUFBRSxDQUFDLHNCQUFzQixFQUFFLEdBQUcsRUFBRTtRQUM5QixNQUFNLE9BQU8scUJBQVEsY0FBYyxDQUFFLENBQUM7UUFFdEMsTUFBTSxJQUFJLEdBQUcsZUFBZSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3BFLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7UUFDekIsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsd0NBQXdDLENBQUMsQ0FBQyxDQUFDLHNCQUFzQixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzFGLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLG1DQUFtQyxDQUFDLENBQUMsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNyRixNQUFNLGFBQWEsR0FBRyxxQkFBYyxDQUFDLElBQUksRUFBRSxxQ0FBcUMsQ0FBQyxDQUFDO1FBQ2xGLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQyxPQUFPLENBQUMsaUNBQWlDLENBQUMsQ0FBQztRQUNqRSxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUMsT0FBTyxDQUFDLGlEQUFpRCxDQUFDLENBQUM7SUFDbkYsQ0FBQyxDQUFDLENBQUM7SUFFSCxFQUFFLENBQUMsdUNBQXVDLEVBQUUsR0FBRyxFQUFFO1FBQy9DLE1BQU0sT0FBTyxxQkFBUSxjQUFjLElBQUUsTUFBTSxFQUFFLGVBQWUsR0FBRSxDQUFDO1FBRS9ELE1BQU0sSUFBSSxHQUFHLGVBQWUsQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNwRSxNQUFNLFNBQVMsR0FBRyxxQkFBYyxDQUFDLElBQUksRUFBRSxxQ0FBcUMsQ0FBQyxDQUFDO1FBRTlFLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxPQUFPLENBQUMsdUNBQXVDLENBQUMsQ0FBQztJQUNyRSxDQUFDLENBQUMsQ0FBQztJQUVILEVBQUUsQ0FBQyxnREFBZ0QsRUFBRSxHQUFHLEVBQUU7UUFDeEQsTUFBTSxPQUFPLHFCQUFRLGNBQWMsSUFBRSxNQUFNLEVBQUUsd0NBQXdDLEdBQUUsQ0FBQztRQUN4RixJQUFJLFdBQVcsR0FBaUIsSUFBSSxDQUFDO1FBQ3JDLElBQUk7WUFDRixlQUFlLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7U0FDeEQ7UUFBQyxPQUFPLEdBQUcsRUFBRTtZQUNaLFdBQVcsR0FBRyxHQUFHLENBQUM7U0FDbkI7UUFDRCxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDcEMsQ0FBQyxDQUFDLENBQUM7SUFFSCxFQUFFLENBQUMsd0JBQXdCLEVBQUUsR0FBRyxFQUFFO1FBQ2hDLE1BQU0sT0FBTyxxQkFBUSxjQUFjLElBQUUsTUFBTSxFQUFFLElBQUksR0FBRSxDQUFDO1FBRXBELE1BQU0sSUFBSSxHQUFHLGVBQWUsQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNwRSxNQUFNLGdCQUFnQixHQUFHLHFCQUFjLENBQUMsSUFBSSxFQUFFLHFDQUFxQyxDQUFDLENBQUM7UUFDckYsTUFBTSxDQUFDLGdCQUFnQixDQUFDLENBQUMsT0FBTyxDQUFDLHNCQUFzQixDQUFDLENBQUM7SUFDM0QsQ0FBQyxDQUFDLENBQUM7SUFFSCxFQUFFLENBQUMsOEJBQThCLEVBQUUsR0FBRyxFQUFFO1FBQ3RDLE1BQU0sT0FBTyxxQkFBUSxjQUFjLElBQUUsSUFBSSxFQUFFLEtBQUssR0FBRSxDQUFDO1FBRW5ELE1BQU0sSUFBSSxHQUFHLGVBQWUsQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNwRSxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ3pCLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLDRDQUE0QyxDQUFDLENBQUMsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM5RixNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyx1Q0FBdUMsQ0FBQyxDQUFDLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDekYsTUFBTSxhQUFhLEdBQUcscUJBQWMsQ0FBQyxJQUFJLEVBQUUscUNBQXFDLENBQUMsQ0FBQztRQUNsRixNQUFNLENBQUMsYUFBYSxDQUFDLENBQUMsT0FBTyxDQUFDLHNDQUFzQyxDQUFDLENBQUM7UUFDdEUsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxpREFBaUQsQ0FBQyxDQUFDO0lBQ25GLENBQUMsQ0FBQyxDQUFDO0lBRUgsRUFBRSxDQUFDLG1FQUFtRSxFQUFFLEdBQUcsRUFBRTtRQUMzRSxNQUFNLGVBQWUsR0FBRyx1QkFBdUIsQ0FBQztRQUNoRCxNQUFNLGlCQUFpQixHQUFHLHlCQUF5QixlQUFlLEVBQUUsQ0FBQztRQUNyRSxNQUFNLE9BQU8sR0FBRyxzQkFBZSxDQUFDLE9BQU8sRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1FBQzVELE1BQU0sT0FBTyxxQkFBUSxjQUFjLElBQUUsTUFBTSxFQUFFLGVBQWUsR0FBRSxDQUFDO1FBQy9ELE1BQU0sSUFBSSxHQUFHLGVBQWUsQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNwRSxNQUFNLE9BQU8sR0FBRyxxQkFBYyxDQUFDLElBQUksRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1FBQ3hELE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFPLENBQUMsc0NBQXNDLENBQUMsQ0FBQztJQUNsRSxDQUFDLENBQUMsQ0FBQztJQUVILEVBQUUsQ0FBQyxxQ0FBcUMsRUFBRSxHQUFHLEVBQUU7UUFDN0MsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7UUFDaEUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsVUFBVSxHQUFHLHFCQUFxQixDQUFDO1FBQ3ZELE9BQU8sQ0FBQyxTQUFTLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRXBFLDJDQUEyQztRQUMzQyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsZUFBZSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsY0FBYyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7UUFFdEYsa0JBQWtCO1FBQ2xCLE9BQU8sQ0FBQyxNQUFNLENBQUMscUNBQXFDLEVBQUUsd0NBQXdDLENBQUMsQ0FBQztRQUNoRyxPQUFPLEdBQUcsZUFBZSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsY0FBYyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3hFLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFDO2FBQ2xFLHNCQUFzQixDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQy9CLENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQgeyBTY2hlbWF0aWNUZXN0UnVubmVyLCBVbml0VGVzdFRyZWUgfSBmcm9tICdAYW5ndWxhci1kZXZraXQvc2NoZW1hdGljcy90ZXN0aW5nJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBTY2hlbWEgYXMgQXBwbGljYXRpb25PcHRpb25zIH0gZnJvbSAnLi4vYXBwbGljYXRpb24vc2NoZW1hJztcbmltcG9ydCB7IGNyZWF0ZUFwcE1vZHVsZSwgZ2V0RmlsZUNvbnRlbnQgfSBmcm9tICcuLi91dGlsaXR5L3Rlc3QnO1xuaW1wb3J0IHsgU2NoZW1hIGFzIFdvcmtzcGFjZU9wdGlvbnMgfSBmcm9tICcuLi93b3Jrc3BhY2Uvc2NoZW1hJztcbmltcG9ydCB7IFNjaGVtYSBhcyBQaXBlT3B0aW9ucyB9IGZyb20gJy4vc2NoZW1hJztcblxuXG5kZXNjcmliZSgnUGlwZSBTY2hlbWF0aWMnLCAoKSA9PiB7XG4gIGNvbnN0IHNjaGVtYXRpY1J1bm5lciA9IG5ldyBTY2hlbWF0aWNUZXN0UnVubmVyKFxuICAgICdAc2NoZW1hdGljcy9hbmd1bGFyJyxcbiAgICBwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4vY29sbGVjdGlvbi5qc29uJyksXG4gICk7XG4gIGNvbnN0IGRlZmF1bHRPcHRpb25zOiBQaXBlT3B0aW9ucyA9IHtcbiAgICBuYW1lOiAnZm9vJyxcbiAgICBzcGVjOiB0cnVlLFxuICAgIG1vZHVsZTogdW5kZWZpbmVkLFxuICAgIGV4cG9ydDogZmFsc2UsXG4gICAgZmxhdDogdHJ1ZSxcbiAgICBwcm9qZWN0OiAnYmFyJyxcbiAgfTtcblxuICBjb25zdCB3b3Jrc3BhY2VPcHRpb25zOiBXb3Jrc3BhY2VPcHRpb25zID0ge1xuICAgIG5hbWU6ICd3b3Jrc3BhY2UnLFxuICAgIG5ld1Byb2plY3RSb290OiAncHJvamVjdHMnLFxuICAgIHZlcnNpb246ICc2LjAuMCcsXG4gIH07XG5cbiAgY29uc3QgYXBwT3B0aW9uczogQXBwbGljYXRpb25PcHRpb25zID0ge1xuICAgIG5hbWU6ICdiYXInLFxuICAgIGlubGluZVN0eWxlOiBmYWxzZSxcbiAgICBpbmxpbmVUZW1wbGF0ZTogZmFsc2UsXG4gICAgcm91dGluZzogZmFsc2UsXG4gICAgc3R5bGU6ICdjc3MnLFxuICAgIHNraXBUZXN0czogZmFsc2UsXG4gICAgc2tpcFBhY2thZ2VKc29uOiBmYWxzZSxcbiAgfTtcbiAgbGV0IGFwcFRyZWU6IFVuaXRUZXN0VHJlZTtcbiAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgYXBwVHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ3dvcmtzcGFjZScsIHdvcmtzcGFjZU9wdGlvbnMpO1xuICAgIGFwcFRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdhcHBsaWNhdGlvbicsIGFwcE9wdGlvbnMsIGFwcFRyZWUpO1xuICB9KTtcblxuICBpdCgnc2hvdWxkIGNyZWF0ZSBhIHBpcGUnLCAoKSA9PiB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHsgLi4uZGVmYXVsdE9wdGlvbnMgfTtcblxuICAgIGNvbnN0IHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdwaXBlJywgb3B0aW9ucywgYXBwVHJlZSk7XG4gICAgY29uc3QgZmlsZXMgPSB0cmVlLmZpbGVzO1xuICAgIGV4cGVjdChmaWxlcy5pbmRleE9mKCcvcHJvamVjdHMvYmFyL3NyYy9hcHAvZm9vLnBpcGUuc3BlYy50cycpKS50b0JlR3JlYXRlclRoYW5PckVxdWFsKDApO1xuICAgIGV4cGVjdChmaWxlcy5pbmRleE9mKCcvcHJvamVjdHMvYmFyL3NyYy9hcHAvZm9vLnBpcGUudHMnKSkudG9CZUdyZWF0ZXJUaGFuT3JFcXVhbCgwKTtcbiAgICBjb25zdCBtb2R1bGVDb250ZW50ID0gZ2V0RmlsZUNvbnRlbnQodHJlZSwgJy9wcm9qZWN0cy9iYXIvc3JjL2FwcC9hcHAubW9kdWxlLnRzJyk7XG4gICAgZXhwZWN0KG1vZHVsZUNvbnRlbnQpLnRvTWF0Y2goL2ltcG9ydC4qRm9vLipmcm9tICcuXFwvZm9vLnBpcGUnLyk7XG4gICAgZXhwZWN0KG1vZHVsZUNvbnRlbnQpLnRvTWF0Y2goL2RlY2xhcmF0aW9uczpcXHMqXFxbW15cXF1dKz8sXFxyP1xcblxccytGb29QaXBlXFxyP1xcbi9tKTtcbiAgfSk7XG5cbiAgaXQoJ3Nob3VsZCBpbXBvcnQgaW50byBhIHNwZWNpZmllZCBtb2R1bGUnLCAoKSA9PiB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHsgLi4uZGVmYXVsdE9wdGlvbnMsIG1vZHVsZTogJ2FwcC5tb2R1bGUudHMnIH07XG5cbiAgICBjb25zdCB0cmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygncGlwZScsIG9wdGlvbnMsIGFwcFRyZWUpO1xuICAgIGNvbnN0IGFwcE1vZHVsZSA9IGdldEZpbGVDb250ZW50KHRyZWUsICcvcHJvamVjdHMvYmFyL3NyYy9hcHAvYXBwLm1vZHVsZS50cycpO1xuXG4gICAgZXhwZWN0KGFwcE1vZHVsZSkudG9NYXRjaCgvaW1wb3J0IHsgRm9vUGlwZSB9IGZyb20gJy5cXC9mb28ucGlwZScvKTtcbiAgfSk7XG5cbiAgaXQoJ3Nob3VsZCBmYWlsIGlmIHNwZWNpZmllZCBtb2R1bGUgZG9lcyBub3QgZXhpc3QnLCAoKSA9PiB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHsgLi4uZGVmYXVsdE9wdGlvbnMsIG1vZHVsZTogJy9wcm9qZWN0cy9iYXIvc3JjL2FwcC9hcHAubW9kdWxlWFhYLnRzJyB9O1xuICAgIGxldCB0aHJvd25FcnJvcjogRXJyb3IgfCBudWxsID0gbnVsbDtcbiAgICB0cnkge1xuICAgICAgc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygncGlwZScsIG9wdGlvbnMsIGFwcFRyZWUpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgdGhyb3duRXJyb3IgPSBlcnI7XG4gICAgfVxuICAgIGV4cGVjdCh0aHJvd25FcnJvcikudG9CZURlZmluZWQoKTtcbiAgfSk7XG5cbiAgaXQoJ3Nob3VsZCBleHBvcnQgdGhlIHBpcGUnLCAoKSA9PiB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHsgLi4uZGVmYXVsdE9wdGlvbnMsIGV4cG9ydDogdHJ1ZSB9O1xuXG4gICAgY29uc3QgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ3BpcGUnLCBvcHRpb25zLCBhcHBUcmVlKTtcbiAgICBjb25zdCBhcHBNb2R1bGVDb250ZW50ID0gZ2V0RmlsZUNvbnRlbnQodHJlZSwgJy9wcm9qZWN0cy9iYXIvc3JjL2FwcC9hcHAubW9kdWxlLnRzJyk7XG4gICAgZXhwZWN0KGFwcE1vZHVsZUNvbnRlbnQpLnRvTWF0Y2goL2V4cG9ydHM6IFxcW0Zvb1BpcGVcXF0vKTtcbiAgfSk7XG5cbiAgaXQoJ3Nob3VsZCByZXNwZWN0IHRoZSBmbGF0IGZsYWcnLCAoKSA9PiB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHsgLi4uZGVmYXVsdE9wdGlvbnMsIGZsYXQ6IGZhbHNlIH07XG5cbiAgICBjb25zdCB0cmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygncGlwZScsIG9wdGlvbnMsIGFwcFRyZWUpO1xuICAgIGNvbnN0IGZpbGVzID0gdHJlZS5maWxlcztcbiAgICBleHBlY3QoZmlsZXMuaW5kZXhPZignL3Byb2plY3RzL2Jhci9zcmMvYXBwL2Zvby9mb28ucGlwZS5zcGVjLnRzJykpLnRvQmVHcmVhdGVyVGhhbk9yRXF1YWwoMCk7XG4gICAgZXhwZWN0KGZpbGVzLmluZGV4T2YoJy9wcm9qZWN0cy9iYXIvc3JjL2FwcC9mb28vZm9vLnBpcGUudHMnKSkudG9CZUdyZWF0ZXJUaGFuT3JFcXVhbCgwKTtcbiAgICBjb25zdCBtb2R1bGVDb250ZW50ID0gZ2V0RmlsZUNvbnRlbnQodHJlZSwgJy9wcm9qZWN0cy9iYXIvc3JjL2FwcC9hcHAubW9kdWxlLnRzJyk7XG4gICAgZXhwZWN0KG1vZHVsZUNvbnRlbnQpLnRvTWF0Y2goL2ltcG9ydC4qRm9vLipmcm9tICcuXFwvZm9vXFwvZm9vLnBpcGUnLyk7XG4gICAgZXhwZWN0KG1vZHVsZUNvbnRlbnQpLnRvTWF0Y2goL2RlY2xhcmF0aW9uczpcXHMqXFxbW15cXF1dKz8sXFxyP1xcblxccytGb29QaXBlXFxyP1xcbi9tKTtcbiAgfSk7XG5cbiAgaXQoJ3Nob3VsZCB1c2UgdGhlIG1vZHVsZSBmbGFnIGV2ZW4gaWYgdGhlIG1vZHVsZSBpcyBhIHJvdXRpbmcgbW9kdWxlJywgKCkgPT4ge1xuICAgIGNvbnN0IHJvdXRpbmdGaWxlTmFtZSA9ICdhcHAtcm91dGluZy5tb2R1bGUudHMnO1xuICAgIGNvbnN0IHJvdXRpbmdNb2R1bGVQYXRoID0gYC9wcm9qZWN0cy9iYXIvc3JjL2FwcC8ke3JvdXRpbmdGaWxlTmFtZX1gO1xuICAgIGNvbnN0IG5ld1RyZWUgPSBjcmVhdGVBcHBNb2R1bGUoYXBwVHJlZSwgcm91dGluZ01vZHVsZVBhdGgpO1xuICAgIGNvbnN0IG9wdGlvbnMgPSB7IC4uLmRlZmF1bHRPcHRpb25zLCBtb2R1bGU6IHJvdXRpbmdGaWxlTmFtZSB9O1xuICAgIGNvbnN0IHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdwaXBlJywgb3B0aW9ucywgbmV3VHJlZSk7XG4gICAgY29uc3QgY29udGVudCA9IGdldEZpbGVDb250ZW50KHRyZWUsIHJvdXRpbmdNb2R1bGVQYXRoKTtcbiAgICBleHBlY3QoY29udGVudCkudG9NYXRjaCgvaW1wb3J0IHsgRm9vUGlwZSB9IGZyb20gJy5cXC9mb28ucGlwZS8pO1xuICB9KTtcblxuICBpdCgnc2hvdWxkIHJlc3BlY3QgdGhlIHNvdXJjZVJvb3QgdmFsdWUnLCAoKSA9PiB7XG4gICAgY29uc3QgY29uZmlnID0gSlNPTi5wYXJzZShhcHBUcmVlLnJlYWRDb250ZW50KCcvYW5ndWxhci5qc29uJykpO1xuICAgIGNvbmZpZy5wcm9qZWN0cy5iYXIuc291cmNlUm9vdCA9ICdwcm9qZWN0cy9iYXIvY3VzdG9tJztcbiAgICBhcHBUcmVlLm92ZXJ3cml0ZSgnL2FuZ3VsYXIuanNvbicsIEpTT04uc3RyaW5naWZ5KGNvbmZpZywgbnVsbCwgMikpO1xuXG4gICAgLy8gc2hvdWxkIGZhaWwgd2l0aG91dCBhIG1vZHVsZSBpbiB0aGF0IGRpclxuICAgIGV4cGVjdCgoKSA9PiBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdwaXBlJywgZGVmYXVsdE9wdGlvbnMsIGFwcFRyZWUpKS50b1Rocm93KCk7XG5cbiAgICAvLyBtb3ZlIHRoZSBtb2R1bGVcbiAgICBhcHBUcmVlLnJlbmFtZSgnL3Byb2plY3RzL2Jhci9zcmMvYXBwL2FwcC5tb2R1bGUudHMnLCAnL3Byb2plY3RzL2Jhci9jdXN0b20vYXBwL2FwcC5tb2R1bGUudHMnKTtcbiAgICBhcHBUcmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygncGlwZScsIGRlZmF1bHRPcHRpb25zLCBhcHBUcmVlKTtcbiAgICBleHBlY3QoYXBwVHJlZS5maWxlcy5pbmRleE9mKCcvcHJvamVjdHMvYmFyL2N1c3RvbS9hcHAvZm9vLnBpcGUudHMnKSlcbiAgICAgIC50b0JlR3JlYXRlclRoYW5PckVxdWFsKDApO1xuICB9KTtcbn0pO1xuIl19