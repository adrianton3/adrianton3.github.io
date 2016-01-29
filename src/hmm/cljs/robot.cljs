(ns hmm.robot
  (:require
    [hmm.common :refer [make-coords add-coords is-free? valid-coords? get-neighbors]]))


(def directions '(
                   {:coords {:line 0 :column 0}}
                   {:coords {:line -1 :column 0}}
                   {:coords {:line 0 :column -1}}
                   {:coords {:line 1 :column 0}}
                   {:coords {:line 0 :column 1}}))

(defn get-dist [cells coords direction]
  (if (and
        (valid-coords? coords)
        (is-free? cells coords))
    (inc
      (get-dist
        cells
        (add-coords coords direction)
        direction))
    0))

(defn fuzz [n]
  (+ n (- 2 (rand-int 5))))

(defn get-distance-profile [size cells direction]
  (map-indexed
    (fn [index _]
      (get-dist
        cells
        (make-coords size index)
        direction))
    cells))

(defn get-distance-profiles [size cells directions]
  (map
    (partial get-distance-profile size cells)
    directions))

(defn step [graph cells {index :index}]
  (let [next-coords (rand-nth (nth graph index))
        dist (map (partial get-dist cells next-coords) (rest directions))
        fuzzy-dist (map fuzz dist)]
    {:coords next-coords :fuzzy-dist fuzzy-dist}))