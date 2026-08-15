import JSZip from 'jszip'
import { describe, expect, it } from 'vitest'

import {
  SAMPLE_PLANNING_PACKAGES,
  buildSamplePlanningPackageDownload,
  createSamplePlanningPackageSnapshot
} from '@/services/samplePlanningPackages'
import { readPlanningPackage } from '@/utils/fileHandler'

const blobToArrayBuffer = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error)
    reader.readAsArrayBuffer(blob)
  })

const asFile = (blob, name) => ({
  name,
  arrayBuffer: async () => blobToArrayBuffer(blob)
})

const assertAlignedKeys = (snapshot) => {
  const resourceKeys = snapshot.resourceDetail.resourceFormHeadList.map(({ key }) => key)
  expect(snapshot.resourceDetail.resourceBasicInfoList.map(({ key }) => key)).toEqual(resourceKeys)
  expect(snapshot.resourceDetail.resourceUsabilityList.map(({ key }) => key)).toEqual(resourceKeys)
  expect(snapshot.resourceDetail.resourceThreePartsList.map(({ key }) => key)).toEqual(resourceKeys)

  const taskKeys = snapshot.taskDetail.taskFormHeadList.map(({ key }) => key)
  expect(snapshot.taskDetail.taskBasicInfoList.map(({ key }) => key)).toEqual(taskKeys)
  expect(snapshot.taskDetail.taskPropList.map(({ key }) => key)).toEqual(taskKeys)
  expect(snapshot.taskDetail.taskDurationList.map(({ key }) => key)).toEqual(taskKeys)
}

describe('sample planning packages', () => {
  it('provides three algorithm-compatible 2026 scenarios with aligned data', () => {
    expect(SAMPLE_PLANNING_PACKAGES).toHaveLength(3)

    SAMPLE_PLANNING_PACKAGES.forEach(({ id }) => {
      const snapshot = createSamplePlanningPackageSnapshot(id)
      assertAlignedKeys(snapshot)

      expect(snapshot.basicConfig.timeRange).toHaveLength(2)
      expect(snapshot.basicConfig.timeRange.every((value) => value.startsWith('2026-'))).toBe(true)
      expect(snapshot.resourceDetail.resourceFormHeadList.length).toBeGreaterThan(0)
      expect(snapshot.taskDetail.taskFormHeadList.length).toBeGreaterThan(0)

      snapshot.resourceDetail.resourceUsabilityList.forEach(({ availabilityDiscreteData }) => {
        expect(availabilityDiscreteData.length).toBeGreaterThan(0)
        availabilityDiscreteData.forEach(({ startTime, endTime, notes }) => {
          expect(startTime).toMatch(/^2026-/)
          expect(endTime).toMatch(/^2026-/)
          expect(notes).toBeTruthy()
        })
      })

      snapshot.taskDetail.taskFormHeadList.forEach(({ taskName, state }) => {
        expect(taskName).toMatch(/^FK-[12]-/)
        expect(state).toBe(0)
      })
      snapshot.taskDetail.taskPropList.forEach(({ singleDiscreteData }) => {
        expect(singleDiscreteData.length).toBeGreaterThan(0)
        expect(singleDiscreteData[0].startTime).toMatch(/^2026-/)
        expect(singleDiscreteData[0].endTime).toMatch(/^2026-/)
      })
      snapshot.taskDetail.taskDurationList.forEach(({ fixedDuration }) => {
        expect(fixedDuration).toBeGreaterThan(0)
      })
    })
  })

  it('builds a single selection as an importable .sts planning package', async () => {
    const selected = SAMPLE_PLANNING_PACKAGES[0]
    const result = await buildSamplePlanningPackageDownload([selected.id])

    expect(result.filename).toMatch(/\.sts$/)
    const snapshot = await readPlanningPackage(asFile(result.blob, result.filename))
    expect(snapshot.basicConfig.packageName).toBe(selected.name)
    expect(snapshot.manifest.format).toBe('space-task-scheduler')
  })

  it('builds multiple selections as a ZIP containing independent importable .sts files', async () => {
    const selection = SAMPLE_PLANNING_PACKAGES.slice(0, 2)
    const result = await buildSamplePlanningPackageDownload(selection.map(({ id }) => id))
    const zip = await JSZip.loadAsync(new Uint8Array(await blobToArrayBuffer(result.blob)))
    const stsEntries = Object.values(zip.files).filter((entry) => entry.name.endsWith('.sts'))

    expect(result.filename).toMatch(/\.zip$/)
    expect(stsEntries).toHaveLength(2)

    for (const entry of stsEntries) {
      const bytes = await entry.async('uint8array')
      const snapshot = await readPlanningPackage({
        name: entry.name,
        arrayBuffer: async () => bytes
      })
      expect(snapshot.basicConfig.timeRange.every((value) => value.startsWith('2026-'))).toBe(true)
    }
  })

  it('rejects an empty or unknown selection', async () => {
    await expect(buildSamplePlanningPackageDownload([])).rejects.toThrow('请至少选择一个示例规划包')
    await expect(buildSamplePlanningPackageDownload(['missing'])).rejects.toThrow('示例规划包不存在')
  })
})
