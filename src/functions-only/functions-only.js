// you only need functions
// =======================

// This experiment shows how to define "high level" language features using a very small subset of JavaScript.
// We'll only make use of functions, conditionals and the `===` operator (yes, the title is a bit incomplete).
(function () {
	'use strict';

	// symbols
	// -------

	// Use this to create any distinguished symbols.
	// A shorter way would have been to create a new empty object `{}`
	// or use ES2015 symbols.
	function makeSymbol() {
		return function() {};
	}

	// data structures
	// ---------------

	// We'll use pairs as the basic building block for our data structures.
	// You can build linked lists out of pairs (and yes, pairs are just functions).
	// Arrays, queues and stacks can just be linked lists.
	// With pairs only, you can also build binary trees too, but it's going to be a bit clunky.
	// Pairs only have 2 members while binary tree nodes have 3 members (a left child, a right child and node data).
	// A node can be represented as 2 pairs like so `(left-child, (data, right-child))`.
	// An even simpler way of building binary trees is to just create a `makeTriple` function, similar to `makePair`.
	function makePair(a, b) {
		return function (fun) {
			return fun(a, b);
		};
	}

	function first(a, b) {
		return a;
	}

	function second(a, b) {
		return b;
	}


	// We need a distinguished symbol to serve as a starting point when creating data structures.
	// An empty list can just be NIL. A list with one element is a pair of that element and NIL.
	// Inductively, we keep nesting pairs to hold our data.
	var NIL = makeSymbol();


	// Let's see how we go about finding something in such a list.
	// Notice the use of `===` and `if`.
	function find(pair, predicate) {
		if (pair === NIL) { return NIL; }

		if (predicate(pair(first))) {
			return pair;
		} else {
			return find(pair(second), predicate);
		}
	}

	// This function exists only for debugging purposes.
	// It doesn't adhere to our rules since it uses `+` and `1`
	function length(pair) {
		if (pair === NIL) { return 0; }

		return 1 + length(pair(second));
	}


	// numbers
	// -------

	// Our second distinguished symbol.
	// There, we have defined `0` - one down, an infinity to go.
	var ZERO = makeSymbol();

	// It turns out that it's not practical to define `ONE`, `TWO`, `THREE` and so on so instead
	// we'll represent our numbers in an inductive way, as list-like structures.
	// Notice the similarity with the `makePair` function.
	function succ(n) {
		return function (fun) {
			return fun(n);
		}
	}

	function next(n) {
		return n;
	}


	// This function converts a JS number to our own representation.
	// It exists mainly for convenience and is just a more compact
	// way of writing `succ(succ(succ(ZERO)))`
	function encodeNumber(n) {
		if (n === 0) {
			return ZERO;
		} else {
			return succ(encodeNumber(n - 1));
		}
	}

	// Another function added solely to help debugging.
	function decodeNumber(n) {
		if (n === ZERO) {
			return 0;
		} else {
			return 1 + decodeNumber(n(next));
		}
	}

	// What would we do without some basic operations?
	function add(m, n) {
		if (m === ZERO) {
			return n;
		} else {
			return succ(add(m(next), n));
		}
	}

	// We haven't defined negative numbers;
	// this function has undefined behavior if *m* is greater than *n*
	function sub(m, n) {
		if (n === ZERO) {
			return m;
		} else {
			return sub(m(next), n(next));
		}
	}

	function mul(m, n) {
		if (m === ZERO) {
			return ZERO;
		} else if (m(next) === ZERO) {
			return n;
		} else {
			return add(mul(m(next), n), n);
		}
	}


	console.log(decodeNumber(succ(succ(succ(ZERO)))));

	console.log(decodeNumber(encodeNumber(5)));

	console.log(decodeNumber(add(encodeNumber(4), encodeNumber(8))));

	console.log(decodeNumber(mul(encodeNumber(4), encodeNumber(9))));
})();