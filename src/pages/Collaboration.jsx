import { useEffect, useMemo, useState, useRef } from 'react'
import { useTranslation } from '../i18n'
import Sidebar from '../components/Sidebar'
import { useAuth } from '../context/AuthContext'
import {
  bookTaskDate,
  confirmBooking,
  createTaskRequest,
  deleteTaskRequest,
  getTaskCalendar,
  listFilledTaskRequests,
  listMyTaskRequests,
  listOpenTaskRequests,
  listPersonalTasks,
  createPersonalTask,
  deletePersonalTask,
  myGroupSchedule,
  myUpcomingWork,
  requestJoin,
  listPendingJoinRequests,
  approveJoinRequest,
  rejectJoinRequest,
  rescheduleBooking,
} from '../services/collaboration'
import { MdCalendarToday, MdHandshake, MdAdd, MdCheckCircle, MdSchedule, MdChevronLeft, MdChevronRight, MdClose } from 'react-icons/md'
import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import 'leaflet/dist/leaflet.css'
import './Home.css'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

const WEEKDAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const WEEKDAYS_MR = ['रवी', 'सोम', 'मंगळ', 'बुध', 'गुरू', 'शुक्र', 'शनी']

const TRANSLATIONS = {
  en: {
    title: 'Reciprocal Labor',
    mySchedule: 'My Schedule',
    requests: 'Requests',
    create: 'Create',
    laborCredits: 'Labor Credits',
    dailyLimit: 'Daily Limit',
    loading: 'Loading...',
    noWorkdays: 'No upcoming workdays.',
    bookedDay: 'Booked Day',
    status: 'Status',
    requester: 'Requester',
    request: 'Request',
    worker: 'Worker',
    confirm: 'Confirm',
    reschedule: 'Reschedule',
    open: 'Open',
    myRequests: 'My Requests',
    filled: 'Filled',
    noRequestsMine: 'No joined requests.',
    noRequestsFilled: 'No filled requests.',
    noRequestsOpen: 'No open requests.',
    delete: 'Delete',
    farmers: 'Farmers',
    daysPerFarmer: 'Days/Farmer',
    totalDays: 'Total Days',
    calendar: 'Calendar',
    join: 'Join',
    joinRequestsTitle: 'Join Requests',
    farmLocation: 'Farm location',
    send: 'Send',
    joinRequested: 'Join request sent.',
    joinPending: 'Join request pending approval.',
    joinRequired: 'Join request not approved yet.',
    approve: 'Approve',
    reject: 'Reject',
    locationRequired: 'Please select a location on the map.',
    selectOnMap: 'Click the map to choose location.',
    selectedLocation: 'Selected location',
    joinFailed: 'Join request failed.',
    approveSuccess: 'Join request approved.',
    rejectSuccess: 'Join request rejected.',
    searchLocation: 'Search location',
    search: 'Search',
    searching: 'Searching...',
    searchError: 'Search failed.',
    note: 'Note: The date you book is your workday.',
    bookings: 'Booked Work',
    tasks: 'Tasks',
    addTask: 'Add Task',
    taskTitle: 'Task Title',
    taskTime: 'Time',
    taskNote: 'Notes',
    saveTask: 'Save Task',
    cancel: 'Cancel',
    noTasks: 'No tasks for this day.',
    noBookings: 'No work booked for this day.',
    newTaskRequest: 'New Task Request',
    taskType: 'Task Type',
    requiredFarmers: 'Required Farmers',
    requiredFarmerDays: 'Days Per Farmer',
    windowStart: 'Window Start',
    windowEnd: 'Window End',
    createRequest: 'Create Request',
    creating: 'Creating...',
    booked: 'Booked',
    available: 'Available',
    unavailable: 'Unavailable',
    outside: '',
    confirmSuccess: 'Confirmed.',
    rescheduleSuccess: 'Rescheduled.',
    deleteSuccess: 'Request deleted.',
    bookingSuccess: 'Booked!',
    bookingConfirm: 'Book this date {date}?',
    createSuccess: 'Request created: ',
    deleteConfirm: 'Delete this request completely?',
    reschedulePrompt: 'Enter new date (YYYY-MM-DD)',
    invalidDate: 'Invalid date. Example: 2026-02-06',
    requiredFarmersError: 'Required farmers must be a whole number greater than 0.',
    requiredDaysError: 'Required days per farmer must be a whole number greater than 0.',
    dateWindowError: 'Please choose both a window start and end date.',
    dateWindowOrderError: 'Window end date must be on or after the start date.',
    dateWindowLengthError: 'Date window must include at least {total} days for {farmers} farmers.',
    bookedBy: 'Booked by',
    todayWork: "Today's Work",
    yes: 'Yes',
    no: 'No',
  },
  mr: {
    title: 'परस्पर श्रम',
    mySchedule: 'माझं वेळापत्रक',
    requests: 'विनंत्या',
    create: 'विनंती तयार',
    laborCredits: 'क्रेडिट शिल्लक',
    dailyLimit: 'दैनिक मर्यादा',
    loading: 'लोड होत आहे...',
    noWorkdays: 'कामाचे दिवस नाहीत.',
    bookedDay: 'बुक केलेली तारीख',
    status: 'स्थिती',
    requester: 'विनंतीदार',
    request: 'विनंती',
    worker: 'कामगार',
    confirm: 'पुष्टी करा',
    reschedule: 'तारीख बदला',
    open: 'उघड',
    myRequests: 'माझ्या विनंत्या',
    filled: 'भरलेली',
    noRequestsMine: 'माझ्या विनंत्या नाहीत.',
    noRequestsFilled: 'भरलेल्या विनंत्या नाहीत.',
    noRequestsOpen: 'सध्या विनंत्या नाहीत.',
    delete: 'काढून टाका',
    farmers: 'शेतकरी',
    daysPerFarmer: 'दिवस/शेतकरी',
    totalDays: 'एकूण दिवस',
    calendar: 'कॅलेंडर',
    join: 'Join',
    joinRequestsTitle: 'Join Requests',
    farmLocation: 'Farm location',
    send: 'Send',
    joinRequested: 'Join request sent.',
    joinPending: 'Join request pending approval.',
    joinRequired: 'Join request not approved yet.',
    approve: 'Approve',
    reject: 'Reject',
    locationRequired: 'Please select a location on the map.',
    selectOnMap: 'Click the map to choose location.',
    selectedLocation: 'Selected location',
    joinFailed: 'Join request failed.',
    approveSuccess: 'Join request approved.',
    rejectSuccess: 'Join request rejected.',
    searchLocation: 'Search location',
    search: 'Search',
    searching: 'Searching...',
    searchError: 'Search failed.',
    note: 'नोंद: तुम्ही निवडलेली तारीखच तुमची कामाची तारीख (बुक केलेली तारीख) आहे.',
    bookings: 'Booked Work',
    tasks: 'Tasks',
    addTask: 'Add Task',
    taskTitle: 'Task Title',
    taskTime: 'Time',
    taskNote: 'Notes',
    saveTask: 'Save Task',
    cancel: 'Cancel',
    noTasks: 'No tasks for this day.',
    noBookings: 'No work booked for this day.',
    newTaskRequest: 'नवीन कामाची विनंती',
    taskType: 'कामाचा प्रकार',
    requiredFarmers: 'आवश्यक शेतकरी',
    requiredFarmerDays: 'प्रत्येक शेतकऱ्याचे दिवस',
    windowStart: 'सुरुवात',
    windowEnd: 'शेवट',
    createRequest: 'विनंती तयार करा',
    creating: 'तयार करत आहोत...',
    booked: 'बुक केले',
    available: 'उपलब्ध',
    unavailable: 'अनुपलब्ध',
    outside: '',
    confirmSuccess: 'पुष्टी केली.',
    rescheduleSuccess: 'वेळापत्रक बदलले.',
    deleteSuccess: 'विनंती काढून टाकली.',
    bookingSuccess: 'बुकिंग झाली.',
    bookingConfirm: 'या तारखेसाठी बुकिंग करायचे आहे का? {date}',
    createSuccess: 'विनंती तयार झाली: ',
    deleteConfirm: 'ही विनंती पूर्णपणे काढून टाकायची का?',
    reschedulePrompt: 'नवीन तारीख (YYYY-MM-DD) प्रविष्ट करा',
    invalidDate: 'अवैध तारीख. उदाहरण: 2026-02-06',
    requiredFarmersError: 'आवश्यक शेतकरी संख्या 0 पेक्षा जास्त पूर्ण संख्या असावी.',
    requiredDaysError: 'आवश्यक दिवस संख्या 0 पेक्षा जास्त पूर्ण संख्या असावी.',
    dateWindowError: 'कृपया दोन्ही तारीख निवडा.',
    dateWindowOrderError: 'शेवटची तारीख सुरुवातीच्या तारखेनंतर असावी.',
    dateWindowLengthError: 'तारीख विंडोमध्ये {farmers} शेतकऱ्यांसाठी किमान {total} दिवस असावेत.',
    bookedBy: 'यांनी बुक केले',
    todayWork: "Today's Work",
    yes: 'होय',
    no: 'नाही',
  }
}

function parseYMD(s) {
  if (!s || typeof s !== 'string') return null
  const parts = s.split('-').map((n) => Number(n))
  if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n))) return null
  const [y, m, d] = parts
  return new Date(y, m - 1, d)
}

function formatYMD(date) {
  if (!(date instanceof Date)) return ''
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const TASK_TYPES = [
  { value: 'PLANTATION', labelEn: 'Plantation', labelMr: 'लागवड' },
  { value: 'SOWING', labelEn: 'Sowing', labelMr: 'पेरणी' },
  { value: 'HARVESTING', labelEn: 'Harvesting', labelMr: 'कापणी' },
  { value: 'MAINTENANCE', labelEn: 'Maintenance', labelMr: 'देखभाल' },
]

const DEFAULT_MAP_CENTER = [20.5937, 78.9629]

function fmtDate(s) {
  if (!s) return ''
  return s
}

function toMarathiNumerals(n) {
  const map = { '0': '०', '1': '१', '2': '२', '3': '३', '4': '४', '5': '५', '6': '६', '7': '७', '8': '८', '9': '९' }
  return String(n).replace(/[0-9]/g, (c) => map[c])
}

function formatCoords(lat, lng) {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return ''
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
}

async function reverseGeocodeLabel(lat, lng) {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return ''
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}`
    const res = await fetch(url, {
      headers: { 'Accept-Language': 'en' },
    })
    if (!res.ok) return ''
    const data = await res.json()
    return typeof data?.display_name === 'string' ? data.display_name : ''
  } catch {
    return ''
  }
}

function LocationPicker({ value, onChange, center, labels }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState('')
  const reverseLookupRef = useRef(0)
  const searchLabels = labels || {}

  useEffect(() => {
    if (!containerRef.current) return
    if (mapRef.current) return

    const map = L.map(containerRef.current, { zoomControl: true })
    mapRef.current = map

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map)

    const initialCenter = Array.isArray(center) && center.length === 2 ? center : DEFAULT_MAP_CENTER
    map.setView(initialCenter, 5)

    const handleClick = (e) => {
      const lat = e.latlng.lat
      const lng = e.latlng.lng
      onChange?.({ lat, lng, label: '' })
      reverseLookup(lat, lng)
    }
    map.on('click', handleClick)

    return () => {
      map.off('click', handleClick)
      map.remove()
      mapRef.current = null
      markerRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!mapRef.current) return
    if (Array.isArray(center) && center.length === 2 && Number.isFinite(center[0]) && Number.isFinite(center[1])) {
      mapRef.current.setView(center, mapRef.current.getZoom() || 5)
    }
  }, [center])

  useEffect(() => {
    if (!mapRef.current) return
    const lat = value?.lat
    const lng = value?.lng
    const hasValue = Number.isFinite(lat) && Number.isFinite(lng)
    if (hasValue) {
      if (!markerRef.current) {
        markerRef.current = L.marker([lat, lng]).addTo(mapRef.current)
      } else {
        markerRef.current.setLatLng([lat, lng])
      }
    } else if (markerRef.current) {
      markerRef.current.remove()
      markerRef.current = null
    }
  }, [value?.lat, value?.lng])

  async function reverseLookup(lat, lng) {
    const lookupId = (reverseLookupRef.current += 1)
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}`
      const res = await fetch(url, {
        headers: { 'Accept-Language': 'en' },
      })
      if (!res.ok) return
      const data = await res.json()
      if (reverseLookupRef.current !== lookupId) return
      const label = typeof data?.display_name === 'string' ? data.display_name : ''
      onChange?.({ lat, lng, label })
    } catch {
      // Silent fail; keep coordinates only
    }
  }

  async function runSearch() {
    const trimmed = query.trim()
    if (!trimmed) return
    setSearching(true)
    setSearchError('')
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(trimmed)}`
      const res = await fetch(url, {
        headers: { 'Accept-Language': 'en' },
      })
      if (!res.ok) throw new Error('search_failed')
      const data = await res.json()
      const list = Array.isArray(data) ? data : []
      setResults(list)
      const first = list[0]
      if (first?.lat && first?.lon) {
        const lat = Number(first.lat)
        const lng = Number(first.lon)
        if (Number.isFinite(lat) && Number.isFinite(lng)) {
          mapRef.current?.setView([lat, lng], 10)
          onChange?.({ lat, lng, label: first.display_name || '' })
        }
      }
    } catch {
      setSearchError(searchLabels.searchError || 'Search failed.')
    } finally {
      setSearching(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              runSearch()
            }
          }}
          placeholder={searchLabels.searchPlaceholder || 'Search location'}
          style={{ flex: '1 1 240px', padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd' }}
        />
        <button type="button" className="filter-chip" disabled={searching} onClick={runSearch}>
          {searching ? searchLabels.searching || 'Searching...' : searchLabels.search || 'Search'}
        </button>
      </div>
      {searchError && <div style={{ color: '#b71c1c', fontSize: 12 }}>{searchError}</div>}
      {results.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {results.map((r, idx) => (
            <button
              key={`${r.place_id || idx}`}
              type="button"
              className="filter-chip"
              onClick={() => {
                const lat = Number(r.lat)
                const lng = Number(r.lon)
                if (!Number.isFinite(lat) || !Number.isFinite(lng)) return
                mapRef.current?.setView([lat, lng], 11)
                onChange?.({ lat, lng, label: r.display_name || '' })
                setQuery(r.display_name || query)
                setResults([])
              }}
              style={{ textAlign: 'left', justifyContent: 'flex-start' }}
            >
              {r.display_name || `Result ${idx + 1}`}
            </button>
          ))}
        </div>
      )}
      <div
        ref={containerRef}
        style={{ height: 240, width: '100%', borderRadius: 10, border: '1px solid #ddd' }}
      />
    </div>
  )
}

function LocationPreview({ lat, lng }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markerRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return
    if (mapRef.current) return

    const map = L.map(containerRef.current, { zoomControl: false, dragging: true })
    mapRef.current = map

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map)

    const hasCoords = Number.isFinite(lat) && Number.isFinite(lng)
    const initialCenter = hasCoords ? [lat, lng] : DEFAULT_MAP_CENTER
    map.setView(initialCenter, hasCoords ? 11 : 5)

    if (hasCoords) {
      markerRef.current = L.marker([lat, lng]).addTo(map)
    }

    return () => {
      map.remove()
      mapRef.current = null
      markerRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!mapRef.current) return
    const hasCoords = Number.isFinite(lat) && Number.isFinite(lng)
    if (hasCoords) {
      mapRef.current.setView([lat, lng], mapRef.current.getZoom() || 11)
      if (!markerRef.current) {
        markerRef.current = L.marker([lat, lng]).addTo(mapRef.current)
      } else {
        markerRef.current.setLatLng([lat, lng])
      }
    } else if (markerRef.current) {
      markerRef.current.remove()
      markerRef.current = null
    }
  }, [lat, lng])

  return (
    <div
      ref={containerRef}
      style={{ height: 200, width: '100%', borderRadius: 10, border: '1px solid #ddd' }}
    />
  )
}

export default function Collaboration() {
  const { t, lang } = useTranslation()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('dashboard')

  // Requests
  const [requests, setRequests] = useState([])
  const [requestFilter, setRequestFilter] = useState('open')
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [expandedRequestId, setExpandedRequestId] = useState(null)
  const [calendar, setCalendar] = useState([])
  const [loadingRequests, setLoadingRequests] = useState(false)
  const [loadingCalendar, setLoadingCalendar] = useState(false)
  const [pendingJoinRequests, setPendingJoinRequests] = useState([])
  const [loadingJoinRequests, setLoadingJoinRequests] = useState(false)
  const [joinFormRequestId, setJoinFormRequestId] = useState(null)
  const [joinLocation, setJoinLocation] = useState(null)
  const [expandedJoinRequestId, setExpandedJoinRequestId] = useState(null)
  const [calendarMonth, setCalendarMonth] = useState(() => new Date())
  const [scheduleMonth, setScheduleMonth] = useState(() => new Date())

  // Create request
  const [form, setForm] = useState({
    taskType: 'HARVESTING',
    requiredFarmers: 1,
    requiredFarmerDays: 3,
    dateWindowStart: '',
    dateWindowEnd: '',
  })
  const [creating, setCreating] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  // My work
  const [myWork, setMyWork] = useState([])
  const [loadingWork, setLoadingWork] = useState(false)
  const [groupSchedule, setGroupSchedule] = useState([])
  const [loadingGroupSchedule, setLoadingGroupSchedule] = useState(false)
  const [personalTasks, setPersonalTasks] = useState([])
  const [loadingPersonalTasks, setLoadingPersonalTasks] = useState(false)
  const [taskForm, setTaskForm] = useState({ title: '', time: '', note: '' })
  const [showTaskForm, setShowTaskForm] = useState(false)

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 700)
  const [sheetData, setSheetData] = useState(null)
  const sheetRef = useRef(null)
  const prevFocusRef = useRef(null)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 700)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (!user?.id) {
      setPersonalTasks([])
      return
    }
    refreshPersonalTasks()
  }, [user?.id])

  useEffect(() => {
    if (sheetData) {
      setTaskForm({ title: '', time: '', note: '' })
      setShowTaskForm(false)
      prevFocusRef.current = document.activeElement
      setTimeout(() => sheetRef.current?.focus(), 50)
    } else if (prevFocusRef.current) {
      prevFocusRef.current.focus()
    }
  }, [sheetData])

  const txt = TRANSLATIONS[lang === 'mr' ? 'mr' : 'en']
  const weekdays = lang === 'mr' ? WEEKDAYS_MR : WEEKDAYS_EN
  const isMarathi = lang === 'mr'

  const taskTypeLabel = useMemo(() => {
    const map = new Map(TASK_TYPES.map((x) => [x.value, lang === 'mr' ? x.labelMr : x.labelEn]))
    return (v) => map.get(v) || v
  }, [lang])

  const calendarMap = useMemo(() => {
    return new Map(calendar.map((d) => [d.date, d]))
  }, [calendar])

  const scheduleMap = useMemo(() => {
    const map = new Map()
    groupSchedule.forEach((b) => {
      const dateStr = b?.date || b?.bookingDate || b?.assignedWorkDate
      if (!dateStr) return
      const entry = map.get(dateStr) || []
      entry.push(b)
      map.set(dateStr, entry)
    })
    return map
  }, [groupSchedule])

  const personalTaskMap = useMemo(() => {
    const map = new Map()
    personalTasks.forEach((t) => {
      if (!t?.dateStr) return
      const entry = map.get(t.dateStr) || []
      entry.push(t)
      map.set(t.dateStr, entry)
    })
    return map
  }, [personalTasks])

  const windowStartStr = selectedRequest?.dateWindowStart || null
  const windowEndStr = selectedRequest?.dateWindowEnd || null
  const windowStartDate = useMemo(() => parseYMD(windowStartStr), [windowStartStr])
  const windowEndDate = useMemo(() => parseYMD(windowEndStr), [windowEndStr])

  const monthLabel = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(lang === 'mr' ? 'mr-IN' : 'en-US', { month: 'long', year: 'numeric' }).format(calendarMonth)
    } catch {
      return calendarMonth.toLocaleDateString()
    }
  }, [calendarMonth, lang])

  const scheduleMonthLabel = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(lang === 'mr' ? 'mr-IN' : 'en-US', { month: 'long', year: 'numeric' }).format(scheduleMonth)
    } catch {
      return scheduleMonth.toLocaleDateString()
    }
  }, [scheduleMonth, lang])

  const calendarDays = useMemo(() => {
    if (!calendarMonth) return []
    const monthStart = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1)
    const startOffset = monthStart.getDay()
    const gridStart = new Date(monthStart)
    gridStart.setDate(monthStart.getDate() - startOffset)
    const days = []
    for (let i = 0; i < 35; i += 1) {
      const d = new Date(gridStart)
      d.setDate(gridStart.getDate() + i)
      const dateStr = formatYMD(d)
      const inMonth = d.getMonth() === calendarMonth.getMonth()
      const entry = calendarMap.get(dateStr)
      const hasStatus = !!entry
      const inWindow =
        hasStatus ||
        (windowStartDate && windowEndDate
          ? d.getTime() >= windowStartDate.getTime() && d.getTime() <= windowEndDate.getTime()
          : false)
      const status = hasStatus ? entry.status : inWindow ? 'UNAVAILABLE' : 'OUTSIDE'
      const isAvailable = status === 'AVAILABLE'
      days.push({
        date: d,
        dateStr,
        inMonth,
        inWindow,
        status,
        bookedByName: entry?.bookedBy?.name || (entry?.bookedBy?.id ? `#${entry.bookedBy.id}` : ''),
        disabled: !isAvailable || loadingCalendar,
      })
    }
    return days
  }, [calendarMonth, calendarMap, windowStartDate, windowEndDate, loadingCalendar])

  const scheduleDays = useMemo(() => {
    if (!scheduleMonth) return []
    const monthStart = new Date(scheduleMonth.getFullYear(), scheduleMonth.getMonth(), 1)
    const startOffset = monthStart.getDay()
    const gridStart = new Date(monthStart)
    gridStart.setDate(monthStart.getDate() - startOffset)
    const days = []
    for (let i = 0; i < 35; i += 1) {
      const d = new Date(gridStart)
      d.setDate(gridStart.getDate() + i)
      const dateStr = formatYMD(d)
      const inMonth = d.getMonth() === scheduleMonth.getMonth()
      const entry = scheduleMap.get(dateStr)
      days.push({
        date: d,
        dateStr,
        inMonth,
        entries: entry || [],
      })
    }
    return days
  }, [scheduleMonth, scheduleMap])

  const canPrevMonth = useMemo(() => {
    if (!windowStartDate) return true
    const min = new Date(windowStartDate.getFullYear(), windowStartDate.getMonth(), 1).getTime()
    const cur = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1).getTime()
    return cur > min
  }, [calendarMonth, windowStartDate])

  const canNextMonth = useMemo(() => {
    if (!windowEndDate) return true
    const max = new Date(windowEndDate.getFullYear(), windowEndDate.getMonth(), 1).getTime()
    const cur = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1).getTime()
    return cur < max
  }, [calendarMonth, windowEndDate])

  const todayStr = useMemo(() => formatYMD(new Date()), [])
  const sheetDateStr = sheetData ? sheetData.dateStr || formatYMD(sheetData.date) : ''
  const sheetBookings = sheetDateStr ? scheduleMap.get(sheetDateStr) || [] : []
  const sheetTasks = sheetDateStr ? personalTaskMap.get(sheetDateStr) || [] : []
  const sortedSheetTasks = sheetTasks.slice().sort((a, b) => (a.time || '').localeCompare(b.time || ''))
  const todayBookings = useMemo(() => scheduleMap.get(todayStr) || [], [scheduleMap, todayStr])
  const todayTasks = useMemo(
    () => (personalTaskMap.get(todayStr) || []).slice().sort((a, b) => (a.time || '').localeCompare(b.time || '')),
    [personalTaskMap, todayStr]
  )
  const todayBookingLines = useMemo(() => {
    return todayBookings
      .map((e) => {
        const bookedByName = e?.bookedBy?.name || (e?.bookedBy?.id ? `#${e.bookedBy.id}` : '')
        const requesterName = e?.requester?.name || (e?.requester?.id ? `#${e.requester.id}` : '')
        const requestId = e?.taskRequestId ? `#${e.taskRequestId}` : ''
        const parts = []
        if (requestId) parts.push(requestId)
        if (bookedByName) parts.push(`${txt.bookedBy} ${bookedByName}`)
        if (requesterName) parts.push(`${txt.requester}: ${requesterName}`)
        return parts.join(' · ')
      })
      .filter(Boolean)
  }, [todayBookings, txt])
  const todayTaskLines = useMemo(() => {
    return todayTasks
      .map((t) => {
        const timeLabel = t.time ? `${t.time} ` : ''
        return `${timeLabel}${t.title}`.trim()
      })
      .filter(Boolean)
  }, [todayTasks])
  const hasTodayWork = todayBookingLines.length > 0 || todayTaskLines.length > 0

  async function refreshRequests(filter = requestFilter) {
    setLoadingRequests(true)
    setError('')
    try {
      const data =
        filter === 'mine' ? await listMyTaskRequests() : filter === 'filled' ? await listFilledTaskRequests() : await listOpenTaskRequests()
      setRequests(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e?.message || 'Failed to load requests')
    } finally {
      setLoadingRequests(false)
    }
  }

  async function refreshJoinRequests() {
    setLoadingJoinRequests(true)
    setError('')
    try {
      const data = await listPendingJoinRequests()
      setPendingJoinRequests(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e?.message || 'Failed to load join requests')
    } finally {
      setLoadingJoinRequests(false)
    }
  }

  async function refreshPersonalTasks() {
    if (!user?.id) return
    setLoadingPersonalTasks(true)
    setError('')
    try {
      const data = await listPersonalTasks()
      setPersonalTasks(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e?.message || 'Failed to load tasks')
    } finally {
      setLoadingPersonalTasks(false)
    }
  }

  async function refreshCalendar(reqId) {
    setLoadingCalendar(true)
    setError('')
    try {
      const data = await getTaskCalendar(reqId)
      setCalendar(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e?.message || 'Failed to load calendar')
    } finally {
      setLoadingCalendar(false)
    }
  }

  async function refreshMyWork() {
    setLoadingWork(true)
    setError('')
    try {
      const data = await myUpcomingWork()
      setMyWork(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e?.message || 'Failed to load workdays')
    } finally {
      setLoadingWork(false)
    }
  }

  async function refreshGroupSchedule() {
    setLoadingGroupSchedule(true)
    setError('')
    try {
      const data = await myGroupSchedule()
      setGroupSchedule(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e?.message || 'Failed to load schedule')
    } finally {
      setLoadingGroupSchedule(false)
    }
  }

  useEffect(() => {
    setMessage('')
    setError('')
    if (activeTab === 'requests') {
      refreshRequests()
      refreshJoinRequests()
    }
    if (activeTab === 'dashboard') {
      refreshMyWork()
      refreshGroupSchedule()
    }
  }, [activeTab, requestFilter])

  async function handleSelectRequest(r) {
    setSelectedRequest(r)
    setCalendar([])
    if (r?.dateWindowStart) {
      const start = parseYMD(r.dateWindowStart)
      if (start) setCalendarMonth(new Date(start.getFullYear(), start.getMonth(), 1))
    }
    await refreshCalendar(r.id)
  }

  async function handleToggleRequestCalendar(r) {
    if (!r) return
    if (expandedRequestId === r.id) {
      setExpandedRequestId(null)
      setSelectedRequest(null)
      setCalendar([])
      return
    }
    setExpandedRequestId(r.id)
    setJoinFormRequestId(null)
    setJoinLocation(null)
    await handleSelectRequest(r)
  }

  async function handleBook(dateStr) {
    if (!selectedRequest) return
    const isMember = !!selectedRequest?.isMember || (user?.id && selectedRequest?.createdBy?.id === user.id)
    if (!isMember) {
      setError(txt.joinRequired)
      return
    }
    const confirmLabel = (txt.bookingConfirm || 'Book this date {date}?').replace('{date}', dateStr || '')
    const ok = window.confirm(confirmLabel)
    if (!ok) return
    setMessage('')
    setError('')
    try {
      await bookTaskDate(selectedRequest.id, dateStr)
      setMessage(txt.bookingSuccess)
      await refreshCalendar(selectedRequest.id)
      await refreshRequests()
      await refreshMyWork()
      await refreshGroupSchedule()
    } catch (e) {
      setError(e?.message || (lang === 'mr' ? 'बुकिंग अयशस्वी' : 'Booking failed'))
    }
  }

  async function handleCreate(e) {
    e.preventDefault()
    setCreating(true)
    setMessage('')
    setError('')
    try {
      const requiredFarmers = Number(form.requiredFarmers)
      const requiredDays = Number(form.requiredFarmerDays)
      if (!Number.isFinite(requiredFarmers) || requiredFarmers < 1 || !Number.isInteger(requiredFarmers)) {
        setError(txt.requiredFarmersError)
        return
      }
      if (!Number.isFinite(requiredDays) || requiredDays < 1 || !Number.isInteger(requiredDays)) {
        setError(txt.requiredDaysError)
        return
      }
      if (!form.dateWindowStart || !form.dateWindowEnd) {
        setError(txt.dateWindowError)
        return
      }
      if (form.dateWindowEnd < form.dateWindowStart) {
        setError(txt.dateWindowOrderError)
        return
      }
      const startDate = parseYMD(form.dateWindowStart)
      const endDate = parseYMD(form.dateWindowEnd)
      if (startDate && endDate) {
        const windowDays = Math.floor((endDate - startDate) / (24 * 60 * 60 * 1000)) + 1
        const totalNeeded = requiredFarmers * requiredDays
        if (windowDays < totalNeeded) {
          setError(txt.dateWindowLengthError.replace('{total}', totalNeeded).replace('{farmers}', requiredFarmers))
          return
        }
      }
      const payload = {
        taskType: form.taskType,
        requiredFarmers,
        requiredFarmerDays: requiredDays,
        dateWindowStart: form.dateWindowStart,
        dateWindowEnd: form.dateWindowEnd,
      }
      const created = await createTaskRequest(payload)
      setMessage(txt.createSuccess + `#${created?.id ?? ''}`)
      setForm((f) => ({ ...f, requiredFarmers: 1, requiredFarmerDays: 3 }))
      setRequestFilter('open')
      setActiveTab('requests')
    } catch (e2) {
      setError(e2?.message || (lang === 'mr' ? 'विनंती अयशस्वी' : 'Failed to create request'))
    } finally {
      setCreating(false)
    }
  }

  async function handleConfirm(bookingId) {
    setMessage('')
    setError('')
    try {
      await confirmBooking(bookingId)
      setMessage(txt.confirmSuccess)
      await refreshMyWork()
      await refreshGroupSchedule()
    } catch (e) {
      setError(e?.message || (lang === 'mr' ? 'पुष्टी अयशस्वी' : 'Confirm failed'))
    }
  }

  async function handleDeleteRequest(reqId) {
    const ok = window.confirm(txt.deleteConfirm)
    if (!ok) return
    setMessage('')
    setError('')
    try {
      await deleteTaskRequest(reqId)
      if (selectedRequest?.id === reqId || expandedRequestId === reqId) {
        setExpandedRequestId(null)
        setSelectedRequest(null)
        setCalendar([])
      }
      setMessage(txt.deleteSuccess)
      await refreshRequests()
    } catch (e) {
      setError(e?.message || (lang === 'mr' ? 'काढून टाकणे अयशस्वी' : 'Delete failed'))
    }
  }

  async function handleJoinRequestSubmit(r) {
    if (!r) return
    const lat = joinLocation?.lat
    const lng = joinLocation?.lng
    let label = (joinLocation?.label || '').trim()
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      setError(txt.locationRequired)
      return
    }
    setMessage('')
    setError('')
    try {
      if (!label) {
        label = await reverseGeocodeLabel(lat, lng)
        if (label) {
          setJoinLocation((prev) => (prev ? { ...prev, label } : prev))
        }
      }
      await requestJoin(r.id, lat, lng, label)
      setMessage(txt.joinRequested)
      setJoinFormRequestId(null)
      setJoinLocation(null)
      await refreshRequests()
      await refreshJoinRequests()
    } catch (e) {
      setError(e?.message || txt.joinFailed)
    }
  }

  async function handleJoinDecision(joinRequestId, approve) {
    setMessage('')
    setError('')
    try {
      if (approve) {
        await approveJoinRequest(joinRequestId)
        setMessage(txt.approveSuccess)
      } else {
        await rejectJoinRequest(joinRequestId)
        setMessage(txt.rejectSuccess)
      }
      await refreshJoinRequests()
      await refreshRequests()
    } catch (e) {
      setError(e?.message || txt.joinFailed)
    }
  }
  async function handleReschedule(booking) {
    const current = booking?.bookingDate || booking?.assignedWorkDate || ''
    const label = txt.reschedulePrompt
    const newDate = window.prompt(label, current)
    if (!newDate) return
    if (!parseYMD(newDate) || formatYMD(parseYMD(newDate)) != newDate) {
      setError(txt.invalidDate)
      return
    }
    setMessage('')
    setError('')
    try {
      await rescheduleBooking(booking.id, newDate)
      setMessage(txt.rescheduleSuccess)
      await refreshMyWork()
      await refreshGroupSchedule()
    } catch (e) {
      setError(e?.message || (lang === 'mr' ? 'वेळापत्रक बदल अयशस्वी' : 'Reschedule failed'))
    }
  }

  async function handleAddPersonalTask(e) {
    e.preventDefault()
    if (!sheetDateStr) return
    const title = taskForm.title.trim()
    if (!title) return
    setMessage('')
    setError('')
    try {
      const payload = {
        dateStr: sheetDateStr,
        title,
        time: taskForm.time || '',
        note: taskForm.note.trim(),
      }
      const created = await createPersonalTask(payload)
      setPersonalTasks((prev) => [...prev, created])
      setTaskForm({ title: '', time: '', note: '' })
      setShowTaskForm(true)
    } catch (e2) {
      setError(e2?.message || (lang === 'mr' ? 'काम जोडता आले नाही' : 'Failed to add task'))
    }
  }

  async function handleDeletePersonalTask(taskId) {
    setMessage('')
    setError('')
    try {
      await deletePersonalTask(taskId)
      setPersonalTasks((prev) => prev.filter((t) => t.id !== taskId))
    } catch (e2) {
      setError(e2?.message || (lang === 'mr' ? 'काम हटवता आले नाही' : 'Failed to delete task'))
    }
  }

  return (
    <div className="home">
      <Sidebar />

      <main className="feed">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <h2 style={{ margin: 0, color: '#2E7D32', display: 'flex', alignItems: 'center', gap: 8 }}>
            <MdHandshake /> {t('collab.title') || txt.title}
          </h2>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="filter-chip" onClick={() => setActiveTab('dashboard')} aria-pressed={activeTab === 'dashboard'}>
              <MdCalendarToday /> {txt.mySchedule}
            </button>
            <button className="filter-chip" onClick={() => setActiveTab('requests')} aria-pressed={activeTab === 'requests'}>
              <MdSchedule /> {txt.requests}
            </button>
            <button className="filter-chip" onClick={() => setActiveTab('create')} aria-pressed={activeTab === 'create'}>
              <MdAdd /> {txt.create}
            </button>
          </div>
        </div>

        <div style={{ marginTop: 10, color: '#444' }}>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div className="collab-stat-card">
              <div className="collab-stat-label">{txt.laborCredits}</div>
              <div className="collab-stat-value">{user?.laborCreditBalance ?? 0}</div>
            </div>
            <div className="collab-stat-card">
              <div className="collab-stat-label">{txt.dailyLimit}</div>
              <div className="collab-stat-value">{user?.dailyCommitmentLimit ?? 1}</div>
            </div>
          </div>
        </div>

        {(message || error) && (
          <div style={{ marginTop: 12 }}>
            {message && <div style={{ padding: 10, borderRadius: 10, background: '#e8f5e9', color: '#1b5e20' }}>{message}</div>}
            {error && <div style={{ marginTop: 8, padding: 10, borderRadius: 10, background: '#ffebee', color: '#b71c1c' }}>{error}</div>}
          </div>
        )}

        {activeTab === 'dashboard' && (
          <section style={{ marginTop: 16 }}>
            <h3 style={{ margin: '10px 0' }}>{txt.mySchedule}</h3>
            {loadingWork || loadingGroupSchedule ? (
              <div style={{ padding: 14, color: '#666' }}>{t('common.loading') || txt.loading}</div>
            ) : (
              <>
                {hasTodayWork && (
                  <div className="collab-card" style={{ marginTop: 8, borderLeft: '4px solid #2E7D32' }}>
                    <div className="collab-card-title">
                      {txt.todayWork} ({todayStr})
                    </div>
                    {todayBookingLines.length > 0 && (
                      <div style={{ marginTop: 6 }}>
                        <div className="collab-card-meta" style={{ fontWeight: 600 }}>
                          {txt.bookings}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
                          {todayBookingLines.map((line, idx) => (
                            <div key={`today-booking-${idx}`} className="collab-card-meta">
                              {line}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {todayTaskLines.length > 0 && (
                      <div style={{ marginTop: 8 }}>
                        <div className="collab-card-meta" style={{ fontWeight: 600 }}>
                          {txt.tasks}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
                          {todayTaskLines.map((line, idx) => (
                            <div key={`today-task-${idx}`} className="collab-card-meta">
                              {line}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <div className="collab-calendar" style={{ marginTop: 8 }}>
                  <div className="collab-calendar-header">
                    <button
                      className="filter-chip"
                      type="button"
                      onClick={() => setScheduleMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
                      aria-label="Previous month"
                      style={{ padding: '6px 10px' }}
                    >
                      <MdChevronLeft size={20} />
                    </button>
                    <div className="collab-calendar-title" style={{ fontSize: '1.1rem' }}>{scheduleMonthLabel}</div>
                    <button
                      className="filter-chip"
                      type="button"
                      onClick={() => setScheduleMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
                      aria-label="Next month"
                      style={{ padding: '6px 10px' }}
                    >
                      <MdChevronRight size={20} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', border: '2px solid #2E7D32', borderRadius: 12, overflow: 'hidden', marginTop: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', background: '#E8F5E9', borderRight: '2px solid #2E7D32', flexShrink: 0, zIndex: 2 }}>
                      {weekdays.map((d) => (
                        <div key={d} style={{ height: 120, width: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1rem', color: '#1B5E20', borderBottom: '1px solid #A5D6A7' }}>
                          {d}
                        </div>
                      ))}
                    </div>
                    <div style={{ overflowX: isMobile ? 'auto' : 'hidden', display: 'flex', flexDirection: 'column', flex: 1, background: '#fff' }}>
                      {weekdays.map((_, wIndex) => (
                        <div key={wIndex} style={{ display: 'flex', height: 120, borderBottom: '1px solid #eee', width: isMobile ? 'max-content' : '100%', minWidth: '100%' }}>
                          {scheduleDays.filter((_, i) => i % 7 === wIndex).map((d) => {
                            const entries = d.entries || []
                            const tasks = (personalTaskMap.get(d.dateStr) || []).slice().sort((a, b) => (a.time || '').localeCompare(b.time || ''))
                            const bookingCount = entries.length
                            const taskCount = tasks.length
                            const totalCount = bookingCount + taskCount
                            const bookingLabelBase = txt.booked
                            const bookingLabel = bookingCount > 1 ? `${bookingLabelBase} (${bookingCount})` : bookingLabelBase
                            const taskLabelBase = txt.tasks
                            const taskLabel = taskCount > 1 ? `${taskLabelBase} (${taskCount})` : taskLabelBase
                            const entryLines = entries.map((e) => {
                              const bookedByName = e?.bookedBy?.name || (e?.bookedBy?.id ? `#${e.bookedBy.id}` : '')
                              const requesterName = e?.requester?.name || (e?.requester?.id ? `#${e.requester.id}` : '')
                              const requestId = e?.taskRequestId ? `#${e.taskRequestId}` : ''
                              const parts = []
                              if (requestId) parts.push(requestId)
                              if (bookedByName) parts.push(`${txt.bookedBy} ${bookedByName}`)
                              if (requesterName) parts.push(`${txt.requester}: ${requesterName}`)
                              return parts.join(' · ')
                            })
                            const taskLines = tasks
                              .map((t) => {
                                const timeLabel = t.time ? `${t.time} ` : ''
                                return `${timeLabel}${t.title}`.trim()
                              })
                              .filter(Boolean)
                            const combinedLines = [...entryLines, ...taskLines]
                            const displayLines = combinedLines.slice(0, 3)
                            const dayClass = [
                              'collab-day',
                              'schedule-day',
                              d.inMonth ? 'in-month' : 'outside-month',
                              d.dateStr === todayStr && 'is-today',
                              totalCount > 0 && 'has-events',
                            ]
                              .filter(Boolean)
                              .join(' ')
                            const ariaLabel = totalCount > 0 ? `${d.dateStr} ${combinedLines.join(' | ')}` : d.dateStr
                            return (
                              <div
                                key={d.dateStr}
                                className={dayClass}
                                aria-label={ariaLabel.trim()}
                                onClick={() => setSheetData({ date: d.date, dateStr: d.dateStr })}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault()
                                    setSheetData({ date: d.date, dateStr: d.dateStr })
                                  }
                                }}
                                style={{ minWidth: isMobile ? 120 : 0, flex: 1, height: '100%', flexShrink: isMobile ? 0 : 1, borderRight: '1px solid #f0f0f0', overflow: 'hidden', padding: 6, background: d.dateStr === todayStr ? '#FFFDE7' : 'transparent', position: 'relative' }}
                              >
                                <div className="collab-day-number" style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#2E7D32', marginBottom: 4 }}>{isMarathi ? toMarathiNumerals(d.date.getDate()) : d.date.getDate()}</div>
                                {bookingCount > 0 && <div className="schedule-tag schedule-booking">{bookingLabel}</div>}
                                {taskCount > 0 && <div className="schedule-tag schedule-task">{taskLabel}</div>}
                                {!isMobile &&
                                  displayLines.map((line, idx) => (
                                    <div
                                      key={`${d.dateStr}-entry-${idx}`}
                                      className={`schedule-entry${idx >= entryLines.length ? ' task-entry' : ''}`}
                                    >
                                      {line}
                                    </div>
                                  ))}
                              </div>
                            )
                          })}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="collab-calendar-legend">
                    <div className="legend-item">
                      <span className="legend-swatch schedule-booking" /> {txt.booked}
                    </div>
                    <div className="legend-item">
                      <span className="legend-swatch schedule-task" /> {txt.tasks}
                    </div>
                  </div>
                </div>

                {myWork.length === 0 ? (
                  <div style={{ padding: 14, background: '#fff', borderRadius: 12, marginTop: 10 }}>
                    {txt.noWorkdays}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
                    {myWork.map((b) => (
                      <div key={b.id} className="collab-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'start', flexWrap: 'wrap' }}>
                          <div>
                            <div className="collab-card-title">
                              {txt.bookedDay}: {fmtDate(b.bookingDate || b.assignedWorkDate)}
                            </div>
                            <div className="collab-card-meta">
                              {txt.status}: {b.status}
                            </div>
                            <div className="collab-card-meta">
                              {txt.requester}: {b.requester?.name || (b.requester?.id ? `#${b.requester.id}` : '')}
                            </div>
                            <div className="collab-card-meta">
                              {txt.request}: #{b.taskRequestId}
                            </div>
                            <div className="collab-card-meta" style={{ fontSize: '0.8rem', marginTop: 6 }}>
                              {txt.requester}: {b.requesterConfirmed ? txt.yes : txt.no} | {txt.worker}:{' '}
                              {b.workerConfirmed ? txt.yes : txt.no}
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <button className="filter-chip" onClick={() => handleConfirm(b.id)}>
                              <MdCheckCircle /> {txt.confirm}
                            </button>
                            <button className="filter-chip" onClick={() => handleReschedule(b)}>
                              {txt.reschedule}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </section>
        )}

        {activeTab === 'requests' && (
          <section style={{ marginTop: 16 }}>
            <h3 style={{ margin: '10px 0' }}>
              {requestFilter === 'mine'
                ? txt.myRequests
                : requestFilter === 'filled'
                  ? txt.filled
                  : txt.open + ' ' + txt.requests}
            </h3>
            {loadingJoinRequests ? (
              <div style={{ padding: 12, color: '#666' }}>{t('common.loading') || txt.loading}</div>
            ) : pendingJoinRequests.length > 0 ? (
              <div className="collab-card" style={{ marginBottom: 12 }}>
                <div className="collab-card-title">{txt.joinRequestsTitle}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
                  {pendingJoinRequests.map((jr) => {
                    const lat = Number(jr.farmLocationLat)
                    const lng = Number(jr.farmLocationLng)
                    const coords = formatCoords(lat, lng)
                    const isExpanded = expandedJoinRequestId === jr.id
                    const hasCoords = Number.isFinite(lat) && Number.isFinite(lng)
                    return (
                      <div
                        key={jr.id}
                        className="collab-card"
                        style={{ background: '#f7faf7', cursor: 'pointer' }}
                        role="button"
                        tabIndex={0}
                        onClick={() => setExpandedJoinRequestId(isExpanded ? null : jr.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            setExpandedJoinRequestId(isExpanded ? null : jr.id)
                          }
                        }}
                      >
                        <div className="collab-card-meta">
                          #{jr.taskRequestId} - {taskTypeLabel(jr.taskType)}
                        </div>
                        <div className="collab-card-meta">
                          {txt.requester}: {jr.requestedBy?.name || `#${jr.requestedBy?.id ?? ''}`}
                        </div>
                        <div className="collab-card-meta">
                          {txt.farmLocation}: {jr.farmLocation || coords || '-'}
                        </div>
                        {Number.isFinite(jr.approvedCount) && Number.isFinite(jr.requiredCount) && (
                          <div className="collab-card-meta">
                            {txt.approve}: {jr.approvedCount}/{jr.requiredCount}
                          </div>
                        )}
                        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                          <button
                            className="filter-chip"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleJoinDecision(jr.id, true)
                            }}
                          >
                            {txt.approve}
                          </button>
                          <button
                            className="filter-chip"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleJoinDecision(jr.id, false)
                            }}
                          >
                            {txt.reject}
                          </button>
                        </div>
                        {isExpanded && (
                          <div style={{ marginTop: 10 }}>
                            {hasCoords ? (
                              <LocationPreview lat={lat} lng={lng} />
                            ) : (
                              <div className="collab-card-meta">{txt.selectOnMap}</div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : null}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
              <button
                className="filter-chip"
                onClick={() => setRequestFilter('open')}
                aria-pressed={requestFilter === 'open'}
              >
                {txt.open}
              </button>
              <button
                className="filter-chip"
                onClick={() => setRequestFilter('mine')}
                aria-pressed={requestFilter === 'mine'}
              >
                {txt.myRequests}
              </button>
              {user?.role === 'ADMIN' && (
                <button
                  className="filter-chip"
                  onClick={() => setRequestFilter('filled')}
                  aria-pressed={requestFilter === 'filled'}
                >
                  {txt.filled}
                </button>
              )}
            </div>
            {loadingRequests ? (
              <div style={{ padding: 14, color: '#666' }}>{t('common.loading') || txt.loading}</div>
            ) : requests.length === 0 ? (
              <div style={{ padding: 14, background: '#fff', borderRadius: 12 }}>
                {requestFilter === 'mine'
                  ? txt.noRequestsMine
                  : requestFilter === 'filled'
                    ? txt.noRequestsFilled
                    : txt.noRequestsOpen}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {requests.map((r) => {
                  const isMember = !!r.isMember || (user?.id && r.createdBy?.id === user.id)
                  const isJoinPending = r.joinRequestStatus === 'PENDING'
                  const canRequestJoin = !isMember && !isJoinPending && r.status === 'OPEN'
                  const hasSelectedLocation = Number.isFinite(joinLocation?.lat) && Number.isFinite(joinLocation?.lng)
                  const mapCenter = hasSelectedLocation ? [joinLocation.lat, joinLocation.lng] : DEFAULT_MAP_CENTER
                  const selectedCoords = formatCoords(joinLocation?.lat, joinLocation?.lng)
                  const selectedLabel = (joinLocation?.label || '').trim()
                  const selectedDisplay = selectedLabel || selectedCoords || txt.selectOnMap
                  return (
                    <div
                      key={r.id}
                      className={`collab-card request-card ${expandedRequestId === r.id ? 'selected' : ''}`}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleToggleRequestCalendar(r)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          handleToggleRequestCalendar(r)
                        }
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                        <div style={{ flex: 1 }}>
                          <div className="collab-card-title">
                            #{r.id} - {taskTypeLabel(r.taskType)}
                          </div>
                          <div className="collab-card-meta">
                            {txt.farmers}: {r.requiredFarmers ?? 1} |{' '}
                            {txt.daysPerFarmer}: {r.requiredFarmerDays} |{' '}
                            {txt.totalDays}: {(r.requiredFarmers ?? 1) * (r.requiredFarmerDays ?? 0)} |{' '}
                            {fmtDate(r.dateWindowStart)} to {fmtDate(r.dateWindowEnd)}
                          </div>
                          <div className="collab-card-meta">
                            {txt.requester}: {r.createdBy?.name || `#${r.createdBy?.id ?? ''}`}
                          </div>
                          {isJoinPending && (
                            <div className="collab-card-meta" style={{ marginTop: 6, color: '#666' }}>
                              {txt.joinPending}
                            </div>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                          {canRequestJoin && (
                            <button
                              type="button"
                              className="filter-chip"
                              onClick={(e) => {
                                e.stopPropagation()
                                setJoinFormRequestId((prev) => (prev === r.id ? null : r.id))
                                setJoinLocation(null)
                              }}
                              style={{ whiteSpace: 'nowrap', flexShrink: 0, fontSize: '0.8rem', padding: '6px 12px' }}
                            >
                              {txt.join}
                            </button>
                          )}
                          {user && (user.role === 'ADMIN' || r.createdBy?.id === user.id) && (
                            <button
                              type="button"
                              className="filter-chip"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteRequest(r.id)
                              }}
                              style={{
                                background: '#ffebee',
                                color: '#b71c1c',
                                borderColor: '#ffcdd2',
                                whiteSpace: 'nowrap',
                                flexShrink: 0,
                                fontSize: '0.8rem',
                                padding: '6px 12px',
                                height: 'fit-content',
                              }}
                            >
                              {txt.delete}
                            </button>
                          )}
                        </div>
                      </div>

                      {joinFormRequestId === r.id && (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault()
                            handleJoinRequestSubmit(r)
                          }}
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => e.stopPropagation()}
                          style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <div className="collab-card-meta">
                              {txt.selectedLocation}: {selectedDisplay}
                            </div>
                            <LocationPicker
                              value={joinLocation}
                              onChange={setJoinLocation}
                              center={mapCenter}
                              labels={{
                                searchPlaceholder: txt.searchLocation,
                                search: txt.search,
                                searching: txt.searching,
                                searchError: txt.searchError,
                              }}
                            />
                          </div>
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <button type="submit" className="filter-chip">
                              {txt.send}
                            </button>
                            <button
                              type="button"
                              className="filter-chip"
                              onClick={() => {
                                setJoinFormRequestId(null)
                                setJoinLocation(null)
                              }}
                            >
                              {txt.cancel}
                            </button>
                          </div>
                        </form>
                      )}

                      {expandedRequestId === r.id && (
                        <div
                          style={{ marginTop: 12 }}
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => e.stopPropagation()}
                          role="presentation"
                        >
                          <h4 style={{ margin: '10px 0' }}>
                            {txt.calendar}: #{r.id}
                          </h4>
                          {loadingCalendar ? (
                            <div style={{ padding: 14, color: '#666' }}>{t('common.loading') || txt.loading}</div>
                          ) : (
                            <div className="collab-calendar">
                              <div className="collab-calendar-header">
                                <button
                                  className="filter-chip"
                                  type="button"
                                  onClick={() => setCalendarMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
                                  disabled={!canPrevMonth}
                                  aria-label="Previous month"
                                  style={{ padding: '6px 10px' }}
                                >
                                  <MdChevronLeft size={20} />
                                </button>
                                <div className="collab-calendar-title" style={{ fontSize: '1.1rem' }}>{monthLabel}</div>
                                <button
                                  className="filter-chip"
                                  type="button"
                                  onClick={() => setCalendarMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
                                  disabled={!canNextMonth}
                                  aria-label="Next month"
                                  style={{ padding: '6px 10px' }}
                                >
                                  <MdChevronRight size={20} />
                                </button>
                              </div>

                              <div style={{ display: 'flex', border: '2px solid #2E7D32', borderRadius: 12, overflow: 'hidden', marginTop: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', background: '#E8F5E9', borderRight: '2px solid #2E7D32', flexShrink: 0, zIndex: 2 }}>
                                  {weekdays.map((d) => (
                                    <div key={d} style={{ height: 80, width: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1rem', color: '#1B5E20', borderBottom: '1px solid #A5D6A7' }}>
                                      {d}
                                    </div>
                                  ))}
                                </div>
                                <div style={{ overflowX: isMobile ? 'auto' : 'hidden', display: 'flex', flexDirection: 'column', flex: 1, background: '#fff' }}>
                                  {weekdays.map((_, wIndex) => (
                                    <div key={wIndex} style={{ display: 'flex', height: 80, borderBottom: '1px solid #eee', width: isMobile ? 'max-content' : '100%', minWidth: '100%' }}>
                                      {calendarDays.filter((_, i) => i % 7 === wIndex).map((d) => {
                                        const label =
                                          d.status === 'OUTSIDE'
                                            ? ''
                                            : d.status === 'UNAVAILABLE'
                                              ? txt.unavailable
                                              : d.status === 'BOOKED'
                                                ? ''
                                              : d.status.charAt(0) + d.status.slice(1).toLowerCase()
                                        const bookedByLabel = d.status === 'BOOKED' && d.bookedByName ? `${txt.bookedBy} ${d.bookedByName}` : ''
                                        const dayClass = [
                                          'collab-day',
                                          d.inMonth ? 'in-month' : 'outside-month',
                                          d.inWindow ? 'in-window' : 'outside-window',
                                          d.status === 'AVAILABLE' && 'status-available',
                                          d.status === 'BOOKED' && 'status-booked',
                                          d.status === 'FILLED' && 'status-filled',
                                          d.status === 'UNAVAILABLE' && 'status-unavailable',
                                          d.dateStr === todayStr && 'is-today',
                                          (d.disabled || !isMember) && 'is-disabled',
                                        ]
                                          .filter(Boolean)
                                          .join(' ')
                                        const disabled = d.disabled || !isMember
                                        const titleText = !isMember ? txt.joinRequired : bookedByLabel || label || (d.status === 'AVAILABLE' ? 'Available to book' : '')
                                        return (
                                          <button
                                            key={d.dateStr}
                                            type="button"
                                            className={dayClass}
                                            disabled={disabled}
                                            onClick={() => handleBook(d.dateStr)}
                                            aria-label={`${d.dateStr} ${bookedByLabel || label}`.trim()}
                                            title={titleText}
                                            style={{ minWidth: isMobile ? 80 : 0, flex: 1, height: '100%', flexShrink: isMobile ? 0 : 1, borderRadius: 0, border: 'none', borderRight: '1px solid #f0f0f0', margin: 0, background: d.dateStr === todayStr ? '#FFFDE7' : undefined, position: 'relative' }}
                                          >
                                            <div className="collab-day-number" style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#2E7D32' }}>{isMarathi ? toMarathiNumerals(d.date.getDate()) : d.date.getDate()}</div>
                                            {d.inWindow && label && <div className="collab-day-status">{label}</div>}
                                            {bookedByLabel && <div className="collab-day-booked-by">{bookedByLabel}</div>}
                                          </button>
                                        )
                                      })}
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="collab-calendar-legend">
                                <div className="legend-item">
                                  <span className="legend-swatch status-available" /> {txt.available}
                                </div>
                                <div className="legend-item">
                                  <span className="legend-swatch status-booked" /> {txt.booked}
                                </div>
                                <div className="legend-item">
                                  <span className="legend-swatch status-filled" /> {txt.filled}
                                </div>
                                <div className="legend-item">
                                  <span className="legend-swatch status-unavailable" /> {txt.unavailable}
                                </div>
                              </div>
                            </div>
                          )}
                          <div style={{ marginTop: 10, fontSize: 12, color: '#666' }}>
                            {txt.note}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        )}

        {activeTab === 'create' && (
          <section style={{ marginTop: 16 }}>
            <h3 style={{ margin: '10px 0' }}>{txt.newTaskRequest}</h3>
            <form onSubmit={handleCreate} style={{ background: '#fff', borderRadius: 12, padding: 14, boxShadow: '0 2px 6px rgba(0,0,0,0.06)', maxWidth: 520, width: '100%' }}>
              <label style={{ display: 'block', fontSize: 13, color: '#555', marginTop: 8 }}>
                {txt.taskType}
                <select
                  value={form.taskType}
                  onChange={(e) => setForm((f) => ({ ...f, taskType: e.target.value }))}
                  style={{ width: '100%', marginTop: 6, padding: 10, borderRadius: 10, border: '1px solid #ddd' }}
                >
                  {TASK_TYPES.map((x) => (
                    <option key={x.value} value={x.value}>
                      {lang === 'mr' ? x.labelMr : x.labelEn}
                    </option>
                  ))}
                </select>
              </label>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 12 }}>
                <label style={{ fontSize: 13, color: '#555', flex: '1 1 150px' }}>
                  {txt.requiredFarmers}
                  <input
                    type="number"
                    min={1}
                    required
                    value={form.requiredFarmers}
                    onChange={(e) => setForm((f) => ({ ...f, requiredFarmers: e.target.value }))}
                    style={{ width: '100%', marginTop: 6, padding: 10, borderRadius: 10, border: '1px solid #ddd' }}
                  />
                </label>
                <label style={{ fontSize: 13, color: '#555', flex: '1 1 150px' }}>
                  {txt.requiredFarmerDays}
                  <input
                    type="number"
                    min={1}
                    required
                    value={form.requiredFarmerDays}
                    onChange={(e) => setForm((f) => ({ ...f, requiredFarmerDays: e.target.value }))}
                    style={{ width: '100%', marginTop: 6, padding: 10, borderRadius: 10, border: '1px solid #ddd' }}
                  />
                </label>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 12 }}>
                <label style={{ fontSize: 13, color: '#555', flex: '1 1 150px' }}>
                  {txt.windowStart}
                  <input
                    type="date"
                    value={form.dateWindowStart}
                    onChange={(e) => setForm((f) => ({ ...f, dateWindowStart: e.target.value }))}
                    style={{ width: '100%', marginTop: 6, padding: 10, borderRadius: 10, border: '1px solid #ddd' }}
                    required
                  />
                </label>
                <label style={{ fontSize: 13, color: '#555', flex: '1 1 150px' }}>
                  {txt.windowEnd}
                  <input
                    type="date"
                    value={form.dateWindowEnd}
                    onChange={(e) => setForm((f) => ({ ...f, dateWindowEnd: e.target.value }))}
                    min={form.dateWindowStart || undefined}
                    style={{ width: '100%', marginTop: 6, padding: 10, borderRadius: 10, border: '1px solid #ddd' }}
                    required
                  />
                </label>
              </div>

              <button
                type="submit"
                disabled={creating}
                style={{
                  marginTop: 14,
                  padding: '10px 12px',
                  borderRadius: 12,
                  border: 'none',
                  background: '#2E7D32',
                  color: '#fff',
                  fontWeight: 700,
                  cursor: creating ? 'not-allowed' : 'pointer',
                  width: '100%',
                }}
              >
                {creating ? txt.creating : txt.createRequest}
              </button>
            </form>
          </section>
        )}
      </main>

      {sheetData && (
        <div
          className={`collab-bottom-sheet-overlay${isMobile ? '' : ' desktop'}`}
          onClick={() => setSheetData(null)}
        >
          <div
            className={`collab-bottom-sheet${isMobile ? '' : ' desktop'}`}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
            ref={sheetRef}
          >
            <div className="collab-sheet-header">
              <h3>{fmtDate(sheetDateStr)}</h3>
              <div className="collab-sheet-actions">
                <button
                  className="filter-chip"
                  type="button"
                  onClick={() => setShowTaskForm((open) => !open)}
                  aria-expanded={showTaskForm}
                >
                  <MdAdd /> {txt.addTask}
                </button>
                <button className="collab-sheet-close" onClick={() => setSheetData(null)} aria-label="Close details">
                  <MdClose size={24} />
                </button>
              </div>
            </div>
            <div className="collab-sheet-content">
              <div className="collab-sheet-section">
                <div className="collab-sheet-section-title">{txt.bookings}</div>
                {sheetBookings.length === 0 ? (
                  <div className="collab-sheet-empty">{txt.noBookings}</div>
                ) : (
                  sheetBookings.map((e, idx) => (
                    <div key={idx} className="collab-sheet-item">
                      <div>
                        <strong>{txt.request}:</strong> #{e.taskRequestId}
                      </div>
                      {e.requester && (
                        <div>
                          <strong>{txt.requester}:</strong> {e.requester.name || `#${e.requester.id}`}
                        </div>
                      )}
                      {e.bookedBy && (
                        <div>
                          <strong>{txt.bookedBy}:</strong> {e.bookedBy.name || `#${e.bookedBy.id}`}
                        </div>
                      )}
                      <div>
                        <strong>{txt.status}:</strong> {e.status}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="collab-sheet-section">
                <div className="collab-sheet-section-title">{txt.tasks}</div>
                {loadingPersonalTasks ? (
                  <div className="collab-sheet-empty">{txt.loading}</div>
                ) : sortedSheetTasks.length === 0 ? (
                  <div className="collab-sheet-empty">{txt.noTasks}</div>
                ) : (
                  sortedSheetTasks.map((t) => (
                    <div key={t.id} className="collab-task-item">
                      <div>
                        <div className="collab-task-title">{t.title}</div>
                        {t.time && <div className="collab-task-meta">{t.time}</div>}
                        {t.note && <div className="collab-task-note">{t.note}</div>}
                      </div>
                      <button
                        className="collab-task-delete"
                        type="button"
                        onClick={() => handleDeletePersonalTask(t.id)}
                      >
                        {txt.delete}
                      </button>
                    </div>
                  ))
                )}

                {showTaskForm && (
                  <form className="collab-task-form" onSubmit={handleAddPersonalTask}>
                    <label>
                      {txt.taskTitle}
                      <input
                        type="text"
                        value={taskForm.title}
                        onChange={(e) => setTaskForm((f) => ({ ...f, title: e.target.value }))}
                        required
                      />
                    </label>
                    <label>
                      {txt.taskTime}
                      <input
                        type="time"
                        value={taskForm.time}
                        onChange={(e) => setTaskForm((f) => ({ ...f, time: e.target.value }))}
                      />
                    </label>
                    <label>
                      {txt.taskNote}
                      <textarea
                        rows={3}
                        value={taskForm.note}
                        onChange={(e) => setTaskForm((f) => ({ ...f, note: e.target.value }))}
                      />
                    </label>
                    <div className="collab-task-actions">
                      <button className="filter-chip" type="submit">
                        {txt.saveTask}
                      </button>
                      <button
                        className="filter-chip"
                        type="button"
                        onClick={() => {
                          setTaskForm({ title: '', time: '', note: '' })
                          setShowTaskForm(false)
                        }}
                      >
                        {txt.cancel}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="home-weather-panel" />
    </div>
  )
}
