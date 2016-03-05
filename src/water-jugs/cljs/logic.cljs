(ns water.logic)

(defn pour [config state from to]
  (let [free (- (nth config to) (nth state to))
        quantity (nth state from)]
    (if (> quantity free)
      (assoc state
        from (- quantity free)
        to (nth config to))
      (assoc state
        from 0
        to (+ quantity (nth state to))))))

(defn get-neighbor-actions [length]
  (let [indices (take length (range))]
    (for [from indices
          to indices
          :when (not= from to)]
      {:from from :to to})))

(defn get-neighbor-states [config state]
  (map
    #(pour config state (:from %) (:to %))
    (get-neighbor-actions (count config))))

(defn bf [config closed-set parents open-set]
  (if (zero? (count open-set))
    parents
    (let [state (first open-set)
          less-open-set (disj open-set state)
          new-closed-set (conj closed-set state)
          candidate-neighbor-states (get-neighbor-states config state)
          new-neighbor-states (filter
                                #(not (contains? new-closed-set %))
                                candidate-neighbor-states)
          more-open-set (apply
                          (partial conj less-open-set)
                          new-neighbor-states)
          new-parents (reduce
                        #(assoc % %2 state)
                        parents
                        new-neighbor-states)]
      (bf config new-closed-set new-parents more-open-set))))

(defn rebuild-path [parents state]
  (if (contains? parents state)
    (conj
      (rebuild-path parents (parents state))
      state)
    (list state)))

(defn solve [config start-state]
  (bf config #{} {} #{start-state}))