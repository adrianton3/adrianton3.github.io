<!-- @@@title:Writing a JavaScript interpreter@@@ -->

# Writing a JavaScript interpreter

I've recently implemented a JS interpreter in CoffeeScript and I figured that might be something interesting to share.


## Motivation

We already have more than enough JS engines; of course, I have no plans on rolling my own - I've
undergone this purely for educational reasons.

If your purpose is to build something in JS then you rarely go exploring into the depths and quirks
of the language. You follow the best practices and stick to the safe way of doing things.
You'd have to make a deliberate effort to write things in a totally unconventional/non-canon way.
After spending some time reading the official language specification I'd say I only saw about 10% of
the language's semantics being used in the wild. Your efforts might not be met with enthusiasm
by your colleagues. Imagine defending your use of `with` for educational purposes.

Another reason would be that I want to stop writing JS altogether and transition to something better (ClojureScript).
I thought this would be my last effort into learning something about JS. MDN is a very rich resource of JS
but it's incomplete. I thought that by reading the spec and following it to implement an interpreter I can
finally say "yes, I know JS, the good parts and the weird ones".

A third reason is that I've fiddled before with toy lisp interpreters and transpilers
([mupl-c](https://github.com/adrianton3/mupl-c), [muplex](https://github.com/adrianton3/muplex))
and have been writing interpreters in general for a long time
([COIN v2](https://web.archive.org/web/20070322220942/http://www.donebyme.go.ro/sources/coin10.pas.html)).
These are neat but they're not "real" languages used by people (heck, I don't even use them) - JS is.


## Scope

First and foremost the evaluator should be metacircular. That's something most "serious" compilers/interpreters out there do.

But this shouldn't be the only goal as I could deliberately write the interpreter using a very small subset of the language.
The evaluator should implement core language features: a couple of operators, functions (and closures),
dynamic dispatching, the prototype chain and a minimal amount of built-ins - I will probably need arrays and a few of
their methods.

I have avoided some constructs on purpose, like `for ... in`, `eval`, `Function.prototype.toString`, exceptions,
boxed primitives, `break`, `switch` or labels. I also did not add support for strict AND non strict mode.
Non-strict mode still exists for backwards compatibility reasons most probably.

Implementing a regular expression engine is out of the question too. This would be just as big if not bigger
than the whole JS interpreter. It's certainly an interesting project, but perhaps for another day.

I tried not adding more built-ins than were needed. I'm sure implementing the methods of `Math` from scratch is a wonderful
challenge but it would be greatly outside the scope of this little project.


## Surpises

While implementing the semantics of a language you get to find out some things that happen in the background.
For the programmer, as a user of a language, calling a function is just a plain pair of parentheses `()` but
in the background it looks more like launching a rocket:

 + create a new scope
 + if the function was invoked as a method, bind `this` to whatever invoked it
 + if the function has a name then add it to the new scope
 + bind `name` to the function's name
 + bind `arguments` to an array-like object holding all arguments
 + create entries in the scope for all local function declarations
 + create entries in the scope for all vars in this scope and bind them to `undefined`
 + finally execute the function's body

...and I'm sure I missed some fine details from the spec.

Unfortunately, the standard does not mention why some decisions were taken.
Some apparently inconsistent or wacky features of JS were probably motivated by some very good reasons.
Take for example `Array.prototype.toString` which is using the `join` method on the array in question.


## Decisions, decisions

Because the evaluator has to be able to evaluate itself and because I don't plan on implementing a ton of language
features I did not have any "nice" way of managing the modules of the application.
RequireJS and the likes are not good candidates since they tend to call methods on the DOM.

Unfortunately, fancy transpilers are out of the question because these tend to output fairly unorthodox code.
The code output by ClojureScript tends to be huge and its startup time when running directly in the browser is noticeably slow.

I don't want to write it in vanilla ES5 because it's a pain. CoffeeScript however fits in the sweet spot.
It's nice enough to program in and it doesn't generate too wild code. The only language feature I had to implement
because of CoffeeScript alone is `==` and `!=` as it's used by the `?` operator.

Since I don't plan to add support for regular expressions that means that the parser used for the language
(esprima) cannot be evaluated. This means that the input to jinter running in jinter will have to be an AST,
as a nested object/array structure, and not a string.


## Testing

This is one of those fortunate cases where you can test your implementation against an already existing
and heavily battle-tested implementation. I'm talking about `eval` of course. I've made the list of unit tests
viewable in a [pretty format](http://adrianton3.github.io/jinter/demo/src/demo.html). They're small snippets of
JS code meant to test if specific aspects of the language work correctly.

Some of these tests are however less than ideal - take, for example, the test that verifies if assignment works:

`var a = 123; a`

Jinter returns `123` and so does the browser's `eval`, but what makes this test "bad" is that it depends on working
`var` statements and variable lookups. If either of these break then this test fails as well.
I don't know how you can properly test some features that usually come in pairs like
getters/setters, the prototype chain without assignments, member lookup without object expressions or member set and more.

This snippet-testing served its purpose perfectly in the beginning but at some point you need to bring in bigger tools.
On your own you can only think of so many snippets and after a point these "microprograms" get tedious to write and
that's why you turn to automatic testing.


### Fuzz testing

The first fuzzer I implemented was very simple - it would generate expressions using only primitives and a few
arithmetic operators, but, as simple as it was, it found a bug immediately.
Jinter would crash if you wanted to add, subtract or multiply booleans.
This is the sort of thing you never test as a human - it's part of the 90% of the language that we ignore daily.
It doesn't add much value if I fix the bug - I didn't want to multiply booleans anyway! But, if I want to develop
and use the fuzzer any further, then this bug needs to be fixed. It would be harder to make a smart fuzzer
that doesn't multiply booleans than to just fix the bug in the interpreter.

The second bug unearthed by the fuzzer was reported for an expression of the following form `[1, null, 2] + ''`.
Can you guess what this evaluates to? If so, hats off to you. It turns out that `null` or `undefined` become
the empty string when stringified by `Array.prototype.toString` and implicitly `Array.prototype.join`.
This is something unexpected as `null` and `undefined` become `"null"` and `"undefined"` when they are
stringified by the `String` function.
The specification mentions this, but it sadly does not mention the reason why this behaviour came to be.


## In the near future

Jinter is "done" for now as it passes all tests, all tests while being run by itself and anything that
the fuzzer throws at it. Any future additions/modifications done to it need to preserve this. The most likely feature
to be added now is the ability to call methods on primitives.

Better/more code documentation is something any complete project should have, and I'll get around to that at some point.