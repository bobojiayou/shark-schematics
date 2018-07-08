"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schematics_1 = require("@angular-devkit/schematics");
function getWorkspacePath(host) {
    const possibleFiles = ['/shark-generate-conf.json', '/.shark-generate-conf.json'];
    const path = possibleFiles.filter(path => host.exists(path))[0];
    return path;
}
exports.getWorkspacePath = getWorkspacePath;
function getWorkspace(host) {
    const path = getWorkspacePath(host);
    const configBuffer = host.read(path);
    if (configBuffer === null) {
        throw new schematics_1.SchematicsException(`Could not find (${path})`);
    }
    const config = configBuffer.toString();
    return JSON.parse(config);
}
exports.getWorkspace = getWorkspace;
function addProjectToWorkspace(workspace, name, project) {
    return (host, context) => {
        if (workspace.projects[name]) {
            throw new Error(`Project '${name}' already exists in workspace.`);
        }
        // Add project to workspace.
        workspace.projects[name] = project;
        if (!workspace.defaultProject && Object.keys(workspace.projects).length === 1) {
            // Make the new project the default one.
            workspace.defaultProject = name;
        }
        host.overwrite(getWorkspacePath(host), JSON.stringify(workspace, null, 2));
    };
}
exports.addProjectToWorkspace = addProjectToWorkspace;
exports.configPath = '/.shark-generate-conf.json';
function getConfig(host) {
    const configBuffer = host.read(exports.configPath);
    if (configBuffer === null) {
        throw new schematics_1.SchematicsException('Could not find .shark-generate-conf.json');
    }
    const config = JSON.parse(configBuffer.toString());
    return config;
}
exports.getConfig = getConfig;
function getAppFromConfig(config, appIndexOrName) {
    if (!config.apps) {
        return null;
    }
    if (parseInt(appIndexOrName) >= 0) {
        return config.apps[parseInt(appIndexOrName)];
    }
    return config.apps.filter((app) => app.name === appIndexOrName)[0];
}
exports.getAppFromConfig = getAppFromConfig;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6Ii9Vc2Vycy9ib2JvL1dvcmsvZ2l0aHViL3NoYXJrLXNjaGVtYXRpY3Mvc3JjLyIsInNvdXJjZXMiOlsic3JjL3V0aWxpdHkvY29uZmlnLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBUUEsMkRBQStGO0FBNGQvRiwwQkFBaUMsSUFBVTtJQUN2QyxNQUFNLGFBQWEsR0FBRyxDQUFDLDJCQUEyQixFQUFFLDRCQUE0QixDQUFDLENBQUM7SUFDbEYsTUFBTSxJQUFJLEdBQUcsYUFBYSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUVoRSxPQUFPLElBQUksQ0FBQztBQUNoQixDQUFDO0FBTEQsNENBS0M7QUFFRCxzQkFBNkIsSUFBVTtJQUNuQyxNQUFNLElBQUksR0FBRyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNwQyxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3JDLElBQUksWUFBWSxLQUFLLElBQUksRUFBRTtRQUN2QixNQUFNLElBQUksZ0NBQW1CLENBQUMsbUJBQW1CLElBQUksR0FBRyxDQUFDLENBQUM7S0FDN0Q7SUFDRCxNQUFNLE1BQU0sR0FBRyxZQUFZLENBQUMsUUFBUSxFQUFFLENBQUM7SUFFdkMsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzlCLENBQUM7QUFURCxvQ0FTQztBQUVELCtCQUNJLFNBQTBCLEVBQzFCLElBQVksRUFDWixPQUF5QjtJQUV6QixPQUFPLENBQUMsSUFBVSxFQUFFLE9BQXlCLEVBQUUsRUFBRTtRQUU3QyxJQUFJLFNBQVMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDMUIsTUFBTSxJQUFJLEtBQUssQ0FBQyxZQUFZLElBQUksZ0NBQWdDLENBQUMsQ0FBQztTQUNyRTtRQUVELDRCQUE0QjtRQUM1QixTQUFTLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLE9BQU8sQ0FBQztRQUVuQyxJQUFJLENBQUMsU0FBUyxDQUFDLGNBQWMsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQzNFLHdDQUF3QztZQUN4QyxTQUFTLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQztTQUNuQztRQUVELElBQUksQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDL0UsQ0FBQyxDQUFDO0FBQ04sQ0FBQztBQXJCRCxzREFxQkM7QUFFWSxRQUFBLFVBQVUsR0FBRyw0QkFBNEIsQ0FBQztBQUV2RCxtQkFBMEIsSUFBVTtJQUNoQyxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLGtCQUFVLENBQUMsQ0FBQztJQUMzQyxJQUFJLFlBQVksS0FBSyxJQUFJLEVBQUU7UUFDdkIsTUFBTSxJQUFJLGdDQUFtQixDQUFDLDBDQUEwQyxDQUFDLENBQUM7S0FDN0U7SUFFRCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO0lBRW5ELE9BQU8sTUFBTSxDQUFDO0FBQ2xCLENBQUM7QUFURCw4QkFTQztBQUVELDBCQUFpQyxNQUFpQixFQUFFLGNBQXNCO0lBQ3RFLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFO1FBQ2QsT0FBTyxJQUFJLENBQUM7S0FDZjtJQUVELElBQUksUUFBUSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsRUFBRTtRQUMvQixPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7S0FDaEQ7SUFFRCxPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsSUFBSSxLQUFLLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3ZFLENBQUM7QUFWRCw0Q0FVQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7IGV4cGVyaW1lbnRhbCB9IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9jb3JlJztcbmltcG9ydCB7IFJ1bGUsIFNjaGVtYXRpY0NvbnRleHQsIFNjaGVtYXRpY3NFeGNlcHRpb24sIFRyZWUgfSBmcm9tICdAYW5ndWxhci1kZXZraXQvc2NoZW1hdGljcyc7XG5cblxuLy8gVGhlIGludGVyZmFjZXMgYmVsb3cgYXJlIGdlbmVyYXRlZCBmcm9tIHRoZSBBbmd1bGFyIENMSSBjb25maWd1cmF0aW9uIHNjaGVtYVxuLy8gaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci1jbGkvYmxvYi9tYXN0ZXIvcGFja2FnZXMvQGFuZ3VsYXIvY2xpL2xpYi9jb25maWcvc2NoZW1hLmpzb25cbmV4cG9ydCBpbnRlcmZhY2UgQXBwQ29uZmlnIHtcbiAgICAvKipcbiAgICAgKiBOYW1lIG9mIHRoZSBhcHAuXG4gICAgICovXG4gICAgbmFtZT86IHN0cmluZztcbiAgICAvKipcbiAgICAgKiBEaXJlY3Rvcnkgd2hlcmUgYXBwIGZpbGVzIGFyZSBwbGFjZWQuXG4gICAgICovXG4gICAgYXBwUm9vdD86IHN0cmluZztcbiAgICAvKipcbiAgICAgKiBUaGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhlIGFwcC5cbiAgICAgKi9cbiAgICByb290Pzogc3RyaW5nO1xuICAgIC8qKlxuICAgICAqIFRoZSBvdXRwdXQgZGlyZWN0b3J5IGZvciBidWlsZCByZXN1bHRzLlxuICAgICAqL1xuICAgIG91dERpcj86IHN0cmluZztcbiAgICAvKipcbiAgICAgKiBMaXN0IG9mIGFwcGxpY2F0aW9uIGFzc2V0cy5cbiAgICAgKi9cbiAgICBhc3NldHM/OiAoc3RyaW5nIHwge1xuICAgICAgICAvKipcbiAgICAgICAgICogVGhlIHBhdHRlcm4gdG8gbWF0Y2guXG4gICAgICAgICAqL1xuICAgICAgICBnbG9iPzogc3RyaW5nO1xuICAgICAgICAvKipcbiAgICAgICAgICogVGhlIGRpciB0byBzZWFyY2ggd2l0aGluLlxuICAgICAgICAgKi9cbiAgICAgICAgaW5wdXQ/OiBzdHJpbmc7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGUgb3V0cHV0IHBhdGggKHJlbGF0aXZlIHRvIHRoZSBvdXREaXIpLlxuICAgICAgICAgKi9cbiAgICAgICAgb3V0cHV0Pzogc3RyaW5nO1xuICAgIH0pW107XG4gICAgLyoqXG4gICAgICogVVJMIHdoZXJlIGZpbGVzIHdpbGwgYmUgZGVwbG95ZWQuXG4gICAgICovXG4gICAgZGVwbG95VXJsPzogc3RyaW5nO1xuICAgIC8qKlxuICAgICAqIEJhc2UgdXJsIGZvciB0aGUgYXBwbGljYXRpb24gYmVpbmcgYnVpbHQuXG4gICAgICovXG4gICAgYmFzZUhyZWY/OiBzdHJpbmc7XG4gICAgLyoqXG4gICAgICogVGhlIHJ1bnRpbWUgcGxhdGZvcm0gb2YgdGhlIGFwcC5cbiAgICAgKi9cbiAgICBwbGF0Zm9ybT86ICgnYnJvd3NlcicgfCAnc2VydmVyJyk7XG4gICAgLyoqXG4gICAgICogVGhlIG5hbWUgb2YgdGhlIHN0YXJ0IEhUTUwgZmlsZS5cbiAgICAgKi9cbiAgICBpbmRleD86IHN0cmluZztcbiAgICAvKipcbiAgICAgKiBUaGUgbmFtZSBvZiB0aGUgbWFpbiBlbnRyeS1wb2ludCBmaWxlLlxuICAgICAqL1xuICAgIG1haW4/OiBzdHJpbmc7XG4gICAgLyoqXG4gICAgICogVGhlIG5hbWUgb2YgdGhlIHBvbHlmaWxscyBmaWxlLlxuICAgICAqL1xuICAgIHBvbHlmaWxscz86IHN0cmluZztcbiAgICAvKipcbiAgICAgKiBUaGUgbmFtZSBvZiB0aGUgdGVzdCBlbnRyeS1wb2ludCBmaWxlLlxuICAgICAqL1xuICAgIHRlc3Q/OiBzdHJpbmc7XG4gICAgLyoqXG4gICAgICogVGhlIG5hbWUgb2YgdGhlIFR5cGVTY3JpcHQgY29uZmlndXJhdGlvbiBmaWxlLlxuICAgICAqL1xuICAgIHRzY29uZmlnPzogc3RyaW5nO1xuICAgIC8qKlxuICAgICAqIFRoZSBuYW1lIG9mIHRoZSBUeXBlU2NyaXB0IGNvbmZpZ3VyYXRpb24gZmlsZSBmb3IgdW5pdCB0ZXN0cy5cbiAgICAgKi9cbiAgICB0ZXN0VHNjb25maWc/OiBzdHJpbmc7XG4gICAgLyoqXG4gICAgICogVGhlIHByZWZpeCB0byBhcHBseSB0byBnZW5lcmF0ZWQgc2VsZWN0b3JzLlxuICAgICAqL1xuICAgIHByZWZpeD86IHN0cmluZztcbiAgICAvKipcbiAgICAgKiBFeHBlcmltZW50YWwgc3VwcG9ydCBmb3IgYSBzZXJ2aWNlIHdvcmtlciBmcm9tIEBhbmd1bGFyL3NlcnZpY2Utd29ya2VyLlxuICAgICAqL1xuICAgIHNlcnZpY2VXb3JrZXI/OiBib29sZWFuO1xuICAgIC8qKlxuICAgICAqIEdsb2JhbCBzdHlsZXMgdG8gYmUgaW5jbHVkZWQgaW4gdGhlIGJ1aWxkLlxuICAgICAqL1xuICAgIHN0eWxlcz86IChzdHJpbmcgfCB7XG4gICAgICAgIGlucHV0Pzogc3RyaW5nO1xuICAgICAgICBbbmFtZTogc3RyaW5nXTogYW55OyAvLyB0c2xpbnQ6ZGlzYWJsZS1saW5lOm5vLWFueVxuICAgIH0pW107XG4gICAgLyoqXG4gICAgICogT3B0aW9ucyB0byBwYXNzIHRvIHN0eWxlIHByZXByb2Nlc3NvcnNcbiAgICAgKi9cbiAgICBzdHlsZVByZXByb2Nlc3Nvck9wdGlvbnM/OiB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBQYXRocyB0byBpbmNsdWRlLiBQYXRocyB3aWxsIGJlIHJlc29sdmVkIHRvIHByb2plY3Qgcm9vdC5cbiAgICAgICAgICovXG4gICAgICAgIGluY2x1ZGVQYXRocz86IHN0cmluZ1tdO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogR2xvYmFsIHNjcmlwdHMgdG8gYmUgaW5jbHVkZWQgaW4gdGhlIGJ1aWxkLlxuICAgICAqL1xuICAgIHNjcmlwdHM/OiAoc3RyaW5nIHwge1xuICAgICAgICBpbnB1dDogc3RyaW5nO1xuICAgICAgICBbbmFtZTogc3RyaW5nXTogYW55OyAvLyB0c2xpbnQ6ZGlzYWJsZS1saW5lOm5vLWFueVxuICAgIH0pW107XG4gICAgLyoqXG4gICAgICogU291cmNlIGZpbGUgZm9yIGVudmlyb25tZW50IGNvbmZpZy5cbiAgICAgKi9cbiAgICBlbnZpcm9ubWVudFNvdXJjZT86IHN0cmluZztcbiAgICAvKipcbiAgICAgKiBOYW1lIGFuZCBjb3JyZXNwb25kaW5nIGZpbGUgZm9yIGVudmlyb25tZW50IGNvbmZpZy5cbiAgICAgKi9cbiAgICBlbnZpcm9ubWVudHM/OiB7XG4gICAgICAgIFtuYW1lOiBzdHJpbmddOiBhbnk7IC8vIHRzbGludDpkaXNhYmxlLWxpbmU6bm8tYW55XG4gICAgfTtcbiAgICBhcHBTaGVsbD86IHtcbiAgICAgICAgYXBwOiBzdHJpbmc7XG4gICAgICAgIHJvdXRlOiBzdHJpbmc7XG4gICAgfTtcbiAgICBidWRnZXRzPzoge1xuICAgICAgICAvKipcbiAgICAgICAgICogVGhlIHR5cGUgb2YgYnVkZ2V0XG4gICAgICAgICAqL1xuICAgICAgICB0eXBlPzogKCdidW5kbGUnIHwgJ2luaXRpYWwnIHwgJ2FsbFNjcmlwdCcgfCAnYWxsJyB8ICdhbnlTY3JpcHQnIHwgJ2FueScpO1xuICAgICAgICAvKipcbiAgICAgICAgICogVGhlIG5hbWUgb2YgdGhlIGJ1bmRsZVxuICAgICAgICAgKi9cbiAgICAgICAgbmFtZT86IHN0cmluZztcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRoZSBiYXNlbGluZSBzaXplIGZvciBjb21wYXJpc29uLlxuICAgICAgICAgKi9cbiAgICAgICAgYmFzZWxpbmU/OiBzdHJpbmc7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGUgbWF4aW11bSB0aHJlc2hvbGQgZm9yIHdhcm5pbmcgcmVsYXRpdmUgdG8gdGhlIGJhc2VsaW5lLlxuICAgICAgICAgKi9cbiAgICAgICAgbWF4aW11bVdhcm5pbmc/OiBzdHJpbmc7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGUgbWF4aW11bSB0aHJlc2hvbGQgZm9yIGVycm9yIHJlbGF0aXZlIHRvIHRoZSBiYXNlbGluZS5cbiAgICAgICAgICovXG4gICAgICAgIG1heGltdW1FcnJvcj86IHN0cmluZztcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRoZSBtaW5pbXVtIHRocmVzaG9sZCBmb3Igd2FybmluZyByZWxhdGl2ZSB0byB0aGUgYmFzZWxpbmUuXG4gICAgICAgICAqL1xuICAgICAgICBtaW5pbXVtV2FybmluZz86IHN0cmluZztcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRoZSBtaW5pbXVtIHRocmVzaG9sZCBmb3IgZXJyb3IgcmVsYXRpdmUgdG8gdGhlIGJhc2VsaW5lLlxuICAgICAgICAgKi9cbiAgICAgICAgbWluaW11bUVycm9yPzogc3RyaW5nO1xuICAgICAgICAvKipcbiAgICAgICAgICogVGhlIHRocmVzaG9sZCBmb3Igd2FybmluZyByZWxhdGl2ZSB0byB0aGUgYmFzZWxpbmUgKG1pbiAmIG1heCkuXG4gICAgICAgICAqL1xuICAgICAgICB3YXJuaW5nPzogc3RyaW5nO1xuICAgICAgICAvKipcbiAgICAgICAgICogVGhlIHRocmVzaG9sZCBmb3IgZXJyb3IgcmVsYXRpdmUgdG8gdGhlIGJhc2VsaW5lIChtaW4gJiBtYXgpLlxuICAgICAgICAgKi9cbiAgICAgICAgZXJyb3I/OiBzdHJpbmc7XG4gICAgfVtdO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIENsaUNvbmZpZyB7XG4gICAgJHNjaGVtYT86IHN0cmluZztcbiAgICAvKipcbiAgICAgKiBUaGUgZ2xvYmFsIGNvbmZpZ3VyYXRpb24gb2YgdGhlIHByb2plY3QuXG4gICAgICovXG4gICAgcHJvamVjdD86IHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRoZSBuYW1lIG9mIHRoZSBwcm9qZWN0LlxuICAgICAgICAgKi9cbiAgICAgICAgbmFtZT86IHN0cmluZztcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFdoZXRoZXIgb3Igbm90IHRoaXMgcHJvamVjdCB3YXMgZWplY3RlZC5cbiAgICAgICAgICovXG4gICAgICAgIGVqZWN0ZWQ/OiBib29sZWFuO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUHJvcGVydGllcyBvZiB0aGUgZGlmZmVyZW50IGFwcGxpY2F0aW9ucyBpbiB0aGlzIHByb2plY3QuXG4gICAgICovXG4gICAgYXBwcz86IEFwcENvbmZpZ1tdO1xuICAgIC8qKlxuICAgICAqIENvbmZpZ3VyYXRpb24gZm9yIGVuZC10by1lbmQgdGVzdHMuXG4gICAgICovXG4gICAgZTJlPzoge1xuICAgICAgICBwcm90cmFjdG9yPzoge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBQYXRoIHRvIHRoZSBjb25maWcgZmlsZS5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgY29uZmlnPzogc3RyaW5nO1xuICAgICAgICB9O1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUHJvcGVydGllcyB0byBiZSBwYXNzZWQgdG8gVFNMaW50LlxuICAgICAqL1xuICAgIGxpbnQ/OiB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBGaWxlIGdsb2IocykgdG8gbGludC5cbiAgICAgICAgICovXG4gICAgICAgIGZpbGVzPzogKHN0cmluZyB8IHN0cmluZ1tdKTtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIExvY2F0aW9uIG9mIHRoZSB0c2NvbmZpZy5qc29uIHByb2plY3QgZmlsZS5cbiAgICAgICAgICogV2lsbCBhbHNvIHVzZSBhcyBmaWxlcyB0byBsaW50IGlmICdmaWxlcycgcHJvcGVydHkgbm90IHByZXNlbnQuXG4gICAgICAgICAqL1xuICAgICAgICBwcm9qZWN0OiBzdHJpbmc7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBMb2NhdGlvbiBvZiB0aGUgdHNsaW50Lmpzb24gY29uZmlndXJhdGlvbi5cbiAgICAgICAgICovXG4gICAgICAgIHRzbGludENvbmZpZz86IHN0cmluZztcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEZpbGUgZ2xvYihzKSB0byBpZ25vcmUuXG4gICAgICAgICAqL1xuICAgICAgICBleGNsdWRlPzogKHN0cmluZyB8IHN0cmluZ1tdKTtcbiAgICB9W107XG4gICAgLyoqXG4gICAgICogQ29uZmlndXJhdGlvbiBmb3IgdW5pdCB0ZXN0cy5cbiAgICAgKi9cbiAgICB0ZXN0Pzoge1xuICAgICAgICBrYXJtYT86IHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogUGF0aCB0byB0aGUga2FybWEgY29uZmlnIGZpbGUuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGNvbmZpZz86IHN0cmluZztcbiAgICAgICAgfTtcbiAgICAgICAgY29kZUNvdmVyYWdlPzoge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBHbG9icyB0byBleGNsdWRlIGZyb20gY29kZSBjb3ZlcmFnZS5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgZXhjbHVkZT86IHN0cmluZ1tdO1xuICAgICAgICB9O1xuICAgIH07XG4gICAgLyoqXG4gICAgICogU3BlY2lmeSB0aGUgZGVmYXVsdCB2YWx1ZXMgZm9yIGdlbmVyYXRpbmcuXG4gICAgICovXG4gICAgZGVmYXVsdHM/OiB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGUgZmlsZSBleHRlbnNpb24gdG8gYmUgdXNlZCBmb3Igc3R5bGUgZmlsZXMuXG4gICAgICAgICAqL1xuICAgICAgICBzdHlsZUV4dD86IHN0cmluZztcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEhvdyBvZnRlbiB0byBjaGVjayBmb3IgZmlsZSB1cGRhdGVzLlxuICAgICAgICAgKi9cbiAgICAgICAgcG9sbD86IG51bWJlcjtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFVzZSBsaW50IHRvIGZpeCBmaWxlcyBhZnRlciBnZW5lcmF0aW9uXG4gICAgICAgICAqL1xuICAgICAgICBsaW50Rml4PzogYm9vbGVhbjtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIE9wdGlvbnMgZm9yIGdlbmVyYXRpbmcgYSBjbGFzcy5cbiAgICAgICAgICovXG4gICAgICAgIGNsYXNzPzoge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBTcGVjaWZpZXMgaWYgYSBzcGVjIGZpbGUgaXMgZ2VuZXJhdGVkLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBzcGVjPzogYm9vbGVhbjtcbiAgICAgICAgfTtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIE9wdGlvbnMgZm9yIGdlbmVyYXRpbmcgYSBjb21wb25lbnQuXG4gICAgICAgICAqL1xuICAgICAgICBjb21wb25lbnQ/OiB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEZsYWcgdG8gaW5kaWNhdGUgaWYgYSBkaXIgaXMgY3JlYXRlZC5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgZmxhdD86IGJvb2xlYW47XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIFNwZWNpZmllcyBpZiBhIHNwZWMgZmlsZSBpcyBnZW5lcmF0ZWQuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHNwZWM/OiBib29sZWFuO1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBTcGVjaWZpZXMgaWYgdGhlIHN0eWxlIHdpbGwgYmUgaW4gdGhlIHRzIGZpbGUuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGlubGluZVN0eWxlPzogYm9vbGVhbjtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogU3BlY2lmaWVzIGlmIHRoZSB0ZW1wbGF0ZSB3aWxsIGJlIGluIHRoZSB0cyBmaWxlLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBpbmxpbmVUZW1wbGF0ZT86IGJvb2xlYW47XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIFNwZWNpZmllcyB0aGUgdmlldyBlbmNhcHN1bGF0aW9uIHN0cmF0ZWd5LlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB2aWV3RW5jYXBzdWxhdGlvbj86ICgnRW11bGF0ZWQnIHwgJ05hdGl2ZScgfCAnTm9uZScpO1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBTcGVjaWZpZXMgdGhlIGNoYW5nZSBkZXRlY3Rpb24gc3RyYXRlZ3kuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGNoYW5nZURldGVjdGlvbj86ICgnRGVmYXVsdCcgfCAnT25QdXNoJyk7XG4gICAgICAgIH07XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBPcHRpb25zIGZvciBnZW5lcmF0aW5nIGEgZGlyZWN0aXZlLlxuICAgICAgICAgKi9cbiAgICAgICAgZGlyZWN0aXZlPzoge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBGbGFnIHRvIGluZGljYXRlIGlmIGEgZGlyIGlzIGNyZWF0ZWQuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGZsYXQ/OiBib29sZWFuO1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBTcGVjaWZpZXMgaWYgYSBzcGVjIGZpbGUgaXMgZ2VuZXJhdGVkLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBzcGVjPzogYm9vbGVhbjtcbiAgICAgICAgfTtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIE9wdGlvbnMgZm9yIGdlbmVyYXRpbmcgYSBndWFyZC5cbiAgICAgICAgICovXG4gICAgICAgIGd1YXJkPzoge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBGbGFnIHRvIGluZGljYXRlIGlmIGEgZGlyIGlzIGNyZWF0ZWQuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGZsYXQ/OiBib29sZWFuO1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBTcGVjaWZpZXMgaWYgYSBzcGVjIGZpbGUgaXMgZ2VuZXJhdGVkLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBzcGVjPzogYm9vbGVhbjtcbiAgICAgICAgfTtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIE9wdGlvbnMgZm9yIGdlbmVyYXRpbmcgYW4gaW50ZXJmYWNlLlxuICAgICAgICAgKi9cbiAgICAgICAgaW50ZXJmYWNlPzoge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBQcmVmaXggdG8gYXBwbHkgdG8gaW50ZXJmYWNlIG5hbWVzLiAoaS5lLiBJKVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBwcmVmaXg/OiBzdHJpbmc7XG4gICAgICAgIH07XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBPcHRpb25zIGZvciBnZW5lcmF0aW5nIGEgbW9kdWxlLlxuICAgICAgICAgKi9cbiAgICAgICAgbW9kdWxlPzoge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBGbGFnIHRvIGluZGljYXRlIGlmIGEgZGlyIGlzIGNyZWF0ZWQuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGZsYXQ/OiBib29sZWFuO1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBTcGVjaWZpZXMgaWYgYSBzcGVjIGZpbGUgaXMgZ2VuZXJhdGVkLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBzcGVjPzogYm9vbGVhbjtcbiAgICAgICAgfTtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIE9wdGlvbnMgZm9yIGdlbmVyYXRpbmcgYSBwaXBlLlxuICAgICAgICAgKi9cbiAgICAgICAgcGlwZT86IHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogRmxhZyB0byBpbmRpY2F0ZSBpZiBhIGRpciBpcyBjcmVhdGVkLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBmbGF0PzogYm9vbGVhbjtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogU3BlY2lmaWVzIGlmIGEgc3BlYyBmaWxlIGlzIGdlbmVyYXRlZC5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgc3BlYz86IGJvb2xlYW47XG4gICAgICAgIH07XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBPcHRpb25zIGZvciBnZW5lcmF0aW5nIGEgc2VydmljZS5cbiAgICAgICAgICovXG4gICAgICAgIHNlcnZpY2U/OiB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEZsYWcgdG8gaW5kaWNhdGUgaWYgYSBkaXIgaXMgY3JlYXRlZC5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgZmxhdD86IGJvb2xlYW47XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIFNwZWNpZmllcyBpZiBhIHNwZWMgZmlsZSBpcyBnZW5lcmF0ZWQuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHNwZWM/OiBib29sZWFuO1xuICAgICAgICB9O1xuICAgICAgICAvKipcbiAgICAgICAgICogUHJvcGVydGllcyB0byBiZSBwYXNzZWQgdG8gdGhlIGJ1aWxkIGNvbW1hbmQuXG4gICAgICAgICAqL1xuICAgICAgICBidWlsZD86IHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogT3V0cHV0IHNvdXJjZW1hcHMuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHNvdXJjZW1hcHM/OiBib29sZWFuO1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBCYXNlIHVybCBmb3IgdGhlIGFwcGxpY2F0aW9uIGJlaW5nIGJ1aWx0LlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBiYXNlSHJlZj86IHN0cmluZztcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogVGhlIHNzbCBrZXkgdXNlZCBieSB0aGUgc2VydmVyLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBwcm9ncmVzcz86IGJvb2xlYW47XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEVuYWJsZSBhbmQgZGVmaW5lIHRoZSBmaWxlIHdhdGNoaW5nIHBvbGwgdGltZSBwZXJpb2QgKG1pbGxpc2Vjb25kcykuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHBvbGw/OiBudW1iZXI7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIERlbGV0ZSBvdXRwdXQgcGF0aCBiZWZvcmUgYnVpbGQuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGRlbGV0ZU91dHB1dFBhdGg/OiBib29sZWFuO1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBEbyBub3QgdXNlIHRoZSByZWFsIHBhdGggd2hlbiByZXNvbHZpbmcgbW9kdWxlcy5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgcHJlc2VydmVTeW1saW5rcz86IGJvb2xlYW47XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIFNob3cgY2lyY3VsYXIgZGVwZW5kZW5jeSB3YXJuaW5ncyBvbiBidWlsZHMuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHNob3dDaXJjdWxhckRlcGVuZGVuY2llcz86IGJvb2xlYW47XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIFVzZSBhIHNlcGFyYXRlIGJ1bmRsZSBjb250YWluaW5nIGNvZGUgdXNlZCBhY3Jvc3MgbXVsdGlwbGUgYnVuZGxlcy5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgY29tbW9uQ2h1bms/OiBib29sZWFuO1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBVc2UgZmlsZSBuYW1lIGZvciBsYXp5IGxvYWRlZCBjaHVua3MuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIG5hbWVkQ2h1bmtzPzogYm9vbGVhbjtcbiAgICAgICAgfTtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFByb3BlcnRpZXMgdG8gYmUgcGFzc2VkIHRvIHRoZSBzZXJ2ZSBjb21tYW5kLlxuICAgICAgICAgKi9cbiAgICAgICAgc2VydmU/OiB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIFRoZSBwb3J0IHRoZSBhcHBsaWNhdGlvbiB3aWxsIGJlIHNlcnZlZCBvbi5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgcG9ydD86IG51bWJlcjtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogVGhlIGhvc3QgdGhlIGFwcGxpY2F0aW9uIHdpbGwgYmUgc2VydmVkIG9uLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBob3N0Pzogc3RyaW5nO1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBFbmFibGVzIHNzbCBmb3IgdGhlIGFwcGxpY2F0aW9uLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBzc2w/OiBib29sZWFuO1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBUaGUgc3NsIGtleSB1c2VkIGJ5IHRoZSBzZXJ2ZXIuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHNzbEtleT86IHN0cmluZztcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogVGhlIHNzbCBjZXJ0aWZpY2F0ZSB1c2VkIGJ5IHRoZSBzZXJ2ZXIuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHNzbENlcnQ/OiBzdHJpbmc7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIFByb3h5IGNvbmZpZ3VyYXRpb24gZmlsZS5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgcHJveHlDb25maWc/OiBzdHJpbmc7XG4gICAgICAgIH07XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBQcm9wZXJ0aWVzIGFib3V0IHNjaGVtYXRpY3MuXG4gICAgICAgICAqL1xuICAgICAgICBzY2hlbWF0aWNzPzoge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBUaGUgc2NoZW1hdGljcyBjb2xsZWN0aW9uIHRvIHVzZS5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgY29sbGVjdGlvbj86IHN0cmluZztcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogVGhlIG5ldyBhcHAgc2NoZW1hdGljLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBuZXdBcHA/OiBzdHJpbmc7XG4gICAgICAgIH07XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBTcGVjaWZ5IHdoaWNoIHBhY2thZ2UgbWFuYWdlciB0b29sIHRvIHVzZS5cbiAgICAgKi9cbiAgICBwYWNrYWdlTWFuYWdlcj86ICgnbnBtJyB8ICdjbnBtJyB8ICd5YXJuJyB8ICdkZWZhdWx0Jyk7XG4gICAgLyoqXG4gICAgICogQWxsb3cgcGVvcGxlIHRvIGRpc2FibGUgY29uc29sZSB3YXJuaW5ncy5cbiAgICAgKi9cbiAgICB3YXJuaW5ncz86IHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFNob3cgYSB3YXJuaW5nIHdoZW4gdGhlIHVzZXIgZW5hYmxlZCB0aGUgLS1obXIgb3B0aW9uLlxuICAgICAgICAgKi9cbiAgICAgICAgaG1yV2FybmluZz86IGJvb2xlYW47XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTaG93IGEgd2FybmluZyB3aGVuIHRoZSBub2RlIHZlcnNpb24gaXMgaW5jb21wYXRpYmxlLlxuICAgICAgICAgKi9cbiAgICAgICAgbm9kZURlcHJlY2F0aW9uPzogYm9vbGVhbjtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFNob3cgYSB3YXJuaW5nIHdoZW4gdGhlIHVzZXIgaW5zdGFsbGVkIGFuZ3VsYXItY2xpLlxuICAgICAgICAgKi9cbiAgICAgICAgcGFja2FnZURlcHJlY2F0aW9uPzogYm9vbGVhbjtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFNob3cgYSB3YXJuaW5nIHdoZW4gdGhlIGdsb2JhbCB2ZXJzaW9uIGlzIG5ld2VyIHRoYW4gdGhlIGxvY2FsIG9uZS5cbiAgICAgICAgICovXG4gICAgICAgIHZlcnNpb25NaXNtYXRjaD86IGJvb2xlYW47XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTaG93IGEgd2FybmluZyB3aGVuIHRoZSBUeXBlU2NyaXB0IHZlcnNpb24gaXMgaW5jb21wYXRpYmxlXG4gICAgICAgICAqL1xuICAgICAgICB0eXBlc2NyaXB0TWlzbWF0Y2g/OiBib29sZWFuO1xuICAgIH07XG59XG5cbmV4cG9ydCB0eXBlIFdvcmtzcGFjZVNjaGVtYSA9IGV4cGVyaW1lbnRhbC53b3Jrc3BhY2UuV29ya3NwYWNlU2NoZW1hO1xuZXhwb3J0IHR5cGUgV29ya3NwYWNlUHJvamVjdCA9IGV4cGVyaW1lbnRhbC53b3Jrc3BhY2UuV29ya3NwYWNlUHJvamVjdDtcblxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0V29ya3NwYWNlUGF0aChob3N0OiBUcmVlKTogc3RyaW5nIHtcbiAgICBjb25zdCBwb3NzaWJsZUZpbGVzID0gWycvc2hhcmstZ2VuZXJhdGUtY29uZi5qc29uJywgJy8uc2hhcmstZ2VuZXJhdGUtY29uZi5qc29uJ107XG4gICAgY29uc3QgcGF0aCA9IHBvc3NpYmxlRmlsZXMuZmlsdGVyKHBhdGggPT4gaG9zdC5leGlzdHMocGF0aCkpWzBdO1xuXG4gICAgcmV0dXJuIHBhdGg7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRXb3Jrc3BhY2UoaG9zdDogVHJlZSk6IFdvcmtzcGFjZVNjaGVtYSB7XG4gICAgY29uc3QgcGF0aCA9IGdldFdvcmtzcGFjZVBhdGgoaG9zdCk7XG4gICAgY29uc3QgY29uZmlnQnVmZmVyID0gaG9zdC5yZWFkKHBhdGgpO1xuICAgIGlmIChjb25maWdCdWZmZXIgPT09IG51bGwpIHtcbiAgICAgICAgdGhyb3cgbmV3IFNjaGVtYXRpY3NFeGNlcHRpb24oYENvdWxkIG5vdCBmaW5kICgke3BhdGh9KWApO1xuICAgIH1cbiAgICBjb25zdCBjb25maWcgPSBjb25maWdCdWZmZXIudG9TdHJpbmcoKTtcblxuICAgIHJldHVybiBKU09OLnBhcnNlKGNvbmZpZyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhZGRQcm9qZWN0VG9Xb3Jrc3BhY2UoXG4gICAgd29ya3NwYWNlOiBXb3Jrc3BhY2VTY2hlbWEsXG4gICAgbmFtZTogc3RyaW5nLFxuICAgIHByb2plY3Q6IFdvcmtzcGFjZVByb2plY3QsXG4pOiBSdWxlIHtcbiAgICByZXR1cm4gKGhvc3Q6IFRyZWUsIGNvbnRleHQ6IFNjaGVtYXRpY0NvbnRleHQpID0+IHtcblxuICAgICAgICBpZiAod29ya3NwYWNlLnByb2plY3RzW25hbWVdKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFByb2plY3QgJyR7bmFtZX0nIGFscmVhZHkgZXhpc3RzIGluIHdvcmtzcGFjZS5gKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEFkZCBwcm9qZWN0IHRvIHdvcmtzcGFjZS5cbiAgICAgICAgd29ya3NwYWNlLnByb2plY3RzW25hbWVdID0gcHJvamVjdDtcblxuICAgICAgICBpZiAoIXdvcmtzcGFjZS5kZWZhdWx0UHJvamVjdCAmJiBPYmplY3Qua2V5cyh3b3Jrc3BhY2UucHJvamVjdHMpLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgLy8gTWFrZSB0aGUgbmV3IHByb2plY3QgdGhlIGRlZmF1bHQgb25lLlxuICAgICAgICAgICAgd29ya3NwYWNlLmRlZmF1bHRQcm9qZWN0ID0gbmFtZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGhvc3Qub3ZlcndyaXRlKGdldFdvcmtzcGFjZVBhdGgoaG9zdCksIEpTT04uc3RyaW5naWZ5KHdvcmtzcGFjZSwgbnVsbCwgMikpO1xuICAgIH07XG59XG5cbmV4cG9ydCBjb25zdCBjb25maWdQYXRoID0gJy8uc2hhcmstZ2VuZXJhdGUtY29uZi5qc29uJztcblxuZXhwb3J0IGZ1bmN0aW9uIGdldENvbmZpZyhob3N0OiBUcmVlKTogQ2xpQ29uZmlnIHtcbiAgICBjb25zdCBjb25maWdCdWZmZXIgPSBob3N0LnJlYWQoY29uZmlnUGF0aCk7XG4gICAgaWYgKGNvbmZpZ0J1ZmZlciA9PT0gbnVsbCkge1xuICAgICAgICB0aHJvdyBuZXcgU2NoZW1hdGljc0V4Y2VwdGlvbignQ291bGQgbm90IGZpbmQgLnNoYXJrLWdlbmVyYXRlLWNvbmYuanNvbicpO1xuICAgIH1cblxuICAgIGNvbnN0IGNvbmZpZyA9IEpTT04ucGFyc2UoY29uZmlnQnVmZmVyLnRvU3RyaW5nKCkpO1xuXG4gICAgcmV0dXJuIGNvbmZpZztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEFwcEZyb21Db25maWcoY29uZmlnOiBDbGlDb25maWcsIGFwcEluZGV4T3JOYW1lOiBzdHJpbmcpOiBBcHBDb25maWcgfCBudWxsIHtcbiAgICBpZiAoIWNvbmZpZy5hcHBzKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGlmIChwYXJzZUludChhcHBJbmRleE9yTmFtZSkgPj0gMCkge1xuICAgICAgICByZXR1cm4gY29uZmlnLmFwcHNbcGFyc2VJbnQoYXBwSW5kZXhPck5hbWUpXTtcbiAgICB9XG5cbiAgICByZXR1cm4gY29uZmlnLmFwcHMuZmlsdGVyKChhcHApID0+IGFwcC5uYW1lID09PSBhcHBJbmRleE9yTmFtZSlbMF07XG59XG4iXX0=