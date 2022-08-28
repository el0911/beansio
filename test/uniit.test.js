var assert = require('assert');
var beans = require('../index')
var jest = require('jest-mock')
beans.plantBeans('')////set up beans
describe('Test all the middleware', function () {



    it('should test graphql formatter  ', function () {

        
        const { formatGraphqL } = beans
        const reqClone = {
            body: {
                query: `
            query{
                hero {
                  name
                }
              }
            `
            }
        }
        const log = formatGraphqL(reqClone)
        console.log(log)
        expect(log).toHaveProperty('url');
        expect(log).toHaveProperty('data');
        expect(log).toMatchObject({ url: 'hero', data: { body: {}, query: {}, params: {} } });
  
});



it('should test graphql formatter  ', function () {

        
    const { formatGraphqL } = beans
    const reqClone = {
        body: {
            query: `
        query{
            human(id: "1000") {
              name
              height
            }
          }
        `
        }
    }
    const log = formatGraphqL(reqClone)
    console.log(log)
    expect(log).toHaveProperty('url');
    expect(log).toHaveProperty('data');
    expect(log).toMatchObject( { url: 'human', data: { body: {}, query: { id: '1000' }, params: {} } });

});



});