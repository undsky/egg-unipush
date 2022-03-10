/*
 * @Author: 姜彦汐
 * @Date: 2022-02-06 21:23:45
 * @LastEditors: 姜彦汐
 * @LastEditTime: 2022-03-10 20:48:31
 * @Description: https://docs.getui.com/getui/server/rest_v2/introduction/
 * @Site: https://www.undsky.com
 */
const crypto = require('crypto')
const {
    nanoid
} = require('nanoid');

module.exports = app => {
    app.addSingleton('unipush', init);
}

const RestApi = 'https://restapi.getui.com/v2/'

function init(config, app) {
    const {
        cache,
        appId,
        appKey,
        appSecret,
        masterSecret,
    } = config

    const BaseUrl = RestApi + appId

    async function _curl(api, data, method = 'POST') {
        let options = {
            method,
            data,
            contentType: 'json',
            dataType: 'json'
        }

        if (0 != api.indexOf('/auth')) {
            options.headers = {
                token: (await getToken()).data.token
            }
        }

        const result = await app.curl(`${BaseUrl}${api}`, options)

        if (10001 == result.data.code) {
            await app.cache[cache].del(appId)
            return await _curl(api, data, method)
        }

        return result.data
    }

    /**
     * @description: 透传消息
     * @param {*} title 标题
     * @param {*} content 内容
     * @param {*} payload 自定义数据
     * @return {*}
     */
    function _pushTransmissionMessage(title, content, payload) {
        return {
            push_message: {
                transmission: JSON.stringify({
                    title,
                    content,
                    payload
                })
            }
        }
    }

    /**
     * @description: 获取鉴权token
     * https://docs.getui.com/getui/server/rest_v2/token/#doc-title-0
     * @param {*}
     * @return {*}
     */
    function getToken() {
        return app.cache[cache].wrap(appId, async () => {
            const timestamp = new Date().getTime()
            const sign = crypto.createHash('sha256').update(`${appKey}${timestamp}${masterSecret}`).digest('hex')
            return await _curl('/auth', {
                timestamp,
                sign,
                appkey: appKey
            })
        }, {
            ttl: 86300
        })
    }

    /**
     * @description: 删除鉴权token
     * https://docs.getui.com/getui/server/rest_v2/token/#doc-title-1
     * @param {*}
     * @return {*}
     */
    async function deleteToken() {
        const token = (await getToken()).data.token
        return _curl(`/auth/${token}`, null, 'DELETE')
    }

    /**
     * @description: 【toSingle】执行cid单推
     * https://docs.getui.com/getui/server/rest_v2/push/#doc-title-1
     * @param {*} data
     * @return {*}
     */
    function pushSingleCid(data) {
        data.request_id = nanoid()
        return _curl('/push/single/cid', data)
    }

    /**
     * @description: 向指定用户推送消息
     * @param {*} cids 用户cid列表
     * @param {*} title 标题
     * @param {*} content 内容
     * @param {*} payload 自定义数据
     * @return {*}
     */
    function pushSingleCidWrap(cids, title, content, payload) {
        return pushSingleCid(Object.assign({
            audience: {
                cid: cids
            }
        }, _pushTransmissionMessage(title, content, payload)))
    }

    /**
     * @description: 【toSingle】执行别名单推
     * https://docs.getui.com/getui/server/rest_v2/push/#doc-title-2
     * @param {*} data
     * @return {*}
     */
    function pushSingleAlias(data) {
        data.request_id = nanoid()
        return _curl('/push/single/alias', data)
    }

    /**
     * @description: 【toSingle】执行cid批量单推
     * https://docs.getui.com/getui/server/rest_v2/push/#doc-title-3
     * @param {*} data
     * @return {*}
     */
    function pushSingleBatchCid(data) {
        for (let i = 0; i < data.msg_list.length; i++) {
            data.msg_list[i].request_id = nanoid()
        }
        return _curl('/push/single/batch/cid', data)
    }

    /**
     * @description: 【toSingle】执行别名批量单推
     * https://docs.getui.com/getui/server/rest_v2/push/#doc-title-4
     * @param {*} data
     * @return {*}
     */
    function pushSingleBatchAlias(data) {
        for (let i = 0; i < data.msg_list.length; i++) {
            data.msg_list[i].request_id = nanoid()
        }
        return _curl('/push/single/batch/alias', data)
    }

    /**
     * @description: 【toList】创建消息
     * https://docs.getui.com/getui/server/rest_v2/push/#doc-title-5
     * @param {*} data
     * @return {*}
     */
    function pushListMessage(data) {
        data.request_id = nanoid()
        return _curl('/push/list/message', data)
    }

    /**
     * @description: 【toList】执行cid批量推
     * https://docs.getui.com/getui/server/rest_v2/push/#doc-title-6
     * @param {*} data
     * @return {*}
     */
    function pushListCid(data) {
        return _curl('/push/list/cid', data)
    }

    /**
     * @description: 【toList】执行别名批量推
     * https://docs.getui.com/getui/server/rest_v2/push/#doc-title-7
     * @param {*} data
     * @return {*}
     */
    function pushListAlias(data) {
        return _curl('/push/list/alias', data)
    }

    /**
     * @description: 【toApp】执行群推
     * https://docs.getui.com/getui/server/rest_v2/push/#doc-title-8
     * @param {*} data
     * @return {*}
     */
    function pushAll(data) {
        data.request_id = nanoid()
        return _curl('/push/all', data)
    }

    /**
     * @description: 【toApp】根据条件筛选用户推送
     * https://docs.getui.com/getui/server/rest_v2/push/#doc-title-9
     * @param {*} data
     * @return {*}
     */
    function pushTag(data) {
        data.request_id = nanoid()
        return _curl('/push/tag', data)
    }

    /**
     * @description: 【toApp】使用标签快速推送
     * https://docs.getui.com/getui/server/rest_v2/push/#doc-title-10
     * @param {*} data
     * @return {*}
     */
    function pushFast_custom_tag(data) {
        data.request_id = nanoid()
        return _curl('/push/fast_custom_tag', data)
    }

    /**
     * @description: 【任务】停止任务
     * https://docs.getui.com/getui/server/rest_v2/push/#doc-title-11
     * @param {*} taskid
     * @return {*}
     */
    function taskDelete(taskid) {
        return _curl(`/task/${taskid}`, null, 'DELETE')
    }

    /**
     * @description: 【任务】查询定时任务
     * https://docs.getui.com/getui/server/rest_v2/push/#doc-title-12
     * @param {*} taskid
     * @return {*}
     */
    function taskSchedule(taskid) {
        return _curl(`/task/schedule/${taskid}`, null, 'GET')
    }

    /**
     * @description: 【任务】删除定时任务
     * https://docs.getui.com/getui/server/rest_v2/push/#doc-title-13
     * @param {*} taskid
     * @return {*}
     */
    function taskScheduleDelete(taskid) {
        return _curl(`/task/schedule/${taskid}`, null, 'DELETE')
    }

    /**
     * @description: 【推送】查询消息明细
     * https://docs.getui.com/getui/server/rest_v2/push/#doc-title-14
     * @param {*} cid
     * @param {*} taskid
     * @return {*}
     */
    function taskDetail(cid, taskid) {
        return _curl(`/task/detail/${cid}/${taskid}`, null, 'GET')
    }

    /**
     * @description: 【推送】获取推送结果
     * https://docs.getui.com/getui/server/rest_v2/report/#doc-title-1
     * @param {*} taskids
     * @return {*}
     */
    function reportPushTask(taskids) {
        return _curl(`/report/push/task/${Array.isArray(taskids) ? taskids.join() : taskids}`, null, 'GET')
    }

    /**
     * @description: 【推送】任务组名查报表
     * https://docs.getui.com/getui/server/rest_v2/report/#doc-title-2
     * @param {*} group_name
     * @return {*}
     */
    function reportPushTask_group(group_name) {
        return _curl(`/report/push/task_group/${group_name}`, null, 'GET')
    }

    /**
     * @description: 【推送】获取推送实时结果
     * https://docs.getui.com/getui/server/rest_v2/report/#doc-title-3
     * @param {*} taskid
     * @return {*}
     */
    function reportPushTaskDetail(taskid) {
        return _curl(`/report/push/task/${taskid}/detail`, null, 'GET')
    }

    /**
     * @description: 【推送】获取单日推送数据
     * https://docs.getui.com/getui/server/rest_v2/report/#doc-title-4
     * @param {*} date
     * @return {*}
     */
    function reportPushDate(date) {
        return _curl(`/report/push/date/${date}`, null, 'GET')
    }

    /**
     * @description: 【推送】查询推送量
     * https://docs.getui.com/getui/server/rest_v2/report/#doc-title-5
     * @param {*} 
     * @return {*}
     */
    function reportPushCount() {
        return _curl('/report/push/count', null, 'GET')
    }

    /**
     * @description: 【用户】获取单日用户数据接口
     * https://docs.getui.com/getui/server/rest_v2/report/#doc-title-6
     * @param {*} date
     * @return {*}
     */
    function reportUserDate(date) {
        return _curl(`/report/user/date/${date}`, null, 'GET')
    }

    /**
     * @description: 【用户】获取24个小时在线用户数
     * https://docs.getui.com/getui/server/rest_v2/report/#doc-title-7
     * @param {*} 
     * @return {*}
     */
    function reportOnline_user() {
        return _curl('/report/online_user', null, 'GET')
    }

    /**
     * @description: 【别名】绑定别名
     * https://docs.getui.com/getui/server/rest_v2/user/#doc-title-1
     * @param {*} data
     * @return {*}
     */
    function userAlias(data) {
        return _curl('/user/alias', data)
    }

    /**
     * @description: 【别名】根据cid查询别名
     * https://docs.getui.com/getui/server/rest_v2/user/#doc-title-2
     * @param {*} cid
     * @return {*}
     */
    function userAliasCid(cid) {
        return _curl(`/user/alias/cid/${cid}`, null, 'GET')
    }

    /**
     * @description: 【别名】根据别名查询cid
     * https://docs.getui.com/getui/server/rest_v2/user/#doc-title-3
     * @param {*} alias
     * @return {*}
     */
    function userCidAlias(alias) {
        return _curl(`/user/cid/alias/${alias}`, null, 'GET')
    }

    /**
     * @description: 【别名】批量解绑别名
     * https://docs.getui.com/getui/server/rest_v2/user/#doc-title-4
     * @param {*} data
     * @return {*}
     */
    function userAliasDelete(data) {
        return _curl('/user/alias', data, 'DELETE')
    }

    /**
     * @description: 【别名】解绑所有别名
     * https://docs.getui.com/getui/server/rest_v2/user/#doc-title-5
     * @param {*} alias
     * @return {*}
     */
    function userAliasAll(alias) {
        return _curl(`/user/alias/${alias}`, null, 'DELETE')
    }

    /**
     * @description: 【标签】一个用户绑定一批标签
     * https://docs.getui.com/getui/server/rest_v2/user/#doc-title-6
     * @param {*} cid
     * @param {*} data
     * @return {*}
     */
    function userCustom_tagCid(cid, data) {
        return _curl(`/user/custom_tag/cid/${cid}`, data)
    }

    /**
     * @description: 【标签】一批用户绑定一个标签
     * https://docs.getui.com/getui/server/rest_v2/user/#doc-title-7
     * @param {*} custom_tag
     * @param {*} data
     * @return {*}
     */
    function userCustom_tagBatch(custom_tag, data) {
        return _curl(`/user/custom_tag/batch/${custom_tag}`, data, 'PUT')
    }

    /**
     * @description: 【标签】一批用户解绑一个标签
     * https://docs.getui.com/getui/server/rest_v2/user/#doc-title-8
     * @param {*} custom_tag
     * @param {*} data
     * @return {*}
     */
    function userCustom_tagBatchDelete(data) {
        return _curl(`/user/custom_tag/batch/${custom_tag}`, data, 'DELETE')
    }

    /**
     * @description: 【标签】查询用户标签
     * https://docs.getui.com/getui/server/rest_v2/user/#doc-title-9
     * @param {*} cid
     * @return {*}
     */
    function userCustom_tagCidGet(cid) {
        return _curl(`/user/custom_tag/cid/${cid}`, null, 'GET')
    }

    /**
     * @description: 【用户】添加黑名单用户
     * https://docs.getui.com/getui/server/rest_v2/user/#doc-title-10
     * @param {*} cids
     * @return {*}
     */
    function userBlackCid(cids) {
        return _curl(`/user/black/cid/${Array.isArray(cids) ? cids.join() : cids}`)
    }

    /**
     * @description: 【用户】移除黑名单用户
     * https://docs.getui.com/getui/server/rest_v2/user/#doc-title-11
     * @param {*} cids
     * @return {*}
     */
    function userBlackCidDelete(cids) {
        return _curl(`/user/black/cid/${Array.isArray(cids) ? cids.join() : cids}`, null, 'DELETE')
    }

    /**
     * @description: 【用户】查询用户状态
     * https://docs.getui.com/getui/server/rest_v2/user/#doc-title-12
     * @param {*} cids
     * @return {*}
     */
    function userStatus(cids) {
        return _curl(`/user/status/${Array.isArray(cids) ? cids.join() : cids}`, null, 'GET')
    }

    /**
     * @description: 【用户】查询设备状态
     * https://docs.getui.com/getui/server/rest_v2/user/#doc-title-13
     * @param {*} cids
     * @return {*}
     */
    function userDeviceStatus(cids) {
        return _curl(`/user/deviceStatus/${Array.isArray(cids) ? cids.join() : cids}`, null, 'GET')
    }

    /**
     * @description: 【用户】查询用户信息
     * https://docs.getui.com/getui/server/rest_v2/user/#doc-title-14
     * @param {*} cids
     * @return {*}
     */
    function userDetail(cids) {
        return _curl(`/user/detail/${Array.isArray(cids) ? cids.join() : cids}`, null, 'GET')
    }

    /**
     * @description: 【用户】设置角标(仅支持IOS)
     * https://docs.getui.com/getui/server/rest_v2/user/#doc-title-15
     * @param {*} cids
     * @param {*} data
     * @return {*}
     */
    function userBadgeCid(cids, data) {
        return _curl(`/user/badge/cid/${Array.isArray(cids) ? cids.join() : cids}`, data)
    }

    /**
     * @description: 【用户】查询用户总量
     * https://docs.getui.com/getui/server/rest_v2/user/#doc-title-16
     * @param {*} data
     * @return {*}
     */
    function userCount(data) {
        return _curl('/user/count', data)
    }

    return {
        getToken,
        deleteToken,
        pushSingleCid,
        pushSingleCidWrap,
        pushSingleAlias,
        pushSingleBatchCid,
        pushSingleBatchAlias,
        pushListMessage,
        pushListCid,
        pushListAlias,
        pushAll,
        pushTag,
        pushFast_custom_tag,
        taskDelete,
        taskSchedule,
        taskScheduleDelete,
        taskDetail,
        reportPushTask,
        reportPushTask_group,
        reportPushTaskDetail,
        reportPushDate,
        reportPushCount,
        reportUserDate,
        reportOnline_user,
        userAlias,
        userAliasCid,
        userCidAlias,
        userAliasDelete,
        userAliasAll,
        userCustom_tagCid,
        userCustom_tagBatch,
        userCustom_tagBatchDelete,
        userCustom_tagCidGet,
        userBlackCid,
        userBlackCidDelete,
        userStatus,
        userDeviceStatus,
        userDetail,
        userBadgeCid,
        userCount
    }
}