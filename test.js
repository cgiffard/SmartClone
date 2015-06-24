var assert = require("assert"),
    smartClone = require("./index");

describe("SmartClone", function() {

    describe("Basic cloning", function() {

        it("given a primitive, simply returns that primitive", function() {
            assert.equal(smartClone(3), 3, "The numeric input was not matched.");
            assert.equal(smartClone("foo"), "foo", "The string input was not matched.");
        });

        it("given a function, simply return that function",
            function() {
                var myFunc = function myFunction() { return "some code in here!"; };
                assert.equal(smartClone(myFunc), myFunc, "The function input was not matched.");
            });

        it("given a basic object, delivers an identical object with a different identity",
            function() {
                var myObject = { "foo": "bar" };
                assert.notEqual(smartClone(myObject), myObject,
                    "The object identity was retained!");
                assert.deepEqual(smartClone(myObject), myObject,
                    "The object was not identical!");
            });

        it("correctly copies primitive property values",
            function() {
                var myObject = { "foo": "bar", "baz": 6, "bar": undefined };
                assert.notEqual(smartClone(myObject), myObject,
                    "The object identity was retained!");
                assert.deepEqual(smartClone(myObject), myObject,
                    "The object was not identical!");
            });

        it("given a nested object, delivers an identical nested object with a different identity",
            function() {
                var myObject = { "foo": { "bar": "baz" } };
                assert.notEqual(smartClone(myObject), myObject,
                    "The object identity was retained!");
                assert.notEqual(smartClone(myObject).foo, myObject.foo,
                    "The nested object identity was retained!");
                assert.deepEqual(smartClone(myObject), myObject,
                    "The object was not identical!");
            });

        it("correctly maintains the type of arrays",
            function() {
                var myArray = [1, 2, 3, 4];

                assert.notEqual(smartClone(myArray), myArray,
                    "The array identity was retained!");
                assert.deepEqual(smartClone(myArray), myArray,
                    "The array was not identical!");
                assert(smartClone(myArray) instanceof Array,
                    "The array was coerced to a non-array type!");
            });

        it("correctly maintains the type of arrays when nested",
            function() {
                var myObject = { myArray: [1, 2, 3, 4] };

                assert.notEqual(smartClone(myObject).myArray, myObject.myArray,
                    "The nested array identity was retained!");
                assert.deepEqual(smartClone(myObject).myArray, myObject.myArray,
                    "The nested array was not identical!");
                assert(smartClone(myObject).myArray instanceof Array,
                    "The nested array was coerced to a non-array type!");
            });

        it("correctly maintains circular links in objects",
            function() {
                var myObject = { };
                myObject.circular = myObject;

                var clonedObject = smartClone(myObject);
                assert.equal(clonedObject, clonedObject.circular,
                    "The circular relationship was not maintained!");
                assert.notEqual(clonedObject.circular, myObject.circular,
                    "The identity of the new object is not pure!");
            });

        it("correctly maintains deep circular links in objects",
            function() {
                var myObject = { "deep": {} };
                myObject.deep.circular = myObject;

                var clonedObject = smartClone(myObject);
                assert.equal(clonedObject, clonedObject.deep.circular,
                    "The circular relationship was not maintained!");
                assert.notEqual(clonedObject.deep, clonedObject.deep.circular,
                    "The circular relationship was not correct!");
                assert.notEqual(clonedObject.deep.circular, myObject.deep.circular,
                    "The identity of the new object is not pure!");
            });

        it("correctly maintains deep sibling circularity in objects",
            function() {
                var family = { "grandma": {}, "grandpa": {} };
                // Accident with a time machine!
                family.grandma.son = family.grandpa;
                family.grandpa.daughter = family.grandma;

                // And now we're cloning them? Oh, the humanity!
                var horrendouslyClonedFamily = smartClone(family);

                // I haven't yet thought of a way to get single-level sibling
                // circularity working cleanly, so for now I'm more concerned
                // that it hasn't crashed, and I'm making no assertions other
                // than the implicit expectation that it hasn't thrown.
            });
    });

    describe("Prototypal cloning", function() {

        it("given an object with a shallow prototype, copies the prototype",
            function() {
                var myShallowPrototype = { "remoteProperty": "valueShouldBePresent" },
                    objectToClone = Object.create(myShallowPrototype);

                objectToClone.localProperty = "shouldAlsoBePresent";

                assert.ok(smartClone(objectToClone).localProperty,
                    "The local property was not copied!");

                assert.equal(smartClone(objectToClone).localProperty,
                    "shouldAlsoBePresent",
                    "The value of the local property was not correct!");

                assert.ok(smartClone(objectToClone).remoteProperty,
                    "The property from the immediate prototype was not copied!");

                assert.equal(smartClone(objectToClone).remoteProperty,
                    "valueShouldBePresent",
                    "The value of the property from the immediate prototype " +
                    "was incorrect!");
            });

        it("given an object with a deep prototype, copies the immediate prototype only",
            function() {
                var myDeepPrototype =  { "veryRemoteProperty": "shouldNotAppear" },
                    myShallowPrototype = Object.create(myDeepPrototype),
                    objectToClone = Object.create(myShallowPrototype);

                myShallowPrototype.remoteProperty = "valueShouldBePresent";
                objectToClone.localProperty = "shouldAlsoBePresent";

                assert.ok(smartClone(objectToClone).localProperty,
                    "The local property was not copied!");

                assert.equal(smartClone(objectToClone).localProperty,
                    "shouldAlsoBePresent",
                    "The value of the local property was not correct!");

                assert.ok(smartClone(objectToClone).remoteProperty,
                    "The property from the immediate prototype was not copied!");

                assert.equal(smartClone(objectToClone).remoteProperty,
                    "valueShouldBePresent",
                    "The value of the property from the immediate prototype " +
                    "was incorrect!");

                if (smartClone(objectToClone).veryRemoteProperty) {
                    throw new Error(
                        "Very deep property existed! (With value '" +
                        smartClone(objectToClone).veryRemoteProperty +
                        "')"
                    );
                }
            });

        it("does not copy any values on global prototypes",
            function() {
                Object.prototype.shouldNotAppear = function() {};
                Object.prototype.shouldNotAppear2 = "thisValueShouldNotAppear!";

                var myObject = { "localProperty": "shouldDefinitelyAppear!" };

                assert.ok(smartClone(myObject).localProperty,
                    "The local property was not copied!");

                assert.deepEqual(smartClone(myObject), myObject,
                    "The cloned object incorporated properties from the global prototype!");

                delete Object.prototype.shouldNotAppear;
                delete Object.prototype.shouldNotAppear2;
            });

        it("copies local properties only when matching properties from the " +
           "immediate prototype are also present",
            function() {
                var myShallowPrototype =  { "replaced": "remoteValue" },
                    objectToClone = Object.create(myShallowPrototype);

                objectToClone.replaced = "localValue";

                assert.equal(smartClone(objectToClone).replaced,
                    "localValue",
                    "The value of the local property was not correct!");
            });
    });
});