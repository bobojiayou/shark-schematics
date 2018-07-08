"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const core_1 = require("@angular-devkit/core");
const schematics_1 = require("@angular-devkit/schematics");
const ts = require("typescript");
const change_1 = require("../utility/change");
const test_1 = require("../utility/test");
const ast_utils_1 = require("./ast-utils");
function getTsSource(path, content) {
    return ts.createSourceFile(path, content, ts.ScriptTarget.Latest, true);
}
function applyChanges(path, content, changes) {
    const tree = new schematics_1.VirtualTree();
    tree.create(path, content);
    const exportRecorder = tree.beginUpdate(path);
    for (const change of changes) {
        if (change instanceof change_1.InsertChange) {
            exportRecorder.insertLeft(change.pos, change.toAdd);
        }
    }
    tree.commitUpdate(exportRecorder);
    return test_1.getFileContent(tree, path);
}
describe('ast utils', () => {
    let modulePath;
    let moduleContent;
    beforeEach(() => {
        modulePath = '/src/app/app.module.ts';
        moduleContent = `
      import { BrowserModule } from '@angular/platform-browser';
      import { NgModule } from '@angular/core';
      import { AppComponent } from './app.component';

      @NgModule({
        declarations: [
          AppComponent
        ],
        imports: [
          BrowserModule
        ],
        providers: [],
        bootstrap: [AppComponent]
      })
      export class AppModule { }
    `;
    });
    it('should add export to module', () => {
        const source = getTsSource(modulePath, moduleContent);
        const changes = ast_utils_1.addExportToModule(source, modulePath, 'FooComponent', './foo.component');
        const output = applyChanges(modulePath, moduleContent, changes);
        expect(output).toMatch(/import { FooComponent } from '.\/foo.component';/);
        expect(output).toMatch(/exports: \[FooComponent\]/);
    });
    it('should add export to module if not indented', () => {
        moduleContent = core_1.tags.stripIndents `${moduleContent}`;
        const source = getTsSource(modulePath, moduleContent);
        const changes = ast_utils_1.addExportToModule(source, modulePath, 'FooComponent', './foo.component');
        const output = applyChanges(modulePath, moduleContent, changes);
        expect(output).toMatch(/import { FooComponent } from '.\/foo.component';/);
        expect(output).toMatch(/exports: \[FooComponent\]/);
    });
    it('should add metadata', () => {
        const source = getTsSource(modulePath, moduleContent);
        const changes = ast_utils_1.addSymbolToNgModuleMetadata(source, modulePath, 'imports', 'HelloWorld');
        expect(changes).not.toBeNull();
        const output = applyChanges(modulePath, moduleContent, changes || []);
        expect(output).toMatch(/imports: [\s\S]+,\n\s+HelloWorld\n\s+\]/m);
    });
    it('should add metadata (comma)', () => {
        const moduleContent = `
      import { BrowserModule } from '@angular/platform-browser';
      import { NgModule } from '@angular/core';

      @NgModule({
        declarations: [
          AppComponent
        ],
        imports: [
          BrowserModule,
        ],
        providers: [],
        bootstrap: [AppComponent]
      })
      export class AppModule { }
    `;
        const source = getTsSource(modulePath, moduleContent);
        const changes = ast_utils_1.addSymbolToNgModuleMetadata(source, modulePath, 'imports', 'HelloWorld');
        expect(changes).not.toBeNull();
        const output = applyChanges(modulePath, moduleContent, changes || []);
        expect(output).toMatch(/imports: [\s\S]+,\n\s+HelloWorld,\n\s+\]/m);
    });
    it('should add metadata (missing)', () => {
        const moduleContent = `
      import { BrowserModule } from '@angular/platform-browser';
      import { NgModule } from '@angular/core';

      @NgModule({
        declarations: [
          AppComponent
        ],
        providers: [],
        bootstrap: [AppComponent]
      })
      export class AppModule { }
    `;
        const source = getTsSource(modulePath, moduleContent);
        const changes = ast_utils_1.addSymbolToNgModuleMetadata(source, modulePath, 'imports', 'HelloWorld');
        expect(changes).not.toBeNull();
        const output = applyChanges(modulePath, moduleContent, changes || []);
        expect(output).toMatch(/imports: \[HelloWorld]\r?\n/m);
    });
    it('should add metadata (empty)', () => {
        const moduleContent = `
      import { BrowserModule } from '@angular/platform-browser';
      import { NgModule } from '@angular/core';

      @NgModule({
        declarations: [
          AppComponent
        ],
        providers: [],
        imports: [],
        bootstrap: [AppComponent]
      })
      export class AppModule { }
    `;
        const source = getTsSource(modulePath, moduleContent);
        const changes = ast_utils_1.addSymbolToNgModuleMetadata(source, modulePath, 'imports', 'HelloWorld');
        expect(changes).not.toBeNull();
        const output = applyChanges(modulePath, moduleContent, changes || []);
        expect(output).toMatch(/imports: \[HelloWorld],\r?\n/m);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXN0LXV0aWxzX3NwZWMuanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL2JvYm8vV29yay9naXRodWIvc2hhcmstc2NoZW1hdGljcy9zcmMvIiwic291cmNlcyI6WyJzcmMvdXRpbGl0eS9hc3QtdXRpbHNfc3BlYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBOzs7Ozs7R0FNRztBQUNILCtDQUE0QztBQUM1QywyREFBeUQ7QUFDekQsaUNBQWlDO0FBQ2pDLDhDQUF5RDtBQUN6RCwwQ0FBaUQ7QUFDakQsMkNBQTZFO0FBRzdFLHFCQUFxQixJQUFZLEVBQUUsT0FBZTtJQUNoRCxPQUFPLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLEVBQUUsQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQzFFLENBQUM7QUFFRCxzQkFBc0IsSUFBWSxFQUFFLE9BQWUsRUFBRSxPQUFpQjtJQUNwRSxNQUFNLElBQUksR0FBRyxJQUFJLHdCQUFXLEVBQUUsQ0FBQztJQUMvQixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztJQUMzQixNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzlDLEtBQUssTUFBTSxNQUFNLElBQUksT0FBTyxFQUFFO1FBQzVCLElBQUksTUFBTSxZQUFZLHFCQUFZLEVBQUU7WUFDbEMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUNyRDtLQUNGO0lBQ0QsSUFBSSxDQUFDLFlBQVksQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUVsQyxPQUFPLHFCQUFjLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3BDLENBQUM7QUFFRCxRQUFRLENBQUMsV0FBVyxFQUFFLEdBQUcsRUFBRTtJQUN6QixJQUFJLFVBQWtCLENBQUM7SUFDdkIsSUFB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QUc7Ozs7Ozs7Ozs7OztLQVlyQixDQUFDO1FBQ0YsTUFBTSxNQUFNLEdBQUcsV0FBVyxDQUFDLFVBQVUsRUFBRSxhQUFhLENBQUMsQ0FBQztRQUN0RCxNQUFNLE9BQU8sR0FBRyx1Q0FBMkIsQ0FBQyxNQUFNLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxZQUFZLENBQUMsQ0FBQztRQUN6RixNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBRS9CLE1BQU0sTUFBTSxHQUFHLFlBQVksQ0FBQyxVQUFVLEVBQUUsYUFBYSxFQUFFLE9BQU8sSUFBSSxFQUFFLENBQUMsQ0FBQztRQUN0RSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxDQUFDLDhCQUE4QixDQUFDLENBQUM7SUFDekQsQ0FBQyxDQUFDLENBQUM7SUFFSCxFQUFFLENBQUMsNkJBQTZCLEVBQUUsR0FBRyxFQUFFO1FBQ3JDLE1BQU0sYUFBYSxHQUFHOzs7Ozs7Ozs7Ozs7O0tBYXJCLENBQUM7UUFDRixNQUFNLE1BQU0sR0FBRyxXQUFXLENBQUMsVUFBVSxFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBQ3RELE1BQU0sT0FBTyxHQUFHLHVDQUEyQixDQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBQ3pGLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUM7UUFFL0IsTUFBTSxNQUFNLEdBQUcsWUFBWSxDQUFDLFVBQVUsRUFBRSxhQUFhLEVBQUUsT0FBTyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQ3RFLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsK0JBQStCLENBQUMsQ0FBQztJQUMxRCxDQUFDLENBQUMsQ0FBQztBQUNMLENBQUMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiXG4vKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQgeyB0YWdzIH0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L2NvcmUnO1xuaW1wb3J0IHsgVmlydHVhbFRyZWUgfSBmcm9tICdAYW5ndWxhci1kZXZraXQvc2NoZW1hdGljcyc7XG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcbmltcG9ydCB7IENoYW5nZSwgSW5zZXJ0Q2hhbmdlIH0gZnJvbSAnLi4vdXRpbGl0eS9jaGFuZ2UnO1xuaW1wb3J0IHsgZ2V0RmlsZUNvbnRlbnQgfSBmcm9tICcuLi91dGlsaXR5L3Rlc3QnO1xuaW1wb3J0IHsgYWRkRXhwb3J0VG9Nb2R1bGUsIGFkZFN5bWJvbFRvTmdNb2R1bGVNZXRhZGF0YSB9IGZyb20gJy4vYXN0LXV0aWxzJztcblxuXG5mdW5jdGlvbiBnZXRUc1NvdXJjZShwYXRoOiBzdHJpbmcsIGNvbnRlbnQ6IHN0cmluZyk6IHRzLlNvdXJjZUZpbGUge1xuICByZXR1cm4gdHMuY3JlYXRlU291cmNlRmlsZShwYXRoLCBjb250ZW50LCB0cy5TY3JpcHRUYXJnZXQuTGF0ZXN0LCB0cnVlKTtcbn1cblxuZnVuY3Rpb24gYXBwbHlDaGFuZ2VzKHBhdGg6IHN0cmluZywgY29udGVudDogc3RyaW5nLCBjaGFuZ2VzOiBDaGFuZ2VbXSk6IHN0cmluZyB7XG4gIGNvbnN0IHRyZWUgPSBuZXcgVmlydHVhbFRyZWUoKTtcbiAgdHJlZS5jcmVhdGUocGF0aCwgY29udGVudCk7XG4gIGNvbnN0IGV4cG9ydFJlY29yZGVyID0gdHJlZS5iZWdpblVwZGF0ZShwYXRoKTtcbiAgZm9yIChjb25zdCBjaGFuZ2Ugb2YgY2hhbmdlcykge1xuICAgIGlmIChjaGFuZ2UgaW5zdGFuY2VvZiBJbnNlcnRDaGFuZ2UpIHtcbiAgICAgIGV4cG9ydFJlY29yZGVyLmluc2VydExlZnQoY2hhbmdlLnBvcywgY2hhbmdlLnRvQWRkKTtcbiAgICB9XG4gIH1cbiAgdHJlZS5jb21taXRVcGRhdGUoZXhwb3J0UmVjb3JkZXIpO1xuXG4gIHJldHVybiBnZXRGaWxlQ29udGVudCh0cmVlLCBwYXRoKTtcbn1cblxuZGVzY3JpYmUoJ2FzdCB1dGlscycsICgpID0+IHtcbiAgbGV0IG1vZHVsZVBhdGg6IHN0cmluZztcbiAgbGV0IG1vZHVsZUNvbnRlbnQ6IHN0cmluZztcbiAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgbW9kdWxlUGF0aCA9ICcvc3JjL2FwcC9hcHAubW9kdWxlLnRzJztcbiAgICBtb2R1bGVDb250ZW50ID0gYFxuICAgICAgaW1wb3J0IHsgQnJvd3Nlck1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL3BsYXRmb3JtLWJyb3dzZXInO1xuICAgICAgaW1wb3J0IHsgTmdNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbiAgICAgIGltcG9ydCB7IEFwcENvbXBvbmVudCB9IGZyb20gJy4vYXBwLmNvbXBvbmVudCc7XG5cbiAgICAgIEBOZ01vZHVsZSh7XG4gICAgICAgIGRlY2xhcmF0aW9uczogW1xuICAgICAgICAgIEFwcENvbXBvbmVudFxuICAgICAgICBdLFxuICAgICAgICBpbXBvcnRzOiBbXG4gICAgICAgICAgQnJvd3Nlck1vZHVsZVxuICAgICAgICBdLFxuICAgICAgICBwcm92aWRlcnM6IFtdLFxuICAgICAgICBib290c3RyYXA6IFtBcHBDb21wb25lbnRdXG4gICAgICB9KVxuICAgICAgZXhwb3J0IGNsYXNzIEFwcE1vZHVsZSB7IH1cbiAgICBgO1xuICB9KTtcblxuICBpdCgnc2hvdWxkIGFkZCBleHBvcnQgdG8gbW9kdWxlJywgKCkgPT4ge1xuICAgIGNvbnN0IHNvdXJjZSA9IGdldFRzU291cmNlKG1vZHVsZVBhdGgsIG1vZHVsZUNvbnRlbnQpO1xuICAgIGNvbnN0IGNoYW5nZXMgPSBhZGRFeHBvcnRUb01vZHVsZShzb3VyY2UsIG1vZHVsZVBhdGgsICdGb29Db21wb25lbnQnLCAnLi9mb28uY29tcG9uZW50Jyk7XG4gICAgY29uc3Qgb3V0cHV0ID0gYXBwbHlDaGFuZ2VzKG1vZHVsZVBhdGgsIG1vZHVsZUNvbnRlbnQsIGNoYW5nZXMpO1xuICAgIGV4cGVjdChvdXRwdXQpLnRvTWF0Y2goL2ltcG9ydCB7IEZvb0NvbXBvbmVudCB9IGZyb20gJy5cXC9mb28uY29tcG9uZW50JzsvKTtcbiAgICBleHBlY3Qob3V0cHV0KS50b01hdGNoKC9leHBvcnRzOiBcXFtGb29Db21wb25lbnRcXF0vKTtcbiAgfSk7XG5cbiAgaXQoJ3Nob3VsZCBhZGQgZXhwb3J0IHRvIG1vZHVsZSBpZiBub3QgaW5kZW50ZWQnLCAoKSA9PiB7XG4gICAgbW9kdWxlQ29udGVudCA9IHRhZ3Muc3RyaXBJbmRlbnRzYCR7bW9kdWxlQ29udGVudH1gO1xuICAgIGNvbnN0IHNvdXJjZSA9IGdldFRzU291cmNlKG1vZHVsZVBhdGgsIG1vZHVsZUNvbnRlbnQpO1xuICAgIGNvbnN0IGNoYW5nZXMgPSBhZGRFeHBvcnRUb01vZHVsZShzb3VyY2UsIG1vZHVsZVBhdGgsICdGb29Db21wb25lbnQnLCAnLi9mb28uY29tcG9uZW50Jyk7XG4gICAgY29uc3Qgb3V0cHV0ID0gYXBwbHlDaGFuZ2VzKG1vZHVsZVBhdGgsIG1vZHVsZUNvbnRlbnQsIGNoYW5nZXMpO1xuICAgIGV4cGVjdChvdXRwdXQpLnRvTWF0Y2goL2ltcG9ydCB7IEZvb0NvbXBvbmVudCB9IGZyb20gJy5cXC9mb28uY29tcG9uZW50JzsvKTtcbiAgICBleHBlY3Qob3V0cHV0KS50b01hdGNoKC9leHBvcnRzOiBcXFtGb29Db21wb25lbnRcXF0vKTtcbiAgfSk7XG5cbiAgaXQoJ3Nob3VsZCBhZGQgbWV0YWRhdGEnLCAoKSA9PiB7XG4gICAgY29uc3Qgc291cmNlID0gZ2V0VHNTb3VyY2UobW9kdWxlUGF0aCwgbW9kdWxlQ29udGVudCk7XG4gICAgY29uc3QgY2hhbmdlcyA9IGFkZFN5bWJvbFRvTmdNb2R1bGVNZXRhZGF0YShzb3VyY2UsIG1vZHVsZVBhdGgsICdpbXBvcnRzJywgJ0hlbGxvV29ybGQnKTtcbiAgICBleHBlY3QoY2hhbmdlcykubm90LnRvQmVOdWxsKCk7XG5cbiAgICBjb25zdCBvdXRwdXQgPSBhcHBseUNoYW5nZXMobW9kdWxlUGF0aCwgbW9kdWxlQ29udGVudCwgY2hhbmdlcyB8fCBbXSk7XG4gICAgZXhwZWN0KG91dHB1dCkudG9NYXRjaCgvaW1wb3J0czogW1xcc1xcU10rLFxcblxccytIZWxsb1dvcmxkXFxuXFxzK1xcXS9tKTtcbiAgfSk7XG5cbiAgaXQoJ3Nob3VsZCBhZGQgbWV0YWRhdGEgKGNvbW1hKScsICgpID0+IHtcbiAgICBjb25zdCBtb2R1bGVDb250ZW50ID0gYFxuICAgICAgaW1wb3J0IHsgQnJvd3Nlck1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL3BsYXRmb3JtLWJyb3dzZXInO1xuICAgICAgaW1wb3J0IHsgTmdNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuICAgICAgQE5nTW9kdWxlKHtcbiAgICAgICAgZGVjbGFyYXRpb25zOiBbXG4gICAgICAgICAgQXBwQ29tcG9uZW50XG4gICAgICAgIF0sXG4gICAgICAgIGltcG9ydHM6IFtcbiAgICAgICAgICBCcm93c2VyTW9kdWxlLFxuICAgICAgICBdLFxuICAgICAgICBwcm92aWRlcnM6IFtdLFxuICAgICAgICBib290c3RyYXA6IFtBcHBDb21wb25lbnRdXG4gICAgICB9KVxuICAgICAgZXhwb3J0IGNsYXNzIEFwcE1vZHVsZSB7IH1cbiAgICBgO1xuICAgIGNvbnN0IHNvdXJjZSA9IGdldFRzU291cmNlKG1vZHVsZVBhdGgsIG1vZHVsZUNvbnRlbnQpO1xuICAgIGNvbnN0IGNoYW5nZXMgPSBhZGRTeW1ib2xUb05nTW9kdWxlTWV0YWRhdGEoc291cmNlLCBtb2R1bGVQYXRoLCAnaW1wb3J0cycsICdIZWxsb1dvcmxkJyk7XG4gICAgZXhwZWN0KGNoYW5nZXMpLm5vdC50b0JlTnVsbCgpO1xuXG4gICAgY29uc3Qgb3V0cHV0ID0gYXBwbHlDaGFuZ2VzKG1vZHVsZVBhdGgsIG1vZHVsZUNvbnRlbnQsIGNoYW5nZXMgfHwgW10pO1xuICAgIGV4cGVjdChvdXRwdXQpLnRvTWF0Y2goL2ltcG9ydHM6IFtcXHNcXFNdKyxcXG5cXHMrSGVsbG9Xb3JsZCxcXG5cXHMrXFxdL20pO1xuICB9KTtcblxuICBpdCgnc2hvdWxkIGFkZCBtZXRhZGF0YSAobWlzc2luZyknLCAoKSA9PiB7XG4gICAgY29uc3QgbW9kdWxlQ29udGVudCA9IGBcbiAgICAgIGltcG9ydCB7IEJyb3dzZXJNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9wbGF0Zm9ybS1icm93c2VyJztcbiAgICAgIGltcG9ydCB7IE5nTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbiAgICAgIEBOZ01vZHVsZSh7XG4gICAgICAgIGRlY2xhcmF0aW9uczogW1xuICAgICAgICAgIEFwcENvbXBvbmVudFxuICAgICAgICBdLFxuICAgICAgICBwcm92aWRlcnM6IFtdLFxuICAgICAgICBib290c3RyYXA6IFtBcHBDb21wb25lbnRdXG4gICAgICB9KVxuICAgICAgZXhwb3J0IGNsYXNzIEFwcE1vZHVsZSB7IH1cbiAgICBgO1xuICAgIGNvbnN0IHNvdXJjZSA9IGdldFRzU291cmNlKG1vZHVsZVBhdGgsIG1vZHVsZUNvbnRlbnQpO1xuICAgIGNvbnN0IGNoYW5nZXMgPSBhZGRTeW1ib2xUb05nTW9kdWxlTWV0YWRhdGEoc291cmNlLCBtb2R1bGVQYXRoLCAnaW1wb3J0cycsICdIZWxsb1dvcmxkJyk7XG4gICAgZXhwZWN0KGNoYW5nZXMpLm5vdC50b0JlTnVsbCgpO1xuXG4gICAgY29uc3Qgb3V0cHV0ID0gYXBwbHlDaGFuZ2VzKG1vZHVsZVBhdGgsIG1vZHVsZUNvbnRlbnQsIGNoYW5nZXMgfHwgW10pO1xuICAgIGV4cGVjdChvdXRwdXQpLnRvTWF0Y2goL2ltcG9ydHM6IFxcW0hlbGxvV29ybGRdXFxyP1xcbi9tKTtcbiAgfSk7XG5cbiAgaXQoJ3Nob3VsZCBhZGQgbWV0YWRhdGEgKGVtcHR5KScsICgpID0+IHtcbiAgICBjb25zdCBtb2R1bGVDb250ZW50ID0gYFxuICAgICAgaW1wb3J0IHsgQnJvd3Nlck1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL3BsYXRmb3JtLWJyb3dzZXInO1xuICAgICAgaW1wb3J0IHsgTmdNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuICAgICAgQE5nTW9kdWxlKHtcbiAgICAgICAgZGVjbGFyYXRpb25zOiBbXG4gICAgICAgICAgQXBwQ29tcG9uZW50XG4gICAgICAgIF0sXG4gICAgICAgIHByb3ZpZGVyczogW10sXG4gICAgICAgIGltcG9ydHM6IFtdLFxuICAgICAgICBib290c3RyYXA6IFtBcHBDb21wb25lbnRdXG4gICAgICB9KVxuICAgICAgZXhwb3J0IGNsYXNzIEFwcE1vZHVsZSB7IH1cbiAgICBgO1xuICAgIGNvbnN0IHNvdXJjZSA9IGdldFRzU291cmNlKG1vZHVsZVBhdGgsIG1vZHVsZUNvbnRlbnQpO1xuICAgIGNvbnN0IGNoYW5nZXMgPSBhZGRTeW1ib2xUb05nTW9kdWxlTWV0YWRhdGEoc291cmNlLCBtb2R1bGVQYXRoLCAnaW1wb3J0cycsICdIZWxsb1dvcmxkJyk7XG4gICAgZXhwZWN0KGNoYW5nZXMpLm5vdC50b0JlTnVsbCgpO1xuXG4gICAgY29uc3Qgb3V0cHV0ID0gYXBwbHlDaGFuZ2VzKG1vZHVsZVBhdGgsIG1vZHVsZUNvbnRlbnQsIGNoYW5nZXMgfHwgW10pO1xuICAgIGV4cGVjdChvdXRwdXQpLnRvTWF0Y2goL2ltcG9ydHM6IFxcW0hlbGxvV29ybGRdLFxccj9cXG4vbSk7XG4gIH0pO1xufSk7XG4iXX0=