"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
// import { relative, Path } from "../../../angular_devkit/core/src/virtual-fs";
const core_1 = require("@angular-devkit/core");
function parseName(path, name) {
    const nameWithoutPath = core_1.basename(name);
    const namePath = core_1.dirname((path + '/' + name));
    return {
        name: nameWithoutPath,
        path: core_1.normalize('/' + namePath),
    };
}
exports.parseName = parseName;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2UtbmFtZS5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvYm9iby9Xb3JrL2dpdGh1Yi9zaGFyay1zY2hlbWF0aWNzL3NyYy8iLCJzb3VyY2VzIjpbInNyYy91dGlsaXR5L3BhcnNlLW5hbWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQTs7Ozs7O0dBTUc7QUFDSCxnRkFBZ0Y7QUFDaEYsK0NBQTBFO0FBTzFFLG1CQUEwQixJQUFZLEVBQUUsSUFBWTtJQUNsRCxNQUFNLGVBQWUsR0FBRyxlQUFRLENBQUMsSUFBWSxDQUFDLENBQUM7SUFDL0MsTUFBTSxRQUFRLEdBQUcsY0FBTyxDQUFDLENBQUMsSUFBSSxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQVMsQ0FBQyxDQUFDO0lBRXRELE9BQU87UUFDTCxJQUFJLEVBQUUsZUFBZTtRQUNyQixJQUFJLEVBQUUsZ0JBQVMsQ0FBQyxHQUFHLEdBQUcsUUFBUSxDQUFDO0tBQ2hDLENBQUM7QUFDSixDQUFDO0FBUkQsOEJBUUMiLCJzb3VyY2VzQ29udGVudCI6WyJcbi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbi8vIGltcG9ydCB7IHJlbGF0aXZlLCBQYXRoIH0gZnJvbSBcIi4uLy4uLy4uL2FuZ3VsYXJfZGV2a2l0L2NvcmUvc3JjL3ZpcnR1YWwtZnNcIjtcbmltcG9ydCB7IFBhdGgsIGJhc2VuYW1lLCBkaXJuYW1lLCBub3JtYWxpemUgfSBmcm9tICdAYW5ndWxhci1kZXZraXQvY29yZSc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgTG9jYXRpb24ge1xuICBuYW1lOiBzdHJpbmc7XG4gIHBhdGg6IFBhdGg7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZU5hbWUocGF0aDogc3RyaW5nLCBuYW1lOiBzdHJpbmcpOiBMb2NhdGlvbiB7XG4gIGNvbnN0IG5hbWVXaXRob3V0UGF0aCA9IGJhc2VuYW1lKG5hbWUgYXMgUGF0aCk7XG4gIGNvbnN0IG5hbWVQYXRoID0gZGlybmFtZSgocGF0aCArICcvJyArIG5hbWUpIGFzIFBhdGgpO1xuXG4gIHJldHVybiB7XG4gICAgbmFtZTogbmFtZVdpdGhvdXRQYXRoLFxuICAgIHBhdGg6IG5vcm1hbGl6ZSgnLycgKyBuYW1lUGF0aCksXG4gIH07XG59XG4iXX0=