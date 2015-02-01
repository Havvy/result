Rust's [Result](http://doc.rust-lang.org/std/result/enum.Result.html) Implemented in JS.

```
npm install r-result
```

## Usage

See Rust's [Result](http://doc.rust-lang.org/std/result/enum.Result.html).


```javascript
// Using EcmaScript 6 features in this example. ES6 not required to use package.
// This module exports a single function that asks the user for a prime number,
// and returns them a string about their input.

const {Ok, Fail} = require("r-result");
const {format} = require("util").format;
const {promptUser, alertUser} = require("...");

// Some reasons that we fail.
const nan = Symbol("NaN");
const inf = Symbol("Inf")
const nonPrime = Symbol("Not Prime");
const neg = Symbol("Negative Number");
const nonInt = Symbol("Not an Integer");
const zero = Symbol("Zero");

const getNumberFromUser = function (requestString) {
    const userInput = promptUser(requestString);

    const number = Number(userInput);

    // While it isn't necessary to show all of these cases for showing how to use Result,
    // I just wanted to show you some of the difficulties you will encounter when trying
    // to deal with user input of numbers in JavaScript.
    //
    // The Infinity & NaN checks are redundant  with the isInteger check, except we want
    // to show a different error message to the user in these cases.
    if (Number.isNaN(userInput) {
        return Fail(nan);
    } else if (number === Infinity) {
        return Fail(inf);
    } else if (!Number.isInteger()) {
        return Fail(nonInt);
    } else if (Math.abs(number) !== number) {
        return Fail(neg);
    } else if (number === 0) {
        return Fail(zero);
    } else {
        return Ok(number);
    }
};

const getPrimeNumberFromUser = function () {
    return getNumberFromUser("Prime number please!")
    .andThen(function (number) {
        if (isPrime(number)) {
            return Ok(number);
            // You could also just `return this`.
        } else {
            return Fail(nonPrime);
        }
    });
};

const doGetPrimeNumberFromUser = function () {
    return getPrimeNumberFromUser()
    .map(function (number) {
        return format("Indeed! %i is prime!", number);
    })
    .unwrap_or_else(function (reason) {
        switch (reason) {
            case nan:      return "That wasn't a number.",
            case inf:      return "Sneaky user, trying to throw me into an infinite loop with Infinity.",
            case nonInt:   return "Sneaky user, trying to give me a rational number instead of an integer.",
            case neg       return "Sneaky user, trying to give me a negative number...",
            case nonPrime: return "Sorry, but that number isn't prime.",
            default:       throw new Error(format("Unhandled failure reason: %s", reason))
        }
    });
};

module.exports = doGetPrimeNumberFromUser;
```

## Differences

Obviously, JavaScript is a different language than Rust. Differences in idiomatic code
and type systems means there will be differences in the code and API.

We already have Errors in JavaScript, which from this package's author's perspective,
should only be used for programmer errors. This is no good, so in this package, we use Fail.

Because idiomatic JS uses camelCase instead of lower_case, all method names have been
translates to camelCase.

Because we cannot get a slice, but we can get an array, `as_slice()` has been
changed to `toArray()`. Not sure if it'll actually be helpful though, unless
you flatmap over an array of results. But it's there for completeness.

The Rust type specific methods (e.g. `as_mut_slice`) are obviously not present.

The methods `and`, `or`, `andThen`, `orElse` are less strict about the types of the
parameters they take. We do not check to make sure you called us with the correct
type. If you want a stricter version of these that does check the type (at a
small performance penalty), please file a bug or send a Pull Request. Otherwise,
for best results, please pass values of the same type as what Rust says.

We don't have a blessed Option type, so instead of returning one, `.ok()` and `.fail()`
are instead doing what `Result::unwrap` and `Result::unwrap_err` are doing and throwing
an error if the value isn't the right type.
