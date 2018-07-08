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
function validateName(name) {
    if (name && /^\d/.test(name)) {
        throw new schematics_1.SchematicsException(core_1.tags.oneLine `name (${name})
        can not start with a digit.`);
    }
}
exports.validateName = validateName;
// Must start with a letter, and must contain only alphanumeric characters or dashes.
// When adding a dash the segment after the dash must also start with a letter.
exports.htmlSelectorRe = /^[a-zA-Z][.0-9a-zA-Z]*(:?-[a-zA-Z][.0-9a-zA-Z]*)*$/;
function validateHtmlSelector(selector) {
    if (selector && !exports.htmlSelectorRe.test(selector)) {
        throw new schematics_1.SchematicsException(core_1.tags.oneLine `Selector (${selector})
        is invalid.`);
    }
}
exports.validateHtmlSelector = validateHtmlSelector;
function validateProjectName(projectName) {
    const errorIndex = getRegExpFailPosition(projectName);
    const unsupportedProjectNames = ['test', 'ember', 'ember-cli', 'vendor', 'app'];
    const packageNameRegex = /^(?:@[a-zA-Z0-9_-]+\/)?[a-zA-Z0-9_-]+$/;
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
        throw new schematics_1.SchematicsException(`Project name ${JSON.stringify(projectName)} is not a supported name.`);
    }
    else if (!packageNameRegex.test(projectName)) {
        throw new schematics_1.SchematicsException(`Project name ${JSON.stringify(projectName)} is invalid.`);
    }
}
exports.validateProjectName = validateProjectName;
function getRegExpFailPosition(str) {
    const isScope = /^@.*\/.*/.test(str);
    if (isScope) {
        // Remove starting @
        str = str.replace(/^@/, '');
        // Change / to - for validation
        str = str.replace(/\//g, '-');
    }
    const parts = str.indexOf('-') >= 0 ? str.split('-') : [str];
    const matched = [];
    const projectNameRegexp = /^[a-zA-Z][.0-9a-zA-Z]*(-[.0-9a-zA-Z]*)*$/;
    parts.forEach(part => {
        if (part.match(projectNameRegexp)) {
            matched.push(part);
        }
    });
    const compare = matched.join('-');
    return (str !== compare) ? compare.length : null;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvYm9iby9Xb3JrL2dpdGh1Yi9zaGFyay1zY2hlbWF0aWNzL3NyYy8iLCJzb3VyY2VzIjpbInNyYy91dGlsaXR5L3ZhbGlkYXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7O0dBTUc7QUFDSCwrQ0FBNEM7QUFDNUMsMkRBQWlFO0FBRWpFLHNCQUE2QixJQUFZO0lBQ3ZDLElBQUksSUFBSSxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUU7UUFDNUIsTUFBTSxJQUFJLGdDQUFtQixDQUFDLFdBQUksQ0FBQyxPQUFPLENBQUEsU0FBUyxJQUFJO29DQUN2QixDQUFDLENBQUM7S0FDbkM7QUFDSCxDQUFDO0FBTEQsb0NBS0M7QUFFRCxxRkFBcUY7QUFDckYsK0VBQStFO0FBQ2xFLFFBQUEsY0FBYyxHQUFHLG9EQUFvRCxDQUFDO0FBRW5GLDhCQUFxQyxRQUFnQjtJQUNuRCxJQUFJLFFBQVEsSUFBSSxDQUFDLHNCQUFjLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFO1FBQzlDLE1BQU0sSUFBSSxnQ0FBbUIsQ0FBQyxXQUFJLENBQUMsT0FBTyxDQUFBLGFBQWEsUUFBUTtvQkFDL0MsQ0FBQyxDQUFDO0tBQ25CO0FBQ0gsQ0FBQztBQUxELG9EQUtDO0FBR0QsNkJBQW9DLFdBQW1CO0lBQ3JELE1BQU0sVUFBVSxHQUFHLHFCQUFxQixDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ3RELE1BQU0sdUJBQXVCLEdBQUcsQ0FBQyxNQUFNLEVBQUUsT0FBTyxFQUFFLFdBQVcsRUFBRSxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDaEYsTUFBTSxnQkFBZ0IsR0FBRyx3Q0FBd0MsQ0FBQztJQUNsRSxJQUFJLFVBQVUsS0FBSyxJQUFJLEVBQUU7UUFDdkIsTUFBTSxZQUFZLEdBQUcsV0FBSSxDQUFDLE9BQU8sQ0FBQTtvQkFDakIsV0FBVzs7O0tBRzFCLENBQUM7UUFDRixNQUFNLEdBQUcsR0FBRyxXQUFJLENBQUMsV0FBVyxDQUFBO01BQzFCLFlBQVk7TUFDWixXQUFXO01BQ1gsS0FBSyxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRztLQUN0QyxDQUFDO1FBQ0YsTUFBTSxJQUFJLGdDQUFtQixDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQ3BDO1NBQU0sSUFBSSx1QkFBdUIsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7UUFDOUQsTUFBTSxJQUFJLGdDQUFtQixDQUMzQixnQkFBZ0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsMkJBQTJCLENBQUMsQ0FBQztLQUMzRTtTQUFNLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUU7UUFDOUMsTUFBTSxJQUFJLGdDQUFtQixDQUFDLGdCQUFnQixJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxjQUFjLENBQUMsQ0FBQztLQUMxRjtBQUNILENBQUM7QUF0QkQsa0RBc0JDO0FBRUQsK0JBQStCLEdBQVc7SUFDeEMsTUFBTSxPQUFPLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNyQyxJQUFJLE9BQU8sRUFBRTtRQUNYLG9CQUFvQjtRQUNwQixHQUFHLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDNUIsK0JBQStCO1FBQy9CLEdBQUcsR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQztLQUMvQjtJQUVELE1BQU0sS0FBSyxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQzdELE1BQU0sT0FBTyxHQUFhLEVBQUUsQ0FBQztJQUU3QixNQUFNLGlCQUFpQixHQUFHLDBDQUEwQyxDQUFDO0lBRXJFLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7UUFDbkIsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLGlCQUFpQixDQUFDLEVBQUU7WUFDakMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUNwQjtJQUNILENBQUMsQ0FBQyxDQUFDO0lBRUgsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUVsQyxPQUFPLENBQUMsR0FBRyxLQUFLLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7QUFDbkQsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7IHRhZ3MgfSBmcm9tICdAYW5ndWxhci1kZXZraXQvY29yZSc7XG5pbXBvcnQgeyBTY2hlbWF0aWNzRXhjZXB0aW9uIH0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L3NjaGVtYXRpY3MnO1xuXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVOYW1lKG5hbWU6IHN0cmluZyk6IHZvaWQge1xuICBpZiAobmFtZSAmJiAvXlxcZC8udGVzdChuYW1lKSkge1xuICAgIHRocm93IG5ldyBTY2hlbWF0aWNzRXhjZXB0aW9uKHRhZ3Mub25lTGluZWBuYW1lICgke25hbWV9KVxuICAgICAgICBjYW4gbm90IHN0YXJ0IHdpdGggYSBkaWdpdC5gKTtcbiAgfVxufVxuXG4vLyBNdXN0IHN0YXJ0IHdpdGggYSBsZXR0ZXIsIGFuZCBtdXN0IGNvbnRhaW4gb25seSBhbHBoYW51bWVyaWMgY2hhcmFjdGVycyBvciBkYXNoZXMuXG4vLyBXaGVuIGFkZGluZyBhIGRhc2ggdGhlIHNlZ21lbnQgYWZ0ZXIgdGhlIGRhc2ggbXVzdCBhbHNvIHN0YXJ0IHdpdGggYSBsZXR0ZXIuXG5leHBvcnQgY29uc3QgaHRtbFNlbGVjdG9yUmUgPSAvXlthLXpBLVpdWy4wLTlhLXpBLVpdKig6Py1bYS16QS1aXVsuMC05YS16QS1aXSopKiQvO1xuXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVIdG1sU2VsZWN0b3Ioc2VsZWN0b3I6IHN0cmluZyk6IHZvaWQge1xuICBpZiAoc2VsZWN0b3IgJiYgIWh0bWxTZWxlY3RvclJlLnRlc3Qoc2VsZWN0b3IpKSB7XG4gICAgdGhyb3cgbmV3IFNjaGVtYXRpY3NFeGNlcHRpb24odGFncy5vbmVMaW5lYFNlbGVjdG9yICgke3NlbGVjdG9yfSlcbiAgICAgICAgaXMgaW52YWxpZC5gKTtcbiAgfVxufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZVByb2plY3ROYW1lKHByb2plY3ROYW1lOiBzdHJpbmcpIHtcbiAgY29uc3QgZXJyb3JJbmRleCA9IGdldFJlZ0V4cEZhaWxQb3NpdGlvbihwcm9qZWN0TmFtZSk7XG4gIGNvbnN0IHVuc3VwcG9ydGVkUHJvamVjdE5hbWVzID0gWyd0ZXN0JywgJ2VtYmVyJywgJ2VtYmVyLWNsaScsICd2ZW5kb3InLCAnYXBwJ107XG4gIGNvbnN0IHBhY2thZ2VOYW1lUmVnZXggPSAvXig/OkBbYS16QS1aMC05Xy1dK1xcLyk/W2EtekEtWjAtOV8tXSskLztcbiAgaWYgKGVycm9ySW5kZXggIT09IG51bGwpIHtcbiAgICBjb25zdCBmaXJzdE1lc3NhZ2UgPSB0YWdzLm9uZUxpbmVgXG4gICAgUHJvamVjdCBuYW1lIFwiJHtwcm9qZWN0TmFtZX1cIiBpcyBub3QgdmFsaWQuIE5ldyBwcm9qZWN0IG5hbWVzIG11c3RcbiAgICBzdGFydCB3aXRoIGEgbGV0dGVyLCBhbmQgbXVzdCBjb250YWluIG9ubHkgYWxwaGFudW1lcmljIGNoYXJhY3RlcnMgb3IgZGFzaGVzLlxuICAgIFdoZW4gYWRkaW5nIGEgZGFzaCB0aGUgc2VnbWVudCBhZnRlciB0aGUgZGFzaCBtdXN0IGFsc28gc3RhcnQgd2l0aCBhIGxldHRlci5cbiAgICBgO1xuICAgIGNvbnN0IG1zZyA9IHRhZ3Muc3RyaXBJbmRlbnRgXG4gICAgJHtmaXJzdE1lc3NhZ2V9XG4gICAgJHtwcm9qZWN0TmFtZX1cbiAgICAke0FycmF5KGVycm9ySW5kZXggKyAxKS5qb2luKCcgJykgKyAnXid9XG4gICAgYDtcbiAgICB0aHJvdyBuZXcgU2NoZW1hdGljc0V4Y2VwdGlvbihtc2cpO1xuICB9IGVsc2UgaWYgKHVuc3VwcG9ydGVkUHJvamVjdE5hbWVzLmluZGV4T2YocHJvamVjdE5hbWUpICE9PSAtMSkge1xuICAgIHRocm93IG5ldyBTY2hlbWF0aWNzRXhjZXB0aW9uKFxuICAgICAgYFByb2plY3QgbmFtZSAke0pTT04uc3RyaW5naWZ5KHByb2plY3ROYW1lKX0gaXMgbm90IGEgc3VwcG9ydGVkIG5hbWUuYCk7XG4gIH0gZWxzZSBpZiAoIXBhY2thZ2VOYW1lUmVnZXgudGVzdChwcm9qZWN0TmFtZSkpIHtcbiAgICB0aHJvdyBuZXcgU2NoZW1hdGljc0V4Y2VwdGlvbihgUHJvamVjdCBuYW1lICR7SlNPTi5zdHJpbmdpZnkocHJvamVjdE5hbWUpfSBpcyBpbnZhbGlkLmApO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldFJlZ0V4cEZhaWxQb3NpdGlvbihzdHI6IHN0cmluZyk6IG51bWJlciB8IG51bGwge1xuICBjb25zdCBpc1Njb3BlID0gL15ALipcXC8uKi8udGVzdChzdHIpO1xuICBpZiAoaXNTY29wZSkge1xuICAgIC8vIFJlbW92ZSBzdGFydGluZyBAXG4gICAgc3RyID0gc3RyLnJlcGxhY2UoL15ALywgJycpO1xuICAgIC8vIENoYW5nZSAvIHRvIC0gZm9yIHZhbGlkYXRpb25cbiAgICBzdHIgPSBzdHIucmVwbGFjZSgvXFwvL2csICctJyk7XG4gIH1cblxuICBjb25zdCBwYXJ0cyA9IHN0ci5pbmRleE9mKCctJykgPj0gMCA/IHN0ci5zcGxpdCgnLScpIDogW3N0cl07XG4gIGNvbnN0IG1hdGNoZWQ6IHN0cmluZ1tdID0gW107XG5cbiAgY29uc3QgcHJvamVjdE5hbWVSZWdleHAgPSAvXlthLXpBLVpdWy4wLTlhLXpBLVpdKigtWy4wLTlhLXpBLVpdKikqJC87XG5cbiAgcGFydHMuZm9yRWFjaChwYXJ0ID0+IHtcbiAgICBpZiAocGFydC5tYXRjaChwcm9qZWN0TmFtZVJlZ2V4cCkpIHtcbiAgICAgIG1hdGNoZWQucHVzaChwYXJ0KTtcbiAgICB9XG4gIH0pO1xuXG4gIGNvbnN0IGNvbXBhcmUgPSBtYXRjaGVkLmpvaW4oJy0nKTtcblxuICByZXR1cm4gKHN0ciAhPT0gY29tcGFyZSkgPyBjb21wYXJlLmxlbmd0aCA6IG51bGw7XG59XG4iXX0=