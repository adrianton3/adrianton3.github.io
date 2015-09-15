'use strict'

# Domain specific languages are neat and nice; they don't look very much like
# general purpose programming languages and that's ok because they're specifically
# tailored to a domain which probably doesn't require much expressive power
# (in the general purpose sense).

# Writing a parser is tedious and takes time, but some languages make it
# easy to integrate DSL code into normal code: Lisps via macros,
# Scala and Haskell via their terse syntax and even C/C++ by abusing the preprocessor.
# This experiment is about trying to write a simple DSL in CoffeeScript - CoffeeScript code
# that looks as non-CoffeeScript-y as possible.

# Take for example the following snippet of code. It looks like 2 plain sentences but it's
# valid CoffeeScript; and it executes - every "command" is gathered into an array
# which can then be pushed somewhere else for execution. In absence of a better example
# the standard phrase below is used.
demo = ->
	the quick brown fox jumps over the lazy dog
	the lazy dog jumps over the brown fox


setup = ->
	defineTerms(
		# Valid terms have to be enumerated
		['the', 'quick', 'brown', 'fox', 'jumps', 'over', 'lazy', 'dog']

		# What to do with the "sentences";
		# in this case they are logged to the console
		(lines) ->
			lines.forEach (line) ->
				console.log line.join ' '
	)


implementation = ->
	window.defineTerms = (terms, done) ->
		lines = []
		timeoutId = null
		lastTerm = null

		execute = ->
			lines[lines.length - 1].unshift lastTerm
			done lines
			return

		terms.forEach (term) ->
			termFunction = (argument) ->
				# The first call schedules the execution.
				# It would be impossible to figure out when the execution finished
				# without a special *start* term. Prepending phrases with *start*
				# would look artificial so instead we'll let the whole thing execute,
				# gather all terms and schedule an execution later.
				timeoutId ?= setTimeout execute, 4

				# Used to detect when a new phrase starts.
				if argument.last != false
					if lastTerm?
						lines[lines.length - 1].unshift lastTerm
					lines.push []

				lastTerm = term
				lines[lines.length - 1].unshift argument.term

				term: term
				last: false

			termFunction.term = term
			window[term] = termFunction
			return

		return


# Tie everything up together
implementation()
setup()
demo()