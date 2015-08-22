// functional math lib
// ===================

// This is a short experiment showing the usage and implementation of a simple math lib.
// The library should cover dealing with vectors and matrices.
// This small snippet only covers vector types.

// Let's first make a proposal for how the API should look like.
var demo = function (implementation) {
	'use strict';

	var { make, getX, getY, getZ, add, scale, length } = implementation;

	// Let's create 2 vectors
	var v1 = make(1, 2, 3);
	var v2 = make(4, 5, 6);

	// And add them together
	var sum = v1(add(v2));
	// In coffeescript this can be rewritten without the parentheses like so
	// `sum = v1 add v2`
	// which is the most natural way of expressing this in a language without operator overloading

	var doubleSum = sum(scale(2));
	// Again, in coffeescript this looks way better `doubleSum = sum scale 2`
	// or, in expanded form `doubleSum = (v1 add v2) scale 2`

	// So far so good, but how do we get the data back from the vector now?
	var x = doubleSum(getX);
};


// The implementation
// ------------------
window.Vec3Closure = (function () {
	'use strict';

	// The "constructor" doesn't make use of any objects,
	// `this` (and `new`), hidden state or TypedArrays.
	// Everything is bound to a value and cannot be altered.
	function make(x, y, z) {
		return function vec3(fun) {
			return fun(x, y, z);
		}
	}

	// Accessors are probably the simplest function that can be applied on a vector.
	// Notice how the vector's components are passed as arguments to the accessors.
	// The functions fed to a vector have no way of mutating the vector's contents.
	function getX(x, y, z) {
		return x;
	}

	function getY(x, y, z) {
		return y;
	}

	function getZ(x, y, z) {
		return z;
	}

	// Operations, the minimum required
	function add(that) {
		return function (x, y, z) {
			return make(
				x + that(getX),
				y + that(getY),
				z + that(getZ)
			);
		}
	}

	function scale(s) {
		return function (x, y, z) {
			return make(
				x * s,
				y * s,
				z * s
			);
		}
	}

	function length(x, y, z) {
		return Math.sqrt(x * x + y * y + z * z);
	}

	// Wait, there's no need to copy vectors since they are immutable
	function copy(x, y, z) {
		// It would, actually, be just an alias for the constructor
		return make(x, y, z);
	}

	// Export it all
	return { make, getX, getY, getZ, add, scale, length };
})();

// It's possible to generalize the above scheme for vec2, vec4 and matrices.
// For now let's feed the demo with our current implementation.
demo(window.Vec3Closure);