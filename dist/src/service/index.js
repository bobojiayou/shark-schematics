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
const config_1 = require("../utility/config");
const parse_name_1 = require("../utility/parse-name");
const project_1 = require("../utility/project");
function default_1(options) {
    return (host) => {
        const workspace = config_1.getWorkspace(host);
        if (!options.project) {
            throw new schematics_1.SchematicsException('Option (project) is required.');
        }
        const project = workspace.projects[options.project];
        if (options.path === undefined) {
            options.path = project_1.buildDefaultPath(project);
        }
        const parsedPath = parse_name_1.parseName(options.path, options.name);
        options.name = parsedPath.name;
        options.path = parsedPath.path;
        const templateSource = schematics_1.apply(schematics_1.url('./files'), [
            options.spec ? schematics_1.noop() : schematics_1.filter(path => !path.endsWith('.spec.ts')),
            schematics_1.template(Object.assign({}, core_1.strings, { 'if-flat': (s) => options.flat ? '' : s }, options)),
            schematics_1.move(parsedPath.path),
        ]);
        return schematics_1.mergeWith(templateSource);
    };
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL2JvYm8vV29yay9naXRodWIvc2hhcmstc2NoZW1hdGljcy9zcmMvIiwic291cmNlcyI6WyJzcmMvc2VydmljZS9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7R0FNRztBQUNILCtDQUErQztBQUMvQywyREFXb0M7QUFDcEMsOENBQWlEO0FBQ2pELHNEQUFrRDtBQUNsRCxnREFBc0Q7QUFHdEQsbUJBQXlCLE9BQXVCO0lBQzlDLE9BQU8sQ0FBQyxJQUFVLEVBQUUsRUFBRTtRQUNwQixNQUFNLFNBQVMsR0FBRyxxQkFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3JDLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFO1lBQ3BCLE1BQU0sSUFBSSxnQ0FBbUIsQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO1NBQ2hFO1FBQ0QsTUFBTSxPQUFPLEdBQUcsU0FBUyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFcEQsSUFBSSxPQUFPLENBQUMsSUFBSSxLQUFLLFNBQVMsRUFBRTtZQUM5QixPQUFPLENBQUMsSUFBSSxHQUFHLDBCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQzFDO1FBRUQsTUFBTSxVQUFVLEdBQUcsc0JBQVMsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN6RCxPQUFPLENBQUMsSUFBSSxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUM7UUFDL0IsT0FBTyxDQUFDLElBQUksR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDO1FBRS9CLE1BQU0sY0FBYyxHQUFHLGtCQUFLLENBQUMsZ0JBQUcsQ0FBQyxTQUFTLENBQUMsRUFBRTtZQUMzQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxpQkFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLG1CQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDbEUscUJBQVEsbUJBQ0gsY0FBTyxJQUNWLFNBQVMsRUFBRSxDQUFDLENBQVMsRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQzVDLE9BQU8sRUFDVjtZQUNGLGlCQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQztTQUN0QixDQUFDLENBQUM7UUFFSCxPQUFPLHNCQUFTLENBQUMsY0FBYyxDQUFDLENBQUM7SUFDbkMsQ0FBQyxDQUFDO0FBQ0osQ0FBQztBQTVCRCw0QkE0QkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQgeyBzdHJpbmdzIH0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L2NvcmUnO1xuaW1wb3J0IHtcbiAgUnVsZSxcbiAgU2NoZW1hdGljc0V4Y2VwdGlvbixcbiAgVHJlZSxcbiAgYXBwbHksXG4gIGZpbHRlcixcbiAgbWVyZ2VXaXRoLFxuICBtb3ZlLFxuICBub29wLFxuICB0ZW1wbGF0ZSxcbiAgdXJsLFxufSBmcm9tICdAYW5ndWxhci1kZXZraXQvc2NoZW1hdGljcyc7XG5pbXBvcnQgeyBnZXRXb3Jrc3BhY2UgfSBmcm9tICcuLi91dGlsaXR5L2NvbmZpZyc7XG5pbXBvcnQgeyBwYXJzZU5hbWUgfSBmcm9tICcuLi91dGlsaXR5L3BhcnNlLW5hbWUnO1xuaW1wb3J0IHsgYnVpbGREZWZhdWx0UGF0aCB9IGZyb20gJy4uL3V0aWxpdHkvcHJvamVjdCc7XG5pbXBvcnQgeyBTY2hlbWEgYXMgU2VydmljZU9wdGlvbnMgfSBmcm9tICcuL3NjaGVtYSc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIChvcHRpb25zOiBTZXJ2aWNlT3B0aW9ucyk6IFJ1bGUge1xuICByZXR1cm4gKGhvc3Q6IFRyZWUpID0+IHtcbiAgICBjb25zdCB3b3Jrc3BhY2UgPSBnZXRXb3Jrc3BhY2UoaG9zdCk7XG4gICAgaWYgKCFvcHRpb25zLnByb2plY3QpIHtcbiAgICAgIHRocm93IG5ldyBTY2hlbWF0aWNzRXhjZXB0aW9uKCdPcHRpb24gKHByb2plY3QpIGlzIHJlcXVpcmVkLicpO1xuICAgIH1cbiAgICBjb25zdCBwcm9qZWN0ID0gd29ya3NwYWNlLnByb2plY3RzW29wdGlvbnMucHJvamVjdF07XG5cbiAgICBpZiAob3B0aW9ucy5wYXRoID09PSB1bmRlZmluZWQpIHtcbiAgICAgIG9wdGlvbnMucGF0aCA9IGJ1aWxkRGVmYXVsdFBhdGgocHJvamVjdCk7XG4gICAgfVxuXG4gICAgY29uc3QgcGFyc2VkUGF0aCA9IHBhcnNlTmFtZShvcHRpb25zLnBhdGgsIG9wdGlvbnMubmFtZSk7XG4gICAgb3B0aW9ucy5uYW1lID0gcGFyc2VkUGF0aC5uYW1lO1xuICAgIG9wdGlvbnMucGF0aCA9IHBhcnNlZFBhdGgucGF0aDtcblxuICAgIGNvbnN0IHRlbXBsYXRlU291cmNlID0gYXBwbHkodXJsKCcuL2ZpbGVzJyksIFtcbiAgICAgIG9wdGlvbnMuc3BlYyA/IG5vb3AoKSA6IGZpbHRlcihwYXRoID0+ICFwYXRoLmVuZHNXaXRoKCcuc3BlYy50cycpKSxcbiAgICAgIHRlbXBsYXRlKHtcbiAgICAgICAgLi4uc3RyaW5ncyxcbiAgICAgICAgJ2lmLWZsYXQnOiAoczogc3RyaW5nKSA9PiBvcHRpb25zLmZsYXQgPyAnJyA6IHMsXG4gICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICB9KSxcbiAgICAgIG1vdmUocGFyc2VkUGF0aC5wYXRoKSxcbiAgICBdKTtcblxuICAgIHJldHVybiBtZXJnZVdpdGgodGVtcGxhdGVTb3VyY2UpO1xuICB9O1xufVxuIl19