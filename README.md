# SmartClone

[![Build Status](https://travis-ci.org/cgiffard/SmartClone.png?branch=master)](https://travis-ci.org/cgiffard/SmartClone)

Deep clone JavaScript objects, including their immediate prototypes, without
inadvertently copying methods and values from global prototypes. Also replicates
circular relationships in newly created objects.

## Installation

```sh
npm install smartclone
```

## Usage

```js
var smartClone = require("smartclone");
var clonedObject = smartClone({"myProperty": "myValue!");
```

## Rationale

We're often told that iterating over objects using `for... in` is *bad practice*,
but this assumption often robs us of the power that prototypal inheritance
provides us. **For example...**

Typical object cloning is really expensive — you've got to walk the object, test
values, write them onto the new object, etc. If your object is too deep you'll
blow the stack — if your object has circular references, you'll need to clean
those up.†

If you want to quickly copy an object so that you can safely ephemerally override
properties, you can use JS' prototype chains to provide a rough copy-on-write
approximation (remember to freeze your originals!)

```js
const myImmutableObject = {
	"foo": "retaining this value is really important!",
	"bar": "Some other really valuable customer records"
};
Object.freeze(myImmutableObject);
Object.seal(myImmutableObject);

function someMiddleware(req, res, next) {
	// Don't want to touch my immutable object!
	myEphemeralObject = Object.create(myImmutableObject);
	
	// Safely write to the ephemeral object!
	myEphemeralObject.foo = "baz";
}
```

Well, that works mostly great! It's not exactly immutable-js, but it's faster than
cloning, and it's safer than just referencing the original.

But then an error is thrown, and you need to record a whole bunch of information
to disk, for debugging purposes. JSON.stringify it, and we can inspect it later!

```js
JSON.stringify(myEphemeralObject);
--> { "foo": "baz" }
```

Uh-oh. What happened to those important customer records—which were highly
pertinent to our debugging? JSON.stringify is (sensibly) avoiding the prototype
when stringifying.

So what can you do?

**Safely clone the immediate prototypes, that's what!**

```js
JSON.stringify(smartClone(myEphemeralObject));
--> { "foo": "baz", "bar": "Some other really valuable customer records" }
```

**Ahh. Much better.** Now we can debug sensibly, while also maintaining our
prototype-based copy-on-write ephemeral objects.

#### Notes:

* †Currently, this module *will* blow the stack if you're a nutcase and have
  objects nested (without relying on circularity) tens of thousands deep.

## Testing

```sh
npm install && npm test
```

## Licence

Copyright (c) 2015, Christopher Giffard.

All rights reserved.

Redistribution and use in source and binary forms, with or without modification, 
are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.
* Redistributions in binary form must reproduce the above copyright notice, this
  list of conditions and the following disclaimer in the documentation and/or
  other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR 
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.