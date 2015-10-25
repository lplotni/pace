var rbac2 = require('rbac2');

var rules = [
    {a: 'admin', can: 'view admin page'},
    {a: 'admin', can: 'confirm payment validation'}
];

var rbac = new rbac2(rules);

module.exports = rbac;