import api from './api'

export function getLaborResources() {
  return api.get('/labor')
}

export default { getLaborResources }
