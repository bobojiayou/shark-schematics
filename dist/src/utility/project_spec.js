"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const project_1 = require("./project");
describe('project', () => {
    describe('buildDefaultPath', () => {
        let project;
        beforeEach(() => {
            project = {
                projectType: 'application',
                root: 'foo',
                prefix: 'app',
            };
        });
        it('should handle projectType of application', () => {
            const result = project_1.buildDefaultPath(project);
            expect(result).toEqual('/foo/src/app');
        });
        it('should handle projectType of library', () => {
            project = Object.assign({}, project, { projectType: 'library' });
            const result = project_1.buildDefaultPath(project);
            expect(result).toEqual('/foo/src/lib');
        });
        it('should handle sourceRoot', () => {
            project = Object.assign({}, project, { sourceRoot: 'foo/bar/custom' });
            const result = project_1.buildDefaultPath(project);
            expect(result).toEqual('/foo/bar/custom/app');
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvamVjdF9zcGVjLmpzIiwic291cmNlUm9vdCI6Ii9Vc2Vycy9ib2JvL1dvcmsvZ2l0aHViL3NoYXJrLXNjaGVtYXRpY3Mvc3JjLyIsInNvdXJjZXMiOlsic3JjL3V0aWxpdHkvcHJvamVjdF9zcGVjLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBUUEsdUNBQTZDO0FBRzdDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsR0FBRyxFQUFFO0lBQ3ZCLFFBQVEsQ0FBQyxrQkFBa0IsRUFBRSxHQUFHLEVBQUU7UUFDaEMsSUFBSSxPQUF5QixDQUFDO1FBQzlCLFVBQVUsQ0FBQyxHQUFHLEVBQUU7WUFDZCxPQUFPLEdBQUc7Z0JBQ1IsV0FBVyxFQUFFLGFBQWE7Z0JBQzFCLElBQUksRUFBRSxLQUFLO2dCQUNYLE1BQU0sRUFBRSxLQUFLO2FBQ2QsQ0FBQztRQUNKLENBQUMsQ0FBQyxDQUFDO1FBRUgsRUFBRSxDQUFDLDBDQUEwQyxFQUFFLEdBQUcsRUFBRTtZQUNsRCxNQUFNLE1BQU0sR0FBRywwQkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN6QyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ3pDLENBQUMsQ0FBQyxDQUFDO1FBRUgsRUFBRSxDQUFDLHNDQUFzQyxFQUFFLEdBQUcsRUFBRTtZQUM5QyxPQUFPLHFCQUFRLE9BQU8sSUFBRSxXQUFXLEVBQUUsU0FBUyxHQUFFLENBQUM7WUFDakQsTUFBTSxNQUFNLEdBQUcsMEJBQWdCLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDekMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUN6QyxDQUFDLENBQUMsQ0FBQztRQUVILEVBQUUsQ0FBQywwQkFBMEIsRUFBRSxHQUFHLEVBQUU7WUFDbEMsT0FBTyxxQkFBUSxPQUFPLElBQUUsVUFBVSxFQUFFLGdCQUFnQixHQUFFLENBQUM7WUFDdkQsTUFBTSxNQUFNLEdBQUcsMEJBQWdCLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDekMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1FBQ2hELENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7IFdvcmtzcGFjZVByb2plY3QgfSBmcm9tICcuLi91dGlsaXR5L2NvbmZpZyc7XG5pbXBvcnQgeyBidWlsZERlZmF1bHRQYXRoIH0gZnJvbSAnLi9wcm9qZWN0JztcblxuXG5kZXNjcmliZSgncHJvamVjdCcsICgpID0+IHtcbiAgZGVzY3JpYmUoJ2J1aWxkRGVmYXVsdFBhdGgnLCAoKSA9PiB7XG4gICAgbGV0IHByb2plY3Q6IFdvcmtzcGFjZVByb2plY3Q7XG4gICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICBwcm9qZWN0ID0ge1xuICAgICAgICBwcm9qZWN0VHlwZTogJ2FwcGxpY2F0aW9uJyxcbiAgICAgICAgcm9vdDogJ2ZvbycsXG4gICAgICAgIHByZWZpeDogJ2FwcCcsXG4gICAgICB9O1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBoYW5kbGUgcHJvamVjdFR5cGUgb2YgYXBwbGljYXRpb24nLCAoKSA9PiB7XG4gICAgICBjb25zdCByZXN1bHQgPSBidWlsZERlZmF1bHRQYXRoKHByb2plY3QpO1xuICAgICAgZXhwZWN0KHJlc3VsdCkudG9FcXVhbCgnL2Zvby9zcmMvYXBwJyk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIGhhbmRsZSBwcm9qZWN0VHlwZSBvZiBsaWJyYXJ5JywgKCkgPT4ge1xuICAgICAgcHJvamVjdCA9IHsgLi4ucHJvamVjdCwgcHJvamVjdFR5cGU6ICdsaWJyYXJ5JyB9O1xuICAgICAgY29uc3QgcmVzdWx0ID0gYnVpbGREZWZhdWx0UGF0aChwcm9qZWN0KTtcbiAgICAgIGV4cGVjdChyZXN1bHQpLnRvRXF1YWwoJy9mb28vc3JjL2xpYicpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBoYW5kbGUgc291cmNlUm9vdCcsICgpID0+IHtcbiAgICAgIHByb2plY3QgPSB7IC4uLnByb2plY3QsIHNvdXJjZVJvb3Q6ICdmb28vYmFyL2N1c3RvbScgfTtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGJ1aWxkRGVmYXVsdFBhdGgocHJvamVjdCk7XG4gICAgICBleHBlY3QocmVzdWx0KS50b0VxdWFsKCcvZm9vL2Jhci9jdXN0b20vYXBwJyk7XG4gICAgfSk7XG4gIH0pO1xufSk7XG4iXX0=