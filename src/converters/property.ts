import { YamlModel } from '../interfaces/YamlModel';
import { Node } from '../interfaces/TypeDocModel';
import { AbstractConverter } from './base';
import { typeToString } from '../idResolver';
import { Context } from './context';
import { langs } from '../common/constants';

export class PropertyConverter extends AbstractConverter {
    protected generate(node: Node, context: Context): Array<YamlModel> {
        const uid = context.ParentUid + '.' + node.name;
        console.log(` - ${node.kindString}: ${uid}`);
        let isPublic = node.flags && (node.flags.isPublic || !(node.flags.isProtected || node.flags.isPrivate)) ? 'public ' : '';
        let isProtected = node.flags && node.flags.isProtected ? 'protected ' : '';
        let isPrivate = node.flags && node.flags.isPrivate ? 'private ' : '';
        let isStatic = node.flags && node.flags.isStatic ? 'static ' : '';
        let isOptional = node.flags && node.flags.isOptional ? '?' : '';
        let isConst = node.flags && node.flags.isConst ? 'const ' : '';
        let isReadonly = node.flags && node.flags.isReadonly ? 'readonly ' : '';
        let defaultValue = node.defaultValue ? ` = ${node.defaultValue.trim()}` : '';
        let name = node.name;
        if (node.kindString === 'Index signature') {
            name = `[${node.parameters[0].name}: ${typeToString(this.extractType(node.parameters[0].type)[0])}]`;
            isPublic = '';
        }
        const model: YamlModel = {
            uid: uid,
            name: name,
            fullName: name,
            children: [],
            langs: langs,
            type: (node.kindString === 'Index signature' ? 'Property' : node.kindString).toLowerCase(),
            summary: node.comment ? this.findDescriptionInComment(node.comment) : '',
            optional: node.flags && node.flags.isOptional,
            syntax: {
                content: `${isPublic}${isProtected}${isPrivate}${isConst}${isReadonly}${isStatic}${name}${isOptional}: ${typeToString(this.extractType(node.type)[0], node.kindString)}${defaultValue}`,
                return: {
                    type: this.extractType(node.type),
                    description: this.extractReturnComment(node.comment)
                }
            }
        };

        return [model];
    }
}
