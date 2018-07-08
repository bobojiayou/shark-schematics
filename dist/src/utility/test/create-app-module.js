"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function createAppModule(tree, path) {
    tree.create(path || '/src/app/app.module.ts', `
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
  `);
    return tree;
}
exports.createAppModule = createAppModule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLWFwcC1tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL2JvYm8vV29yay9naXRodWIvc2hhcmstc2NoZW1hdGljcy9zcmMvIiwic291cmNlcyI6WyJzcmMvdXRpbGl0eS90ZXN0L2NyZWF0ZS1hcHAtbW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBVUEseUJBQWdDLElBQWtCLEVBQUUsSUFBYTtJQUMvRCxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksSUFBSSx3QkFBd0IsRUFBRTs7Ozs7Ozs7Ozs7Ozs7OztHQWdCN0MsQ0FBQyxDQUFDO0lBRUgsT0FBTyxJQUFJLENBQUM7QUFDZCxDQUFDO0FBcEJELDBDQW9CQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7IFVuaXRUZXN0VHJlZSB9IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9zY2hlbWF0aWNzL3Rlc3RpbmcnO1xuXG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVBcHBNb2R1bGUodHJlZTogVW5pdFRlc3RUcmVlLCBwYXRoPzogc3RyaW5nKTogVW5pdFRlc3RUcmVlIHtcbiAgdHJlZS5jcmVhdGUocGF0aCB8fCAnL3NyYy9hcHAvYXBwLm1vZHVsZS50cycsIGBcbiAgICBpbXBvcnQgeyBCcm93c2VyTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvcGxhdGZvcm0tYnJvd3Nlcic7XG4gICAgaW1wb3J0IHsgTmdNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbiAgICBpbXBvcnQgeyBBcHBDb21wb25lbnQgfSBmcm9tICcuL2FwcC5jb21wb25lbnQnO1xuXG4gICAgQE5nTW9kdWxlKHtcbiAgICBkZWNsYXJhdGlvbnM6IFtcbiAgICAgIEFwcENvbXBvbmVudFxuICAgIF0sXG4gICAgaW1wb3J0czogW1xuICAgICAgQnJvd3Nlck1vZHVsZVxuICAgIF0sXG4gICAgcHJvdmlkZXJzOiBbXSxcbiAgICBib290c3RyYXA6IFtBcHBDb21wb25lbnRdXG4gICAgfSlcbiAgICBleHBvcnQgY2xhc3MgQXBwTW9kdWxlIHsgfVxuICBgKTtcblxuICByZXR1cm4gdHJlZTtcbn1cbiJdfQ==