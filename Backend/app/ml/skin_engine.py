def enrich_skin_scores(base_scores):
    acne = base_scores["acne"]
    pigmentation = base_scores["pigmentation"]
    dryness = base_scores["dryness"]

    oiliness = max(0.0, 1 - dryness)
    sensitivity = (acne + pigmentation) / 2

    return {
        "acne": acne,
        "pigmentation": pigmentation,
        "dryness": dryness,
        "oiliness": oiliness,
        "sensitivity": sensitivity
    }
