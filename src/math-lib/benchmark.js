(function () {
	'use strict';

	var suite = new Benchmark.Suite;

	var externalClosure = 0;
	var externalObject = 0;
	var externalArray = 0;

	(function () {
		var { make, getX, getY, getZ, add, scale, length } = window.Vec3Closure;

		suite.add('closure based', function () {
			var a = make(1, 2, externalClosure);
			var b = make(externalClosure, a(getZ), 3);
			var c = a(scale(1 / b(length)));
			var d = c(add(a));
			externalClosure = Math.abs(d(getX) - d(getY) + d(getZ));
		});
	})();

	(function () {
		var Vec3 = window.Vec3Object;

		suite.add('object based, immutable', function () {
			var a = new Vec3(1, 2, externalObject);
			var b = new Vec3(externalObject, a.z, 3);
			var c = a.scale(1 / b.length());
			var d = c.add(a);
			externalObject = Math.abs(d.x - d.y + d.z);
		});
	})();

	(function () {
		var Vec3 = window.Vec3Object;

		suite.add('object based, mutable', function () {
			var a = new Vec3(1, 2, externalObject);
			var b = new Vec3(externalObject, a.z, 3);
			var c = a.clone().scaleBang(1 / b.length());
			var d = c.add(a);
			externalObject = Math.abs(d.x - d.y + d.z);
		});
	})();

	(function () {
		var Vec3 = window.Vec3Array;

		suite.add('array based, immutable', function () {
			var a = new Vec3(1, 2, externalArray);
			var b = new Vec3(externalArray, a.data[2], 3);
			var c = a.scale(1 / b.length());
			var d = c.add(a);
			externalArray = Math.abs(d.data[0] - d.data[1] + d.data[2]);
		});
	})();

	(function () {
		var Vec3 = window.Vec3Array;

		suite.add('array based, mutable', function () {
			var a = new Vec3(1, 2, externalArray);
			var b = new Vec3(externalArray, a.data[2], 3);
			var c = a.clone().scaleBang(1 / b.length());
			var d = c.add(a);
			externalArray = Math.abs(d.data[0] - d.data[1] + d.data[2]);
		});
	})();


	suite.on('cycle', function(event) {
		console.log(String(event.target));
	});

	suite.on('complete', function () {
		console.log('Fastest is ' + this.filter('fastest').pluck('name'));

		// have to use these values to make sure the functions don't get optimised away
		console.log(externalClosure);
		console.log(externalObject);
		console.log(externalArray);
	});

	suite.run({ async: true });
})();