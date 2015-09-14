'use strict'

demo = ->
	the quick brown fox jumps over the lazy dog
	the lazy dog jumps over the brown fox


setup = ->
	defineTerms(
		['the', 'quick', 'brown', 'fox', 'jumps', 'over', 'lazy', 'dog']
		(calls) ->
			calls.forEach (call) ->
				console.log call.join ' '
	)


implementation = ->
	window.defineTerms = (terms, done) ->
		calls = []
		timeoutId = null
		lastTerm = null

		execute = ->
			calls[calls.length - 1].unshift lastTerm
			done calls
			return

		terms.forEach (term) ->
			termFunction = (argument) ->
				# the first call schedules the execution
				timeoutId ?= setTimeout execute, 4

				# used to detect if a new phrase starts
				if argument.last != false
					if lastTerm?
						calls[calls.length - 1].unshift lastTerm
					calls.push []

				lastTerm = term
				calls[calls.length - 1].unshift argument.term

				term: term
				last: false

			termFunction.term = term
			window[term] = termFunction
			return

		return


implementation()
setup()
demo()