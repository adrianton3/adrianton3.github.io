<!-- @@@title:Visualization of Hidden Markov Models@@@ -->
<!-- @@@extraCss:../../static/hmm/style.css@@@ -->

# Visualization of Hidden Markov Models

## A wandering robot

A robot with broken gps module has gone rogue and is wandering aimlessly.

Every time-unit the robot makes a move: it can stay where it is, or visit any of the 4 adjacent cells.
These actions have an equal probability of happening.

The last known position of the robot is in the center cell of the following grid.
We can say that the probability of the robot being in that cell is 1 (full certainty)
while the probability that the robot is located in the other cells is 0.

<table class="center">
	<tr>
		<td class="cell"></td>
		<td class="cell"></td>
		<td class="cell"></td>
		<td class="cell"></td>
		<td class="cell"></td>
	</tr>
	<tr>
		<td class="cell"></td>
		<td class="cell"></td>
		<td class="cell"></td>
		<td class="cell"></td>
		<td class="cell"></td>
	</tr>
	<tr>
		<td class="cell"></td>
		<td class="cell"></td>
		<td class="cell" style="background-color: rgb(0, 127, 255);">1.0</td>
		<td class="cell"></td>
		<td class="cell"></td>
	</tr>
	<tr>
		<td class="cell"></td>
		<td class="cell"></td>
		<td class="cell"></td>
		<td class="cell"></td>
		<td class="cell"></td>
	</tr>
	<tr>
		<td class="cell"></td>
		<td class="cell"></td>
		<td class="cell"></td>
		<td class="cell"></td>
		<td class="cell"></td>
	</tr>
</table>

After 1 time-unit the robot has either moved to one of the neighbouring cells or has just stayed in
the same location. There is a 0.2 probability that the robot is in any one of these 5 cells.
The other cells get a probability of 0, since the robot couldn't have possibly reached them.

<table class="center">
	<tr>
		<td class="cell"></td>
		<td class="cell"></td>
		<td class="cell"></td>
		<td class="cell"></td>
		<td class="cell"></td>
	</tr>
	<tr>
		<td class="cell"></td>
		<td class="cell"></td>
		<td class="cell" style="background-color: rgb(0, 127, 255);">0.2</td>
		<td class="cell"></td>
		<td class="cell"></td>
	</tr>
	<tr>
		<td class="cell"></td>
		<td class="cell" style="background-color: rgb(0, 127, 255);">0.2</td>
		<td class="cell" style="background-color: rgb(0, 127, 255);">0.2</td>
		<td class="cell" style="background-color: rgb(0, 127, 255);">0.2</td>
		<td class="cell"></td>
	</tr>
	<tr>
		<td class="cell"></td>
		<td class="cell"></td>
		<td class="cell" style="background-color: rgb(0, 127, 255);">0.2</td>
		<td class="cell"></td>
		<td class="cell"></td>
	</tr>
	<tr>
		<td class="cell"></td>
		<td class="cell"></td>
		<td class="cell"></td>
		<td class="cell"></td>
		<td class="cell"></td>
	</tr>
</table>

How about finding the robot after 2 time-steps? We apply the same logic and identify the cells that have
some probability of being the actual location of the robot.

<table class="center">
	<tr>
		<td class="cell"></td>
		<td class="cell"></td>
		<td class="cell" style="background-color: rgb(204, 230, 255);">0.04</td>
		<td class="cell"></td>
		<td class="cell"></td>
	</tr>
	<tr>
		<td class="cell"></td>
		<td class="cell" style="background-color: rgb(153, 204, 255);">0.08</td>
		<td class="cell" style="background-color: rgb(153, 204, 255);">0.08</td>
		<td class="cell" style="background-color: rgb(153, 204, 255);">0.08</td>
		<td class="cell"></td>
	</tr>
	<tr>
		<td class="cell" style="background-color: rgb(204, 230, 255);">0.04</td>
		<td class="cell" style="background-color: rgb(153, 204, 255);">0.08</td>
		<td class="cell" style="background-color: rgb(0, 127, 255);">0.2</td>
		<td class="cell" style="background-color: rgb(153, 204, 255);">0.08</td>
		<td class="cell" style="background-color: rgb(204, 230, 255);">0.04</td>
	</tr>
	<tr>
		<td class="cell" ></td>
		<td class="cell" style="background-color: rgb(153, 204, 255);">0.08</td>
		<td class="cell" style="background-color: rgb(153, 204, 255);">0.08</td>
		<td class="cell" style="background-color: rgb(153, 204, 255);">0.08</td>
		<td class="cell"></td>
	</tr>
	<tr>
		<td class="cell"></td>
		<td class="cell"></td>
		<td class="cell" style="background-color: rgb(204, 230, 255);">0.04</td>
		<td class="cell"></td>
		<td class="cell"></td>
	</tr>
</table>

Some cells have a lower chance of being reached than others. The probability that the robot will move twice in
the same direction is of 0.04 (0.2^2).

What about the starting position? There are 5 possible ways to get to the starting cell after 2 steps:
by standing still for 2 turns or going back and forth in any of the 4 directions. Each of these moves has a 0.04
chance of happening (0.2^2). The accumulated probability that the robot is in the starting position after 2 turns
is five times this, thus adding up to 0.2.

Let's get a bigger map and see how the robot fares after more time-units.

<div id="container-1">
	<button id="button-1">Run</button>
</div>

`[R]` marks the initial position of the robot.

It's interesting to note that even after larger number of steps, the most probable location of the robot is
still its starting position.

### What if the initial position was not known

Even if we don't know what the robot's last position was we can still get an idea of where it might be located.
If the topology of the grid-graph is non-uniform then we can infer the probability of the robot being located in
each cell - some cells have higher probabilities, while other have lower probabilities.
Let's assume that initially the robot can be in either cell (with equal probability).

<div id="container-2">
	<button id="button-2">Run</button>
</div>

After a couple of time-units we can see that the less connected a cell is the lower the probability of the robot
reaching it becomes.

## The robot has sensors

Turns out some of the robot's sensors get back online. The sensors are not very accurate - they approximate the
distance to the nearest obstacle in the 4 cardinal directions (north, west, south and east). All the information
the sensors are giving away each time unit is 4 integral numbers.
We know that the sensors' error margin is of 2 units. Sensor errors are uniformly distributed between 0 and 2.

Since we know the map and the obstacles on it we can figure out all locations that match the sensor readings.
Below follows a visualisation of what information the sensors can reveal about the location of the robot.
The locations for which sensor readings apply are highlighted.

<div id="container-3">
	<button id="button-3">Run</button>
</div>

This time `[R]` marks the actual position of the robot.
Notice that these may be spread out - this depends greatly on the layout of the map. It may be that multiple
positions appear identical from the sensors' perspective.

## Combining all sources of information

The demo below combines the sensory information with the history information (like in the first example).

<div id="container-4">
	<button id="button-4">Run</button>
</div>

<script src="../../static/hmm/hmm.js"></script>

As we can see, by combining the information the number of locations that the robot can be at is greatly
reduced thus allowing us to pinpoint the robot's location more accurately.

