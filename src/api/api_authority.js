import request from '@/utils/request'

export function getSysRouterList() {
  return request({
    url: 'sys/router',
    method: 'get'
  })
}

export function getApiList(query) {
  return request({
    url: '/casbin',
    method: 'get',
    params: query
  })
}

export function addApi(data) {
  return request({
    url: '/casbin',
    method: 'post',
    data
  })
}

export function updateApi(id, data) {
  return request({
    url: `/casbin/${id}`,
    method: 'put',
    data
  })
}

export function deleteApi(id, data) {
  return request({
    url: `/casbin/${id}`,
    method: 'delete',
    data
  })
}
