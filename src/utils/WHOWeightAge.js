const WHO_BOYS_RAW = [
  [0, 2.1, 2.5, 3.3, 4.4, 5],
  [1, 2.9, 3.4, 4.5, 5.8, 6.6],
  [2, 3.8, 4.4, 5.6, 7.1, 8],
  [3, 4.4, 5, 6.4, 8, 9],
  [4, 4.8, 5.6, 7, 8.7, 9.7],
  [5, 5.3, 6.1, 7.5, 9.3, 10.4],
  [6, 5.7, 6.4, 7.9, 9.8, 10.9],
  [7, 5.9, 6.7, 8.3, 10.3, 11.4],
  [8, 6.2, 7, 8.6, 10.7, 11.9],
  [9, 6.4, 7.2, 8.9, 11, 12.3],
  [10, 6.6, 7.5, 9.2, 11.4, 12.7],
  [11, 6.8, 7.7, 9.4, 11.7, 13],
  [12, 6.9, 7.8, 9.6, 11.9, 13.3],
  [13, 7.1, 8, 9.9, 12.3, 13.7],
  [14, 7.2, 8.2, 10.1, 12.6, 14],
  [15, 7.4, 8.4, 10.3, 12.8, 14.3],
  [16, 7.5, 8.5, 10.5, 13.1, 14.6],
  [17, 7.7, 8.7, 10.7, 13.4, 14.9],
  [18, 7.8, 8.9, 10.9, 13.6, 15.2],
  [19, 8, 9, 11.1, 13.9, 15.5],
  [20, 8.1, 9.2, 11.3, 14.2, 15.9],
  [21, 8.2, 9.4, 11.5, 14.5, 16.2],
  [22, 8.4, 9.5, 11.8, 14.7, 16.5],
  [23, 8.5, 9.7, 12, 15, 16.8],
  [24, 8.6, 9.8, 12.2, 15.3, 17.1],
  [25, 8.8, 10, 12.4, 15.5, 17.4],
  [26, 8.9, 10.1, 12.5, 15.8, 17.7],
  [27, 9, 10.3, 12.7, 16, 18],
  [28, 9.1, 10.4, 12.9, 16.3, 18.3],
  [29, 9.2, 10.5, 13.1, 16.5, 18.6],
  [30, 9.4, 10.7, 13.3, 16.8, 18.9],
  [31, 9.5, 10.8, 13.5, 17, 19.2],
  [32, 9.6, 11, 13.7, 17.3, 19.5],
  [33, 9.7, 11.1, 13.8, 17.5, 19.7],
  [34, 9.8, 11.2, 14, 17.8, 20],
  [35, 9.9, 11.3, 14.2, 18, 20.3],
  [36, 10, 11.5, 14.3, 18.3, 20.6],
  [37, 10.1, 11.6, 14.5, 18.5, 20.9],
  [38, 10.2, 11.7, 14.7, 18.7, 21.2],
  [39, 10.3, 11.8, 14.9, 19, 21.5],
  [40, 10.4, 12, 15.1, 19.2, 21.8],
  [41, 10.5, 12.1, 15.3, 19.5, 22.1],
  [42, 10.6, 12.2, 15.4, 19.7, 22.4],
  [43, 10.7, 12.3, 15.6, 20, 22.7],
  [44, 10.8, 12.4, 15.8, 20.2, 23],
  [45, 10.9, 12.6, 16, 20.5, 23.3],
  [46, 11, 12.7, 16.2, 20.7, 23.6],
  [47, 11.1, 12.8, 16.4, 21, 23.9],
  [48, 11.2, 12.9, 16.6, 21.2, 24.2],
  [49, 11.3, 13, 16.7, 21.4, 24.5],
  [50, 11.4, 13.2, 16.9, 21.7, 24.8],
  [51, 11.5, 13.3, 17.1, 21.9, 25.1],
  [52, 11.6, 13.4, 17.3, 22.2, 25.4],
  [53, 11.7, 13.5, 17.5, 22.4, 25.7],
  [54, 11.8, 13.7, 17.7, 22.7, 26],
  [55, 11.9, 13.8, 17.9, 22.9, 26.3],
  [56, 12, 13.9, 18.1, 23.2, 26.7],
  [57, 12.1, 14, 18.3, 23.4, 27],
  [58, 12.2, 14.2, 18.5, 23.7, 27.3],
  [59, 12.3, 14.3, 18.7, 23.9, 27.6],
  [60, 12.4, 14.4, 18.9, 24.2, 27.9],
]

const WHO_GIRLS_RAW = [
  [0, 2, 2.4, 3.2, 4.2, 4.8],
  [1, 2.7, 3.2, 4.2, 5.5, 6.2],
  [2, 3.4, 3.9, 5.1, 6.6, 7.5],
  [3, 4, 4.5, 5.8, 7.5, 8.5],
  [4, 4.4, 5, 6.4, 8.1, 9.3],
  [5, 4.8, 5.4, 6.9, 8.8, 9.9],
  [6, 5.1, 5.8, 7.3, 9.3, 10.4],
  [7, 5.4, 6.1, 7.6, 9.8, 10.9],
  [8, 5.6, 6.3, 7.9, 10.1, 11.3],
  [9, 5.8, 6.6, 8.2, 10.5, 11.8],
  [10, 6, 6.8, 8.5, 10.9, 12.2],
  [11, 6.2, 7, 8.7, 11.2, 12.6],
  [12, 6.3, 7.1, 8.9, 11.5, 12.9],
  [13, 6.5, 7.3, 9.2, 11.8, 13.3],
  [14, 6.6, 7.5, 9.4, 12.1, 13.7],
  [15, 6.8, 7.7, 9.6, 12.4, 14],
  [16, 6.9, 7.8, 9.8, 12.7, 14.3],
  [17, 7, 8, 10, 12.9, 14.6],
  [18, 7.2, 8.1, 10.2, 13.2, 14.9],
  [19, 7.3, 8.3, 10.4, 13.5, 15.2],
  [20, 7.5, 8.5, 10.6, 13.7, 15.5],
  [21, 7.6, 8.6, 10.9, 14, 15.8],
  [22, 7.7, 8.8, 11.1, 14.3, 16.2],
  [23, 7.9, 9, 11.3, 14.6, 16.5],
  [24, 8, 9.1, 11.5, 14.8, 16.8],
  [25, 8.1, 9.3, 11.7, 15.1, 17.1],
  [26, 8.3, 9.4, 11.9, 15.4, 17.4],
  [27, 8.4, 9.6, 12.1, 15.7, 17.8],
  [28, 8.5, 9.7, 12.3, 15.9, 18.1],
  [29, 8.6, 9.9, 12.5, 16.2, 18.4],
  [30, 8.8, 10, 12.7, 16.4, 18.7],
  [31, 8.9, 10.2, 12.9, 16.7, 19],
  [32, 9, 10.3, 13.1, 17, 19.3],
  [33, 9.1, 10.4, 13.3, 17.2, 19.6],
  [34, 9.2, 10.6, 13.5, 17.5, 19.9],
  [35, 9.3, 10.7, 13.7, 17.7, 20.2],
  [36, 9.4, 10.8, 13.9, 18, 20.5],
  [37, 9.5, 11, 14, 18.2, 20.8],
  [38, 9.6, 11.1, 14.2, 18.5, 21.1],
  [39, 9.7, 11.2, 14.4, 18.7, 21.4],
  [40, 9.8, 11.3, 14.6, 19, 21.7],
  [41, 9.9, 11.5, 14.8, 19.2, 22],
  [42, 10, 11.6, 15, 19.5, 22.3],
  [43, 10.1, 11.7, 15.2, 19.7, 22.6],
  [44, 10.2, 11.8, 15.3, 20, 22.9],
  [45, 10.3, 12, 15.5, 20.2, 23.2],
  [46, 10.4, 12.1, 15.7, 20.5, 23.5],
  [47, 10.5, 12.2, 15.9, 20.7, 23.8],
  [48, 10.6, 12.3, 16.1, 21, 24.2],
  [49, 10.7, 12.4, 16.3, 21.2, 24.5],
  [50, 10.8, 12.6, 16.5, 21.5, 24.8],
  [51, 10.9, 12.7, 16.7, 21.7, 25.1],
  [52, 11, 12.8, 16.9, 22, 25.4],
  [53, 11.1, 12.9, 17.1, 22.3, 25.8],
  [54, 11.2, 13, 17.3, 22.5, 26.1],
  [55, 11.3, 13.2, 17.5, 22.8, 26.4],
  [56, 11.4, 13.3, 17.7, 23, 26.7],
  [57, 11.5, 13.4, 17.9, 23.3, 27.1],
  [58, 11.6, 13.5, 18.1, 23.5, 27.4],
  [59, 11.7, 13.6, 18.3, 23.8, 27.7],
  [60, 11.8, 13.7, 18.5, 24, 28],
]

const toRows = rows =>
  rows.map(([m, SD3neg, SD2neg, SD0, SD2, SD3]) => ({
    x: m,
    SD3neg,
    SD2neg,
    SD0,
    SD2,
    SD3,
  }))

const WHO_BOYS = toRows(WHO_BOYS_RAW)
const WHO_GIRLS = toRows(WHO_GIRLS_RAW)

export function toNumberOrNull(value) {
  if (value === null || value === undefined || value === '') return null

  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

export function calcAgeMonthsAtDate(dob, targetDate = null) {
  if (!dob) return null

  const birth = new Date(dob)
  const target = targetDate ? new Date(targetDate) : new Date()

  if (Number.isNaN(birth.getTime()) || Number.isNaN(target.getTime())) return null

  let months = (target.getFullYear() - birth.getFullYear()) * 12
  months += target.getMonth() - birth.getMonth()

  if (target.getDate() < birth.getDate()) {
    months -= 1
  }

  return Math.max(0, months)
}

export function pad2(value) {
  return String(value).padStart(2, '0')
}

export function getMonthKey(date = new Date()) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}`
}

export function getCurrentMonthKey() {
  return getMonthKey(new Date())
}

export function parseMonthKey(monthKey) {
  const [year, month] = String(monthKey || '').split('-').map(Number)

  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    return new Date()
  }

  return new Date(year, month - 1, 1)
}

export function formatMonthLabel(monthKey) {
  return parseMonthKey(monthKey).toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric',
  })
}

function formatLocalDate(date) {
  const year = date.getFullYear()
  const month = pad2(date.getMonth() + 1)
  const day = pad2(date.getDate())

  return `${year}-${month}-${day}`
}

export function getMonthRangeFromKey(monthKey) {
  const startDate = parseMonthKey(monthKey)
  const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 1)

  return {
    start: formatLocalDate(startDate),
    end: formatLocalDate(endDate),
  }
}

function findNearestReferenceRow(ageMonths, gender) {
  const age = toNumberOrNull(ageMonths)
  if (age === null || age < 0 || age > 60) return null

  const data = gender === 'Laki-laki' ? WHO_BOYS : WHO_GIRLS

  return data.reduce((nearest, row) =>
    Math.abs(row.x - age) < Math.abs(nearest.x - age) ? row : nearest
  , data[0])
}

export function getWeightAgeZScore({ jenis_kelamin, age_months, berat_badan }) {
  const weight = toNumberOrNull(berat_badan)
  const row = findNearestReferenceRow(age_months, jenis_kelamin)

  if (!row || weight === null) return null

  if (weight >= row.SD0) {
    const range = row.SD2 - row.SD0
    return range > 0 ? ((weight - row.SD0) / range) * 2 : 0
  }

  const range = row.SD0 - row.SD2neg
  return range > 0 ? ((weight - row.SD0) / range) * 2 : 0
}

export function classifyWeightAge(payload) {
  const z = getWeightAgeZScore(payload)
  if (z === null) return null

  if (z < -3) return 'Gizi Buruk'
  if (z < -2) return 'Gizi Kurang'
  if (z <= 1) return 'Gizi Baik'
  if (z <= 2) return 'Berisiko Lebih'
  if (z <= 3) return 'Gizi Lebih'

  return 'Obesitas'
}

export function normalizeDashboardGiziLabel(label) {
  if (!label) return null

  if (label === 'Berisiko Lebih' || label === 'Gizi Lebih' || label === 'Obesitas') {
    return 'Gizi Lebih'
  }

  return label
}

export function createEmptyDashboardGiziCounts() {
  return {
    'Gizi Baik': 0,
    'Gizi Kurang': 0,
    'Gizi Buruk': 0,
    'Gizi Lebih': 0,
  }
}

export function mergeDashboardGiziCounts(target, source) {
  const result = { ...target }

  Object.keys(result).forEach(key => {
    result[key] += Number(source?.[key] ?? 0)
  })

  return result
}
