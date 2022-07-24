// export function plantBeans(key: string, redisURL: string): any;

// export function routeLogger(fun: Function, metDataFun: Function): any;
// export function graphQlLogger(fun: Function, metDataFun: Function): any;
// // export const maxInterval: 12;
// export function logMessage(type: string, extraData?: any): any;
// export function logError(type: string, extraData?: any): any;
// export function remixBeans(link?: string): any;

// export function beansErrorHandler(err : any, req:any,res:any,next:any): any;
// export function remixRouteLogger(fun: Function, metDataFun: Function): any;


/*~ If this module is a UMD module that exposes a global variable 'myClassLib' when
 *~ loaded outside a module loader environment, declare that global here.
 *~ Otherwise, delete this declaration.
 */
export as namespace BeansIo;

/*~ This declaration specifies that the class constructor function
 *~ is the exported object from the file
 */
export = BeansIo;

/*~ Write your module's methods and properties in this class */


/*~ If you want to expose types from your module as well, you can
 *~ place them in this block.
 *~
 *~ Note that if you decide to include this namespace, the module can be
 *~ incorrectly imported as a namespace object, unless
 *~ --esModuleInterop is turned on:
 *~   import * as x from '[~THE MODULE~]'; // WRONG! DO NOT DO THIS!
 */
declare namespace BeansIo {
    export function plantBeans(key: string, redisURL: string): any;

    export function routeLogger(fun: Function, metDataFun: Function): any;
    export function graphQlLogger(fun: Function, metDataFun: Function): any;
    // export const maxInterval: 12;
    export function logMessage(type: string, extraData?: any): any;
    export function logError(type: string, extraData?: any): any;
    export function remixBeans(link?: string): any;

    export function beansErrorHandler(err: any, req: any, res: any, next: any): any;
    export function remixRouteLogger(fun: Function, metDataFun: Function): any;
}