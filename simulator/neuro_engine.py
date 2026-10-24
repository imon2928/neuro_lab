import math

def clamp(val, min_val=0.0, max_val=100.0):
    return max(min_val, min(max_val, round(val, 1)))

def run_advanced_simulation(payload):
    circ = payload.get('circuits', {})
    mult = payload.get('multipliers', {})
    cur_t = float(payload.get('current_minute', 45))
    total_t = max(1.0, float(payload.get('duration_minutes', 120)))
    paradigm = payload.get('paradigm', 'cognitive')

    # সার্কিট ইনপুট (0 - 100%)
    c_meso = float(circ.get('mesolimbic', 75))
    c_vis  = float(circ.get('visual', 80))
    c_cere = float(circ.get('cerebellar', 45))
    c_cen  = float(circ.get('cen', 50))
    c_dmn  = float(circ.get('dmn', 35))
    c_str  = float(circ.get('stress_axis', 45))

    # নিউরোট্রান্সমিটার মাল্টিপ্লায়ার্স (0.2x - 3.0x)
    m_da   = float(mult.get('dopamine', 1.30))
    m_glu  = float(mult.get('glutamate', 1.25))
    m_gaba = float(mult.get('gaba', 0.85))
    m_ne   = float(mult.get('norepi', 1.10))
    m_ser  = float(mult.get('serotonin', 0.90))
    m_ach  = float(mult.get('ach', 0.95))

    # ১. ডাইনামিক ফেজ ক্যালকুলেশন (প্যারাডাইমের উপর ভিত্তি করে)
    progress = min(1.0, cur_t / total_t)
    if paradigm == 'stress':
        fatigue_factor = max(0.4, 1.1 - progress * 0.7)
        phase_name = "Sympathetic Hyper-Arousal" if progress < 0.5 else "Adrenal Burnout / Cortisol Toxicity"
    elif paradigm == 'meditation':
        fatigue_factor = min(1.3, 0.9 + progress * 0.4)
        phase_name = "Alpha Synchrony Induction" if progress < 0.5 else "Deep Transcendental Hypometabolism"
    elif paradigm == 'sensory':
        fatigue_factor = max(0.35, 1.2 - progress * 0.85)
        phase_name = "Mesolimbic Dopamine Rush" if progress < 0.3 else "D2 Downregulation & Attentional Collapse"
    else: # cognitive/default
        fatigue_factor = max(0.45, 1.05 - progress * 0.6)
        phase_name = "Working Memory Engagement" if progress < 0.5 else "Cognitive Fatigue & Synaptic Depletion"

    # ২. মস্তিষ্কের ১৪টি মূল অ্যানাটমিক্যাল অংশের লাইভ অ্যাক্টিভেশন লেভেল
    frontal     = clamp((c_cen * 0.55 + m_da * 22 + m_ach * 20) * fatigue_factor - (c_str * 0.2 * m_ne))
    parietal    = clamp((c_cen * 0.40 + c_vis * 0.30) * m_glu * fatigue_factor)
    temporal    = clamp((c_dmn * 0.40 + m_ach * 28 + m_ser * 15) * fatigue_factor)
    occipital   = clamp((c_vis * 0.85) * m_glu)
    cerebrum    = clamp((frontal * 0.35 + parietal * 0.25 + temporal * 0.20 + occipital * 0.20))
    thalamus    = clamp((m_glu * 38 + m_ne * 22) - (m_gaba * 24))
    hypothalamus= clamp((c_str * 0.65 * m_ne + 15) - (m_ser * 18))
    pituitary   = clamp((hypothalamus * 0.85 + c_str * 0.2))
    hippocampus = clamp((m_ach * 38 + c_cen * 0.25) * fatigue_factor - (25.0 if m_ne > 1.3 else 0.0))
    amygdala    = clamp((c_str * 0.75 * m_ne + 12) - (m_ser * 22 + m_gaba * 22))
    midbrain    = clamp((c_meso * 0.60 * m_da + m_glu * 18))
    pons        = clamp((m_ach * 30 + m_ne * 25 + 20) * (1.0 if m_gaba < 1.3 else 0.75))
    medulla     = clamp((hypothalamus * 0.45 + c_str * 0.35 + 25))
    cerebellum  = clamp((c_cere * 0.70 + m_ach * 22) * (1.1 if m_gaba < 1.1 else 0.8))

    regions = {
        'frontal': frontal,
        'parietal': parietal,
        'temporal': temporal,
        'occipital': occipital,
        'cerebrum': cerebrum,
        'thalamus': thalamus,
        'hypothalamus': hypothalamus,
        'pituitary': pituitary,
        'hippocampus': hippocampus,
        'amygdala': amygdala,
        'midbrain': midbrain,
        'pons': pons,
        'medulla': medulla,
        'cerebellum': cerebellum
    }

    # ৩. পাঁচটি স্বতন্ত্র নন-ইনভেসিভ টেস্টের ডাটা মডেলিং
    # টেস্ট ১: EEG
    delta_p = clamp((1.0 - fatigue_factor) * 70.0 + (m_gaba * 18.0))
    theta_p = clamp((c_dmn * 0.55 + m_ser * 22.0))
    alpha_p = clamp((m_gaba * 42.0 + m_ser * 20.0) * (0.35 if m_ne > 1.2 else 1.05))
    beta_p  = clamp((c_cen * 0.45 + c_meso * 0.35) * m_glu * 0.85)
    gamma_p = clamp((occipital * 0.4 + c_meso * 0.4) * m_glu * m_da * 0.65)
    tot_p   = delta_p + theta_p + alpha_p + beta_p + gamma_p + 0.001

    eeg_channels = {
        'Fp1': round((frontal * 0.42 + midbrain * 0.15) * m_glu - (m_gaba * 8), 1),
        'Fp2': round((frontal * 0.44 + midbrain * 0.15) * m_glu - (m_gaba * 8) + 1.2, 1),
        'F3':  round((frontal * 0.38) * m_da, 1),
        'F4':  round((frontal * 0.39) * m_da + 0.9, 1),
        'C3':  round((cerebrum * 0.45 + cerebellum * 0.2) * m_ach, 1),
        'Cz':  round((cerebrum * 0.48 + cerebellum * 0.2) * m_ach + 1.4, 1),
        'C4':  round((cerebrum * 0.45 + cerebellum * 0.2) * m_ach - 0.4, 1),
        'T3':  round((amygdala * 0.42 + temporal * 0.2) * m_ne, 1),
        'T4':  round((amygdala * 0.44 + temporal * 0.2) * m_ne + 1.1, 1),
        'P3':  round((parietal * 0.45 - frontal * 0.1), 1),
        'P4':  round((parietal * 0.46 - frontal * 0.1) + 0.5, 1),
        'O1':  round((occipital * 0.55) * m_glu, 1),
        'O2':  round((occipital * 0.57) * m_glu + 0.8, 1)
    }

    # টেস্ট ২: fMRI BOLD
    bold_frontal  = round(frontal * 0.052, 2)
    bold_temporal = round(temporal * 0.048, 2)
    bold_thalamus = round(thalamus * 0.055, 2)
    bold_brainstem= round(((midbrain + pons + medulla) / 3.0) * 0.046, 2)
    mean_bold     = round((bold_frontal + bold_temporal + bold_thalamus + bold_brainstem) / 4.0, 2)

    # টেস্ট ৩: fNIRS
    hbo = round(((frontal + occipital) / 2.0) * 0.13, 2)
    hbr = round(-1.0 * (hbo * 0.44), 2)
    toi = round(65.0 + (hbo * 1.5) - (m_ne * 3.0), 1)

    # টেস্ট ৪: MEG
    dipole_ft = round(abs(m_glu * 55 - m_gaba * 48) * 1.9, 1)

    # টেস্ট ৫: Pupillometry
    pupil_mm = round(max(2.0, min(8.4, 2.2 + (m_ne * 3.0) - (m_ach * 0.9))), 2)

    return {
        'timeline': {
            'current_minute': cur_t,
            'duration_minutes': total_t,
            'paradigm': paradigm,
            'phase_name': phase_name,
            'fatigue_factor': round(fatigue_factor, 2)
        },
        'regions': regions,
        'diagnostics': {
            'eeg': {
                'channels': eeg_channels,
                'spectral_bands': {
                    'delta': round((delta_p / tot_p) * 100),
                    'theta': round((theta_p / tot_p) * 100),
                    'alpha': round((alpha_p / tot_p) * 100),
                    'beta':  round((beta_p / tot_p) * 100),
                    'gamma': round((gamma_p / tot_p) * 100)
                }
            },
            'fmri': {
                'mean_bold': mean_bold,
                'bold_frontal': bold_frontal,
                'bold_temporal': bold_temporal,
                'bold_thalamus': bold_thalamus,
                'bold_brainstem': bold_brainstem
            },
            'fnirs': {
                'hbo': hbo,
                'hbr': hbr,
                'toi': toi
            },
            'meg': {
                'dipole_strength_ft': dipole_ft
            },
            'pupillometry': {
                'diameter_mm': pupil_mm,
                'state': 'Sympathetic Dilation' if m_ne > 1.05 else 'Parasympathetic Constriction'
            }
        }
    }