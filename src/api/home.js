import { request } from "@/utils/request"

export const create = (id, expireDays = 1, burnAfterRead = 0) => {
  return request.post('/createClipboard', { id, expireDays, burnAfterRead })
}