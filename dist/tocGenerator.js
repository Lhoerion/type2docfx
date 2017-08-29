"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function tocGenerator(classes) {
    var result = [];
    if (classes) {
        classes.forEach(function (classModel) {
            var firstLevelToc = {
                uid: classModel.uid,
                name: classModel.name
            };
            if (classModel.children) {
                var items_1 = [];
                classModel.children.forEach(function (method) {
                    items_1.push({
                        uid: method.uid,
                        name: method.name
                    });
                });
                firstLevelToc.items = items_1;
            }
            result.push(firstLevelToc);
        });
    }
    return result;
}
exports.tocGenerator = tocGenerator;
