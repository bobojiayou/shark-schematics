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
describe('Module Schematic', () => {
    const schematicRunner = new testing_1.SchematicTestRunner('@schematics/angular', path.join(__dirname, '../collection.json'));
    const defaultOptions = {
        name: 'foo',
        spec: true,
        module: undefined,
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
    it('should create a module', () => {
        const options = Object.assign({}, defaultOptions);
        const tree = schematicRunner.runSchematic('module', options, appTree);
        const files = tree.files;
        expect(files.indexOf('/projects/bar/src/app/foo/foo.module.spec.ts')).toBeGreaterThanOrEqual(0);
        expect(files.indexOf('/projects/bar/src/app/foo/foo.module.ts')).toBeGreaterThanOrEqual(0);
    });
    it('should import into another module', () => {
        const options = Object.assign({}, defaultOptions, { module: 'app.module.ts' });
        const tree = schematicRunner.runSchematic('module', options, appTree);
        const content = tree.readContent('/projects/bar/src/app/app.module.ts');
        expect(content).toMatch(/import { FooModule } from '.\/foo\/foo.module'/);
        expect(content).toMatch(/imports: \[[^\]]*FooModule[^\]]*\]/m);
    });
    it('should import into another module (deep)', () => {
        let tree = appTree;
        tree = schematicRunner.runSchematic('module', Object.assign({}, defaultOptions, { path: 'projects/bar/src/app/sub1', name: 'test1' }), tree);
        tree = schematicRunner.runSchematic('module', Object.assign({}, defaultOptions, { path: 'projects/bar/src/app/sub2', name: 'test2', module: '../sub1/test1' }), tree);
        const content = tree.readContent('/projects/bar/src/app/sub1/test1/test1.module.ts');
        expect(content).toMatch(/import { Test2Module } from '..\/..\/sub2\/test2\/test2.module'/);
    });
    it('should create a routing module', () => {
        const options = Object.assign({}, defaultOptions, { routing: true });
        const tree = schematicRunner.runSchematic('module', options, appTree);
        const files = tree.files;
        expect(files.indexOf('/projects/bar/src/app/foo/foo.module.ts')).toBeGreaterThanOrEqual(0);
        expect(files.indexOf('/projects/bar/src/app/foo/foo-routing.module.ts')).toBeGreaterThanOrEqual(0);
        const moduleContent = tree.readContent('/projects/bar/src/app/foo/foo.module.ts');
        expect(moduleContent).toMatch(/import { FooRoutingModule } from '.\/foo-routing.module'/);
        const routingModuleContent = tree.readContent('/projects/bar/src/app/foo/foo-routing.module.ts');
        expect(routingModuleContent).toMatch(/RouterModule.forChild\(routes\)/);
    });
    it('should respect the spec flag', () => {
        const options = Object.assign({}, defaultOptions, { spec: false });
        const tree = schematicRunner.runSchematic('module', options, appTree);
        const files = tree.files;
        expect(files.indexOf('/projects/bar/src/app/foo/foo.module.ts')).toBeGreaterThanOrEqual(0);
        expect(files.indexOf('/projects/bar/src/app/foo/foo.module.spec.ts')).toEqual(-1);
    });
    it('should dasherize a name', () => {
        const options = Object.assign({}, defaultOptions, { name: 'TwoWord' });
        const tree = schematicRunner.runSchematic('module', options, appTree);
        const files = tree.files;
        expect(files.indexOf('/projects/bar/src/app/two-word/two-word.module.ts'))
            .toBeGreaterThanOrEqual(0);
        expect(files.indexOf('/projects/bar/src/app/two-word/two-word.module.spec.ts'))
            .toBeGreaterThanOrEqual(0);
    });
    it('should respect the sourceRoot value', () => {
        const config = JSON.parse(appTree.readContent('/angular.json'));
        config.projects.bar.sourceRoot = 'projects/bar/custom';
        appTree.overwrite('/angular.json', JSON.stringify(config, null, 2));
        appTree = schematicRunner.runSchematic('module', defaultOptions, appTree);
        expect(appTree.files.indexOf('/projects/bar/custom/app/foo/foo.module.ts'))
            .toBeGreaterThanOrEqual(0);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXhfc3BlYy5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvYm9iby9Xb3JrL2dpdGh1Yi9zaGFyay1zY2hlbWF0aWNzL3NyYy8iLCJzb3VyY2VzIjpbInNyYy9tb2R1bGUvaW5kZXhfc3BlYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7R0FNRztBQUNILGdFQUF1RjtBQUN2Riw2QkFBNkI7QUFLN0IsaUNBQWlDO0FBQ2pDLFFBQVEsQ0FBQyxrQkFBa0IsRUFBRSxHQUFHLEVBQUU7SUFDaEMsTUFBTSxlQUFlLEdBQUcsSUFBSSw2QkFBbUIsQ0FDN0MscUJBQXFCLEVBQ3JCLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLG9CQUFvQixDQUFDLENBQzNDLENBQUM7SUFDRixNQUFNLGNBQWMsR0FBa0I7UUFDcEMsSUFBSSxFQUFFLEtBQUs7UUFDWCxJQUFJLEVBQUUsSUFBSTtRQUNWLE1BQU0sRUFBRSxTQUFTO1FBQ2pCLElBQUksRUFBRSxLQUFLO1FBQ1gsT0FBTyxFQUFFLEtBQUs7S0FDZixDQUFDO0lBRUYsTUFBTSxnQkFBZ0IsR0FBcUI7UUFDekMsSUFBSSxFQUFFLFdBQVc7UUFDakIsY0FBYyxFQUFFLFVBQVU7UUFDMUIsT0FBTyxFQUFFLE9BQU87S0FDakIsQ0FBQztJQUVGLE1BQU0sVUFBVSxHQUF1QjtRQUNyQyxJQUFJLEVBQUUsS0FBSztRQUNYLFdBQVcsRUFBRSxLQUFLO1FBQ2xCLGNBQWMsRUFBRSxLQUFLO1FBQ3JCLE9BQU8sRUFBRSxLQUFLO1FBQ2QsS0FBSyxFQUFFLEtBQUs7UUFDWixTQUFTLEVBQUUsS0FBSztRQUNoQixlQUFlLEVBQUUsS0FBSztLQUN2QixDQUFDO0lBQ0YsSUFBSSxPQUFxQixDQUFDO0lBQzFCLFVBQVUsQ0FBQyxHQUFHLEVBQUU7UUFDZCxPQUFPLEdBQUcsZUFBZSxDQUFDLFlBQVksQ0FBQyxXQUFXLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztRQUN0RSxPQUFPLEdBQUcsZUFBZSxDQUFDLFlB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LENBQUMsQ0FBQyxDQUFDO0lBRUgsRUFBRSxDQUFDLHFDQUFxQyxFQUFFLEdBQUcsRUFBRTtRQUM3QyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztRQUNoRSxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxVQUFVLEdBQUcscUJBQXFCLENBQUM7UUFDdkQsT0FBTyxDQUFDLFNBQVMsQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDcEUsT0FBTyxHQUFHLGVBQWUsQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLGNBQWMsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUMxRSxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsNENBQTRDLENBQUMsQ0FBQzthQUN4RSxzQkFBc0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMvQixDQUFDLENBQUMsQ0FBQztBQUNMLENBQUMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHsgU2NoZW1hdGljVGVzdFJ1bm5lciwgVW5pdFRlc3RUcmVlIH0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L3NjaGVtYXRpY3MvdGVzdGluZyc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgU2NoZW1hIGFzIEFwcGxpY2F0aW9uT3B0aW9ucyB9IGZyb20gJy4uL2FwcGxpY2F0aW9uL3NjaGVtYSc7XG5pbXBvcnQgeyBTY2hlbWEgYXMgV29ya3NwYWNlT3B0aW9ucyB9IGZyb20gJy4uL3dvcmtzcGFjZS9zY2hlbWEnO1xuaW1wb3J0IHsgU2NoZW1hIGFzIE1vZHVsZU9wdGlvbnMgfSBmcm9tICcuL3NjaGVtYSc7XG5cbi8vIHRzbGludDpkaXNhYmxlOm1heC1saW5lLWxlbmd0aFxuZGVzY3JpYmUoJ01vZHVsZSBTY2hlbWF0aWMnLCAoKSA9PiB7XG4gIGNvbnN0IHNjaGVtYXRpY1J1bm5lciA9IG5ldyBTY2hlbWF0aWNUZXN0UnVubmVyKFxuICAgICdAc2NoZW1hdGljcy9hbmd1bGFyJyxcbiAgICBwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4vY29sbGVjdGlvbi5qc29uJyksXG4gICk7XG4gIGNvbnN0IGRlZmF1bHRPcHRpb25zOiBNb2R1bGVPcHRpb25zID0ge1xuICAgIG5hbWU6ICdmb28nLFxuICAgIHNwZWM6IHRydWUsXG4gICAgbW9kdWxlOiB1bmRlZmluZWQsXG4gICAgZmxhdDogZmFsc2UsXG4gICAgcHJvamVjdDogJ2JhcicsXG4gIH07XG5cbiAgY29uc3Qgd29ya3NwYWNlT3B0aW9uczogV29ya3NwYWNlT3B0aW9ucyA9IHtcbiAgICBuYW1lOiAnd29ya3NwYWNlJyxcbiAgICBuZXdQcm9qZWN0Um9vdDogJ3Byb2plY3RzJyxcbiAgICB2ZXJzaW9uOiAnNi4wLjAnLFxuICB9O1xuXG4gIGNvbnN0IGFwcE9wdGlvbnM6IEFwcGxpY2F0aW9uT3B0aW9ucyA9IHtcbiAgICBuYW1lOiAnYmFyJyxcbiAgICBpbmxpbmVTdHlsZTogZmFsc2UsXG4gICAgaW5saW5lVGVtcGxhdGU6IGZhbHNlLFxuICAgIHJvdXRpbmc6IGZhbHNlLFxuICAgIHN0eWxlOiAnY3NzJyxcbiAgICBza2lwVGVzdHM6IGZhbHNlLFxuICAgIHNraXBQYWNrYWdlSnNvbjogZmFsc2UsXG4gIH07XG4gIGxldCBhcHBUcmVlOiBVbml0VGVzdFRyZWU7XG4gIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgIGFwcFRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCd3b3Jrc3BhY2UnLCB3b3Jrc3BhY2VPcHRpb25zKTtcbiAgICBhcHBUcmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnYXBwbGljYXRpb24nLCBhcHBPcHRpb25zLCBhcHBUcmVlKTtcbiAgfSk7XG5cbiAgaXQoJ3Nob3VsZCBjcmVhdGUgYSBtb2R1bGUnLCAoKSA9PiB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHsgLi4uZGVmYXVsdE9wdGlvbnMgfTtcblxuICAgIGNvbnN0IHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdtb2R1bGUnLCBvcHRpb25zLCBhcHBUcmVlKTtcbiAgICBjb25zdCBmaWxlcyA9IHRyZWUuZmlsZXM7XG4gICAgZXhwZWN0KGZpbGVzLmluZGV4T2YoJy9wcm9qZWN0cy9iYXIvc3JjL2FwcC9mb28vZm9vLm1vZHVsZS5zcGVjLnRzJykpLnRvQmVHcmVhdGVyVGhhbk9yRXF1YWwoMCk7XG4gICAgZXhwZWN0KGZpbGVzLmluZGV4T2YoJy9wcm9qZWN0cy9iYXIvc3JjL2FwcC9mb28vZm9vLm1vZHVsZS50cycpKS50b0JlR3JlYXRlclRoYW5PckVxdWFsKDApO1xuICB9KTtcblxuICBpdCgnc2hvdWxkIGltcG9ydCBpbnRvIGFub3RoZXIgbW9kdWxlJywgKCkgPT4ge1xuICAgIGNvbnN0IG9wdGlvbnMgPSB7IC4uLmRlZmF1bHRPcHRpb25zLCBtb2R1bGU6ICdhcHAubW9kdWxlLnRzJyB9O1xuXG4gICAgY29uc3QgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ21vZHVsZScsIG9wdGlvbnMsIGFwcFRyZWUpO1xuICAgIGNvbnN0IGNvbnRlbnQgPSB0cmVlLnJlYWRDb250ZW50KCcvcHJvamVjdHMvYmFyL3NyYy9hcHAvYXBwLm1vZHVsZS50cycpO1xuICAgIGV4cGVjdChjb250ZW50KS50b01hdGNoKC9pbXBvcnQgeyBGb29Nb2R1bGUgfSBmcm9tICcuXFwvZm9vXFwvZm9vLm1vZHVsZScvKTtcbiAgICBleHBlY3QoY29udGVudCkudG9NYXRjaCgvaW1wb3J0czogXFxbW15cXF1dKkZvb01vZHVsZVteXFxdXSpcXF0vbSk7XG4gIH0pO1xuXG4gIGl0KCdzaG91bGQgaW1wb3J0IGludG8gYW5vdGhlciBtb2R1bGUgKGRlZXApJywgKCkgPT4ge1xuICAgIGxldCB0cmVlID0gYXBwVHJlZTtcblxuICAgIHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdtb2R1bGUnLCB7XG4gICAgICAuLi5kZWZhdWx0T3B0aW9ucyxcbiAgICAgIHBhdGg6ICdwcm9qZWN0cy9iYXIvc3JjL2FwcC9zdWIxJyxcbiAgICAgIG5hbWU6ICd0ZXN0MScsXG4gICAgfSwgdHJlZSk7XG4gICAgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ21vZHVsZScsIHtcbiAgICAgIC4uLmRlZmF1bHRPcHRpb25zLFxuICAgICAgcGF0aDogJ3Byb2plY3RzL2Jhci9zcmMvYXBwL3N1YjInLFxuICAgICAgbmFtZTogJ3Rlc3QyJyxcbiAgICAgIG1vZHVsZTogJy4uL3N1YjEvdGVzdDEnLFxuICAgIH0sIHRyZWUpO1xuXG4gICAgY29uc3QgY29udGVudCA9IHRyZWUucmVhZENvbnRlbnQoJy9wcm9qZWN0cy9iYXIvc3JjL2FwcC9zdWIxL3Rlc3QxL3Rlc3QxLm1vZHVsZS50cycpO1xuICAgIGV4cGVjdChjb250ZW50KS50b01hdGNoKC9pbXBvcnQgeyBUZXN0Mk1vZHVsZSB9IGZyb20gJy4uXFwvLi5cXC9zdWIyXFwvdGVzdDJcXC90ZXN0Mi5tb2R1bGUnLyk7XG4gIH0pO1xuXG4gIGl0KCdzaG91bGQgY3JlYXRlIGEgcm91dGluZyBtb2R1bGUnLCAoKSA9PiB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHsgLi4uZGVmYXVsdE9wdGlvbnMsIHJvdXRpbmc6IHRydWUgfTtcblxuICAgIGNvbnN0IHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdtb2R1bGUnLCBvcHRpb25zLCBhcHBUcmVlKTtcbiAgICBjb25zdCBmaWxlcyA9IHRyZWUuZmlsZXM7XG4gICAgZXhwZWN0KGZpbGVzLmluZGV4T2YoJy9wcm9qZWN0cy9iYXIvc3JjL2FwcC9mb28vZm9vLm1vZHVsZS50cycpKS50b0JlR3JlYXRlclRoYW5PckVxdWFsKDApO1xuICAgIGV4cGVjdChmaWxlcy5pbmRleE9mKCcvcHJvamVjdHMvYmFyL3NyYy9hcHAvZm9vL2Zvby1yb3V0aW5nLm1vZHVsZS50cycpKS50b0JlR3JlYXRlclRoYW5PckVxdWFsKDApO1xuICAgIGNvbnN0IG1vZHVsZUNvbnRlbnQgPSB0cmVlLnJlYWRDb250ZW50KCcvcHJvamVjdHMvYmFyL3NyYy9hcHAvZm9vL2Zvby5tb2R1bGUudHMnKTtcbiAgICBleHBlY3QobW9kdWxlQ29udGVudCkudG9NYXRjaCgvaW1wb3J0IHsgRm9vUm91dGluZ01vZHVsZSB9IGZyb20gJy5cXC9mb28tcm91dGluZy5tb2R1bGUnLyk7XG4gICAgY29uc3Qgcm91dGluZ01vZHVsZUNvbnRlbnQgPSB0cmVlLnJlYWRDb250ZW50KCcvcHJvamVjdHMvYmFyL3NyYy9hcHAvZm9vL2Zvby1yb3V0aW5nLm1vZHVsZS50cycpO1xuICAgIGV4cGVjdChyb3V0aW5nTW9kdWxlQ29udGVudCkudG9NYXRjaCgvUm91dGVyTW9kdWxlLmZvckNoaWxkXFwocm91dGVzXFwpLyk7XG4gIH0pO1xuXG4gIGl0KCdzaG91bGQgcmVzcGVjdCB0aGUgc3BlYyBmbGFnJywgKCkgPT4ge1xuICAgIGNvbnN0IG9wdGlvbnMgPSB7IC4uLmRlZmF1bHRPcHRpb25zLCBzcGVjOiBmYWxzZSB9O1xuXG4gICAgY29uc3QgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ21vZHVsZScsIG9wdGlvbnMsIGFwcFRyZWUpO1xuICAgIGNvbnN0IGZpbGVzID0gdHJlZS5maWxlcztcbiAgICBleHBlY3QoZmlsZXMuaW5kZXhPZignL3Byb2plY3RzL2Jhci9zcmMvYXBwL2Zvby9mb28ubW9kdWxlLnRzJykpLnRvQmVHcmVhdGVyVGhhbk9yRXF1YWwoMCk7XG4gICAgZXhwZWN0KGZpbGVzLmluZGV4T2YoJy9wcm9qZWN0cy9iYXIvc3JjL2FwcC9mb28vZm9vLm1vZHVsZS5zcGVjLnRzJykpLnRvRXF1YWwoLTEpO1xuICB9KTtcblxuICBpdCgnc2hvdWxkIGRhc2hlcml6ZSBhIG5hbWUnLCAoKSA9PiB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHsgLi4uZGVmYXVsdE9wdGlvbnMsIG5hbWU6ICdUd29Xb3JkJyB9O1xuXG4gICAgY29uc3QgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ21vZHVsZScsIG9wdGlvbnMsIGFwcFRyZWUpO1xuICAgIGNvbnN0IGZpbGVzID0gdHJlZS5maWxlcztcbiAgICBleHBlY3QoZmlsZXMuaW5kZXhPZignL3Byb2plY3RzL2Jhci9zcmMvYXBwL3R3by13b3JkL3R3by13b3JkLm1vZHVsZS50cycpKVxuICAgICAgLnRvQmVHcmVhdGVyVGhhbk9yRXF1YWwoMCk7XG4gICAgZXhwZWN0KGZpbGVzLmluZGV4T2YoJy9wcm9qZWN0cy9iYXIvc3JjL2FwcC90d28td29yZC90d28td29yZC5tb2R1bGUuc3BlYy50cycpKVxuICAgICAgLnRvQmVHcmVhdGVyVGhhbk9yRXF1YWwoMCk7XG4gIH0pO1xuXG4gIGl0KCdzaG91bGQgcmVzcGVjdCB0aGUgc291cmNlUm9vdCB2YWx1ZScsICgpID0+IHtcbiAgICBjb25zdCBjb25maWcgPSBKU09OLnBhcnNlKGFwcFRyZWUucmVhZENvbnRlbnQoJy9hbmd1bGFyLmpzb24nKSk7XG4gICAgY29uZmlnLnByb2plY3RzLmJhci5zb3VyY2VSb290ID0gJ3Byb2plY3RzL2Jhci9jdXN0b20nO1xuICAgIGFwcFRyZWUub3ZlcndyaXRlKCcvYW5ndWxhci5qc29uJywgSlNPTi5zdHJpbmdpZnkoY29uZmlnLCBudWxsLCAyKSk7XG4gICAgYXBwVHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ21vZHVsZScsIGRlZmF1bHRPcHRpb25zLCBhcHBUcmVlKTtcbiAgICBleHBlY3QoYXBwVHJlZS5maWxlcy5pbmRleE9mKCcvcHJvamVjdHMvYmFyL2N1c3RvbS9hcHAvZm9vL2Zvby5tb2R1bGUudHMnKSlcbiAgICAgIC50b0JlR3JlYXRlclRoYW5PckVxdWFsKDApO1xuICB9KTtcbn0pO1xuIl19