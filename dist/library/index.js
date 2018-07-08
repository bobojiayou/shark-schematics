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
const tasks_1 = require("@angular-devkit/schematics/tasks");
const config_1 = require("../utility/config");
const latest_versions_1 = require("../utility/latest-versions");
const validation_1 = require("../utility/validation");
function updateJsonFile(host, path, callback) {
    const source = host.read(path);
    if (source) {
        const sourceText = source.toString('utf-8');
        const json = JSON.parse(sourceText);
        callback(json);
        host.overwrite(path, JSON.stringify(json, null, 2));
    }
    return host;
}
function updateTsConfig(packageName, distRoot) {
    return (host) => {
        if (!host.exists('tsconfig.json')) {
            return host;
        }
        return updateJsonFile(host, 'tsconfig.json', (tsconfig) => {
            if (!tsconfig.compilerOptions.paths) {
                tsconfig.compilerOptions.paths = {};
            }
            if (!tsconfig.compilerOptions.paths[packageName]) {
                tsconfig.compilerOptions.paths[packageName] = [];
            }
            tsconfig.compilerOptions.paths[packageName].push(distRoot);
            // deep import & secondary entrypoint support
            const deepPackagePath = packageName + '/*';
            if (!tsconfig.compilerOptions.paths[deepPackagePath]) {
                tsconfig.compilerOptions.paths[deepPackagePath] = [];
            }
            tsconfig.compilerOptions.paths[deepPackagePath].push(distRoot + '/*');
        });
    };
}
function addDependenciesToPackageJson() {
    return (host) => {
        if (!host.exists('package.json')) {
            return host;
        }
        return updateJsonFile(host, 'package.json', (json) => {
            if (!json['dependencies']) {
                json['dependencies'] = {};
            }
            json.dependencies = Object.assign({ '@angular/common': latest_versions_1.latestVersions.Angular, '@angular/core': latest_versions_1.latestVersions.Angular, '@angular/compiler': latest_versions_1.latestVersions.Angular }, json.dependencies);
            if (!json['devDependencies']) {
                json['devDependencies'] = {};
            }
            json.devDependencies = Object.assign({ '@angular/compiler-cli': latest_versions_1.latestVersions.Angular, '@angular-devkit/build-ng-packagr': latest_versions_1.latestVersions.DevkitBuildNgPackagr, '@angular-devkit/build-angular': latest_versions_1.latestVersions.DevkitBuildNgPackagr, 'ng-packagr': '^3.0.0', 'tsickle': '>=0.29.0', 'tslib': '^1.9.0', 'typescript': latest_versions_1.latestVersions.TypeScript }, json.devDependencies);
        });
    };
}
function addAppToWorkspaceFile(options, workspace, projectRoot, packageName) {
    const project = {
        root: `${projectRoot}`,
        sourceRoot: `${projectRoot}/src`,
        projectType: 'library',
        prefix: options.prefix || 'lib',
        architect: {
            build: {
                builder: '@angular-devkit/build-ng-packagr:build',
                options: {
                    tsConfig: `${projectRoot}/tsconfig.lib.json`,
                    project: `${projectRoot}/ng-package.json`,
                },
                configurations: {
                    production: {
                        project: `${projectRoot}/ng-package.prod.json`,
                    },
                },
            },
            test: {
                builder: '@angular-devkit/build-angular:karma',
                options: {
                    main: `${projectRoot}/src/test.ts`,
                    tsConfig: `${projectRoot}/tsconfig.spec.json`,
                    karmaConfig: `${projectRoot}/karma.conf.js`,
                },
            },
            lint: {
                builder: '@angular-devkit/build-angular:tslint',
                options: {
                    tsConfig: [
                        `${projectRoot}/tsconfig.lib.json`,
                        `${projectRoot}/tsconfig.spec.json`,
                    ],
                    exclude: [
                        '**/node_modules/**',
                    ],
                },
            },
        },
    };
    return config_1.addProjectToWorkspace(workspace, packageName, project);
}
function default_1(options) {
    return (host, context) => {
        if (!options.name) {
            throw new schematics_1.SchematicsException(`Invalid options, "name" is required.`);
        }
        const prefix = options.prefix || 'lib';
        validation_1.validateProjectName(options.name);
        // If scoped project (i.e. "@foo/bar"), convert projectDir to "foo/bar".
        const packageName = options.name;
        let scopeName = null;
        if (/^@.*\/.*/.test(options.name)) {
            const [scope, name] = options.name.split('/');
            scopeName = scope.replace(/^@/, '');
            options.name = name;
        }
        const workspace = config_1.getWorkspace(host);
        const newProjectRoot = workspace.newProjectRoot;
        const scopeFolder = scopeName ? core_1.strings.dasherize(scopeName) + '/' : '';
        const folderName = `${scopeFolder}${core_1.strings.dasherize(options.name)}`;
        const projectRoot = `${newProjectRoot}/${folderName}`;
        const distRoot = `dist/${folderName}`;
        const sourceDir = `${projectRoot}/src/lib`;
        const relativePathToWorkspaceRoot = projectRoot.split('/').map(x => '..').join('/');
        const templateSource = schematics_1.apply(schematics_1.url('./files'), [
            schematics_1.template(Object.assign({}, core_1.strings, options, { packageName,
                projectRoot,
                distRoot,
                relativePathToWorkspaceRoot,
                prefix })),
        ]);
        return schematics_1.chain([
            schematics_1.branchAndMerge(schematics_1.mergeWith(templateSource)),
            addAppToWorkspaceFile(options, workspace, projectRoot, packageName),
            options.skipPackageJson ? schematics_1.noop() : addDependenciesToPackageJson(),
            options.skipTsConfig ? schematics_1.noop() : updateTsConfig(packageName, distRoot),
            schematics_1.schematic('module', {
                name: options.name,
                commonModule: false,
                flat: true,
                path: sourceDir,
                spec: false,
                project: options.name,
            }),
            schematics_1.schematic('component', {
                name: options.name,
                selector: `${prefix}-${options.name}`,
                inlineStyle: true,
                inlineTemplate: true,
                flat: true,
                path: sourceDir,
                export: true,
                project: options.name,
            }),
            schematics_1.schematic('service', {
                name: options.name,
                flat: true,
                path: sourceDir,
                project: options.name,
            }),
            (_tree, context) => {
                if (!options.skipPackageJson) {
                    context.addTask(new tasks_1.NodePackageInstallTask());
                }
            },
        ]);
    };
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL2JvYm8vV29yay9zaGFyay1zY2hlbWF0aWNzL3NyYy8iLCJzb3VyY2VzIjpbInNyYy9saWJyYXJ5L2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7OztHQU1HO0FBQ0gsK0NBQStDO0FBQy9DLDJEQWFvQztBQUNwQyw0REFBMEU7QUFDMUUsOENBSzJCO0FBQzNCLGdFQUE0RDtBQUM1RCxzREFBNEQ7QUE2QjVELHdCQUEyQixJQUFVLEVBQUUsSUFBWSxFQUFFLFFBQXlCO0lBQzVFLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDL0IsSUFBSSxNQUFNLEVBQUU7UUFDVixNQUFNLFVBQVUsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzVDLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDcEMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2YsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDckQ7SUFFRCxPQUFPLElBQUksQ0FBQztBQUNkLENBQUM7QUFFRCx3QkFBd0IsV0FBbUIsRUFBRSxRQUFnQjtJQUUzRCxPQUFPLENBQUMsSUFBVSxFQUFFLEVBQUU7UUFDcEIsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLEVBQUU7WUFBRSxPQUFPLElBQUksQ0FBQztTQUFFO1FBRW5ELE9BQU8sY0FBYyxDQUFDLElBQUksRUFBRSxlQUFlLEVBQUUsQ0FBQyxRQUE2QixFQUFFLEVBQUU7WUFDN0UsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsS0FBSyxFQUFFO2dCQUNuQyxRQUFRLENBQUMsZUFBZSxDQUFDLEtB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QyxDQUFDO0lBQ0wsQ0FBQyxDQUFDO0FBQ0osQ0FBQztBQWhGRCw0QkFnRkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQgeyBzdHJpbmdzIH0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L2NvcmUnO1xuaW1wb3J0IHtcbiAgUnVsZSxcbiAgU2NoZW1hdGljQ29udGV4dCxcbiAgU2NoZW1hdGljc0V4Y2VwdGlvbixcbiAgVHJlZSxcbiAgYXBwbHksXG4gIGJyYW5jaEFuZE1lcmdlLFxuICBjaGFpbixcbiAgbWVyZ2VXaXRoLFxuICBub29wLFxuICBzY2hlbWF0aWMsXG4gIHRlbXBsYXRlLFxuICB1cmwsXG59IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9zY2hlbWF0aWNzJztcbmltcG9ydCB7IE5vZGVQYWNrYWdlSW5zdGFsbFRhc2sgfSBmcm9tICdAYW5ndWxhci1kZXZraXQvc2NoZW1hdGljcy90YXNrcyc7XG5pbXBvcnQge1xuICBXb3Jrc3BhY2VQcm9qZWN0LFxuICBXb3Jrc3BhY2VTY2hlbWEsXG4gIGFkZFByb2plY3RUb1dvcmtzcGFjZSxcbiAgZ2V0V29ya3NwYWNlLFxufSBmcm9tICcuLi91dGlsaXR5L2NvbmZpZyc7XG5pbXBvcnQgeyBsYXRlc3RWZXJzaW9ucyB9IGZyb20gJy4uL3V0aWxpdHkvbGF0ZXN0LXZlcnNpb25zJztcbmltcG9ydCB7IHZhbGlkYXRlUHJvamVjdE5hbWUgfSBmcm9tICcuLi91dGlsaXR5L3ZhbGlkYXRpb24nO1xuaW1wb3J0IHsgU2NoZW1hIGFzIExpYnJhcnlPcHRpb25zIH0gZnJvbSAnLi9zY2hlbWEnO1xuXG5cbnR5cGUgUGFja2FnZUpzb25QYXJ0aWFsVHlwZSA9IHtcbiAgc2NyaXB0czoge1xuICAgIFtrZXk6IHN0cmluZ106IHN0cmluZztcbiAgfSxcbiAgZGVwZW5kZW5jaWVzOiB7XG4gICAgW2tleTogc3RyaW5nXTogc3RyaW5nO1xuICB9LFxuICBkZXZEZXBlbmRlbmNpZXM6IHtcbiAgICBba2V5OiBzdHJpbmddOiBzdHJpbmc7XG4gIH0sXG59O1xuXG5pbnRlcmZhY2UgVXBkYXRlSnNvbkZuPFQ+IHtcbiAgKG9iajogVCk6IFQgfCB2b2lkO1xufVxuXG50eXBlIFRzQ29uZmlnUGFydGlhbFR5cGUgPSB7XG4gIGNvbXBpbGVyT3B0aW9uczoge1xuICAgIGJhc2VVcmw6IHN0cmluZyxcbiAgICBwYXRoczoge1xuICAgICAgW2tleTogc3RyaW5nXTogc3RyaW5nW107XG4gICAgfSxcbiAgfSxcbn07XG5cbmZ1bmN0aW9uIHVwZGF0ZUpzb25GaWxlPFQ+KGhvc3Q6IFRyZWUsIHBhdGg6IHN0cmluZywgY2FsbGJhY2s6IFVwZGF0ZUpzb25GbjxUPik6IFRyZWUge1xuICBjb25zdCBzb3VyY2UgPSBob3N0LnJlYWQocGF0aCk7XG4gIGlmIChzb3VyY2UpIHtcbiAgICBjb25zdCBzb3VyY2VUZXh0ID0gc291cmNlLnRvU3RyaW5nKCd1dGYtOCcpO1xuICAgIGNvbnN0IGpzb24gPSBKU09OLnBhcnNlKHNvdXJjZVRleHQpO1xuICAgIGNhbGxiYWNrKGpzb24pO1xuICAgIGhvc3Qub3ZlcndyaXRlKHBhdGgsIEpTT04uc3RyaW5naWZ5KGpzb24sIG51bGwsIDIpKTtcbiAgfVxuXG4gIHJldHVybiBob3N0O1xufVxuXG5mdW5jdGlvbiB1cGRhdGVUc0NvbmZpZyhwYWNrYWdlTmFtZTogc3RyaW5nLCBkaXN0Um9vdDogc3RyaW5nKSB7XG5cbiAgcmV0dXJuIChob3N0OiBUcmVlKSA9PiB7XG4gICAgaWYgKCFob3N0LmV4aXN0cygndHNjb25maWcuanNvbicpKSB7IHJldHVybiBob3N0OyB9XG5cbiAgICByZXR1cm4gdXBkYXRlSnNvbkZpbGUoaG9zdCwgJ3RzY29uZmlnLmpzb24nLCAodHNjb25maWc6IFRzQ29uZmlnUGFydGlhbFR5cGUpID0+IHtcbiAgICAgIGlmICghdHNjb25maWcuY29tcGlsZXJPcHRpb25zLnBhdGhzKSB7XG4gICAgICAgIHRzY29uZmlnLmNvbXBpbGVyT3B0aW9ucy5wYXRocyA9IHt9O1xuICAgICAgfVxuICAgICAgaWYgKCF0c2NvbmZpZy5jb21waWxlck9wdGlvbnMucGF0aHNbcGFja2FnZU5hbWVdKSB7XG4gICAgICAgIHRzY29uZmlnLmNvbXBpbGVyT3B0aW9ucy5wYXRoc1twYWNrYWdlTmFtZV0gPSBbXTtcbiAgICAgIH1cbiAgICAgIHRzY29uZmlnLmNvbXBpbGVyT3B0aW9ucy5wYXRoc1twYWNrYWdlTmFtZV0ucHVzaChkaXN0Um9vdCk7XG5cbiAgICAgIC8vIGRlZXAgaW1wb3J0ICYgc2Vjb25kYXJ5IGVudHJ5cG9pbnQgc3VwcG9ydFxuICAgICAgY29uc3QgZGVlcFBhY2thZ2VQYXRoID0gcGFja2FnZU5hbWUgKyAnLyonO1xuICAgICAgaWYgKCF0c2NvbmZpZy5jb21waWxlck9wdGlvbnMucGF0aHNbZGVlcFBhY2thZ2VQYXRoXSkge1xuICAgICAgICB0c2NvbmZpZy5jb21waWxlck9wdGlvbnMucGF0aHNbZGVlcFBhY2thZ2VQYXRoXSA9IFtdO1xuICAgICAgfVxuICAgICAgdHNjb25maWcuY29tcGlsZXJPcHRpb25zLnBhdGhzW2RlZXBQYWNrYWdlUGF0aF0ucHVzaChkaXN0Um9vdCArICcvKicpO1xuICAgIH0pO1xuICB9O1xufVxuXG5mdW5jdGlvbiBhZGREZXBlbmRlbmNpZXNUb1BhY2thZ2VKc29uKCkge1xuXG4gIHJldHVybiAoaG9zdDogVHJlZSkgPT4ge1xuICAgIGlmICghaG9zdC5leGlzdHMoJ3BhY2thZ2UuanNvbicpKSB7IHJldHVybiBob3N0OyB9XG5cbiAgICByZXR1cm4gdXBkYXRlSnNvbkZpbGUoaG9zdCwgJ3BhY2thZ2UuanNvbicsIChqc29uOiBQYWNrYWdlSnNvblBhcnRpYWxUeXBlKSA9PiB7XG5cblxuICAgICAgaWYgKCFqc29uWydkZXBlbmRlbmNpZXMnXSkge1xuICAgICAgICBqc29uWydkZXBlbmRlbmNpZXMnXSA9IHt9O1xuICAgICAgfVxuXG4gICAgICBqc29uLmRlcGVuZGVuY2llcyA9IHtcbiAgICAgICAgJ0Bhbmd1bGFyL2NvbW1vbic6IGxhdGVzdFZlcnNpb25zLkFuZ3VsYXIsXG4gICAgICAgICdAYW5ndWxhci9jb3JlJzogbGF0ZXN0VmVyc2lvbnMuQW5ndWxhcixcbiAgICAgICAgJ0Bhbmd1bGFyL2NvbXBpbGVyJzogbGF0ZXN0VmVyc2lvbnMuQW5ndWxhcixcbiAgICAgICAgLy8gRGUtc3RydWN0dXJlIGxhc3Qga2VlcHMgZXhpc3RpbmcgdXNlciBkZXBlbmRlbmNpZXMuXG4gICAgICAgIC4uLmpzb24uZGVwZW5kZW5jaWVzLFxuICAgICAgfTtcblxuICAgICAgaWYgKCFqc29uWydkZXZEZXBlbmRlbmNpZXMnXSkge1xuICAgICAgICBqc29uWydkZXZEZXBlbmRlbmNpZXMnXSA9IHt9O1xuICAgICAgfVxuXG4gICAgICBqc29uLmRldkRlcGVuZGVuY2llcyA9IHtcbiAgICAgICAgJ0Bhbmd1bGFyL2NvbXBpbGVyLWNsaSc6IGxhdGVzdFZlcnNpb25zLkFuZ3VsYXIsXG4gICAgICAgICdAYW5ndWxhci1kZXZraXQvYnVpbGQtbmctcGFja2Fncic6IGxhdGVzdFZlcnNpb25zLkRldmtpdEJ1aWxkTmdQYWNrYWdyLFxuICAgICAgICAnQGFuZ3VsYXItZGV2a2l0L2J1aWxkLWFuZ3VsYXInOiBsYXRlc3RWZXJzaW9ucy5EZXZraXRCdWlsZE5nUGFja2FncixcbiAgICAgICAgJ25nLXBhY2thZ3InOiAnXjMuMC4wJyxcbiAgICAgICAgJ3RzaWNrbGUnOiAnPj0wLjI5LjAnLFxuICAgICAgICAndHNsaWInOiAnXjEuOS4wJyxcbiAgICAgICAgJ3R5cGVzY3JpcHQnOiBsYXRlc3RWZXJzaW9ucy5UeXBlU2NyaXB0LFxuICAgICAgICAvLyBEZS1zdHJ1Y3R1cmUgbGFzdCBrZWVwcyBleGlzdGluZyB1c2VyIGRlcGVuZGVuY2llcy5cbiAgICAgICAgLi4uanNvbi5kZXZEZXBlbmRlbmNpZXMsXG4gICAgICB9O1xuICAgIH0pO1xuICB9O1xufVxuXG5mdW5jdGlvbiBhZGRBcHBUb1dvcmtzcGFjZUZpbGUob3B0aW9uczogTGlicmFyeU9wdGlvbnMsIHdvcmtzcGFjZTogV29ya3NwYWNlU2NoZW1hLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3RSb290OiBzdHJpbmcsIHBhY2thZ2VOYW1lOiBzdHJpbmcpOiBSdWxlIHtcblxuICBjb25zdCBwcm9qZWN0OiBXb3Jrc3BhY2VQcm9qZWN0ID0ge1xuICAgIHJvb3Q6IGAke3Byb2plY3RSb290fWAsXG4gICAgc291cmNlUm9vdDogYCR7cHJvamVjdFJvb3R9L3NyY2AsXG4gICAgcHJvamVjdFR5cGU6ICdsaWJyYXJ5JyxcbiAgICBwcmVmaXg6IG9wdGlvbnMucHJlZml4IHx8ICdsaWInLFxuICAgIGFyY2hpdGVjdDoge1xuICAgICAgYnVpbGQ6IHtcbiAgICAgICAgYnVpbGRlcjogJ0Bhbmd1bGFyLWRldmtpdC9idWlsZC1uZy1wYWNrYWdyOmJ1aWxkJyxcbiAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgIHRzQ29uZmlnOiBgJHtwcm9qZWN0Um9vdH0vdHNjb25maWcubGliLmpzb25gLFxuICAgICAgICAgIHByb2plY3Q6IGAke3Byb2plY3RSb290fS9uZy1wYWNrYWdlLmpzb25gLFxuICAgICAgICB9LFxuICAgICAgICBjb25maWd1cmF0aW9uczoge1xuICAgICAgICAgIHByb2R1Y3Rpb246IHtcbiAgICAgICAgICAgIHByb2plY3Q6IGAke3Byb2plY3RSb290fS9uZy1wYWNrYWdlLnByb2QuanNvbmAsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICB0ZXN0OiB7XG4gICAgICAgIGJ1aWxkZXI6ICdAYW5ndWxhci1kZXZraXQvYnVpbGQtYW5ndWxhcjprYXJtYScsXG4gICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICBtYWluOiBgJHtwcm9qZWN0Um9vdH0vc3JjL3Rlc3QudHNgLFxuICAgICAgICAgIHRzQ29uZmlnOiBgJHtwcm9qZWN0Um9vdH0vdHNjb25maWcuc3BlYy5qc29uYCxcbiAgICAgICAgICBrYXJtYUNvbmZpZzogYCR7cHJvamVjdFJvb3R9L2thcm1hLmNvbmYuanNgLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIGxpbnQ6IHtcbiAgICAgICAgYnVpbGRlcjogJ0Bhbmd1bGFyLWRldmtpdC9idWlsZC1hbmd1bGFyOnRzbGludCcsXG4gICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICB0c0NvbmZpZzogW1xuICAgICAgICAgICAgYCR7cHJvamVjdFJvb3R9L3RzY29uZmlnLmxpYi5qc29uYCxcbiAgICAgICAgICAgIGAke3Byb2plY3RSb290fS90c2NvbmZpZy5zcGVjLmpzb25gLFxuICAgICAgICAgIF0sXG4gICAgICAgICAgZXhjbHVkZTogW1xuICAgICAgICAgICAgJyoqL25vZGVfbW9kdWxlcy8qKicsXG4gICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfTtcblxuICByZXR1cm4gYWRkUHJvamVjdFRvV29ya3NwYWNlKHdvcmtzcGFjZSwgcGFja2FnZU5hbWUsIHByb2plY3QpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiAob3B0aW9uczogTGlicmFyeU9wdGlvbnMpOiBSdWxlIHtcbiAgcmV0dXJuIChob3N0OiBUcmVlLCBjb250ZXh0OiBTY2hlbWF0aWNDb250ZXh0KSA9PiB7XG4gICAgaWYgKCFvcHRpb25zLm5hbWUpIHtcbiAgICAgIHRocm93IG5ldyBTY2hlbWF0aWNzRXhjZXB0aW9uKGBJbnZhbGlkIG9wdGlvbnMsIFwibmFtZVwiIGlzIHJlcXVpcmVkLmApO1xuICAgIH1cbiAgICBjb25zdCBwcmVmaXggPSBvcHRpb25zLnByZWZpeCB8fCAnbGliJztcblxuICAgIHZhbGlkYXRlUHJvamVjdE5hbWUob3B0aW9ucy5uYW1lKTtcblxuICAgIC8vIElmIHNjb3BlZCBwcm9qZWN0IChpLmUuIFwiQGZvby9iYXJcIiksIGNvbnZlcnQgcHJvamVjdERpciB0byBcImZvby9iYXJcIi5cbiAgICBjb25zdCBwYWNrYWdlTmFtZSA9IG9wdGlvbnMubmFtZTtcbiAgICBsZXQgc2NvcGVOYW1lID0gbnVsbDtcbiAgICBpZiAoL15ALipcXC8uKi8udGVzdChvcHRpb25zLm5hbWUpKSB7XG4gICAgICBjb25zdCBbc2NvcGUsIG5hbWVdID0gb3B0aW9ucy5uYW1lLnNwbGl0KCcvJyk7XG4gICAgICBzY29wZU5hbWUgPSBzY29wZS5yZXBsYWNlKC9eQC8sICcnKTtcbiAgICAgIG9wdGlvbnMubmFtZSA9IG5hbWU7XG4gICAgfVxuXG4gICAgY29uc3Qgd29ya3NwYWNlID0gZ2V0V29ya3NwYWNlKGhvc3QpO1xuICAgIGNvbnN0IG5ld1Byb2plY3RSb290ID0gd29ya3NwYWNlLm5ld1Byb2plY3RSb290O1xuXG4gICAgY29uc3Qgc2NvcGVGb2xkZXIgPSBzY29wZU5hbWUgPyBzdHJpbmdzLmRhc2hlcml6ZShzY29wZU5hbWUpICsgJy8nIDogJyc7XG4gICAgY29uc3QgZm9sZGVyTmFtZSA9IGAke3Njb3BlRm9sZGVyfSR7c3RyaW5ncy5kYXNoZXJpemUob3B0aW9ucy5uYW1lKX1gO1xuICAgIGNvbnN0IHByb2plY3RSb290ID0gYCR7bmV3UHJvamVjdFJvb3R9LyR7Zm9sZGVyTmFtZX1gO1xuICAgIGNvbnN0IGRpc3RSb290ID0gYGRpc3QvJHtmb2xkZXJOYW1lfWA7XG5cbiAgICBjb25zdCBzb3VyY2VEaXIgPSBgJHtwcm9qZWN0Um9vdH0vc3JjL2xpYmA7XG4gICAgY29uc3QgcmVsYXRpdmVQYXRoVG9Xb3Jrc3BhY2VSb290ID0gcHJvamVjdFJvb3Quc3BsaXQoJy8nKS5tYXAoeCA9PiAnLi4nKS5qb2luKCcvJyk7XG5cbiAgICBjb25zdCB0ZW1wbGF0ZVNvdXJjZSA9IGFwcGx5KHVybCgnLi9maWxlcycpLCBbXG4gICAgICB0ZW1wbGF0ZSh7XG4gICAgICAgIC4uLnN0cmluZ3MsXG4gICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIHBhY2thZ2VOYW1lLFxuICAgICAgICBwcm9qZWN0Um9vdCxcbiAgICAgICAgZGlzdFJvb3QsXG4gICAgICAgIHJlbGF0aXZlUGF0aFRvV29ya3NwYWNlUm9vdCxcbiAgICAgICAgcHJlZml4LFxuICAgICAgfSksXG4gICAgICAvLyBUT0RPOiBNb3ZpbmcgaW5zaWRlIGBicmFuY2hBbmRNZXJnZWAgc2hvdWxkIHdvcmsgYnV0IGlzIGJ1Z2dlZCByaWdodCBub3cuXG4gICAgICAvLyBUaGUgX19wcm9qZWN0Um9vdF9fIGlzIGJlaW5nIHVzZWQgbWVhbndoaWxlLlxuICAgICAgLy8gbW92ZShwcm9qZWN0Um9vdCksXG4gICAgXSk7XG5cbiAgICByZXR1cm4gY2hhaW4oW1xuICAgICAgYnJhbmNoQW5kTWVyZ2UobWVyZ2VXaXRoKHRlbXBsYXRlU291cmNlKSksXG4gICAgICBhZGRBcHBUb1dvcmtzcGFjZUZpbGUob3B0aW9ucywgd29ya3NwYWNlLCBwcm9qZWN0Um9vdCwgcGFja2FnZU5hbWUpLFxuICAgICAgb3B0aW9ucy5za2lwUGFja2FnZUpzb24gPyBub29wKCkgOiBhZGREZXBlbmRlbmNpZXNUb1BhY2thZ2VKc29uKCksXG4gICAgICBvcHRpb25zLnNraXBUc0NvbmZpZyA/IG5vb3AoKSA6IHVwZGF0ZVRzQ29uZmlnKHBhY2thZ2VOYW1lLCBkaXN0Um9vdCksXG4gICAgICBzY2hlbWF0aWMoJ21vZHVsZScsIHtcbiAgICAgICAgbmFtZTogb3B0aW9ucy5uYW1lLFxuICAgICAgICBjb21tb25Nb2R1bGU6IGZhbHNlLFxuICAgICAgICBmbGF0OiB0cnVlLFxuICAgICAgICBwYXRoOiBzb3VyY2VEaXIsXG4gICAgICAgIHNwZWM6IGZhbHNlLFxuICAgICAgICBwcm9qZWN0OiBvcHRpb25zLm5hbWUsXG4gICAgICB9KSxcbiAgICAgIHNjaGVtYXRpYygnY29tcG9uZW50Jywge1xuICAgICAgICBuYW1lOiBvcHRpb25zLm5hbWUsXG4gICAgICAgIHNlbGVjdG9yOiBgJHtwcmVmaXh9LSR7b3B0aW9ucy5uYW1lfWAsXG4gICAgICAgIGlubGluZVN0eWxlOiB0cnVlLFxuICAgICAgICBpbmxpbmVUZW1wbGF0ZTogdHJ1ZSxcbiAgICAgICAgZmxhdDogdHJ1ZSxcbiAgICAgICAgcGF0aDogc291cmNlRGlyLFxuICAgICAgICBleHBvcnQ6IHRydWUsXG4gICAgICAgIHByb2plY3Q6IG9wdGlvbnMubmFtZSxcbiAgICAgIH0pLFxuICAgICAgc2NoZW1hdGljKCdzZXJ2aWNlJywge1xuICAgICAgICBuYW1lOiBvcHRpb25zLm5hbWUsXG4gICAgICAgIGZsYXQ6IHRydWUsXG4gICAgICAgIHBhdGg6IHNvdXJjZURpcixcbiAgICAgICAgcHJvamVjdDogb3B0aW9ucy5uYW1lLFxuICAgICAgfSksXG4gICAgICAoX3RyZWU6IFRyZWUsIGNvbnRleHQ6IFNjaGVtYXRpY0NvbnRleHQpID0+IHtcbiAgICAgICAgaWYgKCFvcHRpb25zLnNraXBQYWNrYWdlSnNvbikge1xuICAgICAgICAgIGNvbnRleHQuYWRkVGFzayhuZXcgTm9kZVBhY2thZ2VJbnN0YWxsVGFzaygpKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICBdKTtcbiAgfTtcbn1cbiJdfQ==