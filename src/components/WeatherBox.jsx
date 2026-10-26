import { useEffect, useState } from 'react';
import { useTranslation } from '../i18n';
import './WeatherBox.css';

export default function WeatherBox() {
  const [city, setCity] = useState('');
  const [tempMin, setTempMin] = useState('');
  const [tempMax, setTempMax] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [weatherCondition, setWeatherCondition] = useState('Partly Cloudy');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t, lang } = useTranslation();

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setCity(lang === 'mr' ? 'पुणे' : 'Pune');
      setTempMin('25.2');
      setTempMax('40.8');
      setWeatherCondition(lang === 'mr' ? 'अंशतः ढगाळ' : 'Partly Cloudy');
      const now = new Date();
      const monthsEn = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      const monthsMr = [
        'जानेवारी', 'फेब्रुवारी', 'मार्च', 'एप्रिल', 'मे', 'जून',
        'जुलै', 'ऑगस्ट', 'सप्टेंबर', 'ऑक्टोबर', 'नोव्हेंबर', 'डिसेंबर'
      ];
      const months = lang === 'mr' ? monthsMr : monthsEn;
      setDateTime(
        `${now.getDate().toString().padStart(2, '0')} ${months[now.getMonth()]} ${now.getFullYear()} | ` +
        `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
      );
      setLoading(false);
    }, 800);
  }, [lang]);

  if (loading) return (
    <section 
      className="weather-info-card weather-info-card-loading" 
      aria-busy="true" 
      aria-label={t('weather.loading')}
      tabIndex={0} 
    >
      {t('weather.loading')}
    </section>
  );
  
  if (error) return (
    <section 
      className="weather-info-card weather-info-card-error" 
      role="alert" 
      tabIndex={0}
    >
      {t('weather.fetchError')}
    </section>
  );

  return (
    <section
      className="weather-info-card"
      aria-label={t('weather.in', { area: city })}
      tabIndex={0}
      role="region"
    >
      {/* Farming suitability indicator */}
      <div className="temp-suitability" aria-label={lang === 'mr' ? 'शेतीसाठी चांगले' : 'Good for farming'}>
        🌾 {lang === 'mr' ? 'चांगले' : 'Good'}
      </div>
      <div className="wic-left">
        <h2 className="wic-city" tabIndex={0}>{city}</h2>
        <div className="wic-datetime" aria-label={lang === 'mr' ? 'दिनांक आणि वेळ' : 'Date and time'} tabIndex={0}>
          {dateTime}
        </div>
        <div className="wic-temp" aria-label={lang === 'mr' ? 'तापमान श्रेणी' : 'Temperature range'} tabIndex={0}>
          <span className="temp-min">{tempMin}°C</span>
          <span className="temp-separator">/</span>
          <span className="temp-max">{tempMax}°C</span>
        </div>
      </div>
      <div className="wic-right">
        <svg
          width={56}
          height={56}
          viewBox="0 0 64 64"
          className="wic-icon"
          aria-label={t('weather.iconLabel')}
          focusable="false"
        >
          <circle cx="40" cy="24" r="14" fill="#FFD93B" />
          <ellipse cx="28" cy="40" rx="16" ry="10" fill="#e0e7ef" />
          <ellipse cx="40" cy="44" rx="10" ry="7" fill="#cfd8dc" />
        </svg>
        <div className="weather-condition">{weatherCondition}</div>
      </div>
    </section>
  );
}