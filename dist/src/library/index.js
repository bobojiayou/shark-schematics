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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL2JvYm8vV29yay9naXRodWIvc2hhcmstc2NoZW1hdGljcy9zcmMvIiwic291cmNlcyI6WyJzcmMvbGlicmFyeS9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7R0FNRztBQUNILCtDQUErQztBQUMvQywyREFhb0M7QUFDcEMsNERBQTBFO0FBQzFFLDhDQUsyQjtBQUMzQixnRUFBNEQ7QUFDNUQsc0RBQTREO0FBNkI1RCx3QkFBMkIsSUFBVSxFQUFFLElBQVksRUFBRSxRQUF5QjtJQUM1RSxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQy9CLElBQUksTUFBTSxFQUFFO1FBQ1YsTUFBTSxVQUFVLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM1QyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3BDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNmLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ3JEO0lBRUQsT0FBTyxJQUFJLENBQUM7QUFDZCxDQUFDO0FBRUQsd0JBQXdCLFdBQW1CLEVBQUUsUUFBZ0I7SUFFM0QsT0FBTyxDQUFDLElBQVUsRUFBRSxFQUFFO1FBQ3BCLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxFQUFFO1lBQUUsT0FBTyxJQUFJLENBQUM7U0FBRTtRQUVuRCxPQUFPLGNBQWMsQ0FBQyxJQUFJLEVBQUUsZUFBZSxFQUFFLENBQUMsUUFBNkIsRUFBRSxFQUFFO1lBQzdFLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLEtBQUssRUFBRTtnQkFDbkMsUUFBUSxDQUFDLGVBQWUs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QUNGLENBQUMsQ0FBQztJQUNMLENBQUMsQ0FBQztBQUNKLENBQUM7QUFoRkQsNEJBZ0ZDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHsgc3RyaW5ncyB9IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9jb3JlJztcbmltcG9ydCB7XG4gIFJ1bGUsXG4gIFNjaGVtYXRpY0NvbnRleHQsXG4gIFNjaGVtYXRpY3NFeGNlcHRpb24sXG4gIFRyZWUsXG4gIGFwcGx5LFxuICBicmFuY2hBbmRNZXJnZSxcbiAgY2hhaW4sXG4gIG1lcmdlV2l0aCxcbiAgbm9vcCxcbiAgc2NoZW1hdGljLFxuICB0ZW1wbGF0ZSxcbiAgdXJsLFxufSBmcm9tICdAYW5ndWxhci1kZXZraXQvc2NoZW1hdGljcyc7XG5pbXBvcnQgeyBOb2RlUGFja2FnZUluc3RhbGxUYXNrIH0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L3NjaGVtYXRpY3MvdGFza3MnO1xuaW1wb3J0IHtcbiAgV29ya3NwYWNlUHJvamVjdCxcbiAgV29ya3NwYWNlU2NoZW1hLFxuICBhZGRQcm9qZWN0VG9Xb3Jrc3BhY2UsXG4gIGdldFdvcmtzcGFjZSxcbn0gZnJvbSAnLi4vdXRpbGl0eS9jb25maWcnO1xuaW1wb3J0IHsgbGF0ZXN0VmVyc2lvbnMgfSBmcm9tICcuLi91dGlsaXR5L2xhdGVzdC12ZXJzaW9ucyc7XG5pbXBvcnQgeyB2YWxpZGF0ZVByb2plY3ROYW1lIH0gZnJvbSAnLi4vdXRpbGl0eS92YWxpZGF0aW9uJztcbmltcG9ydCB7IFNjaGVtYSBhcyBMaWJyYXJ5T3B0aW9ucyB9IGZyb20gJy4vc2NoZW1hJztcblxuXG50eXBlIFBhY2thZ2VKc29uUGFydGlhbFR5cGUgPSB7XG4gIHNjcmlwdHM6IHtcbiAgICBba2V5OiBzdHJpbmddOiBzdHJpbmc7XG4gIH0sXG4gIGRlcGVuZGVuY2llczoge1xuICAgIFtrZXk6IHN0cmluZ106IHN0cmluZztcbiAgfSxcbiAgZGV2RGVwZW5kZW5jaWVzOiB7XG4gICAgW2tleTogc3RyaW5nXTogc3RyaW5nO1xuICB9LFxufTtcblxuaW50ZXJmYWNlIFVwZGF0ZUpzb25GbjxUPiB7XG4gIChvYmo6IFQpOiBUIHwgdm9pZDtcbn1cblxudHlwZSBUc0NvbmZpZ1BhcnRpYWxUeXBlID0ge1xuICBjb21waWxlck9wdGlvbnM6IHtcbiAgICBiYXNlVXJsOiBzdHJpbmcsXG4gICAgcGF0aHM6IHtcbiAgICAgIFtrZXk6IHN0cmluZ106IHN0cmluZ1tdO1xuICAgIH0sXG4gIH0sXG59O1xuXG5mdW5jdGlvbiB1cGRhdGVKc29uRmlsZTxUPihob3N0OiBUcmVlLCBwYXRoOiBzdHJpbmcsIGNhbGxiYWNrOiBVcGRhdGVKc29uRm48VD4pOiBUcmVlIHtcbiAgY29uc3Qgc291cmNlID0gaG9zdC5yZWFkKHBhdGgpO1xuICBpZiAoc291cmNlKSB7XG4gICAgY29uc3Qgc291cmNlVGV4dCA9IHNvdXJjZS50b1N0cmluZygndXRmLTgnKTtcbiAgICBjb25zdCBqc29uID0gSlNPTi5wYXJzZShzb3VyY2VUZXh0KTtcbiAgICBjYWxsYmFjayhqc29uKTtcbiAgICBob3N0Lm92ZXJ3cml0ZShwYXRoLCBKU09OLnN0cmluZ2lmeShqc29uLCBudWxsLCAyKSk7XG4gIH1cblxuICByZXR1cm4gaG9zdDtcbn1cblxuZnVuY3Rpb24gdXBkYXRlVHNDb25maWcocGFja2FnZU5hbWU6IHN0cmluZywgZGlzdFJvb3Q6IHN0cmluZykge1xuXG4gIHJldHVybiAoaG9zdDogVHJlZSkgPT4ge1xuICAgIGlmICghaG9zdC5leGlzdHMoJ3RzY29uZmlnLmpzb24nKSkgeyByZXR1cm4gaG9zdDsgfVxuXG4gICAgcmV0dXJuIHVwZGF0ZUpzb25GaWxlKGhvc3QsICd0c2NvbmZpZy5qc29uJywgKHRzY29uZmlnOiBUc0NvbmZpZ1BhcnRpYWxUeXBlKSA9PiB7XG4gICAgICBpZiAoIXRzY29uZmlnLmNvbXBpbGVyT3B0aW9ucy5wYXRocykge1xuICAgICAgICB0c2NvbmZpZy5jb21waWxlck9wdGlvbnMucGF0aHMgPSB7fTtcbiAgICAgIH1cbiAgICAgIGlmICghdHNjb25maWcuY29tcGlsZXJPcHRpb25zLnBhdGhzW3BhY2thZ2VOYW1lXSkge1xuICAgICAgICB0c2NvbmZpZy5jb21waWxlck9wdGlvbnMucGF0aHNbcGFja2FnZU5hbWVdID0gW107XG4gICAgICB9XG4gICAgICB0c2NvbmZpZy5jb21waWxlck9wdGlvbnMucGF0aHNbcGFja2FnZU5hbWVdLnB1c2goZGlzdFJvb3QpO1xuXG4gICAgICAvLyBkZWVwIGltcG9ydCAmIHNlY29uZGFyeSBlbnRyeXBvaW50IHN1cHBvcnRcbiAgICAgIGNvbnN0IGRlZXBQYWNrYWdlUGF0aCA9IHBhY2thZ2VOYW1lICsgJy8qJztcbiAgICAgIGlmICghdHNjb25maWcuY29tcGlsZXJPcHRpb25zLnBhdGhzW2RlZXBQYWNrYWdlUGF0aF0pIHtcbiAgICAgICAgdHNjb25maWcuY29tcGlsZXJPcHRpb25zLnBhdGhzW2RlZXBQYWNrYWdlUGF0aF0gPSBbXTtcbiAgICAgIH1cbiAgICAgIHRzY29uZmlnLmNvbXBpbGVyT3B0aW9ucy5wYXRoc1tkZWVwUGFja2FnZVBhdGhdLnB1c2goZGlzdFJvb3QgKyAnLyonKTtcbiAgICB9KTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gYWRkRGVwZW5kZW5jaWVzVG9QYWNrYWdlSnNvbigpIHtcblxuICByZXR1cm4gKGhvc3Q6IFRyZWUpID0+IHtcbiAgICBpZiAoIWhvc3QuZXhpc3RzKCdwYWNrYWdlLmpzb24nKSkgeyByZXR1cm4gaG9zdDsgfVxuXG4gICAgcmV0dXJuIHVwZGF0ZUpzb25GaWxlKGhvc3QsICdwYWNrYWdlLmpzb24nLCAoanNvbjogUGFja2FnZUpzb25QYXJ0aWFsVHlwZSkgPT4ge1xuXG5cbiAgICAgIGlmICghanNvblsnZGVwZW5kZW5jaWVzJ10pIHtcbiAgICAgICAganNvblsnZGVwZW5kZW5jaWVzJ10gPSB7fTtcbiAgICAgIH1cblxuICAgICAganNvbi5kZXBlbmRlbmNpZXMgPSB7XG4gICAgICAgICdAYW5ndWxhci9jb21tb24nOiBsYXRlc3RWZXJzaW9ucy5Bbmd1bGFyLFxuICAgICAgICAnQGFuZ3VsYXIvY29yZSc6IGxhdGVzdFZlcnNpb25zLkFuZ3VsYXIsXG4gICAgICAgICdAYW5ndWxhci9jb21waWxlcic6IGxhdGVzdFZlcnNpb25zLkFuZ3VsYXIsXG4gICAgICAgIC8vIERlLXN0cnVjdHVyZSBsYXN0IGtlZXBzIGV4aXN0aW5nIHVzZXIgZGVwZW5kZW5jaWVzLlxuICAgICAgICAuLi5qc29uLmRlcGVuZGVuY2llcyxcbiAgICAgIH07XG5cbiAgICAgIGlmICghanNvblsnZGV2RGVwZW5kZW5jaWVzJ10pIHtcbiAgICAgICAganNvblsnZGV2RGVwZW5kZW5jaWVzJ10gPSB7fTtcbiAgICAgIH1cblxuICAgICAganNvbi5kZXZEZXBlbmRlbmNpZXMgPSB7XG4gICAgICAgICdAYW5ndWxhci9jb21waWxlci1jbGknOiBsYXRlc3RWZXJzaW9ucy5Bbmd1bGFyLFxuICAgICAgICAnQGFuZ3VsYXItZGV2a2l0L2J1aWxkLW5nLXBhY2thZ3InOiBsYXRlc3RWZXJzaW9ucy5EZXZraXRCdWlsZE5nUGFja2FncixcbiAgICAgICAgJ0Bhbmd1bGFyLWRldmtpdC9idWlsZC1hbmd1bGFyJzogbGF0ZXN0VmVyc2lvbnMuRGV2a2l0QnVpbGROZ1BhY2thZ3IsXG4gICAgICAgICduZy1wYWNrYWdyJzogJ14zLjAuMCcsXG4gICAgICAgICd0c2lja2xlJzogJz49MC4yOS4wJyxcbiAgICAgICAgJ3RzbGliJzogJ14xLjkuMCcsXG4gICAgICAgICd0eXBlc2NyaXB0JzogbGF0ZXN0VmVyc2lvbnMuVHlwZVNjcmlwdCxcbiAgICAgICAgLy8gRGUtc3RydWN0dXJlIGxhc3Qga2VlcHMgZXhpc3RpbmcgdXNlciBkZXBlbmRlbmNpZXMuXG4gICAgICAgIC4uLmpzb24uZGV2RGVwZW5kZW5jaWVzLFxuICAgICAgfTtcbiAgICB9KTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gYWRkQXBwVG9Xb3Jrc3BhY2VGaWxlKG9wdGlvbnM6IExpYnJhcnlPcHRpb25zLCB3b3Jrc3BhY2U6IFdvcmtzcGFjZVNjaGVtYSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0Um9vdDogc3RyaW5nLCBwYWNrYWdlTmFtZTogc3RyaW5nKTogUnVsZSB7XG5cbiAgY29uc3QgcHJvamVjdDogV29ya3NwYWNlUHJvamVjdCA9IHtcbiAgICByb290OiBgJHtwcm9qZWN0Um9vdH1gLFxuICAgIHNvdXJjZVJvb3Q6IGAke3Byb2plY3RSb290fS9zcmNgLFxuICAgIHByb2plY3RUeXBlOiAnbGlicmFyeScsXG4gICAgcHJlZml4OiBvcHRpb25zLnByZWZpeCB8fCAnbGliJyxcbiAgICBhcmNoaXRlY3Q6IHtcbiAgICAgIGJ1aWxkOiB7XG4gICAgICAgIGJ1aWxkZXI6ICdAYW5ndWxhci1kZXZraXQvYnVpbGQtbmctcGFja2FncjpidWlsZCcsXG4gICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICB0c0NvbmZpZzogYCR7cHJvamVjdFJvb3R9L3RzY29uZmlnLmxpYi5qc29uYCxcbiAgICAgICAgICBwcm9qZWN0OiBgJHtwcm9qZWN0Um9vdH0vbmctcGFja2FnZS5qc29uYCxcbiAgICAgICAgfSxcbiAgICAgICAgY29uZmlndXJhdGlvbnM6IHtcbiAgICAgICAgICBwcm9kdWN0aW9uOiB7XG4gICAgICAgICAgICBwcm9qZWN0OiBgJHtwcm9qZWN0Um9vdH0vbmctcGFja2FnZS5wcm9kLmpzb25gLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgdGVzdDoge1xuICAgICAgICBidWlsZGVyOiAnQGFuZ3VsYXItZGV2a2l0L2J1aWxkLWFuZ3VsYXI6a2FybWEnLFxuICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgbWFpbjogYCR7cHJvamVjdFJvb3R9L3NyYy90ZXN0LnRzYCxcbiAgICAgICAgICB0c0NvbmZpZzogYCR7cHJvamVjdFJvb3R9L3RzY29uZmlnLnNwZWMuanNvbmAsXG4gICAgICAgICAga2FybWFDb25maWc6IGAke3Byb2plY3RSb290fS9rYXJtYS5jb25mLmpzYCxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBsaW50OiB7XG4gICAgICAgIGJ1aWxkZXI6ICdAYW5ndWxhci1kZXZraXQvYnVpbGQtYW5ndWxhcjp0c2xpbnQnLFxuICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgdHNDb25maWc6IFtcbiAgICAgICAgICAgIGAke3Byb2plY3RSb290fS90c2NvbmZpZy5saWIuanNvbmAsXG4gICAgICAgICAgICBgJHtwcm9qZWN0Um9vdH0vdHNjb25maWcuc3BlYy5qc29uYCxcbiAgICAgICAgICBdLFxuICAgICAgICAgIGV4Y2x1ZGU6IFtcbiAgICAgICAgICAgICcqKi9ub2RlX21vZHVsZXMvKionLFxuICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gIH07XG5cbiAgcmV0dXJuIGFkZFByb2plY3RUb1dvcmtzcGFjZSh3b3Jrc3BhY2UsIHBhY2thZ2VOYW1lLCBwcm9qZWN0KTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gKG9wdGlvbnM6IExpYnJhcnlPcHRpb25zKTogUnVsZSB7XG4gIHJldHVybiAoaG9zdDogVHJlZSwgY29udGV4dDogU2NoZW1hdGljQ29udGV4dCkgPT4ge1xuICAgIGlmICghb3B0aW9ucy5uYW1lKSB7XG4gICAgICB0aHJvdyBuZXcgU2NoZW1hdGljc0V4Y2VwdGlvbihgSW52YWxpZCBvcHRpb25zLCBcIm5hbWVcIiBpcyByZXF1aXJlZC5gKTtcbiAgICB9XG4gICAgY29uc3QgcHJlZml4ID0gb3B0aW9ucy5wcmVmaXggfHwgJ2xpYic7XG5cbiAgICB2YWxpZGF0ZVByb2plY3ROYW1lKG9wdGlvbnMubmFtZSk7XG5cbiAgICAvLyBJZiBzY29wZWQgcHJvamVjdCAoaS5lLiBcIkBmb28vYmFyXCIpLCBjb252ZXJ0IHByb2plY3REaXIgdG8gXCJmb28vYmFyXCIuXG4gICAgY29uc3QgcGFja2FnZU5hbWUgPSBvcHRpb25zLm5hbWU7XG4gICAgbGV0IHNjb3BlTmFtZSA9IG51bGw7XG4gICAgaWYgKC9eQC4qXFwvLiovLnRlc3Qob3B0aW9ucy5uYW1lKSkge1xuICAgICAgY29uc3QgW3Njb3BlLCBuYW1lXSA9IG9wdGlvbnMubmFtZS5zcGxpdCgnLycpO1xuICAgICAgc2NvcGVOYW1lID0gc2NvcGUucmVwbGFjZSgvXkAvLCAnJyk7XG4gICAgICBvcHRpb25zLm5hbWUgPSBuYW1lO1xuICAgIH1cblxuICAgIGNvbnN0IHdvcmtzcGFjZSA9IGdldFdvcmtzcGFjZShob3N0KTtcbiAgICBjb25zdCBuZXdQcm9qZWN0Um9vdCA9IHdvcmtzcGFjZS5uZXdQcm9qZWN0Um9vdDtcblxuICAgIGNvbnN0IHNjb3BlRm9sZGVyID0gc2NvcGVOYW1lID8gc3RyaW5ncy5kYXNoZXJpemUoc2NvcGVOYW1lKSArICcvJyA6ICcnO1xuICAgIGNvbnN0IGZvbGRlck5hbWUgPSBgJHtzY29wZUZvbGRlcn0ke3N0cmluZ3MuZGFzaGVyaXplKG9wdGlvbnMubmFtZSl9YDtcbiAgICBjb25zdCBwcm9qZWN0Um9vdCA9IGAke25ld1Byb2plY3RSb290fS8ke2ZvbGRlck5hbWV9YDtcbiAgICBjb25zdCBkaXN0Um9vdCA9IGBkaXN0LyR7Zm9sZGVyTmFtZX1gO1xuXG4gICAgY29uc3Qgc291cmNlRGlyID0gYCR7cHJvamVjdFJvb3R9L3NyYy9saWJgO1xuICAgIGNvbnN0IHJlbGF0aXZlUGF0aFRvV29ya3NwYWNlUm9vdCA9IHByb2plY3RSb290LnNwbGl0KCcvJykubWFwKHggPT4gJy4uJykuam9pbignLycpO1xuXG4gICAgY29uc3QgdGVtcGxhdGVTb3VyY2UgPSBhcHBseSh1cmwoJy4vZmlsZXMnKSwgW1xuICAgICAgdGVtcGxhdGUoe1xuICAgICAgICAuLi5zdHJpbmdzLFxuICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICBwYWNrYWdlTmFtZSxcbiAgICAgICAgcHJvamVjdFJvb3QsXG4gICAgICAgIGRpc3RSb290LFxuICAgICAgICByZWxhdGl2ZVBhdGhUb1dvcmtzcGFjZVJvb3QsXG4gICAgICAgIHByZWZpeCxcbiAgICAgIH0pLFxuICAgICAgLy8gVE9ETzogTW92aW5nIGluc2lkZSBgYnJhbmNoQW5kTWVyZ2VgIHNob3VsZCB3b3JrIGJ1dCBpcyBidWdnZWQgcmlnaHQgbm93LlxuICAgICAgLy8gVGhlIF9fcHJvamVjdFJvb3RfXyBpcyBiZWluZyB1c2VkIG1lYW53aGlsZS5cbiAgICAgIC8vIG1vdmUocHJvamVjdFJvb3QpLFxuICAgIF0pO1xuXG4gICAgcmV0dXJuIGNoYWluKFtcbiAgICAgIGJyYW5jaEFuZE1lcmdlKG1lcmdlV2l0aCh0ZW1wbGF0ZVNvdXJjZSkpLFxuICAgICAgYWRkQXBwVG9Xb3Jrc3BhY2VGaWxlKG9wdGlvbnMsIHdvcmtzcGFjZSwgcHJvamVjdFJvb3QsIHBhY2thZ2VOYW1lKSxcbiAgICAgIG9wdGlvbnMuc2tpcFBhY2thZ2VKc29uID8gbm9vcCgpIDogYWRkRGVwZW5kZW5jaWVzVG9QYWNrYWdlSnNvbigpLFxuICAgICAgb3B0aW9ucy5za2lwVHNDb25maWcgPyBub29wKCkgOiB1cGRhdGVUc0NvbmZpZyhwYWNrYWdlTmFtZSwgZGlzdFJvb3QpLFxuICAgICAgc2NoZW1hdGljKCdtb2R1bGUnLCB7XG4gICAgICAgIG5hbWU6IG9wdGlvbnMubmFtZSxcbiAgICAgICAgY29tbW9uTW9kdWxlOiBmYWxzZSxcbiAgICAgICAgZmxhdDogdHJ1ZSxcbiAgICAgICAgcGF0aDogc291cmNlRGlyLFxuICAgICAgICBzcGVjOiBmYWxzZSxcbiAgICAgICAgcHJvamVjdDogb3B0aW9ucy5uYW1lLFxuICAgICAgfSksXG4gICAgICBzY2hlbWF0aWMoJ2NvbXBvbmVudCcsIHtcbiAgICAgICAgbmFtZTogb3B0aW9ucy5uYW1lLFxuICAgICAgICBzZWxlY3RvcjogYCR7cHJlZml4fS0ke29wdGlvbnMubmFtZX1gLFxuICAgICAgICBpbmxpbmVTdHlsZTogdHJ1ZSxcbiAgICAgICAgaW5saW5lVGVtcGxhdGU6IHRydWUsXG4gICAgICAgIGZsYXQ6IHRydWUsXG4gICAgICAgIHBhdGg6IHNvdXJjZURpcixcbiAgICAgICAgZXhwb3J0OiB0cnVlLFxuICAgICAgICBwcm9qZWN0OiBvcHRpb25zLm5hbWUsXG4gICAgICB9KSxcbiAgICAgIHNjaGVtYXRpYygnc2VydmljZScsIHtcbiAgICAgICAgbmFtZTogb3B0aW9ucy5uYW1lLFxuICAgICAgICBmbGF0OiB0cnVlLFxuICAgICAgICBwYXRoOiBzb3VyY2VEaXIsXG4gICAgICAgIHByb2plY3Q6IG9wdGlvbnMubmFtZSxcbiAgICAgIH0pLFxuICAgICAgKF90cmVlOiBUcmVlLCBjb250ZXh0OiBTY2hlbWF0aWNDb250ZXh0KSA9PiB7XG4gICAgICAgIGlmICghb3B0aW9ucy5za2lwUGFja2FnZUpzb24pIHtcbiAgICAgICAgICBjb250ZXh0LmFkZFRhc2sobmV3IE5vZGVQYWNrYWdlSW5zdGFsbFRhc2soKSk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgXSk7XG4gIH07XG59XG4iXX0=