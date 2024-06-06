export const toSnakeCase = (str: string): string => str.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();

export const clean_struct_tag = (str: string): string => str.replace(/(.*?\s+\w+\s+\w+)\s+`[^`]*`/g, '$1').replace(/\s+$/gm,'');

export const add_json_struct_tag = (str: string): string => str.replace(/(\s+)([A-Z]\w*)\s+(\w+)/g,
    (_, spaces, fieldName, fieldType) => {
        if (fieldType == "struct") {
            return `${spaces}${fieldName} ${fieldType}`
        } else {
            return `${spaces}${fieldName} ${fieldType} \`json:"${toSnakeCase(fieldName)}"\``
        }
    }).replace(/`(\s+)`/g, '$1').replace(/\s+$/gm,'');

export const add_gorm_column_tag = (str: string): string => str.replace(/(\s+)([A-Z]\w*)\s+(\w+)/g,
    (_, spaces, fieldName, fieldType) => {
        if (fieldType == "struct") {
            return `${spaces}${fieldName} ${fieldType}`
        } else {
            return `${spaces}${fieldName} ${fieldType} \`gorm:"column:${toSnakeCase(fieldName)}"\``
        }
    }).replace(/`(\s+)`/g, '$1').replace(/\s+$/gm,'');

export const gen_struct_conv = (str: string): string => {
    const structs = extractStructs(str);
    if (structs.length !== 2) {
        throw new Error("需要两个结构体进行互转生成");
    }
    const [struct1, struct2] = structs;
    const conversionFunctions = generateConversionFunction(struct1, struct2);
    return conversionFunctions;
}

export const clean_comment = (str: string): string => str.replace(/^\s*\/\/.*$/gm, '').trim().replace(/\/\/.*$/gm, '').replace(/\s+$/gm, '');
export const combine_empty_line = (str: string): string => str.replace(/\n\s*\n/g, '\n').replace(/\s+$/gm, '');

// go struct parser by ChatGPT
const structRegex = /type (\w+) struct {([^}]*)}/g;

const fieldRegex = /(\w+)\s+(\w+)/g;

function extractStructs(code: string) {
    const structs = [];
    let match;

    while ((match = structRegex.exec(code)) !== null) {
        const [, structName, fieldsBlock] = match;
        const fields = [];
        let fieldMatch;

        while ((fieldMatch = fieldRegex.exec(fieldsBlock)) !== null) {
            const [, fieldName, fieldType] = fieldMatch;
            fields.push({ fieldName, fieldType });
        }

        structs.push({ structName, fields });
    }

    return structs;
}

function generateConversionFunction(struct1: any, struct2: any): string {
    const struct1Name = struct1.structName;
    const struct2Name = struct2.structName;

    const struct1Fields = new Map(struct1.fields.map((f: any) => [f.fieldName, f.fieldType]));
    const struct2Fields = new Map(struct2.fields.map((f: any) => [f.fieldName, f.fieldType]));

    const commonFields = [...struct1Fields.entries()].filter(([name, type]) => struct2Fields.get(name) === type);

    const struct1ToStruct2 = `
func ${struct1Name}To${struct2Name}(a ${struct1Name}) ${struct2Name} {
    return ${struct2Name}{
        ${commonFields.map(([name]) => `${name}: a.${name},`).join('\n        ')}
    }
}
`;

    const struct2ToStruct1 = `
func ${struct2Name}To${struct1Name}(b ${struct2Name}) ${struct1Name} {
    return ${struct1Name}{
        ${commonFields.map(([name]) => `${name}: b.${name},`).join('\n        ')}
    }
}
`;

    return struct1ToStruct2 + struct2ToStruct1;
}

