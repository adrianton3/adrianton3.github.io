<!-- @@@title:Water jug puzzle solver@@@ -->
<!-- @@@extraCss:../../static/water-jugs/style.css@@@ -->

# Water jug puzzle solver

Variations on the classic [water jug puzzle](https://en.wikipedia.org/wiki/Liquid_water_pouring_puzzles) 
are often used in tech interviews. They're not easy to solve mentally, since you need to 
keep track of several jugs at the same time, but given pen and paper they don't pose much of a challenge. 
Here is a solver for this type of puzzle, to help you visualize the process. It finds all the states 
in which the jugs can be in a breadth first manner.

This project is written in ClojureScript and [reagent](http://reagent-project.github.io). 
Compared with JS + react, ClojureScript + reagent is very terse - the whole project has only 129 lines of code. 


<div id="app"></div>
<script src="../../static/water-jugs/water.js" defer></script>