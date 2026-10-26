import { useState, useEffect } from 'react'
import { useTranslation } from '../i18n'
import { INITIAL_SCHEMES, fetchSchemes, evaluateEligibility, getTrackedSchemes, saveTrackedStatus } from '../services/schemes'
import { 
  MdAccountBalance, 
  MdSearch, 
  MdCheckCircle, 
  MdLaunch, 
  MdFilterList, 
  MdBookmark, 
  MdNewReleases, 
  MdStar, 
  MdDescription, 
  MdCheck, 
  MdClose, 
  MdPrint,
  MdGridView,
  MdFormatListBulleted,
  MdHelpOutline,
  MdVerified,
  MdCalendarToday
} from 'react-icons/md'
import './Schemes.css'

export default function Schemes() {
  const { t, lang } = useTranslation()
  const [schemes, setSchemes] = useState(INITIAL_SCHEMES)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [selectedLevel, setSelectedLevel] = useState('ALL')
  const [activeTab, setActiveTab] = useState('all') // 'all' | 'recommended' | 'new' | 'tracked'
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'list'
  const [trackedMap, setTrackedMap] = useState({})
  
  // Eligibility Form state
  const [showForm, setShowForm] = useState(true)
  const [landAcres, setLandAcres] = useState('2.5')
  const [farmerType, setFarmerType] = useState('Small')
  const [crop, setCrop] = useState('Cotton')
  const [stateName, setStateName] = useState('Maharashtra')
  const [income, setIncome] = useState('150000')
  const [evalResultsMap, setEvalResultsMap] = useState({})
  const [isCalculated, setIsCalculated] = useState(false)

  // Document Checklist & Detail Modal State
  const [detailScheme, setDetailScheme] = useState(null)
  const [checkedDocs, setCheckedDocs] = useState({})

  useEffect(() => {
    async function loadData() {
      const tracked = getTrackedSchemes()
      setTrackedMap(tracked)

      // Initial eligibility evaluation
      runEligibilityCheck(INITIAL_SCHEMES, { landAcres: '2.5', farmerType: 'Small', crop: 'Cotton', state: 'Maharashtra', income: '150000' })

      // Fetch dynamic updates if backend API is available
      const remoteData = await fetchSchemes()
      if (Array.isArray(remoteData) && remoteData.length > 0) {
        setSchemes(remoteData)
        runEligibilityCheck(remoteData, { landAcres: '2.5', farmerType: 'Small', crop: 'Cotton', state: 'Maharashtra', income: '150000' })
      }
    }
    loadData()
  }, [])

  function handleStatusChange(schemeId, status) {
    const updated = saveTrackedStatus(schemeId, status)
    setTrackedMap({ ...updated })
  }

  function runEligibilityCheck(schemeList = schemes, params = { landAcres, farmerType, crop, state: stateName, income }) {
    const results = evaluateEligibility(params, schemeList)
    const map = {}
    if (Array.isArray(results)) {
      results.forEach(res => {
        if (res && res.scheme) {
          map[res.scheme.id] = res
        }
      })
    }
    setEvalResultsMap(map)
    setIsCalculated(true)
  }

  function handleFormSubmit(e) {
    e.preventDefault()
    runEligibilityCheck(schemes, { landAcres, farmerType, crop, state: stateName, income })
  }

  function openDocumentModal(scheme) {
    setDetailScheme(scheme)
    const initial = {}
    const docs = lang === 'mr' && scheme.requiredDocumentsMr ? scheme.requiredDocumentsMr : scheme.requiredDocuments
    if (Array.isArray(docs)) {
      docs.forEach((doc, idx) => {
        initial[idx] = false
      })
    }
    setCheckedDocs(initial)
  }

  function toggleDocCheck(idx) {
    setCheckedDocs(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }))
  }

  // Filter schemes based on Search, Category, Level, and Active Tab
  const filteredSchemes = (schemes || []).filter(s => {
    if (!s) return false
    const title = (lang === 'mr' && s.titleMr ? s.titleMr : s.title) || ''
    const desc = (lang === 'mr' && s.descriptionMr ? s.descriptionMr : s.description) || ''
    
    const matchesSearch = !search || 
      title.toLowerCase().includes(search.toLowerCase()) ||
      desc.toLowerCase().includes(search.toLowerCase())

    const matchesCategory = selectedCategory === 'ALL' || s.category === selectedCategory
    const matchesLevel = selectedLevel === 'ALL' || s.level === selectedLevel

    if (activeTab === 'new') {
      return matchesSearch && matchesCategory && matchesLevel && Boolean(s.isNew)
    }
    if (activeTab === 'recommended') {
      const evalRes = evalResultsMap[s.id]
      return matchesSearch && matchesCategory && matchesLevel && evalRes && evalRes.score >= 80
    }
    if (activeTab === 'tracked') {
      const trackState = trackedMap[s.id]?.status
      return matchesSearch && matchesCategory && matchesLevel && trackState && trackState !== 'NONE'
    }

    return matchesSearch && matchesCategory && matchesLevel
  })

  // Categories list
  const categories = [
    { id: 'ALL', label: lang === 'mr' ? 'सर्व वर्ग (All Categories)' : 'All Categories' },
    { id: 'DIRECT_BENEFIT', label: lang === 'mr' ? 'थेट बँक हस्तांतरण (DBT)' : 'Direct Cash Transfer' },
    { id: 'SOLAR_POWER', label: lang === 'mr' ? 'सौर कृषी पंप' : 'Solar Power' },
    { id: 'CROP_INSURANCE', label: lang === 'mr' ? 'पीक विमा' : 'Crop Insurance' },
    { id: 'IRRIGATION', label: lang === 'mr' ? 'सिंचन व ठिबक' : 'Irrigation & Water' },
    { id: 'MACHINERY', label: lang === 'mr' ? 'कृषी अवजारे व ट्रॅक्टर' : 'Farm Machinery' },
    { id: 'CREDIT_WAIVER', label: lang === 'mr' ? 'पीक कर्ज (KCC)' : 'Credit & Loans' },
    { id: 'SEEDS_FERTILIZER', label: lang === 'mr' ? 'बियाणे व माती आरोग्य' : 'Seeds & Soil Health' }
  ]

  const totalEligibleCount = Object.values(evalResultsMap).filter(v => v && v.eligible).length

  return (
    <div className="schemes-page">
      {/* 1. Official Government Banner */}
      <header className="gov-official-header">
        <div className="header-content">
          <div className="official-emblem">
            <MdAccountBalance size={32} />
          </div>
          <div>
            <span className="dept-name">
              {lang === 'mr' ? 'कृषी मंत्रालय व राज्य कृषी विभाग' : 'Ministry of Agriculture & Farmers Welfare'}
            </span>
            <h1>
              {lang === 'mr' ? 'शासकीय योजना व सबसिडी पोर्टल' : 'Government Agricultural Schemes Directory'}
            </h1>
            <p className="header-subtitle">
              {lang === 'mr' 
                ? 'शासकीय कृषी योजना, अनुदानाची रक्कम, पात्रता व अर्जासाठी आवश्यक कागदपत्रांची अधिकृत माहिती.' 
                : 'Official directory of Central & State government schemes, subsidy benefits, eligibility criteria, and document checklists.'}
            </p>
          </div>
        </div>

        <div className="header-actions">
          <button className="calculator-btn" onClick={() => setShowForm(!showForm)}>
            <MdFilterList size={20} />
            <span>{showForm ? (lang === 'mr' ? 'पात्रता निकष लपवा' : 'Hide Calculator') : (lang === 'mr' ? 'माझी पात्रता तपासा' : 'Check My Eligibility')}</span>
          </button>
        </div>
      </header>

      {/* 2. Structured Farmer Eligibility Calculator Form */}
      {showForm && (
        <section className="eligibility-calculator-card">
          <div className="card-title-bar">
            <div>
              <h2>{lang === 'mr' ? 'पात्रता तपासणी इंजिन (Smart Eligibility Evaluator)' : 'Smart Scheme Eligibility Evaluator'}</h2>
              <p>{lang === 'mr' ? 'खालील शेती तपशील निवडा. सिस्टीम आपल्यासाठी पात्र योजना दर्शवेल.' : 'Enter your land size, crop, and location to filter matching government schemes.'}</p>
            </div>
            {isCalculated && (
              <div className="eligibility-result-pill">
                <MdVerified size={18} />
                <span>{lang === 'mr' ? `पात्र योजना: ${schemes.length} पैकी ${totalEligibleCount}` : `Matched ${totalEligibleCount} of ${schemes.length} Schemes`}</span>
              </div>
            )}
          </div>

          <form onSubmit={handleFormSubmit} className="calculator-grid">
            <div className="field-group">
              <label>{lang === 'mr' ? 'जमीन धारणा (एकरमध्ये):' : 'Landholding Size (Acres):'}</label>
              <input 
                type="number" 
                step="0.5"
                min="0.5" 
                max="100"
                value={landAcres} 
                onChange={(e) => setLandAcres(e.target.value)} 
                required 
              />
              <div className="quick-acres-chips">
                {['1', '2.5', '5', '10'].map(val => (
                  <button 
                    type="button" 
                    key={val} 
                    className={`acre-chip ${landAcres === val ? 'active' : ''}`}
                    onClick={() => setLandAcres(val)}
                  >
                    {val} {lang === 'mr' ? 'एकर' : 'Acre'}
                  </button>
                ))}
              </div>
            </div>

            <div className="field-group">
              <label>{lang === 'mr' ? 'शेतकरी वर्ग:' : 'Farmer Category:'}</label>
              <select value={farmerType} onChange={(e) => setFarmerType(e.target.value)}>
                <option value="Small">{lang === 'mr' ? 'अल्प व अत्यल्प भूधारक (< 5 एकर)' : 'Small & Marginal (< 5 Acres)'}</option>
                <option value="General">{lang === 'mr' ? 'सर्वसाधारण शेतकरी (General)' : 'General Farmer'}</option>
                <option value="Women">{lang === 'mr' ? 'महिला शेतकरी (Women Farmer)' : 'Women Farmer'}</option>
                <option value="SC_ST">{lang === 'mr' ? 'अनुसूचित जाती / जमाती (SC / ST)' : 'SC / ST Category'}</option>
              </select>
            </div>

            <div className="field-group">
              <label>{lang === 'mr' ? 'मुख्य पीक:' : 'Main Crop:'}</label>
              <select value={crop} onChange={(e) => setCrop(e.target.value)}>
                <option value="Cotton">{lang === 'mr' ? 'कापूस (Cotton)' : 'Cotton'}</option>
                <option value="Soybean">{lang === 'mr' ? 'सोयाबीन (Soybean)' : 'Soybean'}</option>
                <option value="Sugarcane">{lang === 'mr' ? 'ऊस (Sugarcane)' : 'Sugarcane'}</option>
                <option value="Wheat">{lang === 'mr' ? 'गहू (Wheat)' : 'Wheat'}</option>
                <option value="Rice">{lang === 'mr' ? 'तांदूळ (Rice)' : 'Rice'}</option>
                <option value="Vegetables">{lang === 'mr' ? 'भाजीपाला व फळबाग' : 'Vegetables & Fruits'}</option>
              </select>
            </div>

            <div className="field-group">
              <label>{lang === 'mr' ? 'राज्य:' : 'State:'}</label>
              <select value={stateName} onChange={(e) => setStateName(e.target.value)}>
                <option value="Maharashtra">Maharashtra (महाराष्ट्र)</option>
                <option value="Madhya Pradesh">Madhya Pradesh (मध्य प्रदेश)</option>
                <option value="Gujarat">Gujarat (गुजरात)</option>
                <option value="All">{lang === 'mr' ? 'इतर सर्व राज्ये' : 'Other States'}</option>
              </select>
            </div>

            <div className="field-group full-width-field">
              <button type="submit" className="submit-calc-btn">
                <MdSearch size={20} />
                <span>{lang === 'mr' ? 'पात्र योजना शोधा' : 'Calculate Matching Schemes'}</span>
              </button>
            </div>
          </form>
        </section>
      )}

      {/* 3. Search, Filters & View Mode Toggle */}
      <section className="search-filter-panel">
        <div className="search-bar-container">
          <MdSearch size={22} className="search-icon" />
          <input 
            type="text"
            placeholder={lang === 'mr' ? 'योजनेचे नाव, सबसिडी किंवा कीवर्ड शोधा (उदा. सौर पंप, नमो शेतकरी, ट्रॅक्टर)...' : 'Search schemes by title or keyword (e.g. Solar pump, Namo Shetkari, Tractor)...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="clear-search" onClick={() => setSearch('')}>
              <MdClose size={18} />
            </button>
          )}
        </div>

        <div className="filter-controls-row">
          {/* Tabs */}
          <div className="tab-navigation">
            <button 
              className={`tab-item ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              {lang === 'mr' ? 'सर्व योजना' : 'All Schemes'} ({schemes.length})
            </button>
            
            <button 
              className={`tab-item ${activeTab === 'recommended' ? 'active' : ''}`}
              onClick={() => setActiveTab('recommended')}
            >
              <MdStar size={16} />
              {lang === 'mr' ? 'शिफारस केलेल्या' : 'Recommended'} ({Object.values(evalResultsMap).filter(v => v && v.score >= 80).length})
            </button>

            <button 
              className={`tab-item ${activeTab === 'new' ? 'active' : ''}`}
              onClick={() => setActiveTab('new')}
            >
              <MdNewReleases size={16} />
              {lang === 'mr' ? 'नवीन योजना' : 'Newly Launched'} ({schemes.filter(s => s && s.isNew).length})
            </button>

            <button 
              className={`tab-item ${activeTab === 'tracked' ? 'active' : ''}`}
              onClick={() => setActiveTab('tracked')}
            >
              <MdBookmark size={16} />
              {lang === 'mr' ? 'ट्रॅक केलेले अर्ज' : 'My Saved Schemes'} ({Object.values(trackedMap).filter(v => v && v.status && v.status !== 'NONE').length})
            </button>
          </div>

          {/* Level Filter Dropdown & View Mode Switcher */}
          <div className="secondary-filters">
            <select 
              value={selectedLevel} 
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="level-select-filter"
            >
              <option value="ALL">{lang === 'mr' ? 'सर्व स्तर (Central & State)' : 'All Govt Levels'}</option>
              <option value="CENTRAL">{lang === 'mr' ? 'केन्द्रीय योजना (Central)' : 'Central Govt Schemes'}</option>
              <option value="STATE">{lang === 'mr' ? 'राज्य योजना (State)' : 'State Govt Schemes'}</option>
            </select>

            <div className="view-mode-toggle">
              <button 
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Grid View"
              >
                <MdGridView size={18} />
              </button>
              <button 
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title="List View"
              >
                <MdFormatListBulleted size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Category Chips */}
        <div className="categories-scroll-row">
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`category-pill ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* 4. Schemes Presentation (Grid or List Mode) */}
      {filteredSchemes.length === 0 ? (
        <div className="empty-state-card">
          <MdHelpOutline size={42} color="#64748b" />
          <h3>{lang === 'mr' ? 'कोणतीही योजना आढळली नाही' : 'No schemes match your filter criteria'}</h3>
          <p>{lang === 'mr' ? 'कृपया शोध शब्द बदला किंवा निवडलेले फिल्टर रीसेट करा.' : 'Try adjusting your search terms or clearing selected category filters.'}</p>
          <button className="reset-filter-btn" onClick={() => { setSearch(''); setSelectedCategory('ALL'); setSelectedLevel('ALL'); setActiveTab('all'); }}>
            {lang === 'mr' ? 'सर्व फिल्टर रीसेट करा' : 'Reset All Filters'}
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW PRESENTATION */
        <div className="schemes-grid-view">
          {filteredSchemes.map(s => {
            const title = (lang === 'mr' && s.titleMr ? s.titleMr : s.title) || ''
            const desc = (lang === 'mr' && s.descriptionMr ? s.descriptionMr : s.description) || ''
            const subsidy = (lang === 'mr' && s.subsidyAmountMr ? s.subsidyAmountMr : s.subsidyAmount) || ''
            const eligibilityText = (lang === 'mr' && s.eligibilityCriteriaTextMr ? s.eligibilityCriteriaTextMr : s.eligibilityCriteriaText) || ''
            const docs = (lang === 'mr' && s.requiredDocumentsMr ? s.requiredDocumentsMr : s.requiredDocuments) || []
            const trackStatus = trackedMap[s.id]?.status || 'NONE'
            const evalRes = evalResultsMap[s.id] || { eligible: true, score: 100, reasons: [] }

            return (
              <article key={s.id} className="scheme-grid-card">
                <div>
                  <div className="card-tags-row">
                    <span className={`level-badge ${(s.level || 'central').toLowerCase()}`}>
                      {s.level === 'CENTRAL' ? (lang === 'mr' ? 'केन्द्रीय योजना' : 'Central Govt') : (lang === 'mr' ? 'राज्य योजना' : 'State Govt')}
                    </span>
                    {s.isNew && (
                      <span className="new-badge">{lang === 'mr' ? 'नवीन योजना' : 'NEW'}</span>
                    )}
                    <span className="category-badge">{(s.category || '').replace('_', ' ')}</span>
                  </div>

                  <div className="match-score-row">
                    <span>{lang === 'mr' ? 'पात्रता जुळवणी:' : 'Eligibility Match:'}</span>
                    <strong className={evalRes.score >= 80 ? 'high' : 'medium'}>{evalRes.score}%</strong>
                  </div>

                  <h3 className="scheme-title-text">{title}</h3>

                  <div className="subsidy-amount-callout">
                    <MdCheckCircle size={18} />
                    <span>{subsidy}</span>
                  </div>

                  <p className="scheme-desc-text">{desc}</p>

                  <div className="eligibility-box">
                    <span className="box-label">{lang === 'mr' ? 'पात्रता निकष:' : 'Eligibility Criteria:'}</span>
                    <p>{eligibilityText}</p>
                  </div>

                  {Array.isArray(docs) && docs.length > 0 && (
                    <div className="docs-preview-box">
                      <span className="box-label">{lang === 'mr' ? 'आवश्यक कागदपत्रे:' : 'Required Documents:'}</span>
                      <div className="docs-pills-wrap">
                        {docs.slice(0, 3).map((doc, idx) => (
                          <span key={idx} className="doc-pill-item">{doc}</span>
                        ))}
                        {docs.length > 3 && <span className="doc-pill-more">+{docs.length - 3}</span>}
                      </div>
                    </div>
                  )}
                </div>

                <div className="card-footer-actions">
                  <button className="guide-btn" onClick={() => openDocumentModal(s)}>
                    <MdDescription size={16} />
                    <span>{lang === 'mr' ? 'कागदपत्रे व मार्गदर्शक' : 'Documents & Guide'}</span>
                  </button>

                  <a href={s.portalUrl} target="_blank" rel="noopener noreferrer" className="apply-btn">
                    <span>{lang === 'mr' ? 'थेट अर्ज करा' : 'Apply Online'}</span>
                    <MdLaunch size={16} />
                  </a>

                  <select 
                    value={trackStatus} 
                    onChange={(e) => handleStatusChange(s.id, e.target.value)}
                    className="status-dropdown"
                  >
                    <option value="NONE">{lang === 'mr' ? 'अर्ज स्थिती निवडा...' : 'Track Application Status...'}</option>
                    <option value="INTERESTED">{lang === 'mr' ? 'सेव्ह केले (Saved)' : 'Saved'}</option>
                    <option value="APPLIED">{lang === 'mr' ? 'अर्ज दाखल केला (Applied)' : 'Applied'}</option>
                    <option value="APPROVED">{lang === 'mr' ? 'मंजूर (Approved)' : 'Approved'}</option>
                    <option value="DISBURSED">{lang === 'mr' ? 'रक्कम जमा (Disbursed)' : 'Disbursed'}</option>
                  </select>
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        /* LIST VIEW PRESENTATION (Official Government Table Layout) */
        <div className="schemes-list-view">
          <div className="list-table-container">
            <table className="official-schemes-table">
              <thead>
                <tr>
                  <th>{lang === 'mr' ? 'योजनेचे नाव व प्रकार' : 'Scheme Name & Category'}</th>
                  <th>{lang === 'mr' ? 'शासकीय सबसिडी / लाभ' : 'Subsidy / Financial Benefit'}</th>
                  <th>{lang === 'mr' ? 'पात्रता व निकष' : 'Eligibility Criteria'}</th>
                  <th>{lang === 'mr' ? 'मुदत / अर्ज' : 'Deadline & Action'}</th>
                </tr>
              </thead>
              <tbody>
                {filteredSchemes.map(s => {
                  const title = (lang === 'mr' && s.titleMr ? s.titleMr : s.title) || ''
                  const desc = (lang === 'mr' && s.descriptionMr ? s.descriptionMr : s.description) || ''
                  const subsidy = (lang === 'mr' && s.subsidyAmountMr ? s.subsidyAmountMr : s.subsidyAmount) || ''
                  const eligibilityText = (lang === 'mr' && s.eligibilityCriteriaTextMr ? s.eligibilityCriteriaTextMr : s.eligibilityCriteriaText) || ''
                  const trackStatus = trackedMap[s.id]?.status || 'NONE'
                  const evalRes = evalResultsMap[s.id] || { eligible: true, score: 100 }

                  return (
                    <tr key={s.id}>
                      <td className="col-name">
                        <div className="table-tags">
                          <span className={`level-badge ${(s.level || 'central').toLowerCase()}`}>{s.level}</span>
                          {s.isNew && <span className="new-badge">NEW</span>}
                        </div>
                        <strong className="table-title">{title}</strong>
                        <p className="table-desc">{desc}</p>
                      </td>
                      <td className="col-subsidy">
                        <div className="subsidy-pill">{subsidy}</div>
                      </td>
                      <td className="col-eligibility">
                        <p className="eligibility-text">{eligibilityText}</p>
                        <span className="match-tag">{evalRes.score}% Match</span>
                      </td>
                      <td className="col-actions">
                        <div className="table-action-btns">
                          <button className="guide-btn-sm" onClick={() => openDocumentModal(s)}>
                            <MdDescription size={14} />
                            <span>Guide</span>
                          </button>
                          <a href={s.portalUrl} target="_blank" rel="noopener noreferrer" className="apply-btn-sm">
                            <span>Apply</span>
                            <MdLaunch size={14} />
                          </a>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Document Checklist & Application Guide Modal */}
      {detailScheme && (
        <div className="modal-overlay-bg" onClick={() => setDetailScheme(null)}>
          <div className="modal-dialog-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-bar">
              <div>
                <span className="modal-level-tag">{detailScheme.level} GOVT SCHEME • {detailScheme.category}</span>
                <h2>{lang === 'mr' && detailScheme.titleMr ? detailScheme.titleMr : detailScheme.title}</h2>
              </div>
              <button className="modal-close-icon" onClick={() => setDetailScheme(null)}>&times;</button>
            </div>

            <div className="modal-body-content">
              <div className="modal-benefit-card">
                <div>
                  <span className="card-benefit-label">{lang === 'mr' ? 'शासकीय सबसिडी / लाभ:' : 'Financial Subsidy / Benefit:'}</span>
                  <h3>{lang === 'mr' && detailScheme.subsidyAmountMr ? detailScheme.subsidyAmountMr : detailScheme.subsidyAmount}</h3>
                </div>
                <div className="card-deadline-tag">
                  <MdCalendarToday size={14} />
                  <span>{detailScheme.deadline}</span>
                </div>
              </div>

              <div className="modal-section-block">
                <h4>{lang === 'mr' ? 'योजनेचा संपूर्ण तपशील:' : 'Scheme Overview:'}</h4>
                <p>{lang === 'mr' && detailScheme.descriptionMr ? detailScheme.descriptionMr : detailScheme.description}</p>
              </div>

              <div className="modal-section-block">
                <div className="section-title-header">
                  <h4>{lang === 'mr' ? 'आवश्यक कागदपत्रे चेकलिस्ट:' : 'Required Documents Checklist:'}</h4>
                  <span className="readiness-counter">
                    Ready: {Object.values(checkedDocs).filter(Boolean).length} / {((lang === 'mr' && detailScheme.requiredDocumentsMr ? detailScheme.requiredDocumentsMr : detailScheme.requiredDocuments) || []).length}
                  </span>
                </div>

                <div className="checklist-items-list">
                  {((lang === 'mr' && detailScheme.requiredDocumentsMr ? detailScheme.requiredDocumentsMr : detailScheme.requiredDocuments) || []).map((doc, idx) => {
                    const isChecked = checkedDocs[idx] || false
                    return (
                      <div key={idx} className={`checklist-row ${isChecked ? 'checked' : ''}`} onClick={() => toggleDocCheck(idx)}>
                        <input type="checkbox" checked={isChecked} readOnly />
                        <span className="doc-name-text">{doc}</span>
                        <span className="doc-status-badge">{isChecked ? (lang === 'mr' ? 'तयार आहे ✅' : 'Ready ✅') : (lang === 'mr' ? 'आवश्यक ⚠️' : 'Required ⚠️')}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="modal-section-block">
                <h4>{lang === 'mr' ? 'अर्ज कसा करावा (Application Steps):' : 'Step-by-Step Application Instructions:'}</h4>
                <ol className="steps-ordered-list">
                  <li><strong>1. Visit Official Portal</strong> — Click the apply button to open the government website.</li>
                  <li><strong>2. Complete Aadhaar eKYC</strong> — Verify identity using Aadhaar number and OTP.</li>
                  <li><strong>3. Upload Documents</strong> — Upload 7/12 land extract, bank passbook, and required photos.</li>
                  <li><strong>4. Direct Benefit Transfer</strong> — Financial subsidy is directly credited to your bank account upon approval.</li>
                </ol>
              </div>

              <div className="modal-footer-actions">
                <button className="print-checklist-btn" onClick={() => window.print()}>
                  <MdPrint size={18} />
                  <span>{lang === 'mr' ? 'कागदपत्रे यादी प्रिंट करा' : 'Print / Save Checklist'}</span>
                </button>

                <a href={detailScheme.portalUrl} target="_blank" rel="noopener noreferrer" className="modal-apply-btn">
                  <span>{lang === 'mr' ? 'अधिकृत पोर्टलवर अर्ज करा' : 'Apply on Official Portal'}</span>
                  <MdLaunch size={18} />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
