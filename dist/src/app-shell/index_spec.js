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
describe('App Shell Schematic', () => {
    const schematicRunner = new testing_1.SchematicTestRunner('@schematics/angular', path.join(__dirname, '../collection.json'));
    const defaultOptions = {
        name: 'foo',
        clientProject: 'bar',
        universalProject: 'universal',
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
        routing: true,
        style: 'css',
        skipTests: false,
        skipPackageJson: false,
    };
    let appTree;
    beforeEach(() => {
        appTree = schematicRunner.runSchematic('workspace', workspaceOptions);
        appTree = schematicRunner.runSchematic('application', appOptions, appTree);
    });
    it('should ensure the client app has a router-outlet', () => {
        appTree = schematicRunner.runSchematic('workspace', workspaceOptions);
        appTree = schematicRunner.runSchematic('application', Object.assign({}, appOptions, { routing: false }), appTree);
        expect(() => {
            schematicRunner.runSchematic('appShell', defaultOptions, appTree);
        }).toThrowError();
    });
    it('should add a universal app', () => {
        const tree = schematicRunner.runSchematic('appShell', defaultOptions, appTree);
        const filePath = '/projects/bar/src/app/app.server.module.ts';
        expect(tree.exists(filePath)).toEqual(true);
    });
    it('should add app shell configuration', () => {
        const tree = schematicRunner.runSchematic('appShell', defaultOptions, appTree);
        const filePath = '/angular.json';
        const content = tree.readContent(filePath);
        const workspace = JSON.parse(content);
        const target = workspace.projects.bar.architect['app-shell'];
        expect(target.options.browserTarget).toEqual('bar:build');
        expect(target.options.serverTarget).toEqual('bar:server');
        expect(target.options.route).toEqual('shell');
    });
    it('should add router module to client app module', () => {
        const tree = schematicRunner.runSchematic('appShell', defaultOptions, appTree);
        const filePath = '/projects/bar/src/app/app.module.ts';
        const content = tree.readContent(filePath);
        expect(content).toMatch(/import { RouterModule } from \'@angular\/router\';/);
    });
    describe('Add router-outlet', () => {
        function makeInlineTemplate(tree, template) {
            template = template || `
      <p>
        App works!
      </p>`;
            const newText = `
        import { Component, OnInit } from '@angular/core';

        @Component({
          selector: ''
          template: \`
            ${template}
          \`,
          styleUrls: ['./app.component.css']
        })
        export class AppComponent implements OnInit {

          constructor() { }

          ngOnInit() {
          }

        }

      `;
            tree.overwrite('/projects/bar/src/app/app.component.ts', newText);
            tree.delete('/projects/bar/src/app/app.component.html');
        }
        it('should not re-add the router outlet (external template)', () => {
            const htmlPath = '/projects/bar/src/app/app.component.html';
            appTree.overwrite(htmlPath, '<router-outlet></router-outlet>');
            const tree = schematicRunner.runSchematic('appShell', defaultOptions, appTree);
            const content = tree.readContent(htmlPath);
            const matches = content.match(/<router\-outlet><\/router\-outlet>/g);
            const numMatches = matches ? matches.length : 0;
            expect(numMatches).toEqual(1);
        });
        it('should not re-add the router outlet (inline template)', () => {
            makeInlineTemplate(appTree, '<router-outlet></router-outlet>');
            const tree = schematicRunner.runSchematic('appShell', defaultOptions, appTree);
            const content = tree.readContent('/projects/bar/src/app/app.component.ts');
            const matches = content.match(/<router\-outlet><\/router\-outlet>/g);
            const numMatches = matches ? matches.length : 0;
            expect(numMatches).toEqual(1);
        });
    });
    it('should add router imports to server module', () => {
        const tree = schematicRunner.runSchematic('appShell', defaultOptions, appTree);
        const filePath = '/projects/bar/src/app/app.server.module.ts';
        const content = tree.readContent(filePath);
        expect(content).toMatch(/import { Routes, RouterModule } from \'@angular\/router\';/);
    });
    it('should define a server route', () => {
        const tree = schematicRunner.runSchematic('appShell', defaultOptions, appTree);
        const filePath = '/projects/bar/src/app/app.server.module.ts';
        const content = tree.readContent(filePath);
        expect(content).toMatch(/const routes: Routes = \[/);
    });
    it('should import RouterModule with forRoot', () => {
        const tree = schematicRunner.runSchematic('appShell', defaultOptions, appTree);
        const filePath = '/projects/bar/src/app/app.server.module.ts';
        const content = tree.readContent(filePath);
        expect(content)
            .toMatch(/const routes: Routes = \[ { path: 'shell', component: AppShellComponent }\];/);
        expect(content)
            .toMatch(/ServerModule,\r?\n\s*RouterModule\.forRoot\(routes\),/);
    });
    it('should create the shell component', () => {
        const tree = schematicRunner.runSchematic('appShell', defaultOptions, appTree);
        expect(tree.exists('/projects/bar/src/app/app-shell/app-shell.component.ts'));
        const content = tree.readContent('/projects/bar/src/app/app.server.module.ts');
        expect(content).toMatch(/app\-shell\.component/);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXhfc3BlYy5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvYm9iby9Xb3JrL2dpdGh1Yi9zaGFyay1zY2hlbWF0aWNzL3NyYy8iLCJzb3VyY2VzIjpbInNyYy9hcHAtc2hlbGwvaW5kZXhfc3BlYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7R0FNRztBQUNILGdFQUF1RjtBQUN2Riw2QkFBNkI7QUFNN0IsUUFBUSxDQUFDLHFCQUFxQixFQUFFLEdBQUcsRUFBRTtJQUNuQyxNQUFNLGVBQWUsR0FBRyxJQUFJLDZCQUFtQixDQUM3QyxxQkFBcUIsRUFDckIsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsb0JBQW9CLENBQUMsQ0FDM0MsQ0FBQztJQUNGLE1BQU0sY0FBYyxHQUFvQjtRQUN0QyxJQUFJLEVBQUUsS0FBSztRQUNYLGFBQWEsRUFBRSxLQUFLO1FBQ3BCLGdCQUFnQixFQUFFLFdBQVc7S0FDOUIsQ0FBQztJQUVGLE1BQU0sZ0JBQWdCLEdBQXFCO1FBQ3pDLElBQUksRUFBRSxXQUFXO1FBQ2pCLGNBQWMsRUFBRSxVQUFVO1FBQzFCLE9BQU8sRUFBRSxPQUFPO0tBQ2pCLENBQUM7SUFFRixNQUFNLFVBQVUsR0FBdUI7UUFDckMsSUFBSSxFQUFFLEtBQUs7UUFDWCxXQUFXLEVBQUUsS0FBSztRQUNsQixjQUFjLEVBQUUsS0FBSztRQUNyQixPQUFPLEVBQUUsSUFBSTtRQUNiLEtBQUssRUFBRSxLQUFLO1FBQ1osU0FBUyxFQUFFLEtBQUs7UUFDaEIsZUFBZSxFQUFFLEtBQUs7S0FDdkIsQ0FBQztJQUNGLElBQUksT0FBcUIsQ0FBQztJQUUxQixVQUFVLENBQUMsR0FBRyxFQUFFO1FBQ2QsT0FBTyxHQUFHLGVBQWUsQ0FBQyxZQUFZLENBQUMsV0FBVyxFQUFFLGdCQUFnQixDQUFDLENBQUM7UUFDdEUsT0FBTyxHQUFHLGVBQWUsQ0FBQyxZQUFZLENBQUMsYUFBYSxFQUFFLFVBQVUsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUM3RSxDQUFDLENBQUMsQ0FBQztJQUdILEVBQUUsQ0FBQyxrREFBa0QsRUFBRSxHQUFHLEVBQUU7UUFDMUQsT0FBTyxHQUFHLGVBQWUsQ0FBQyxZQUFZLENBQUMsV0FBVyxFQUFFLGdCQUFnQixDQUFDLENBQUM7UUFDdEUsT0FBTyxHQUFHLGVBQWUsQ0FBQyxZQUFZLENBQUMsYUFBYSxvQkFBTSxVQUFVLElBQUUsT0FBTyxFQUFFLEtBQUssS0FBRyxPQUFPLENBQUMsQ0FBQztRQUNoRyxNQUFNLENBQUMsR0FBRyxFQUFFO1lBQ1YsZUFBZSxDQUFDLFlBQVksQ0FBQyxVQUFVLEVBQUUsY0FBYyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3BFLENBQUMsQ0FBQyxDQUFDLFlBQVksRUFBRSxDQUFDO0lBQ3BCLENBQUMsQ0FBQyxDQUFDO0lBRUgsRUFBRSxDQUFDLDRCQUE0QixFQUFFLEdBQUcsRUFBRTtRQUNwQyxNQUFNLElBQUksR0FBRyxlQUFlLENBQUMsWUFBWSxDQUFDLFVBQVUsRUFBRSxjQUFjLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDL0UsTUFBTSxRQUFRLEdBQUcsNENBQTRDLENBQUM7UUFDOUQsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDOUMsQ0FBQyxDQUFDLENBQUM7SUFFSCxFQUFFLENBQUMsb0NBQW9DLEVBQUUsR0FBRyxFQUFFO1FBQzVDLE1BQU0sSUFBSSxHQUFHLGVBQWUsQ0FBQyxZQUFZLENBQUMsVUFBVSxFQUFFLGNBQWMsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUMvRSxNQUFNLFFBQVEsR0FBRyxlQUFlLENBQUM7UUFDakMsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUMzQyxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3RDLE1BQU0sTUFBTSxHQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUM3RCxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDMUQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzFELE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNoRCxDQUFDLENBQUMsQ0FBQztJQUVILEVBQUUsQ0FBQywrQ0FBK0MsRUFBRSxHQUFHLEVBQUU7UUFDdkQsTUFBTSxJQUFJLEdBQUcsZUFBZSxDQUFDLFlBQVksQ0FBQyxVQUFVLEVBQUUsY0FBYyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQy9FLE1BQU0sUUFBUSxHQUFHLHFDQUFxQyxDQUFDO1FBQ3ZELE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDM0MsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxvREFBb0QsQ0FBQyxDQUFDO0lBQ2hGLENBQUMsQ0FBQyxDQUFDO0lBRUgsUUFBUSxDQUFDLG1CQUFtQixFQUFFLEdBQUcsRUFBRTtRQUNqQyw0QkFBNEIsSUFBa0IsRUFBRSxRQUFpQjtZQUMvRCxRQUFRLEdBQUcsUUFBUSxJQUFJOzs7V0FHbEIsQ0FBQztZQUNOLE1BQU0sT0FBTyxHQUFHOzs7Ozs7Y0FNUixRQUFROzs7Ozs7Ozs7Ozs7O09BYWYsQ0FBQztZQUNGLElBQUksQ0FBQyxTQUFTLENBQUMsd0NBQXdDLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDbEUsSUFBSSxDQUFDLE1BQU0sQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO1FBQzFELENBQUM7UUFFRCxFQUFFLENBQUMseURBQXlELEVBQUUsR0FBRyxFQUFFO1lBQ2pFLE1BQU0sUUFBUSxHQUFHLDBDQUEwQyxDQUFDO1lBQzVELE9BQU8sQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLGlDQUFpQyxDQUFDLENBQUM7WUFDL0QsTUFBTSxJQUFJLEdBQUcsZUFBZSxDQUFDLFlBQVksQ0FBQyxVQUFVLEVBQUUsY0FBYyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBRS9FLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDM0MsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxxQ0FBcUMsQ0FBQyxDQUFDO1lBQ3JFLE1BQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2hELE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDaEMsQ0FBQyxDQUFDLENBQUM7UUFFSCxFQUFFLENBQUMsdURBQXVELEVBQUUsR0FBRyxFQUFFO1lBQy9ELGtCQUFrQixDQUFDLE9BQU8sRUFBRSxpQ0FBaUMsQ0FBQyxDQUFDO1lBQy9ELE1BQU0sSUFBSSxHQUFHLGVBQWUsQ0FBQyxZQUFZLENBQUMsVUFBVSxFQUFFLGNBQWMsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUMvRSxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLHdDQUF3QyxDQUFDLENBQUM7WUFDM0UsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxxQ0FBcUMsQ0FBQyxDQUFDO1lBQ3JFLE1BQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2hELE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDaEMsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDLENBQUMsQ0FBQztJQUVILEVBQUUsQ0FBQyw0Q0FBNEMsRUFBRSxHQUFHLEVBQUU7UUFDcEQsTUFBTSxJQUFJLEdBQUcsZUFBZSxDQUFDLFlBQVksQ0FBQyxVQUFVLEVBQUUsY0FBYyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQy9FLE1BQU0sUUFBUSxHQUFHLDRDQUE0QyxDQUFDO1FBQzlELE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDM0MsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyw0REFBNEQsQ0FBQyxDQUFDO0lBQ3hGLENBQUMsQ0FBQyxDQUFDO0lBRUgsRUFBRSxDQUFDLDhCQUE4QixFQUFFLEdBQUcsRUFBRTtRQUN0QyxNQUFNLElBQUksR0FBRyxlQUFlLENBQUMsWUFBWSxDQUFDLFVBQVUsRUFBRSxjQUFjLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDL0UsTUFBTSxRQUFRLEdBQUcsNENBQTRDLENBQUM7UUFDOUQsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUMzQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTyxDQUFDLDJCQUEyQixDQUFDLENBQUM7SUFDdkQsQ0FBQyxDQUFDLENBQUM7SUFFSCxFQUFFLENBQUMseUNBQXlDLEVBQUUsR0FBRyxFQUFFO1FBQ2pELE1BQU0sSUFBSSxHQUFHLGVBQWUsQ0FBQyxZQUFZLENBQUMsVUFBVSxFQUFFLGNBQWMsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUMvRSxNQUFNLFFBQVEsR0FBRyw0Q0FBNEMsQ0FBQztRQUM5RCxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzNDLE1BQU0sQ0FBQyxPQUFPLENBQUM7YUFDWixPQUFPLENBQUMsOEVBQThFLENBQUMsQ0FBQztRQUMzRixNQUFNLENBQUMsT0FBTyxDQUFDO2FBQ1osT0FBTyxDQUFDLHVEQUF1RCxDQUFDLENBQUM7SUFDdEUsQ0FBQyxDQUFDLENBQUM7SUFFSCxFQUFFLENBQUMsbUNBQW1DLEVBQUUsR0FBRyxFQUFFO1FBQzNDLE1BQU0sSUFBSSxHQUFHLGVBQWUsQ0FBQyxZQUFZLENBQUMsVUFBVSxFQUFFLGNBQWMsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUMvRSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyx3REFBd0QsQ0FBQyxDQUFDLENBQUM7UUFDOUUsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyw0Q0FBNEMsQ0FBQyxDQUFDO1FBQy9FLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFPLENBQUMsdUJBQXVCLENBQUMsQ0FBQztJQUNuRCxDQUFDLENBQUMsQ0FBQztBQUNMLENBQUMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHsgU2NoZW1hdGljVGVzdFJ1bm5lciwgVW5pdFRlc3RUcmVlIH0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L3NjaGVtYXRpY3MvdGVzdGluZyc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgU2NoZW1hIGFzIEFwcGxpY2F0aW9uT3B0aW9ucyB9IGZyb20gJy4uL2FwcGxpY2F0aW9uL3NjaGVtYSc7XG5pbXBvcnQgeyBTY2hlbWEgYXMgV29ya3NwYWNlT3B0aW9ucyB9IGZyb20gJy4uL3dvcmtzcGFjZS9zY2hlbWEnO1xuaW1wb3J0IHsgU2NoZW1hIGFzIEFwcFNoZWxsT3B0aW9ucyB9IGZyb20gJy4vc2NoZW1hJztcblxuXG5kZXNjcmliZSgnQXBwIFNoZWxsIFNjaGVtYXRpYycsICgpID0+IHtcbiAgY29uc3Qgc2NoZW1hdGljUnVubmVyID0gbmV3IFNjaGVtYXRpY1Rlc3RSdW5uZXIoXG4gICAgJ0BzY2hlbWF0aWNzL2FuZ3VsYXInLFxuICAgIHBhdGguam9pbihfX2Rpcm5hbWUsICcuLi9jb2xsZWN0aW9uLmpzb24nKSxcbiAgKTtcbiAgY29uc3QgZGVmYXVsdE9wdGlvbnM6IEFwcFNoZWxsT3B0aW9ucyA9IHtcbiAgICBuYW1lOiAnZm9vJyxcbiAgICBjbGllbnRQcm9qZWN0OiAnYmFyJyxcbiAgICB1bml2ZXJzYWxQcm9qZWN0OiAndW5pdmVyc2FsJyxcbiAgfTtcblxuICBjb25zdCB3b3Jrc3BhY2VPcHRpb25zOiBXb3Jrc3BhY2VPcHRpb25zID0ge1xuICAgIG5hbWU6ICd3b3Jrc3BhY2UnLFxuICAgIG5ld1Byb2plY3RSb290OiAncHJvamVjdHMnLFxuICAgIHZlcnNpb246ICc2LjAuMCcsXG4gIH07XG5cbiAgY29uc3QgYXBwT3B0aW9uczogQXBwbGljYXRpb25PcHRpb25zID0ge1xuICAgIG5hbWU6ICdiYXInLFxuICAgIGlubGluZVN0eWxlOiBmYWxzZSxcbiAgICBpbmxpbmVUZW1wbGF0ZTogZmFsc2UsXG4gICAgcm91dGluZzogdHJ1ZSxcbiAgICBzdHlsZTogJ2NzcycsXG4gICAgc2tpcFRlc3RzOiBmYWxzZSxcbiAgICBza2lwUGFja2FnZUpzb246IGZhbHNlLFxuICB9O1xuICBsZXQgYXBwVHJlZTogVW5pdFRlc3RUcmVlO1xuXG4gIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgIGFwcFRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCd3b3Jrc3BhY2UnLCB3b3Jrc3BhY2VPcHRpb25zKTtcbiAgICBhcHBUcmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnYXBwbGljYXRpb24nLCBhcHBPcHRpb25zLCBhcHBUcmVlKTtcbiAgfSk7XG5cblxuICBpdCgnc2hvdWxkIGVuc3VyZSB0aGUgY2xpZW50IGFwcCBoYXMgYSByb3V0ZXItb3V0bGV0JywgKCkgPT4ge1xuICAgIGFwcFRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCd3b3Jrc3BhY2UnLCB3b3Jrc3BhY2VPcHRpb25zKTtcbiAgICBhcHBUcmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnYXBwbGljYXRpb24nLCB7Li4uYXBwT3B0aW9ucywgcm91dGluZzogZmFsc2V9LCBhcHBUcmVlKTtcbiAgICBleHBlY3QoKCkgPT4ge1xuICAgICAgc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnYXBwU2hlbGwnLCBkZWZhdWx0T3B0aW9ucywgYXBwVHJlZSk7XG4gICAgfSkudG9UaHJvd0Vycm9yKCk7XG4gIH0pO1xuXG4gIGl0KCdzaG91bGQgYWRkIGEgdW5pdmVyc2FsIGFwcCcsICgpID0+IHtcbiAgICBjb25zdCB0cmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnYXBwU2hlbGwnLCBkZWZhdWx0T3B0aW9ucywgYXBwVHJlZSk7XG4gICAgY29uc3QgZmlsZVBhdGggPSAnL3Byb2plY3RzL2Jhci9zcmMvYXBwL2FwcC5zZXJ2ZXIubW9kdWxlLnRzJztcbiAgICBleHBlY3QodHJlZS5leGlzdHMoZmlsZVBhdGgpKS50b0VxdWFsKHRydWUpO1xuICB9KTtcblxuICBpdCgnc2hvdWxkIGFkZCBhcHAgc2hlbGwgY29uZmlndXJhdGlvbicsICgpID0+IHtcbiAgICBjb25zdCB0cmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnYXBwU2hlbGwnLCBkZWZhdWx0T3B0aW9ucywgYXBwVHJlZSk7XG4gICAgY29uc3QgZmlsZVBhdGggPSAnL2FuZ3VsYXIuanNvbic7XG4gICAgY29uc3QgY29udGVudCA9IHRyZWUucmVhZENvbnRlbnQoZmlsZVBhdGgpO1xuICAgIGNvbnN0IHdvcmtzcGFjZSA9IEpTT04ucGFyc2UoY29udGVudCk7XG4gICAgY29uc3QgdGFyZ2V0ID0gd29ya3NwYWNlLnByb2plY3RzLmJhci5hcmNoaXRlY3RbJ2FwcC1zaGVsbCddO1xuICAgIGV4cGVjdCh0YXJnZXQub3B0aW9ucy5icm93c2VyVGFyZ2V0KS50b0VxdWFsKCdiYXI6YnVpbGQnKTtcbiAgICBleHBlY3QodGFyZ2V0Lm9wdGlvbnMuc2VydmVyVGFyZ2V0KS50b0VxdWFsKCdiYXI6c2VydmVyJyk7XG4gICAgZXhwZWN0KHRhcmdldC5vcHRpb25zLnJvdXRlKS50b0VxdWFsKCdzaGVsbCcpO1xuICB9KTtcblxuICBpdCgnc2hvdWxkIGFkZCByb3V0ZXIgbW9kdWxlIHRvIGNsaWVudCBhcHAgbW9kdWxlJywgKCkgPT4ge1xuICAgIGNvbnN0IHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdhcHBTaGVsbCcsIGRlZmF1bHRPcHRpb25zLCBhcHBUcmVlKTtcbiAgICBjb25zdCBmaWxlUGF0aCA9ICcvcHJvamVjdHMvYmFyL3NyYy9hcHAvYXBwLm1vZHVsZS50cyc7XG4gICAgY29uc3QgY29udGVudCA9IHRyZWUucmVhZENvbnRlbnQoZmlsZVBhdGgpO1xuICAgIGV4cGVjdChjb250ZW50KS50b01hdGNoKC9pbXBvcnQgeyBSb3V0ZXJNb2R1bGUgfSBmcm9tIFxcJ0Bhbmd1bGFyXFwvcm91dGVyXFwnOy8pO1xuICB9KTtcblxuICBkZXNjcmliZSgnQWRkIHJvdXRlci1vdXRsZXQnLCAoKSA9PiB7XG4gICAgZnVuY3Rpb24gbWFrZUlubGluZVRlbXBsYXRlKHRyZWU6IFVuaXRUZXN0VHJlZSwgdGVtcGxhdGU/OiBzdHJpbmcpOiB2b2lkIHtcbiAgICAgIHRlbXBsYXRlID0gdGVtcGxhdGUgfHwgYFxuICAgICAgPHA+XG4gICAgICAgIEFwcCB3b3JrcyFcbiAgICAgIDwvcD5gO1xuICAgICAgY29uc3QgbmV3VGV4dCA9IGBcbiAgICAgICAgaW1wb3J0IHsgQ29tcG9uZW50LCBPbkluaXQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuICAgICAgICBAQ29tcG9uZW50KHtcbiAgICAgICAgICBzZWxlY3RvcjogJydcbiAgICAgICAgICB0ZW1wbGF0ZTogXFxgXG4gICAgICAgICAgICAke3RlbXBsYXRlfVxuICAgICAgICAgIFxcYCxcbiAgICAgICAgICBzdHlsZVVybHM6IFsnLi9hcHAuY29tcG9uZW50LmNzcyddXG4gICAgICAgIH0pXG4gICAgICAgIGV4cG9ydCBjbGFzcyBBcHBDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQge1xuXG4gICAgICAgICAgY29uc3RydWN0b3IoKSB7IH1cblxuICAgICAgICAgIG5nT25Jbml0KCkge1xuICAgICAgICAgIH1cblxuICAgICAgICB9XG5cbiAgICAgIGA7XG4gICAgICB0cmVlLm92ZXJ3cml0ZSgnL3Byb2plY3RzL2Jhci9zcmMvYXBwL2FwcC5jb21wb25lbnQudHMnLCBuZXdUZXh0KTtcbiAgICAgIHRyZWUuZGVsZXRlKCcvcHJvamVjdHMvYmFyL3NyYy9hcHAvYXBwLmNvbXBvbmVudC5odG1sJyk7XG4gICAgfVxuXG4gICAgaXQoJ3Nob3VsZCBub3QgcmUtYWRkIHRoZSByb3V0ZXIgb3V0bGV0IChleHRlcm5hbCB0ZW1wbGF0ZSknLCAoKSA9PiB7XG4gICAgICBjb25zdCBodG1sUGF0aCA9ICcvcHJvamVjdHMvYmFyL3NyYy9hcHAvYXBwLmNvbXBvbmVudC5odG1sJztcbiAgICAgIGFwcFRyZWUub3ZlcndyaXRlKGh0bWxQYXRoLCAnPHJvdXRlci1vdXRsZXQ+PC9yb3V0ZXItb3V0bGV0PicpO1xuICAgICAgY29uc3QgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ2FwcFNoZWxsJywgZGVmYXVsdE9wdGlvbnMsIGFwcFRyZWUpO1xuXG4gICAgICBjb25zdCBjb250ZW50ID0gdHJlZS5yZWFkQ29udGVudChodG1sUGF0aCk7XG4gICAgICBjb25zdCBtYXRjaGVzID0gY29udGVudC5tYXRjaCgvPHJvdXRlclxcLW91dGxldD48XFwvcm91dGVyXFwtb3V0bGV0Pi9nKTtcbiAgICAgIGNvbnN0IG51bU1hdGNoZXMgPSBtYXRjaGVzID8gbWF0Y2hlcy5sZW5ndGggOiAwO1xuICAgICAgZXhwZWN0KG51bU1hdGNoZXMpLnRvRXF1YWwoMSk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIG5vdCByZS1hZGQgdGhlIHJvdXRlciBvdXRsZXQgKGlubGluZSB0ZW1wbGF0ZSknLCAoKSA9PiB7XG4gICAgICBtYWtlSW5saW5lVGVtcGxhdGUoYXBwVHJlZSwgJzxyb3V0ZXItb3V0bGV0Pjwvcm91dGVyLW91dGxldD4nKTtcbiAgICAgIGNvbnN0IHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdhcHBTaGVsbCcsIGRlZmF1bHRPcHRpb25zLCBhcHBUcmVlKTtcbiAgICAgIGNvbnN0IGNvbnRlbnQgPSB0cmVlLnJlYWRDb250ZW50KCcvcHJvamVjdHMvYmFyL3NyYy9hcHAvYXBwLmNvbXBvbmVudC50cycpO1xuICAgICAgY29uc3QgbWF0Y2hlcyA9IGNvbnRlbnQubWF0Y2goLzxyb3V0ZXJcXC1vdXRsZXQ+PFxcL3JvdXRlclxcLW91dGxldD4vZyk7XG4gICAgICBjb25zdCBudW1NYXRjaGVzID0gbWF0Y2hlcyA/IG1hdGNoZXMubGVuZ3RoIDogMDtcbiAgICAgIGV4cGVjdChudW1NYXRjaGVzKS50b0VxdWFsKDEpO1xuICAgIH0pO1xuICB9KTtcblxuICBpdCgnc2hvdWxkIGFkZCByb3V0ZXIgaW1wb3J0cyB0byBzZXJ2ZXIgbW9kdWxlJywgKCkgPT4ge1xuICAgIGNvbnN0IHRyZWUgPSBzY2hlbWF0aWNSdW5uZXIucnVuU2NoZW1hdGljKCdhcHBTaGVsbCcsIGRlZmF1bHRPcHRpb25zLCBhcHBUcmVlKTtcbiAgICBjb25zdCBmaWxlUGF0aCA9ICcvcHJvamVjdHMvYmFyL3NyYy9hcHAvYXBwLnNlcnZlci5tb2R1bGUudHMnO1xuICAgIGNvbnN0IGNvbnRlbnQgPSB0cmVlLnJlYWRDb250ZW50KGZpbGVQYXRoKTtcbiAgICBleHBlY3QoY29udGVudCkudG9NYXRjaCgvaW1wb3J0IHsgUm91dGVzLCBSb3V0ZXJNb2R1bGUgfSBmcm9tIFxcJ0Bhbmd1bGFyXFwvcm91dGVyXFwnOy8pO1xuICB9KTtcblxuICBpdCgnc2hvdWxkIGRlZmluZSBhIHNlcnZlciByb3V0ZScsICgpID0+IHtcbiAgICBjb25zdCB0cmVlID0gc2NoZW1hdGljUnVubmVyLnJ1blNjaGVtYXRpYygnYXBwU2hlbGwnLCBkZWZhdWx0T3B0aW9ucywgYXBwVHJlZSk7XG4gICAgY29uc3QgZmlsZVBhdGggPSAnL3Byb2plY3RzL2Jhci9zcmMvYXBwL2FwcC5zZXJ2ZXIubW9kdWxlLnRzJztcbiAgICBjb25zdCBjb250ZW50ID0gdHJlZS5yZWFkQ29udGVudChmaWxlUGF0aCk7XG4gICAgZXhwZWN0KGNvbnRlbnQpLnRvTWF0Y2goL2NvbnN0IHJvdXRlczogUm91dGVzID0gXFxbLyk7XG4gIH0pO1xuXG4gIGl0KCdzaG91bGQgaW1wb3J0IFJvdXRlck1vZHVsZSB3aXRoIGZvclJvb3QnLCAoKSA9PiB7XG4gICAgY29uc3QgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ2FwcFNoZWxsJywgZGVmYXVsdE9wdGlvbnMsIGFwcFRyZWUpO1xuICAgIGNvbnN0IGZpbGVQYXRoID0gJy9wcm9qZWN0cy9iYXIvc3JjL2FwcC9hcHAuc2VydmVyLm1vZHVsZS50cyc7XG4gICAgY29uc3QgY29udGVudCA9IHRyZWUucmVhZENvbnRlbnQoZmlsZVBhdGgpO1xuICAgIGV4cGVjdChjb250ZW50KVxuICAgICAgLnRvTWF0Y2goL2NvbnN0IHJvdXRlczogUm91dGVzID0gXFxbIHsgcGF0aDogJ3NoZWxsJywgY29tcG9uZW50OiBBcHBTaGVsbENvbXBvbmVudCB9XFxdOy8pO1xuICAgIGV4cGVjdChjb250ZW50KVxuICAgICAgLnRvTWF0Y2goL1NlcnZlck1vZHVsZSxcXHI/XFxuXFxzKlJvdXRlck1vZHVsZVxcLmZvclJvb3RcXChyb3V0ZXNcXCksLyk7XG4gIH0pO1xuXG4gIGl0KCdzaG91bGQgY3JlYXRlIHRoZSBzaGVsbCBjb21wb25lbnQnLCAoKSA9PiB7XG4gICAgY29uc3QgdHJlZSA9IHNjaGVtYXRpY1J1bm5lci5ydW5TY2hlbWF0aWMoJ2FwcFNoZWxsJywgZGVmYXVsdE9wdGlvbnMsIGFwcFRyZWUpO1xuICAgIGV4cGVjdCh0cmVlLmV4aXN0cygnL3Byb2plY3RzL2Jhci9zcmMvYXBwL2FwcC1zaGVsbC9hcHAtc2hlbGwuY29tcG9uZW50LnRzJykpO1xuICAgIGNvbnN0IGNvbnRlbnQgPSB0cmVlLnJlYWRDb250ZW50KCcvcHJvamVjdHMvYmFyL3NyYy9hcHAvYXBwLnNlcnZlci5tb2R1bGUudHMnKTtcbiAgICBleHBlY3QoY29udGVudCkudG9NYXRjaCgvYXBwXFwtc2hlbGxcXC5jb21wb25lbnQvKTtcbiAgfSk7XG59KTtcbiJdfQ==