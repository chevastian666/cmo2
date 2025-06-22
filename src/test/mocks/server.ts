/**
 * MSW Server Configuration
 * By Cheva
 */
import { setupServer} from 'msw/node'
import { handlers} from './handlers'
export const _server = setupServer(...handlers)