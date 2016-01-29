(ns hmm.common)


(defn repeat [from to fun]
  (loop [i from]
    (when (<= i to)
      (fun i)
      (recur (inc i)))))

(defn for-each [fun collection]
  (when-not (empty? collection)
    (fun (first collection))
    (for-each fun (rest collection))))

(defn accumulate [count base fun]
  (if (zero? count)
    base
    (accumulate (dec count) (fun base) fun)))

(defn index->coords [{:keys [width]} index]
  {:line (quot index width)
   :column (rem index width)})

(defn coords->index [{:keys [width]} {:keys [line column]}]
  (+ (* line width) column))

(defn make-coords [size index-or-coords]
  (if (number? index-or-coords)
    {:size size
     :coords (index->coords size index-or-coords)
     :index index-or-coords}
    {:size size
     :coords index-or-coords
     :index (coords->index size index-or-coords)}))

(defn add-coords [{size-1 :size coords-1 :coords} {size-2 :size coords-2 :coords}]
  (let [{line-1 :line column-1 :column} coords-1
        {line-2 :line column-2 :column} coords-2]
    (make-coords
      size-1
      {:line (+ line-1 line-2)
       :column (+ column-1 column-2)})))

(defn is-free? [cells {index :index}]
  (= (nth cells index) "false"))

(defn valid-coords? [{:keys [size coords]}]
  (let [{:keys [width height]} size
        {:keys [line column]} coords]
    (and
      (>= line 0)
      (>= column 0)
      (< line height)
      (< column width))))

(defn get-neighbors [cells coords directions]
  (let [candidates (map (partial add-coords coords) directions)]
    (filter
      (fn [candidate]
        (and
          (valid-coords? candidate)
          (is-free? cells candidate)))
      candidates)))

(defn get-graph [size cells directions]
  (map-indexed
    (fn [index _]
      (get-neighbors
        cells
        (make-coords size index)
        directions))
    cells))