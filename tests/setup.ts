import '@testing-library/react'
import '@testing-library/jest-dom'
import { afterEach, beforeAll, afterAll } from 'vitest'
import { cleanup } from '@testing-library/react'
import { server } from './mocks/server'
import * as dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

// Start MSW server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

// runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
    cleanup()
    server.resetHandlers()
})

// Clean up after all tests are finished
afterAll(() => server.close())
