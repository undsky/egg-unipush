/*
 * @Author: 姜彦汐
 * @Date: 2022-02-06 21:23:45
 * @LastEditors: 姜彦汐
 * @LastEditTime: 2022-02-24 14:45:03
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