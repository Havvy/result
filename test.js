// const sinon = require("sinon");
const assert = require("assert");
// const assert = require("better-assert");
// const equal = require("deep-eql");
const inspect = require("util").inspect;
const format = require("util").format;

const Result = require("./result");
const Ok = Result.Ok;
const Fail = Result.Fail;

describe("Result", function () {
    it("constructs Ok values", function () {
        var result = Ok(42);

        assert(result.isOk());
        assert(!result.isFail());
        assert(result.ok() === 42);

        try {
            result.fail();
            assert(false);
        } catch (e) {
            assert(e instanceof TypeError)
        }

        var resultAsArray = result.toArray();
        assert(resultAsArray.length === 1 && resultAsArray[0] === 42);
    });

    it("constructs Fail values", function () {
        var result = Fail("I did bad things.");

        assert(result.isFail());
        assert(!result.isOk());
        assert(result.fail() === "I did bad things.");

        try {
            result.ok();
            assert(false);
        } catch (e) {
            assert(e instanceof TypeError)
        }

        assert(result.toArray().length === 0);
    });

    it("maps Ok values", function () {
        var out = Ok(42)
        .map(function (n) {
            return n + 1;
        })
        .ok();

        assert(out === 43);
    });

    it("doesn't map Fail values", function () {
        var out = Fail(0)
        .map(function (n) {
            return n + 1;
        })
        .fail();

        assert(out === 0);
    });

    it("doesn't mapFail Ok values", function () {
        var out = Ok(1)
        .mapFail(function (n) {
            assert(false);
        })
        .ok();

        assert(out === 1);
    });

    it("does mapFail Fail values", function () {
        var out = Fail(2)
        .mapFail(function (n) {
            return n + 2;
        })
        .fail();

        assert(out === 4);
    });

    it("unwraps Ok values", function () {
        assert(Ok(true).unwrapOr(false) === true);
        assert(Ok(true).unwrapOrElse(function () { return false; }));
    });

    it("returns the Or or calls OrElse value when unwrapping a Fail()", function () {
        assert(Fail(false).unwrapOr(true));
        assert(Fail(false).unwrapOrElse(function (f) { assert(f === false); return true;}) === true);
    });

    it("can be or-ed", function () {
        var resultTrue = Ok(true);
        var resultFalse = Ok(false);
        var failNull = Fail(null);
        var failUndef = Fail(undefined)

        assert(resultTrue.or(resultFalse) === resultTrue);
        assert(resultTrue.or(failNull) === resultTrue);
        assert(resultTrue.or(failUndef) === resultTrue);
        assert(resultFalse.or(resultTrue) === resultFalse);
        assert(resultFalse.or(failNull) === resultFalse);
        assert(resultFalse.or(failUndef) === resultFalse);
        assert(failNull.or(resultTrue) === resultTrue);
        assert(failNull.or(resultFalse) === resultFalse);
        assert(failNull.or(failUndef) === failUndef);
        assert(failUndef.or(resultTrue) === resultTrue);
        assert(failUndef.or(resultFalse) === resultFalse);
        assert(failUndef.or(failNull) === failNull);
    });

    it("can be and-ed", function () {
        var resultTrue = Ok(true);
        var resultFalse = Ok(false);
        var failNull = Fail(null);
        var failUndef = Fail(undefined)

        assert(resultTrue.and(resultFalse) === resultFalse);
        assert(resultTrue.and(failNull) === failNull);
        assert(resultTrue.and(failUndef) === failUndef);
        assert(resultFalse.and(resultTrue) === resultTrue);
        assert(resultFalse.and(failNull) === failNull);
        assert(resultFalse.and(failUndef) === failUndef);
        assert(failNull.and(resultTrue) === failNull);
        assert(failNull.and(resultFalse) === failNull);
        assert(failNull.and(failUndef) === failNull);
        assert(failUndef.and(resultTrue) === failUndef);
        assert(failUndef.and(resultFalse) === failUndef);
        assert(failUndef.and(failNull) === failUndef);
    });

    it("can orElse a Ok into itself", function () {
        var result = Ok(true);
        assert(result.orElse(function (f) { assert(false); }) === result);
    });

    it("can orElse a Fail into a new result", function () {
        assert(Fail(true).orElse(function (f) { assert(f === true); return Ok(true); }).ok() === true);
    });

    it("can andElse a Ok into a new result", function () {
        assert(Ok(true).andThen(function (v) { assert(v === true); return Ok(10); }).ok() === 10);
    });

    it("can andElse a Fail into itself", function () {
        var result = Fail("x");
        assert(result.andThen(function (v) { assert(false); }) === result);
    });

    it("has methods usable as functions", function () {
        var result = Ok(true);
        var flag = false;

        Result.map(result, function (value) {
            console.log("blah");
            assert(value === true);
            flag = true;
        });

        assert(flag === true);
    });

    it("has methods usable as functions that return", function () {
        assert(Result.ok(Ok(true)) === true);
    });
});