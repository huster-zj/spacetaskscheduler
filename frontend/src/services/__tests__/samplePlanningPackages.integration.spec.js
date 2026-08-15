/* eslint-env node */
// @vitest-environment node

import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { createPinia, setActivePinia } from 'pinia'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

const createMemoryStorage = () => {
  const values = new Map()
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
    clear: () => values.clear()
  }
}

global.localStorage = createMemoryStorage()
global.sessionStorage = createMemoryStorage()

let AlgorithmService
let PreprocessService
let SAMPLE_PLANNING_PACKAGES
let buildSamplePlanningPackageDownload
let readPlanningPackage
let restorePlanningPackageSnapshot

const runIntegration = process.env.RUN_ALGORITHM_INTEGRATION === '1'
const backendInterface = path.resolve(process.cwd(), '../backend/interface')
const backendOutput = (filename) => path.join(backendInterface, 'transfer_json_output', filename)
const mutatedBackendFiles = [
  'algorithm_output/output.txt',
  'algorithm_output/schedules.json',
  'backend_input_data/taskDetail.json',
  'backend_input_data/测控资源.json',
  'preprocess_output/连续跟踪飞控事件JSON处理结果/连续跟踪遥控事件预处理备选弧段.json',
  'preprocess_output/非连续跟踪飞控事件JSON处理结果/非连续跟踪遥控事件预处理备选弧段.json',
  'transfer_json_output/taskDetail.json',
  'transfer_json_output/taskDetail2.json',
  'transfer_json_output/测控资源.json'
]
let originalBackendFiles

describe.skipIf(!runIntegration)('sample planning package algorithm integration', () => {
  beforeAll(async () => {
    originalBackendFiles = new Map(
      await Promise.all(
        mutatedBackendFiles.map(async (relativePath) => [
          relativePath,
          await readFile(path.join(backendInterface, relativePath))
        ])
      )
    )
    ;({ default: AlgorithmService } = await import('@/services/Algorithm'))
    ;({ default: PreprocessService } = await import('@/services/Preprocess'))
    ;({ SAMPLE_PLANNING_PACKAGES, buildSamplePlanningPackageDownload } = await import(
      '@/services/samplePlanningPackages'
    ))
    ;({ readPlanningPackage, restorePlanningPackageSnapshot } = await import('@/utils/fileHandler'))
  })

  afterAll(async () => {
    await Promise.all(
      [...originalBackendFiles].map(([relativePath, content]) =>
        writeFile(path.join(backendInterface, relativePath), content)
      )
    )
  })

  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it(
    'preprocesses and schedules every sample with the current heuristic service',
    async () => {
      for (const { id, name } of SAMPLE_PLANNING_PACKAGES) {
        const download = await buildSamplePlanningPackageDownload([id])
        const snapshot = await readPlanningPackage({
          name: download.filename,
          arrayBuffer: () => download.blob.arrayBuffer()
        })
        const expectedTasks = snapshot.taskDetail.taskFormHeadList.map(({ taskName }) => taskName)
        restorePlanningPackageSnapshot(snapshot)

        const preprocessResult = await PreprocessService.preprocessTaskTimewindow()
        expect(preprocessResult.success, `${name}: ${preprocessResult.message}`).toBe(true)

        const persistedTasks = JSON.parse(await readFile(backendOutput('taskDetail2.json'), 'utf8'))
        expect(persistedTasks.taskFormHeadList.map(({ taskName }) => taskName)).toEqual(expectedTasks)

        const algorithmResult = await AlgorithmService.executeAlgorithm()
        expect(algorithmResult.success, `${name}: ${algorithmResult.message}`).toBe(true)
        expect(algorithmResult.data.output_text).toBeTruthy()
        expect(
          expectedTasks.some((taskName) => algorithmResult.data.output_text.includes(taskName)),
          `${name}: 算法输出未包含当前示例任务`
        ).toBe(true)
      }
    },
    120000
  )
})
