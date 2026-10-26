from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import joblib
import pandas as pd
import os
import json

# 📍 Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

crop_model_path = os.path.join(BASE_DIR, 'crop_model.pkl')
fertilizer_model_path = os.path.join(BASE_DIR, 'fertilizer_model.pkl')

# ? Load models
crop_model = joblib.load(crop_model_path)
_fertilizer_bundle = joblib.load(fertilizer_model_path)

if isinstance(_fertilizer_bundle, dict) and 'model' in _fertilizer_bundle:
    fertilizer_model = _fertilizer_bundle['model']
    fertilizer_le_soil = _fertilizer_bundle.get('le_soil')
    fertilizer_le_crop = _fertilizer_bundle.get('le_crop')
    fertilizer_le_fert = _fertilizer_bundle.get('le_fert')
    fertilizer_feature_order = _fertilizer_bundle.get('feature_order')
    fertilizer_full_names = _fertilizer_bundle.get('fertilizer_full_names')
else:
    fertilizer_model = _fertilizer_bundle
    fertilizer_le_soil = None
    fertilizer_le_crop = None
    fertilizer_le_fert = None
    fertilizer_feature_order = None
    fertilizer_full_names = None


def _normalize_feature_key(name):
    cleaned = str(name).strip().lower().replace(' ', '').replace('_', '')
    if cleaned in {'n', 'nitrogen', 'inputn'}:
        return 'N'
    if cleaned in {'p', 'phosphorous', 'phosphorus', 'inputp'}:
        return 'P'
    if cleaned in {'k', 'potassium', 'inputk'}:
        return 'K'
    if cleaned in {'temperature', 'temp'}:
        return 'temperature'
    if cleaned in {'humidity', 'humid'}:
        return 'humidity'
    if cleaned in {'ph'}:
        return 'pH'
    if cleaned in {'rainfall', 'rain'}:
        return 'rainfall'
    if cleaned in {'crop', 'croptype', 'cropname', 'inputcrop'}:
        return 'crop'
    if cleaned in {'soil', 'soiltype', 'soilname', 'soilkind', 'inputsoil'}:
        return 'soil'
    return None


def _build_feature_frame(model, values):
    feature_names = getattr(model, 'feature_names_in_', None)
    if feature_names is None:
        columns = ['N', 'P', 'K', 'temperature', 'humidity', 'pH', 'rainfall']
        return pd.DataFrame([[values[c] for c in columns]], columns=columns)

    row = {}
    for name in feature_names:
        mapped = _normalize_feature_key(name)
        if mapped is None:
            raise ValueError(f'Unsupported feature: {name}')
        if mapped not in values:
            raise ValueError(f'Missing feature: {mapped}')
        row[name] = values[mapped]
    return pd.DataFrame([row], columns=feature_names)


def _build_fertilizer_frame(values):
    feature_names = getattr(fertilizer_model, 'feature_names_in_', None)
    if feature_names is not None:
        return _build_feature_frame(fertilizer_model, values)

    if fertilizer_feature_order:
        row = {}
        for name in fertilizer_feature_order:
            mapped = _normalize_feature_key(name)
            if mapped is None:
                raise ValueError(f'Unsupported feature: {name}')
            if mapped not in values:
                raise ValueError(f'Missing feature: {mapped}')
            row[name] = values[mapped]
        columns = list(fertilizer_feature_order)
        missing = [c for c in row if row[c] is None]
        if missing:
            raise ValueError(f'Missing feature(s): {missing}')
        return pd.DataFrame([row], columns=columns)

    n_features = getattr(fertilizer_model, 'n_features_in_', None)
    if n_features == 8:
        columns = ['N', 'P', 'K', 'temperature', 'humidity', 'pH', 'rainfall', 'crop']
    elif n_features == 7:
        columns = ['N', 'P', 'K', 'temperature', 'humidity', 'pH', 'rainfall']
    elif n_features == 6:
        columns = ['N', 'P', 'K', 'temperature', 'humidity', 'pH']
    elif n_features == 5:
        if fertilizer_le_soil is not None and fertilizer_le_crop is not None:
            columns = ['soil', 'crop', 'N', 'K', 'P']
        else:
            columns = ['soil', 'crop', 'N', 'P', 'K']
    elif n_features == 4:
        columns = ['N', 'P', 'K', 'crop'] if 'crop' in values else ['N', 'P', 'K', 'temperature']
    elif n_features == 3:
        columns = ['N', 'P', 'K']
    else:
        columns = ['soil', 'crop', 'N', 'P', 'K'] if ('soil' in values and 'crop' in values) else ['N', 'P', 'K']

    missing = [c for c in columns if c not in values]
    if missing:
        raise ValueError(f'Missing feature(s): {missing}')
    return pd.DataFrame([[values[c] for c in columns]], columns=columns)


def _encode_label(encoder, value, field_name):
    if encoder is None:
        return value.strip() if isinstance(value, str) else value
    if value is None:
        return None

    candidates = []
    if isinstance(value, str):
        raw = value.strip()
        if raw:
            candidates = [raw, raw.title(), raw.lower(), raw.upper()]
    else:
        candidates = [value]

    for candidate in candidates:
        try:
            return int(encoder.transform([candidate])[0])
        except Exception:
            continue
    raise ValueError(f'Invalid {field_name}: {value}')


def _prepare_fertilizer_values(values):
    fert_values = dict(values)
    if 'soil' in fert_values:
        fert_values['soil'] = _encode_label(fertilizer_le_soil, fert_values['soil'], 'soil')
    if 'crop' in fert_values:
        fert_values['crop'] = _encode_label(fertilizer_le_crop, fert_values['crop'], 'crop')
    return fert_values


def _decode_fertilizer_label(label):
    decoded = label
    if fertilizer_le_fert is not None:
        try:
            decoded = fertilizer_le_fert.inverse_transform([label])[0]
        except Exception:
            decoded = label
    if fertilizer_full_names:
        if decoded in fertilizer_full_names:
            return fertilizer_full_names[decoded]
        if label in fertilizer_full_names:
            return fertilizer_full_names[label]
    return decoded

# 🌱 Soil Fertility Analysis Function
def analyze_soil_fertility(N, P, K, ph):
    def level(val, low, high):
        if val < low:
            return "Low"
        elif val > high:
            return "High"
        else:
            return "Optimal"

    nitrogen_status = level(N, 50, 150)
    phosphorus_status = level(P, 30, 90)
    potassium_status = level(K, 50, 120)

    if ph < 5.5:
        ph_status = "Too Acidic"
    elif ph > 7.5:
        ph_status = "Too Alkaline"
    else:
        ph_status = "Neutral"

    return {
        "Nitrogen": nitrogen_status,
        "Phosphorus": phosphorus_status,
        "Potassium": potassium_status,
        "pH": ph_status
    }

# 🌾 View Function


def predict_crop(request):
    prediction = ''
    fertilizers = []
    soil_health = {}

    if request.method == 'POST':
        N = float(request.POST['N'])
        P = float(request.POST['P'])
        K = float(request.POST['K'])
        temperature = float(request.POST['temperature'])
        humidity = float(request.POST['humidity'])
        pH = float(request.POST['pH'])
        rainfall = float(request.POST['rainfall'])

        values = {
            'N': N,
            'P': P,
            'K': K,
            'temperature': temperature,
            'humidity': humidity,
            'pH': pH,
            'rainfall': rainfall
        }

        input_data = _build_feature_frame(crop_model, values)
        prediction = crop_model.predict(input_data)[0]

        soil_health = analyze_soil_fertility(N, P, K, pH)

        fertilizers = ["No Suggestion"] * 3
        try:
            fert_values = _prepare_fertilizer_values({**values, 'crop': prediction})
            fert_input = _build_fertilizer_frame(fert_values)
            fert_pred = fertilizer_model.predict(fert_input)
            if isinstance(fert_pred, (list, tuple)):
                fert_items = list(fert_pred)
            else:
                try:
                    fert_items = list(fert_pred)
                except TypeError:
                    fert_items = [fert_pred]
            fert_list = [str(_decode_fertilizer_label(item)) for item in fert_items]
            if len(fert_list) < 3:
                fert_list.extend(["No Suggestion"] * (3 - len(fert_list)))
            fertilizers = fert_list[:3]
        except Exception:
            fertilizers = ["No Suggestion"] * 3

    return render(request, 'index.html', {
        'prediction': prediction,
        'fertilizers': fertilizers,
        'soil_health': soil_health
    })


@csrf_exempt
def predict_crop_api(request):
    if request.method != 'POST':
        return JsonResponse({'detail': 'Method not allowed'}, status=405)

    try:
        payload = json.loads(request.body.decode('utf-8') or '{}')
    except json.JSONDecodeError:
        return JsonResponse({'detail': 'Invalid JSON body'}, status=400)

    key_map = {
        'N': 'N',
        'P': 'P',
        'K': 'K',
        'temperature': 'temperature',
        'humidity': 'humidity',
        'pH': 'pH',
        'rainfall': 'rainfall',
        'n': 'N',
        'p': 'P',
        'k': 'K',
        'ph': 'pH',
        'crop': 'crop',
        'soil': 'soil',
        'soil_type': 'soil',
        'input_crop': 'crop',
        'input_soil': 'soil',
        'input_n': 'N',
        'input_p': 'P',
        'input_k': 'K',
    }

    normalized = {}
    for key, value in payload.items():
        mapped = key_map.get(key)
        if mapped:
            normalized[mapped] = value

    required_crop_fields = ['N', 'P', 'K', 'temperature', 'humidity', 'pH', 'rainfall']
    required_fert_fields = ['N', 'P', 'K', 'crop', 'soil']
    has_crop_inputs = all(key in normalized for key in required_crop_fields)
    has_fert_inputs = all(key in normalized for key in required_fert_fields)

    if not has_crop_inputs and not has_fert_inputs:
        missing = sorted(
            set(
                [key for key in required_crop_fields if key not in normalized]
                + [key for key in required_fert_fields if key not in normalized]
            )
        )
        return JsonResponse({'detail': 'Missing fields', 'missing': missing}, status=400)

    invalid = []

    def to_float(key):
        if key not in normalized:
            return None
        try:
            return float(normalized[key])
        except (TypeError, ValueError):
            invalid.append(key)
            return None

    N = to_float('N')
    P = to_float('P')
    K = to_float('K')
    temperature = to_float('temperature')
    humidity = to_float('humidity')
    pH = to_float('pH')
    rainfall = to_float('rainfall')

    if invalid:
        return JsonResponse({'detail': 'Invalid fields', 'invalid': invalid}, status=400)

    values = {}
    if N is not None:
        values['N'] = N
    if P is not None:
        values['P'] = P
    if K is not None:
        values['K'] = K
    if temperature is not None:
        values['temperature'] = temperature
    if humidity is not None:
        values['humidity'] = humidity
    if pH is not None:
        values['pH'] = pH
    if rainfall is not None:
        values['rainfall'] = rainfall
    input_crop = normalized.get('crop')
    input_soil = normalized.get('soil')
    if input_crop is not None:
        values['crop'] = input_crop
    if input_soil is not None:
        values['soil'] = input_soil

    prediction = None
    top3 = None
    soil_health = {}

    if has_crop_inputs:
        input_data = _build_feature_frame(crop_model, values)
        prediction = crop_model.predict(input_data)[0]
        if hasattr(crop_model, 'predict_proba'):
            try:
                proba = crop_model.predict_proba(input_data)[0]
                classes = getattr(crop_model, 'classes_', None)
                if classes is not None and len(classes) == len(proba):
                    ranked = sorted(zip(classes, proba), key=lambda x: x[1], reverse=True)
                    top3 = [str(item[0]) for item in ranked[:3]]
            except Exception:
                top3 = None
        if not top3:
            top3 = [str(prediction)]
        soil_health = analyze_soil_fertility(N, P, K, pH)
    elif input_crop is not None:
        prediction = input_crop

    fertilizers = ["No Suggestion"] * 3
    try:
        fert_values = dict(values)
        if input_crop is not None:
            fert_values['crop'] = input_crop
        elif prediction is not None:
            fert_values['crop'] = prediction
        if input_soil is not None:
            fert_values['soil'] = input_soil

        fert_values = _prepare_fertilizer_values(fert_values)
        fert_input = _build_fertilizer_frame(fert_values)
        fert_pred = fertilizer_model.predict(fert_input)
        if isinstance(fert_pred, (list, tuple)):
            fert_items = list(fert_pred)
        else:
            try:
                fert_items = list(fert_pred)
            except TypeError:
                fert_items = [fert_pred]
        fert_list = [str(_decode_fertilizer_label(item)) for item in fert_items]
        if len(fert_list) < 3:
            fert_list.extend(["No Suggestion"] * (3 - len(fert_list)))
        fertilizers = fert_list[:3]
    except Exception:
        fertilizers = ["No Suggestion"] * 3

    return JsonResponse({
        'prediction': prediction,
        'top3': top3,
        'fertilizers': fertilizers,
        'soil_health': soil_health
    })
