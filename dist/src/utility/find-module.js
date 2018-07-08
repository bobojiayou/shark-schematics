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
/**
 * Find the module referred by a set of options passed to the schematics.
 */
function findModuleFromOptions(host, options) {
    if (options.hasOwnProperty('skipImport') && options.skipImport) {
        return undefined;
    }
    if (!options.module) {
        const pathToCheck = (options.path || '')
            + (options.flat ? '' : '/' + core_1.strings.dasherize(options.name));
        return core_1.normalize(findModule(host, pathToCheck));
    }
    else {
        const modulePath = core_1.normalize('/' + (options.path) + '/' + options.module);
        const moduleBaseName = core_1.normalize(modulePath).split('/').pop();
        if (host.exists(modulePath)) {
            return core_1.normalize(modulePath);
        }
        else if (host.exists(modulePath + '.ts')) {
            return core_1.normalize(modulePath + '.ts');
        }
        else if (host.exists(modulePath + '.module.ts')) {
            return core_1.normalize(modulePath + '.module.ts');
        }
        else if (host.exists(modulePath + '/' + moduleBaseName + '.module.ts')) {
            return core_1.normalize(modulePath + '/' + moduleBaseName + '.module.ts');
        }
        else {
            throw new Error('Specified module does not exist');
        }
    }
}
exports.findModuleFromOptions = findModuleFromOptions;
/**
 * Function to find the "closest" module to a generated file's path.
 */
function findModule(host, generateDir) {
    let dir = host.getDir('/' + generateDir);
    const moduleRe = /\.module\.ts$/;
    const routingModuleRe = /-routing\.module\.ts/;
    while (dir) {
        const matches = dir.subfiles.filter(p => moduleRe.test(p) && !routingModuleRe.test(p));
        if (matches.length == 1) {
            return core_1.join(dir.path, matches[0]);
        }
        else if (matches.length > 1) {
            throw new Error('More than one module matches. Use skip-import option to skip importing '
                + 'the component into the closest module.');
        }
        dir = dir.parent;
    }
    throw new Error('Could not find an NgModule. Use the skip-import '
        + 'option to skip importing in NgModule.');
}
exports.findModule = findModule;
/**
 * Build a relative path from one file path to another file path.
 */
function buildRelativePath(from, to) {
    from = core_1.normalize(from);
    to = core_1.normalize(to);
    // Convert to arrays.
    const fromParts = from.split('/');
    const toParts = to.split('/');
    // Remove file names (preserving destination)
    fromParts.pop();
    const toFileName = toParts.pop();
    const relativePath = core_1.relative(core_1.normalize(fromParts.join('/')), core_1.normalize(toParts.join('/')));
    let pathPrefix = '';
    // Set the path prefix for same dir or child dir, parent dir starts with `..`
    if (!relativePath) {
        pathPrefix = '.';
    }
    else if (!relativePath.startsWith('.')) {
        pathPrefix = `./`;
    }
    if (pathPrefix && !pathPrefix.endsWith('/')) {
        pathPrefix += '/';
    }
    return pathPrefix + (relativePath ? relativePath + '/' : '') + toFileName;
}
exports.buildRelativePath = buildRelativePath;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmluZC1tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL2JvYm8vV29yay9naXRodWIvc2hhcmstc2NoZW1hdGljcy9zcmMvIiwic291cmNlcyI6WyJzcmMvdXRpbGl0eS9maW5kLW1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7R0FNRztBQUNILCtDQUFnRjtBQWFoRjs7R0FFRztBQUNILCtCQUFzQyxJQUFVLEVBQUUsT0FBc0I7SUFDdEUsSUFBSSxPQUFPLENBQUMsY0FBYyxDQUFDLFlBQVksQ0FBQyxJQUFJLE9BQU8sQ0FBQyxVQUFVLEVBQUU7UUFDOUQsT0FBTyxTQUFTLENBQUM7S0FDbEI7SUFFRCxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRTtRQUNuQixNQUFNLFdBQVcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDO2NBQ3BCLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsY0FBTyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUVoRixPQUFPLGdCQUFTLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxXQUFXLENBQUMsQ0FBQyxDQUFDO0tBQ2pEO1NBQU07UUFDTCxNQUFNLFVBQVUsR0FBRyxnQkFBUyxDQUMxQixHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUMvQyxNQUFNLGNBQWMsR0FBRyxnQkFBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUU5RCxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDM0IsT0FBTyxnQkFBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1NBQzlCO2FBQU0sSUFB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QUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRTtRQUMzQyxVQUFVLElBQUksR0FBRyxDQUFDO0tBQ25CO0lBRUQsT0FBTyxVQUFVLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLFlBQVksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFVBQVUsQ0FBQztBQUM1RSxDQUFDO0FBMUJELDhDQTBCQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7IFBhdGgsIGpvaW4sIG5vcm1hbGl6ZSwgcmVsYXRpdmUsIHN0cmluZ3MgfSBmcm9tICdAYW5ndWxhci1kZXZraXQvY29yZSc7XG5pbXBvcnQgeyBEaXJFbnRyeSwgVHJlZSB9IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9zY2hlbWF0aWNzJztcblxuXG5leHBvcnQgaW50ZXJmYWNlIE1vZHVsZU9wdGlvbnMge1xuICBtb2R1bGU/OiBzdHJpbmc7XG4gIG5hbWU6IHN0cmluZztcbiAgZmxhdD86IGJvb2xlYW47XG4gIHBhdGg/OiBzdHJpbmc7XG4gIHNraXBJbXBvcnQ/OiBib29sZWFuO1xufVxuXG5cbi8qKlxuICogRmluZCB0aGUgbW9kdWxlIHJlZmVycmVkIGJ5IGEgc2V0IG9mIG9wdGlvbnMgcGFzc2VkIHRvIHRoZSBzY2hlbWF0aWNzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZmluZE1vZHVsZUZyb21PcHRpb25zKGhvc3Q6IFRyZWUsIG9wdGlvbnM6IE1vZHVsZU9wdGlvbnMpOiBQYXRoIHwgdW5kZWZpbmVkIHtcbiAgaWYgKG9wdGlvbnMuaGFzT3duUHJvcGVydHkoJ3NraXBJbXBvcnQnKSAmJiBvcHRpb25zLnNraXBJbXBvcnQpIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG5cbiAgaWYgKCFvcHRpb25zLm1vZHVsZSkge1xuICAgIGNvbnN0IHBhdGhUb0NoZWNrID0gKG9wdGlvbnMucGF0aCB8fCAnJylcbiAgICAgICAgICAgICAgICAgICAgICArIChvcHRpb25zLmZsYXQgPyAnJyA6ICcvJyArIHN0cmluZ3MuZGFzaGVyaXplKG9wdGlvbnMubmFtZSkpO1xuXG4gICAgcmV0dXJuIG5vcm1hbGl6ZShmaW5kTW9kdWxlKGhvc3QsIHBhdGhUb0NoZWNrKSk7XG4gIH0gZWxzZSB7XG4gICAgY29uc3QgbW9kdWxlUGF0aCA9IG5vcm1hbGl6ZShcbiAgICAgICcvJyArIChvcHRpb25zLnBhdGgpICsgJy8nICsgb3B0aW9ucy5tb2R1bGUpO1xuICAgIGNvbnN0IG1vZHVsZUJhc2VOYW1lID0gbm9ybWFsaXplKG1vZHVsZVBhdGgpLnNwbGl0KCcvJykucG9wKCk7XG5cbiAgICBpZiAoaG9zdC5leGlzdHMobW9kdWxlUGF0aCkpIHtcbiAgICAgIHJldHVybiBub3JtYWxpemUobW9kdWxlUGF0aCk7XG4gICAgfSBlbHNlIGlmIChob3N0LmV4aXN0cyhtb2R1bGVQYXRoICsgJy50cycpKSB7XG4gICAgICByZXR1cm4gbm9ybWFsaXplKG1vZHVsZVBhdGggKyAnLnRzJyk7XG4gICAgfSBlbHNlIGlmIChob3N0LmV4aXN0cyhtb2R1bGVQYXRoICsgJy5tb2R1bGUudHMnKSkge1xuICAgICAgcmV0dXJuIG5vcm1hbGl6ZShtb2R1bGVQYXRoICsgJy5tb2R1bGUudHMnKTtcbiAgICB9IGVsc2UgaWYgKGhvc3QuZXhpc3RzKG1vZHVsZVBhdGggKyAnLycgKyBtb2R1bGVCYXNlTmFtZSArICcubW9kdWxlLnRzJykpIHtcbiAgICAgIHJldHVybiBub3JtYWxpemUobW9kdWxlUGF0aCArICcvJyArIG1vZHVsZUJhc2VOYW1lICsgJy5tb2R1bGUudHMnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdTcGVjaWZpZWQgbW9kdWxlIGRvZXMgbm90IGV4aXN0Jyk7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gZmluZCB0aGUgXCJjbG9zZXN0XCIgbW9kdWxlIHRvIGEgZ2VuZXJhdGVkIGZpbGUncyBwYXRoLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZmluZE1vZHVsZShob3N0OiBUcmVlLCBnZW5lcmF0ZURpcjogc3RyaW5nKTogUGF0aCB7XG4gIGxldCBkaXI6IERpckVudHJ5IHwgbnVsbCA9IGhvc3QuZ2V0RGlyKCcvJyArIGdlbmVyYXRlRGlyKTtcblxuICBjb25zdCBtb2R1bGVSZSA9IC9cXC5tb2R1bGVcXC50cyQvO1xuICBjb25zdCByb3V0aW5nTW9kdWxlUmUgPSAvLXJvdXRpbmdcXC5tb2R1bGVcXC50cy87XG5cbiAgd2hpbGUgKGRpcikge1xuICAgIGNvbnN0IG1hdGNoZXMgPSBkaXIuc3ViZmlsZXMuZmlsdGVyKHAgPT4gbW9kdWxlUmUudGVzdChwKSAmJiAhcm91dGluZ01vZHVsZVJlLnRlc3QocCkpO1xuXG4gICAgaWYgKG1hdGNoZXMubGVuZ3RoID09IDEpIHtcbiAgICAgIHJldHVybiBqb2luKGRpci5wYXRoLCBtYXRjaGVzWzBdKTtcbiAgICB9IGVsc2UgaWYgKG1hdGNoZXMubGVuZ3RoID4gMSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdNb3JlIHRoYW4gb25lIG1vZHVsZSBtYXRjaGVzLiBVc2Ugc2tpcC1pbXBvcnQgb3B0aW9uIHRvIHNraXAgaW1wb3J0aW5nICdcbiAgICAgICAgKyAndGhlIGNvbXBvbmVudCBpbnRvIHRoZSBjbG9zZXN0IG1vZHVsZS4nKTtcbiAgICB9XG5cbiAgICBkaXIgPSBkaXIucGFyZW50O1xuICB9XG5cbiAgdGhyb3cgbmV3IEVycm9yKCdDb3VsZCBub3QgZmluZCBhbiBOZ01vZHVsZS4gVXNlIHRoZSBza2lwLWltcG9ydCAnXG4gICAgKyAnb3B0aW9uIHRvIHNraXAgaW1wb3J0aW5nIGluIE5nTW9kdWxlLicpO1xufVxuXG4vKipcbiAqIEJ1aWxkIGEgcmVsYXRpdmUgcGF0aCBmcm9tIG9uZSBmaWxlIHBhdGggdG8gYW5vdGhlciBmaWxlIHBhdGguXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBidWlsZFJlbGF0aXZlUGF0aChmcm9tOiBzdHJpbmcsIHRvOiBzdHJpbmcpOiBzdHJpbmcge1xuICBmcm9tID0gbm9ybWFsaXplKGZyb20pO1xuICB0byA9IG5vcm1hbGl6ZSh0byk7XG5cbiAgLy8gQ29udmVydCB0byBhcnJheXMuXG4gIGNvbnN0IGZyb21QYXJ0cyA9IGZyb20uc3BsaXQoJy8nKTtcbiAgY29uc3QgdG9QYXJ0cyA9IHRvLnNwbGl0KCcvJyk7XG5cbiAgLy8gUmVtb3ZlIGZpbGUgbmFtZXMgKHByZXNlcnZpbmcgZGVzdGluYXRpb24pXG4gIGZyb21QYXJ0cy5wb3AoKTtcbiAgY29uc3QgdG9GaWxlTmFtZSA9IHRvUGFydHMucG9wKCk7XG5cbiAgY29uc3QgcmVsYXRpdmVQYXRoID0gcmVsYXRpdmUobm9ybWFsaXplKGZyb21QYXJ0cy5qb2luKCcvJykpLCBub3JtYWxpemUodG9QYXJ0cy5qb2luKCcvJykpKTtcbiAgbGV0IHBhdGhQcmVmaXggPSAnJztcblxuICAvLyBTZXQgdGhlIHBhdGggcHJlZml4IGZvciBzYW1lIGRpciBvciBjaGlsZCBkaXIsIHBhcmVudCBkaXIgc3RhcnRzIHdpdGggYC4uYFxuICBpZiAoIXJlbGF0aXZlUGF0aCkge1xuICAgIHBhdGhQcmVmaXggPSAnLic7XG4gIH0gZWxzZSBpZiAoIXJlbGF0aXZlUGF0aC5zdGFydHNXaXRoKCcuJykpIHtcbiAgICBwYXRoUHJlZml4ID0gYC4vYDtcbiAgfVxuICBpZiAocGF0aFByZWZpeCAmJiAhcGF0aFByZWZpeC5lbmRzV2l0aCgnLycpKSB7XG4gICAgcGF0aFByZWZpeCArPSAnLyc7XG4gIH1cblxuICByZXR1cm4gcGF0aFByZWZpeCArIChyZWxhdGl2ZVBhdGggPyByZWxhdGl2ZVBhdGggKyAnLycgOiAnJykgKyB0b0ZpbGVOYW1lO1xufVxuIl19