(ns hmm.display
  (:require
    [hmm.common :refer [for-each repeat]]))


(defn get-element-by-id [id]
  (.getElementById js/document id))

(defn get-attr [element name]
  (.getAttribute element name))

(defn set-attr! [element name value]
  (.setAttribute element name value))

(defn set-color! [element value]
  (set! (.-backgroundColor (.-style element)) value))

(defn flip-cell! [cell]
  (let [prev-state (get-attr cell "wall")]
    (set-attr!
      cell
      "wall"
      (if (= prev-state "true") "false" "true"))))

(defn create-element [type]
  (.createElement js/document type))

(defn set-text-content! [element content]
  (set! (.-textContent element) content))

(defn on-click [element handler]
  (.addEventListener element "click" handler))

(defn make-cell [line-index column-index]
  (let [flip (fn [] (this-as my-this (flip-cell! my-this)))
        element (create-element "td")]
    (set-attr! element "id" (str "cell-" line-index "-" column-index))
    (set-attr! element "wall" "false")
    (.add (.-classList element) "cell")
    element))

(defn append-child! [element child]
  (.appendChild element child))

(defn insert-before! [element child reference]
  (.insertBefore element child reference))

(defn make-line [size line-index]
  (let [tds (map
              (partial make-cell line-index)
              (take size (range)))
        tr (create-element "tr")]
    (for-each
      (fn [td] (append-child! tr td))
      tds)
    tr))

(defn make-display [{:keys [width height]}]
  (let [trs (map
              (partial make-line width)
              (take height (range)))
        table (create-element "table")]
    (set-attr! table "board-width" width)
    (set-attr! table "board-height" height)
    (for-each
      (fn [tr] (append-child! table tr))
      trs)
    table))

(defn get-cell [table index]
  (let [width (js/parseFloat (get-attr table "board-width"))
        line-index (quot index width)
        column-index (rem index width)
        line (aget (.-children table) line-index)
        cell (aget (.-children line) column-index)]
    cell))

(defn prob->color [prob]
  (str
    "hsl(210, 100%, "
    (.floor js/Math (+ (* (- 1 prob) 50) 50))
    "%)"))

(defn set-data! [table data]
  (repeat 0 (dec (count data))
    (fn [index]
      (let [cell (get-cell table index)
            wall (get-attr cell "wall")]
        (when (= wall "false")
          (set-color! cell (prob->color (nth data index))))))))

(defn set-walls! [table cells]
  (repeat 0 (dec (count cells))
    (fn [index]
      (let [cell (get-cell table index)]
        (set-attr! cell "wall" (nth cells index))))))

(defn set-cell-content! [table index content]
  (let [cell (get-cell table index)]
    (set-text-content! cell content)))

(defn reset-cell-content! [table]
  (repeat
    0
    (dec (* (get-attr table "board-width") (get-attr table "board-height")))
    (fn [index]
      (set-cell-content! table index ""))))

(defn get-walls [table]
  (let [width (js/parseFloat (get-attr table "board-width"))
        height (js/parseFloat (get-attr table "board-height"))]
    (vec
      (mapcat
        (fn [line-index]
          (map
            (fn [column-index]
              (let [line (aget (.-children table) line-index)
                    cell (aget (.-children line) column-index)]
                (get-attr cell "wall")))
            (take width (range))))
        (take height (range))))))