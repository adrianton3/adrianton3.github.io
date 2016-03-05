(ns water.core
  (:require
    [water.logic :refer [solve]]
    [reagent.core :as reagent :refer [atom]]))

(enable-console-print!)


(def unit-height 16)

(defn jug [capacity water]
  [:div.jug {:style {:height (* unit-height capacity)}}
   [:div.water {:style {:height (* unit-height water)}}]
   ])

(defn jug-set [jugs]
  [:div.jug-set
   (map
     (fn [pair index]
       ^{:key index}
       [:div.jug-and-label
        [jug (first pair) (second pair)]
        (second pair)])
     jugs
     (range))])

(defn jug-set-set [jug-sets]
  [:div.jug-sets
   (map
     #(with-meta
        (jug-set %)
        {:key %2})
     jug-sets
     (range))
   ])

(defn counter [value on-change]
  [:div.counter-container
   [:div.counter
    [:button {:on-click (partial on-change (max 0 (dec value)))}
     "-"]
    [:input {:value value :read-only true}]
    [:button {:on-click (partial on-change (min 10 (inc value)))}
     "+"]
    ]])



(def state (reagent/atom []))

(def jug-sets (reagent/atom []))

(defn compute [pairs]
  (let [config (vec (map first pairs))
        water (vec (map second pairs))]
    (solve config water)))

(add-watch state :key
  (fn [key atom old-state new-state]
    (let [solutions (sort compare (vec (keys (compute new-state))))
          config (vec (map first new-state))
          encoded (vec (map
                    #(vec (map vector config %))
                    solutions))]
      (reset! jug-sets encoded))))

(defn main-jug-set []
  (let [swap-pair! (fn [fun index]
                     (let [old-pair (nth @state index)
                           new-pair (fun old-pair)
                           new-state (assoc @state index new-pair)]
                       (reset! state new-state)))
        update-capacity! (fn [index value]
                           (swap-pair!
                             #(vec [
                                value
                                (min value (second %))
                                ])
                             index))
        update-water! (fn [index value]
                        (swap-pair!
                          #(vec [
                             (max value (first %))
                             value
                             ])
                          index))]
    [:div.main-jug-set
     [:div.jug-container
      (map
        (fn [pair index]
          ^{:key index}
          [:div.jug-and-input
           [jug (first pair) (second pair)]
           [counter (first pair) (partial update-capacity! index)]
           [counter (second pair) (partial update-water! index)]
           ])
       @state
       (range))
     ]]))


(defn app []
  [:div
    [main-jug-set]
    [jug-set-set @jug-sets]
   ])

(reset! state [[8 8] [5 0] [3 0]])

(reagent/render [app] (.getElementById js/document "app"))