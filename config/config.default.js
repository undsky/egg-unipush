/*
 * @Author: 姜彦汐
 * @Date: 2022-02-06 10:09:06
 * @LastEditors: 姜彦汐
 * @LastEditTime: 2022-03-07 16:21:48
 * @Description: 
 * @Site: https://www.undsky.com
 */
module.exports = appInfo => ({
    unipush: {
        default: {
            cache: 'fs',
            appId: '',
            appKey: '',
            appSecret: '',
            masterSecret: ''
        },
        // Single
        // client: {

        // },
        // Multi
        // clients: {
        //     unipush1: {

        //     },
        //     unipush2: {

        //     }
        // }
    }
});