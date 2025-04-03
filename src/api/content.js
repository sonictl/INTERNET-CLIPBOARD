import { request } from "@/utils/request";

// 获取服务器数据
export const query = (id) => {
  return request.post('/getClipboard', { id })
}

// 往服务器插入数据
export const insert = (obj) => {
  const { id, content, expireDays, burnAfterRead } = obj
  
  return request.post('/insertContent', {
    id,
    content,
    expireDays,
    burnAfterRead
  })
}