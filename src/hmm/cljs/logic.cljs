(ns hmm.logic
  (:require
    [hmm.common :refer [coords->index make-coords]]))


(defn make-cells [{:keys [width height] :as size} walls]
  (let [total (* width height)
        empty (vec (take total (repeat "false")))]
    (reduce
      (fn [data coords]
        (assoc data (coords->index size coords) "true"))
      empty
      walls)))

(defn compute-share [graph data {index :index}]
  (let [shares (count (nth graph index))
        value (nth data index)]
    (/ value shares)))

(defn apply-neighbors [graph data]
  (map-indexed
    (fn [index _]
      (let [neighbors (nth graph index)
            neighbor-values (map (partial compute-share graph data) neighbors)]
        (apply + neighbor-values)))
    data))

(defn dist-dimension [fuzzy-dist distance-profile]
  (let [min (- fuzzy-dist 2)
        max (+ fuzzy-dist 2)]
    (map
      (fn [profile-cell]
        (if (and (<= profile-cell max) (>= profile-cell min))
          1
          0))
      distance-profile)))

(defn apply-walls [cells data]
  (map
    (fn [cell data]
      (if (= cell "true") 0 data))
    cells
    data))

(defn apply-distances [fuzzy-dist distance-profiles]
  (let [per-dimension (map dist-dimension fuzzy-dist distance-profiles)]
    (apply map (concat [*] per-dimension))))

(defn normalize-one [data]
  (let [norm-one (apply + data)]
    (map #(/ % norm-one) data)))

(defn normalize-inf [data]
  (let [norm-inf (apply max data)]
    (map #(/ % norm-inf) data)))

(defn count-walls [cells]
  (count (filter (partial = "true") cells)))

(defn make-singular [{:keys [width height] :as size} {index :index}]
  (let [total (* width height)
        empty (vec (repeat total 0))]
    (assoc empty index 1)))

(defn make-uniform [{:keys [width height]} cells]
  (let [total (* width height)
        wall-count (count-walls cells)
        value (/ 1 (- total wall-count))]
    (vec (repeat total value))))