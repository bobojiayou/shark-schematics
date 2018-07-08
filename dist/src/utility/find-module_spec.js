"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schematics_1 = require("@angular-devkit/schematics");
const find_module_1 = require("./find-module");
describe('find-module', () => {
    describe('findModule', () => {
        let host;
        const modulePath = '/foo/src/app/app.module.ts';
        beforeEach(() => {
            host = new schematics_1.EmptyTree();
            host.create(modulePath, 'app module');
        });
        it('should find a module', () => {
            const foundModule = find_module_1.findModule(host, 'foo/src/app/bar');
            expect(foundModule).toEqual(modulePath);
        });
        it('should not find a module in another sub dir', () => {
            host.create('/foo/src/app/buzz/buzz.module.ts', 'app module');
            const foundModule = find_module_1.findModule(host, 'foo/src/app/bar');
            expect(foundModule).toEqual(modulePath);
        });
        it('should ignore routing modules', () => {
            host.create('/foo/src/app/app-routing.module.ts', 'app module');
            const foundModule = find_module_1.findModule(host, 'foo/src/app/bar');
            expect(foundModule).toEqual(modulePath);
        });
        it('should work with weird paths', () => {
            host.create('/foo/src/app/app-routing.module.ts', 'app module');
            const foundModule = find_module_1.findModule(host, 'foo//src//app/bar/');
            expect(foundModule).toEqual(modulePath);
        });
        it('should throw if no modules found', () => {
            host.create('/foo/src/app/oops.module.ts', 'app module');
            try {
                find_module_1.findModule(host, 'foo/src/app/bar');
                throw new Error('Succeeded, should have failed');
            }
            catch (err) {
                expect(err.message).toMatch(/More than one module matches/);
            }
        });
        it('should throw if two modules found', () => {
            try {
                host = new schematics_1.EmptyTree();
                find_module_1.findModule(host, 'foo/src/app/bar');
                throw new Error('Succeeded, should have failed');
            }
            catch (err) {
                expect(err.message).toMatch(/Could not find an NgModule/);
            }
        });
    });
    describe('findModuleFromOptions', () => {
        let tree;
        let options;
        beforeEach(() => {
            tree = new schematics_1.EmptyTree();
            options = { name: 'foo' };
        });
        it('should find a module', () => {
            tree.create('/projects/my-proj/src/app.module.ts', '');
            options.module = 'app.module.ts';
            options.path = '/projects/my-proj/src';
            const modPath = find_module_1.findModuleFromOptions(tree, options);
            expect(modPath).toEqual('/projects/my-proj/src/app.module.ts');
        });
        it('should find a module in a sub dir', () => {
            tree.create('/projects/my-proj/src/admin/foo.module.ts', '');
            options.name = 'other/test';
            options.module = 'admin/foo';
            options.path = '/projects/my-proj/src';
            const modPath = find_module_1.findModuleFromOptions(tree, options);
            expect(modPath).toEqual('/projects/my-proj/src/admin/foo.module.ts');
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmluZC1tb2R1bGVfc3BlYy5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvYm9iby9Xb3JrL2dpdGh1Yi9zaGFyay1zY2hlbWF0aWNzL3NyYy8iLCJzb3VyY2VzIjpbInNyYy91dGlsaXR5L2ZpbmQtbW9kdWxlX3NwZWMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFRQSwyREFBNkQ7QUFDN0QsK0NBQWlGO0FBR2pGLFFBQVEsQ0FBQyxhQUFhLEVBQUUsR0FBRyxFQUFFO0lBQzNCLFFBQVEsQ0FBQyxZQUFZLEVBQUUsR0FBRyxFQUFFO1FBRTFCLElBQUksSUFBVSxDQUFDO1FBQ2YsTUFBTSxVQUFVLEdBQUcsNEJBQTRCLENBQUM7UUFDaEQsVUFBVSxDQUFDLEdBQUcsRUFBRTtZQUNkLElBQUksR0FBRyxJQUFJLHNCQUFTLEVBQUUsQ0FBQztZQUN2QixJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxZQUFZLENBQUMsQ0FBQztRQUN4QyxDQUFDLENBQUMsQ0FBQztRQUVILEVBQUUsQ0FBQyxzQkFBc0IsRUFBRSxHQUFHLEVBQUU7WUFDOUIsTUFBTSxXQUFXLEdBQUcsd0JBQVUsQ0FBQyxJQUFJLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztZQUN4RCxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQzFDLENBQUMsQ0FBQyxDQUFDO1FBRUgsRUFBRSxDQUFDLDZDQUE2QyxFQUFFLEdBQUcsRUFBRTtZQUNyRCxJQUFJLENBQUMsTUFBTSxDQUFDLGtDQUFrQyxFQUFFLFlBQVksQ0FBQyxDQUFDO1lBQzlELE1BQU0sV0FBVyxHQUFHLHdCQUFVLENBQUMsSUFBSSxFQUFFLGlCQUFpQixDQUFDLENBQUM7WUFDeEQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUMxQyxDQUFDLENBQUMsQ0FBQztRQUVILEVBQUUsQ0FBQywrQkFBK0IsRUFBRSxHQUFHLEVBQUU7WUFDdkMs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QUNyRCxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTyxDQUFDLDJDQUFtRCxDQUFDLENBQUM7UUFDL0UsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDLENBQUMsQ0FBQztBQUNMLENBQUMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHsgUGF0aCB9IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9jb3JlJztcbmltcG9ydCB7IEVtcHR5VHJlZSwgVHJlZSB9IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9zY2hlbWF0aWNzJztcbmltcG9ydCB7IE1vZHVsZU9wdGlvbnMsIGZpbmRNb2R1bGUsIGZpbmRNb2R1bGVGcm9tT3B0aW9ucyB9IGZyb20gJy4vZmluZC1tb2R1bGUnO1xuXG5cbmRlc2NyaWJlKCdmaW5kLW1vZHVsZScsICgpID0+IHtcbiAgZGVzY3JpYmUoJ2ZpbmRNb2R1bGUnLCAoKSA9PiB7XG5cbiAgICBsZXQgaG9zdDogVHJlZTtcbiAgICBjb25zdCBtb2R1bGVQYXRoID0gJy9mb28vc3JjL2FwcC9hcHAubW9kdWxlLnRzJztcbiAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgIGhvc3QgPSBuZXcgRW1wdHlUcmVlKCk7XG4gICAgICBob3N0LmNyZWF0ZShtb2R1bGVQYXRoLCAnYXBwIG1vZHVsZScpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBmaW5kIGEgbW9kdWxlJywgKCkgPT4ge1xuICAgICAgY29uc3QgZm91bmRNb2R1bGUgPSBmaW5kTW9kdWxlKGhvc3QsICdmb28vc3JjL2FwcC9iYXInKTtcbiAgICAgIGV4cGVjdChmb3VuZE1vZHVsZSkudG9FcXVhbChtb2R1bGVQYXRoKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgbm90IGZpbmQgYSBtb2R1bGUgaW4gYW5vdGhlciBzdWIgZGlyJywgKCkgPT4ge1xuICAgICAgaG9zdC5jcmVhdGUoJy9mb28vc3JjL2FwcC9idXp6L2J1enoubW9kdWxlLnRzJywgJ2FwcCBtb2R1bGUnKTtcbiAgICAgIGNvbnN0IGZvdW5kTW9kdWxlID0gZmluZE1vZHVsZShob3N0LCAnZm9vL3NyYy9hcHAvYmFyJyk7XG4gICAgICBleHBlY3QoZm91bmRNb2R1bGUpLnRvRXF1YWwobW9kdWxlUGF0aCk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIGlnbm9yZSByb3V0aW5nIG1vZHVsZXMnLCAoKSA9PiB7XG4gICAgICBob3N0LmNyZWF0ZSgnL2Zvby9zcmMvYXBwL2FwcC1yb3V0aW5nLm1vZHVsZS50cycsICdhcHAgbW9kdWxlJyk7XG4gICAgICBjb25zdCBmb3VuZE1vZHVsZSA9IGZpbmRNb2R1bGUoaG9zdCwgJ2Zvby9zcmMvYXBwL2JhcicpO1xuICAgICAgZXhwZWN0KGZvdW5kTW9kdWxlKS50b0VxdWFsKG1vZHVsZVBhdGgpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCB3b3JrIHdpdGggd2VpcmQgcGF0aHMnLCAoKSA9PiB7XG4gICAgICBob3N0LmNyZWF0ZSgnL2Zvby9zcmMvYXBwL2FwcC1yb3V0aW5nLm1vZHVsZS50cycsICdhcHAgbW9kdWxlJyk7XG4gICAgICBjb25zdCBmb3VuZE1vZHVsZSA9IGZpbmRNb2R1bGUoaG9zdCwgJ2Zvby8vc3JjLy9hcHAvYmFyLycpO1xuICAgICAgZXhwZWN0KGZvdW5kTW9kdWxlKS50b0VxdWFsKG1vZHVsZVBhdGgpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCB0aHJvdyBpZiBubyBtb2R1bGVzIGZvdW5kJywgKCkgPT4ge1xuICAgICAgaG9zdC5jcmVhdGUoJy9mb28vc3JjL2FwcC9vb3BzLm1vZHVsZS50cycsICdhcHAgbW9kdWxlJyk7XG4gICAgICB0cnkge1xuICAgICAgICBmaW5kTW9kdWxlKGhvc3QsICdmb28vc3JjL2FwcC9iYXInKTtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdTdWNjZWVkZWQsIHNob3VsZCBoYXZlIGZhaWxlZCcpO1xuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGV4cGVjdChlcnIubWVzc2FnZSkudG9NYXRjaCgvTW9yZSB0aGFuIG9uZSBtb2R1bGUgbWF0Y2hlcy8pO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCB0aHJvdyBpZiB0d28gbW9kdWxlcyBmb3VuZCcsICgpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGhvc3QgPSBuZXcgRW1wdHlUcmVlKCk7XG4gICAgICAgIGZpbmRNb2R1bGUoaG9zdCwgJ2Zvby9zcmMvYXBwL2JhcicpO1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1N1Y2NlZWRlZCwgc2hvdWxkIGhhdmUgZmFpbGVkJyk7XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgZXhwZWN0KGVyci5tZXNzYWdlKS50b01hdGNoKC9Db3VsZCBub3QgZmluZCBhbiBOZ01vZHVsZS8pO1xuICAgICAgfVxuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnZmluZE1vZHVsZUZyb21PcHRpb25zJywgKCkgPT4ge1xuICAgIGxldCB0cmVlOiBUcmVlO1xuICAgIGxldCBvcHRpb25zOiBNb2R1bGVPcHRpb25zO1xuICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgdHJlZSA9IG5ldyBFbXB0eVRyZWUoKTtcbiAgICAgIG9wdGlvbnMgPSB7IG5hbWU6ICdmb28nIH07XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIGZpbmQgYSBtb2R1bGUnLCAoKSA9PiB7XG4gICAgICB0cmVlLmNyZWF0ZSgnL3Byb2plY3RzL215LXByb2ovc3JjL2FwcC5tb2R1bGUudHMnLCAnJyk7XG4gICAgICBvcHRpb25zLm1vZHVsZSA9ICdhcHAubW9kdWxlLnRzJztcbiAgICAgIG9wdGlvbnMucGF0aCA9ICcvcHJvamVjdHMvbXktcHJvai9zcmMnO1xuICAgICAgY29uc3QgbW9kUGF0aCA9IGZpbmRNb2R1bGVGcm9tT3B0aW9ucyh0cmVlLCBvcHRpb25zKTtcbiAgICAgIGV4cGVjdChtb2RQYXRoKS50b0VxdWFsKCcvcHJvamVjdHMvbXktcHJvai9zcmMvYXBwLm1vZHVsZS50cycgYXMgUGF0aCk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIGZpbmQgYSBtb2R1bGUgaW4gYSBzdWIgZGlyJywgKCkgPT4ge1xuICAgICAgdHJlZS5jcmVhdGUoJy9wcm9qZWN0cy9teS1wcm9qL3NyYy9hZG1pbi9mb28ubW9kdWxlLnRzJywgJycpO1xuICAgICAgb3B0aW9ucy5uYW1lID0gJ290aGVyL3Rlc3QnO1xuICAgICAgb3B0aW9ucy5tb2R1bGUgPSAnYWRtaW4vZm9vJztcbiAgICAgIG9wdGlvbnMucGF0aCA9ICcvcHJvamVjdHMvbXktcHJvai9zcmMnO1xuICAgICAgY29uc3QgbW9kUGF0aCA9IGZpbmRNb2R1bGVGcm9tT3B0aW9ucyh0cmVlLCBvcHRpb25zKTtcbiAgICAgIGV4cGVjdChtb2RQYXRoKS50b0VxdWFsKCcvcHJvamVjdHMvbXktcHJvai9zcmMvYWRtaW4vZm9vLm1vZHVsZS50cycgYXMgUGF0aCk7XG4gICAgfSk7XG4gIH0pO1xufSk7XG4iXX0=