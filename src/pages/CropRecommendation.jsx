import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { useTranslation } from '../i18n';
import { getApiBaseUrl } from '../services/api';
import { MdScience, MdThermostat, MdWaterDrop, MdOpacity, MdInvertColors, MdCloud, MdGrass, MdTerrain, MdAgriculture, MdRefresh, MdCheckCircle } from 'react-icons/md';
import './Home.css';

export default function CropRecommendation() {
  const { t } = useTranslation();
  const isTunnel = typeof window !== 'undefined' && window.location.hostname.includes('devtunnels.ms');
  const tunnelUrl = 'https://zzw7jh2s-8000.inc1.devtunnels.ms/api/predict/';
  const localUrl = import.meta.env.VITE_CROP_API_URL || (getApiBaseUrl().startsWith('http') ? getApiBaseUrl().replace(/:8080.*/, ':8000/api/predict/') : 'http://127.0.0.1:8000/api/predict/');
  const apiUrl = isTunnel ? tunnelUrl : localUrl;
  const tr = (key, fallback, vars) => (vars ? t(key, vars) : t(key)) || fallback;
  const resolveError = (err, fallbackKey, fallbackText) => {
    const message = err?.message;
    if (!message) return tr(fallbackKey, fallbackText);
    if (message === 'Crop API URL is not configured.') {
      return tr('cropRecommendation.apiMissing', 'Crop API URL is not configured.');
    }
    if (message === 'Bad response from crop API.') {
      return tr('cropRecommendation.apiBadResponse', 'Bad response from crop API.');
    }
    if (message === 'No results') {
      return tr('cropRecommendation.noResults', 'No recommendations found. Please try different values.');
    }
    return message;
  };

  const defaultForm = {
    n: '82',
    p: '49',
    k: '78',
    temperature: '25',
    humidity: '60',
    ph: '6.5',
    rainfall: '200'
  };

  const [form, setForm] = useState(defaultForm);
  const [cropResults, setCropResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const defaultFertForm = {
    soil: 'Loamy',
    crop: 'Cotton',
    n: '82',
    p: '49',
    k: '78'
  };

  const soilOptions = ['Black', 'Clayey', 'Loamy', 'Red', 'Sandy'];
  const cropOptions = ['Barley', 'Cotton', 'Ground Nuts', 'Maize', 'Millets', 'Oil seeds', 'Paddy', 'Pulses', 'Sugarcane', 'Tobacco', 'Wheat'];

  const [fertForm, setFertForm] = useState(defaultFertForm);
  const [fertilizerResults, setFertilizerResults] = useState([]);
  const [fertCrop, setFertCrop] = useState('');
  const [fertLoading, setFertLoading] = useState(false);
  const [fertError, setFertError] = useState('');

  const makeChangeHandler = (setter) => (key) => (event) => {
    setter((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const handleChange = makeChangeHandler(setForm);
  const handleFertChange = makeChangeHandler(setFertForm);

  const formatCropName = (value) => {
    if (!value) return '';
    const key = String(value).toLowerCase().replace(/_/g, '').replace(/\s/g, '');
    const translated = t(`crops.${key}`);
    if (translated) return translated;
    return String(value)
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const formatFertilizerName = (value) => {
    if (!value) return '';
    const key = String(value).toLowerCase().replace(/_/g, '').replace(/\s/g, '');
    const translated = t(`fertilizers.${key}`);
    if (translated) return translated;
    return String(value)
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const handleReset = () => {
    setForm(defaultForm);
    setCropResults([]);
    setError('');
  };

  const handleFertReset = () => {
    setFertForm(defaultFertForm);
    setFertilizerResults([]);
    setFertCrop('');
    setFertError('');
  };

  const requestPrediction = async (payload) => {
    if (!apiUrl) {
      throw new Error('Crop API URL is not configured.');
    }

    const targetUrl = (apiUrl && apiUrl.includes('172.24.50.1')) ? apiUrl : 'http://172.24.50.1:8000/api/predict/';
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      let detail = 'Bad response from crop API.';
      try {
        const errorData = await response.json();
        if (errorData?.detail) {
          detail = errorData.detail;
        }
      } catch {
        // ignore JSON parse errors
      }
      throw new Error(detail);
    }
    const data = await response.json();
    return { data };
  };

  const normalizeList = (value) => {
    if (Array.isArray(value)) return value;
    if (value) return [value];
    return [];
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setCropResults([]);
    setLoading(true);

    const payload = {
      N: Number(form.n),
      P: Number(form.p),
      K: Number(form.k),
      temperature: Number(form.temperature),
      humidity: Number(form.humidity),
      pH: Number(form.ph),
      rainfall: Number(form.rainfall)
    };

    const values = Object.values(payload);
    if (values.some((v) => Number.isNaN(v))) {
      setError(tr('cropRecommendation.validation', 'Please enter valid numbers for all fields.'));
      setLoading(false);
      return;
    }

    try {
      const { data } = await requestPrediction(payload);
      const candidate =
        data?.top3 ||
        data?.recommendations ||
        data?.crops ||
        data?.results ||
        data?.prediction ||
        [];
      const top3 = normalizeList(candidate);
      if (top3.length === 0) {
        throw new Error('No results');
      }
      setCropResults(top3.slice(0, 3));
    } catch (err) {
      setError(resolveError(err, 'cropRecommendation.error', 'Could not get recommendations. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleFertilizerSubmit = async (event) => {
    event.preventDefault();
    setFertError('');
    setFertilizerResults([]);
    setFertCrop('');
    setFertLoading(true);

    const payload = {
      soil: fertForm.soil?.trim(),
      crop: fertForm.crop?.trim(),
      N: Number(fertForm.n),
      P: Number(fertForm.p),
      K: Number(fertForm.k)
    };

    if (!payload.soil || !payload.crop) {
      setFertError(tr('cropRecommendation.fertilizerRequired', 'Soil and crop are required.'));
      setFertLoading(false);
      return;
    }

    const values = [payload.N, payload.P, payload.K];
    if (values.some((v) => Number.isNaN(v))) {
      setFertError(tr('cropRecommendation.validation', 'Please enter valid numbers for all fields.'));
      setFertLoading(false);
      return;
    }

    try {
      const { data } = await requestPrediction(payload);
      const fertCandidate = data?.fertilizers || data?.fertilizer || [];
      const fertList = normalizeList(fertCandidate).filter(Boolean);
      if (fertList.length === 0) {
        throw new Error('No results');
      }
      setFertilizerResults(fertList.slice(0, 1));
      setFertCrop(data?.prediction || '');
    } catch (err) {
      setFertError(resolveError(err, 'cropRecommendation.error', 'Could not get recommendations. Please try again.'));
    } finally {
      setFertLoading(false);
    }
  };

  return (
    <div className="home">
      <Sidebar />
      <main className="feed" style={{ maxWidth: '100%' }}>
        <section className="crop-advisor">
          <header className="crop-advisor-header">
            <div className="crop-advisor-title">
              <div className="crop-advisor-icon">
                <MdScience size={32} />
              </div>
              <div>
                <h2>{tr('cropRecommendation.title', 'Crop Advisory')}</h2>
                <p className="crop-advisor-subtitle">
                  {tr('cropRecommendation.subtitle', 'Enter your soil and weather values to get top crop recommendations.')}
                </p>
              </div>
            </div>
          </header>

          <div className="crop-advisor-grid">
            <form className="crop-advisor-form" onSubmit={handleSubmit}>
              <div className="crop-advisor-form-header">
                <h3>{tr('cropRecommendation.formTitle', 'Input Parameters')}</h3>
                <span className="crop-advisor-helper">
                  {tr('cropRecommendation.helper', 'All fields are required.')}
                </span>
              </div>
              <div className="crop-advisor-fields">
                <label className="crop-advisor-field">
                  <div className="field-label">
                    <MdGrass className="field-icon n-icon" />
                    <span>{tr('cropRecommendation.nitrogen', 'Nitrogen (N)')}</span>
                  </div>
                  <input type="number" min="0" step="1" required value={form.n} onChange={handleChange('n')} placeholder={tr('cropRecommendation.placeholderNitrogen', 'e.g. 80')} />
                </label>
                <label className="crop-advisor-field">
                  <div className="field-label">
                    <MdTerrain className="field-icon p-icon" />
                    <span>{tr('cropRecommendation.phosphorous', 'Phosphorous (P)')}</span>
                  </div>
                  <input type="number" min="0" step="1" required value={form.p} onChange={handleChange('p')} placeholder={tr('cropRecommendation.placeholderPhosphorous', 'e.g. 40')} />
                </label>
                <label className="crop-advisor-field">
                  <div className="field-label">
                    <MdScience className="field-icon k-icon" />
                    <span>{tr('cropRecommendation.potassium', 'Potassium (K)')}</span>
                  </div>
                  <input type="number" min="0" step="1" required value={form.k} onChange={handleChange('k')} placeholder={tr('cropRecommendation.placeholderPotassium', 'e.g. 40')} />
                </label>
                <label className="crop-advisor-field">
                  <div className="field-label">
                    <MdThermostat className="field-icon temp-icon" />
                    <span>{tr('cropRecommendation.temperature', 'Temperature (C)')}</span>
                  </div>
                  <input type="number" min="-10" step="0.1" required value={form.temperature} onChange={handleChange('temperature')} placeholder={tr('cropRecommendation.placeholderTemperature', '25.0')} />
                </label>
                <label className="crop-advisor-field">
                  <div className="field-label">
                    <MdOpacity className="field-icon humidity-icon" />
                    <span>{tr('cropRecommendation.humidity', 'Humidity (%)')}</span>
                  </div>
                  <input type="number" min="0" max="100" step="0.1" required value={form.humidity} onChange={handleChange('humidity')} placeholder={tr('cropRecommendation.placeholderHumidity', '60.0')} />
                </label>
                <label className="crop-advisor-field">
                  <div className="field-label">
                    <MdInvertColors className="field-icon ph-icon" />
                    <span>{tr('cropRecommendation.ph', 'Soil pH')}</span>
                  </div>
                  <input type="number" min="0" max="14" step="0.1" required value={form.ph} onChange={handleChange('ph')} placeholder={tr('cropRecommendation.placeholderPh', '6.5')} />
                </label>
                <label className="crop-advisor-field">
                  <div className="field-label">
                    <MdCloud className="field-icon rain-icon" />
                    <span>{tr('cropRecommendation.rainfall', 'Rainfall (mm)')}</span>
                  </div>
                  <input type="number" min="0" step="0.1" required value={form.rainfall} onChange={handleChange('rainfall')} placeholder={tr('cropRecommendation.placeholderRainfall', '200')} />
                </label>
              </div>
              <div className="crop-advisor-actions">
                <button type="button" className="crop-advisor-btn secondary" onClick={handleReset}>
                  <MdRefresh size={18} style={{ marginRight: 6 }} />
                  {tr('cropRecommendation.reset', 'Reset')}
                </button>
                <button type="submit" className="crop-advisor-btn primary" disabled={loading}>
                  {loading
                    ? tr('cropRecommendation.loading', 'Generating recommendations...')
                    : <><MdScience size={18} style={{ marginRight: 6 }} /> {tr('cropRecommendation.getAdvisory', 'Get Advisory')}</>}
                </button>
              </div>
              <div className="crop-advisor-note">
                {tr('cropRecommendation.unitsNote', 'Tip: Use local soil test values for best accuracy.')}
              </div>
            </form>

            <div className="crop-advisor-results">
              <div className="crop-advisor-results-header">
                <h3>{tr('cropRecommendation.resultsTitle', 'Top Recommendations')}</h3>
              </div>

              {loading ? (
                <div className="crop-advisor-status loading">
                  {tr('cropRecommendation.loading', 'Generating recommendations...')}
                </div>
              ) : error ? (
                <div className="crop-advisor-status error">{error}</div>
              ) : cropResults.length > 0 ? (
                <>
                  <ol className="crop-advisor-results-list">
                    {cropResults.map((crop, index) => (
                      <li key={`${crop}-${index}`} className="crop-advisor-result-card">
                        <div className="crop-advisor-rank">
                          <span className="rank-badge">{index + 1}</span>
                          {/* {tr('cropRecommendation.rank', 'Rank {rank}').replace('{rank}', String(index + 1))} */}
                        </div>
                        <div className="crop-advisor-crop">{formatCropName(crop)}</div>
                      </li>
                    ))}
                  </ol>
                </>
              ) : (
                <div className="crop-advisor-status empty">
                  <div className="crop-advisor-empty-title">
                    {tr('cropRecommendation.placeholderTitle', 'No results yet')}
                  </div>
                  <div className="crop-advisor-empty-text">
                    {tr('cropRecommendation.placeholderText', 'Fill the form and click Get Advisory to see top crops.')}
                  </div>
                </div>
              )}

            </div>
          </div>
          <div className="crop-advisor-section">
            <div className="crop-advisor-grid">
              <form className="crop-advisor-form" onSubmit={handleFertilizerSubmit}>
                <div className="crop-advisor-form-header">
                  <h3>{tr('cropRecommendation.fertilizerFormTitle', 'Fertilizer Suggestions')}</h3>
                  <span className="crop-advisor-helper">
                    {tr('cropRecommendation.fertilizerSubtitle', 'Use the same inputs to get fertilizer suggestions.')}
                  </span>
                </div>
                <div className="crop-advisor-fields">
                  <label className="crop-advisor-field">
                    <div className="field-label">
                      <MdTerrain className="field-icon soil-icon" />
                      <span>{tr('cropRecommendation.soilType', 'Soil Type')}</span>
                    </div>
                    <select required value={fertForm.soil} onChange={handleFertChange('soil')}>
                      {soilOptions.map((soil) => (
                        <option key={soil} value={soil}>
                          {t(`soils.${soil.toLowerCase()}`) || soil}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="crop-advisor-field">
                    <div className="field-label">
                      <MdAgriculture className="field-icon crop-icon" />
                      <span>{tr('cropRecommendation.cropName', 'Crop')}</span>
                    </div>
                    <select required value={fertForm.crop} onChange={handleFertChange('crop')}>
                      {cropOptions.map((crop) => (
                        <option key={crop} value={crop}>
                          {t(`crops.${crop.toLowerCase().replace(/\s/g, '')}`) || crop}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="crop-advisor-field">
                    <div className="field-label">
                      <MdGrass className="field-icon n-icon" />
                      <span>{tr('cropRecommendation.nitrogen', 'Nitrogen (N)')}</span>
                    </div>
                  <input type="number" min="0" step="1" required value={fertForm.n} onChange={handleFertChange('n')} placeholder={tr('cropRecommendation.placeholderFertNitrogen', 'e.g. 50')} />
                  </label>
                  <label className="crop-advisor-field">
                    <div className="field-label">
                      <MdTerrain className="field-icon p-icon" />
                      <span>{tr('cropRecommendation.phosphorous', 'Phosphorous (P)')}</span>
                    </div>
                  <input type="number" min="0" step="1" required value={fertForm.p} onChange={handleFertChange('p')} placeholder={tr('cropRecommendation.placeholderFertPhosphorous', 'e.g. 50')} />
                  </label>
                  <label className="crop-advisor-field">
                    <div className="field-label">
                      <MdScience className="field-icon k-icon" />
                      <span>{tr('cropRecommendation.potassium', 'Potassium (K)')}</span>
                    </div>
                  <input type="number" min="0" step="1" required value={fertForm.k} onChange={handleFertChange('k')} placeholder={tr('cropRecommendation.placeholderFertPotassium', 'e.g. 50')} />
                  </label>
                </div>
                <div className="crop-advisor-actions">
                  <button type="button" className="crop-advisor-btn secondary" onClick={handleFertReset}>
                    <MdRefresh size={18} style={{ marginRight: 6 }} />
                    {tr('cropRecommendation.reset', 'Reset')}
                  </button>
                  <button type="submit" className="crop-advisor-btn primary" disabled={fertLoading}>
                    {fertLoading
                      ? tr('cropRecommendation.loading', 'Generating recommendations...')
                      : <><MdAgriculture size={18} style={{ marginRight: 6 }} /> {tr('cropRecommendation.fertilizerButton', 'Get Fertilizer')}</>}
                  </button>
                </div>
                <div className="crop-advisor-note">
                  {tr('cropRecommendation.unitsNote', 'Tip: Use local soil test values for best accuracy.')}
                </div>
              </form>

              <div className="crop-advisor-results">
                <div className="crop-advisor-results-header">
                  <h3>{tr('cropRecommendation.fertilizerResultsTitle', 'Top Fertilizers')}</h3>
                </div>

                {fertLoading ? (
                  <div className="crop-advisor-status loading">
                    {tr('cropRecommendation.loading', 'Generating recommendations...')}
                  </div>
                ) : fertError ? (
                  <div className="crop-advisor-status error">{fertError}</div>
                ) : fertilizerResults.length > 0 ? (
                  <>
                    {fertCrop && (
                      <div className="crop-advisor-fertilizer-crop">
                        {tr('cropRecommendation.fertilizerForCrop', 'For crop: {crop}', { crop: formatCropName(fertCrop) })}
                      </div>
                    )}
                    <ul className="crop-advisor-fertilizers-list">
                      {fertilizerResults.map((item, index) => (
                        <li key={`${item}-${index}`} className="crop-advisor-fertilizers-item">
                          <MdCheckCircle className="result-icon" />
                          {formatFertilizerName(item)}
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <div className="crop-advisor-status empty">
                    <div className="crop-advisor-empty-title">
                      {tr('cropRecommendation.fertilizerEmptyTitle', 'No fertilizer results yet')}
                    </div>
                    <div className="crop-advisor-empty-text">
                      {tr('cropRecommendation.fertilizerEmptyText', 'Fill the form and click Get Fertilizer to see suggestions.')}
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        </section>
      </main>
      <div className="home-weather-panel" />
    </div>
  );
}
