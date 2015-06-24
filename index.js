var protos = [
        "Object",
        "Function",
        "Boolean",
        "Symbol",
        "Error",
        "EvalError",
        "RangeError",
        "ReferenceError",
        "SyntaxError",
        "TypeError",
        "URIError",
        "Number",
        "Math",
        "Date",
        "String",
        "RegExp",
        "Array",
        "Int8Array",
        "Uint8Array",
        "Uint8ClampedArray",
        "Int16Array",
        "Uint16Array",
        "Int32Array",
        "Uint32Array",
        "Float32Array",
        "Float64Array",
        "Map",
        "Set",
        "WeakMap",
        "WeakSet",
        "ArrayBuffer",
        "DataView",
        "JSON"
    ]
    .filter(function(obj) {
        return obj in this;
    })
    .map(function(obj) {
        return this[obj].prototype;
    });

function smartClone(input, stack) {

    // If we're not dealing with an object, don't clone.
    if (typeof input !== "object" || !input) {
        return input;
    }

        // Cache the immediate prototype
    var proto       = Object.getPrototypeOf(input),

        // Is the immediate prototype of the current object a core object?
        // If it isn't, by our rationale, we should be good to copy from it.
        scanProto   = !~protos.indexOf(proto),

        // Create our clone destination, ensuring it is an array if required
        fresh       = input instanceof Array ? [] : {};

    // If the stack is blank, create it, and populate the first item
    stack = stack || [];

    // Check to see whether the object we're dealing with now isn't
    // a circular reference
    var stackIndex = stack.length,
        circular = false;

    while (--stackIndex >= 0) {
        if (input === stack[stackIndex].original) {
            // Bail out if we found circular reference
            return stack[stackIndex].new;
        }
    }

    // If we didn't find a circular reference, push to the stack
    stack = stack.concat({
        "original": input,
        "new": fresh
    });

    // To cultists, this is the 'naughty' method of iteration.
    // Too bad, suckas. We *want* to iterate over the prototype here.

    for (var key in input) { // jshint ignore:line

        // We do the usual Object.hasOwnProperty check, but with a catch:
        // If we have determined (see above) that the immediate prototype is OK
        // to copy from, and the current property is directly attached to the
        // immediate prototype, we can copy it over.
        if (!Object.hasOwnProperty.call(input, key) && !(
                scanProto &&
                Object.hasOwnProperty.call(proto, key)
            )) {
            continue;
        }

        // Quickly handle one-level circular references
        if (input[key] === input) {
            fresh[key] = fresh;
            continue;
        }

        // If the property we're handling right now is an object, recurse.
        if (input[key] instanceof Object && typeof(input[key]) === "object") {
            fresh[key] = smartClone(input[key], stack);
            continue;
        }

        // Finally, if we're just a primitive, simply put the item from box a in
        // box b.
        fresh[key] = input[key];
    }

    return fresh;
}

module.exports = smartClone;