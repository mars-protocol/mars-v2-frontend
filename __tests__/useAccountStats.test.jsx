import React from 'react'
import { renderHook } from '@testing-library/react-hooks'
import useFetchData from './useFetchData.js'
import axios from 'axios'

jest.mock('axios')

const useApiMockData = [
  { id: 1, name: 'Leanne Graham' },
  { id: 2, name: 'Ervin Howell' },
]

describe('useFetchData Hook', () => {
  it('initial and success state', async () => {
    axios.get.mockResolvedValue(useApiMockData)
    const { result, waitForNextUpdate } = renderHook(() => useFetchData('lorem'))
    expect(result.current).toMatchObject({
      data: [],
      error: '',
      state: 'LOADING',
    })

    await waitForNextUpdate()

    expect(result.current).toMatchObject({
      data: useApiMockData,
      error: '',
      state: 'SUCCESS',
    })
  })

  it('error state', async () => {
    const errorMessage = 'Network Error'
    axios.get.mockImplementationOnce(() => Promise.reject(new Error(errorMessage)))

    const { result, waitForNextUpdate } = renderHook(() => useFetchData('lorem'))

    await waitForNextUpdate()

    expect(result.current).toMatchObject({
      data: [],
      error: 'Fetch failed',
      state: 'ERROR',
    })
  })
})
