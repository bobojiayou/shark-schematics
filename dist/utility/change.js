"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * An operation that does nothing.
 */
class NoopChange {
    constructor() {
        this.description = 'No operation.';
        this.order = Infinity;
        this.path = null;
    }
    apply() { return Promise.resolve(); }
}
exports.NoopChange = NoopChange;
/**
 * Will add text to the source code.
 */
class InsertChange {
    constructor(path, pos, toAdd) {
        this.path = path;
        this.pos = pos;
        this.toAdd = toAdd;
        if (pos < 0) {
            throw new Error('Negative positions are invalid');
        }
        this.description = `Inserted ${toAdd} into position ${pos} of ${path}`;
        this.order = pos;
    }
    /**
     * This method does not insert spaces if there is none in the original string.
     */
    apply(host) {
        return host.read(this.path).then(content => {
            const prefix = content.substring(0, this.pos);
            const suffix = content.substring(this.pos);
            return host.write(this.path, `${prefix}${this.toAdd}${suffix}`);
        });
    }
}
exports.InsertChange = InsertChange;
/**
 * Will remove text from the source code.
 */
class RemoveChange {
    constructor(path, pos, toRemove) {
        this.path = path;
        this.pos = pos;
        this.toRemove = toRemove;
        if (pos < 0) {
            throw new Error('Negative positions are invalid');
        }
        this.description = `Removed ${toRemove} into position ${pos} of ${path}`;
        this.order = pos;
    }
    apply(host) {
        return host.read(this.path).then(content => {
            const prefix = content.substring(0, this.pos);
            const suffix = content.substring(this.pos + this.toRemove.length);
            // TODO: throw error if toRemove doesn't match removed string.
            return host.write(this.path, `${prefix}${suffix}`);
        });
    }
}
exports.RemoveChange = RemoveChange;
/**
 * Will replace text from the source code.
 */
class ReplaceChange {
    constructor(path, pos, oldText, newText) {
        this.path = path;
        this.pos = pos;
        this.oldText = oldText;
        this.newText = newText;
        if (pos < 0) {
            throw new Error('Negative positions are invalid');
        }
        this.description = `Replaced ${oldText} into position ${pos} of ${path} with ${newText}`;
        this.order = pos;
    }
    apply(host) {
        return host.read(this.path).then(content => {
            const prefix = content.substring(0, this.pos);
            const suffix = content.substring(this.pos + this.oldText.length);
            const text = content.substring(this.pos, this.pos + this.oldText.length);
            if (text !== this.oldText) {
                return Promise.reject(new Error(`Invalid replace: "${text}" != "${this.oldText}".`));
            }
            // TODO: throw error if oldText doesn't match removed string.
            return host.write(this.path, `${prefix}${this.newText}${suffix}`);
        });
    }
}
exports.ReplaceChange = ReplaceChange;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhbmdlLmpzIiwic291cmNlUm9vdCI6Ii9Vc2Vycy9ib2JvL1dvcmsvc2hhcmstc2NoZW1hdGljcy9zcmMvIiwic291cmNlcyI6WyJzcmMvdXRpbGl0eS9jaGFuZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUE2QkE7O0dBRUc7QUFDSDtJQUFBO1FBQ0UsZ0JBQVcsR0FBRyxlQUFlLENBQUM7UUFDOUIsVUFBSyxHQUFHLFFBQVEsQ0FBQztRQUNqQixTQUFJLEdBQUcsSUFBSSxDQUFDO0lBRWQsQ0FBQztJQURDLEtBQUssS0FBSyxPQUFPLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUM7Q0FDdEM7QUFMRCxnQ0FLQztBQUdEOztHQUVHO0FBQ0g7SUFLRSxZQUFtQixJQUFZLEVBQVMsR0FBVyxFQUFTLEtBQWE7UUFBdEQsU0FBSSxHQUFKLElBQUksQ0FBUTtRQUFTLFFBQUcsR0FBSCxHQUFHLENBQVE7UUFBUyxVQUFLLEdBQUwsS0FBSyxDQUFRO1FBQ3ZFLElBQUksR0FBRyxHQUFHLENBQUMsRUFBRTtZQUNYLE1BQU0sSUFBSSxLQUFLLENBQUMsZ0NBQWdDLENBQUMsQ0FBQztTQUNuRDtRQUNELElBQUksQ0FBQyxXQUFXLEdBQUcsWUFBWSxLQUFLLGtCQUFrQixHQUFHLE9BQU8sSUFBSSxFQUFFLENBQUM7UUFDdkUsSUFBSSxDQUFDLEtBQUssR0FBRyxHQUFHLENBQUM7SUFDbkIsQ0FBQztJQUVEOztPQUVHO0lBQ0gsS0FBSyxDQUFDLElBQVU7UUFDZCxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUN6QyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDOUMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENB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RjtZQUVELDZEQUE2RDtZQUM3RCxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxHQUFHLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sRUFBRSxDQUFDLENBQUM7UUFDcEUsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0Y7QUEzQkQsc0NBMkJDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBIb3N0IHtcbiAgd3JpdGUocGF0aDogc3RyaW5nLCBjb250ZW50OiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+O1xuICByZWFkKHBhdGg6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPjtcbn1cblxuXG5leHBvcnQgaW50ZXJmYWNlIENoYW5nZSB7XG4gIGFwcGx5KGhvc3Q6IEhvc3QpOiBQcm9taXNlPHZvaWQ+O1xuXG4gIC8vIFRoZSBmaWxlIHRoaXMgY2hhbmdlIHNob3VsZCBiZSBhcHBsaWVkIHRvLiBTb21lIGNoYW5nZXMgbWlnaHQgbm90IGFwcGx5IHRvXG4gIC8vIGEgZmlsZSAobWF5YmUgdGhlIGNvbmZpZykuXG4gIHJlYWRvbmx5IHBhdGg6IHN0cmluZyB8IG51bGw7XG5cbiAgLy8gVGhlIG9yZGVyIHRoaXMgY2hhbmdlIHNob3VsZCBiZSBhcHBsaWVkLiBOb3JtYWxseSB0aGUgcG9zaXRpb24gaW5zaWRlIHRoZSBmaWxlLlxuICAvLyBDaGFuZ2VzIGFyZSBhcHBsaWVkIGZyb20gdGhlIGJvdHRvbSBvZiBhIGZpbGUgdG8gdGhlIHRvcC5cbiAgcmVhZG9ubHkgb3JkZXI6IG51bWJlcjtcblxuICAvLyBUaGUgZGVzY3JpcHRpb24gb2YgdGhpcyBjaGFuZ2UuIFRoaXMgd2lsbCBiZSBvdXRwdXR0ZWQgaW4gYSBkcnkgb3IgdmVyYm9zZSBydW4uXG4gIHJlYWRvbmx5IGRlc2NyaXB0aW9uOiBzdHJpbmc7XG59XG5cblxuLyoqXG4gKiBBbiBvcGVyYXRpb24gdGhhdCBkb2VzIG5vdGhpbmcuXG4gKi9cbmV4cG9ydCBjbGFzcyBOb29wQ2hhbmdlIGltcGxlbWVudHMgQ2hhbmdlIHtcbiAgZGVzY3JpcHRpb24gPSAnTm8gb3BlcmF0aW9uLic7XG4gIG9yZGVyID0gSW5maW5pdHk7XG4gIHBhdGggPSBudWxsO1xuICBhcHBseSgpIHsgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpOyB9XG59XG5cblxuLyoqXG4gKiBXaWxsIGFkZCB0ZXh0IHRvIHRoZSBzb3VyY2UgY29kZS5cbiAqL1xuZXhwb3J0IGNsYXNzIEluc2VydENoYW5nZSBpbXBsZW1lbnRzIENoYW5nZSB7XG5cbiAgb3JkZXI6IG51bWJlcjtcbiAgZGVzY3JpcHRpb246IHN0cmluZztcblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgcGF0aDogc3RyaW5nLCBwdWJsaWMgcG9zOiBudW1iZXIsIHB1YmxpYyB0b0FkZDogc3RyaW5nKSB7XG4gICAgaWYgKHBvcyA8IDApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTmVnYXRpdmUgcG9zaXRpb25zIGFyZSBpbnZhbGlkJyk7XG4gICAgfVxuICAgIHRoaXMuZGVzY3JpcHRpb24gPSBgSW5zZXJ0ZWQgJHt0b0FkZH0gaW50byBwb3NpdGlvbiAke3Bvc30gb2YgJHtwYXRofWA7XG4gICAgdGhpcy5vcmRlciA9IHBvcztcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIG1ldGhvZCBkb2VzIG5vdCBpbnNlcnQgc3BhY2VzIGlmIHRoZXJlIGlzIG5vbmUgaW4gdGhlIG9yaWdpbmFsIHN0cmluZy5cbiAgICovXG4gIGFwcGx5KGhvc3Q6IEhvc3QpIHtcbiAgICByZXR1cm4gaG9zdC5yZWFkKHRoaXMucGF0aCkudGhlbihjb250ZW50ID0+IHtcbiAgICAgIGNvbnN0IHByZWZpeCA9IGNvbnRlbnQuc3Vic3RyaW5nKDAsIHRoaXMucG9zKTtcbiAgICAgIGNvbnN0IHN1ZmZpeCA9IGNvbnRlbnQuc3Vic3RyaW5nKHRoaXMucG9zKTtcblxuICAgICAgcmV0dXJuIGhvc3Qud3JpdGUodGhpcy5wYXRoLCBgJHtwcmVmaXh9JHt0aGlzLnRvQWRkfSR7c3VmZml4fWApO1xuICAgIH0pO1xuICB9XG59XG5cbi8qKlxuICogV2lsbCByZW1vdmUgdGV4dCBmcm9tIHRoZSBzb3VyY2UgY29kZS5cbiAqL1xuZXhwb3J0IGNsYXNzIFJlbW92ZUNoYW5nZSBpbXBsZW1lbnRzIENoYW5nZSB7XG5cbiAgb3JkZXI6IG51bWJlcjtcbiAgZGVzY3JpcHRpb246IHN0cmluZztcblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgcGF0aDogc3RyaW5nLCBwcml2YXRlIHBvczogbnVtYmVyLCBwcml2YXRlIHRvUmVtb3ZlOiBzdHJpbmcpIHtcbiAgICBpZiAocG9zIDwgMCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdOZWdhdGl2ZSBwb3NpdGlvbnMgYXJlIGludmFsaWQnKTtcbiAgICB9XG4gICAgdGhpcy5kZXNjcmlwdGlvbiA9IGBSZW1vdmVkICR7dG9SZW1vdmV9IGludG8gcG9zaXRpb24gJHtwb3N9IG9mICR7cGF0aH1gO1xuICAgIHRoaXMub3JkZXIgPSBwb3M7XG4gIH1cblxuICBhcHBseShob3N0OiBIb3N0KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgcmV0dXJuIGhvc3QucmVhZCh0aGlzLnBhdGgpLnRoZW4oY29udGVudCA9PiB7XG4gICAgICBjb25zdCBwcmVmaXggPSBjb250ZW50LnN1YnN0cmluZygwLCB0aGlzLnBvcyk7XG4gICAgICBjb25zdCBzdWZmaXggPSBjb250ZW50LnN1YnN0cmluZyh0aGlzLnBvcyArIHRoaXMudG9SZW1vdmUubGVuZ3RoKTtcblxuICAgICAgLy8gVE9ETzogdGhyb3cgZXJyb3IgaWYgdG9SZW1vdmUgZG9lc24ndCBtYXRjaCByZW1vdmVkIHN0cmluZy5cbiAgICAgIHJldHVybiBob3N0LndyaXRlKHRoaXMucGF0aCwgYCR7cHJlZml4fSR7c3VmZml4fWApO1xuICAgIH0pO1xuICB9XG59XG5cbi8qKlxuICogV2lsbCByZXBsYWNlIHRleHQgZnJvbSB0aGUgc291cmNlIGNvZGUuXG4gKi9cbmV4cG9ydCBjbGFzcyBSZXBsYWNlQ2hhbmdlIGltcGxlbWVudHMgQ2hhbmdlIHtcbiAgb3JkZXI6IG51bWJlcjtcbiAgZGVzY3JpcHRpb246IHN0cmluZztcblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgcGF0aDogc3RyaW5nLCBwcml2YXRlIHBvczogbnVtYmVyLCBwcml2YXRlIG9sZFRleHQ6IHN0cmluZyxcbiAgICAgICAgICAgICAgcHJpdmF0ZSBuZXdUZXh0OiBzdHJpbmcpIHtcbiAgICBpZiAocG9zIDwgMCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdOZWdhdGl2ZSBwb3NpdGlvbnMgYXJlIGludmFsaWQnKTtcbiAgICB9XG4gICAgdGhpcy5kZXNjcmlwdGlvbiA9IGBSZXBsYWNlZCAke29sZFRleHR9IGludG8gcG9zaXRpb24gJHtwb3N9IG9mICR7cGF0aH0gd2l0aCAke25ld1RleHR9YDtcbiAgICB0aGlzLm9yZGVyID0gcG9zO1xuICB9XG5cbiAgYXBwbHkoaG9zdDogSG9zdCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiBob3N0LnJlYWQodGhpcy5wYXRoKS50aGVuKGNvbnRlbnQgPT4ge1xuICAgICAgY29uc3QgcHJlZml4ID0gY29udGVudC5zdWJzdHJpbmcoMCwgdGhpcy5wb3MpO1xuICAgICAgY29uc3Qgc3VmZml4ID0gY29udGVudC5zdWJzdHJpbmcodGhpcy5wb3MgKyB0aGlzLm9sZFRleHQubGVuZ3RoKTtcbiAgICAgIGNvbnN0IHRleHQgPSBjb250ZW50LnN1YnN0cmluZyh0aGlzLnBvcywgdGhpcy5wb3MgKyB0aGlzLm9sZFRleHQubGVuZ3RoKTtcblxuICAgICAgaWYgKHRleHQgIT09IHRoaXMub2xkVGV4dCkge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IEVycm9yKGBJbnZhbGlkIHJlcGxhY2U6IFwiJHt0ZXh0fVwiICE9IFwiJHt0aGlzLm9sZFRleHR9XCIuYCkpO1xuICAgICAgfVxuXG4gICAgICAvLyBUT0RPOiB0aHJvdyBlcnJvciBpZiBvbGRUZXh0IGRvZXNuJ3QgbWF0Y2ggcmVtb3ZlZCBzdHJpbmcuXG4gICAgICByZXR1cm4gaG9zdC53cml0ZSh0aGlzLnBhdGgsIGAke3ByZWZpeH0ke3RoaXMubmV3VGV4dH0ke3N1ZmZpeH1gKTtcbiAgICB9KTtcbiAgfVxufVxuIl19