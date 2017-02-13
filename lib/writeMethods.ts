import * as fs from 'fs'

export class ClassGenerator {
    klass: AtomDocTypes.ClassInfo
    generatedData: string[] = [];
    constructor(klass: AtomDocTypes.ClassInfo) {
        this.klass = klass
    }

    generate() {
        this.openClass()
        this.instanceMethods()
        this.closeClass()
    }

    instanceMethods() {
        for (let method of this.klass.instanceMethods) {
            let parsedArguments = ClassGenerator.parseArguments(method.arguments)
            let returnType = ""
            this.generateFunctionDeclarations(method.name, parsedArguments, returnType)
        }
    }

    generateFunctionDeclarations(methodName: string, args: ParsedArgumentCollection, returnType: string) {
        if (args.filter(x => x["optional"]).length == 0 || args.filter(x => x["optional"]).length == args.length || args[args.length - 1]["optional"]) {
            this.addFunction(methodName, args, returnType)
            return
        }

        let clonedCollection = args.slice(0)
        let lastArg = clonedCollection.pop()
        let base = new ParsedArgumentCollection()

        for (let i = 0; i < clonedCollection.length; i = 0) {
            let nextItem = Object.assign({}, clonedCollection.shift())
            if (nextItem.optional) {
                nextItem.optional = false

                let clone = base.slice(0)
                clone.push(lastArg)
                this.addFunction(methodName, clone, returnType)
            }

            base.push(nextItem)
        }
        base.push(lastArg)
        this.addFunction(methodName, base, returnType)
    }

    private addFunction(methodName: string, args: ParsedArgumentCollection, returnType: string) {
        this.addLine(`    function ${methodName}(${args.toString()}): ${returnType}`)
    }

    static parseArguments(args: AtomDocTypes.Argument[]): ParsedArgumentCollection {
        let argOutput: ParsedArgumentCollection = new ParsedArgumentCollection()
        for (let argname in args) {
            let arg = args[argname]
            let argType = ""
            if (typeof (arg.children) == "undefined" || arg.children.length == 0) {
                argType = ClassGenerator.parseChildlessArg(arg)
            }
            else {
                argType = ClassGenerator.parseArgWithChildren(arg)
            }
            argOutput.push({ name: arg.name, optional: arg.isOptional, type: argType })
        }
        return argOutput
    }

    static parseChildlessArg(arg: AtomDocTypes.Argument): string {
        switch (arg.type) {
            case "Number":
                return "number"
            case "String":
                return "string"
            case null:
                return "NullFixMe"
            case "Object":
                return "{}"
            case "Boolean":
                return "boolean"
            case "Function":
                return "Function"
            default:
              console.log(arg)
        }
    }

    static parseArgWithChildren(arg: AtomDocTypes.Argument): string {
        if (arg.type == "Object" || arg.type == null) {
            return `{${ClassGenerator.parseArguments(arg.children).toString()}}`
        }
        else if (arg.type == "Function") {
            return `(${ClassGenerator.parseArguments(arg.children).toString()}) => void}`
        }
        else if (arg.type == "Array" && arg.description.match(/.*{Object}.*/g)) {
            return `{${ClassGenerator.parseArguments(arg.children).toString()}}`
        }
        else {
            console.log(arg)
            return ""
        }
    }

    static parseReturnValues(returnValues: AtomDocTypes.ReturnValue[]): string {

    }

    openClass() {
        this.addLine(`interface ${this.klass.name}{`)
    }

    closeClass() {
        this.addLine("}")
        this.addLine("")
    }

    addLine(line: string) {
        this.generatedData.push(`${line}\n`)
    }
}

interface ParsedArgument {
    name: string;
    optional: boolean;
    type: string;
}

class ParsedArgumentCollection extends Array<ParsedArgument>{
    public toString(): string {
        let returnData: string[] = []
        for (let item of this) {
            returnData.push(`${item.name}${item.optional ? "?" : ""}: ${item.type}`)
        }
        return returnData.join(", ")
    }
}
