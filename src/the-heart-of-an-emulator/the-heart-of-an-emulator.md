<!-- @@@title:The heart of an emulator@@@ -->
<!-- @@@extraCss:../../static/table.css@@@ -->

# The heart of an emulator

Emulators and interpreters have at their core a mechanism for dispatching instructions to
appropriate subroutines - the main loop.
There are usually several ways of implementing this loop, but it's not always clear which implementation gives 
the best results in terms of performance.
Performance is vital, as this code is executed for every instruction. As a result, it severely 
impacts the speed of the emulator more than anything else.

[This project](https://github.com/adrianton3/brainfuckbench) compares several different styles of 
writing the main loop for an emulator or interpreter.
We will not attempt to do a full-blown implementation of a console architecture. Instead, we will focus on 
brainfuck - it is a small enough language to allow for multiple implementations without much effort.

The same techniques of writing the main loop can be applied to other interpreters and emulators.

All implementations consist of a compile method and an execute method:

+ The compile method is largely the same and not that interesting for the first 3 approaches only.
In the case of brainfuck, the compile method does very little work. It transforms chars (`+-[]><`) into
objects with numeric opcodes and pre-calculates the jump offsets for the `[]` instructions. The 4th approach 
is doing all of the work in the compile method.

+ The execute method does exactly what its name says - it takes a compiled program and executes it. We're primarily 
interested in the speed of the execute method, but the speed of the compile method has also been tracked.



The different implementations thus far are:

## Switch based

This is the most common approach. The main loop looks something on the lines of:

```javascript
while (running) {
	instruction = fetchInstruction()

	switch (instruction) {
		case 0x00: // ...
		case 0x01: // ...
		case 0x02: // ...
		case 0x03: // ...
	}
}
```

This is probably the most straightforward way of writing the main loop.

The main disadvantage with this approach is that it's very non-modular and hard to maintain.
The switch statement is not that big in the case of brainfuck but it becomes unwieldy for any
interpreter/emulator with more instructions.


## Binary-search based

This is similar to the switch based approach except that the number of comparisons
required until the correct case is found is logarithmic at worst. The
code required by this pattern can reach unmanageable sizes:

```javascript
while (running) {
	instruction = fetchInstruction()

	if (instruction < 0x02) {
		if (instruction < 0x01) {
			// 0x00 ...
		} else {
			// 0x01 ...
		}
	} else {
		if (instruction < 0x03) {
			// 0x02 ...
		} else {
			// 0x03 ...
		}
	}
}
```

Looking at the benchmark, this seems to be the fastest approach on Chrome (apart from the transpiler approach).
On Firefox, however, the switch based implementation is faster.
 
Maintaining code in this style is nearly-impossible to do by hand. All of this structure
should instead be generated automatically.


## Mapping/functions based

This is based on a mapping from instructions to functions. The gist of it is:

```javascript
map = new Map([
	[0x00, (state) => { /* ... */ }],
	[0x01, (state) => { /* ... */ }],
	[0x02, (state) => { /* ... */ }],
	[0x03, (state) => { /* ... */ }],
])

while (running) {
	const instruction = fetchInstruction()
	const handler = map.get(instruction)
	handler()
}
```

This is the most modular of all alternatives.
Unlike the previous 2 approaches, the mapping between opcodes and handler is dynamic. The
map can be build modularly, for example if you separate pointer instructions in their own file in the case of 
brainfuck.

```javascript
// pointer-ops.js

export function register (map) {
	map.set('>', (state) => { state.pointer++ })
	map.set('<', (state) => { state.pointer-- })
}
```

Perhaps unsurprisingly, this came out to be the slowest approach.


## Using a transpiler

Some languages/machines fare well to a static recompilation. This needs a more ample "compilation" phase, 
but does away with the main loop altogether. In brainfuck's case `+-` trivially translate to increments
and decrements of memory cells, `><` to increments/decrements of the memory pointer and `[]` are 
rewritten as while loops and so on.

By far the fastest to execute. This comes at no surprise since the dispatching mechanism is
completely absent. All the CPU time is spent on executing instructions. What's more is that
in the case of JS the transpiled code has the opportunity to be optimized by the runtime.

This approach works for brainfuck but is usually not an option for other instruction sets.
Old consoles can alter their code as they run, so transpiling up ahead is not a solution anymore.
The only solution in that case would be a JIT transpiler, but that is a topic for a different article.


## Results

The benchmarks were run on the latest versions of Chrome and Firefox as of 2016-07-21 and you can see 
them in the tables below. 

Chrome Version 53.0.2785.21 dev (64-bit)

| Implementation | Ops/sec   |
|:-------------- | ---------:|
| switch         |   896,833 |
| binary-search  |   940,957 |
| functions      |   247,434 |
| transpiler     | 3,263,853 |

Firefox Version 50.0a1 (64-bit)

| Implementation | Ops/sec   |
|:-------------- | ---------:|
| switch         |   731,813 |
| binary-search  |   665,093 |
| functions      |   206,046 |
| transpiler     | 1,323,494 |

The difference in performance between browsers is irrelevant; what's important for this article is the 
relative speed of the implementations on the same browser. The clear winner is the transpiler based approach, 
while the slowest approach in both browsers is the function based one.