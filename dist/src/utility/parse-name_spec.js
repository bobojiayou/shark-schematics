"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const parse_name_1 = require("./parse-name");
describe('parse-name', () => {
    it('should handle just the name', () => {
        const result = parse_name_1.parseName('src/app', 'foo');
        expect(result.name).toEqual('foo');
        expect(result.path).toEqual('/src/app');
    });
    it('should handle no path', () => {
        const result = parse_name_1.parseName('', 'foo');
        expect(result.name).toEqual('foo');
        expect(result.path).toEqual('/');
    });
    it('should handle name has a path (sub-dir)', () => {
        const result = parse_name_1.parseName('src/app', 'bar/foo');
        expect(result.name).toEqual('foo');
        expect(result.path).toEqual('/src/app/bar');
    });
    it('should handle name has a higher path', () => {
        const result = parse_name_1.parseName('src/app', '../foo');
        expect(result.name).toEqual('foo');
        expect(result.path).toEqual('/src');
    });
    it('should handle name has a higher path above root', () => {
        expect(() => parse_name_1.parseName('src/app', '../../../foo')).toThrow();
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2UtbmFtZV9zcGVjLmpzIiwic291cmNlUm9vdCI6Ii9Vc2Vycy9ib2JvL1dvcmsvZ2l0aHViL3NoYXJrLXNjaGVtYXRpY3Mvc3JjLyIsInNvdXJjZXMiOlsic3JjL3V0aWxpdHkvcGFyc2UtbmFtZV9zcGVjLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7OztHQU1HO0FBQ0gsNkNBQXlDO0FBR3pDLFFBQVEsQ0FBQyxZQUFZLEVBQUUsR0FBRyxFQUFFO0lBQzFCLEVBQUUsQ0FBQyw2QkFBNkIsRUFBRSxHQUFHLEVBQUU7UUFDckMsTUFBTSxNQUFNLEdBQUcsc0JBQVMsQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDM0MsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDbkMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDMUMsQ0FBQyxDQUFDLENBQUM7SUFFSCxFQUFFLENBQUMsdUJBQXVCLEVBQUUsR0FBRyxFQUFFO1FBQy9CLE1BQU0sTUFBTSxHQUFHLHNCQUFTLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3BDLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ25DLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ25DLENBQUMsQ0FBQyxDQUFDO0lBRUgsRUFBRSxDQUFDLHlDQUF5QyxFQUFFLEdBQUcsRUFBRTtRQUNqRCxNQUFNLE1BQU0sR0FBRyxzQkFBUyxDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUMvQyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNuQyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUM5QyxDQUFDLENBQUMsQ0FBQztJQUVILEVBQUUsQ0FBQyxzQ0FBc0MsRUFBRSxHQUFHLEVBQUU7UUFDOUMsTUFBTSxNQUFNLEdBQUcsc0JBQVMsQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDOUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDbkMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDdEMsQ0FBQyxDQUFDLENBQUM7SUFFSCxFQUFFLENBQUMsaURBQWlELEVBQUUsR0FBRyxFQUFFO1FBQ3pELE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxzQkFBUyxDQUFDLFNBQVMsRUFBRSxjQUFjLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQy9ELENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQgeyBwYXJzZU5hbWUgfSBmcm9tICcuL3BhcnNlLW5hbWUnO1xuXG5cbmRlc2NyaWJlKCdwYXJzZS1uYW1lJywgKCkgPT4ge1xuICBpdCgnc2hvdWxkIGhhbmRsZSBqdXN0IHRoZSBuYW1lJywgKCkgPT4ge1xuICAgIGNvbnN0IHJlc3VsdCA9IHBhcnNlTmFtZSgnc3JjL2FwcCcsICdmb28nKTtcbiAgICBleHBlY3QocmVzdWx0Lm5hbWUpLnRvRXF1YWwoJ2ZvbycpO1xuICAgIGV4cGVjdChyZXN1bHQucGF0aCkudG9FcXVhbCgnL3NyYy9hcHAnKTtcbiAgfSk7XG5cbiAgaXQoJ3Nob3VsZCBoYW5kbGUgbm8gcGF0aCcsICgpID0+IHtcbiAgICBjb25zdCByZXN1bHQgPSBwYXJzZU5hbWUoJycsICdmb28nKTtcbiAgICBleHBlY3QocmVzdWx0Lm5hbWUpLnRvRXF1YWwoJ2ZvbycpO1xuICAgIGV4cGVjdChyZXN1bHQucGF0aCkudG9FcXVhbCgnLycpO1xuICB9KTtcblxuICBpdCgnc2hvdWxkIGhhbmRsZSBuYW1lIGhhcyBhIHBhdGggKHN1Yi1kaXIpJywgKCkgPT4ge1xuICAgIGNvbnN0IHJlc3VsdCA9IHBhcnNlTmFtZSgnc3JjL2FwcCcsICdiYXIvZm9vJyk7XG4gICAgZXhwZWN0KHJlc3VsdC5uYW1lKS50b0VxdWFsKCdmb28nKTtcbiAgICBleHBlY3QocmVzdWx0LnBhdGgpLnRvRXF1YWwoJy9zcmMvYXBwL2JhcicpO1xuICB9KTtcblxuICBpdCgnc2hvdWxkIGhhbmRsZSBuYW1lIGhhcyBhIGhpZ2hlciBwYXRoJywgKCkgPT4ge1xuICAgIGNvbnN0IHJlc3VsdCA9IHBhcnNlTmFtZSgnc3JjL2FwcCcsICcuLi9mb28nKTtcbiAgICBleHBlY3QocmVzdWx0Lm5hbWUpLnRvRXF1YWwoJ2ZvbycpO1xuICAgIGV4cGVjdChyZXN1bHQucGF0aCkudG9FcXVhbCgnL3NyYycpO1xuICB9KTtcblxuICBpdCgnc2hvdWxkIGhhbmRsZSBuYW1lIGhhcyBhIGhpZ2hlciBwYXRoIGFib3ZlIHJvb3QnLCAoKSA9PiB7XG4gICAgZXhwZWN0KCgpID0+IHBhcnNlTmFtZSgnc3JjL2FwcCcsICcuLi8uLi8uLi9mb28nKSkudG9UaHJvdygpO1xuICB9KTtcbn0pO1xuIl19