<!-- @@@title:Multiple-dispatch implementations & benchmarks@@@ -->

# Multiple-dispatch implementations & benchmarks

[This project](https://github.com/adrianton3/dispatchbench) explores three 
different implementations of multiple-dispatch in JavaScript. As they are all 
seemingly identical from the outside, we want to know which one is fastest, 
so we ran some benchmarks. The example chosen to illustrate the implementations 
is what I'm going to refer to as the *Box-Sphere problem*:

There are 2 constructors, *Box* and *Sphere*. There is an *intersects* 
multimethod which takes 2 arguments of the aforementioned types. This method 
should be present on both boxes and spheres and should return whether the 2 
objects intersect or not. Based on the type of the arguments we'd like to 
dispatch to the appropriate *intersects* method as there are different 
intersection tests to be performed depending on the object types.


## The implementations:

### Native-dispatch based

This approach uses multiple single-dispatch calls. All the *intersects...* 
methods are automatically generated and added to the prototypes of the 
constructors. Only the *intersects* method is to be used by the API consumer.
The intermediate *intersects...* methods are an implementation artifact.

```js
function Box () {}

Box.prototype.intersects = function (that) {
	that.intersectsBox(this)
}

Box.prototype.intersectsBox = function (that) {
	console.log('box x box')
}

Box.prototype.intersectsSphere = function (that) {
	console.log('box x sphere')
}


function Sphere () {}

Sphere.prototype.intersects = function (that) {
	that.intersectsSphere(this)
}

Sphere.prototype.intersectsBox = function (that) {
	console.log('sphere x box')
}

Sphere.prototype.intersectsSphere = function (that) {
	console.log('sphere x sphere')
}
```

### String-Map based

This approach is based on a map from string keys to methods. 
The keys are generated based on the constructors of the arguments passed to 
the multimethod. The mapping for the *Box-Sphere* example would look like this:

```js
'Box-Box'       -> function () { console.log('box x box') }
'Box-Sphere'    -> function () { console.log('box x sphere') }
'Sphere-Box'    -> function () { console.log('sphere x box') }
'Sphere-Sphere' -> function () { console.log('sphere x sphere') }
```

### Map-Map based

In this approach the methods are the leaves of a tree. Each node has its 
children indexed by constructors.
The tree structure for the *Box-Sphere* example would look like this:

```js
Box ->
	Box ->    function () { console.log('box x box') }
	Sphere -> function () { console.log('box x sphere') }
Sphere ->
	Box ->    function () { console.log('sphere x box') }
	Sphere -> function () { console.log('sphere x sphere') }
```

## Benchmarks

To see which approach runs fastest, we test them on a 5-way dispatch. 
There are 5 constructors and each of them has a method with 4 dynamic
parameters. The 5th dispatch is the object on which we invoke the method 
initially. 

The benchmarks were run on the latest versions of Chrome, Firefox and Edge as 
of 2017-03-26 and you can see them in the tables below:

Chrome Version 59.0.3043.0 dev (64-bit)

| Implementation  | Ops/sec |
|:--------------- | -------:|
| native-dispatch |   59.57 |
| string-map      |     175 |
| map-map         |     397 |

Firefox Version 55.0a1 (2017-03-25) (64-bit) 

| Implementation  | Ops/sec |
|:--------------- | -------:|
| native-dispatch |   36.75 |
| string-map      |   44.24 |
| map-map         |   46.85 |

Edge Version 38.14393.0.0 

| Implementation  | Ops/sec |
|:--------------- | -------:|
| native-dispatch |   24.22 |
| string-map      |   44.92 |
| map-map         |   46.86 |

Don't mind the difference in speed between browsers - that's not what we're
interested in measuring. Instead notice the relative speed of the 
implementations on the same browser.

The implementations rank the same in all browsers. It's very interesting 
to note that the native dispatch based implementation is the slowest. 
Apparently it's less expensive to lookup in a *Map* than to do a dynamic
dispatch.