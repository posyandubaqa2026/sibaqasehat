<template>
  <div class="grafik-page">
    <div class="grafik-page-header">
      <button class="btn-back-grafik" @click="$emit('back')" type="button">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 3L5 8L10 13" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Kembali
      </button>

      <div class="grafik-header-info">
        <div class="modal-avatar" :class="selectedBalita?.jenis_kelamin === 'Laki-laki' ? 'laki' : 'perempuan'">
          {{ selectedBalita?.nama_lengkap?.[0] ?? '?' }}
        </div>

        <div>
          <h3>{{ selectedBalita?.nama_lengkap ?? 'Detail Grafik' }}</h3>
          <p>
            Ibu: {{ selectedBalita?.nama_ibu ?? '–' }} ·
            {{ selectedBalita?.jenis_kelamin ?? '–' }} ·
            Usia: {{ calcAge(selectedBalita?.tanggal_lahir) }}
          </p>
        </div>
      </div>
    </div>

    <div class="grafik-page-body">
      <div class="modal-chart-loading" v-if="chartLoading">
        <div class="spinner-lg"></div>
        <span>Memuat grafik {{ selectedPeriodLabel }}...</span>
      </div>

      <template v-else>
        <div class="grafik-tab-menu" role="tablist" aria-label="Menu grafik balita">
          <button
            v-for="menu in chartMenus"
            :key="menu.key"
            type="button"
            class="grafik-tab-btn"
            :class="{ active: activeChartKey === menu.key }"
            @click="activeChartKey = menu.key"
          >
            <span>{{ menu.label }}</span>
            <small>{{ menu.shortLabel }}</small>
          </button>
        </div>

        <div class="modal-chart-empty" v-if="!selectedHasMonthlyData">
          <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
            <circle cx="26" cy="26" r="24" fill="#FEF0F0"/>
            <path d="M26 15v14M26 36h.01" stroke="#E55353" stroke-width="2.2" stroke-linecap="round"/>
          </svg>
          <h3>Tidak ditemukan data</h3>
          <p>Tidak ada hasil penimbangan untuk {{ selectedBalita?.nama_lengkap ?? 'balita ini' }} pada periode {{ selectedPeriodLabel }}.</p>
        </div>

        <div class="modal-chart-empty" v-else-if="!hasActiveChartData">
          <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
            <circle cx="26" cy="26" r="24" fill="#FEF0F0"/>
            <path d="M26 15v14M26 36h.01" stroke="#E55353" stroke-width="2.2" stroke-linecap="round"/>
          </svg>
          <h3>Data belum lengkap</h3>
          <p>
            Grafik {{ activeChart.shortLabel }} membutuhkan data
            {{ activeChart.requiredText }} pada periode {{ selectedPeriodLabel }}.
          </p>
        </div>

        <template v-else>
          <div class="status-row">
            <div class="status-card" :class="getZScoreClass(selectedChartPoint)">
              <span class="status-label">{{ activeChart.statusLabel }}</span>
              <span class="status-value">{{ getZScoreStatus(selectedChartPoint) }}</span>
              <span class="status-zscore">Z-Score: {{ getZScore(selectedChartPoint).toFixed(2) }}</span>
            </div>

            <div class="stat-card">
              <span class="stat-label">{{ activeChart.primaryStatLabel }}</span>
              <span class="stat-value">
                {{ formatPointValue(selectedChartPoint, activeChart.yField) }}
                <small>{{ activeChart.yUnit }}</small>
              </span>
            </div>

            <div class="stat-card">
              <span class="stat-label">{{ activeChart.secondaryStatLabel }}</span>
              <span class="stat-value">
                {{ secondaryStatValue }}
                <small>{{ activeChart.secondaryUnit }}</small>
              </span>
            </div>
          </div>

          <div class="chart-container">
            <div class="chart-title">
              {{ activeChart.title }}
              <span class="chart-subtitle">
                {{ activeReferenceLabel }} {{ selectedBalita?.jenis_kelamin === 'Laki-laki' ? '— Laki-laki' : '— Perempuan' }} ·
                Periode {{ selectedPeriodLabel }}
              </span>
            </div>

            <div class="chart-wrap">
              <svg
                :viewBox="`0 0 ${SVG_W} ${SVG_H}`"
                class="who-chart"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="xMidYMid meet"
              >
                <g class="grid-lines">
                  <line
                    v-for="x in activeGridX" :key="`gx-${x}`"
                    :x1="xScale(x)" :y1="PAD_TOP"
                    :x2="xScale(x)" :y2="SVG_H - PAD_BOTTOM"
                    stroke="#E8EDF2" stroke-width="1"
                  />
                  <line
                    v-for="y in activeGridY" :key="`gy-${y}`"
                    :x1="PAD_LEFT" :y1="yScale(y)"
                    :x2="SVG_W - PAD_RIGHT" :y2="yScale(y)"
                    stroke="#E8EDF2" stroke-width="1"
                  />
                </g>

                <polygon :points="fillZone(activeReferenceData, 'SD3', 'top')" fill="#FFEBEB" opacity="0.7"/>
                <polygon :points="fillZone(activeReferenceData, 'SD2', 'SD3')" fill="#FFF9E6" opacity="0.7"/>
                <polygon :points="fillZone(activeReferenceData, 'SD0', 'SD2')" fill="#EDFAF4" opacity="0.8"/>
                <polygon :points="fillZone(activeReferenceData, 'SD2neg', 'SD0')" fill="#EDFAF4" opacity="0.8"/>
                <polygon :points="fillZone(activeReferenceData, 'SD3neg', 'SD2neg')" fill="#FFF9E6" opacity="0.7"/>
                <polygon :points="fillZone(activeReferenceData, 'bottom', 'SD3neg')" fill="#FFEBEB" opacity="0.7"/>

                <polyline :points="linePath(activeReferenceData, 'SD3')" fill="none" stroke="#DC2626" stroke-width="1.2" stroke-dasharray="4 3" opacity="0.8"/>
                <polyline :points="linePath(activeReferenceData, 'SD2')" fill="none" stroke="#D97706" stroke-width="1.2" stroke-dasharray="4 3" opacity="0.8"/>
                <polyline :points="linePath(activeReferenceData, 'SD0')" fill="none" stroke="#16A87A" stroke-width="2" opacity="1"/>
                <polyline :points="linePath(activeReferenceData, 'SD2neg')" fill="none" stroke="#D97706" stroke-width="1.2" stroke-dasharray="4 3" opacity="0.8"/>
                <polyline :points="linePath(activeReferenceData, 'SD3neg')" fill="none" stroke="#DC2626" stroke-width="1.2" stroke-dasharray="4 3" opacity="0.8"/>

                <template v-if="lastReferencePoint">
                  <text :x="xScale(lastReferencePoint.x)+4" :y="yScale(lastReferencePoint.SD3)+4" font-size="9" fill="#DC2626" font-weight="600">+3</text>
                  <text :x="xScale(lastReferencePoint.x)+4" :y="yScale(lastReferencePoint.SD2)+4" font-size="9" fill="#D97706" font-weight="600">+2</text>
                  <text :x="xScale(lastReferencePoint.x)+4" :y="yScale(lastReferencePoint.SD0)+4" font-size="9" fill="#16A87A" font-weight="700">0</text>
                  <text :x="xScale(lastReferencePoint.x)+4" :y="yScale(lastReferencePoint.SD2neg)+4" font-size="9" fill="#D97706" font-weight="600">-2</text>
                  <text :x="xScale(lastReferencePoint.x)+4" :y="yScale(lastReferencePoint.SD3neg)+4" font-size="9" fill="#DC2626" font-weight="600">-3</text>
                </template>

                <g>
                  <line v-for="x in activeXTicks" :key="`xt-${x}`"
                    :x1="xScale(x)" :y1="SVG_H - PAD_BOTTOM"
                    :x2="xScale(x)" :y2="SVG_H - PAD_BOTTOM + 4"
                    stroke="#BCC5CC" stroke-width="1"
                  />
                  <text v-for="x in activeXTicks" :key="`xl-${x}`"
                    :x="xScale(x)" :y="SVG_H - PAD_BOTTOM + 14"
                    text-anchor="middle" font-size="9" fill="#6B7B8A"
                  >{{ x }}</text>
                </g>

                <g>
                  <text v-for="y in activeGridY" :key="`yl-${y}`"
                    :x="PAD_LEFT - 6" :y="yScale(y) + 3.5"
                    text-anchor="end" font-size="9" fill="#6B7B8A"
                  >{{ y }}</text>
                </g>

                <line :x1="PAD_LEFT" :y1="PAD_TOP" :x2="PAD_LEFT" :y2="SVG_H - PAD_BOTTOM" stroke="#BCC5CC" stroke-width="1.2"/>
                <line :x1="PAD_LEFT" :y1="SVG_H - PAD_BOTTOM" :x2="SVG_W - PAD_RIGHT" :y2="SVG_H - PAD_BOTTOM" stroke="#BCC5CC" stroke-width="1.2"/>

                <text :x="SVG_W/2" :y="SVG_H - 4" text-anchor="middle" font-size="10" fill="#6B7B8A" font-weight="600">{{ activeChart.xAxisLabel }}</text>
                <text
                  :x="12" :y="SVG_H/2"
                  text-anchor="middle" font-size="10" fill="#6B7B8A" font-weight="600"
                  :transform="`rotate(-90, 12, ${SVG_H/2})`"
                >{{ activeChart.yAxisLabel }}</text>

                <line
                  v-if="selectedChartPoint && isPointXInsideRange(selectedChartPoint)"
                  :x1="xScale(getPointX(selectedChartPoint))" :y1="PAD_TOP"
                  :x2="xScale(getPointX(selectedChartPoint))" :y2="SVG_H - PAD_BOTTOM"
                  stroke="#2F9D94" stroke-width="1" stroke-dasharray="3 2" opacity="0.6"
                />

                <g v-if="chartDisplayPoints.length > 0">
                  <g v-for="(h, idx) in chartDisplayPoints" :key="`dot-${idx}`">
                    <circle
                      :cx="xScale(getPointX(h))"
                      :cy="yScale(getPointY(h))"
                      r="7"
                      :fill="dotColor"
                      opacity="0.2"
                    />

                    <circle
                      :cx="xScale(getPointX(h))"
                      :cy="yScale(getPointY(h))"
                      r="4.5"
                      :fill="dotColor"
                      stroke="white"
                      stroke-width="1.5"
                    />

                    <g>
                      <rect
                        :x="xScale(getPointX(h)) - 30"
                        :y="yScale(getPointY(h)) - 28"
                        width="60"
                        height="20"
                        rx="6"
                        :fill="dotColor"
                      />
                      <text
                        :x="xScale(getPointX(h))"
                        :y="yScale(getPointY(h)) - 14"
                        text-anchor="middle"
                        font-size="9"
                        fill="white"
                        font-weight="700"
                      >
                        {{ formatPointValue(h, activeChart.yField) }} {{ activeChart.yUnit }}
                      </text>
                    </g>
                  </g>
                </g>
              </svg>
            </div>

            <div class="chart-legend">
              <div class="legend-item">
                <span class="legend-line" style="background:#16A87A; height:2px;"></span>
                <span>Median (0)</span>
              </div>
              <div class="legend-item">
                <span class="legend-line" style="background:#D97706; border-top: 2px dashed #D97706; height:0;"></span>
                <span>±2 SD</span>
              </div>
              <div class="legend-item">
                <span class="legend-line" style="background:#DC2626; border-top: 2px dashed #DC2626; height:0;"></span>
                <span>±3 SD</span>
              </div>
              <div class="legend-item">
                <span class="legend-dot" :style="`background:${dotColor}`"></span>
                <span>{{ selectedBalita?.nama_lengkap }}</span>
              </div>
            </div>
          </div>
        </template>
      </template>
    </div>
  </div>
</template>


<script setup>
import { computed, ref } from 'vue'
import '../assets/GrafikBalitaPage.css'

const props = defineProps({
  selectedBalita: { type: Object, default: null },
  chartLoading: { type: Boolean, default: false },
  selectedPeriodLabel: { type: String, default: '' },
})

defineEmits(['back'])

const activeChartKey = ref('weightAge')

const selectedHasMonthlyData = computed(() =>
  (props.selectedBalita?.hasil_penimbangan ?? []).length > 0
)

const chartPoints = computed(() =>
  props.selectedBalita?.hasil_penimbangan ?? []
)

function calcAgeMonths(dob) {
  if (!dob) return null

  const today = new Date()
  const birth = new Date(dob)

  return (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth())
}

function calcAge(dob) {
  const m = calcAgeMonths(dob)

  if (m === null) return '–'
  if (m < 24) return `${m} bulan`

  return `${Math.floor(m / 12)} tahun ${m % 12} bulan`
}

const WHO_BOYS = [
  { m:0,  SD3neg:2.1, SD2neg:2.5, SD0:3.3, SD2:4.4, SD3:5.0 },
  { m:1,  SD3neg:2.9, SD2neg:3.4, SD0:4.5, SD2:5.8, SD3:6.6 },
  { m:2,  SD3neg:3.8, SD2neg:4.4, SD0:5.6, SD2:7.1, SD3:8.0 },
  { m:3,  SD3neg:4.4, SD2neg:5.0, SD0:6.4, SD2:8.0, SD3:9.0 },
  { m:4,  SD3neg:4.8, SD2neg:5.6, SD0:7.0, SD2:8.7, SD3:9.7 },
  { m:5,  SD3neg:5.3, SD2neg:6.1, SD0:7.5, SD2:9.3, SD3:10.4 },
  { m:6,  SD3neg:5.7, SD2neg:6.4, SD0:7.9, SD2:9.8, SD3:10.9 },
  { m:7,  SD3neg:5.9, SD2neg:6.7, SD0:8.3, SD2:10.3, SD3:11.4 },
  { m:8,  SD3neg:6.2, SD2neg:7.0, SD0:8.6, SD2:10.7, SD3:11.9 },
  { m:9,  SD3neg:6.4, SD2neg:7.2, SD0:8.9, SD2:11.0, SD3:12.3 },
  { m:10, SD3neg:6.6, SD2neg:7.5, SD0:9.2, SD2:11.4, SD3:12.7 },
  { m:11, SD3neg:6.8, SD2neg:7.7, SD0:9.4, SD2:11.7, SD3:13.0 },
  { m:12, SD3neg:6.9, SD2neg:7.8, SD0:9.6, SD2:11.9, SD3:13.3 },
  { m:13, SD3neg:7.1, SD2neg:8.0, SD0:9.9, SD2:12.3, SD3:13.7 },
  { m:14, SD3neg:7.2, SD2neg:8.2, SD0:10.1, SD2:12.6, SD3:14.0 },
  { m:15, SD3neg:7.4, SD2neg:8.4, SD0:10.3, SD2:12.8, SD3:14.3 },
  { m:16, SD3neg:7.5, SD2neg:8.5, SD0:10.5, SD2:13.1, SD3:14.6 },
  { m:17, SD3neg:7.7, SD2neg:8.7, SD0:10.7, SD2:13.4, SD3:14.9 },
  { m:18, SD3neg:7.8, SD2neg:8.9, SD0:10.9, SD2:13.6, SD3:15.2 },
  { m:19, SD3neg:8.0, SD2neg:9.0, SD0:11.1, SD2:13.9, SD3:15.5 },
  { m:20, SD3neg:8.1, SD2neg:9.2, SD0:11.3, SD2:14.2, SD3:15.9 },
  { m:21, SD3neg:8.2, SD2neg:9.4, SD0:11.5, SD2:14.5, SD3:16.2 },
  { m:22, SD3neg:8.4, SD2neg:9.5, SD0:11.8, SD2:14.7, SD3:16.5 },
  { m:23, SD3neg:8.5, SD2neg:9.7, SD0:12.0, SD2:15.0, SD3:16.8 },
  { m:24, SD3neg:8.6, SD2neg:9.8, SD0:12.2, SD2:15.3, SD3:17.1 },
  { m:25, SD3neg:8.8, SD2neg:10.0, SD0:12.4, SD2:15.5, SD3:17.4 },
  { m:26, SD3neg:8.9, SD2neg:10.1, SD0:12.5, SD2:15.8, SD3:17.7 },
  { m:27, SD3neg:9.0, SD2neg:10.3, SD0:12.7, SD2:16.0, SD3:18.0 },
  { m:28, SD3neg:9.1, SD2neg:10.4, SD0:12.9, SD2:16.3, SD3:18.3 },
  { m:29, SD3neg:9.2, SD2neg:10.5, SD0:13.1, SD2:16.5, SD3:18.6 },
  { m:30, SD3neg:9.4, SD2neg:10.7, SD0:13.3, SD2:16.8, SD3:18.9 },
  { m:31, SD3neg:9.5, SD2neg:10.8, SD0:13.5, SD2:17.0, SD3:19.2 },
  { m:32, SD3neg:9.6, SD2neg:11.0, SD0:13.7, SD2:17.3, SD3:19.5 },
  { m:33, SD3neg:9.7, SD2neg:11.1, SD0:13.8, SD2:17.5, SD3:19.7 },
  { m:34, SD3neg:9.8, SD2neg:11.2, SD0:14.0, SD2:17.8, SD3:20.0 },
  { m:35, SD3neg:9.9, SD2neg:11.3, SD0:14.2, SD2:18.0, SD3:20.3 },
  { m:36, SD3neg:10.0, SD2neg:11.5, SD0:14.3, SD2:18.3, SD3:20.6 },
  { m:37, SD3neg:10.1, SD2neg:11.6, SD0:14.5, SD2:18.5, SD3:20.9 },
  { m:38, SD3neg:10.2, SD2neg:11.7, SD0:14.7, SD2:18.7, SD3:21.2 },
  { m:39, SD3neg:10.3, SD2neg:11.8, SD0:14.9, SD2:19.0, SD3:21.5 },
  { m:40, SD3neg:10.4, SD2neg:12.0, SD0:15.1, SD2:19.2, SD3:21.8 },
  { m:41, SD3neg:10.5, SD2neg:12.1, SD0:15.3, SD2:19.5, SD3:22.1 },
  { m:42, SD3neg:10.6, SD2neg:12.2, SD0:15.4, SD2:19.7, SD3:22.4 },
  { m:43, SD3neg:10.7, SD2neg:12.3, SD0:15.6, SD2:20.0, SD3:22.7 },
  { m:44, SD3neg:10.8, SD2neg:12.4, SD0:15.8, SD2:20.2, SD3:23.0 },
  { m:45, SD3neg:10.9, SD2neg:12.6, SD0:16.0, SD2:20.5, SD3:23.3 },
  { m:46, SD3neg:11.0, SD2neg:12.7, SD0:16.2, SD2:20.7, SD3:23.6 },
  { m:47, SD3neg:11.1, SD2neg:12.8, SD0:16.4, SD2:21.0, SD3:23.9 },
  { m:48, SD3neg:11.2, SD2neg:12.9, SD0:16.6, SD2:21.2, SD3:24.2 },
  { m:49, SD3neg:11.3, SD2neg:13.0, SD0:16.7, SD2:21.4, SD3:24.5 },
  { m:50, SD3neg:11.4, SD2neg:13.2, SD0:16.9, SD2:21.7, SD3:24.8 },
  { m:51, SD3neg:11.5, SD2neg:13.3, SD0:17.1, SD2:21.9, SD3:25.1 },
  { m:52, SD3neg:11.6, SD2neg:13.4, SD0:17.3, SD2:22.2, SD3:25.4 },
  { m:53, SD3neg:11.7, SD2neg:13.5, SD0:17.5, SD2:22.4, SD3:25.7 },
  { m:54, SD3neg:11.8, SD2neg:13.7, SD0:17.7, SD2:22.7, SD3:26.0 },
  { m:55, SD3neg:11.9, SD2neg:13.8, SD0:17.9, SD2:22.9, SD3:26.3 },
  { m:56, SD3neg:12.0, SD2neg:13.9, SD0:18.1, SD2:23.2, SD3:26.7 },
  { m:57, SD3neg:12.1, SD2neg:14.0, SD0:18.3, SD2:23.4, SD3:27.0 },
  { m:58, SD3neg:12.2, SD2neg:14.2, SD0:18.5, SD2:23.7, SD3:27.3 },
  { m:59, SD3neg:12.3, SD2neg:14.3, SD0:18.7, SD2:23.9, SD3:27.6 },
  { m:60, SD3neg:12.4, SD2neg:14.4, SD0:18.9, SD2:24.2, SD3:27.9 },
]

const WHO_GIRLS = [
  { m:0,  SD3neg:2.0, SD2neg:2.4, SD0:3.2, SD2:4.2, SD3:4.8 },
  { m:1,  SD3neg:2.7, SD2neg:3.2, SD0:4.2, SD2:5.5, SD3:6.2 },
  { m:2,  SD3neg:3.4, SD2neg:3.9, SD0:5.1, SD2:6.6, SD3:7.5 },
  { m:3,  SD3neg:4.0, SD2neg:4.5, SD0:5.8, SD2:7.5, SD3:8.5 },
  { m:4,  SD3neg:4.4, SD2neg:5.0, SD0:6.4, SD2:8.1, SD3:9.3 },
  { m:5,  SD3neg:4.8, SD2neg:5.4, SD0:6.9, SD2:8.8, SD3:9.9 },
  { m:6,  SD3neg:5.1, SD2neg:5.8, SD0:7.3, SD2:9.3, SD3:10.4 },
  { m:7,  SD3neg:5.4, SD2neg:6.1, SD0:7.6, SD2:9.8, SD3:10.9 },
  { m:8,  SD3neg:5.6, SD2neg:6.3, SD0:7.9, SD2:10.1, SD3:11.3 },
  { m:9,  SD3neg:5.8, SD2neg:6.6, SD0:8.2, SD2:10.5, SD3:11.8 },
  { m:10, SD3neg:6.0, SD2neg:6.8, SD0:8.5, SD2:10.9, SD3:12.2 },
  { m:11, SD3neg:6.2, SD2neg:7.0, SD0:8.7, SD2:11.2, SD3:12.6 },
  { m:12, SD3neg:6.3, SD2neg:7.1, SD0:8.9, SD2:11.5, SD3:12.9 },
  { m:13, SD3neg:6.5, SD2neg:7.3, SD0:9.2, SD2:11.8, SD3:13.3 },
  { m:14, SD3neg:6.6, SD2neg:7.5, SD0:9.4, SD2:12.1, SD3:13.7 },
  { m:15, SD3neg:6.8, SD2neg:7.7, SD0:9.6, SD2:12.4, SD3:14.0 },
  { m:16, SD3neg:6.9, SD2neg:7.8, SD0:9.8, SD2:12.7, SD3:14.3 },
  { m:17, SD3neg:7.0, SD2neg:8.0, SD0:10.0, SD2:12.9, SD3:14.6 },
  { m:18, SD3neg:7.2, SD2neg:8.1, SD0:10.2, SD2:13.2, SD3:14.9 },
  { m:19, SD3neg:7.3, SD2neg:8.3, SD0:10.4, SD2:13.5, SD3:15.2 },
  { m:20, SD3neg:7.5, SD2neg:8.5, SD0:10.6, SD2:13.7, SD3:15.5 },
  { m:21, SD3neg:7.6, SD2neg:8.6, SD0:10.9, SD2:14.0, SD3:15.8 },
  { m:22, SD3neg:7.7, SD2neg:8.8, SD0:11.1, SD2:14.3, SD3:16.2 },
  { m:23, SD3neg:7.9, SD2neg:9.0, SD0:11.3, SD2:14.6, SD3:16.5 },
  { m:24, SD3neg:8.0, SD2neg:9.1, SD0:11.5, SD2:14.8, SD3:16.8 },
  { m:25, SD3neg:8.1, SD2neg:9.3, SD0:11.7, SD2:15.1, SD3:17.1 },
  { m:26, SD3neg:8.3, SD2neg:9.4, SD0:11.9, SD2:15.4, SD3:17.4 },
  { m:27, SD3neg:8.4, SD2neg:9.6, SD0:12.1, SD2:15.7, SD3:17.8 },
  { m:28, SD3neg:8.5, SD2neg:9.7, SD0:12.3, SD2:15.9, SD3:18.1 },
  { m:29, SD3neg:8.6, SD2neg:9.9, SD0:12.5, SD2:16.2, SD3:18.4 },
  { m:30, SD3neg:8.8, SD2neg:10.0, SD0:12.7, SD2:16.4, SD3:18.7 },
  { m:31, SD3neg:8.9, SD2neg:10.2, SD0:12.9, SD2:16.7, SD3:19.0 },
  { m:32, SD3neg:9.0, SD2neg:10.3, SD0:13.1, SD2:17.0, SD3:19.3 },
  { m:33, SD3neg:9.1, SD2neg:10.4, SD0:13.3, SD2:17.2, SD3:19.6 },
  { m:34, SD3neg:9.2, SD2neg:10.6, SD0:13.5, SD2:17.5, SD3:19.9 },
  { m:35, SD3neg:9.3, SD2neg:10.7, SD0:13.7, SD2:17.7, SD3:20.2 },
  { m:36, SD3neg:9.4, SD2neg:10.8, SD0:13.9, SD2:18.0, SD3:20.5 },
  { m:37, SD3neg:9.5, SD2neg:11.0, SD0:14.0, SD2:18.2, SD3:20.8 },
  { m:38, SD3neg:9.6, SD2neg:11.1, SD0:14.2, SD2:18.5, SD3:21.1 },
  { m:39, SD3neg:9.7, SD2neg:11.2, SD0:14.4, SD2:18.7, SD3:21.4 },
  { m:40, SD3neg:9.8, SD2neg:11.3, SD0:14.6, SD2:19.0, SD3:21.7 },
  { m:41, SD3neg:9.9, SD2neg:11.5, SD0:14.8, SD2:19.2, SD3:22.0 },
  { m:42, SD3neg:10.0, SD2neg:11.6, SD0:15.0, SD2:19.5, SD3:22.3 },
  { m:43, SD3neg:10.1, SD2neg:11.7, SD0:15.2, SD2:19.7, SD3:22.6 },
  { m:44, SD3neg:10.2, SD2neg:11.8, SD0:15.3, SD2:20.0, SD3:22.9 },
  { m:45, SD3neg:10.3, SD2neg:12.0, SD0:15.5, SD2:20.2, SD3:23.2 },
  { m:46, SD3neg:10.4, SD2neg:12.1, SD0:15.7, SD2:20.5, SD3:23.5 },
  { m:47, SD3neg:10.5, SD2neg:12.2, SD0:15.9, SD2:20.7, SD3:23.8 },
  { m:48, SD3neg:10.6, SD2neg:12.3, SD0:16.1, SD2:21.0, SD3:24.2 },
  { m:49, SD3neg:10.7, SD2neg:12.4, SD0:16.3, SD2:21.2, SD3:24.5 },
  { m:50, SD3neg:10.8, SD2neg:12.6, SD0:16.5, SD2:21.5, SD3:24.8 },
  { m:51, SD3neg:10.9, SD2neg:12.7, SD0:16.7, SD2:21.7, SD3:25.1 },
  { m:52, SD3neg:11.0, SD2neg:12.8, SD0:16.9, SD2:22.0, SD3:25.4 },
  { m:53, SD3neg:11.1, SD2neg:12.9, SD0:17.1, SD2:22.3, SD3:25.8 },
  { m:54, SD3neg:11.2, SD2neg:13.0, SD0:17.3, SD2:22.5, SD3:26.1 },
  { m:55, SD3neg:11.3, SD2neg:13.2, SD0:17.5, SD2:22.8, SD3:26.4 },
  { m:56, SD3neg:11.4, SD2neg:13.3, SD0:17.7, SD2:23.0, SD3:26.7 },
  { m:57, SD3neg:11.5, SD2neg:13.4, SD0:17.9, SD2:23.3, SD3:27.1 },
  { m:58, SD3neg:11.6, SD2neg:13.5, SD0:18.1, SD2:23.5, SD3:27.4 },
  { m:59, SD3neg:11.7, SD2neg:13.6, SD0:18.3, SD2:23.8, SD3:27.7 },
  { m:60, SD3neg:11.8, SD2neg:13.7, SD0:18.5, SD2:24.0, SD3:28.0 },
]

const WHO_LHFA_BOYS = [
  { x:0, SD3neg:44.2, SD2neg:46.1, SD0:49.9, SD2:53.7, SD3:55.6 },
  { x:1, SD3neg:48.9, SD2neg:50.8, SD0:54.7, SD2:58.6, SD3:60.6 },
  { x:2, SD3neg:52.4, SD2neg:54.4, SD0:58.4, SD2:62.4, SD3:64.4 },
  { x:3, SD3neg:55.3, SD2neg:57.3, SD0:61.4, SD2:65.5, SD3:67.6 },
  { x:4, SD3neg:57.6, SD2neg:59.7, SD0:63.9, SD2:68.0, SD3:70.1 },
  { x:5, SD3neg:59.6, SD2neg:61.7, SD0:65.9, SD2:70.1, SD3:72.2 },
  { x:6, SD3neg:61.2, SD2neg:63.3, SD0:67.6, SD2:71.9, SD3:74.0 },
  { x:7, SD3neg:62.7, SD2neg:64.8, SD0:69.2, SD2:73.5, SD3:75.7 },
  { x:8, SD3neg:64.0, SD2neg:66.2, SD0:70.6, SD2:75.0, SD3:77.2 },
  { x:9, SD3neg:65.2, SD2neg:67.5, SD0:72.0, SD2:76.5, SD3:78.7 },
  { x:10, SD3neg:66.4, SD2neg:68.7, SD0:73.3, SD2:77.9, SD3:80.1 },
  { x:11, SD3neg:67.6, SD2neg:69.9, SD0:74.5, SD2:79.2, SD3:81.5 },
  { x:12, SD3neg:68.6, SD2neg:71.0, SD0:75.7, SD2:80.5, SD3:82.9 },
  { x:13, SD3neg:69.6, SD2neg:72.1, SD0:76.9, SD2:81.8, SD3:84.2 },
  { x:14, SD3neg:70.6, SD2neg:73.1, SD0:78.0, SD2:83.0, SD3:85.5 },
  { x:15, SD3neg:71.6, SD2neg:74.1, SD0:79.1, SD2:84.2, SD3:86.7 },
  { x:16, SD3neg:72.5, SD2neg:75.0, SD0:80.2, SD2:85.4, SD3:88.0 },
  { x:17, SD3neg:73.3, SD2neg:76.0, SD0:81.2, SD2:86.5, SD3:89.2 },
  { x:18, SD3neg:74.2, SD2neg:76.9, SD0:82.3, SD2:87.7, SD3:90.4 },
  { x:19, SD3neg:75.0, SD2neg:77.7, SD0:83.2, SD2:88.8, SD3:91.5 },
  { x:20, SD3neg:75.8, SD2neg:78.6, SD0:84.2, SD2:89.8, SD3:92.6 },
  { x:21, SD3neg:76.5, SD2neg:79.4, SD0:85.1, SD2:90.9, SD3:93.8 },
  { x:22, SD3neg:77.2, SD2neg:80.2, SD0:86.0, SD2:91.9, SD3:94.9 },
  { x:23, SD3neg:78.0, SD2neg:81.0, SD0:86.9, SD2:92.9, SD3:95.9 },
  { x:24, SD3neg:78.0, SD2neg:81.0, SD0:87.1, SD2:93.2, SD3:96.3 },
  { x:25, SD3neg:78.6, SD2neg:81.7, SD0:88.0, SD2:94.2, SD3:97.3 },
  { x:26, SD3neg:79.3, SD2neg:82.5, SD0:88.8, SD2:95.2, SD3:98.3 },
  { x:27, SD3neg:79.9, SD2neg:83.1, SD0:89.6, SD2:96.1, SD3:99.3 },
  { x:28, SD3neg:80.5, SD2neg:83.8, SD0:90.4, SD2:97.0, SD3:100.3 },
  { x:29, SD3neg:81.1, SD2neg:84.5, SD0:91.2, SD2:97.9, SD3:101.2 },
  { x:30, SD3neg:81.7, SD2neg:85.1, SD0:91.9, SD2:98.7, SD3:102.1 },
  { x:31, SD3neg:82.3, SD2neg:85.7, SD0:92.7, SD2:99.6, SD3:103.0 },
  { x:32, SD3neg:82.8, SD2neg:86.4, SD0:93.4, SD2:100.4, SD3:103.9 },
  { x:33, SD3neg:83.4, SD2neg:86.9, SD0:94.1, SD2:101.2, SD3:104.8 },
  { x:34, SD3neg:83.9, SD2neg:87.5, SD0:94.8, SD2:102.0, SD3:105.6 },
  { x:35, SD3neg:84.4, SD2neg:88.1, SD0:95.4, SD2:102.7, SD3:106.4 },
  { x:36, SD3neg:85.0, SD2neg:88.7, SD0:96.1, SD2:103.5, SD3:107.2 },
  { x:37, SD3neg:85.5, SD2neg:89.2, SD0:96.7, SD2:104.2, SD3:108.0 },
  { x:38, SD3neg:86.0, SD2neg:89.8, SD0:97.4, SD2:105.0, SD3:108.8 },
  { x:39, SD3neg:86.5, SD2neg:90.3, SD0:98.0, SD2:105.7, SD3:109.5 },
  { x:40, SD3neg:87.0, SD2neg:90.9, SD0:98.6, SD2:106.4, SD3:110.3 },
  { x:41, SD3neg:87.5, SD2neg:91.4, SD0:99.2, SD2:107.1, SD3:111.0 },
  { x:42, SD3neg:88.0, SD2neg:91.9, SD0:99.9, SD2:107.8, SD3:111.7 },
  { x:43, SD3neg:88.4, SD2neg:92.4, SD0:100.4, SD2:108.5, SD3:112.5 },
  { x:44, SD3neg:88.9, SD2neg:93.0, SD0:101.0, SD2:109.1, SD3:113.2 },
  { x:45, SD3neg:89.4, SD2neg:93.5, SD0:101.6, SD2:109.8, SD3:113.9 },
  { x:46, SD3neg:89.8, SD2neg:94.0, SD0:102.2, SD2:110.4, SD3:114.6 },
  { x:47, SD3neg:90.3, SD2neg:94.4, SD0:102.8, SD2:111.1, SD3:115.2 },
  { x:48, SD3neg:90.7, SD2neg:94.9, SD0:103.3, SD2:111.7, SD3:115.9 },
  { x:49, SD3neg:91.2, SD2neg:95.4, SD0:103.9, SD2:112.4, SD3:116.6 },
  { x:50, SD3neg:91.6, SD2neg:95.9, SD0:104.4, SD2:113.0, SD3:117.3 },
  { x:51, SD3neg:92.1, SD2neg:96.4, SD0:105.0, SD2:113.6, SD3:117.9 },
  { x:52, SD3neg:92.5, SD2neg:96.9, SD0:105.6, SD2:114.2, SD3:118.6 },
  { x:53, SD3neg:93.0, SD2neg:97.4, SD0:106.1, SD2:114.9, SD3:119.2 },
  { x:54, SD3neg:93.4, SD2neg:97.8, SD0:106.7, SD2:115.5, SD3:119.9 },
  { x:55, SD3neg:93.9, SD2neg:98.3, SD0:107.2, SD2:116.1, SD3:120.6 },
  { x:56, SD3neg:94.3, SD2neg:98.8, SD0:107.8, SD2:116.7, SD3:121.2 },
  { x:57, SD3neg:94.7, SD2neg:99.3, SD0:108.3, SD2:117.4, SD3:121.9 },
  { x:58, SD3neg:95.2, SD2neg:99.7, SD0:108.9, SD2:118.0, SD3:122.6 },
  { x:59, SD3neg:95.6, SD2neg:100.2, SD0:109.4, SD2:118.6, SD3:123.2 },
  { x:60, SD3neg:96.1, SD2neg:100.7, SD0:110.0, SD2:119.2, SD3:123.9 },
]

const WHO_LHFA_GIRLS = [
  { x:0, SD3neg:43.6, SD2neg:45.4, SD0:49.1, SD2:52.9, SD3:54.7 },
  { x:1, SD3neg:47.8, SD2neg:49.8, SD0:53.7, SD2:57.6, SD3:59.5 },
  { x:2, SD3neg:51.0, SD2neg:53.0, SD0:57.1, SD2:61.1, SD3:63.2 },
  { x:3, SD3neg:53.5, SD2neg:55.6, SD0:59.8, SD2:64.0, SD3:66.1 },
  { x:4, SD3neg:55.6, SD2neg:57.8, SD0:62.1, SD2:66.4, SD3:68.6 },
  { x:5, SD3neg:57.4, SD2neg:59.6, SD0:64.0, SD2:68.5, SD3:70.7 },
  { x:6, SD3neg:58.9, SD2neg:61.2, SD0:65.7, SD2:70.3, SD3:72.5 },
  { x:7, SD3neg:60.3, SD2neg:62.7, SD0:67.3, SD2:71.9, SD3:74.2 },
  { x:8, SD3neg:61.7, SD2neg:64.0, SD0:68.7, SD2:73.5, SD3:75.8 },
  { x:9, SD3neg:62.9, SD2neg:65.3, SD0:70.1, SD2:75.0, SD3:77.4 },
  { x:10, SD3neg:64.1, SD2neg:66.5, SD0:71.5, SD2:76.4, SD3:78.9 },
  { x:11, SD3neg:65.2, SD2neg:67.7, SD0:72.8, SD2:77.8, SD3:80.3 },
  { x:12, SD3neg:66.3, SD2neg:68.9, SD0:74.0, SD2:79.2, SD3:81.7 },
  { x:13, SD3neg:67.3, SD2neg:70.0, SD0:75.2, SD2:80.5, SD3:83.1 },
  { x:14, SD3neg:68.3, SD2neg:71.0, SD0:76.4, SD2:81.7, SD3:84.4 },
  { x:15, SD3neg:69.3, SD2neg:72.0, SD0:77.5, SD2:83.0, SD3:85.7 },
  { x:16, SD3neg:70.2, SD2neg:73.0, SD0:78.6, SD2:84.2, SD3:87.0 },
  { x:17, SD3neg:71.1, SD2neg:74.0, SD0:79.7, SD2:85.4, SD3:88.2 },
  { x:18, SD3neg:72.0, SD2neg:74.9, SD0:80.7, SD2:86.5, SD3:89.4 },
  { x:19, SD3neg:72.8, SD2neg:75.8, SD0:81.7, SD2:87.6, SD3:90.6 },
  { x:20, SD3neg:73.7, SD2neg:76.7, SD0:82.7, SD2:88.7, SD3:91.7 },
  { x:21, SD3neg:74.5, SD2neg:77.5, SD0:83.7, SD2:89.8, SD3:92.9 },
  { x:22, SD3neg:75.2, SD2neg:78.4, SD0:84.6, SD2:90.8, SD3:94.0 },
  { x:23, SD3neg:76.0, SD2neg:79.2, SD0:85.5, SD2:91.9, SD3:95.0 },
  { x:24, SD3neg:76.0, SD2neg:79.3, SD0:85.7, SD2:92.2, SD3:95.4 },
  { x:25, SD3neg:76.8, SD2neg:80.0, SD0:86.6, SD2:93.1, SD3:96.4 },
  { x:26, SD3neg:77.5, SD2neg:80.8, SD0:87.4, SD2:94.1, SD3:97.4 },
  { x:27, SD3neg:78.1, SD2neg:81.5, SD0:88.3, SD2:95.0, SD3:98.4 },
  { x:28, SD3neg:78.8, SD2neg:82.2, SD0:89.1, SD2:96.0, SD3:99.4 },
  { x:29, SD3neg:79.5, SD2neg:82.9, SD0:89.9, SD2:96.9, SD3:100.3 },
  { x:30, SD3neg:80.1, SD2neg:83.6, SD0:90.7, SD2:97.7, SD3:101.3 },
  { x:31, SD3neg:80.7, SD2neg:84.3, SD0:91.4, SD2:98.6, SD3:102.2 },
  { x:32, SD3neg:81.3, SD2neg:84.9, SD0:92.2, SD2:99.4, SD3:103.1 },
  { x:33, SD3neg:81.9, SD2neg:85.6, SD0:92.9, SD2:100.3, SD3:103.9 },
  { x:34, SD3neg:82.5, SD2neg:86.2, SD0:93.6, SD2:101.1, SD3:104.8 },
  { x:35, SD3neg:83.1, SD2neg:86.8, SD0:94.4, SD2:101.9, SD3:105.6 },
  { x:36, SD3neg:83.6, SD2neg:87.4, SD0:95.1, SD2:102.7, SD3:106.5 },
  { x:37, SD3neg:84.2, SD2neg:88.0, SD0:95.7, SD2:103.4, SD3:107.3 },
  { x:38, SD3neg:84.7, SD2neg:88.6, SD0:96.4, SD2:104.2, SD3:108.1 },
  { x:39, SD3neg:85.3, SD2neg:89.2, SD0:97.1, SD2:105.0, SD3:108.9 },
  { x:40, SD3neg:85.8, SD2neg:89.8, SD0:97.7, SD2:105.7, SD3:109.7 },
  { x:41, SD3neg:86.3, SD2neg:90.4, SD0:98.4, SD2:106.4, SD3:110.5 },
  { x:42, SD3neg:86.8, SD2neg:90.9, SD0:99.0, SD2:107.2, SD3:111.2 },
  { x:43, SD3neg:87.4, SD2neg:91.5, SD0:99.7, SD2:107.9, SD3:112.0 },
  { x:44, SD3neg:87.9, SD2neg:92.0, SD0:100.3, SD2:108.6, SD3:112.7 },
  { x:45, SD3neg:88.4, SD2neg:92.5, SD0:100.9, SD2:109.3, SD3:113.5 },
  { x:46, SD3neg:88.9, SD2neg:93.1, SD0:101.5, SD2:110.0, SD3:114.2 },
  { x:47, SD3neg:89.3, SD2neg:93.6, SD0:102.1, SD2:110.7, SD3:114.9 },
  { x:48, SD3neg:89.8, SD2neg:94.1, SD0:102.7, SD2:111.3, SD3:115.7 },
  { x:49, SD3neg:90.3, SD2neg:94.6, SD0:103.3, SD2:112.0, SD3:116.4 },
  { x:50, SD3neg:90.7, SD2neg:95.1, SD0:103.9, SD2:112.7, SD3:117.1 },
  { x:51, SD3neg:91.2, SD2neg:95.6, SD0:104.5, SD2:113.3, SD3:117.7 },
  { x:52, SD3neg:91.7, SD2neg:96.1, SD0:105.0, SD2:114.0, SD3:118.4 },
  { x:53, SD3neg:92.1, SD2neg:96.6, SD0:105.6, SD2:114.6, SD3:119.1 },
  { x:54, SD3neg:92.6, SD2neg:97.1, SD0:106.2, SD2:115.2, SD3:119.8 },
  { x:55, SD3neg:93.0, SD2neg:97.6, SD0:106.7, SD2:115.9, SD3:120.4 },
  { x:56, SD3neg:93.4, SD2neg:98.1, SD0:107.3, SD2:116.5, SD3:121.1 },
  { x:57, SD3neg:93.9, SD2neg:98.5, SD0:107.8, SD2:117.1, SD3:121.8 },
  { x:58, SD3neg:94.3, SD2neg:99.0, SD0:108.4, SD2:117.7, SD3:122.4 },
  { x:59, SD3neg:94.7, SD2neg:99.5, SD0:108.9, SD2:118.3, SD3:123.1 },
  { x:60, SD3neg:95.2, SD2neg:99.9, SD0:109.4, SD2:118.9, SD3:123.7 },
]

const WHO_WFL_BOYS = [
  { x:45, SD3neg:1.9, SD2neg:2.0, SD0:2.4, SD2:3.0, SD3:3.3 },
  { x:45.5, SD3neg:1.9, SD2neg:2.1, SD0:2.5, SD2:3.1, SD3:3.4 },
  { x:46, SD3neg:2.0, SD2neg:2.2, SD0:2.6, SD2:3.1, SD3:3.5 },
  { x:46.5, SD3neg:2.1, SD2neg:2.3, SD0:2.7, SD2:3.2, SD3:3.6 },
  { x:47, SD3neg:2.1, SD2neg:2.3, SD0:2.8, SD2:3.3, SD3:3.7 },
  { x:47.5, SD3neg:2.2, SD2neg:2.4, SD0:2.9, SD2:3.4, SD3:3.8 },
  { x:48, SD3neg:2.3, SD2neg:2.5, SD0:2.9, SD2:3.6, SD3:3.9 },
  { x:48.5, SD3neg:2.3, SD2neg:2.6, SD0:3.0, SD2:3.7, SD3:4.0 },
  { x:49, SD3neg:2.4, SD2neg:2.6, SD0:3.1, SD2:3.8, SD3:4.2 },
  { x:49.5, SD3neg:2.5, SD2neg:2.7, SD0:3.2, SD2:3.9, SD3:4.3 },
  { x:50, SD3neg:2.6, SD2neg:2.8, SD0:3.3, SD2:4.0, SD3:4.4 },
  { x:50.5, SD3neg:2.7, SD2neg:2.9, SD0:3.4, SD2:4.1, SD3:4.5 },
  { x:51, SD3neg:2.7, SD2neg:3.0, SD0:3.5, SD2:4.2, SD3:4.7 },
  { x:51.5, SD3neg:2.8, SD2neg:3.1, SD0:3.6, SD2:4.4, SD3:4.8 },
  { x:52, SD3neg:2.9, SD2neg:3.2, SD0:3.8, SD2:4.5, SD3:5.0 },
  { x:52.5, SD3neg:3.0, SD2neg:3.3, SD0:3.9, SD2:4.6, SD3:5.1 },
  { x:53, SD3neg:3.1, SD2neg:3.4, SD0:4.0, SD2:4.8, SD3:5.3 },
  { x:53.5, SD3neg:3.2, SD2neg:3.5, SD0:4.1, SD2:4.9, SD3:5.4 },
  { x:54, SD3neg:3.3, SD2neg:3.6, SD0:4.3, SD2:5.1, SD3:5.6 },
  { x:54.5, SD3neg:3.4, SD2neg:3.7, SD0:4.4, SD2:5.3, SD3:5.8 },
  { x:55, SD3neg:3.6, SD2neg:3.8, SD0:4.5, SD2:5.4, SD3:6.0 },
  { x:55.5, SD3neg:3.7, SD2neg:4.0, SD0:4.7, SD2:5.6, SD3:6.1 },
  { x:56, SD3neg:3.8, SD2neg:4.1, SD0:4.8, SD2:5.8, SD3:6.3 },
  { x:56.5, SD3neg:3.9, SD2neg:4.2, SD0:5.0, SD2:5.9, SD3:6.5 },
  { x:57, SD3neg:4.0, SD2neg:4.3, SD0:5.1, SD2:6.1, SD3:6.7 },
  { x:57.5, SD3neg:4.1, SD2neg:4.5, SD0:5.3, SD2:6.3, SD3:6.9 },
  { x:58, SD3neg:4.3, SD2neg:4.6, SD0:5.4, SD2:6.4, SD3:7.1 },
  { x:58.5, SD3neg:4.4, SD2neg:4.7, SD0:5.6, SD2:6.6, SD3:7.2 },
  { x:59, SD3neg:4.5, SD2neg:4.8, SD0:5.7, SD2:6.8, SD3:7.4 },
  { x:59.5, SD3neg:4.6, SD2neg:5.0, SD0:5.9, SD2:7.0, SD3:7.6 },
  { x:60, SD3neg:4.7, SD2neg:5.1, SD0:6.0, SD2:7.1, SD3:7.8 },
  { x:60.5, SD3neg:4.8, SD2neg:5.2, SD0:6.1, SD2:7.3, SD3:8.0 },
  { x:61, SD3neg:4.9, SD2neg:5.3, SD0:6.3, SD2:7.4, SD3:8.1 },
  { x:61.5, SD3neg:5.0, SD2neg:5.4, SD0:6.4, SD2:7.6, SD3:8.3 },
  { x:62, SD3neg:5.1, SD2neg:5.6, SD0:6.5, SD2:7.7, SD3:8.5 },
  { x:62.5, SD3neg:5.2, SD2neg:5.7, SD0:6.7, SD2:7.9, SD3:8.6 },
  { x:63, SD3neg:5.3, SD2neg:5.8, SD0:6.8, SD2:8.0, SD3:8.8 },
  { x:63.5, SD3neg:5.4, SD2neg:5.9, SD0:6.9, SD2:8.2, SD3:8.9 },
  { x:64, SD3neg:5.5, SD2neg:6.0, SD0:7.0, SD2:8.3, SD3:9.1 },
  { x:64.5, SD3neg:5.6, SD2neg:6.1, SD0:7.1, SD2:8.5, SD3:9.3 },
  { x:65, SD3neg:5.7, SD2neg:6.2, SD0:7.3, SD2:8.6, SD3:9.4 },
  { x:65.5, SD3neg:5.8, SD2neg:6.3, SD0:7.4, SD2:8.7, SD3:9.6 },
  { x:66, SD3neg:5.9, SD2neg:6.4, SD0:7.5, SD2:8.9, SD3:9.7 },
  { x:66.5, SD3neg:6.0, SD2neg:6.5, SD0:7.6, SD2:9.0, SD3:9.9 },
  { x:67, SD3neg:6.1, SD2neg:6.6, SD0:7.7, SD2:9.2, SD3:10.0 },
  { x:67.5, SD3neg:6.2, SD2neg:6.7, SD0:7.9, SD2:9.3, SD3:10.2 },
  { x:68, SD3neg:6.3, SD2neg:6.8, SD0:8.0, SD2:9.4, SD3:10.3 },
  { x:68.5, SD3neg:6.4, SD2neg:6.9, SD0:8.1, SD2:9.6, SD3:10.5 },
  { x:69, SD3neg:6.5, SD2neg:7.0, SD0:8.2, SD2:9.7, SD3:10.6 },
  { x:69.5, SD3neg:6.6, SD2neg:7.1, SD0:8.3, SD2:9.8, SD3:10.8 },
  { x:70, SD3neg:6.6, SD2neg:7.2, SD0:8.4, SD2:10.0, SD3:10.9 },
  { x:70.5, SD3neg:6.7, SD2neg:7.3, SD0:8.5, SD2:10.1, SD3:11.1 },
  { x:71, SD3neg:6.8, SD2neg:7.4, SD0:8.6, SD2:10.2, SD3:11.2 },
  { x:71.5, SD3neg:6.9, SD2neg:7.5, SD0:8.8, SD2:10.4, SD3:11.3 },
  { x:72, SD3neg:7.0, SD2neg:7.6, SD0:8.9, SD2:10.5, SD3:11.5 },
  { x:72.5, SD3neg:7.1, SD2neg:7.6, SD0:9.0, SD2:10.6, SD3:11.6 },
  { x:73, SD3neg:7.2, SD2neg:7.7, SD0:9.1, SD2:10.8, SD3:11.8 },
  { x:73.5, SD3neg:7.2, SD2neg:7.8, SD0:9.2, SD2:10.9, SD3:11.9 },
  { x:74, SD3neg:7.3, SD2neg:7.9, SD0:9.3, SD2:11.0, SD3:12.1 },
  { x:74.5, SD3neg:7.4, SD2neg:8.0, SD0:9.4, SD2:11.2, SD3:12.2 },
  { x:75, SD3neg:7.5, SD2neg:8.1, SD0:9.5, SD2:11.3, SD3:12.3 },
  { x:75.5, SD3neg:7.6, SD2neg:8.2, SD0:9.6, SD2:11.4, SD3:12.5 },
  { x:76, SD3neg:7.6, SD2neg:8.3, SD0:9.7, SD2:11.5, SD3:12.6 },
  { x:76.5, SD3neg:7.7, SD2neg:8.3, SD0:9.8, SD2:11.6, SD3:12.7 },
  { x:77, SD3neg:7.8, SD2neg:8.4, SD0:9.9, SD2:11.7, SD3:12.8 },
  { x:77.5, SD3neg:7.9, SD2neg:8.5, SD0:10.0, SD2:11.9, SD3:13.0 },
  { x:78, SD3neg:7.9, SD2neg:8.6, SD0:10.1, SD2:12.0, SD3:13.1 },
  { x:78.5, SD3neg:8.0, SD2neg:8.7, SD0:10.2, SD2:12.1, SD3:13.2 },
  { x:79, SD3neg:8.1, SD2neg:8.7, SD0:10.3, SD2:12.2, SD3:13.3 },
  { x:79.5, SD3neg:8.2, SD2neg:8.8, SD0:10.4, SD2:12.3, SD3:13.4 },
  { x:80, SD3neg:8.2, SD2neg:8.9, SD0:10.4, SD2:12.4, SD3:13.6 },
  { x:80.5, SD3neg:8.3, SD2neg:9.0, SD0:10.5, SD2:12.5, SD3:13.7 },
  { x:81, SD3neg:8.4, SD2neg:9.1, SD0:10.6, SD2:12.6, SD3:13.8 },
  { x:81.5, SD3neg:8.5, SD2neg:9.1, SD0:10.7, SD2:12.7, SD3:13.9 },
  { x:82, SD3neg:8.5, SD2neg:9.2, SD0:10.8, SD2:12.8, SD3:14.0 },
  { x:82.5, SD3neg:8.6, SD2neg:9.3, SD0:10.9, SD2:13.0, SD3:14.2 },
  { x:83, SD3neg:8.7, SD2neg:9.4, SD0:11.0, SD2:13.1, SD3:14.3 },
  { x:83.5, SD3neg:8.8, SD2neg:9.5, SD0:11.2, SD2:13.2, SD3:14.4 },
  { x:84, SD3neg:8.9, SD2neg:9.6, SD0:11.3, SD2:13.3, SD3:14.6 },
  { x:84.5, SD3neg:9.0, SD2neg:9.7, SD0:11.4, SD2:13.5, SD3:14.7 },
  { x:85, SD3neg:9.1, SD2neg:9.8, SD0:11.5, SD2:13.6, SD3:14.9 },
  { x:85.5, SD3neg:9.2, SD2neg:9.9, SD0:11.6, SD2:13.7, SD3:15.0 },
  { x:86, SD3neg:9.3, SD2neg:10.0, SD0:11.7, SD2:13.9, SD3:15.2 },
  { x:86.5, SD3neg:9.4, SD2neg:10.1, SD0:11.9, SD2:14.0, SD3:15.3 },
  { x:87, SD3neg:9.5, SD2neg:10.2, SD0:12.0, SD2:14.2, SD3:15.5 },
  { x:87.5, SD3neg:9.6, SD2neg:10.4, SD0:12.1, SD2:14.3, SD3:15.6 },
  { x:88, SD3neg:9.7, SD2neg:10.5, SD0:12.2, SD2:14.5, SD3:15.8 },
  { x:88.5, SD3neg:9.8, SD2neg:10.6, SD0:12.4, SD2:14.6, SD3:15.9 },
  { x:89, SD3neg:9.9, SD2neg:10.7, SD0:12.5, SD2:14.7, SD3:16.1 },
  { x:89.5, SD3neg:10.0, SD2neg:10.8, SD0:12.6, SD2:14.9, SD3:16.2 },
  { x:90, SD3neg:10.1, SD2neg:10.9, SD0:12.7, SD2:15.0, SD3:16.4 },
  { x:90.5, SD3neg:10.2, SD2neg:11.0, SD0:12.8, SD2:15.1, SD3:16.5 },
  { x:91, SD3neg:10.3, SD2neg:11.1, SD0:13.0, SD2:15.3, SD3:16.7 },
  { x:91.5, SD3neg:10.4, SD2neg:11.2, SD0:13.1, SD2:15.4, SD3:16.8 },
  { x:92, SD3neg:10.5, SD2neg:11.3, SD0:13.2, SD2:15.6, SD3:17.0 },
  { x:92.5, SD3neg:10.6, SD2neg:11.4, SD0:13.3, SD2:15.7, SD3:17.1 },
  { x:93, SD3neg:10.7, SD2neg:11.5, SD0:13.4, SD2:15.8, SD3:17.3 },
  { x:93.5, SD3neg:10.7, SD2neg:11.6, SD0:13.5, SD2:16.0, SD3:17.4 },
  { x:94, SD3neg:10.8, SD2neg:11.7, SD0:13.7, SD2:16.1, SD3:17.6 },
  { x:94.5, SD3neg:10.9, SD2neg:11.8, SD0:13.8, SD2:16.3, SD3:17.7 },
  { x:95, SD3neg:11.0, SD2neg:11.9, SD0:13.9, SD2:16.4, SD3:17.9 },
  { x:95.5, SD3neg:11.1, SD2neg:12.0, SD0:14.0, SD2:16.5, SD3:18.0 },
  { x:96, SD3neg:11.2, SD2neg:12.1, SD0:14.1, SD2:16.7, SD3:18.2 },
  { x:96.5, SD3neg:11.3, SD2neg:12.2, SD0:14.3, SD2:16.8, SD3:18.4 },
  { x:97, SD3neg:11.4, SD2neg:12.3, SD0:14.4, SD2:17.0, SD3:18.5 },
  { x:97.5, SD3neg:11.5, SD2neg:12.4, SD0:14.5, SD2:17.1, SD3:18.7 },
  { x:98, SD3neg:11.6, SD2neg:12.5, SD0:14.6, SD2:17.3, SD3:18.9 },
  { x:98.5, SD3neg:11.7, SD2neg:12.6, SD0:14.8, SD2:17.5, SD3:19.1 },
  { x:99, SD3neg:11.8, SD2neg:12.7, SD0:14.9, SD2:17.6, SD3:19.2 },
  { x:99.5, SD3neg:11.9, SD2neg:12.8, SD0:15.0, SD2:17.8, SD3:19.4 },
  { x:100, SD3neg:12.0, SD2neg:12.9, SD0:15.2, SD2:18.0, SD3:19.6 },
  { x:100.5, SD3neg:12.1, SD2neg:13.0, SD0:15.3, SD2:18.1, SD3:19.8 },
  { x:101, SD3neg:12.2, SD2neg:13.2, SD0:15.4, SD2:18.3, SD3:20.0 },
  { x:101.5, SD3neg:12.3, SD2neg:13.3, SD0:15.6, SD2:18.5, SD3:20.2 },
  { x:102, SD3neg:12.4, SD2neg:13.4, SD0:15.7, SD2:18.7, SD3:20.4 },
  { x:102.5, SD3neg:12.5, SD2neg:13.5, SD0:15.9, SD2:18.8, SD3:20.6 },
  { x:103, SD3neg:12.6, SD2neg:13.6, SD0:16.0, SD2:19.0, SD3:20.8 },
  { x:103.5, SD3neg:12.7, SD2neg:13.7, SD0:16.2, SD2:19.2, SD3:21.0 },
  { x:104, SD3neg:12.8, SD2neg:13.9, SD0:16.3, SD2:19.4, SD3:21.2 },
  { x:104.5, SD3neg:12.9, SD2neg:14.0, SD0:16.5, SD2:19.6, SD3:21.5 },
  { x:105, SD3neg:13.0, SD2neg:14.1, SD0:16.6, SD2:19.8, SD3:21.7 },
  { x:105.5, SD3neg:13.2, SD2neg:14.2, SD0:16.8, SD2:20.0, SD3:21.9 },
  { x:106, SD3neg:13.3, SD2neg:14.4, SD0:16.9, SD2:20.2, SD3:22.1 },
  { x:106.5, SD3neg:13.4, SD2neg:14.5, SD0:17.1, SD2:20.4, SD3:22.4 },
  { x:107, SD3neg:13.5, SD2neg:14.6, SD0:17.3, SD2:20.6, SD3:22.6 },
  { x:107.5, SD3neg:13.6, SD2neg:14.7, SD0:17.4, SD2:20.8, SD3:22.8 },
  { x:108, SD3neg:13.7, SD2neg:14.9, SD0:17.6, SD2:21.0, SD3:23.1 },
  { x:108.5, SD3neg:13.8, SD2neg:15.0, SD0:17.8, SD2:21.2, SD3:23.3 },
  { x:109, SD3neg:14.0, SD2neg:15.1, SD0:17.9, SD2:21.4, SD3:23.6 },
  { x:109.5, SD3neg:14.1, SD2neg:15.3, SD0:18.1, SD2:21.7, SD3:23.8 },
  { x:110, SD3neg:14.2, SD2neg:15.4, SD0:18.3, SD2:21.9, SD3:24.1 },
]

const WHO_WFL_GIRLS = [
  { x:45, SD3neg:1.9, SD2neg:2.1, SD0:2.5, SD2:3.0, SD3:3.3 },
  { x:45.5, SD3neg:2.0, SD2neg:2.1, SD0:2.5, SD2:3.1, SD3:3.4 },
  { x:46, SD3neg:2.0, SD2neg:2.2, SD0:2.6, SD2:3.2, SD3:3.5 },
  { x:46.5, SD3neg:2.1, SD2neg:2.3, SD0:2.7, SD2:3.3, SD3:3.6 },
  { x:47, SD3neg:2.2, SD2neg:2.4, SD0:2.8, SD2:3.4, SD3:3.7 },
  { x:47.5, SD3neg:2.2, SD2neg:2.4, SD0:2.9, SD2:3.5, SD3:3.8 },
  { x:48, SD3neg:2.3, SD2neg:2.5, SD0:3.0, SD2:3.6, SD3:4.0 },
  { x:48.5, SD3neg:2.4, SD2neg:2.6, SD0:3.1, SD2:3.7, SD3:4.1 },
  { x:49, SD3neg:2.4, SD2neg:2.6, SD0:3.2, SD2:3.8, SD3:4.2 },
  { x:49.5, SD3neg:2.5, SD2neg:2.7, SD0:3.3, SD2:3.9, SD3:4.3 },
  { x:50, SD3neg:2.6, SD2neg:2.8, SD0:3.4, SD2:4.0, SD3:4.5 },
  { x:50.5, SD3neg:2.7, SD2neg:2.9, SD0:3.5, SD2:4.2, SD3:4.6 },
  { x:51, SD3neg:2.8, SD2neg:3.0, SD0:3.6, SD2:4.3, SD3:4.8 },
  { x:51.5, SD3neg:2.8, SD2neg:3.1, SD0:3.7, SD2:4.4, SD3:4.9 },
  { x:52, SD3neg:2.9, SD2neg:3.2, SD0:3.8, SD2:4.6, SD3:5.1 },
  { x:52.5, SD3neg:3.0, SD2neg:3.3, SD0:3.9, SD2:4.7, SD3:5.2 },
  { x:53, SD3neg:3.1, SD2neg:3.4, SD0:4.0, SD2:4.9, SD3:5.4 },
  { x:53.5, SD3neg:3.2, SD2neg:3.5, SD0:4.2, SD2:5.0, SD3:5.5 },
  { x:54, SD3neg:3.3, SD2neg:3.6, SD0:4.3, SD2:5.2, SD3:5.7 },
  { x:54.5, SD3neg:3.4, SD2neg:3.7, SD0:4.4, SD2:5.3, SD3:5.9 },
  { x:55, SD3neg:3.5, SD2neg:3.8, SD0:4.5, SD2:5.5, SD3:6.1 },
  { x:55.5, SD3neg:3.6, SD2neg:3.9, SD0:4.7, SD2:5.7, SD3:6.3 },
  { x:56, SD3neg:3.7, SD2neg:4.0, SD0:4.8, SD2:5.8, SD3:6.4 },
  { x:56.5, SD3neg:3.8, SD2neg:4.1, SD0:5.0, SD2:6.0, SD3:6.6 },
  { x:57, SD3neg:3.9, SD2neg:4.3, SD0:5.1, SD2:6.1, SD3:6.8 },
  { x:57.5, SD3neg:4.0, SD2neg:4.4, SD0:5.2, SD2:6.3, SD3:7.0 },
  { x:58, SD3neg:4.1, SD2neg:4.5, SD0:5.4, SD2:6.5, SD3:7.1 },
  { x:58.5, SD3neg:4.2, SD2neg:4.6, SD0:5.5, SD2:6.6, SD3:7.3 },
  { x:59, SD3neg:4.3, SD2neg:4.7, SD0:5.6, SD2:6.8, SD3:7.5 },
  { x:59.5, SD3neg:4.4, SD2neg:4.8, SD0:5.7, SD2:6.9, SD3:7.7 },
  { x:60, SD3neg:4.5, SD2neg:4.9, SD0:5.9, SD2:7.1, SD3:7.8 },
  { x:60.5, SD3neg:4.6, SD2neg:5.0, SD0:6.0, SD2:7.3, SD3:8.0 },
  { x:61, SD3neg:4.7, SD2neg:5.1, SD0:6.1, SD2:7.4, SD3:8.2 },
  { x:61.5, SD3neg:4.8, SD2neg:5.2, SD0:6.3, SD2:7.6, SD3:8.4 },
  { x:62, SD3neg:4.9, SD2neg:5.3, SD0:6.4, SD2:7.7, SD3:8.5 },
  { x:62.5, SD3neg:5.0, SD2neg:5.4, SD0:6.5, SD2:7.8, SD3:8.7 },
  { x:63, SD3neg:5.1, SD2neg:5.5, SD0:6.6, SD2:8.0, SD3:8.8 },
  { x:63.5, SD3neg:5.2, SD2neg:5.6, SD0:6.7, SD2:8.1, SD3:9.0 },
  { x:64, SD3neg:5.3, SD2neg:5.7, SD0:6.9, SD2:8.3, SD3:9.1 },
  { x:64.5, SD3neg:5.4, SD2neg:5.8, SD0:7.0, SD2:8.4, SD3:9.3 },
  { x:65, SD3neg:5.5, SD2neg:5.9, SD0:7.1, SD2:8.6, SD3:9.5 },
  { x:65.5, SD3neg:5.5, SD2neg:6.0, SD0:7.2, SD2:8.7, SD3:9.6 },
  { x:66, SD3neg:5.6, SD2neg:6.1, SD0:7.3, SD2:8.8, SD3:9.8 },
  { x:66.5, SD3neg:5.7, SD2neg:6.2, SD0:7.4, SD2:9.0, SD3:9.9 },
  { x:67, SD3neg:5.8, SD2neg:6.3, SD0:7.5, SD2:9.1, SD3:10.0 },
  { x:67.5, SD3neg:5.9, SD2neg:6.4, SD0:7.6, SD2:9.2, SD3:10.2 },
  { x:68, SD3neg:6.0, SD2neg:6.5, SD0:7.7, SD2:9.4, SD3:10.3 },
  { x:68.5, SD3neg:6.1, SD2neg:6.6, SD0:7.9, SD2:9.5, SD3:10.5 },
  { x:69, SD3neg:6.1, SD2neg:6.7, SD0:8.0, SD2:9.6, SD3:10.6 },
  { x:69.5, SD3neg:6.2, SD2neg:6.8, SD0:8.1, SD2:9.7, SD3:10.7 },
  { x:70, SD3neg:6.3, SD2neg:6.9, SD0:8.2, SD2:9.9, SD3:10.9 },
  { x:70.5, SD3neg:6.4, SD2neg:6.9, SD0:8.3, SD2:10.0, SD3:11.0 },
  { x:71, SD3neg:6.5, SD2neg:7.0, SD0:8.4, SD2:10.1, SD3:11.1 },
  { x:71.5, SD3neg:6.5, SD2neg:7.1, SD0:8.5, SD2:10.2, SD3:11.3 },
  { x:72, SD3neg:6.6, SD2neg:7.2, SD0:8.6, SD2:10.3, SD3:11.4 },
  { x:72.5, SD3neg:6.7, SD2neg:7.3, SD0:8.7, SD2:10.5, SD3:11.5 },
  { x:73, SD3neg:6.8, SD2neg:7.4, SD0:8.8, SD2:10.6, SD3:11.7 },
  { x:73.5, SD3neg:6.9, SD2neg:7.4, SD0:8.9, SD2:10.7, SD3:11.8 },
  { x:74, SD3neg:6.9, SD2neg:7.5, SD0:9.0, SD2:10.8, SD3:11.9 },
  { x:74.5, SD3neg:7.0, SD2neg:7.6, SD0:9.1, SD2:10.9, SD3:12.0 },
  { x:75, SD3neg:7.1, SD2neg:7.7, SD0:9.1, SD2:11.0, SD3:12.2 },
  { x:75.5, SD3neg:7.1, SD2neg:7.8, SD0:9.2, SD2:11.1, SD3:12.3 },
  { x:76, SD3neg:7.2, SD2neg:7.8, SD0:9.3, SD2:11.2, SD3:12.4 },
  { x:76.5, SD3neg:7.3, SD2neg:7.9, SD0:9.4, SD2:11.4, SD3:12.5 },
  { x:77, SD3neg:7.4, SD2neg:8.0, SD0:9.5, SD2:11.5, SD3:12.6 },
  { x:77.5, SD3neg:7.4, SD2neg:8.1, SD0:9.6, SD2:11.6, SD3:12.8 },
  { x:78, SD3neg:7.5, SD2neg:8.2, SD0:9.7, SD2:11.7, SD3:12.9 },
  { x:78.5, SD3neg:7.6, SD2neg:8.2, SD0:9.8, SD2:11.8, SD3:13.0 },
  { x:79, SD3neg:7.7, SD2neg:8.3, SD0:9.9, SD2:11.9, SD3:13.1 },
  { x:79.5, SD3neg:7.7, SD2neg:8.4, SD0:10.0, SD2:12.0, SD3:13.3 },
  { x:80, SD3neg:7.8, SD2neg:8.5, SD0:10.1, SD2:12.1, SD3:13.4 },
  { x:80.5, SD3neg:7.9, SD2neg:8.6, SD0:10.2, SD2:12.3, SD3:13.5 },
  { x:81, SD3neg:8.0, SD2neg:8.7, SD0:10.3, SD2:12.4, SD3:13.7 },
  { x:81.5, SD3neg:8.1, SD2neg:8.8, SD0:10.4, SD2:12.5, SD3:13.8 },
  { x:82, SD3neg:8.1, SD2neg:8.8, SD0:10.5, SD2:12.6, SD3:13.9 },
  { x:82.5, SD3neg:8.2, SD2neg:8.9, SD0:10.6, SD2:12.8, SD3:14.1 },
  { x:83, SD3neg:8.3, SD2neg:9.0, SD0:10.7, SD2:12.9, SD3:14.2 },
  { x:83.5, SD3neg:8.4, SD2neg:9.1, SD0:10.9, SD2:13.1, SD3:14.4 },
  { x:84, SD3neg:8.5, SD2neg:9.2, SD0:11.0, SD2:13.2, SD3:14.5 },
  { x:84.5, SD3neg:8.6, SD2neg:9.3, SD0:11.1, SD2:13.3, SD3:14.7 },
  { x:85, SD3neg:8.7, SD2neg:9.4, SD0:11.2, SD2:13.5, SD3:14.9 },
  { x:85.5, SD3neg:8.8, SD2neg:9.5, SD0:11.3, SD2:13.6, SD3:15.0 },
  { x:86, SD3neg:8.9, SD2neg:9.7, SD0:11.5, SD2:13.8, SD3:15.2 },
  { x:86.5, SD3neg:9.0, SD2neg:9.8, SD0:11.6, SD2:13.9, SD3:15.4 },
  { x:87, SD3neg:9.1, SD2neg:9.9, SD0:11.7, SD2:14.1, SD3:15.5 },
  { x:87.5, SD3neg:9.2, SD2neg:10.0, SD0:11.8, SD2:14.2, SD3:15.7 },
  { x:88, SD3neg:9.3, SD2neg:10.1, SD0:12.0, SD2:14.4, SD3:15.9 },
  { x:88.5, SD3neg:9.4, SD2neg:10.2, SD0:12.1, SD2:14.5, SD3:16.0 },
  { x:89, SD3neg:9.5, SD2neg:10.3, SD0:12.2, SD2:14.7, SD3:16.2 },
  { x:89.5, SD3neg:9.6, SD2neg:10.4, SD0:12.3, SD2:14.8, SD3:16.4 },
  { x:90, SD3neg:9.7, SD2neg:10.5, SD0:12.5, SD2:15.0, SD3:16.5 },
  { x:90.5, SD3neg:9.8, SD2neg:10.6, SD0:12.6, SD2:15.1, SD3:16.7 },
  { x:91, SD3neg:9.9, SD2neg:10.7, SD0:12.7, SD2:15.3, SD3:16.9 },
  { x:91.5, SD3neg:10.0, SD2neg:10.8, SD0:12.8, SD2:15.5, SD3:17.0 },
  { x:92, SD3neg:10.1, SD2neg:10.9, SD0:13.0, SD2:15.6, SD3:17.2 },
  { x:92.5, SD3neg:10.1, SD2neg:11.0, SD0:13.1, SD2:15.8, SD3:17.4 },
  { x:93, SD3neg:10.2, SD2neg:11.1, SD0:13.2, SD2:15.9, SD3:17.5 },
  { x:93.5, SD3neg:10.3, SD2neg:11.2, SD0:13.3, SD2:16.1, SD3:17.7 },
  { x:94, SD3neg:10.4, SD2neg:11.3, SD0:13.5, SD2:16.2, SD3:17.9 },
  { x:94.5, SD3neg:10.5, SD2neg:11.4, SD0:13.6, SD2:16.4, SD3:18.0 },
  { x:95, SD3neg:10.6, SD2neg:11.5, SD0:13.7, SD2:16.5, SD3:18.2 },
  { x:95.5, SD3neg:10.7, SD2neg:11.6, SD0:13.8, SD2:16.7, SD3:18.4 },
  { x:96, SD3neg:10.8, SD2neg:11.7, SD0:14.0, SD2:16.8, SD3:18.6 },
  { x:96.5, SD3neg:10.9, SD2neg:11.8, SD0:14.1, SD2:17.0, SD3:18.7 },
  { x:97, SD3neg:11.0, SD2neg:12.0, SD0:14.2, SD2:17.1, SD3:18.9 },
  { x:97.5, SD3neg:11.1, SD2neg:12.1, SD0:14.4, SD2:17.3, SD3:19.1 },
  { x:98, SD3neg:11.2, SD2neg:12.2, SD0:14.5, SD2:17.5, SD3:19.3 },
  { x:98.5, SD3neg:11.3, SD2neg:12.3, SD0:14.6, SD2:17.6, SD3:19.5 },
  { x:99, SD3neg:11.4, SD2neg:12.4, SD0:14.8, SD2:17.8, SD3:19.6 },
  { x:99.5, SD3neg:11.5, SD2neg:12.5, SD0:14.9, SD2:18.0, SD3:19.8 },
  { x:100, SD3neg:11.6, SD2neg:12.6, SD0:15.0, SD2:18.1, SD3:20.0 },
  { x:100.5, SD3neg:11.7, SD2neg:12.7, SD0:15.2, SD2:18.3, SD3:20.2 },
  { x:101, SD3neg:11.8, SD2neg:12.8, SD0:15.3, SD2:18.5, SD3:20.4 },
  { x:101.5, SD3neg:11.9, SD2neg:13.0, SD0:15.5, SD2:18.7, SD3:20.6 },
  { x:102, SD3neg:12.0, SD2neg:13.1, SD0:15.6, SD2:18.9, SD3:20.8 },
  { x:102.5, SD3neg:12.1, SD2neg:13.2, SD0:15.8, SD2:19.0, SD3:21.0 },
  { x:103, SD3neg:12.3, SD2neg:13.3, SD0:15.9, SD2:19.2, SD3:21.3 },
  { x:103.5, SD3neg:12.4, SD2neg:13.5, SD0:16.1, SD2:19.4, SD3:21.5 },
  { x:104, SD3neg:12.5, SD2neg:13.6, SD0:16.2, SD2:19.6, SD3:21.7 },
  { x:104.5, SD3neg:12.6, SD2neg:13.7, SD0:16.4, SD2:19.8, SD3:21.9 },
  { x:105, SD3neg:12.7, SD2neg:13.8, SD0:16.5, SD2:20.0, SD3:22.2 },
  { x:105.5, SD3neg:12.8, SD2neg:14.0, SD0:16.7, SD2:20.2, SD3:22.4 },
  { x:106, SD3neg:13.0, SD2neg:14.1, SD0:16.9, SD2:20.5, SD3:22.6 },
  { x:106.5, SD3neg:13.1, SD2neg:14.3, SD0:17.1, SD2:20.7, SD3:22.9 },
  { x:107, SD3neg:13.2, SD2neg:14.4, SD0:17.2, SD2:20.9, SD3:23.1 },
  { x:107.5, SD3neg:13.3, SD2neg:14.5, SD0:17.4, SD2:21.1, SD3:23.4 },
  { x:108, SD3neg:13.5, SD2neg:14.7, SD0:17.6, SD2:21.3, SD3:23.6 },
  { x:108.5, SD3neg:13.6, SD2neg:14.8, SD0:17.8, SD2:21.6, SD3:23.9 },
  { x:109, SD3neg:13.7, SD2neg:15.0, SD0:18.0, SD2:21.8, SD3:24.2 },
  { x:109.5, SD3neg:13.9, SD2neg:15.1, SD0:18.1, SD2:22.0, SD3:24.4 },
  { x:110, SD3neg:14.0, SD2neg:15.3, SD0:18.3, SD2:22.3, SD3:24.7 },
]

const WHO_WFH_BOYS = [
  { x:65, SD3neg:5.9, SD2neg:6.3, SD0:7.4, SD2:8.8, SD3:9.6 },
  { x:65.5, SD3neg:6.0, SD2neg:6.4, SD0:7.6, SD2:8.9, SD3:9.8 },
  { x:66, SD3neg:6.1, SD2neg:6.5, SD0:7.7, SD2:9.1, SD3:9.9 },
  { x:66.5, SD3neg:6.1, SD2neg:6.6, SD0:7.8, SD2:9.2, SD3:10.1 },
  { x:67, SD3neg:6.2, SD2neg:6.7, SD0:7.9, SD2:9.4, SD3:10.2 },
  { x:67.5, SD3neg:6.3, SD2neg:6.8, SD0:8.0, SD2:9.5, SD3:10.4 },
  { x:68, SD3neg:6.4, SD2neg:6.9, SD0:8.1, SD2:9.6, SD3:10.5 },
  { x:68.5, SD3neg:6.5, SD2neg:7.0, SD0:8.2, SD2:9.8, SD3:10.7 },
  { x:69, SD3neg:6.6, SD2neg:7.1, SD0:8.4, SD2:9.9, SD3:10.8 },
  { x:69.5, SD3neg:6.7, SD2neg:7.2, SD0:8.5, SD2:10.0, SD3:11.0 },
  { x:70, SD3neg:6.8, SD2neg:7.3, SD0:8.6, SD2:10.2, SD3:11.1 },
  { x:70.5, SD3neg:6.9, SD2neg:7.4, SD0:8.7, SD2:10.3, SD3:11.3 },
  { x:71, SD3neg:6.9, SD2neg:7.5, SD0:8.8, SD2:10.4, SD3:11.4 },
  { x:71.5, SD3neg:7.0, SD2neg:7.6, SD0:8.9, SD2:10.6, SD3:11.6 },
  { x:72, SD3neg:7.1, SD2neg:7.7, SD0:9.0, SD2:10.7, SD3:11.7 },
  { x:72.5, SD3neg:7.2, SD2neg:7.8, SD0:9.1, SD2:10.8, SD3:11.8 },
  { x:73, SD3neg:7.3, SD2neg:7.9, SD0:9.2, SD2:11.0, SD3:12.0 },
  { x:73.5, SD3neg:7.4, SD2neg:7.9, SD0:9.3, SD2:11.1, SD3:12.1 },
  { x:74, SD3neg:7.4, SD2neg:8.0, SD0:9.4, SD2:11.2, SD3:12.2 },
  { x:74.5, SD3neg:7.5, SD2neg:8.1, SD0:9.5, SD2:11.3, SD3:12.4 },
  { x:75, SD3neg:7.6, SD2neg:8.2, SD0:9.6, SD2:11.4, SD3:12.5 },
  { x:75.5, SD3neg:7.7, SD2neg:8.3, SD0:9.7, SD2:11.6, SD3:12.6 },
  { x:76, SD3neg:7.7, SD2neg:8.4, SD0:9.8, SD2:11.7, SD3:12.8 },
  { x:76.5, SD3neg:7.8, SD2neg:8.5, SD0:9.9, SD2:11.8, SD3:12.9 },
  { x:77, SD3neg:7.9, SD2neg:8.5, SD0:10.0, SD2:11.9, SD3:13.0 },
  { x:77.5, SD3neg:8.0, SD2neg:8.6, SD0:10.1, SD2:12.0, SD3:13.1 },
  { x:78, SD3neg:8.0, SD2neg:8.7, SD0:10.2, SD2:12.1, SD3:13.3 },
  { x:78.5, SD3neg:8.1, SD2neg:8.8, SD0:10.3, SD2:12.2, SD3:13.4 },
  { x:79, SD3neg:8.2, SD2neg:8.8, SD0:10.4, SD2:12.3, SD3:13.5 },
  { x:79.5, SD3neg:8.3, SD2neg:8.9, SD0:10.5, SD2:12.4, SD3:13.6 },
  { x:80, SD3neg:8.3, SD2neg:9.0, SD0:10.6, SD2:12.6, SD3:13.7 },
  { x:80.5, SD3neg:8.4, SD2neg:9.1, SD0:10.7, SD2:12.7, SD3:13.8 },
  { x:81, SD3neg:8.5, SD2neg:9.2, SD0:10.8, SD2:12.8, SD3:14.0 },
  { x:81.5, SD3neg:8.6, SD2neg:9.3, SD0:10.9, SD2:12.9, SD3:14.1 },
  { x:82, SD3neg:8.7, SD2neg:9.3, SD0:11.0, SD2:13.0, SD3:14.2 },
  { x:82.5, SD3neg:8.7, SD2neg:9.4, SD0:11.1, SD2:13.1, SD3:14.4 },
  { x:83, SD3neg:8.8, SD2neg:9.5, SD0:11.2, SD2:13.3, SD3:14.5 },
  { x:83.5, SD3neg:8.9, SD2neg:9.6, SD0:11.3, SD2:13.4, SD3:14.6 },
  { x:84, SD3neg:9.0, SD2neg:9.7, SD0:11.4, SD2:13.5, SD3:14.8 },
  { x:84.5, SD3neg:9.1, SD2neg:9.9, SD0:11.5, SD2:13.7, SD3:14.9 },
  { x:85, SD3neg:9.2, SD2neg:10.0, SD0:11.7, SD2:13.8, SD3:15.1 },
  { x:85.5, SD3neg:9.3, SD2neg:10.1, SD0:11.8, SD2:13.9, SD3:15.2 },
  { x:86, SD3neg:9.4, SD2neg:10.2, SD0:11.9, SD2:14.1, SD3:15.4 },
  { x:86.5, SD3neg:9.5, SD2neg:10.3, SD0:12.0, SD2:14.2, SD3:15.5 },
  { x:87, SD3neg:9.6, SD2neg:10.4, SD0:12.2, SD2:14.4, SD3:15.7 },
  { x:87.5, SD3neg:9.7, SD2neg:10.5, SD0:12.3, SD2:14.5, SD3:15.8 },
  { x:88, SD3neg:9.8, SD2neg:10.6, SD0:12.4, SD2:14.7, SD3:16.0 },
  { x:88.5, SD3neg:9.9, SD2neg:10.7, SD0:12.5, SD2:14.8, SD3:16.1 },
  { x:89, SD3neg:10.0, SD2neg:10.8, SD0:12.6, SD2:14.9, SD3:16.3 },
  { x:89.5, SD3neg:10.1, SD2neg:10.9, SD0:12.8, SD2:15.1, SD3:16.4 },
  { x:90, SD3neg:10.2, SD2neg:11.0, SD0:12.9, SD2:15.2, SD3:16.6 },
  { x:90.5, SD3neg:10.3, SD2neg:11.1, SD0:13.0, SD2:15.3, SD3:16.7 },
  { x:91, SD3neg:10.4, SD2neg:11.2, SD0:13.1, SD2:15.5, SD3:16.9 },
  { x:91.5, SD3neg:10.5, SD2neg:11.3, SD0:13.2, SD2:15.6, SD3:17.0 },
  { x:92, SD3neg:10.6, SD2neg:11.4, SD0:13.4, SD2:15.8, SD3:17.2 },
  { x:92.5, SD3neg:10.7, SD2neg:11.5, SD0:13.5, SD2:15.9, SD3:17.3 },
  { x:93, SD3neg:10.8, SD2neg:11.6, SD0:13.6, SD2:16.0, SD3:17.5 },
  { x:93.5, SD3neg:10.9, SD2neg:11.7, SD0:13.7, SD2:16.2, SD3:17.6 },
  { x:94, SD3neg:11.0, SD2neg:11.8, SD0:13.8, SD2:16.3, SD3:17.8 },
  { x:94.5, SD3neg:11.1, SD2neg:11.9, SD0:13.9, SD2:16.5, SD3:17.9 },
  { x:95, SD3neg:11.1, SD2neg:12.0, SD0:14.1, SD2:16.6, SD3:18.1 },
  { x:95.5, SD3neg:11.2, SD2neg:12.1, SD0:14.2, SD2:16.7, SD3:18.3 },
  { x:96, SD3neg:11.3, SD2neg:12.2, SD0:14.3, SD2:16.9, SD3:18.4 },
  { x:96.5, SD3neg:11.4, SD2neg:12.3, SD0:14.4, SD2:17.0, SD3:18.6 },
  { x:97, SD3neg:11.5, SD2neg:12.4, SD0:14.6, SD2:17.2, SD3:18.8 },
  { x:97.5, SD3neg:11.6, SD2neg:12.5, SD0:14.7, SD2:17.4, SD3:18.9 },
  { x:98, SD3neg:11.7, SD2neg:12.6, SD0:14.8, SD2:17.5, SD3:19.1 },
  { x:98.5, SD3neg:11.8, SD2neg:12.8, SD0:14.9, SD2:17.7, SD3:19.3 },
  { x:99, SD3neg:11.9, SD2neg:12.9, SD0:15.1, SD2:17.9, SD3:19.5 },
  { x:99.5, SD3neg:12.0, SD2neg:13.0, SD0:15.2, SD2:18.0, SD3:19.7 },
  { x:100, SD3neg:12.1, SD2neg:13.1, SD0:15.4, SD2:18.2, SD3:19.9 },
  { x:100.5, SD3neg:12.2, SD2neg:13.2, SD0:15.5, SD2:18.4, SD3:20.1 },
  { x:101, SD3neg:12.3, SD2neg:13.3, SD0:15.6, SD2:18.5, SD3:20.3 },
  { x:101.5, SD3neg:12.4, SD2neg:13.4, SD0:15.8, SD2:18.7, SD3:20.5 },
  { x:102, SD3neg:12.5, SD2neg:13.6, SD0:15.9, SD2:18.9, SD3:20.7 },
  { x:102.5, SD3neg:12.6, SD2neg:13.7, SD0:16.1, SD2:19.1, SD3:20.9 },
  { x:103, SD3neg:12.8, SD2neg:13.8, SD0:16.2, SD2:19.3, SD3:21.1 },
  { x:103.5, SD3neg:12.9, SD2neg:13.9, SD0:16.4, SD2:19.5, SD3:21.3 },
  { x:104, SD3neg:13.0, SD2neg:14.0, SD0:16.5, SD2:19.7, SD3:21.6 },
  { x:104.5, SD3neg:13.1, SD2neg:14.2, SD0:16.7, SD2:19.9, SD3:21.8 },
  { x:105, SD3neg:13.2, SD2neg:14.3, SD0:16.8, SD2:20.1, SD3:22.0 },
  { x:105.5, SD3neg:13.3, SD2neg:14.4, SD0:17.0, SD2:20.3, SD3:22.2 },
  { x:106, SD3neg:13.4, SD2neg:14.5, SD0:17.2, SD2:20.5, SD3:22.5 },
  { x:106.5, SD3neg:13.5, SD2neg:14.7, SD0:17.3, SD2:20.7, SD3:22.7 },
  { x:107, SD3neg:13.7, SD2neg:14.8, SD0:17.5, SD2:20.9, SD3:22.9 },
  { x:107.5, SD3neg:13.8, SD2neg:14.9, SD0:17.7, SD2:21.1, SD3:23.2 },
  { x:108, SD3neg:13.9, SD2neg:15.1, SD0:17.8, SD2:21.3, SD3:23.4 },
  { x:108.5, SD3neg:14.0, SD2neg:15.2, SD0:18.0, SD2:21.5, SD3:23.7 },
  { x:109, SD3neg:14.1, SD2neg:15.3, SD0:18.2, SD2:21.8, SD3:23.9 },
  { x:109.5, SD3neg:14.3, SD2neg:15.5, SD0:18.3, SD2:22.0, SD3:24.2 },
  { x:110, SD3neg:14.4, SD2neg:15.6, SD0:18.5, SD2:22.2, SD3:24.4 },
  { x:110.5, SD3neg:14.5, SD2neg:15.8, SD0:18.7, SD2:22.4, SD3:24.7 },
  { x:111, SD3neg:14.6, SD2neg:15.9, SD0:18.9, SD2:22.7, SD3:25.0 },
  { x:111.5, SD3neg:14.8, SD2neg:16.0, SD0:19.1, SD2:22.9, SD3:25.2 },
  { x:112, SD3neg:14.9, SD2neg:16.2, SD0:19.2, SD2:23.1, SD3:25.5 },
  { x:112.5, SD3neg:15.0, SD2neg:16.3, SD0:19.4, SD2:23.4, SD3:25.8 },
  { x:113, SD3neg:15.2, SD2neg:16.5, SD0:19.6, SD2:23.6, SD3:26.0 },
  { x:113.5, SD3neg:15.3, SD2neg:16.6, SD0:19.8, SD2:23.9, SD3:26.3 },
  { x:114, SD3neg:15.4, SD2neg:16.8, SD0:20.0, SD2:24.1, SD3:26.6 },
  { x:114.5, SD3neg:15.6, SD2neg:16.9, SD0:20.2, SD2:24.4, SD3:26.9 },
  { x:115, SD3neg:15.7, SD2neg:17.1, SD0:20.4, SD2:24.6, SD3:27.2 },
  { x:115.5, SD3neg:15.8, SD2neg:17.2, SD0:20.6, SD2:24.9, SD3:27.5 },
  { x:116, SD3neg:16.0, SD2neg:17.4, SD0:20.8, SD2:25.1, SD3:27.8 },
  { x:116.5, SD3neg:16.1, SD2neg:17.5, SD0:21.0, SD2:25.4, SD3:28.0 },
  { x:117, SD3neg:16.2, SD2neg:17.7, SD0:21.2, SD2:25.6, SD3:28.3 },
  { x:117.5, SD3neg:16.4, SD2neg:17.9, SD0:21.4, SD2:25.9, SD3:28.6 },
  { x:118, SD3neg:16.5, SD2neg:18.0, SD0:21.6, SD2:26.1, SD3:28.9 },
  { x:118.5, SD3neg:16.7, SD2neg:18.2, SD0:21.8, SD2:26.4, SD3:29.2 },
  { x:119, SD3neg:16.8, SD2neg:18.3, SD0:22.0, SD2:26.6, SD3:29.5 },
  { x:119.5, SD3neg:16.9, SD2neg:18.5, SD0:22.2, SD2:26.9, SD3:29.8 },
  { x:120, SD3neg:17.1, SD2neg:18.6, SD0:22.4, SD2:27.2, SD3:30.1 },
]

const WHO_WFH_GIRLS = [
  { x:65, SD3neg:5.6, SD2neg:6.1, SD0:7.2, SD2:8.7, SD3:9.7 },
  { x:65.5, SD3neg:5.7, SD2neg:6.2, SD0:7.4, SD2:8.9, SD3:9.8 },
  { x:66, SD3neg:5.8, SD2neg:6.3, SD0:7.5, SD2:9.0, SD3:10.0 },
  { x:66.5, SD3neg:5.8, SD2neg:6.4, SD0:7.6, SD2:9.1, SD3:10.1 },
  { x:67, SD3neg:5.9, SD2neg:6.4, SD0:7.7, SD2:9.3, SD3:10.2 },
  { x:67.5, SD3neg:6.0, SD2neg:6.5, SD0:7.8, SD2:9.4, SD3:10.4 },
  { x:68, SD3neg:6.1, SD2neg:6.6, SD0:7.9, SD2:9.5, SD3:10.5 },
  { x:68.5, SD3neg:6.2, SD2neg:6.7, SD0:8.0, SD2:9.7, SD3:10.7 },
  { x:69, SD3neg:6.3, SD2neg:6.8, SD0:8.1, SD2:9.8, SD3:10.8 },
  { x:69.5, SD3neg:6.3, SD2neg:6.9, SD0:8.2, SD2:9.9, SD3:10.9 },
  { x:70, SD3neg:6.4, SD2neg:7.0, SD0:8.3, SD2:10.0, SD3:11.1 },
  { x:70.5, SD3neg:6.5, SD2neg:7.1, SD0:8.4, SD2:10.1, SD3:11.2 },
  { x:71, SD3neg:6.6, SD2neg:7.1, SD0:8.5, SD2:10.3, SD3:11.3 },
  { x:71.5, SD3neg:6.7, SD2neg:7.2, SD0:8.6, SD2:10.4, SD3:11.5 },
  { x:72, SD3neg:6.7, SD2neg:7.3, SD0:8.7, SD2:10.5, SD3:11.6 },
  { x:72.5, SD3neg:6.8, SD2neg:7.4, SD0:8.8, SD2:10.6, SD3:11.7 },
  { x:73, SD3neg:6.9, SD2neg:7.5, SD0:8.9, SD2:10.7, SD3:11.8 },
  { x:73.5, SD3neg:7.0, SD2neg:7.6, SD0:9.0, SD2:10.8, SD3:12.0 },
  { x:74, SD3neg:7.0, SD2neg:7.6, SD0:9.1, SD2:11.0, SD3:12.1 },
  { x:74.5, SD3neg:7.1, SD2neg:7.7, SD0:9.2, SD2:11.1, SD3:12.2 },
  { x:75, SD3neg:7.2, SD2neg:7.8, SD0:9.3, SD2:11.2, SD3:12.3 },
  { x:75.5, SD3neg:7.2, SD2neg:7.9, SD0:9.4, SD2:11.3, SD3:12.5 },
  { x:76, SD3neg:7.3, SD2neg:8.0, SD0:9.5, SD2:11.4, SD3:12.6 },
  { x:76.5, SD3neg:7.4, SD2neg:8.0, SD0:9.6, SD2:11.5, SD3:12.7 },
  { x:77, SD3neg:7.5, SD2neg:8.1, SD0:9.6, SD2:11.6, SD3:12.8 },
  { x:77.5, SD3neg:7.5, SD2neg:8.2, SD0:9.7, SD2:11.7, SD3:12.9 },
  { x:78, SD3neg:7.6, SD2neg:8.3, SD0:9.8, SD2:11.8, SD3:13.1 },
  { x:78.5, SD3neg:7.7, SD2neg:8.4, SD0:9.9, SD2:12.0, SD3:13.2 },
  { x:79, SD3neg:7.8, SD2neg:8.4, SD0:10.0, SD2:12.1, SD3:13.3 },
  { x:79.5, SD3neg:7.8, SD2neg:8.5, SD0:10.1, SD2:12.2, SD3:13.4 },
  { x:80, SD3neg:7.9, SD2neg:8.6, SD0:10.2, SD2:12.3, SD3:13.6 },
  { x:80.5, SD3neg:8.0, SD2neg:8.7, SD0:10.3, SD2:12.4, SD3:13.7 },
  { x:81, SD3neg:8.1, SD2neg:8.8, SD0:10.4, SD2:12.6, SD3:13.9 },
  { x:81.5, SD3neg:8.2, SD2neg:8.9, SD0:10.6, SD2:12.7, SD3:14.0 },
  { x:82, SD3neg:8.3, SD2neg:9.0, SD0:10.7, SD2:12.8, SD3:14.1 },
  { x:82.5, SD3neg:8.4, SD2neg:9.1, SD0:10.8, SD2:13.0, SD3:14.3 },
  { x:83, SD3neg:8.5, SD2neg:9.2, SD0:10.9, SD2:13.1, SD3:14.5 },
  { x:83.5, SD3neg:8.5, SD2neg:9.3, SD0:11.0, SD2:13.3, SD3:14.6 },
  { x:84, SD3neg:8.6, SD2neg:9.4, SD0:11.1, SD2:13.4, SD3:14.8 },
  { x:84.5, SD3neg:8.7, SD2neg:9.5, SD0:11.3, SD2:13.5, SD3:14.9 },
  { x:85, SD3neg:8.8, SD2neg:9.6, SD0:11.4, SD2:13.7, SD3:15.1 },
  { x:85.5, SD3neg:8.9, SD2neg:9.7, SD0:11.5, SD2:13.8, SD3:15.3 },
  { x:86, SD3neg:9.0, SD2neg:9.8, SD0:11.6, SD2:14.0, SD3:15.4 },
  { x:86.5, SD3neg:9.1, SD2neg:9.9, SD0:11.8, SD2:14.2, SD3:15.6 },
  { x:87, SD3neg:9.2, SD2neg:10.0, SD0:11.9, SD2:14.3, SD3:15.8 },
  { x:87.5, SD3neg:9.3, SD2neg:10.1, SD0:12.0, SD2:14.5, SD3:15.9 },
  { x:88, SD3neg:9.4, SD2neg:10.2, SD0:12.1, SD2:14.6, SD3:16.1 },
  { x:88.5, SD3neg:9.5, SD2neg:10.3, SD0:12.3, SD2:14.8, SD3:16.3 },
  { x:89, SD3neg:9.6, SD2neg:10.4, SD0:12.4, SD2:14.9, SD3:16.4 },
  { x:89.5, SD3neg:9.7, SD2neg:10.5, SD0:12.5, SD2:15.1, SD3:16.6 },
  { x:90, SD3neg:9.8, SD2neg:10.6, SD0:12.6, SD2:15.2, SD3:16.8 },
  { x:90.5, SD3neg:9.9, SD2neg:10.7, SD0:12.8, SD2:15.4, SD3:16.9 },
  { x:91, SD3neg:10.0, SD2neg:10.9, SD0:12.9, SD2:15.5, SD3:17.1 },
  { x:91.5, SD3neg:10.1, SD2neg:11.0, SD0:13.0, SD2:15.7, SD3:17.3 },
  { x:92, SD3neg:10.2, SD2neg:11.1, SD0:13.1, SD2:15.8, SD3:17.4 },
  { x:92.5, SD3neg:10.3, SD2neg:11.2, SD0:13.3, SD2:16.0, SD3:17.6 },
  { x:93, SD3neg:10.4, SD2neg:11.3, SD0:13.4, SD2:16.1, SD3:17.8 },
  { x:93.5, SD3neg:10.5, SD2neg:11.4, SD0:13.5, SD2:16.3, SD3:17.9 },
  { x:94, SD3neg:10.6, SD2neg:11.5, SD0:13.6, SD2:16.4, SD3:18.1 },
  { x:94.5, SD3neg:10.7, SD2neg:11.6, SD0:13.8, SD2:16.6, SD3:18.3 },
  { x:95, SD3neg:10.8, SD2neg:11.7, SD0:13.9, SD2:16.7, SD3:18.5 },
  { x:95.5, SD3neg:10.8, SD2neg:11.8, SD0:14.0, SD2:16.9, SD3:18.6 },
  { x:96, SD3neg:10.9, SD2neg:11.9, SD0:14.1, SD2:17.0, SD3:18.8 },
  { x:96.5, SD3neg:11.0, SD2neg:12.0, SD0:14.3, SD2:17.2, SD3:19.0 },
  { x:97, SD3neg:11.1, SD2neg:12.1, SD0:14.4, SD2:17.4, SD3:19.2 },
  { x:97.5, SD3neg:11.2, SD2neg:12.2, SD0:14.5, SD2:17.5, SD3:19.3 },
  { x:98, SD3neg:11.3, SD2neg:12.3, SD0:14.7, SD2:17.7, SD3:19.5 },
  { x:98.5, SD3neg:11.4, SD2neg:12.4, SD0:14.8, SD2:17.9, SD3:19.7 },
  { x:99, SD3neg:11.5, SD2neg:12.5, SD0:14.9, SD2:18.0, SD3:19.9 },
  { x:99.5, SD3neg:11.6, SD2neg:12.7, SD0:15.1, SD2:18.2, SD3:20.1 },
  { x:100, SD3neg:11.7, SD2neg:12.8, SD0:15.2, SD2:18.4, SD3:20.3 },
  { x:100.5, SD3neg:11.9, SD2neg:12.9, SD0:15.4, SD2:18.6, SD3:20.5 },
  { x:101, SD3neg:12.0, SD2neg:13.0, SD0:15.5, SD2:18.7, SD3:20.7 },
  { x:101.5, SD3neg:12.1, SD2neg:13.1, SD0:15.7, SD2:18.9, SD3:20.9 },
  { x:102, SD3neg:12.2, SD2neg:13.3, SD0:15.8, SD2:19.1, SD3:21.1 },
  { x:102.5, SD3neg:12.3, SD2neg:13.4, SD0:16.0, SD2:19.3, SD3:21.4 },
  { x:103, SD3neg:12.4, SD2neg:13.5, SD0:16.1, SD2:19.5, SD3:21.6 },
  { x:103.5, SD3neg:12.5, SD2neg:13.6, SD0:16.3, SD2:19.7, SD3:21.8 },
  { x:104, SD3neg:12.6, SD2neg:13.8, SD0:16.4, SD2:19.9, SD3:22.0 },
  { x:104.5, SD3neg:12.8, SD2neg:13.9, SD0:16.6, SD2:20.1, SD3:22.3 },
  { x:105, SD3neg:12.9, SD2neg:14.0, SD0:16.8, SD2:20.3, SD3:22.5 },
  { x:105.5, SD3neg:13.0, SD2neg:14.2, SD0:16.9, SD2:20.5, SD3:22.7 },
  { x:106, SD3neg:13.1, SD2neg:14.3, SD0:17.1, SD2:20.8, SD3:23.0 },
  { x:106.5, SD3neg:13.3, SD2neg:14.5, SD0:17.3, SD2:21.0, SD3:23.2 },
  { x:107, SD3neg:13.4, SD2neg:14.6, SD0:17.5, SD2:21.2, SD3:23.5 },
  { x:107.5, SD3neg:13.5, SD2neg:14.7, SD0:17.7, SD2:21.4, SD3:23.7 },
  { x:108, SD3neg:13.7, SD2neg:14.9, SD0:17.8, SD2:21.7, SD3:24.0 },
  { x:108.5, SD3neg:13.8, SD2neg:15.0, SD0:18.0, SD2:21.9, SD3:24.3 },
  { x:109, SD3neg:13.9, SD2neg:15.2, SD0:18.2, SD2:22.1, SD3:24.5 },
  { x:109.5, SD3neg:14.1, SD2neg:15.4, SD0:18.4, SD2:22.4, SD3:24.8 },
  { x:110, SD3neg:14.2, SD2neg:15.5, SD0:18.6, SD2:22.6, SD3:25.1 },
  { x:110.5, SD3neg:14.4, SD2neg:15.7, SD0:18.8, SD2:22.9, SD3:25.4 },
  { x:111, SD3neg:14.5, SD2neg:15.8, SD0:19.0, SD2:23.1, SD3:25.7 },
  { x:111.5, SD3neg:14.7, SD2neg:16.0, SD0:19.2, SD2:23.4, SD3:26.0 },
  { x:112, SD3neg:14.8, SD2neg:16.2, SD0:19.4, SD2:23.6, SD3:26.2 },
  { x:112.5, SD3neg:15.0, SD2neg:16.3, SD0:19.6, SD2:23.9, SD3:26.5 },
  { x:113, SD3neg:15.1, SD2neg:16.5, SD0:19.8, SD2:24.2, SD3:26.8 },
  { x:113.5, SD3neg:15.3, SD2neg:16.7, SD0:20.0, SD2:24.4, SD3:27.1 },
  { x:114, SD3neg:15.4, SD2neg:16.8, SD0:20.2, SD2:24.7, SD3:27.4 },
  { x:114.5, SD3neg:15.6, SD2neg:17.0, SD0:20.5, SD2:25.0, SD3:27.8 },
  { x:115, SD3neg:15.7, SD2neg:17.2, SD0:20.7, SD2:25.2, SD3:28.1 },
  { x:115.5, SD3neg:15.9, SD2neg:17.3, SD0:20.9, SD2:25.5, SD3:28.4 },
  { x:116, SD3neg:16.0, SD2neg:17.5, SD0:21.1, SD2:25.8, SD3:28.7 },
  { x:116.5, SD3neg:16.2, SD2neg:17.7, SD0:21.3, SD2:26.1, SD3:29.0 },
  { x:117, SD3neg:16.3, SD2neg:17.8, SD0:21.5, SD2:26.3, SD3:29.3 },
  { x:117.5, SD3neg:16.5, SD2neg:18.0, SD0:21.7, SD2:26.6, SD3:29.6 },
  { x:118, SD3neg:16.6, SD2neg:18.2, SD0:22.0, SD2:26.9, SD3:29.9 },
  { x:118.5, SD3neg:16.8, SD2neg:18.4, SD0:22.2, SD2:27.2, SD3:30.3 },
  { x:119, SD3neg:16.9, SD2neg:18.5, SD0:22.4, SD2:27.4, SD3:30.6 },
  { x:119.5, SD3neg:17.1, SD2neg:18.7, SD0:22.6, SD2:27.7, SD3:30.9 },
  { x:120, SD3neg:17.3, SD2neg:18.9, SD0:22.8, SD2:28.0, SD3:31.2 },
]

const chartMenus = [
  {
    key: 'weightAge',
    label: 'Berat Badan/Umur',
    shortLabel: 'BB/U',
    title: 'Grafik Berat Badan menurut Umur (BB/U)',
    statusLabel: 'Status Gizi BB/U',
    sourceLabel: 'Standar WHO',
    xField: 'age_months',
    yField: 'berat_badan',
    xAxisLabel: 'Umur (bulan)',
    yAxisLabel: 'Berat Badan (kg)',
    yUnit: 'kg',
    secondaryField: 'age_months',
    secondaryStatLabel: 'Usia Saat Timbang',
    secondaryUnit: 'bln',
    primaryStatLabel: 'Berat Badan',
    requiredText: 'berat badan dan umur',
    xMin: 0,
    xMax: 60,
    yMin: 0,
    yMax: 30,
    gridX: Array.from({ length: 61 }, (_, i) => i),
    xTicks: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50, 52, 54, 56, 58, 60],
    gridY: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30],
  },
  {
    key: 'lengthAge',
    label: 'Panjang Badan/Umur',
    shortLabel: 'PB/U',
    title: 'Grafik Panjang/Tinggi Badan menurut Umur (PB/U)',
    statusLabel: 'Status PB/U',
    sourceLabel: 'Standar WHO',
    xField: 'age_months',
    yField: 'tinggi_badan',
    xAxisLabel: 'Umur (bulan)',
    yAxisLabel: 'Panjang/Tinggi Badan (cm)',
    yUnit: 'cm',
    secondaryField: 'age_months',
    secondaryStatLabel: 'Usia Saat Ukur',
    secondaryUnit: 'bln',
    primaryStatLabel: 'Panjang/Tinggi Badan',
    requiredText: 'panjang/tinggi badan dan umur',
    xMin: 0,
    xMax: 60,
    yMin: 40,
    yMax: 125,
    gridX: Array.from({ length: 61 }, (_, i) => i),
    xTicks: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50, 52, 54, 56, 58, 60],
    gridY: [45, 55, 65, 75, 85, 95, 105, 115, 125],
  },
  {
    key: 'weightLength',
    label: 'Berat Badan/Panjang Badan',
    shortLabel: 'BB/PB',
    title: 'Grafik Berat Badan menurut Panjang/Tinggi Badan (BB/PB)',
    statusLabel: 'Status Gizi BB/PB',
    sourceLabel: 'Standar WHO',
    xField: 'tinggi_badan',
    yField: 'berat_badan',
    xAxisLabel: 'Panjang/Tinggi Badan (cm)',
    yAxisLabel: 'Berat Badan (kg)',
    yUnit: 'kg',
    secondaryField: 'tinggi_badan',
    secondaryStatLabel: 'Panjang/Tinggi Badan',
    secondaryUnit: 'cm',
    primaryStatLabel: 'Berat Badan',
    requiredText: 'panjang/tinggi badan dan berat badan',
    xMin: 45,
    xMax: 120,
    yMin: 0,
    yMax: 30,
    gridX: Array.from({ length: 76 }, (_, i) => i + 45),
    xTicks: [45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110, 115, 120],
    gridY: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30],
  },
]

const activeChart = computed(() =>
  chartMenus.find(menu => menu.key === activeChartKey.value) ?? chartMenus[0]
)

const latestPointWithActiveFields = computed(() => {
  const points = [...chartPoints.value].reverse()

  return points.find(point => {
    const x = Number(point?.[activeChart.value.xField])
    const y = Number(point?.[activeChart.value.yField])

    return Number.isFinite(x) && Number.isFinite(y)
  }) ?? null
})

function getWeightLengthReferenceKind(point) {
  const age = Number(point?.age_months)

  return Number.isFinite(age) && age < 24 ? 'length' : 'height'
}

const activeWeightLengthReferenceKind = computed(() =>
  getWeightLengthReferenceKind(latestPointWithActiveFields.value)
)

const activeReferenceLabel = computed(() => {
  if (activeChartKey.value === 'weightAge') return 'Standar WHO Weight-for-Age'
  if (activeChartKey.value === 'lengthAge') return 'Standar WHO Length/Height-for-Age'

  return activeWeightLengthReferenceKind.value === 'length'
    ? 'Standar WHO Weight-for-Length'
    : 'Standar WHO Weight-for-Height'
})

function getReferenceDataForPoint(point = null) {
  const isBoy = props.selectedBalita?.jenis_kelamin === 'Laki-laki'

  if (activeChartKey.value === 'weightAge') {
    return normalizeReferenceData(isBoy ? WHO_BOYS : WHO_GIRLS)
  }

  if (activeChartKey.value === 'lengthAge') {
    return isBoy ? WHO_LHFA_BOYS : WHO_LHFA_GIRLS
  }

  const kind = point ? getWeightLengthReferenceKind(point) : activeWeightLengthReferenceKind.value

  if (kind === 'length') {
    return isBoy ? WHO_WFL_BOYS : WHO_WFL_GIRLS
  }

  return isBoy ? WHO_WFH_BOYS : WHO_WFH_GIRLS
}

const activeReferenceData = computed(() => getReferenceDataForPoint())

const activeXMin = computed(() => {
  if (activeChartKey.value !== 'weightLength') return activeChart.value.xMin
  return activeWeightLengthReferenceKind.value === 'length' ? 45 : 65
})

const activeXMax = computed(() => {
  if (activeChartKey.value !== 'weightLength') return activeChart.value.xMax
  return activeWeightLengthReferenceKind.value === 'length' ? 110 : 120
})

const activeYMin = computed(() => activeChart.value.yMin)
const activeYMax = computed(() => activeChart.value.yMax)

const activeGridX = computed(() => {
  if (activeChartKey.value !== 'weightLength') return activeChart.value.gridX

  const start = activeXMin.value
  const end = activeXMax.value
  return Array.from({ length: end - start + 1 }, (_, i) => i + start)
})

const activeXTicks = computed(() => {
  if (activeChartKey.value !== 'weightLength') return activeChart.value.xTicks
  if (activeWeightLengthReferenceKind.value === 'length') {
    return [45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110]
  }

  return [65, 70, 75, 80, 85, 90, 95, 100, 105, 110, 115, 120]
})

const activeGridY = computed(() => activeChart.value.gridY)

const chartDisplayPoints = computed(() =>
  chartPoints.value.filter(point => {
    const x = getPointX(point)
    const y = getPointY(point)

    if (activeChartKey.value === 'weightLength' &&
      getWeightLengthReferenceKind(point) !== activeWeightLengthReferenceKind.value) {
      return false
    }

    return Number.isFinite(x) &&
      Number.isFinite(y) &&
      x >= activeXMin.value &&
      x <= activeXMax.value &&
      y >= activeYMin.value &&
      y <= activeYMax.value
  })
)

const hasActiveChartData = computed(() => chartDisplayPoints.value.length > 0)

const selectedChartPoint = computed(() => {
  const points = chartDisplayPoints.value
  return points.length > 0 ? points[points.length - 1] : null
})

const secondaryStatValue = computed(() => {
  if (!selectedChartPoint.value) return '–'
  return formatPointValue(selectedChartPoint.value, activeChart.value.secondaryField)
})

const lastReferencePoint = computed(() => {
  const data = activeReferenceData.value
  return data.length > 0 ? data[data.length - 1] : null
})

function normalizeReferenceData(data) {
  return data.map(row => ({
    x: row.m,
    SD3neg: row.SD3neg,
    SD2neg: row.SD2neg,
    SD0: row.SD0,
    SD2: row.SD2,
    SD3: row.SD3,
  }))
}

function getPointX(point) {
  if (!point) return null
  return Number(point[activeChart.value.xField])
}

function getPointY(point) {
  if (!point) return null
  return Number(point[activeChart.value.yField])
}

function formatPointValue(point, field) {
  if (!point) return '–'

  const value = Number(point[field])
  if (!Number.isFinite(value)) return '–'

  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

function findNearestReferenceRow(x, point = null) {
  const data = getReferenceDataForPoint(point)

  if (!Number.isFinite(x) || data.length === 0) return null

  return data.reduce((nearest, row) =>
    Math.abs(row.x - x) < Math.abs(nearest.x - x) ? row : nearest
  , data[0])
}

function getZScore(point) {
  const x = getPointX(point)
  const y = getPointY(point)
  const row = findNearestReferenceRow(x, point)

  if (!row || !Number.isFinite(y)) return 0

  if (y >= row.SD0) {
    const range = row.SD2 - row.SD0
    return range > 0 ? ((y - row.SD0) / range) * 2 : 0
  }

  const range = row.SD0 - row.SD2neg
  return range > 0 ? ((y - row.SD0) / range) * 2 : 0
}

function getZScoreStatus(point) {
  const z = getZScore(point)

  if (activeChartKey.value === 'lengthAge') {
    if (z < -3) return 'Sangat Pendek'
    if (z < -2) return 'Pendek'
    if (z <= 3) return 'Normal'

    return 'Tinggi'
  }

  if (z < -3) return 'Gizi Buruk'
  if (z < -2) return 'Gizi Kurang'
  if (z <= 1) return 'Gizi Baik'
  if (z <= 2) return 'Berisiko Lebih'
  if (z <= 3) return 'Gizi Lebih'

  return 'Obesitas'
}

function getZScoreClass(point) {
  const z = getZScore(point)

  if (activeChartKey.value === 'lengthAge') {
    if (z < -3) return 'status-buruk'
    if (z < -2) return 'status-kurang'
    if (z <= 3) return 'status-baik'

    return 'status-lebih'
  }

  if (z < -3) return 'status-buruk'
  if (z < -2) return 'status-kurang'
  if (z <= 1) return 'status-baik'
  if (z <= 2) return 'status-risiko'

  return 'status-lebih'
}

const dotColor = computed(() => {
  const z = getZScore(selectedChartPoint.value)

  if (z < -3) return '#DC2626'
  if (z < -2) return '#D97706'

  if (activeChartKey.value === 'lengthAge') {
    if (z <= 3) return '#16A87A'
    return '#DC2626'
  }

  if (z <= 1) return '#16A87A'
  if (z <= 2) return '#D97706'

  return '#DC2626'
})

// ── SVG Chart helpers ─────────────────────────────────────
const SVG_W      = 560
const SVG_H      = 320
const PAD_LEFT   = 44
const PAD_RIGHT  = 28
const PAD_TOP    = 20
const PAD_BOTTOM = 36

function xScale(x) {
  return PAD_LEFT + (x - activeXMin.value) / (activeXMax.value - activeXMin.value) * (SVG_W - PAD_LEFT - PAD_RIGHT)
}

function yScale(y) {
  return SVG_H - PAD_BOTTOM - (y - activeYMin.value) / (activeYMax.value - activeYMin.value) * (SVG_H - PAD_TOP - PAD_BOTTOM)
}

function isPointXInsideRange(point) {
  const x = getPointX(point)
  return Number.isFinite(x) && x >= activeXMin.value && x <= activeXMax.value
}

function linePath(data, key) {
  return data.map(d => `${xScale(d.x)},${yScale(d[key])}`).join(' ')
}

function fillZone(data, keyBottom, keyTop) {
  const top = keyTop === 'top'
    ? data.map(d => `${xScale(d.x)},${yScale(activeYMax.value)}`)
    : data.map(d => `${xScale(d.x)},${yScale(d[keyTop])}`)

  const bottom = keyBottom === 'bottom'
    ? [...data].reverse().map(d => `${xScale(d.x)},${yScale(activeYMin.value)}`)
    : [...data].reverse().map(d => `${xScale(d.x)},${yScale(d[keyBottom])}`)

  return [...top, ...bottom].join(' ')
}
</script>
