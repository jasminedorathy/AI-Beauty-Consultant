def generate_consultation(face_shape, skin_scores, gender="Female"):
    """
    Acts as a Beauty Consultant to generate personalized advice.
    Adapts based on Gender.
    """
    acne = skin_scores.get('acne', 0)
    oiliness = skin_scores.get('oiliness', 0)
    texture = skin_scores.get('texture', 0) 

    # 1. Determine Skin Type
    skin_type = "Normal"
    if oiliness > 0.6 and texture < 0.4:
        skin_type = "Oily"
    elif oiliness < 0.4 and texture > 0.5:
        skin_type = "Dry"
    elif oiliness > 0.5 and texture > 0.4:
        skin_type = "Combination"
    else:
        skin_type = "Balanced"

    # 2. Build Routine
    routine = []
    
    # 2a. Gender-Specific Intro
    brand_voice = "Gentlemen's Care" if gender == "Male" else "Beauty Routine"
    
    # 2b. Cleansing
    if skin_type in ["Oily", "Combination"]:
        routine.append("🧴 **Cleanser**: Use a Gel or Foam cleanser with Salicylic Acid to control oil.")
    elif skin_type == "Dry":
        routine.append("🧴 **Cleanser**: Use a Cream-based hydrating cleanser.")
    else:
        routine.append("🧴 **Cleanser**: Use a gentle daily cleanser.")

    # 2c. Shaving (Male) vs Toning (Female)
    if gender == "Male":
        if acne > 0.1 or texture > 0.3:
            routine.append("🪒 **Shaving**: Use a sensitive shaving gel and change blades often to prevent irritation.")
    
    # 2d. Treatment
    if acne > 0.3:
        routine.append("🧪 **Treatment**: Apply Niacinamide (AM) and Spot Treatment (PM) for breakouts.")
    elif texture > 0.4:
        serum = "Lactic Acid" if gender == "Female" else "a gentle Exfoliant"
        routine.append(f"🧪 **Treatment**: Use Vitamin C (AM) and {serum} (PM) for smoothness.")
    elif oiliness > 0.5:
         routine.append("🧪 **Treatment**: Niacinamide Serum to regulate sebum.")

    # 2e. Moisturizer
    if skin_type == "Oily":
        routine.append("💧 **Moisturizer**: Lightweight, oil-free matte gel.")
    elif skin_type == "Dry":
        routine.append("💧 **Moisturizer**: Rich hydration cream.")
        if gender == "Male":
            routine.append("🧔 **Beard**: Apply beard oil to prevent skin dryness underneath.")
    else:
        routine.append("💧 **Moisturizer**: Daily hydrating lotion.")

    # 2f. Sunscreen
    routine.append("☀️ **SPF**: Daily Sunscreen is non-negotiable!")

    # 3. Final Compilation
    final_recs = [f"**Diagnosis ({gender})**: {skin_type} Skin"] + routine
    
    # 4. Styling / Grooming Tip
    if face_shape:
        tip_icon = "🧔" if gender == "Male" else "💄"
        topic = "Grooming" if gender == "Male" else "Makeup"
        
        if face_shape in ["Round", "Square"]:
             if gender == "Male":
                 final_recs.append(f"{tip_icon} **{topic} Tip**: A squared beard style adds structure to a {face_shape} face.")
             else:
                 final_recs.append(f"{tip_icon} **{topic} Tip**: Contour the jawline to add definition to your {face_shape} features.")
        
        elif face_shape in ["Oval", "Diamond"]:
             if gender == "Male":
                 final_recs.append(f"{tip_icon} **{topic} Tip**: A clean shave or short stubble highlights your {face_shape} symmetry.")
             else:
                 final_recs.append(f"{tip_icon} **{topic} Tip**: Highlight cheekbones to accentuate your {face_shape} structure.")
        
        elif face_shape == "Heart":
             if gender == "Male":
                 final_recs.append(f"{tip_icon} **{topic} Tip**: A fuller beard at the chin balances a {face_shape} face.")
             else:
                 final_recs.append(f"{tip_icon} **{topic} Tip**: Balance {face_shape} features by adding volume/highlight to the jawline.")

    return final_recs
