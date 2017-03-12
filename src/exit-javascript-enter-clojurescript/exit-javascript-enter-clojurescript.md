<!-- @@@title:Exit JavaScript, enter ClojureScript@@@ -->

# Exit JavaScript, enter ClojureScript

I've been programming in JavaScript/CoffeeScript for more than 6 years, and have 
recently transitioned to ClojureScript (CLJS). In this article I'll share a few 
pieces of "wisdom" I've gathered after writing 3 small-ish projects in CLJS. This 
should help you if you're just getting started with CLJS or thinking of switching.
The article covers tips about the initial setup, the basics, and some things that 
CLJS does differently/better than JS.

To make the most of this, you should have at least some minimal exposure to 
Lisp/Scheme - enough to get over the *parentheses are on the 'wrong' side* deal.


## Project setup

Like in modern JS development, you'll first need a build tool. For starters, I
recommend *leiningen* - it's a solid build tool, easy to set up and use. You can 
get *leiningen* from [this link](http://leiningen.org/).

You'll notice there are a bunch of *leiningen* new project templates to choose 
from. You can find a list [here](https://clojars.org/search?q=lein-template).
The minimal setup is provided by the *mies* template.

```
lein new mies <project-name>
```

This should create a folder structure that contains a `src` and a `scripts` folder.
There are 3 main scripts you will interact with:

 + `build` simply compiles the project. The output will be available in `/out`
 
 + `watch` compiles the whole project when it's launched and this takes a 
couple of seconds; subsequent compilations take milliseconds. 

 + `release` compiles and optimizes the output for use in production.
You can easily see the difference between the two if you open 
*scripts/build.clj* and *scripts/release.clj* 

Once you get comfortable with *leiningen*, you might want to check out more 
advanced tools, like [figwheel](https://github.com/bhauman/lein-figwheel/wiki/Quick-Start)


## Basics

Unlike in JS, arithmetic operators in CLJS take as many operands as you supply.

```clojure
(+)
; returns 0

(+ 12)
; returns 12

(+ 12 34)
; returns 48

(+ 12 34 56)
; returns the result of 12 + 34 + 56
```

Operators are not special syntactic constructs, but just plain identifiers.
That is, `+` resolves to a function - we can pass it around and treat it like any 
other function. If you want the sum of an array in JS you have to either use 
*lodash*'s `_.sum` or a native *reduce*:

`[11 22 33].reduce((sum, number) => sum + number, 0)`

In CLJS, the same thing is almost half as short to write:

`(reduce + 0 [11 22 33])`

Also, since `+` is a function it responds nicely to `apply` - it even handles the
0-operands case for you.

`(apply + [11 22 33])` is extremely terse and readable.

The JS operator `%` is called `rem` in CLJS; there is also an integer division 
operator, named `quot`. The `%` character has another purpose which will be 
covered later.

A function expression looks like this in CLJS:

`(fn optional-name [a b c] body)`

While a function definition looks like this:

`(defn required-name [a b c] body)`

Where *body* is one or more expressions. Functions return whatever the last
expression of body evaluates to. `(defn ...)` is just a shorthand for 
`(def ... (fn ...))`.

Functions with variable number of arguments are done like this:

`(fn [one two & rest] body)`

And finally, calling functions is done like so `(my-fun a b c)`.

One thing that doesn't appear in many starter tutorials is the shorthand for 
function expressions:

`#(* (+ %1 %2) %3)`

One limitation with the `#()` shorthand is that it doesn't work  
for nested functions. The syntax could allow us to declare nested functions 
in shorthand, but referencing parameters would be painful and confusing.

Another limitation with this shorthand is that we can't have primitives
as the body. `#(123)` is not valid. `#(123)` would expand to `(fn [] (123))`
which would fail because 123 is not callable. For the same reason we can't
have a function `#([1 2 3])`.

If you need a function to simply return a value you can use the 
function `constant` instead:

`(constant 123)` - a function that always returns *123*.


## Collections

Collections are an important part of the language; unless you're computing pi's 
digits, sooner or later you'll make use of collections. CLJS comes out of the box 
with these data structures:

 + linked lists `'(1 2 3)`
 
 + vectors `[1 2 3]`
 
 + maps `{:a 123 :b 321}`
 
 + sets `#{1 2 3}`
 
Alternatively, vectors can be constructed with `vec`, maps with `hash-map` and
sets with `hash-set`. 

Something that is visible right away is that CLJS has more syntax for collections 
than JS. Although ES6 has tons of new syntax, unfortunately none of that is for 
the new set and map.

### Immutable by default

When you perform an operation on a collection you might also want to 
keep a snapshot of the previous version. JS doesn't have persistent collections, 
so this is when cloning comes in handy. The only problem is that JS doesn't come
with any *deep-clone* method out of the box, and you have to either roll your own, 
or resort to one of the many, slightly different *deep-clone* methods provided by 
third-party libraries. 

What's more, JS doesn't even have a uniform way to *shallow-clone* its built-in 
collections. You can clone arrays with `.slice`, but it's not exactly a dedicated 
clone method. In ES2015+ you can use the newer `[...original]`.

What about cloning objects? There's the awkward `Object.assign({}, original)` or 
the newer `{ ...original }`

Unfortunately, the all-new Map and Set don't come with any clone method.
The best you can do is `new Map(original.entries())` and
`new Set(original.values())`. Notice the entries/values asymmetry.
The ES2015+ alternatives are shorter and symmetrical `new Map([...original])`
and `new Set([...original])`.

None of this is an issue in CLJS, since its collections are immutable by default.
This means you never need to *deep-clone* anything anymore. There's also no reason
to use *Immutable JS* and the likes - the functionality is there out of the box!
 
A side win of having immutable collections is that comparing
for equality can be fast and trivial; for example `[1 2 #{:a :b :c}]` is equal 
to `[1 2 #{:a :b :c}]`. You don't have to use slow third party deep-equals 
methods.

This also means that collections can be used as keys for maps and sets.
In contrast, JS uses the strict equality operator (`===`) in this situation, 
which is not always what you want. Take for example this bit of code:

```js
// I have a set points on a plane
points = new Set

// ...to which I add a point 
points.add({ x: 123, y: 321 })

// and I want to see if the point is in the set
points.has({ x: 123, y: 321 })
```
The last call returns *false* because keys are compared by reference and not
by value. The equivalent in CLJS would be:

```clojure
(let [empty #{}
      points (conj empty { :x 123 :y 321 })]
 (contains? points { :x 123 :y 321 })
```

which returns *true*; a much more natural/expected response.

The same CLJS collections can also be made mutable. Sometimes this is more 
appropriate for performance or convenience reasons. The methods which mutate
collections are easy to spot as their name ends in `!`: `conj!`, `assoc!`, etc. 

### Rich and uniform collection api

Since you have to work with collections a lot, it's important that the api for 
basic interactions is as uniform and predictable as possible. This is fortunately 
true of CLJS, but you can't say the same about JS. Here are some examples.

ES6 brought along proper maps and sets - no longer did we have to abuse JS 
objects and, well, some things weren't even possible before: keys would always
be coerced to strings. Unfortunately map and set don't have a very rich or 
consistent api.

The `count` function in CLJS returns the number of elements of any collection.
If you want to do the same thing in JS, you have to use `length` for arrays 
and `size()` for maps/sets. What's more, `length` is a property, while `size` 
is a function.

Adding data to collections is also straight-forward operation in CLJS, where
you can use `conj`.

```clojure
(conj (list 11 22 33) 44) 
; (list 44 11 22 33)

(conj [11 22 33] 44)
; [11 22 33 44]

(conj {:a 11 :b 22} [:c 33])
; {:a 11 :b 22 :c 33}

(conj #{11 22 33} 44)
; #{11 22 33 44}
```

`conj` adds elements at the beginning or end of different data structures, depending 
on whichever is fastest. In the case of lists, elements are added at the beginning, 
while vectors get elements added at the end. There are, of course special functions 
for appending/inserting to specific positions in collections where position is 
relevant.

By contrast, in JS you have `add` for sets, `set` for maps, `push` for arrays
and member assignment for objects.

How about checking if an element is in a collection?
In CLJS we have `contains?` for that. The `?` at the end indicates that this function
is expected to return a boolean. Compare this with JS and its `includes` for arrays 
(which is named like that only for [historical reasons](https://esdiscuss.org/topic/having-a-non-enumerable-array-prototype-contains-may-not-be-web-compatible)),
`has` for maps/sets and `hasOwnProperty` for objects.

All the aforementioned collections support map/filter/reduce/some/every and so on
in CLJS. In JS map/set don't implement any more than forEach.
In fact, CLJS comes out of the box with a collection api full of the goodies
you've come to use and love from the likes of *underscore*/*lodash*.

One interesting omission from the collections api is `zip`.
There is no need for zip because map in CLJS can take multiple collections.
Map will not provide the index to the mapping function as it does in JS.
But it's easy to supply it yourself by using `range`:

`(map vec collection (range))`

where `vec` is the constructor for vectors.


## Outro

This article initially intended to give a brief orientation guide for JS developers 
who want to try out CLJS. However, it quickly turned into a longer and more detailed 
comparison between the languages, and that's why I decided to cover only some points 
here, and leave the rest for another article. CLJS is a very rich and interesting
language and some of things that I want to mention in the coming article are dealing 
with mutable state, JS interoperability and macros.