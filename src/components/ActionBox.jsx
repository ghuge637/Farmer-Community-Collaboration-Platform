import { useNavigate } from 'react-router-dom';
import { MdSupportAgent, MdAgriculture, MdRecommend } from 'react-icons/md';
import './ActionBox.css';
import { useTranslation } from '../i18n';

export default function ActionBox() {
  const { t, lang } = useTranslation();
  const navigate = useNavigate();
  return (
    <div className="action-box">
      <button className="action-btn" onClick={() => navigate('/experts')} aria-label={t('nav.expertAdvisory') || "Expert Advisory"}>
        <MdSupportAgent size={22} /> {t('nav.expertAdvisory') || "Expert Advisory"}
      </button>
      <button className="action-btn" onClick={() => navigate('/labor')} aria-label={t('nav.laborService') || "Labor Service"}>
        <MdAgriculture size={22} /> {t('nav.laborService') || "Labor Service"}
      </button>
      <button className="action-btn" onClick={() => navigate('/crop-recommendation')} aria-label={t('nav.cropRecommendation') || "Crop Recommendation"}>
        <MdRecommend size={22} /> {t('nav.cropRecommendation') || "Crop Recommendation"}
      </button>
    </div>
  );
}
