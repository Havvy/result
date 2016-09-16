const inspect = require("util").inspect;

const Ok = function (t) {
    const Result = Object.create(methods);
    Result.is_ok = true;
    Result.value = t;
    return Result;
};

const Fail = function (f) {
    const Result = Object.create(methods);
    Result.is_ok = false;
    Result.value = f;
    return Result;
};

const methods = {
    ok: function (/*this,*/ errorMessage) {
        if (this.is_ok) {
            return this.value;
        } else {
            if (errorMessage) {
                throw new TypeError(errorMessage);
            } else {
                throw new TypeError("Attempted to unwrap Ok(t) but got Fail(f) instead.");
            }
        }
    },

    fail: function (/*this,*/ errorMessage) {
        if (this.is_ok) {
            if (errorMessage) {
                throw new TypeError(errorMessage);
            } else {
                throw new TypeError("Attempted to unwrap Fail(f) but got Ok(t) instead.");
            }
        } else {
            return this.value;
        }
    },

    isOk: function (/*this*/) {
        return this.is_ok;
    },

    isFail: function (/*this*/) {
        return !this.is_ok;
    },

    // (Result<T, F>, T -> T') -> Result<T', F>
    map: function (/*this,*/ f) {
        if (this.is_ok) {
            return Ok(f(this.value));
        } else {
            return this;
        }
    },

    // (Result<T, F>, F -> F') -> Result<T, F'>
    mapFail: function (/*this,*/ f) {
        if (this.is_ok) {
            return this;
        } else {
            return Fail(f(this.value));
        }
    },

    // TODO(havvy): When generators are in Node, add .generator(), analogous to .iter()

    // (Result<T, F>, A) -> Result<_, F> | A
    // where A should := Result<T, F>
    and: function (/*this,*/ rhsResult) {
        if (this.is_ok) {
            return rhsResult;
        } else {
            return this;
        }
    },

    // (Result<T, F>, A) -> Result<T | _> | A
    // where A should := Result<T, F>
    or: function (/*this,*/ rhsResult) {
        if (this.is_ok) {
            return this;
        } else {
            return rhsResult;
        }
    },

    // (Result<T, F>, FN) -> Result<T, F> | A
    // where FN := T -> A
    // where A should := Result<T', F>
    andThen: function (/*this,*/ f) {
        if (this.is_ok) {
            return f(this.value);
        } else {
            return this;
        }
    },

    // (Result<T, F>, FN -> Result<T, F> | A
    // where FN := F -> A
    // where A should := Result<T, F'>
    orElse: function (/*this,*/ f) {
        if (this.is_ok) {
            return this;
        } else {
            return f(this.value);
        }
    },

    // (Result<T, F>) -> TList
    // where TList := [T]
    // such that TList.length === 0 || T.List.length === 1
    toArray: function (/*this*/) {
        if (this.is_ok) {
            return [this.value];
        } else {
            return [];
        }
    },

    // (Result<T, F>, A) -> T | A
    // where A should := T
    unwrapOr: function (/*this,*/ defaultValue) {
        if (this.is_ok) {
            return this.value;
        } else {
            return defaultValue;
        }
    },

    // (Result<T, F>, F -> A) -> T | A
    // where A should := T
    unwrapOrElse: function (/*this,*/ defaultFn) {
        if (this.is_ok) {
            return this.value;
        } else {
            return defaultFn(this.value);
        }
    },

    // Fn(Result<T, F>, {Ok: function (value: T) -> void, Fail: function (failure: F) -> void}) -> void
    match: function (/*this,*/ matchBlock) {
        if (this.is_ok) {
            return matchBlock.Ok(this.value);
        } else {
            return matchBlock.Fail(this.value);
        }
    },

    /// https://nodejs.org/api/util.html#util_custom_inspect_function_on_objects
    // Fn(Result<T, F>, Number, InspectOpts) -> String
    inspect: function (/*this,*/ depth, opts) {
        var tag = this.is_ok ? "Ok" : "Fail";

        if (depth < 0) {
            return opts.stylize("[" + tag + "]", "boolean");
        }

        var recurseOpts = {};
        Object.keys(opts).forEach(function (key) {
            recurseOpts[key] = opts[key];
        });
        recurseOpts.depth = opts.depth === null ? null : opts.depth - 1;

        return opts.stylize(tag, "boolean") + "( " + inspect(this.value, recurseOpts) + " )";
    },

    // Fn(Result<T, F>, Fn(String) -> void, InspectOpts)
    debug: function (/*this,*/ logfn, inspectOpts) {
        logfn(inspect(this, inspectOpts));
    },

    // Fn(Result<T, F>, Fn(String) -> void, InspectOpts)
    debugOk: function(/*this,*/ logfn, inspectOpts) {
        if (this.is_ok) {
            logfn(inspect(this.value, inspectOpts));
        }

        return this;
    },

    // Fn(Result<T, F>, Fn(String) -> void, InspectOpts)
    debugFail: function(/*this,*/ logfn, inspectOpts) { 
        if (!this.is_ok) {
            logfn(inspect(this.value, inspectOpts));
        }

        return this;
    }
};

module.exports = {
    Ok: Ok,
    Fail: Fail,
};

const methodToFunction = function (method) {
    return function () {
        var context = arguments[0];
        var args = Array.prototype.slice.call(arguments, 1);
        return method.apply(context, args);
    };
};

Object.keys(methods).forEach(function (key) {
    // NOTE(bbqsrc): Breaks require in repl
    if (key === "inspect") {
      return;
    }

    var method = methods[key];
    module.exports[key] = methodToFunction(method);
});
