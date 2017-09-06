import { YamlModel, Type } from './interfaces/YamlModel';
import { UidMapping } from './interfaces/UidMapping';

export function resolveIds(elements: YamlModel[], uidMapping: UidMapping): void {
    if (elements) {
        elements.forEach(element => {
            (element.children as YamlModel[]).forEach(child => {
                if (child.syntax) {
                    if (child.syntax.parameters) {
                        child.syntax.parameters.forEach(p => {
                            p.type = restoreTypes(p.type as Type[], uidMapping);
                        });
                    }

                    if (child.syntax.return) {
                        child.syntax.return.type = restoreTypes(child.syntax.return.type as Type[], uidMapping);
                    }
                }
            });
        });
    }
}

function restoreTypes(types: Type[], uidMapping: UidMapping): string[] {
    if (types) {
        return types.map(t => {
            if (t.reflectedType) {
                return typeToString(t);
            } else if (t.genericType) {
                return typeToString(t);
            } else {
                if (t.typeId && uidMapping[t.typeId]) {
                    return uidMapping[t.typeId];
                } else {
                    return t.typeName;
                }
            }
        });
    }
    return null;
}

export function typeToString(type: Type | string): string {
    if (!type) {
        return 'function';
    }

    if (typeof(type) === 'string') {
        return type;
    }

    if (type.isArray) {
        let newType = type;
        newType.isArray = false;
        return `${typeToString(newType)}[]`;
    }

    if (type.reflectedType) {
        return `[key: ${typeToString(type.reflectedType.key)}]: ${typeToString(type.reflectedType.value)}`;
    } else if (type.genericType) {
        return `${typeToString(type.genericType.outter)}<${typeToString(type.genericType.inner)}>`;
    } else {
        return type.typeName;
    }
}
