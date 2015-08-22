window.Vec3Array = (function () {
	'use strict';

	function Vec3(x, y, z) {
		this.data = new Float32Array(3);

		this.data[0] = x;
		this.data[1] = y;
		this.data[2] = z;
	}

	Vec3.prototype.add = function (that) {
		return new Vec3(
			this.data[0] + that.data[0],
			this.data[1] + that.data[1],
			this.data[2] + that.data[2]
		);
	};

	Vec3.prototype.addBang = function (that) {
		this.data[0] += that.data[0];
		this.data[1] += that.data[1];
		this.data[2] += that.data[2];

		return this;
	};

	Vec3.prototype.scale = function (factor) {
		return new Vec3(
			this.data[0] * factor,
			this.data[1] * factor,
			this.data[2] * factor
		);
	};

	Vec3.prototype.scaleBang = function (factor) {
		this.data[0] *= factor;
		this.data[1] *= factor;
		this.data[2] *= factor;

		return this;
	};

	Vec3.prototype.length = function () {
		return Math.sqrt(
			this.data[0] * this.data[0] +
			this.data[1] * this.data[1] +
			this.data[2] * this.data[2]
		);
	};

	Vec3.prototype.clone = function () {
		return new Vec3(
			this.data[0],
			this.data[1],
			this.data[2]
		);
	};

	return Vec3;
})();