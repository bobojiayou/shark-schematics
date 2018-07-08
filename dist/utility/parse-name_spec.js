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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2UtbmFtZV9zcGVjLmpzIiwic291cmNlUm9vdCI6Ii9Vc2Vycy9ib2JvL1dvcmsvc2hhcmstc2NoZW1hdGljcy9zcmMvIiwic291cmNlcyI6WyJzcmMvdXRpbGl0eS9wYXJzZS1uYW1lX3NwZWMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7O0dBTUc7QUFDSCw2Q0FBeUM7QUFHekMsUUFBUSxDQUFDLFlBQVksRUFBRSxHQUFHLEVBQUU7SUFDMUIsRUFBRSxDQUFDLDZCQUE2QixFQUFFLEdBQUcsRUFBRTtRQUNyQyxNQUFNLE1BQU0sR0FBRyxzQkFBUyxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUMzQyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNuQyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUMxQyxDQUFDLENBQUMsQ0FBQztJQUVILEVBQUUsQ0FBQyx1QkFBdUIsRUFBRSxHQUFHLEVBQUU7UUFDL0IsTUFBTSxNQUFNLEdBQUcsc0JBQVMsQ0FBQyxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDcEMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDbkMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDbkMsQ0FBQyxDQUFDLENBQUM7SUFFSCxFQUFFLENBQUMseUNBQXlDLEVBQUUsR0FBRyxFQUFFO1FBQ2pELE1BQU0sTUFBTSxHQUFHLHNCQUFTLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQy9DLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ25DLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQzlDLENBQUMsQ0FBQyxDQUFDO0lBRUgsRUFBRSxDQUFDLHNDQUFzQyxFQUFFLEdBQUcsRUFBRTtRQUM5QyxNQUFNLE1BQU0sR0FBRyxzQkFBUyxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUM5QyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNuQyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUN0QyxDQUFDLENBQUMsQ0FBQztJQUVILEVBQUUsQ0FBQyxpREFBaUQsRUFBRSxHQUFHLEVBQUU7UUFDekQsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLHNCQUFTLENBQUMsU0FBUyxFQUFFLGNBQWMsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDL0QsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7IHBhcnNlTmFtZSB9IGZyb20gJy4vcGFyc2UtbmFtZSc7XG5cblxuZGVzY3JpYmUoJ3BhcnNlLW5hbWUnLCAoKSA9PiB7XG4gIGl0KCdzaG91bGQgaGFuZGxlIGp1c3QgdGhlIG5hbWUnLCAoKSA9PiB7XG4gICAgY29uc3QgcmVzdWx0ID0gcGFyc2VOYW1lKCdzcmMvYXBwJywgJ2ZvbycpO1xuICAgIGV4cGVjdChyZXN1bHQubmFtZSkudG9FcXVhbCgnZm9vJyk7XG4gICAgZXhwZWN0KHJlc3VsdC5wYXRoKS50b0VxdWFsKCcvc3JjL2FwcCcpO1xuICB9KTtcblxuICBpdCgnc2hvdWxkIGhhbmRsZSBubyBwYXRoJywgKCkgPT4ge1xuICAgIGNvbnN0IHJlc3VsdCA9IHBhcnNlTmFtZSgnJywgJ2ZvbycpO1xuICAgIGV4cGVjdChyZXN1bHQubmFtZSkudG9FcXVhbCgnZm9vJyk7XG4gICAgZXhwZWN0KHJlc3VsdC5wYXRoKS50b0VxdWFsKCcvJyk7XG4gIH0pO1xuXG4gIGl0KCdzaG91bGQgaGFuZGxlIG5hbWUgaGFzIGEgcGF0aCAoc3ViLWRpciknLCAoKSA9PiB7XG4gICAgY29uc3QgcmVzdWx0ID0gcGFyc2VOYW1lKCdzcmMvYXBwJywgJ2Jhci9mb28nKTtcbiAgICBleHBlY3QocmVzdWx0Lm5hbWUpLnRvRXF1YWwoJ2ZvbycpO1xuICAgIGV4cGVjdChyZXN1bHQucGF0aCkudG9FcXVhbCgnL3NyYy9hcHAvYmFyJyk7XG4gIH0pO1xuXG4gIGl0KCdzaG91bGQgaGFuZGxlIG5hbWUgaGFzIGEgaGlnaGVyIHBhdGgnLCAoKSA9PiB7XG4gICAgY29uc3QgcmVzdWx0ID0gcGFyc2VOYW1lKCdzcmMvYXBwJywgJy4uL2ZvbycpO1xuICAgIGV4cGVjdChyZXN1bHQubmFtZSkudG9FcXVhbCgnZm9vJyk7XG4gICAgZXhwZWN0KHJlc3VsdC5wYXRoKS50b0VxdWFsKCcvc3JjJyk7XG4gIH0pO1xuXG4gIGl0KCdzaG91bGQgaGFuZGxlIG5hbWUgaGFzIGEgaGlnaGVyIHBhdGggYWJvdmUgcm9vdCcsICgpID0+IHtcbiAgICBleHBlY3QoKCkgPT4gcGFyc2VOYW1lKCdzcmMvYXBwJywgJy4uLy4uLy4uL2ZvbycpKS50b1Rocm93KCk7XG4gIH0pO1xufSk7XG4iXX0=