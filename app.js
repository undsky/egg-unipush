/*
 * @Author: 姜彦汐
 * @Date: 2022-02-14 22:40:34
 * @LastEditors: 姜彦汐
 * @LastEditTime: 2022-02-14 22:49:24
 * @Description: 
 * @Site: https://www.undsky.com
 */
module.exports = app => {
    app.addSingleton('unipush', init);
}

const restapi = 'https://restapi.getui.com/v2/'

function init(config, app) {
    const {
        appId
    } = config

    const BaseUrl = restapi + appId
}