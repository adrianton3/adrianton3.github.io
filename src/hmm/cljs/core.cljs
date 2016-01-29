(ns hmm.core
  (:require [hmm.display :as display]
            [hmm.robot :as robot]
            [hmm.logic :as logic]
            [hmm.common :refer [get-graph make-coords]]))


(enable-console-print!)


(defn run-async [delay fun-step fun-end base remaining]
  (if (zero? remaining)
    (fun-end)
    (js/setTimeout
      (partial
        run-async
        delay
        fun-step
        fun-end
        (fun-step base)
        (dec remaining))
      delay)))

(def standard-size {:width 15 :height 9})

(def standard-cells
  (logic/make-cells
    standard-size
    [{:line 3 :column 2}
     {:line 4 :column 2}
     {:line 5 :column 2}

     {:line 4 :column 4}
     {:line 5 :column 4}
     {:line 6 :column 4}

     {:line 1 :column 11}
     {:line 2 :column 12}

     {:line 6 :column 13}
     {:line 7 :column 12}]))

(defn setup-alg [container button size start-type step]
  (let [coords-start (make-coords
                       size
                       {:line (quot (:height size) 2)
                        :column (quot (:width size) 2)})
        display (display/make-display size)
        cells standard-cells
        data-start (if (= start-type :uniform)
                     (logic/make-uniform size cells)
                     (logic/make-singular size coords-start))
        graph (get-graph size cells robot/directions)
        distance-profiles (robot/get-distance-profiles size cells (rest robot/directions))]
    (display/set-walls! display standard-cells)
    (display/append-child! container display)
    #(do
       (display/reset-cell-content! display)
       (run-async
        1000
        (fn [{:keys [coords data]}] (step display cells graph distance-profiles coords data))
        (fn [] (display/set-attr! button "running" "false"))
        {:coords coords-start :data data-start}
        30))))

(defn setup-ui [container-id button-id start-type fun-step]
  (let [container (display/get-element-by-id container-id)
        button (display/get-element-by-id button-id)
        run (setup-alg container button standard-size start-type fun-step)]
    (display/on-click button
      (fn []
        (when-not (= (display/get-attr button "running") "true")
          (do
            (display/set-attr! button "running" "true")
            (run)))))))

(defn step-1 [display _ graph _ coords-old data]
  (let [coords coords-old
        phase-1 (logic/apply-neighbors graph data)
        phase-5 (logic/normalize-inf phase-1)]
    (display/set-data! display phase-5)
    (display/set-cell-content! display (:index coords-old) "")
    (display/set-cell-content! display (:index coords) "[R]")
    {:coords coords :data phase-5}))

(defn step-2 [display _ graph _ coords-old data]
  (let [coords coords-old
        phase-1 (logic/apply-neighbors graph data)
        phase-5 (logic/normalize-inf phase-1)]
    (display/set-data! display phase-5)
    {:coords coords :data phase-5}))

(defn step-3 [display cells graph distance-profiles coords-old data]
  (let [{:keys [coords fuzzy-dist]} (robot/step graph cells coords-old)
        phase-2 (logic/apply-distances fuzzy-dist distance-profiles)
        phase-3 (logic/apply-walls cells phase-2)
        phase-5 (logic/normalize-inf phase-3)]
    (display/set-data! display phase-5)
    (display/set-cell-content! display (:index coords-old) "")
    (display/set-cell-content! display (:index coords) "[R]")
    {:coords coords :data phase-5}))

(defn step-4 [display cells graph distance-profiles coords-old data]
  (let [{:keys [coords fuzzy-dist]} (robot/step graph cells coords-old)
        phase-1 (logic/apply-neighbors graph data)
        phase-2 (logic/apply-distances fuzzy-dist distance-profiles)
        phase-3 (logic/apply-walls cells phase-2)
        phase-4 (map * phase-1 phase-3)
        phase-5 (logic/normalize-inf phase-4)]
    (display/set-data! display phase-5)
    (display/set-cell-content! display (:index coords-old) "")
    (display/set-cell-content! display (:index coords) "[R]")
    {:coords coords :data phase-5}))

(setup-ui "container-1" "button-1" :singular step-1)
(setup-ui "container-2" "button-2" :uniform step-2)
(setup-ui "container-3" "button-3" :uniform step-3)
(setup-ui "container-4" "button-4" :uniform step-4)