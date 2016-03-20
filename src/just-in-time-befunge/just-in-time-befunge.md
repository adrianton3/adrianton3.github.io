<!-- @@@title:A just-in-time compiler for Befunge@@@ -->

# A just-in-time compiler for Befunge

Ever since I encountered [Befunge](https://esolangs.org/wiki/Befunge) I liked how different it is from other 
programming languages - it's minimal, stack based, 2D and not exactly Turing complete. I've made 
[a game](http://jayisgames.com/review/robot-unlock.php) inspired by Befunge (but that's ancient history by now) 
and now I've written a just-in-time compiler called Befunjit.

Writing an interpreter for Befunge is fairly straight forward. However, interpreters are slow and the next best 
thing in terms of speed would be a compiler. The problem is that Befunge was deliberately designed to 
be very hard, if not impossible to compile. As far as I can tell, compiling a Befunge program fully ahead-of-time
is indeed impossible because of the `p` instruction. That doesn't mean that the idea of a compiler should be 
abandoned completely - we can still write a jit compiler.

The Befunge runtime is composed of the program counter, the stack and stack pointer and the playfield. An 
interpreter, for every step, reads an instruction at the program counter and then acts upon it. We can see some 
inefficiencies right away, as a large percentage of the instructions encountered are whitespace, which is a no-op. 
In fact, let's partition instructions into 2 sets depending on whether they involve the stack or not.
The `^<v>` and `#` instructions for instance only affect the program counter; they don't compute anything.
Their only purpose is to aid in layouting the program on the playfield.

The `"` "instruction" doesn't affect the stack in any way either and it doesn't even affect the program counter. 
All it does is change the way the board is read as it's traversed by the PC. 
A series of spaces in a straight line don't need to be interpreted one at a time; they can be trivially 
compressed/encoded as a `fast-forward` instruction. Any twisted path formed of `^<v>`, `#` or whitespace can be 
similarly compressed as a `teleport` instruction. In fact, any path which doesn't consist of instructions with 
several possible outcomes (`_|?`) can be optimized and compiled. In Befunjit these are called "static paths" 
and this is the principle that it is based upon.

The execution of a static path can be thought of as a "jump". After every such "jump" Befunjit checks its cache of 
compiled static paths, starting from the cell indicated by the PC:

+ If a precompiled path is found then it gets executed. The compiler ceases control to the compiled code (which
 too can be thought of as a context switch). Once the path is executed, control comes back to the compiler, the PC is
 updated to point to where the path ends and the process repeats - a new jump is ready to occur.

+ If, however, a precompiled path is not found then the "static path compiler" is called. This seeks out the
longest static path, compiles it, stores it and executes it as in the previous case. Befunjit has 3 static path 
compilers, depending on how many optimizations they perform.

As I mentioned earlier, the `p` instruction makes compilation challenging. When executed (from a compiled path), `p` 
alters the contents of the playfield and invalidates any paths that pass through the affected cell. All these paths are 
eventually recompiled if and when the PC gets to them. If the current executing path happens to be invalidated then it 
continues executing only if the affected cell comes before the current `p` instruction in the path. Otherwise, the 
compiled code ceases control back to the compiler immediately which in turn has to compile and execute the path starting
from the current PC.

[This visualizer](http://adrianton3.github.io/befunjit/demos/visualizer-lazy/visualizer.html) shows what static paths
remain cached after the execution of a program (hover the small arrows).

## An eager runtime

The process described above works fine, but it is rather slow due to the high number of context switches. Any path is 
in fact a new function call. There is a way to get rid of function calls, by compiling the whole program as a single 
piece of code. This way the whole program is a single function that the JavaScript engine can chew on and optimize. 

We can think of Befunjit's execution process described in the previous section as being lazy in that it compiles and
executes paths as needed. Compiling the whole program in a great big chunk would therefore be considered a more eager
approach. Indeed, Befunjit implements 2 runtimes, both a lazy one and an eager one - each optimized for different 
scenarios. 

The eager runtime is based on the same idea of splitting up the program into static paths as the lazy runtime. 
The only difference is that the eager runtime collects all paths even if they might not be reached. In addition, 
the static paths get stitched together using while-loops and break statements. The `p` instruction is handled 
differently than in the case of the lazy runtime. Since the whole program is a single clump of code, any 
modification to a static path would result in a full recompilation. An improvement is to make the eager runtime 
check if any of the code paths affected by `p` are reachable from the current point. This ensures that `p` 
instructions which do not affect the reachable paths do not trigger a recompilation. Still, this runtime should 
not be the first choice if your program makes extensive use of the `p` instruction.