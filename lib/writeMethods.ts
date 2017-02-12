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
            let params = ClassGenerator.parseArguments(method.arguments)
            let returnType = ""

            this.addLine(`    function ${method.name}(${params}): ${returnType}`)
        }
    }

    static parseArguments(args: AtomDocTypes.Argument[]): string {
        let argOutput: string[] = []
        for (let argname in args) {
            let arg = args[argname]
            let argType = ""
            if (typeof (arg.children) == "undefined" || arg.children.length == 0) {
                argType = ClassGenerator.parseChildlessArg(arg)
            }
            else {
                argType = ClassGenerator.parseArgWithChildren(arg)
            }
            if (argOutput.length != 0) argOutput.push(", ")
            argOutput.push(`${arg.name}${arg.isOptional ? "?" : ""}: ${argType}`)
        }
        return argOutput.join("")
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
            sgsfdsdsdf //working here
            default:
            // console.log(arg.type, arg.name)
        }
    }

    static parseArgWithChildren(arg: AtomDocTypes.Argument): string {
        if (arg.type == "Object" || arg.type == null) {
            return `{${ClassGenerator.parseArguments(arg.children)}}`
        }
        else if (arg.type == "Function") {
            return `(${ClassGenerator.parseArguments(arg.children)}) => void}`
        }
        else if(arg.type == "Array" && arg.description.match(/.*{Object}.*/g)){
          return `{${ClassGenerator.parseArguments(arg.children)}}`
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
