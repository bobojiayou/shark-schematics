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
// TODO: use JsonAST
// function appendPropertyInAstObject(
//   recorder: UpdateRecorder,
//   node: JsonAstObject,
//   propertyName: string,
//   value: JsonValue,
//   indent = 4,
// ) {
//   const indentStr = '\n' + new Array(indent + 1).join(' ');
//   if (node.properties.length > 0) {
//     // Insert comma.
//     const last = node.properties[node.properties.length - 1];
//     recorder.insertRight(last.start.offset + last.text.replace(/\s+$/, '').length, ',');
//   }
//   recorder.insertLeft(
//     node.end.offset - 1,
//     '  '
//     + `"${propertyName}": ${JSON.stringify(value, null, 2).replace(/\n/g, indentStr)}`
//     + indentStr.slice(0, -2),
//   );
// }
function addAppToWorkspaceFile(options, workspace) {
    return (host, context) => {
        // TODO: use JsonAST
        // const workspacePath = '/angular.json';
        // const workspaceBuffer = host.read(workspacePath);
        // if (workspaceBuffer === null) {
        //   throw new SchematicsException(`Configuration file (${workspacePath}) not found.`);
        // }
        // const workspaceJson = parseJson(workspaceBuffer.toString());
        // if (workspaceJson.value === null) {
        //   throw new SchematicsException(`Unable to parse configuration file (${workspacePath}).`);
        // }
        let projectRoot = options.projectRoot !== undefined
            ? options.projectRoot
            : `${workspace.newProjectRoot}/${options.name}`;
        if (projectRoot !== '' && !projectRoot.endsWith('/')) {
            projectRoot += '/';
        }
        // tslint:disable-next-line:no-any
        const project = {
            root: projectRoot,
            projectType: 'application',
            architect: {
                e2e: {
                    builder: '@angular-devkit/build-angular:protractor',
                    options: {
                        protractorConfig: `${projectRoot}protractor.conf.js`,
                        devServerTarget: `${options.relatedAppName}:serve`,
                    },
                    configurations: {
                        production: {
                            devServerTarget: `${options.relatedAppName}:serve:production`,
                        },
                    },
                },
                lint: {
                    builder: '@angular-devkit/build-angular:tslint',
                    options: {
                        tsConfig: `${projectRoot}tsconfig.e2e.json`,
                        exclude: [
                            '**/node_modules/**',
                        ],
                    },
                },
            },
        };
        // tslint:disable-next-line:no-any
        // const projects: JsonObject = (<any> workspaceAst.value).projects || {};
        // tslint:disable-next-line:no-any
        // if (!(<any> workspaceAst.value).projects) {
        //   // tslint:disable-next-line:no-any
        //   (<any> workspaceAst.value).projects = projects;
        // }
        // TODO: throw if the project already exist.
        workspace.projects[options.name] = project;
        host.overwrite(config_1.getWorkspacePath(host), JSON.stringify(workspace, null, 2));
    };
}
const projectNameRegexp = /^[a-zA-Z][.0-9a-zA-Z]*(-[.0-9a-zA-Z]*)*$/;
const unsupportedProjectNames = ['test', 'ember', 'ember-cli', 'vendor', 'app'];
function getRegExpFailPosition(str) {
    const parts = str.indexOf('-') >= 0 ? str.split('-') : [str];
    const matched = [];
    parts.forEach(part => {
        if (part.match(projectNameRegexp)) {
            matched.push(part);
        }
    });
    const compare = matched.join('-');
    return (str !== compare) ? compare.length : null;
}
function validateProjectName(projectName) {
    const errorIndex = getRegExpFailPosition(projectName);
    if (errorIndex !== null) {
        const firstMessage = core_1.tags.oneLine `
      Project name "${projectName}" is not valid. New project names must
      start with a letter, and must contain only alphanumeric characters or dashes.
      When adding a dash the segment after the dash must also start with a letter.
    `;
        const msg = core_1.tags.stripIndent `
      ${firstMessage}
      ${projectName}
      ${Array(errorIndex + 1).join(' ') + '^'}
    `;
        throw new schematics_1.SchematicsException(msg);
    }
    else if (unsupportedProjectNames.indexOf(projectName) !== -1) {
        throw new schematics_1.SchematicsException(`Project name "${projectName}" is not a supported name.`);
    }
}
function default_1(options) {
    return (host) => {
        validateProjectName(options.name);
        const workspace = config_1.getWorkspace(host);
        let newProjectRoot = workspace.newProjectRoot;
        let appDir = `${newProjectRoot}/${options.name}`;
        if (options.projectRoot !== undefined) {
            newProjectRoot = options.projectRoot;
            appDir = newProjectRoot;
        }
        return schematics_1.chain([
            addAppToWorkspaceFile(options, workspace),
            schematics_1.mergeWith(schematics_1.apply(schematics_1.url('./files'), [
                schematics_1.template(Object.assign({ utils: core_1.strings }, options, { 'dot': '.', appDir })),
                schematics_1.move(appDir),
            ])),
        ]);
    };
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL2JvYm8vV29yay9naXRodWIvc2hhcmstc2NoZW1hdGljcy9zcmMvIiwic291cmNlcyI6WyJzcmMvZTJlL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7OztHQU1HO0FBQ0gsK0NBQXFEO0FBRXJELDJEQVdvQztBQUNwQyw4Q0FBbUU7QUFLbkUsb0JBQW9CO0FBQ3BCLHNDQUFzQztBQUN0Qyw4QkFBOEI7QUFDOUIseUJBQXlCO0FBQ3pCLDBCQUEwQjtBQUMxQixzQkFBc0I7QUFDdEIsZ0JBQWdCO0FBQ2hCLE1BQU07QUFDTiw4REFBOEQ7QUFFOUQsc0NBQXNDO0FBQ3RDLHVCQUF1QjtBQUN2QixnRUFBZ0U7QUFDaEUsMkZBQTJGO0FBQzNGLE1BQU07QUFFTix5QkFBeUI7QUFDekIsMkJBQTJCO0FBQzNCLFdBQVc7QUFDWCx5RkFBeUY7QUFDekYsZ0NBQWdDO0FBQ2hDLE9BQU87QUFDUCxJQUFJO0FBRUosK0JBQStCLE9BQW1CLEVBQUUsU0FBMEI7SUFDNUUsT0FBTyxDQUFDLElBQVUsRUFBRSxPQUF5QixFQUFFLEVBQUU7UUFDL0Msb0JBQW9CO1FBQ3BCLHlDQUF5QztRQUN6QyxvREFBb0Q7UUFDcEQsa0NBQWtDO1FBQ2xDLHVGQUF1RjtRQUN2RixJQUFJO1FBQ0osK0RBQStEO1FBQy9ELHNDQUFzQztRQUN0Qyw2RkFBNkY7UUFDN0YsSUFBSTtRQUNKLElBQUksV0FBVyxHQUFHLE9BQU8sQ0FBQyxXQUFXLEtBQUssU0FBUztZQUNqRCxDQUFDLENBQUMsT0FBTyxDQUFDLFdBQVc7WUFDckIsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLGNBQWMsSUFBSSxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDbEQsSUFBSSxXQUFXLEtBQUssRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUNwRCxXQUFXLElBQUksR0FBRyxDQUFDO1NBQ3BC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QUMsQ0FBQyxFQUFFO1FBQzlELE1BQU0sSUFBSSxnQ0FBbUIsQ0FBQyxpQkFBaUIsV0FBVyw0QkFBNEIsQ0FBQyxDQUFDO0tBQ3pGO0FBRUgsQ0FBQztBQUVELG1CQUF5QixPQUFtQjtJQUMxQyxPQUFPLENBQUMsSUFBVSxFQUFFLEVBQUU7UUFDcEIsbUJBQW1CLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRWxDLE1BQU0sU0FBUyxHQUFHLHFCQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDckMsSUFBSSxjQUFjLEdBQUcsU0FBUyxDQUFDLGNBQWMsQ0FBQztRQUM5QyxJQUFJLE1BQU0sR0FBRyxHQUFHLGNBQWMsSUFBSSxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7UUFHakQsSUFBSSxPQUFPLENBQUMsV0FBVyxLQUFLLFNBQVMsRUFBRTtZQUNyQyxjQUFjLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQztZQUNyQyxNQUFNLEdBQUcsY0FBYyxDQUFDO1NBQ3pCO1FBRUQsT0FBTyxrQkFBSyxDQUFDO1lBQ1gscUJBQXFCLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQztZQUN6QyxzQkFBUyxDQUNQLGtCQUFLLENBQUMsZ0JBQUcsQ0FBQyxTQUFTLENBQUMsRUFBRTtnQkFDcEIscUJBQVEsaUJBQ04sS0FBSyxFQUFFLGNBQU8sSUFDWCxPQUFPLElBQ1YsS0FBSyxFQUFFLEdBQUcsRUFDVixNQUFNLElBQ047Z0JBQ0YsaUJBQUksQ0FBQyxNQUFNLENBQUM7YUFDYixDQUFDLENBQUM7U0FDTixDQUFDLENBQUM7SUFDTCxDQUFDLENBQUM7QUFDSixDQUFDO0FBNUJELDRCQTRCQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7IHN0cmluZ3MsIHRhZ3MgfSBmcm9tICdAYW5ndWxhci1kZXZraXQvY29yZSc7XG5pbXBvcnQgeyBleHBlcmltZW50YWwgfSBmcm9tICdAYW5ndWxhci1kZXZraXQvY29yZSc7XG5pbXBvcnQge1xuICBSdWxlLFxuICBTY2hlbWF0aWNDb250ZXh0LFxuICBTY2hlbWF0aWNzRXhjZXB0aW9uLFxuICBUcmVlLFxuICBhcHBseSxcbiAgY2hhaW4sXG4gIG1lcmdlV2l0aCxcbiAgbW92ZSxcbiAgdGVtcGxhdGUsXG4gIHVybCxcbn0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L3NjaGVtYXRpY3MnO1xuaW1wb3J0IHsgZ2V0V29ya3NwYWNlLCBnZXRXb3Jrc3BhY2VQYXRoIH0gZnJvbSAnLi4vdXRpbGl0eS9jb25maWcnO1xuaW1wb3J0IHsgU2NoZW1hIGFzIEUyZU9wdGlvbnMgfSBmcm9tICcuL3NjaGVtYSc7XG5cbnR5cGUgV29ya3NwYWNlU2NoZW1hID0gZXhwZXJpbWVudGFsLndvcmtzcGFjZS5Xb3Jrc3BhY2VTY2hlbWE7XG5cbi8vIFRPRE86IHVzZSBKc29uQVNUXG4vLyBmdW5jdGlvbiBhcHBlbmRQcm9wZXJ0eUluQXN0T2JqZWN0KFxuLy8gICByZWNvcmRlcjogVXBkYXRlUmVjb3JkZXIsXG4vLyAgIG5vZGU6IEpzb25Bc3RPYmplY3QsXG4vLyAgIHByb3BlcnR5TmFtZTogc3RyaW5nLFxuLy8gICB2YWx1ZTogSnNvblZhbHVlLFxuLy8gICBpbmRlbnQgPSA0LFxuLy8gKSB7XG4vLyAgIGNvbnN0IGluZGVudFN0ciA9ICdcXG4nICsgbmV3IEFycmF5KGluZGVudCArIDEpLmpvaW4oJyAnKTtcblxuLy8gICBpZiAobm9kZS5wcm9wZXJ0aWVzLmxlbmd0aCA+IDApIHtcbi8vICAgICAvLyBJbnNlcnQgY29tbWEuXG4vLyAgICAgY29uc3QgbGFzdCA9IG5vZGUucHJvcGVydGllc1tub2RlLnByb3BlcnRpZXMubGVuZ3RoIC0gMV07XG4vLyAgICAgcmVjb3JkZXIuaW5zZXJ0UmlnaHQobGFzdC5zdGFydC5vZmZzZXQgKyBsYXN0LnRleHQucmVwbGFjZSgvXFxzKyQvLCAnJykubGVuZ3RoLCAnLCcpO1xuLy8gICB9XG5cbi8vICAgcmVjb3JkZXIuaW5zZXJ0TGVmdChcbi8vICAgICBub2RlLmVuZC5vZmZzZXQgLSAxLFxuLy8gICAgICcgICdcbi8vICAgICArIGBcIiR7cHJvcGVydHlOYW1lfVwiOiAke0pTT04uc3RyaW5naWZ5KHZhbHVlLCBudWxsLCAyKS5yZXBsYWNlKC9cXG4vZywgaW5kZW50U3RyKX1gXG4vLyAgICAgKyBpbmRlbnRTdHIuc2xpY2UoMCwgLTIpLFxuLy8gICApO1xuLy8gfVxuXG5mdW5jdGlvbiBhZGRBcHBUb1dvcmtzcGFjZUZpbGUob3B0aW9uczogRTJlT3B0aW9ucywgd29ya3NwYWNlOiBXb3Jrc3BhY2VTY2hlbWEpOiBSdWxlIHtcbiAgcmV0dXJuIChob3N0OiBUcmVlLCBjb250ZXh0OiBTY2hlbWF0aWNDb250ZXh0KSA9PiB7XG4gICAgLy8gVE9ETzogdXNlIEpzb25BU1RcbiAgICAvLyBjb25zdCB3b3Jrc3BhY2VQYXRoID0gJy9hbmd1bGFyLmpzb24nO1xuICAgIC8vIGNvbnN0IHdvcmtzcGFjZUJ1ZmZlciA9IGhvc3QucmVhZCh3b3Jrc3BhY2VQYXRoKTtcbiAgICAvLyBpZiAod29ya3NwYWNlQnVmZmVyID09PSBudWxsKSB7XG4gICAgLy8gICB0aHJvdyBuZXcgU2NoZW1hdGljc0V4Y2VwdGlvbihgQ29uZmlndXJhdGlvbiBmaWxlICgke3dvcmtzcGFjZVBhdGh9KSBub3QgZm91bmQuYCk7XG4gICAgLy8gfVxuICAgIC8vIGNvbnN0IHdvcmtzcGFjZUpzb24gPSBwYXJzZUpzb24od29ya3NwYWNlQnVmZmVyLnRvU3RyaW5nKCkpO1xuICAgIC8vIGlmICh3b3Jrc3BhY2VKc29uLnZhbHVlID09PSBudWxsKSB7XG4gICAgLy8gICB0aHJvdyBuZXcgU2NoZW1hdGljc0V4Y2VwdGlvbihgVW5hYmxlIHRvIHBhcnNlIGNvbmZpZ3VyYXRpb24gZmlsZSAoJHt3b3Jrc3BhY2VQYXRofSkuYCk7XG4gICAgLy8gfVxuICAgIGxldCBwcm9qZWN0Um9vdCA9IG9wdGlvbnMucHJvamVjdFJvb3QgIT09IHVuZGVmaW5lZFxuICAgICAgPyBvcHRpb25zLnByb2plY3RSb290XG4gICAgICA6IGAke3dvcmtzcGFjZS5uZXdQcm9qZWN0Um9vdH0vJHtvcHRpb25zLm5hbWV9YDtcbiAgICBpZiAocHJvamVjdFJvb3QgIT09ICcnICYmICFwcm9qZWN0Um9vdC5lbmRzV2l0aCgnLycpKSB7XG4gICAgICBwcm9qZWN0Um9vdCArPSAnLyc7XG4gICAgfVxuICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1hbnlcbiAgICBjb25zdCBwcm9qZWN0OiBhbnkgPSB7XG4gICAgICByb290OiBwcm9qZWN0Um9vdCxcbiAgICAgIHByb2plY3RUeXBlOiAnYXBwbGljYXRpb24nLFxuICAgICAgYXJjaGl0ZWN0OiB7XG4gICAgICAgIGUyZToge1xuICAgICAgICAgIGJ1aWxkZXI6ICdAYW5ndWxhci1kZXZraXQvYnVpbGQtYW5ndWxhcjpwcm90cmFjdG9yJyxcbiAgICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgICBwcm90cmFjdG9yQ29uZmlnOiBgJHtwcm9qZWN0Um9vdH1wcm90cmFjdG9yLmNvbmYuanNgLFxuICAgICAgICAgICAgZGV2U2VydmVyVGFyZ2V0OiBgJHtvcHRpb25zLnJlbGF0ZWRBcHBOYW1lfTpzZXJ2ZWAsXG4gICAgICAgICAgfSxcbiAgICAgICAgICBjb25maWd1cmF0aW9uczoge1xuICAgICAgICAgICAgcHJvZHVjdGlvbjoge1xuICAgICAgICAgICAgICBkZXZTZXJ2ZXJUYXJnZXQ6IGAke29wdGlvbnMucmVsYXRlZEFwcE5hbWV9OnNlcnZlOnByb2R1Y3Rpb25gLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICBsaW50OiB7XG4gICAgICAgICAgYnVpbGRlcjogJ0Bhbmd1bGFyLWRldmtpdC9idWlsZC1hbmd1bGFyOnRzbGludCcsXG4gICAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgdHNDb25maWc6IGAke3Byb2plY3RSb290fXRzY29uZmlnLmUyZS5qc29uYCxcbiAgICAgICAgICAgIGV4Y2x1ZGU6IFtcbiAgICAgICAgICAgICAgJyoqL25vZGVfbW9kdWxlcy8qKicsXG4gICAgICAgICAgICBdLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH07XG4gICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWFueVxuICAgIC8vIGNvbnN0IHByb2plY3RzOiBKc29uT2JqZWN0ID0gKDxhbnk+IHdvcmtzcGFjZUFzdC52YWx1ZSkucHJvamVjdHMgfHwge307XG4gICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWFueVxuICAgIC8vIGlmICghKDxhbnk+IHdvcmtzcGFjZUFzdC52YWx1ZSkucHJvamVjdHMpIHtcbiAgICAvLyAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1hbnlcbiAgICAvLyAgICg8YW55PiB3b3Jrc3BhY2VBc3QudmFsdWUpLnByb2plY3RzID0gcHJvamVjdHM7XG4gICAgLy8gfVxuXG4gICAgLy8gVE9ETzogdGhyb3cgaWYgdGhlIHByb2plY3QgYWxyZWFkeSBleGlzdC5cbiAgICB3b3Jrc3BhY2UucHJvamVjdHNbb3B0aW9ucy5uYW1lXSA9IHByb2plY3Q7XG4gICAgaG9zdC5vdmVyd3JpdGUoZ2V0V29ya3NwYWNlUGF0aChob3N0KSwgSlNPTi5zdHJpbmdpZnkod29ya3NwYWNlLCBudWxsLCAyKSk7XG4gIH07XG59XG5jb25zdCBwcm9qZWN0TmFtZVJlZ2V4cCA9IC9eW2EtekEtWl1bLjAtOWEtekEtWl0qKC1bLjAtOWEtekEtWl0qKSokLztcbmNvbnN0IHVuc3VwcG9ydGVkUHJvamVjdE5hbWVzID0gWyd0ZXN0JywgJ2VtYmVyJywgJ2VtYmVyLWNsaScsICd2ZW5kb3InLCAnYXBwJ107XG5cbmZ1bmN0aW9uIGdldFJlZ0V4cEZhaWxQb3NpdGlvbihzdHI6IHN0cmluZyk6IG51bWJlciB8IG51bGwge1xuICBjb25zdCBwYXJ0cyA9IHN0ci5pbmRleE9mKCctJykgPj0gMCA/IHN0ci5zcGxpdCgnLScpIDogW3N0cl07XG4gIGNvbnN0IG1hdGNoZWQ6IHN0cmluZ1tdID0gW107XG5cbiAgcGFydHMuZm9yRWFjaChwYXJ0ID0+IHtcbiAgICBpZiAocGFydC5tYXRjaChwcm9qZWN0TmFtZVJlZ2V4cCkpIHtcbiAgICAgIG1hdGNoZWQucHVzaChwYXJ0KTtcbiAgICB9XG4gIH0pO1xuXG4gIGNvbnN0IGNvbXBhcmUgPSBtYXRjaGVkLmpvaW4oJy0nKTtcblxuICByZXR1cm4gKHN0ciAhPT0gY29tcGFyZSkgPyBjb21wYXJlLmxlbmd0aCA6IG51bGw7XG59XG5cbmZ1bmN0aW9uIHZhbGlkYXRlUHJvamVjdE5hbWUocHJvamVjdE5hbWU6IHN0cmluZykge1xuICBjb25zdCBlcnJvckluZGV4ID0gZ2V0UmVnRXhwRmFpbFBvc2l0aW9uKHByb2plY3ROYW1lKTtcbiAgaWYgKGVycm9ySW5kZXggIT09IG51bGwpIHtcbiAgICBjb25zdCBmaXJzdE1lc3NhZ2UgPSB0YWdzLm9uZUxpbmVgXG4gICAgICBQcm9qZWN0IG5hbWUgXCIke3Byb2plY3ROYW1lfVwiIGlzIG5vdCB2YWxpZC4gTmV3IHByb2plY3QgbmFtZXMgbXVzdFxuICAgICAgc3RhcnQgd2l0aCBhIGxldHRlciwgYW5kIG11c3QgY29udGFpbiBvbmx5IGFscGhhbnVtZXJpYyBjaGFyYWN0ZXJzIG9yIGRhc2hlcy5cbiAgICAgIFdoZW4gYWRkaW5nIGEgZGFzaCB0aGUgc2VnbWVudCBhZnRlciB0aGUgZGFzaCBtdXN0IGFsc28gc3RhcnQgd2l0aCBhIGxldHRlci5cbiAgICBgO1xuICAgIGNvbnN0IG1zZyA9IHRhZ3Muc3RyaXBJbmRlbnRgXG4gICAgICAke2ZpcnN0TWVzc2FnZX1cbiAgICAgICR7cHJvamVjdE5hbWV9XG4gICAgICAke0FycmF5KGVycm9ySW5kZXggKyAxKS5qb2luKCcgJykgKyAnXid9XG4gICAgYDtcbiAgICB0aHJvdyBuZXcgU2NoZW1hdGljc0V4Y2VwdGlvbihtc2cpO1xuICB9IGVsc2UgaWYgKHVuc3VwcG9ydGVkUHJvamVjdE5hbWVzLmluZGV4T2YocHJvamVjdE5hbWUpICE9PSAtMSkge1xuICAgIHRocm93IG5ldyBTY2hlbWF0aWNzRXhjZXB0aW9uKGBQcm9qZWN0IG5hbWUgXCIke3Byb2plY3ROYW1lfVwiIGlzIG5vdCBhIHN1cHBvcnRlZCBuYW1lLmApO1xuICB9XG5cbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gKG9wdGlvbnM6IEUyZU9wdGlvbnMpOiBSdWxlIHtcbiAgcmV0dXJuIChob3N0OiBUcmVlKSA9PiB7XG4gICAgdmFsaWRhdGVQcm9qZWN0TmFtZShvcHRpb25zLm5hbWUpO1xuXG4gICAgY29uc3Qgd29ya3NwYWNlID0gZ2V0V29ya3NwYWNlKGhvc3QpO1xuICAgIGxldCBuZXdQcm9qZWN0Um9vdCA9IHdvcmtzcGFjZS5uZXdQcm9qZWN0Um9vdDtcbiAgICBsZXQgYXBwRGlyID0gYCR7bmV3UHJvamVjdFJvb3R9LyR7b3B0aW9ucy5uYW1lfWA7XG5cblxuICAgIGlmIChvcHRpb25zLnByb2plY3RSb290ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIG5ld1Byb2plY3RSb290ID0gb3B0aW9ucy5wcm9qZWN0Um9vdDtcbiAgICAgIGFwcERpciA9IG5ld1Byb2plY3RSb290O1xuICAgIH1cblxuICAgIHJldHVybiBjaGFpbihbXG4gICAgICBhZGRBcHBUb1dvcmtzcGFjZUZpbGUob3B0aW9ucywgd29ya3NwYWNlKSxcbiAgICAgIG1lcmdlV2l0aChcbiAgICAgICAgYXBwbHkodXJsKCcuL2ZpbGVzJyksIFtcbiAgICAgICAgICB0ZW1wbGF0ZSh7XG4gICAgICAgICAgICB1dGlsczogc3RyaW5ncyxcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgICAgICAnZG90JzogJy4nLFxuICAgICAgICAgICAgYXBwRGlyLFxuICAgICAgICAgIH0pLFxuICAgICAgICAgIG1vdmUoYXBwRGlyKSxcbiAgICAgICAgXSkpLFxuICAgIF0pO1xuICB9O1xufVxuIl19