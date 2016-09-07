![Travis Status](https://img.shields.io/travis/Havvy/result.svg) ![NPM Downloads](https://img.shields.io/npm/dm/r-result.svg) ![Version](https://img.shields.io/npm/v/r-result.svg) ![ISC Licensed](https://img.shields.io/npm/l/r-result.svg) ![Github Issue Count](https://img.shields.io/github/issues/havvy/result.svg) ![Github Stars](https://img.shields.io/github/stars/Havvy/result.svg)

Rust's [Result](http://doc.rust-lang.org/std/result/enum.Result.html) implemented in JS.

```
npm install r-result
```

## Usage

See Rust's [Result](http://doc.rust-lang.org/std/result/enum.Result.html).

## Example

For a real example, see [tennu-factoids](https://github.com/Tennu/tennu-factoids/blob/master/plugin.js).

```javascript
// Using EcmaScript 6 features in this example. ES6 not required to use package.
// This module exports a single function that asks the user for a prime number,
// and returns them a string about their input.

const {Ok, Fail} = require("r-result");
const {format} = require("util");
const {promptUser, alertUser} = require("...");

// Some reasons that we fail.
const nan = Symbol("NaN");
const inf = Symbol("Inf")
const nonPrime = Symbol("Not Prime");
const neg = Symbol("Negative Number");
const nonInt = Symbol("Not an Integer");
const zero = Symbol("Zero");

const getNumberFromUser = function (requestString) {
    // Assume blocking prompt. Don't want to complicate with promises.
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
            // You could also just `return this` since you're not transforming the value.
        } else {
            return Fail(nonPrime);
        }
    });
};

const doGetPrimeNumberFromUser = function () {
    const reply = getPrimeNumberFromUser().match({
        Ok(number) { 
            return `Indeed! ${number} is prime!`;
        },

        Fail(reason) {
            switch (reason) {
                case nan:      return "That wasn't a number.",
                case inf:      return "Sneaky user, trying to throw me into an infinite loop with Infinity.",
                case nonInt:   return "Sneaky user, trying to give me a rational number instead of an integer.",
                case neg       return "Sneaky user, trying to give me a negative number...",
                case nonPrime: return "Sorry, but that number isn't prime.",
                default:       throw new Error(`Unhandled failure reason: ${reason}`)
            }
        }
    });
    
    alertUser(reply);
};

module.exports = doGetPrimeNumberFromUser;
```

## Differences

Obviously, JavaScript is a different language than Rust. Differences in idiomatic code
and type systems means there will be differences in the code and API.

We already have Errors in JavaScript. This means we can't use the `Err` name
and so instead use the name `Fail`.

Because idiomatic JS uses camelCase instead of lower_case, all method names have been
translates to camelCase.

Because we cannot get a slice, but we can get an array, `as_slice()` has been
changed to `toArray()`. Not sure if it'll actually be helpful though, unless
you flatmap over an array of results. But it's there for completeness.

The Rust reference type specific methods (e.g. `as_mut_slice`) are obviously not present.

The methods `and`, `or`, `andThen`, `orElse` are less strict about the types of the
parameters they take. We do not check to make sure you called us with the correct
type. If you want a stricter version of these that does check the type (at a
small performance penalty), please file a bug or send a Pull Request. Otherwise,
for best results, please pass values of the same type as what Rust says.

We don't have a blessed Option type, so instead of returning one, `.ok()` and `.fail()`
are instead doing what `Result::unwrap` and `Result::unwrap_err` are doing and throwing
an error if the value isn't the right type. By default, they report a generic error message,
but you can give a specific error message as the optional argument.

In Rust, the Result must be used. Not using a returned Result is a compile time error.
In JavaScript, we have no way of guaranteeing this, so not using a Result is entirely possible.

Because JavaScript doesn't have a `match` expression or even a `match` statement,
we provide a `match` method that takes an object with functions `Ok` and `Fail`.

The `Debug` trait doesn't exist in JS, so there's a `debug` method directly in the
implementation.

There's also `debugOk` and `debugFail` methods that inspect the inner
values if the result matches that variant or does nothing otherwise, and
then returns the result. These don't have an analog to Rust's standard library,
but are useful for e.g. `assert(result.debugFail(logfn).isOk());`

## Functional Variants

Every method has a function that takes `this` as the first parameter as a function on the module.

This lets you write in an Erlang/Elixir style or just pass things to other functions.

```javascript
const Result = require('r-result');
const sampleResult = Result.Ok(true);
Result.map(sampleResult, function (value) {
    assert(value === true);
});
```

```javascript
const Result = require("r-result");
const Ok = Result.Ok;
const Fail = Result.Fail;

// Unrelated: You can totes have a Result<undefined, string> if there's no good value for Ok.
const someResults = [Ok(), Ok(), Ok(), Fail("unexpected spanish inquisition"), Ok()];
const resultOfSomeResults = someResults.reduce(Result.and);
```

## API

### Syntax

* `::` means 'on the prototype' of the value.
* `<>` means generic parameters. `T` is used for an Ok value. `F` is used for a Failure. `T'`, `F'` are for a second Ok/Failure type, though they may (and in most cases, should be) the same value as the non-prime variant. `_` means "any type" or "no type", since it can be anything without issue.
* `[T, 0...1]` means an array of type T with a length of either 0 or 1.
* `|` means either the type on the left or the type on the right.
* InspectOpts is the [options object](https://nodejs.org/api/util.html#util_util_inspect_object_options) you pass to `util.inspect`.

### API

* Result.Ok(value: T) -> Result<T, _>
* Result.Fail(value: F) -> Result<_, F>
* Result<T, F>::`ok`() -> T | throw TypeError
* Result<T, F>::`ok`(errorMessage: String) -> T | throw TypeError
* Result<T, F>::`fail`() -> F | throw TypeError
* Result<T, F>::`fail`(errorMessage: String) -> F | throw TypeError
* Result<T, F>::`isOk`() -> Boolean
* Result<T, F>::`isFail`() -> Boolean
* Result<T, F>::`map`(mapper: function (value: T) -> T') -> Result<T', F>
* Result<T, F>::`mapFail`(mapper: function (failure: F) -> F' -> Result<T, F'>
* Result<T, F>::`and`(otherResult: Result<T', F'>) -> Result<T', F | F'>
* Result<T, F>::`or`(otherResult: Result<T', F'>) -> Result<T | T', F'>
* Result<T, F>::`andThen`(monadic_mapper: function (value: T) -> Result<T', F'>) -> Result<T', F | F'>
* Result<T, F>::`orElse`(monadic_mapper: function (failure: F) -> Result<T', F'>) -> Result<T | T', F'>
* Result<T, F>::`toArray`() -> [T; 0...1]
* Result<T, F>::`unwrapOr`(defaultValue: T') -> T | T'
* Result<T, F>::`unwrapOrElse`(defaultValueMaker: function (failure: F) -> T') -> T | T'
* Result<T, F>::`match`({Ok: Fn(value: T) -> void, Fail: Fn(failure: F) -> void}) -> void
* Result<T, F>::`debug`(logfn: Fn(debugString: String) -> void) -> void
* Result<T, F>::`debug`(logfn: Fn(debugString: String, inspectOpts: InspectOpts)) -> void
* Result<T, F>::`debugOk`(logfn: Fn(debugString: String) -> void) -> void
* Result<T, F>::`debugOk`(logfn: Fn(debugString: String, inspectOpts: InspectOpts)) -> void
* Result<T, F>::`debugFail`(logfn: Fn(debugString: String) -> void) -> void
* Result<T, F>::`debugFail`(logfn: Fn(debugString: String, inspectOpts: InspectOpts)) -> void

## Rationale and Rant on Error Handling

Author: Havvy

You might be looking at this, and thinking that this just reimplements error handling,
and yes, this is true. The difference though, is that by being a return value
it is made explicitly clear that the function does not always succeed even for all
valid inputs to the function. This explicitness also means that you are not forcing
your function caller to use try-catch to capture all of the return values. Try-catch
becomes an error handling mechanism that should only be used for actual errors, whether they
be programmer induced errors or some fundamental assumption actually changed that your
program cannot handle. This means that most code doesn't have `try`/`catch` in it, since the
these errors generally cannot be handled except to report them to the user and log them.

Combined with the usage of some `Future<T, E>` value (like promises), and the amount of
real error handling code you'll write drops dramatically. If you're ever writing
`if (err) { throw err; }`, you're using a poor abstraction that makes you manually
propogate errors.

Likewise, just as you should never `throw` instead of `return Fail(...)`, when dealing
with promises, you should never `reject(...)` when you can `resolve(Fail(...))`. The
only time you should use `reject` is when you'd use `throw` in synchronous code.

Some programmers actually disagree with this sentiment, trying to conflate `reject` to
mean both `return Fail(...)` and `throw new Error`, using something like `bluebird`'s
`OperationalError` for the `Fail` case. The author of this package disagrees with this
approach because different concerns should be handled differently. Those who disagree
with the author say that not handling `Fail`ures is an error, and so should be wrapped
in an error to force the end programmer to deal with it. This does sound like a good
idea (and you'll notice that in Rust it's a compile time error to not handle a Result),
but you trade off readability and speed (making a stacktrace is not *cheap*). Should you
really need to make sure your user does something with failures, making them errors is
a heavy-handed approach, and it does work.
