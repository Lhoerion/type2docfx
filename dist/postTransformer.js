"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var constants_1 = require("./common/constants");
var flags_1 = require("./common/flags");
function groupOrphanFunctions(elements) {
    if (elements && elements.length) {
        var mapping = {};
        for (var i = 0; i < elements.length; i++) {
            if (elements[i].type === 'function') {
                var key = void 0;
                if (elements[i].module) {
                    key = elements[i].module;
                }
                else {
                    key = 'ParentToPackage';
                    var tmp = elements[i].uid.split('.');
                    tmp.splice(tmp.length - 1, 0, 'global');
                    elements[i].uid = tmp.join('.');
                }
                if (!mapping[key]) {
                    mapping[key] = [];
                }
                mapping[key].push(elements[i]);
                elements.splice(i, 1);
                i--;
            }
        }
        return mapping;
    }
}
exports.groupOrphanFunctions = groupOrphanFunctions;
function insertFunctionToIndex(index, functions) {
    if (index && functions) {
        index.items[0].children = index.items[0].children.concat(functions.map(function (f) { return f.uid; }));
        index.items = index.items.concat(functions);
    }
}
exports.insertFunctionToIndex = insertFunctionToIndex;
function postTransform(element) {
    return flattening(element);
}
exports.postTransform = postTransform;
function flattening(element) {
    if (!element) {
        return [];
    }
    var result = [];
    result.push({
        items: [element]
    });
    if (element.children) {
        var childrenUid_1 = [];
        var children = element.children;
        if (flags_1.flags.enableAlphabetOrder) {
            children = children.sort(sortYamlModel);
        }
        children.forEach(function (child) {
            if (child.children && child.children.length > 0) {
                result = result.concat(flattening(child));
            }
            else {
                childrenUid_1.push(child.uid);
                result[0].items.push(child);
            }
        });
        element.children = childrenUid_1;
        return result;
    }
}
function sortYamlModel(a, b) {
    if (a.numericValue !== undefined && b.numericValue !== undefined) {
        return a.numericValue - b.numericValue;
    }
    // sort classes alphabetically, contructor first
    if (b.name === constants_1.constructorName) {
        return 1;
    }
    if (a.name === constants_1.constructorName) {
        return -1;
    }
    var nameA = a.name.toUpperCase();
    var nameB = b.name.toUpperCase();
    if (nameA < nameB) {
        return -1;
    }
    if (nameA > nameB) {
        return 1;
    }
    return 0;
}
